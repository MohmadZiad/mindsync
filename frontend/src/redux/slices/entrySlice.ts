import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Entry = {
  id: string;
  mood: string;
  reflection?: string | null;
  habitId: string;
  createdAt: string;
};

type State = {
  items: Entry[];
  loading: boolean;
  error: string | null;
  currentHabitId?: string;
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

// GET /api/entries[?habitId=...]
export const fetchEntries = createAsyncThunk<Entry[], { habitId?: string } | undefined>(
  "entries/list",
  async (p) => {
    const qs = p?.habitId ? `?habitId=${encodeURIComponent(p.habitId)}` : "";
    return api<Entry[]>(`/entries${qs}`, { method: "GET" });
  }
);

// POST /api/entries
export const addEntry = createAsyncThunk<
  Entry,
  { mood: string; reflection?: string; habitId: string }
>("entries/add", async (payload) =>
  api<Entry>("/entries", { method: "POST", body: JSON.stringify(payload) })
);

// PUT /api/entries/:id
export const updateEntry = createAsyncThunk<
  Entry,
  { id: string; data: Partial<{ mood: string; reflection: string }> }
>("entries/update", async ({ id, data }) =>
  api<Entry>(`/entries/${id}`, { method: "PUT", body: JSON.stringify(data) })
);

// DELETE /api/entries/:id
export const deleteEntry = createAsyncThunk<string, string>(
  "entries/delete",
  async (id) => {
    await api<void>(`/entries/${id}`, { method: "DELETE" });
    return id;
  }
);

const slice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    setCurrentHabit(state, action) { state.currentHabitId = action.payload as string | undefined; },
    clearEntries(state) { state.items = []; },
  },
  extraReducers: (b) => {
    // list
    b.addCase(fetchEntries.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchEntries.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; });
    b.addCase(fetchEntries.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to load entries"; });

    // add
    b.addCase(addEntry.fulfilled, (s, a) => { s.items.unshift(a.payload); });

    // update
    b.addCase(updateEntry.fulfilled, (s, a) => {
      s.items = s.items.map((e) => (e.id === a.payload.id ? a.payload : e));
    });

    // delete
    b.addCase(deleteEntry.fulfilled, (s, a) => {
      s.items = s.items.filter((e) => e.id !== a.payload);
    });
  },
});

export const { setCurrentHabit, clearEntries } = slice.actions;
export default slice.reducer;
