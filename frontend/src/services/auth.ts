import { api, API_BASE } from "./api";

export type User = { id: string; name: string; email: string; image?: string };
export type AuthResponse = { user: User; acessToken?: string };
const OAUTH =
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL ??
  API_BASE.replace(/\/api$/, "") + "/auth/google";

export const authService = {
  me: () => api.get<User>("/auth/me"),
  login: (d: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", d),
  register: (d: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", d),
  logout: () => api.post<{ success: true }>("/auth/logout"),
  googleRedirect: () => {
    window.location.href = OAUTH;
  },
};
