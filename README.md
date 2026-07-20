# Recipe Remix Tree

A scaffolded Django + Next.js app, ready for a ~1 hour vibe-coding session.
Everything below the "Setup" section is the app brief — hand it to your
coding assistant (or yourself) and go.

## The idea

A recipe box where every recipe can be **forked**. Start from a base recipe,
tweak the ingredients or steps, and save it as a "remix" that stays linked to
its parent. Over time each base recipe grows a visible **lineage tree** of
variations — swap this ingredient, halve the sugar, make it vegan — so you
can see how a dish evolved and jump back to any ancestor version.

This is intentionally a notch past basic CRUD: recipes form a self-referential
tree (parent → children), and the interesting product surface is *navigating
and creating along that tree*, not just listing/editing flat rows.

## The flow (3 screens)

1. **Recipe list** (`/`) — Browse all *base* recipes (recipes with no
   parent). A form or button to create a brand-new base recipe from scratch
   (title, ingredients, steps).
2. **Recipe detail** (`/recipes/[id]`) — Show the recipe's title,
   ingredients, and steps. Show its lineage: a link up to its parent (if
   any) and a list of its direct remixes (children), each with its remix
   note. A "Remix this recipe" button/link.
3. **Remix editor** (`/recipes/[id]/remix`) — A form pre-filled with the
   parent recipe's ingredients/steps. The user edits them and writes a short
   "what changed" note, then saves. This creates a **new** recipe whose
   `parent` is the recipe being remixed, and redirects to the new recipe's
   detail screen.

## Requirements

**Data model** (`backend/recipes/models.py` — currently just a stub):
- `Recipe`: `title`, `ingredients` (text — one per line is fine),
  `steps` (text), `remix_note` (text, blank allowed — empty for base
  recipes), `parent` (self-referential FK, nullable,
  `related_name="remixes"`), `created_at`.

**Backend** (Django + Django REST Framework, already wired up in
`backend/recipes/`):
- `GET /api/recipes/` — list base recipes (`parent` is null).
- `POST /api/recipes/` — create a base recipe.
- `GET /api/recipes/<id>/` — retrieve one recipe, including its parent
  (id + title) and its direct children (id, title, remix_note) so the
  frontend can render the lineage without extra round trips.
- `POST /api/recipes/<id>/remix/` — create a new recipe with `parent=<id>`,
  the body's `ingredients`/`steps`/`remix_note`.
- A working `/api/health/` endpoint already exists — use it as a template
  for response shape/style.

**Frontend** (Next.js App Router + TypeScript + Tailwind, already wired up
in `frontend/app/`):
- Fill in the three placeholder pages (`app/page.tsx`,
  `app/recipes/[id]/page.tsx`, `app/recipes/[id]/remix/page.tsx`) with real
  data fetched from the Django API via `lib/api.ts`'s `API_BASE_URL`.
- Simple, clean styling is enough — this isn't a design exercise.
- Client-side form handling (`"use client"`) is fine for the create/remix
  forms; the list/detail reads can stay server components.

**Explicitly out of scope** (keep this a 1-hour build):
- No auth/users — it's a single local recipe box.
- No image uploads.
- No search/filtering/pagination — a flat list of base recipes is fine.
- No external APIs or services — SQLite + local Django + local Next.js only.

**Stretch goals** (only if time remains):
- Render the full lineage tree (not just one level) on the detail screen.
- Delete a recipe (cascade or block if it has remixes — your call).
- Diff/highlight what changed between a recipe and its parent.

## Setup

### Backend (Django)

```bash
cd backend
source venv/bin/activate   # venv is already created; if missing: python3 -m venv venv
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

API root: `http://localhost:8000/api/` — try `http://localhost:8000/api/health/`.

### Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local   # sets NEXT_PUBLIC_API_BASE_URL
npm install                        # if node_modules isn't already present
npm run dev
```

App: `http://localhost:3000` — the home page shows a live backend
connectivity check.

### Run both

Two terminals, one for each `runserver`/`npm run dev` command above. No
Docker, no external services, no accounts required.

## Project layout

```
backend/
  config/           Django project (settings, urls)
  recipes/          The app you'll build out (models/views/urls stubs + health check)
  requirements.txt
frontend/
  app/              Next.js App Router pages (3 placeholder screens)
  lib/api.ts         API base URL + health check helper
```
