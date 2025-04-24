import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

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
      const response = await api.get("/showvideo",{
        headers: {
          "Authorization": `Bearer ${auth.token}`
        }
      });
      console.log("API response data:", response.data);

      return response.data;
    } catch (e) {
      return rejectWithValue(
        e.response.data || {
          message: "Failed to fetch videos",
          status: e.response.status,
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
      const response = await api.post("/post-video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${auth.token}`
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token might be expired - you might want to logout here
        localStorage.removeItem("token");
        window.location.reload();
      }
      return rejectWithValue(
        error.response?.data || {
          message: "Video upload failed. Please try again.",
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
    success: false,
    data: null,
    currentVideo: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.success = false;
      state.forgetPassword.error = null;
      state.forgetPassword.success = false;
      state.resetPassword.error = null;
      state.resetPassword.success = false;
      state.video.error = null;
      state.video.success = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setAuthToken(null);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(postLogin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(postLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.success = true;
    });
    builder.addCase(showvideo.pending, (state) => {
      state.video.loading = true;
      state.video.error = null;
      state.video.success = false;
    });
    builder.addCase(showvideo.fulfilled, (state, action) => {
      state.video.loading = false;
      state.video.success = true;
      state.video.data = action.payload;
      console.log("datalll:", state.video.data);
    });
    builder.addCase(showvideo.rejected, (state, action) => {
      state.video.loading = false;
      state.video.error = action.payload;
    });
    builder.addCase(postLogin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    });

    builder.addCase(postRegister.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(postRegister.fulfilled, (state) => {
      state.isLoading = false;
      state.success = true;
    });
    builder.addCase(postRegister.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(forgetPassword.pending, (state) => {
      state.forgetPassword.loading = true;
      state.forgetPassword.error = null;
      state.forgetPassword.success = false;
    });
    builder.addCase(forgetPassword.fulfilled, (state, action) => {
      state.forgetPassword.loading = false;
      state.forgetPassword.success = true;
      state.forgetPassword.emailSent = action.meta.arg;
    });
    builder.addCase(forgetPassword.rejected, (state, action) => {
      state.forgetPassword.loading = false;
      state.forgetPassword.error = action.payload;
    });

    builder.addCase(resetPassword.pending, (state) => {
      state.resetPassword.loading = true;
      state.resetPassword.error = null;
      state.resetPassword.success = false;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.resetPassword.loading = false;
      state.resetPassword.success = true;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.resetPassword.loading = false;
      state.resetPassword.error = action.payload;
    });

    builder.addCase(checkAuth.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    });
    builder.addCase(postvideo.pending, (state) => {
      state.video.loading = true;
      state.video.error = null;
      state.video.success = false;
    });
    builder.addCase(postvideo.fulfilled, (state, action) => {
      state.video.loading = false;
      state.video.success = true;
      state.video.data = action.payload;
    });
    builder.addCase(postvideo.rejected, (state, action) => {
      state.video.loading = false;
      state.video.error = action.payload;
    });
  },
});

export const { resetAuthState, logout } = authSlice.actions;
export const selectVideoState = (state) => state.auth.video;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;
export const selectForgetPasswordState = (state) => state.auth.forgetPassword;
export const selectResetPasswordState = (state) => state.auth.resetPassword;

export default authSlice.reducer;
