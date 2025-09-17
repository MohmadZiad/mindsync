import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { focusMode: false },
  reducers: {
    toggleFocusMode: (state) => {
      state.focusMode = !state.focusMode;
    },
  },
});

export const { toggleFocusMode } = uiSlice.actions;
export default uiSlice.reducer;
