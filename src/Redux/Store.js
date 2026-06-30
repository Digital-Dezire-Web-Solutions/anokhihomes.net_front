import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./Slices/AppSlices";

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});