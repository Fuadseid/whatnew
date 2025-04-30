import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define interfaces for the state and user
const User ={
  id,
  name,
  email,
  token,
  permissions,
  shops,
  warehouses,
}

const AuthState = {
  token,
  isAuthenticated,
  user,
  notifications,
  csrf_token,
  app_url,
  media_url,
  lang,
  tenant,
}

// Initialize state from localStorage
const initializeUser = ()=> {
  if (typeof window !== "undefined") {
    const item = window?.localStorage.getItem("user-info");
    return item ? (JSON.parse(item)) : null;
  }
  return null;
};

const initializeAuthenticated = () => {
  if (typeof window !== "undefined") {
    const item = window?.localStorage.getItem("user-info");
    return item ? true : false;
  }
  return false;
};

const initializeToken = () => {
  if ( window !== "undefined") {
    const item = window?.localStorage.getItem("token");
    return item ? item : null;
  }
  return null;
};

// Create the auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: initializeToken(),
    isAuthenticated: initializeAuthenticated(),
    user: initializeUser(),
    notifications: [] ,
    csrf_token: "",
    
    // front_url: "https://test.gojocasting.com",
    front_url: "https://gojocasting.com",
    app_url: "https://back.gojocasting.com",
    upload_url: "https://back.gojocasting.com/api/uploadFile",
    media_url: "https://back.gojocasting.com/storage/uploads/",

    // front_url: "http://localhost:5173",
    // media_url: "http://localhost:8000/storage/uploads/",
    // app_url: "http://localhost:8000",
    // upload_url: "http://localhost:8000/api/uploadFile",

    lang: "en",
    tenant: "test",
  } ,
  reducers: {
    authenticateUser: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.token = action.payload.token;
      window?.localStorage.setItem("user-info", JSON.stringify(state.user));
      window?.localStorage.setItem("token", state.token);
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      window?.localStorage.removeItem("user-info");
      window?.localStorage.removeItem("token");
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.lang = action.payload;
    },
    socialAuthenticate: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.token = action.payload;
    },
    setCSRFToken: (state, action: PayloadAction<string>) => {
      state.csrf_token = action.payload;
    },
    pushNotification: (state, action: PayloadAction<string>) => {
      state.notifications.push(action.payload);
    },
    removeNotifications: (state) => {
      state.notifications = [];
    },
  },
});

// Export actions and reducer
export const {
  authenticateUser,
  logoutUser,
  socialAuthenticate,
  setCSRFToken,
  setUser,
  pushNotification,
  removeNotifications,
  setLanguage
} = authSlice.actions;

export default authSlice.reducer;

Bereket Fanaye, [4/24/2025 11:20 AM]
"use client";
import React, { useState } from "react";
import axios from "@/lib/axios";
function FileUpload({ onUploadComplete, label, validation, location }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const chunkSize = 1024 * 1024; // 1MB chunks

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setProgress(0);
    uploadFile();
  };

  const uploadFile = async () => {
    if (!file) return;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);
      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("filename", file.name);
      formData.append("chunk", uploadedChunks);
      formData.append("totalChunks", totalChunks);
      formData.append("location", location);

      try {
        await axios
          .post("/api/upload-chunk", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            if (response.data.file_path) {
              onUploadComplete(response.data.file_path);
            }
          });
        uploadedChunks++;
        setProgress((uploadedChunks / totalChunks) * 100);
      } catch (error) {
        console.error("Error uploading chunk:", error);
      }
    }

    // Notify parent component when upload completes
    // if (onUploadComplete) {
    //   onUploadComplete(file);
    // }
  };

  return (
    <div className="flex flex-col mt-5 py-2 items-center justify-center border-2 border-dashed border-[#b4b8be] dark:border-gray-200 rounded-xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 mb-2"
        viewBox="0 0 20 20"
      >
        <path
          fill="currentColor"
          d="M11.5 3a4.5 4.5 0 0 1 4.492 4.77H16l-.001 1.227a4 4 0 0 1 3.996 3.799l.005.2a4 4 0 0 1-3.8 3.992l-.2.005h-.001L16 17h-5.001v-3.923h2.464L10 9.003l-3.454 4.075H9L8.999 17H4a4.01 4.01 0 0 1-4-4.005 4 4 0 0 1 3.198-3.918 3 3 0 0 1 4.313-3.664A4.5 4.5 0 0 1 11.5 3"
        />
      </svg>
      <div className="font-bold text-xl mb-2">{label}</div>
      <label
        htmlFor="uploadProfilePic"
        className="flex items-center justify-center px-5 py-2 bg-transparent text-white bg-gray-500 dark:bg-gray-500 rounded-[50px] mt-3"
      >
        <div className="dark:text-white text-slate-800">Browse File</div>
        <input
          type="file"
          accept={validation} // Accept both images and videos
          className="hidden"
          id="uploadProfilePic"
          onChange={handleFileChange}
        />
      </label>
      {file && (
        <div className="mt-2 text-center">
          <div className="text-sm">Selected File: {file.name}</div>
        </div>
      )}
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: ${progress}% }}
          ></div>
          Uploaded {progress}%
        </div>
      )}
      {file && (
        <button
          className="btn btn-primary py-1 px-3"
          type="button"
          onClick={uploadFile}
        >
          Upload
        </button>
      )}
    </div>
  );
}

export default FileUpload;