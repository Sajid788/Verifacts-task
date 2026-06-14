import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cases: [],
  currentCase: null,
  loading: false,
  error: null,
};

const caseSlice = createSlice({
  name: "case",
  initialState,
  reducers: {
    setCases: (state, action) => {
      state.cases = action.payload;
    },
    setCurrentCase: (state, action) => {
      state.currentCase = action.payload;
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

export const { setCases, setCurrentCase, setLoading, setError, clearError } = caseSlice.actions;
export default caseSlice.reducer;
