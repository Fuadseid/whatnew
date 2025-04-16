import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slicer";
export const store = configureStore({
  reducer: {
    auth:authSlice,
  },
});


