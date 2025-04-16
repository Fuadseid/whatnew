import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Helper function to set auth token in axios and localStorage
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const postLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", { email, password },
       { headers: {
          "Content-Type": "application/json",
        }});
      setAuthToken(response.data.token); // Store token
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { 
        message: "Login failed. Please check your credentials and try again." 
      });
    }
  }
);

export const postRegister = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/register", userData,    {
        headers: {
          "Content-Type": "application/json",
        },});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { 
        message: "Registration failed. Please try again later." 
      });
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue({ message: "No token found" });
      
      const response = await api.get("/me");
      return response.data;
    } catch (error) {
      setAuthToken(null); // Clear invalid token
      return rejectWithValue(error.response?.data || { 
        message: "Session expired. Please login again." 
      });
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  success: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.success = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setAuthToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(postLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(postLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.success = true;
      })
      .addCase(postLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register cases
      .addCase(postRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(postRegister.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(postRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { resetAuthState, logout } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;

export default authSlice.reducer;