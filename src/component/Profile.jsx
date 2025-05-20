import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  clearProfile,
  checkAuth,
  fetchUserVideos,
  updateProfile,
  followUser,
  unfollowUser,
  updateProfileUser,
  updateCurrentUser
} from "../redux/slicer";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaMusic,
  FaUserPlus,
  FaPlay,
  FaCheck,
  FaTimes,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  });

  const {
    user: profileUser,
    videos,
    likes,
    loading,
    error,
    followError
  } = useSelector((state) => state.auth.profile);

  const { user: currentUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (darkMode) {
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

  useEffect(() => {
    if (profileUser) {
      setEditedData({
        name: profileUser.name,
        username: profileUser.username,
        email: profileUser.email,
        bio: profileUser.bio || "",
      });
    }
  }, [profileUser]);

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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  function handleUpload() {
    navigate("/upload");
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({
      name: profileUser.name,
      username: profileUser.username,
      email: profileUser.email,
      bio: profileUser.bio || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await dispatch(
        updateProfile({
          userId: profileUser.id,
          profileData: editedData,
        })
      ).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    setIsFollowLoading(true);
    try {
      if (profileUser.is_following) {
        const result = await dispatch(unfollowUser(profileUser.id)).unwrap();
        dispatch(updateProfileUser({
          ...profileUser,
          followers_count: result.followers_count,
          is_following: false
        }));
        if (currentUser.following) {
          dispatch(updateCurrentUser({
            following: currentUser.following.filter(user => user.id !== profileUser.id),
            following_count: result.following_count
          }));
        }
      } else {
        const result = await dispatch(followUser(profileUser.id)).unwrap();
        dispatch(updateProfileUser({
          ...profileUser,
          followers_count: result.followers_count,
          is_following: true
        }));
        dispatch(updateCurrentUser({
          following: [...(currentUser.following || []), {
            id: profileUser.id,
            name: profileUser.name,
            username: profileUser.username,
            profile_picture: profileUser.profile_picture
          }],
          following_count: result.following_count
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const fetchModalData = async (type) => {
    setIsLoadingModal(true);
    try {
      const token = localStorage.getItem("token");
      let response;
      
      switch(type) {
        case 'followers':
          response = await axios.get(`http://localhost:8000/api/profile/followers/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setModalTitle('Followers');
          setModalContent(response.data);
          break;
        case 'following':
          response = await axios.get(`http://localhost:8000/api/profile/following/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setModalTitle('Following');
          setModalContent(response.data);
          break;
        default:
          break;
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching modal data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoadingModal(false);
    }
  };

  const renderModalContent = () => {
    if (isLoadingModal) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      );
    }

    if (!modalContent || (Array.isArray(modalContent) && modalContent.length === 0)) {
      return <div className="p-4 text-center text-gray-400">No data available</div>;
    }

    return (
      <div className="overflow-y-auto max-h-96">
        {modalContent.map(user => (
          <div 
            key={user.id} 
            className="flex items-center p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800"
            onClick={() => {
              navigate(`/profile/${user.id}`);
              setShowModal(false);
            }}
          >
            <img 
              src={user.profile_picture || '/default-avatar.png'} 
              alt={user.name}
              className="w-10 h-10 mr-3 text-gray-400 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-300">{user.name}</p>
              <p className="text-sm text-gray-100">@{user.username}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const isCurrentUser = currentUser && currentUser.id === parseInt(id);
  const isPrivateProfile = profileUser?.is_private && !isCurrentUser;
  const isFollowing = profileUser?.is_following || false;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <div className="w-8 h-8 border-4 border-pink-500 rounded-full border-b-transparent animate-spin animation-delay-200"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-red-500 bg-gray-50 dark:bg-gray-900 dark:text-red-400">
        <div className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
          <p className="text-lg font-medium">Error loading profile</p>
          <p className="text-sm">{error.message || "Please try again later"}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 mt-4 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  if (!profileUser)
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
        <div className="text-center">
          <p className="text-xl font-medium">Profile not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 mt-4 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark:bg-gray-900" : "bg-gray-50"}`}>
      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-blue-400">{modalTitle}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}

      {/* Dark Mode Toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            darkMode
              ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } transition-colors duration-200`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-purple-900 via-pink-700 to-indigo-800"></div>
        
        <div className="container relative px-4 mx-auto -mt-16 md:px-6">
          <div className={`flex flex-col items-center gap-6 p-6 rounded-xl shadow-xl md:flex-row ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
          }`}>
            {/* Profile Picture with Ring */}
            <div className="relative group">
              <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-tr from-purple-500 to-pink-500 group-hover:opacity-100"></div>
              <img
                src={profileUser.profile_picture || "/default-avatar.png"}
                alt={profileUser.name}
                className={`relative z-10 w-32 h-32 border-4 rounded-full ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                {isEditing ? (
                  <div className="w-full">
                    <div className="mb-4">
                      <label className={`block mb-1 text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editedData.name}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-lg ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>
                    <div className="mb-4">
                      <label className={`block mb-1 text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editedData.username}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-lg ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>
                    <div className="mb-4">
                      <label className={`block mb-1 text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editedData.email}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-lg ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>
                    <div className="mb-4">
                      <label className={`block mb-1 text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={editedData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full p-2 border rounded-lg ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {profileUser.name}
                    </h1>
                    <p className={`mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      @{profileUser.username}
                    </p>
                    {isPrivateProfile && (
                      <span className="inline-flex items-center px-3 py-1 mt-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Private Account
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                  {isCurrentUser ? (
                    <>
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveProfile}
                            className={`px-6 py-2 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ${
                              darkMode ? "shadow-purple-800/30" : "shadow-purple-500/30"
                            }`}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className={`px-6 py-2 transition-all rounded-lg ${
                              darkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEditClick}
                            className={`px-6 py-2 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ${
                              darkMode ? "shadow-purple-800/30" : "shadow-purple-500/30"
                            }`}
                          >
                            Edit Profile
                          </button>
                          <button 
                            onClick={handleUpload}
                            className="px-6 py-2 text-white transition-all bg-pink-600 rounded-lg hover:bg-pink-700 hover:shadow-lg"
                          >
                            Upload Video
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`flex items-center gap-2 px-6 py-2 font-medium transition-all rounded-full hover:shadow-lg ${
                          isFollowing 
                            ? 'bg-gray-700 hover:bg-gray-600' 
                            : 'bg-pink-600 hover:bg-pink-700'
                        } ${isFollowLoading ? 'opacity-70' : ''}`}
                      >
                        {isFollowLoading ? (
                          <span className="inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                        ) : (
                          <>
                            {isFollowing ? <FaCheck /> : <FaUserPlus />}
                            {isFollowing ? 'Following' : 'Follow'}
                          </>
                        )}
                      </button>
                      {followError && !isFollowing && (
                        <div className="text-sm text-red-500">
                          {followError.includes('Already') ? 'Already following' : followError}
                        </div>
                      )}
                      <button className="p-3 transition-all bg-gray-700 rounded-full hover:bg-gray-600 hover:shadow-lg">
                        <FaShare />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex justify-center gap-8 mt-6 md:justify-start">
                <StatBox 
                  value={videos.length} 
                  label="Videos" 
                  clickable={false}
                  darkMode={darkMode}
                />
                <StatBox 
                  value={likes} 
                  label="Likes" 
                  clickable={false}
                  darkMode={darkMode}
                />
                <StatBox 
                  value={profileUser.followers_count || 0} 
                  label="Followers" 
                  clickable={true}
                  onClick={() => fetchModalData('followers')}
                  darkMode={darkMode}
                />
                <StatBox 
                  value={profileUser.following_count || 0} 
                  label="Following" 
                  clickable={true}
                  onClick={() => fetchModalData('following')}
                  darkMode={darkMode}
                />
              </div>
              
              {/* Bio */}
              {!isEditing && (
                <p className={`mt-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {profileUser.bio ||
                    (isCurrentUser
                      ? "Add a bio to tell people about yourself"
                      : isPrivateProfile
                      ? "This account is private"
                      : "No bio yet")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Private Profile Content Block */}
      {isPrivateProfile && !isCurrentUser && (
        <div className={`p-8 mb-8 text-center rounded-xl shadow-md ${
          darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-500"
        }`}>
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-200">
            This Account is Private
          </h3>
          <p className="mb-6">
            Follow this account to see their photos and videos.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleFollow}
              className={`px-6 py-2 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ${
                darkMode ? "shadow-purple-800/30" : "shadow-purple-500/30"
              }`}
            >
              Request to Follow
            </button>
          </div>
        </div>
      )}

      {/* Videos Section */}
      {(!isPrivateProfile || isCurrentUser) && (
        <div className="container px-4 py-12 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              {isCurrentUser ? 'Your Videos' : 'Videos'}
            </h2>
            {isCurrentUser && videos.length > 0 && (
              <button 
                onClick={handleUpload}
                className="px-4 py-2 text-sm text-white transition-all bg-pink-600 rounded-lg hover:bg-pink-700 hover:shadow-lg"
              >
                Upload New Video
              </button>
            )}
          </div>
          
          {videos.length === 0 ? (
            <div className={`flex flex-col items-center justify-center p-12 text-center rounded-xl ${
              darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-500"
            }`}>
              <p className="mb-4 text-xl">
                {isCurrentUser ? 'Start sharing your videos!' : 'No videos yet'}
              </p>
              {isCurrentUser && (
                <button 
                  onClick={handleUpload}
                  className={`px-6 py-3 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ${
                    darkMode ? "shadow-purple-800/30" : "shadow-purple-500/30"
                  }`}
                >
                  Upload Your First Video
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map(video => (
                <VideoCard 
                  key={video.id} 
                  video={video}
                  darkMode={darkMode}
                  onClick={() => navigate(`/video/${video.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Updated StatBox component with dark mode support
const StatBox = ({ value, label, clickable = false, onClick, darkMode }) => (
  <div 
    className={`text-center ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
    onClick={clickable ? onClick : undefined}
  >
    <p className={`text-2xl font-bold ${
      darkMode ? "text-pink-400" : "text-pink-600"
    }`}>{value}</p>
    <p className={`text-sm ${
      darkMode ? "text-gray-400" : "text-gray-600"
    }`}>{label}</p>
  </div>
);

// Video Card Component with dark mode support
const VideoCard = ({ video, onClick, darkMode }) => (
  <div 
    onClick={onClick}
    className={`overflow-hidden transition-all rounded-xl hover:shadow-xl hover:scale-[1.02] group ${
      darkMode ? "bg-gray-800" : "bg-white"
    }`}
  >
    <div className="relative pt-[56.25%] bg-black">
      <video
        src={video.url}
        className="absolute top-0 left-0 object-cover w-full h-full"
        muted
        loop
      />
      <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
        <div className="p-3 text-white bg-black bg-opacity-50 rounded-full">
          <FaPlay className="text-xl" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <h3 className={`font-bold line-clamp-2 ${
        darkMode ? "text-white" : "text-gray-800"
      }`}>{video.title}</h3>
      <div className={`flex items-center justify-between mt-2 text-sm ${
        darkMode ? "text-gray-400" : "text-gray-600"
      }`}>
        <span>{video.like_count} likes</span>
        <span>{new Date(video.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

export default Profile;