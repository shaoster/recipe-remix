const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USERNAME_KEY);
}

export function setAuth(token: string, username: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USERNAME_KEY, username);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
}
