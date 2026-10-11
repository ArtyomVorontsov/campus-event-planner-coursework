# Campus Event Planner

A one page campus event application for Web Programming coursework. Students can browse and search events, reserve a place, and keep a task checklist.

## Requirements

- Node.js 24 or later
- pnpm 11 or later, or npm 12 or later

## Run locally

```sh
pnpm install
node scripts/build-css.cjs
node server.js
```

Open <http://localhost:3000>. The application creates `data/events.sqlite` on first run and inserts three sample events. Set `PORT` to use another port.

## Test

```sh
node --test
```

The tests use a temporary SQLite database and do not change the local application data.

## API

| Route | Method | Action |
| --- | --- | --- |
| `/api/events` | GET | List events |
| `/api/events` | POST | Add event |
| `/api/events/:id/rsvp` | PATCH | Reserve one place |
| `/api/events/:id` | DELETE | Remove event |
| `/api/tasks` | GET, POST | List or add tasks |
| `/api/tasks/:id` | PATCH, DELETE | Set completion or remove task |

The current version is a local coursework prototype without user accounts. The checklist and RSVP counts are shared by everyone connected to the same database.

## Stylesheet build

Sass compiles the SCSS source; PostCSS with Autoprefixer adds browser prefixes for the Browserslist targets. Run `node scripts/build-css.cjs` after changing styles.
