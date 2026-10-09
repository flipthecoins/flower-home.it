"""One-off read-only audit. Never export credentials, bindings or full visitor IPs."""
import concurrent.futures
import datetime
import hashlib
import ipaddress
import json
import os
import urllib.error
import urllib.request

ACCOUNT = '485282ffb1d94304113b9aed82ccaa16'
NOW = datetime.datetime.now(datetime.timezone.utc)
TODAY = NOW.strftime('%Y-%m-%d')
START = (NOW - datetime.timedelta(days=6)).strftime('%Y-%m-%d')
SALT = os.urandom(32)
TEST_IPS = {'51.210.40.85', '51.222.24.41', '194.164.167.233', '15.235.81.40'}


def request(path, data=None):
    req = urllib.request.Request(
        'https://api.cloudflare.com/client/v4' + path,
        data=None if data is None else json.dumps(data).encode(),
        headers={'Authorization': 'Bearer ' + os.environ['CLOUDFLARE_API_TOKEN'],
                 'Content-Type': 'application/json', 'User-Agent': 'Codex-Traffic-Audit'},
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        return {'http_status': error.code, 'response': json.loads(error.read())}


def anonymize(value):
    if isinstance(value, dict):
        output = {}
        for key, item in value.items():
            if key == 'clientIP':
                output['visitor_group'] = hashlib.sha256(SALT + item.encode()).hexdigest()[:16]
                output['known_test_server'] = item in TEST_IPS
                try:
                    address = ipaddress.ip_address(item)
                    output['network'] = str(ipaddress.ip_network(f'{item}/{24 if address.version == 4 else 48}', strict=False))
                except ValueError:
                    output['network'] = 'unavailable'
            else:
                output[key] = anonymize(item)
        return output
    if isinstance(value, list):
        return [anonymize(item) for item in value]
    return value


def query(zone_id, selection):
    q = 'query { viewer { zones(filter: {zoneTag: ' + json.dumps(zone_id) + '}) { zoneTag ' + selection + ' } } }'
    return anonymize(request('/graphql', {'query': q}))


def inspect_zone(zone):
    daily = f'''httpRequests1dGroups(limit:7, filter:{{date_geq:"{START}",date_leq:"{TODAY}"}}, orderBy:[date_ASC]) {{
      dimensions {{ date }} sum {{ requests pageViews }} uniq {{ uniques }} }}'''
    details = f'''httpRequestsAdaptiveGroups(limit:2000, filter:{{datetime_geq:"{TODAY}T00:00:00Z",datetime_lt:"{NOW.strftime('%Y-%m-%dT%H:%M:%SZ')}",requestSource:"eyeball"}}, orderBy:[count_DESC]) {{
      count sum {{ visits }} dimensions {{ clientIP clientAsn clientCountryName userAgent clientRequestHTTPHost clientRequestPath edgeResponseStatus }} }}'''
    result = {'zone': zone, 'daily': query(zone['id'], daily)}
    if result['daily'].get('data'):
        result['today_details'] = query(zone['id'], details)
    print('Checked', zone['name'], 'analytics available:', bool(result['daily'].get('data')), flush=True)
    return result


zones_response = request('/zones?account.id=' + ACCOUNT + '&per_page=50')
zones = [{'id': z['id'], 'name': z['name'], 'account': z['account']}
         for z in zones_response.get('result', [])
         if z['name'].endswith('.it') and z['status'] == 'active']
if not any(z['name'] == 'flower-home.it' for z in zones):
    zones.append({'id': 'f68113c91cc8022b5f23a48eaccf8f5b', 'name': 'flower-home.it'})
zones.append({'id': '1609886c9942987ccc960f4365c265c9', 'name': 'vivilacedonia.it'})
result = {'observed_at': NOW.isoformat(), 'period_start': START, 'zones': [], 'worker_logging': {}}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    result['zones'] = list(pool.map(inspect_zone, zones))
for worker in ['admin', 'reframe-toplists', 'flower-home-it-router']:
    response = request(f'/accounts/{ACCOUNT}/workers/scripts/{worker}/settings')
    settings = response.get('result') or {}
    result['worker_logging'][worker] = {
        'success': response.get('success'), 'http_status': response.get('http_status'),
        'observability': settings.get('observability'), 'logpush': settings.get('logpush'),
        'tail_consumers': settings.get('tail_consumers'),
    }
with open('audit-result.json', 'w') as output:
    json.dump(result, output, ensure_ascii=False, indent=2)
print('Audit finished; production configuration was only read.', flush=True)
