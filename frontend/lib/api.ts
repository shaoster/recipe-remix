export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health/`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

export type RecipeListItem = { id: number; title: string; author: string };

export type RecipeSummary = { id: number; title: string };
export type RemixSummary = {
  id: number;
  title: string;
  remix_note: string;
  author: string;
};

export type RecipeDetail = {
  id: number;
  title: string;
  ingredients: string;
  steps: string;
  remix_note: string;
  author: string;
  parent: RecipeSummary | null; // null for a base recipe
  remixes: RemixSummary[]; // direct children
  is_favorited: boolean; // false for anonymous requests
  created_at: string;
};

export type FavoriteRecipe = {
  id: number;
  title: string;
  author: string;
  has_parent: boolean;
};

export type AuthResult = { token: string; username: string };

async function request(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<Response> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }

  return res;
}

export async function fetchRecipes(): Promise<RecipeListItem[]> {
  const res = await request("/recipes/");
  return res.json();
}

export async function fetchRecipe(
  id: number,
  token?: string
): Promise<RecipeDetail> {
  const res = await request(`/recipes/${id}/`, { token });
  return res.json();
}

export async function createRecipe(
  input: { title: string; ingredients: string; steps: string },
  token: string
): Promise<RecipeDetail> {
  const res = await request("/recipes/", {
    method: "POST",
    body: input,
    token,
  });
  return res.json();
}

export async function remixRecipe(
  id: number,
  input: { ingredients: string; steps: string; remix_note: string },
  token: string
): Promise<RecipeDetail> {
  const res = await request(`/recipes/${id}/remix/`, {
    method: "POST",
    body: input,
    token,
  });
  return res.json();
}

export async function registerUser(
  username: string,
  password: string
): Promise<AuthResult> {
  const res = await request("/auth/register/", {
    method: "POST",
    body: { username, password },
  });
  return res.json();
}

export async function loginUser(
  username: string,
  password: string
): Promise<AuthResult> {
  const res = await request("/auth/login/", {
    method: "POST",
    body: { username, password },
  });
  return res.json();
}

export async function favoriteRecipe(id: number, token: string): Promise<void> {
  await request(`/recipes/${id}/favorite/`, {
    method: "POST",
    token,
  });
}

export async function unfavoriteRecipe(
  id: number,
  token: string
): Promise<void> {
  await request(`/recipes/${id}/favorite/`, {
    method: "DELETE",
    token,
  });
}

export async function fetchFavorites(token: string): Promise<FavoriteRecipe[]> {
  const res = await request("/favorites/", { token });
  return res.json();
}
