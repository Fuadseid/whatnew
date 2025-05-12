import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

export const forgetPassword = createAsyncThunk(
  "auth/forgetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/forget", { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Password reset failed. Please try again later.",
        }
      );
    }
  }
);

export const showvideo = createAsyncThunk(
  "video/showAll",
  async (_, { rejectWithValue, getState }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated || !auth.token) {
      return rejectWithValue({ message: "Not authenticated" });
    }
    try {
      const response = await api.get("/showvideo", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch videos",
          status: error.response?.status,
        }
      );
    }
  }
);

export const postvideo = createAsyncThunk(
  "video/post",
  async (formData, { rejectWithValue, getState }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated || !auth.token) {
      return rejectWithValue({ message: "Not authenticated" });
    }
    try {
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      const response = await api.post("/post-video", formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: `Error Uploading the video ${error}`,
      });
    }
  }
);
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (__, { rejectWithValue }) => {
    try {
      const response = await api.get("/google/redirect");
      const { user, token } = response.data;
      setAuthToken(token);
      return { user, token };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Google login failed. Please try again.",
        }
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, password, password_confirmation, token },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/reset-password", {
        email,
        password,
        password_confirmation,
        token,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Password reset failed. Please try again.",
        }
      );
    }
  }
);

export const postLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", { email, password });
      setAuthToken(response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Login failed. Please check your credentials.",
        }
      );
    }
  }
);

export const postRegister = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Registration failed. Please try again.",
        }
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue({ message: "No token found" });

      const response = await api.get("/me");
      return response.data;
    } catch (error) {
      setAuthToken(null);
      return rejectWithValue(
        error.response?.data || {
          message: "Session expired. Please login again.",
        }
      );
    }
  }
);

// Initial State
const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  success: false,
  isAuthenticated: false,
  forgetPassword: {
    loading: false,
    error: null,
    success: false,
    emailSent: null,
  },
  resetPassword: {
    loading: false,
    error: null,
    success: false,
  },
  video: {
    loading: false,
    error: null,
    errors: null,
    success: false,
    data: null,
    uploadProgress: 0,
    status: null,
  },
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken:(state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },

    resetAuthState: (state) => {
      state.error = null;
      state.success = false;
      state.forgetPassword = initialState.forgetPassword;
      state.resetPassword = initialState.resetPassword;
      state.video = { ...initialState.video, data: state.video.data };
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
      // Login
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
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      

      // Register
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

      // Check Auth
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
      })

      // Forget Password
      .addCase(forgetPassword.pending, (state) => {
        state.forgetPassword.loading = true;
        state.forgetPassword.error = null;
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.forgetPassword.loading = false;
        state.forgetPassword.success = true;
        state.forgetPassword.emailSent = action.meta.arg;
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.forgetPassword.loading = false;
        state.forgetPassword.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.resetPassword.loading = true;
        state.resetPassword.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPassword.loading = false;
        state.resetPassword.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPassword.loading = false;
        state.resetPassword.error = action.payload;
      })

      // Show Video
      .addCase(showvideo.pending, (state) => {
        state.video.loading = true;
      })
      .addCase(showvideo.fulfilled, (state, action) => {
        state.video.loading = false;
        state.video.success = true;
        state.video.data = action.payload;
      })
      .addCase(showvideo.rejected, (state, action) => {
        state.video.loading = false;
        state.video.error = action.payload;
      })

      // Post Video
      .addCase(postvideo.pending, (state) => {
        state.video.loading = true;
      })
      .addCase(postvideo.fulfilled, (state) => {
        state.video.loading = false;
        state.video.success = true;
      })
      .addCase(postvideo.rejected, (state, action) => {
        state.video.loading = false;
        state.video.error = action.payload;
      });
  },
});

// Exports
export const { resetAuthState,setToken, logout, setUploadProgress } = authSlice.actions;

// Selectors
export const selectVideoState = (state) => state.auth.video;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;
export const selectForgetPasswordState = (state) => state.auth.forgetPassword;
export const selectResetPasswordState = (state) => state.auth.resetPassword;

export default authSlice.reducer;
