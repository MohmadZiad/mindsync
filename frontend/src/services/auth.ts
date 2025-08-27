import { api, API_BASE } from "./api";

export type User = {
  id: string;
  name?: string;
  email: string;
  image?: string;
};

type AuthResponse = { user: User; accessToken?: string };

const BASE_HOST = API_BASE.replace(/\/api\/?$/, "");
const OAUTH =
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL ??
  new URL("/auth/google", BASE_HOST).toString();

export const authService = {
  me: () => api.get<User>("/auth/me"),

  login: async (d: { email: string; password: string }) => {
    const r = await api.post<AuthResponse>("/auth/login", d);
    return r.user; 
  },

  register: async (d: { email: string; password: string; name?: string }) => {
    const r = await api.post<AuthResponse>("/auth/register", d);
    return r.user; 
  },

  logout: () => api.post<{ success: true }>("/auth/logout"),

  googleRedirect: () => {
    if (typeof window !== "undefined") window.location.href = OAUTH;
  },

  oauthUrl: OAUTH,
};

export default authService;
