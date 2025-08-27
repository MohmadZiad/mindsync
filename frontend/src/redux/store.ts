import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import habitsReducer from "./slices/habitSlice";
import entriesReducer from "./slices/entrySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
    entries: entriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
