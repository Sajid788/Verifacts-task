import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  agents: [],
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAgents: (state, action) => {
      state.agents = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setAgents, setUsers, setCurrentUser, setLoading, setError, clearError } = userSlice.actions;
export default userSlice.reducer;
