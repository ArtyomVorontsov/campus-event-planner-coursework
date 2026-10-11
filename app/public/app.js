const $ = (selector) => document.querySelector(selector);
const state = { events: [], tasks: [] };

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('visible'), 3500);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function renderEvents() {
  const search = $('#search').value.trim().toLowerCase();
  const category = $('#category-filter').value;
  const sort = $('#sort').value;
  const items = state.events.filter(event => (!category || event.category === category) && `${event.title} ${event.description} ${event.venue}`.toLowerCase().includes(search));
  items.sort((a, b) => sort === 'popular' ? b.attending - a.attending : sort === 'latest' ? b.starts_at.localeCompare(a.starts_at) : a.starts_at.localeCompare(b.starts_at));
  const grid = $('#event-grid');
  grid.replaceChildren();
  for (const event of items) {
    const card = document.createElement('article');
    card.className = 'event-card';
    const top = document.createElement('div'); top.className = 'event-card-top';
    const tag = document.createElement('span'); tag.className = `tag tag-${event.category.toLowerCase()}`; tag.textContent = event.category;
    const date = document.createElement('span'); date.className = 'event-date'; date.textContent = formatDate(event.starts_at);
    top.append(tag, date);
    const title = document.createElement('h3'); title.textContent = event.title;
    const description = document.createElement('p'); description.className = 'event-description'; description.textContent = event.description || 'Join your campus community.';
    const meta = document.createElement('div'); meta.className = 'event-meta';
    const venue = document.createElement('span'); venue.textContent = `⌖ ${event.venue}`;
    const time = document.createElement('span'); time.textContent = `◷ ${new Date(event.starts_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    meta.append(venue, time);
    const foot = document.createElement('div'); foot.className = 'event-foot';
    const spots = document.createElement('span'); spots.textContent = `${event.spotsLeft} spots left`;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'rsvp-button'; button.textContent = event.spotsLeft ? 'Join event ↗' : 'Full'; button.disabled = event.spotsLeft === 0;
    button.addEventListener('click', async () => { try { const updated = await api(`/api/events/${event.id}/rsvp`, { method: 'PATCH' }); state.events = state.events.map(item => item.id === updated.id ? updated : item); renderEvents(); toast(`You joined ${event.title}!`); } catch (error) { toast(error.message); } });
    foot.append(spots, button);
    card.append(top, title, description, meta, foot);
    grid.append(card);
  }
  $('#empty-events').hidden = items.length > 0;
  $('#event-count').textContent = state.events.length;
  $('#seat-count').textContent = state.events.reduce((sum, event) => sum + event.spotsLeft, 0);
}

function renderTasks() {
  const list = $('#task-list'); list.replaceChildren();
  for (const task of state.tasks) {
    const li = document.createElement('li'); li.className = task.done ? 'done' : '';
    const label = document.createElement('label');
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = task.done; check.setAttribute('aria-label', `Mark ${task.title} done`);
    check.addEventListener('change', async () => { try { const updated = await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ done: check.checked }) }); state.tasks = state.tasks.map(item => item.id === updated.id ? updated : item); renderTasks(); } catch (error) { toast(error.message); } });
    const text = document.createElement('span'); text.textContent = task.title; label.append(check, text);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-task'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remove ${task.title}`);
    remove.addEventListener('click', async () => { try { await api(`/api/tasks/${task.id}`, { method: 'DELETE' }); state.tasks = state.tasks.filter(item => item.id !== task.id); renderTasks(); toast('Task removed'); } catch (error) { toast(error.message); } });
    li.append(label, remove); list.append(li);
  }
  $('#empty-tasks').hidden = state.tasks.length > 0;
  $('#task-progress').textContent = `${state.tasks.filter(task => task.done).length} of ${state.tasks.length} done`;
  $('#task-count').textContent = state.tasks.filter(task => !task.done).length;
}

async function initialize() {
  try { [state.events, state.tasks] = await Promise.all([api('/api/events'), api('/api/tasks')]); renderEvents(); renderTasks(); } catch (error) { toast(error.message); }
}

['#search', '#category-filter', '#sort'].forEach(selector => $(selector).addEventListener('input', renderEvents));
$('#open-event-form').addEventListener('click', () => $('#event-dialog').showModal());
$('#close-event-form').addEventListener('click', () => $('#event-dialog').close());
$('#event-dialog').addEventListener('click', event => { if (event.target === $('#event-dialog')) $('#event-dialog').close(); });
$('#event-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  try { const created = await api('/api/events', { method: 'POST', body: JSON.stringify(values) }); state.events.push(created); renderEvents(); form.reset(); $('#form-error').hidden = true; $('#event-dialog').close(); toast('Event published!'); } catch (error) { $('#form-error').textContent = error.message; $('#form-error').hidden = false; }
});
$('#task-form').addEventListener('submit', async event => {
  event.preventDefault();
  const input = $('#task-input');
  try { const created = await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title: input.value }) }); state.tasks.unshift(created); input.value = ''; renderTasks(); toast('Task added'); } catch (error) { toast(error.message); }
});
$('#theme-toggle').addEventListener('click', () => { const dark = document.body.classList.toggle('dark'); localStorage.setItem('campus-plan-dark', String(dark)); $('#theme-toggle').textContent = dark ? '☀' : '☾'; });
if (localStorage.getItem('campus-plan-dark') === 'true') { document.body.classList.add('dark'); $('#theme-toggle').textContent = '☀'; }
initialize();
