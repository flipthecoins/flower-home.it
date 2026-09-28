const account = '485282ffb1d94304113b9aed82ccaa16';
const base = `https://api.cloudflare.com/client/v4/accounts/${account}`;
let credential;
for (const name of ['CLOUDFLARE_API_TOKEN', 'CF_TOKEN_FLIPTHECOINS']) {
  if (!process.env[name]) continue;
  const res = await fetch(`${base}/workers/scripts/admin/settings`, {
    headers: { Authorization: `Bearer ${process.env[name]}` },
  });
  console.log('Credential', name, 'HTTP', res.status);
  if (res.ok) {
    credential = name;
    const { result } = await res.json();
    console.log('Admin binding types', JSON.stringify(result.bindings.map(({ name, type, namespace_id }) => ({ name, type, namespace_id }))));
    break;
  }
}
if (!credential) throw new Error('No available credential can read the admin Worker.');
for (const path of ['/workers/scripts', '/workers/domains', '/pages/projects']) {
  const res = await fetch(base + path, { headers: { Authorization: `Bearer ${process.env[credential]}` } });
  console.log('Inventory', path, 'HTTP', res.status);
  if (!res.ok) continue;
  const { result } = await res.json();
  console.log(JSON.stringify(result.map(({ id, name, hostname, service, subdomain, domains }) => ({ id, name, hostname, service, subdomain, domains }))));
}
