# Implementation Plan

Build order: model → auth → backend API (recipes + favorites) → frontend
screens, so each layer can be smoke-tested before the next depends on it.

## 1. Data model (`backend/recipes/models.py`)

- Use Django's built-in `django.contrib.auth.models.User` — no custom user
  model needed for a 1-hour build.
- `Recipe` model:
  - `title` — `CharField`
  - `ingredients` — `TextField` (newline-separated)
  - `steps` — `TextField` (newline-separated)
  - `remix_note` — `TextField(blank=True)`
  - `parent` — `ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="remixes")`
  - `author` — `ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")`
  - `created_at` — `DateTimeField(auto_now_add=True)`
- No `updated_at`, no edit/update path at all — recipes are write-once.
  Don't add a `PUT`/`PATCH` view or serializer for `Recipe`; "editing" is
  always a new row via the remix endpoint (see §2/§3).
- `Favorite` model:
  - `user` — `ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")`
  - `recipe` — `ForeignKey(Recipe, on_delete=models.CASCADE, related_name="favorited_by")`
  - `created_at` — `DateTimeField(auto_now_add=True)`
  - `Meta.unique_together = ("user", "recipe")` — favoriting is idempotent,
    not a repeatable action. No `parent`-based restriction here: `recipe`
    can point at a base recipe or a remix at any depth.
- `makemigrations` + `migrate`.
- Register `Recipe` and `Favorite` in `admin.py` (optional, but handy for
  manual poking during dev).

## 2. Auth (`backend/recipes/` or a small new `accounts` app)

- Enable `rest_framework.authtoken` in `INSTALLED_APPS`, migrate (adds the
  `Token` table). Token auth is simpler than session/CSRF across the
  Next.js (3000) ↔ Django (8000) origin split for a 1-hour build.
- `POST /api/auth/register/` — accepts `username`/`password`, creates a
  `User` (use `set_password`, don't store plaintext), creates its
  `Token`, returns `{ token, username }`.
- `POST /api/auth/login/` — DRF's built-in `ObtainAuthToken` view works
  as-is, or a thin wrapper that also returns `username` alongside `token`.
- Add `DEFAULT_AUTHENTICATION_CLASSES: TokenAuthentication` in DRF
  settings; leave `DEFAULT_PERMISSION_CLASSES` as `AllowAny` and apply
  `IsAuthenticated` per-view (recipe reads stay public).
- Wire `/api/auth/register/` and `/api/auth/login/` into `urls.py`.

**Smoke test**: register a user via `curl`, log in, confirm a token comes
back, and confirm hitting a protected endpoint without `Authorization:
Token <token>` returns 401.

## 3. Backend API (`backend/recipes/`)

Add `serializers.py`:
- `RecipeListSerializer` — `id`, `title`, `author` (username, read-only)
  (for the base-recipe list).
- `RecipeDetailSerializer` — full fields, `author` (username), plus nested
  read-only `parent` (`id`, `title`) and `remixes` (`id`, `title`,
  `remix_note`, `author`), plus `is_favorited` (bool — whether
  `request.user` has favorited this recipe; `False`/omitted for anonymous
  requests) so the detail view needs no extra round trips.
- `RecipeCreateSerializer` (write) — accepts `title`, `ingredients`,
  `steps` only (for base-recipe creation; no `parent`/`remix_note`/
  `author` input — `author` comes from `request.user` in the view).
- `RecipeRemixSerializer` (write) — accepts `ingredients`, `steps`,
  `remix_note` only (no `title`/`author` input — see remix view below).
- `FavoriteRecipeSerializer` — `id`, `title`, `author`, and `has_parent`
  (bool, derived from `parent_id is not None`) for the `/api/favorites/`
  list — deliberately not the same shape as `RecipeListSerializer`, since
  favorites need to indicate remix-vs-base where the base list doesn't.

Add views in `views.py` (function-based `@api_view`, matching the existing
`health` style, or class-based — either is fine):
- `GET /api/recipes/` — `Recipe.objects.filter(parent__isnull=True)`,
  serialized with `RecipeListSerializer`. `AllowAny`.
- `POST /api/recipes/` — `IsAuthenticated`. Create a base recipe
  (`parent=None`, `author=request.user`) from `title`/`ingredients`/
  `steps`, via `RecipeCreateSerializer`.
- `GET /api/recipes/<id>/` — `RecipeDetailSerializer`, 404 if missing.
  `AllowAny`.
- `POST /api/recipes/<id>/remix/` — `IsAuthenticated`. Look up the recipe
  being forked by `<id>` (404 if missing — note this recipe can itself
  already be a remix; forking from a remix works exactly the same as
  forking from a base recipe), create a new `Recipe` with `parent=<id>`,
  `author=request.user`, **`title` copied from the recipe being forked**
  (the remix form doesn't collect a title — `title` is a required field
  on the model, so it must be set explicitly here or the new row saves
  with an empty title), and the posted `ingredients`/`steps`/
  `remix_note`. Return the new recipe (so the frontend can redirect to
  its detail page).
- `POST /api/recipes/<id>/favorite/` — `IsAuthenticated`. `get_or_create`
  a `Favorite(user=request.user, recipe_id=<id>)` — 404 if the recipe
  doesn't exist, but works identically whether `<id>` is a base recipe or
  a remix at any depth. Idempotent: favoriting an already-favorited
  recipe just returns 200/204, not a 400/409.
- `DELETE /api/recipes/<id>/favorite/` — `IsAuthenticated`. Delete the
  matching `Favorite` if it exists; idempotent (204 either way rather
  than 404 on "already not favorited").
- `GET /api/favorites/` — `IsAuthenticated`. `Recipe.objects.filter(favorited_by__user=request.user).order_by("-favorited_by__created_at")`,
  serialized with `FavoriteRecipeSerializer`. Deliberately *not* filtered
  by `parent__isnull` — this is the one recipe-listing endpoint that
  spans the whole tree, not just base recipes.

Wire the recipe and favorite endpoints into `urls.py` per the
commented-out example paths already there (auth endpoints wired in §2).

**Smoke test** before moving to frontend: `runserver` and hit each
endpoint with `curl` — create a base recipe (with token), remix it (with
token, using the *remix's own id* to fork a second time — confirming
forking-from-a-fork works), favorite the remix (confirming favoriting a
non-base recipe works and it shows up in `/api/favorites/`), unfavorite
it, list, detail (check `is_favorited` flips correctly), and confirm all
`POST`/`DELETE` endpoints 401 without a token.

## 4. Frontend screens (`frontend/app/`)

Add typed helpers to `lib/api.ts` (`Recipe`, `RecipeDetail` types with
`author: string` and `is_favorited: boolean`; a `FavoriteRecipe` type with
`has_parent: boolean`; `fetchRecipes`, `fetchRecipe`, `createRecipe`,
`remixRecipe`, `registerUser`, `loginUser`, `favoriteRecipe`,
`unfavoriteRecipe`, `fetchFavorites`) built on `API_BASE_URL`, alongside
the existing `checkBackendHealth`.

Add a small client-side auth helper (e.g. `lib/auth.ts`) that stores the
token (and username) in `localStorage` and exposes `getToken`/`setToken`/
`clearToken` — server components can't read `localStorage`, so recipe
list/detail reads stay unauthenticated server-side fetches (fine, since
`GET` is public) while the create/remix/login/register forms — already
client components — attach the token themselves.

- **`app/page.tsx`** (Screen 1 — list, server component): fetch and render
  base recipes as links to `/recipes/[id]`, each showing its author; a
  create form/button for a new base recipe (client component, e.g.
  `app/_components/CreateRecipeForm.tsx`) that POSTs to `/api/recipes/`
  with the stored token and routes to the new recipe's detail page. If
  logged out, show a prompt to log in instead of the form.
- **`app/recipes/[id]/page.tsx`** (Screen 2 — detail, server component):
  render title/ingredients/steps/author; link up to `parent` if present;
  list `remixes` (children) each with its `remix_note` and author; a
  "Remix this recipe" link to `/recipes/[id]/remix`. Render this link
  identically whether the recipe is a base recipe or itself a remix —
  no conditional logic, since forking-from-anywhere is the point. Also
  render a favorite toggle (client component, e.g.
  `app/_components/FavoriteButton.tsx`) seeded from `is_favorited`, that
  POSTs/DELETEs `/api/recipes/<id>/favorite/` with the stored token — same
  component, same placement, regardless of whether the recipe has a
  parent.
- **`app/recipes/[id]/remix/page.tsx`** (Screen 3 — remix editor): fetch
  the recipe being forked server-side to pre-fill a client-component form
  (ingredients/steps editable, plus a "what changed" `remix_note` field);
  on submit POST to `/api/recipes/<id>/remix/` with the stored token and
  redirect to the new recipe's detail page. If logged out, prompt to log
  in instead of showing the form.
- **`app/login/page.tsx`** / **`app/register/page.tsx`** (Screen 4 — auth,
  client components): minimal username/password forms that call
  `loginUser`/`registerUser`, store the returned token, and redirect back
  to `/`.
- **`app/favorites/page.tsx`** (Screen 5 — favorites): fetch
  `/api/favorites/` with the stored token (client component, since it
  needs the token — or a server component reading a cookie, if session
  auth was chosen over token auth in §2) and render each favorited recipe
  as a link to `/recipes/[id]`, noting when `has_parent` is true (e.g. a
  small "remix" badge) since this list mixes base recipes and remixes.
- Minimal auth-aware bit of UI in `app/layout.tsx` (e.g. "Log in" link vs.
  "Logged in as `<username>` · Favorites · Log out") so it's obvious
  whether create/remix/favorite actions are available.

Keep styling minimal/Tailwind-utility, consistent with the existing
scaffold pages — no design system work needed.

## 5. Out of scope (per README)

No image uploads, no search/filter/pagination, no external services, no
password reset/email verification/OAuth, no recipe deletion or editing
(immutability is load-bearing — don't add a `PUT`/`PATCH` recipe
endpoint even as a convenience).

## 6. Stretch goals (only if time remains, in priority order)

1. Full multi-level lineage tree on the detail screen (not just
   parent + direct children).
2. Let an author hide/soft-delete their own recipe from listings (an
   `is_hidden` flag, say) without touching the row otherwise — any
   remixes built on it keep working since the underlying data never
   changes.
3. Diff/highlight what changed between a recipe and its parent.
