import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Mood = "calm" | "focus" | "energy" | "soft";

interface UIState {
  focusMode: boolean;
  mood: Mood;
}

const initialState: UIState = {
  focusMode: false,
  mood: "calm", // SSR-safe default; MoodBody will sync from localStorage on client
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleFocusMode: (state) => {
      state.focusMode = !state.focusMode;
    },
    setMood: (state, action: PayloadAction<Mood>) => {
      state.mood = action.payload;
    },
  },
});

export const { toggleFocusMode, setMood } = uiSlice.actions;
export default uiSlice.reducer;
