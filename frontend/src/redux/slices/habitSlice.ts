import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Habit = { id: string; name: string; createdAt: string };

type State = {
  items: Habit[];
  loading: boolean;
  error: string | null;
};

const initialState: State = { items: [], loading: false, error: null };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
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

// GET /api/habits
export const fetchHabits = createAsyncThunk<Habit[]>("habits/list", async () => {
  return api<Habit[]>("/habits", { method: "GET" });
});

// POST /api/habits { name }
export const addHabit = createAsyncThunk<Habit, { name: string }>(
  "habits/add",
  async ({ name }) => api<Habit>("/habits", { method: "POST", body: JSON.stringify({ name }) })
);

// PUT /api/habits/:id { name }
export const updateHabit = createAsyncThunk<Habit, { id: string; name: string }>(
  "habits/update",
  async ({ id, name }) =>
    api<Habit>(`/habits/${id}`, { method: "PUT", body: JSON.stringify({ name }) })
);

// DELETE /api/habits/:id
export const deleteHabit = createAsyncThunk<string, string>(
  "habits/delete",
  async (id) => {
    await api<void>(`/habits/${id}`, { method: "DELETE" });
    return id;
  }
);

const slice = createSlice({
  name: "habits",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    // list
    b.addCase(fetchHabits.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchHabits.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; });
    b.addCase(fetchHabits.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to load habits"; });

    // add
    b.addCase(addHabit.fulfilled, (s, a) => { s.items.unshift(a.payload); });

    // update
    b.addCase(updateHabit.fulfilled, (s, a) => {
      s.items = s.items.map((h) => (h.id === a.payload.id ? a.payload : h));
    });

    // delete
    b.addCase(deleteHabit.fulfilled, (s, a) => {
      s.items = s.items.filter((h) => h.id !== a.payload);
    });
  },
});

export default slice.reducer;
