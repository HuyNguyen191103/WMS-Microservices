import type { UserInfo } from "@/lib/auth-api";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const CURRENT_USER_KEY = "current_user";
export const LOGIN_SUCCESS_KEY = "login_success";

export function getCookie(name: string) {
  if (typeof document === "undefined") {
    return "";
  }

  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : "";
}

export function setAccessTokenCookie(accessToken: string, expired?: number) {
  const maxAge = Number.isFinite(expired) && expired ? Math.max(expired, 0) : 3600;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(
    accessToken,
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSession() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(LOGIN_SUCCESS_KEY);
}

export function saveCurrentUser(user: UserInfo | null) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function readCurrentUser() {
  const rawUser = localStorage.getItem(CURRENT_USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as UserInfo | null;
  } catch {
    return null;
  }
}

export function getUserRoles(user: UserInfo | null) {
  return (user?.roles ?? []).map((role) => role.role_name.toUpperCase());
}

export function hasAnyRole(user: UserInfo | null, allowedRoles: string[]) {
  const roles = getUserRoles(user);
  return roles.some((role) => allowedRoles.includes(role));
}
