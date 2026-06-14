import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import caseReducer from "./caseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    case: caseReducer,
  },
});

export default store;
