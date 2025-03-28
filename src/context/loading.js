import { createSlice } from "@reduxjs/toolkit";

// Automatically set loading state based on a request's status
export const reLoading = createSlice({
  name: "loading",
  initialState: false,
  reducers: { setLoading: (state, action) => action.payload },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.endsWith("/pending"),
      () => true
    );
    builder.addMatcher(
      (action) => action.type.endsWith("/fulfilled"),
      () => false
    );
    builder.addMatcher(
      (action) => action.type.endsWith("/rejected"),
      () => false
    );
  },
});

export const loading = reLoading.reducer;
