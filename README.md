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

## The flow (3 core screens, plus auth and favorites)

1. **Recipe list** (`/`) — Browse all *base* recipes (recipes with no
   parent). A form or button to create a brand-new base recipe from scratch
   (title, ingredients, steps). Requires being logged in to create; browsing
   is fine while logged out.
2. **Recipe detail** (`/recipes/[id]`) — Show the recipe's title,
   ingredients, steps, and author. Show its lineage: a link up to its parent
   (if any) and a list of its direct remixes (children), each with its remix
   note and author. A "Remix this recipe" button/link — present on *every*
   recipe, including remixes of remixes, since forking from any node in the
   tree is always allowed.
3. **Remix editor** (`/recipes/[id]/remix`) — A form pre-filled with the
   recipe being forked's ingredients/steps. The user edits them and writes a
   short "what changed" note, then saves. This creates a **new** recipe
   whose `parent` is the recipe being remixed, `author` is the logged-in
   user, and redirects to the new recipe's detail screen. Requires being
   logged in.
4. **Login / Register** — Minimal forms for username/password registration
   and login. Since recipes are immutable (see below), there is no separate
   "edit recipe" screen — even a recipe's own author "edits" it by forking
   from it via the remix editor, so this flow doubles as the edit workflow.
5. **Favorites** (`/favorites`) — The logged-in user's favorited recipes.
   A recipe of any depth can be favorited — a base recipe, a remix, or a
   remix of a remix — so this list is not filtered down to base recipes
   the way the home screen is.

## Requirements

**Data model** (`backend/recipes/models.py` — currently just a stub):
- `Recipe`: `title`, `ingredients` (text — one per line is fine),
  `steps` (text), `remix_note` (text, blank allowed — empty for base
  recipes), `parent` (self-referential FK, nullable,
  `related_name="remixes"`), `author` (FK to the user, nullable=False),
  `created_at`.
- `Favorite`: `user` (FK), `recipe` (FK, `related_name="favorited_by"`),
  `created_at`. Unique on `(user, recipe)` — favoriting the same recipe
  twice is a no-op, not a duplicate row.

**Authentication & authorship**:
- Username/password registration and login (Django's built-in `User` model
  and auth is fine — no need for email verification, OAuth, or anything
  fancier). Session or token auth, whichever is simpler to wire up with the
  Next.js frontend.
- Every `Recipe` tracks the user who created it (`author`). The detail view
  and lineage listings should surface the author's username.
- Creating a base recipe or remixing both require being logged in; browsing
  recipes does not.

**Immutability & forking**:
- Once saved, a `Recipe` row is never updated in place — there is no
  "edit" endpoint or form. This is true for every recipe, not just base
  recipes: a remix is just as immutable as the base it came from.
- Because of this, "editing" is always modeled as forking: anyone
  (including the original author) who wants to change a recipe — base or
  remix — creates a new remix via the same remix editor. The UI should
  make this transparent by exposing the same "Remix this recipe" action on
  every recipe detail page, regardless of whether it's a base recipe or
  already a remix several levels deep, so re-forking from any point in the
  tree never feels like a separate/limited workflow.

**Favorites**:
- A user can favorite any recipe, regardless of whether it's a base recipe
  or a remix several levels deep — favoriting is not tied to a recipe's
  position in the tree.
- Favoriting/unfavoriting requires being logged in; a recipe can be
  favorited by any number of different users.

**Backend** (Django + Django REST Framework, already wired up in
`backend/recipes/`):
- `POST /api/auth/register/` — create a user from
  `username`/`password`.
- `POST /api/auth/login/` — authenticate and return/establish a session or
  token.
- `GET /api/recipes/` — list base recipes (`parent` is null).
- `POST /api/recipes/` — create a base recipe (author required, from the
  authenticated request).
- `GET /api/recipes/<id>/` — retrieve one recipe, including its parent
  (id + title), its direct children (id, title, remix_note, author), its
  own author, and whether the current user has favorited it, so the
  frontend can render the lineage without extra round trips.
- `POST /api/recipes/<id>/remix/` — create a new recipe with `parent=<id>`,
  `author` set from the authenticated request, and the body's
  `ingredients`/`steps`/`remix_note`.
- `POST /api/recipes/<id>/favorite/` — favorite the recipe (any recipe,
  base or remix) as the authenticated user.
- `DELETE /api/recipes/<id>/favorite/` — unfavorite it.
- `GET /api/favorites/` — list the authenticated user's favorited recipes
  (id, title, author, and whether it has a parent — since the list can
  include remixes, it's worth showing that context), most-recently-
  favorited first.
- A working `/api/health/` endpoint already exists — use it as a template
  for response shape/style.

**Frontend** (Next.js App Router + TypeScript + Tailwind, already wired up
in `frontend/app/`):
- Fill in the three placeholder pages (`app/page.tsx`,
  `app/recipes/[id]/page.tsx`, `app/recipes/[id]/remix/page.tsx`) with real
  data fetched from the Django API via `lib/api.ts`'s `API_BASE_URL`, plus
  login/register pages and a favorites page.
- Simple, clean styling is enough — this isn't a design exercise.
- Client-side form handling (`"use client"`) is fine for the create/remix/
  login/register/favorite actions; the list/detail reads can stay server
  components.
- The "Remix this recipe" action should be rendered the same way on every
  recipe detail page — no special-casing base recipes vs. remixes — since
  forking is how both "remix" and "edit" are expressed.
- Likewise, the favorite toggle should appear on every recipe detail page
  (and in the `/favorites` list) with no special-casing based on whether
  the recipe has a parent.

**Explicitly out of scope** (keep this a 1-hour build):
- No image uploads.
- No search/filtering/pagination — a flat list of base recipes is fine.
- No external APIs or services — SQLite + local Django + local Next.js only.
- No password reset, email verification, or OAuth — plain username/password
  is enough.
- No recipe deletion (ties in with immutability — see stretch goals below
  if you want to explore soft-deletes/hiding).

**Stretch goals** (only if time remains):
- Render the full lineage tree (not just one level) on the detail screen.
- Let an author hide/soft-delete their own recipe from listings (it stays
  in the database, immutably, so any remixes built on it are unaffected).
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
