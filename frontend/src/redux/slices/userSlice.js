import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isPasswordExpired: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isPasswordExpired = false;
    },
    setPasswordExpired: (state, action) => {
        state.isPasswordExpired = action.payload;
    },
  },
});

export const { setCredentials, logOut, setPasswordExpired } = userSlice.actions;

export default userSlice.reducer;

export const selectCurrentUser = (state) => state.user.user;