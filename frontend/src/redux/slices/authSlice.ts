import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type User = { id: string; email: string };

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = { user: null, loading: false, error: null };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

// helper fetch يحترم الكوكيز (JWT cookie من الباك إند)
async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message || "Request failed");
  return body as T;
}

// /api/auth/register
export const registerThunk = createAsyncThunk<User, { email: string; password: string }>(
  "auth/register",
  async ({ email, password }) => api<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
);

// /api/auth/login
export const loginThunk = createAsyncThunk<User, { email: string; password: string }>(
  "auth/login",
  async ({ email, password }) => api<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
);

// /api/auth/me
export const meThunk = createAsyncThunk<User>(
  "auth/me",
  async () => api<User>("/auth/me", { method: "GET" })
);

// /api/auth/logout
export const logoutThunk = createAsyncThunk<void>(
  "auth/logout",
  async () => { await api<void>("/auth/logout", { method: "POST" }); }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
 
    setUser(state, action) { state.user = action.payload; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    // register
    builder.addCase(registerThunk.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(registerThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; });
    builder.addCase(registerThunk.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Register failed"; });

    // login
    builder.addCase(loginThunk.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(loginThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; });
    builder.addCase(loginThunk.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Login failed"; });

    // me
    builder.addCase(meThunk.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(meThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; });
    builder.addCase(meThunk.rejected, (s) => { s.loading = false; s.user = null; });

    // logout
    builder.addCase(logoutThunk.fulfilled, (s) => { s.user = null; });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
