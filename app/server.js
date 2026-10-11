const express = require('express');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'events.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    venue TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity > 0),
    attending INTEGER NOT NULL DEFAULT 0 CHECK (attending >= 0)
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  );
`);

const seedCount = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
if (seedCount === 0 && process.env.SEED_SAMPLE_DATA !== '0') {
  const insert = db.prepare('INSERT INTO events (title, description, category, venue, starts_at, capacity, attending) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const days = (offset, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  insert.run('Design Jam', 'Sketch useful ideas for a better campus experience.', 'Workshop', 'Innovation Hub', days(5, 16), 24, 8);
  insert.run('Board Game Evening', 'Meet classmates over casual games and snacks.', 'Social', 'Student Lounge', days(9, 18), 40, 17);
  insert.run('Open Source Meetup', 'Share small projects and find collaborators.', 'Tech', 'Room B204', days(14, 17), 35, 11);
}

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function eventFromRow(row) {
  return { ...row, spotsLeft: row.capacity - row.attending };
}

function validateEvent(body) {
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const category = String(body.category || '').trim();
  const venue = String(body.venue || '').trim();
  const startsAt = String(body.startsAt || '').trim();
  const capacity = Number(body.capacity);
  if (!title || title.length > 100 || description.length > 600 || !['Workshop', 'Social', 'Tech', 'Sports', 'Other'].includes(category) || !venue || venue.length > 100 || !Number.isFinite(Date.parse(startsAt)) || !Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
    return null;
  }
  return { title, description, category, venue, startsAt: new Date(startsAt).toISOString(), capacity };
}

app.get('/api/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY starts_at ASC').all().map(eventFromRow);
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const event = validateEvent(req.body || {});
  if (!event) return res.status(400).json({ error: 'Please enter valid event details.' });
  const result = db.prepare('INSERT INTO events (title, description, category, venue, starts_at, capacity) VALUES (?, ?, ?, ?, ?, ?)').run(event.title, event.description, event.category, event.venue, event.startsAt, event.capacity);
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(eventFromRow(row));
});

app.patch('/api/events/:id/rsvp', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Event not found.' });
  if (row.attending >= row.capacity) return res.status(409).json({ error: 'This event is full.' });
  db.prepare('UPDATE events SET attending = attending + 1 WHERE id = ?').run(id);
  res.json(eventFromRow(db.prepare('SELECT * FROM events WHERE id = ?').get(id)));
});

app.delete('/api/events/:id', (req, res) => {
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Event not found.' });
  res.status(204).end();
});

app.get('/api/tasks', (req, res) => {
  res.json(db.prepare('SELECT * FROM tasks ORDER BY id DESC').all().map(t => ({ ...t, done: Boolean(t.done) })));
});

app.post('/api/tasks', (req, res) => {
  const title = String(req.body?.title || '').trim();
  if (!title || title.length > 120) return res.status(400).json({ error: 'Task must be 1 to 120 characters.' });
  const result = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title);
  res.status(201).json({ id: Number(result.lastInsertRowid), title, done: false });
});

app.patch('/api/tasks/:id', (req, res) => {
  if (typeof req.body?.done !== 'boolean') return res.status(400).json({ error: 'done must be a boolean.' });
  const result = db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(req.body.done ? 1 : 0, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Task not found.' });
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(req.params.id));
  res.json({ ...task, done: Boolean(task.done) });
});

app.delete('/api/tasks/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Task not found.' });
  res.status(204).end();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('*path', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Campus Event Planner listening on http://localhost:${port}`));
}

module.exports = app;
