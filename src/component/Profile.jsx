import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  clearProfile,
  checkAuth,
  fetchUserVideos,
} from "../redux/slicer";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const {
    user: profileUser,
    videos,
    likes,
    loading,
    error,
  } = useSelector((state) => state.auth.profile);

  const { user: currentUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Check for saved theme preference
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);

    // Apply the theme class to the document
    if (savedMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const verifyAndLoadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!isAuthenticated) {
        try {
          await dispatch(checkAuth()).unwrap();
        } catch {
          navigate("/login");
          return;
        }
      }

      await dispatch(fetchProfile(id));
      await dispatch(fetchUserVideos(id));
    };

    verifyAndLoadData();

    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch, id, isAuthenticated, navigate]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          {/* Outer circle */}
          <div className="w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
          {/* Inner circle */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <div className="w-8 h-8 border-4 border-pink-500 rounded-full border-b-transparent animate-spin animation-delay-200"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="py-8 text-center text-red-600 bg-gray-50 dark:bg-gray-900 dark:text-red-400">
        Error: {error}
      </div>
    );

  if (!profileUser)
    return (
      <div className="py-8 text-center text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
        User not found
      </div>
    );

  const isCurrentUser = currentUser && currentUser.id === profileUser.id;

  return (
    <div
      className={`max-w-6xl min-h-screen px-4 py-8 mx-auto transition-colors duration-300 ${
        darkMode ? "dark:bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Dark Mode Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            darkMode
              ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } transition-colors duration-200`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      {/* Profile Header */}
      <div
        className={`flex flex-col items-center gap-6 p-6 mb-8 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        } md:flex-row`}
      >
        <div className="relative w-32 h-32 group">
          <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-tr from-purple-500 to-pink-500 group-hover:opacity-100"></div>
          <img
            src={profileUser.profile_picture || "/default-avatar.png"}
            alt={`${profileUser.name}'s profile`}
            className={`relative z-10 object-cover w-full h-full border-4 rounded-full ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {profileUser.name}
              </h1>
              <p
                className={`mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                @{profileUser.username}
              </p>
            </div>
            {isCurrentUser && (
              <button
                className={`px-4 py-2 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ${
                  darkMode ? "shadow-purple-800/30" : "shadow-purple-500/30"
                }`}
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="flex justify-center gap-6 my-6 md:justify-start">
            {[
              { value: videos.length, label: "Videos" },
              { value: likes, label: "Likes" },
              { value: profileUser.followers_count || 0, label: "Followers" },
              { value: profileUser.following_count || 0, label: "Following" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <p
                  className={`text-xl font-bold transition-colors ${
                    darkMode
                      ? "text-white group-hover:text-purple-400"
                      : "text-gray-800 group-hover:text-purple-600"
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className={`mt-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            {profileUser.bio ||
              (isCurrentUser
                ? "Add a bio to tell people about yourself"
                : "No bio yet")}
          </p>
        </div>
      </div>

      {/* Videos Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Videos
            {isCurrentUser && (
              <span
                className={`ml-2 text-sm font-normal ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                (Your uploaded content)
              </span>
            )}
          </h2>
          {isCurrentUser && videos.length > 0 && (
            <button className="px-4 py-2 text-sm text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Upload New Video
            </button>
          )}
        </div>

        {videos.length === 0 ? (
          <div
            className={`p-8 text-center rounded-xl shadow-md ${
              darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-500"
            }`}
          >
            <p>
              {isCurrentUser
                ? "You haven't uploaded any videos yet"
                : "No videos uploaded yet"}
            </p>
            {isCurrentUser && (
              <button
                className={`px-6 py-3 mt-4 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ${
                  darkMode ? "shadow-purple-800/30" : "shadow-purple-500/30"
                }`}
              >
                Upload Your First Video
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`overflow-hidden transition-all duration-300 rounded-xl hover:-translate-y-1 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 shadow-gray-800/30 hover:shadow-gray-700/50"
                    : "bg-white text-gray-800 shadow-md hover:shadow-lg"
                }`}
              >
                <div
                  className={`relative pt-[56.25%] ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <video
                    src={video.url}
                    className="absolute top-0 left-0 object-cover w-full h-full rounded-t-xl"
                    controls
                  />
                </div>
                <div className="p-4">
                  <h3
                    className={`mb-2 text-lg font-bold line-clamp-2 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {video.title}
                  </h3>
                  <div
                    className={`flex justify-between text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {video.like_count}
                    </span>
                    <span>
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
