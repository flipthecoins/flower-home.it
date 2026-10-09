import test from 'node:test';
import assert from 'node:assert/strict';
import delivery from '../delivery/src/worker.js';

test('public media decodes a large upload without per-byte callback overhead', async () => {
  const expected=Buffer.alloc(3*1024*1024);
  for(let i=0;i<expected.length;i++)expected[i]=i%256;
  const encoded=expected.toString('base64');
  const env={SESSIONS:{async get(key){assert.equal(key,'media:file:large.png');return encoded;}}};
  const request=new Request('https://example.com/media/large.png');
  const start=process.cpuUsage();
  const response=await delivery.fetch(request,env);
  const cpu=process.cpuUsage(start);
  const cpuMs=(cpu.user+cpu.system)/1000;
  assert.equal(response.status,200);
  assert.equal(response.headers.get('content-type'),'image/png');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),expected);
  // Generous host-side guard: the former callback conversion consumes hundreds
  // of milliseconds and trips production Worker limits. This is not a latency SLA.
  assert.ok(cpuMs<100,`Large media decode consumed ${cpuMs.toFixed(1)}ms CPU`);
});
