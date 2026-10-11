const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'campus-plan-test-'));
process.env.DB_PATH = path.join(temp, 'test.sqlite');
process.env.SEED_SAMPLE_DATA = '0';
const app = require('../server');
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

test.after(() => { server.close(); fs.rmSync(temp, { recursive: true, force: true }); });

async function request(url, method = 'GET', body) {
  const res = await fetch(`${base}${url}`, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: res.status === 204 ? null : await res.json() };
}

test('event lifecycle and capacity enforcement', async () => {
  const invalid = await request('/api/events', 'POST', { title: '' });
  assert.equal(invalid.status, 400);
  const created = await request('/api/events', 'POST', { title: 'Campus demo', category: 'Tech', venue: 'Lab 1', startsAt: '2026-11-01T15:00:00Z', capacity: 1, description: 'A demo' });
  assert.equal(created.status, 201);
  assert.equal(created.data.spotsLeft, 1);
  const joined = await request(`/api/events/${created.data.id}/rsvp`, 'PATCH');
  assert.equal(joined.data.spotsLeft, 0);
  assert.equal((await request(`/api/events/${created.data.id}/rsvp`, 'PATCH')).status, 409);
  assert.equal((await request('/api/events')).data.length, 1);
  assert.equal((await request(`/api/events/${created.data.id}`, 'DELETE')).status, 204);
});

test('checklist lifecycle', async () => {
  const created = await request('/api/tasks', 'POST', { title: 'Invite classmates' });
  assert.equal(created.status, 201);
  assert.equal(created.data.done, false);
  const updated = await request(`/api/tasks/${created.data.id}`, 'PATCH', { done: true });
  assert.equal(updated.data.done, true);
  assert.equal((await request('/api/tasks')).data.length, 1);
  assert.equal((await request(`/api/tasks/${created.data.id}`, 'DELETE')).status, 204);
  assert.equal((await request('/api/tasks')).data.length, 0);
});
