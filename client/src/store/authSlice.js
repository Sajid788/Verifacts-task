import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY_USER = "user";
const STORAGE_KEY_TOKEN = "token";

function readStoredAuth() {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!token || !raw) return { user: null, token: null };
    return { user: JSON.parse(raw), token };
  } catch {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    return { user: null, token: null };
  }
}

const stored = readStoredAuth();

const initialState = {
  user: stored.user,
  token: stored.token,
  loading: false,
  error: null,
  initialized: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(action.payload));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem(STORAGE_KEY_TOKEN, action.payload);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    loadUser: (state) => {
      const { user, token } = readStoredAuth();
      state.user = user;
      state.token = token;
      state.initialized = true;
    },
    logout: (state) => {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setToken, setLoading, setError, loadUser, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
