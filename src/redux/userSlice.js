import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const initialState = {
  user: null, // Decoded user info from token
  token: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const token = action.payload;
      state.token = token;
      localStorage.setItem("accessToken", token);

      try {
        const decoded = jwtDecode(token);
        state.user = decoded;
        state.isAuthenticated = true;
      } catch (err) {
        console.error("Invalid token:", err);
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
    },
  },
});

export const { setCredentials, clearCredentials } = userSlice.actions;
export default userSlice.reducer;
