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

        // Return cached data if available and not stale
    if (auth.video && auth.video.data && !auth.video.invalidated) {
      return auth.video.data;
    }
    try {
      const response = await api.get("/show", {
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



export const showDiscoveryvideo = createAsyncThunk(
  "video/discover",
  async (_, { rejectWithValue, getState }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated || !auth.token) {
      return rejectWithValue({ message: "Not authenticated" });
    }

        // Return cached data if available and not stale
    if (auth.video && auth.video.data && !auth.video.invalidated) {
      return auth.video.data;
    }
    try {
      const response = await api.get(`/feed/discover/${auth.user.id}`, {
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
  "upload",
  async (formData, { rejectWithValue, getState }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated || !auth.token) {
      return rejectWithValue({ message: "Not authenticated" });
    }
    try {
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      const response = await api.post("/upload", formData, {
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

// Google Authentication
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/auth/google/callback");
      const { token, user } = response.data;
      
      // Set token immediately
      setAuthToken(token);
      dispatch(setToken(token));
      
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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




export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return {
        user: response.data.user, // Now includes is_following
        videos: response.data.videos,
        likes: response.data.likes
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        message: "Failed to fetch profile",
        status: error.response?.status,
      });
    }
  }
);



// Add this to your slicer
export const fetchUserVideos = createAsyncThunk(
  "video/userVideos",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await api.get(`/user/${userId}/videos`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch user videos" });
    }
  }
);


// Follow a user
export const followUser = createAsyncThunk(
  "user/follow",
  async (userId, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      const response = await api.post(`/follow/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      // Update current user's following count
      dispatch(authSlice.actions.updateCurrentUser({
        following_count: response.data.following_count
      }));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to follow user" }
      );
    }
  }
);

// Unfollow a user
export const unfollowUser = createAsyncThunk(
  "user/unfollow",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await api.post(`/unfollow/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to unfollow user" }
      );
    }
  }
);


export const fetchFollowingVideos = createAsyncThunk(
  "video/following",
  async (_, { rejectWithValue, getState }) => { // Remove userId parameter
    try {
      const { auth } = getState();
      
      // Check if user is authenticated and has an ID
      if (!auth.isAuthenticated || !auth.user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await api.get(`/feed/following/${auth.user.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch following videos",
          status: error.response?.status,
        }
      );
    }
  }
);


// Add this to your existing async thunks
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ userId, profileData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await api.post(`/edit/${userId}`, profileData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to update profile",
          status: error.response?.status,
        }
      );
    }
  }
);








// Initial State
const initialState = { 
  user: null,
  token: localStorage.getItem("token"), 
  isLoading: false,
  error: null,
  success: false,
  isAuthenticated:  !!localStorage.getItem("token"),
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
    lastFetched: null,  // Track when data was last fetched
    invalidated: true   // Force refresh when needed
  },

  profile: {
    user: null,
    videos: [],
    likes: 0,
    loading: false,
    error: null,
    followError: null 
  
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

  api.defaults.headers.common['Authorization'] = `Bearer ${action.payload}`;
  localStorage.setItem('token', action.payload);
    },

    resetAuthState: (state) => {
      state.error = null;
      state.success = false;
      state.forgetPassword = initialState.forgetPassword;
      state.resetPassword = initialState.resetPassword;
      state.video = { ...initialState.video, data: state.video.data };
    },
      clearProfile: (state) => {
      state.profile = initialState.profile;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setAuthToken(null);
    },
    updateProfileUser: (state, action) => {
      if (state.profile.user) {
        state.profile.user = {
          ...state.profile.user,
          ...action.payload
        };
      }
    },
    updateCurrentUser: (state, action) => {
  if (state.user) {
    state.user = {
      ...state.user,
      ...action.payload
    };
  }
},
updateVideoWithComment: (state, action) => {
      const { videoId, comment } = action.payload;
      if (state.video.data) {
        state.video.data = state.video.data.map(video => {
          if (video.id === videoId) {
            return {
              ...video,
              comments: [
                {
                  ...comment,
                  user: comment.user || {
                    id: state.user?.id,
                    name: state.user?.name,
                    username: state.user?.username,
                    profile_picture: state.user?.profile_picture
                  }
                },
                ...(video.comments || [])
              ]
            };
          }
          return video;
        });
      }
    },
// In your authSlice.js
updateVideoLikes: (state, action) => {
  const { videoId, likeCount, isLiked, userId } = action.payload;
  if (state.video.data) {
    state.video.data = state.video.data.map(video => {
      if (video.id === videoId) {
        const updatedVideo = {
          ...video,
          like_count: likeCount,
          is_liked: isLiked, // Ensure this is set
        };
        
        // Update likes array if it exists
        if (Array.isArray(video.likes)) {
          updatedVideo.likes = isLiked
            ? [...video.likes, { user_id: userId }]
            : video.likes.filter(like => like.user_id !== userId);
        }
        
        return updatedVideo;
      }
      return video;
    });
  }
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



      .addCase(googleLogin.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(googleLogin.fulfilled, (state, action) => {
  const googleUser = action.payload.user;
  
  state.isLoading = false;
  state.user = {
    id: googleUser.id || googleUser._id || googleUser.userId, // try common id fields
    name: googleUser.name,
    email: googleUser.email,
    username: googleUser.username || googleUser.email.split('@')[0],
    profile_picture: googleUser.profile_picture || googleUser.avatar,
    // Default values for other fields
  };
  state.token = action.payload.token;
  state.isAuthenticated = true;
  state.success = true;
  setAuthToken(action.payload.token);
})
.addCase(googleLogin.rejected, (state, action) => {
  state.isLoading = false;
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
        state.isAuthenticated = false; // Reset while checking
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.token = localStorage.getItem("token"); // Ensure token is set

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
        state.lastFetched = Date.now();
        state.invalidated = false;
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
      })

      //profile
      .addCase(fetchProfile.pending, (state) => {
        state.profile.loading = true;
        state.profile.error = null;
      })
      // In your Redux slice (authSlice.js or similar)
.addCase(fetchProfile.fulfilled, (state, action) => {
  state.profile.loading = false;
  state.profile.user = action.payload.user; // Store exactly what came from API
  state.profile.videos = action.payload.videos;
  state.profile.likes = action.payload.likes;
})
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profile.loading = false;
        state.profile.error = action.payload?.message || action.error.message;
      })

      // Follow User
.addCase(followUser.pending, (state) => {
  state.profile.loading = true;
})
// In your authSlice.js - extraReducers section

// Update the follow/unfollow cases
  .addCase(followUser.fulfilled, (state, action) => {
      state.profile.loading = false;
      // Update profile user's followers count
      if (state.profile.user) {
          state.profile.user.followers_count = action.payload.followers_count;
          state.profile.user.is_following = true; // Update following status
      }
      // Update current user's following count
      if (state.user) {
          state.user.following_count = action.payload.following_count;
      }
  })
// Update the extraReducers for follow/unfollow
.addCase(followUser.rejected, (state, action) => {
  state.profile.loading = false;
  state.profile.followError = action.payload?.message || "Failed to follow user";
  // If it's a conflict, update the state to reflect the existing relationship
  if (action.payload?.message?.includes('Already following')) {
    if (state.profile.user) {
      state.profile.user.followers_count += 1;
    }
    if (state.user && state.profile.user) {
      state.user.following = [...(state.user.following || []), {
        id: state.profile.user.id,
        name: state.profile.user.name,
        username: state.profile.user.username
      }];
      state.user.following_count = (state.user.following_count || 0) + 1;
    }
  }
})

// Unfollow User
.addCase(unfollowUser.pending, (state) => {
  state.profile.loading = true;
})
.addCase(unfollowUser.fulfilled, (state, action) => {
    state.profile.loading = false;
    // Update profile user's followers count
    if (state.profile.user) {
        state.profile.user.followers_count = action.payload.followers_count;
        state.profile.user.is_following = false; // Update following status
    }
    // Update current user's following count
    if (state.user) {
        state.user.following_count = action.payload.following_count;
    }
})

.addCase(unfollowUser.rejected, (state, action) => {
  state.profile.loading = false;
  state.profile.followError = action.payload?.message || "Failed to unfollow user";
})

.addCase(fetchFollowingVideos.pending, (state) => {
  state.video.loading = true;
  state.video.error = null;
})
.addCase(fetchFollowingVideos.fulfilled, (state, action) => {
  state.video.loading = false;
  state.video.data = action.payload; // Store the videos
  state.video.error = null;
})
.addCase(fetchFollowingVideos.rejected, (state, action) => {
  state.video.loading = false;
  state.video.error = action.payload;
})


.addCase(showDiscoveryvideo.pending, (state) => {
  state.video.loading = true;
  state.video.error = null;
})
.addCase(showDiscoveryvideo.fulfilled, (state, action) => {
  state.video.loading = false;
  state.video.data = action.payload; // Store the videos
  state.video.error = null;
})
.addCase(showDiscoveryvideo.rejected, (state, action) => {
  state.video.loading = false;
  state.video.error = action.payload;
})




// Add this to your extraReducers builder
.addCase(updateProfile.pending, (state) => {
  state.profile.loading = true;
  state.profile.error = null;
})
.addCase(updateProfile.fulfilled, (state, action) => {
  state.profile.loading = false;
  state.profile.user = action.payload;
  // Also update current user if it's the same user
  if (state.user && state.user.id === action.payload.id) {
    state.user = {
      ...state.user,
      name: action.payload.name,
      email: action.payload.email,
      username: action.payload.username,
      bio: action.payload.bio,
      profile_picture: action.payload.profile_picture
    };
  }
})
.addCase(updateProfile.rejected, (state, action) => {
  state.profile.loading = false;
  state.profile.error = action.payload;
})

;
  }
});


// Exports
export const { resetAuthState,setToken, logout, setUploadProgress, clearProfile,  updateProfileUser, updateCurrentUser  } = authSlice.actions;

// Selectors
export const selectVideoState = (state) => state.auth.video;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;
export const selectForgetPasswordState = (state) => state.auth.forgetPassword;
export const selectResetPasswordState = (state) => state.auth.resetPassword;
export const selectProfileState = (state) => state.auth.profile;


export default authSlice.reducer;