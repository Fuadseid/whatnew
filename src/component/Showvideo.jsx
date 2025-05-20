import { useDispatch, useSelector } from "react-redux";
import { showvideo, selectVideoState, checkAuth } from "../redux/slicer";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaMusic,
  FaUserCircle,
} from "react-icons/fa";
import i18n from "../i18n/i18n";
import axios from "axios";

function Showvideo() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(selectVideoState);
  const auth = useSelector(state => state.auth);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const containerRef = useRef();
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated ?? false
  );
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [likingVideo, setLikingVideo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);

  const [isPlaying, setIsPlaying] = useState(() => {
    const initialStates = Array(data?.length || 0).fill(false);
    initialStates[0] = true;
    return initialStates;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    if (!isAuthenticated) {
      dispatch(checkAuth())
        .unwrap()
        .then(() => dispatch(showvideo()))
        .catch(() => navigate("/login"));
    } else {
      dispatch(showvideo());
    }
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerHeight = container.clientHeight;
      const scrollPosition = container.scrollTop;
      const newIndex = Math.round(scrollPosition / containerHeight);

      if (newIndex !== currentVideoIndex) {
        if (videoRefs.current[currentVideoIndex]) {
          videoRefs.current[currentVideoIndex].pause();
          setIsPlaying((prev) => {
            const newState = [...prev];
            newState[currentVideoIndex] = false;
            return newState;
          });
        }

        setCurrentVideoIndex(newIndex);
        if (videoRefs.current[newIndex]) {
          videoRefs.current[newIndex]
            .play()
            .catch((e) => console.log("Autoplay prevented:", e));
          setIsPlaying((prev) => {
            const newState = [...prev];
            newState[newIndex] = true;
            return newState;
          });
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentVideoIndex, data]);

  const togglePlayPause = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play().catch((e) => console.log("Play prevented:", e));
        setIsPlaying((prev) => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      } else {
        video.pause();
        setIsPlaying((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      }
    }
  };

const toggleLike = async (videoId) => {
  if (likingVideo) return;
  
  try {
    setLikingVideo(true);
    const token = localStorage.getItem("token");
    
    const video = data.find(v => v.id === videoId);
    const isLiked = hasUserLiked(videoId);
    
    let response;
    
    if (isLiked) {
      response = await axios.post(
        `http://localhost:8000/api/unlike/${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else {
      response = await axios.post(
        `http://localhost:8000/api/like/${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    dispatch({
      type: "auth/updateVideoLikes",
      payload: {
        videoId,
        likeCount: response.data.likes_count,
        isLiked: !isLiked,
        userId: auth.user?.id
      }
    });

  } catch (error) {
    console.error("Error toggling like:", error);
  } finally {
    setLikingVideo(false);
  }
};

// In your Showvideo component

// Update the hasUserLiked function to be more robust
const hasUserLiked = (videoId) => {
  const video = data?.find(v => v.id === videoId);
  
  // First check for explicit is_liked flag
  if (typeof video?.is_liked === 'boolean') {
    return video.is_liked;
  }
  
  // Fallback to checking likes array
  if (video?.likes && auth.user?.id) {
    return video.likes.some(like => like.user_id === auth.user.id);
  }
  
  return false;
};
  const getLikeCount = (videoId) => {
    const video = data?.find(v => v.id === videoId);
    return video?.like_count || 0;
  };

  const scrollToVideo = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const newScrollPosition =
      direction === "up"
        ? Math.max(container.scrollTop - containerHeight, 0)
        : container.scrollTop + containerHeight;

    container.scrollTo({
      top: newScrollPosition,
      behavior: "smooth",
    });
  };

  const getVideoComments = (videoId) => {
    const video = data?.find(v => v.id === videoId);
    return video?.comments || [];
  };

  const toggleComments = (videoId) => {
    setShowComments((prev) => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const handleCommentSubmit = async (e, videoId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      setPostingComment(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/comment/${videoId}`,
        { comment: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      dispatch({
        type: "auth/updateVideoWithComment",
        payload: {
          videoId,
          comment: response.data.comment
        }
      });

      setCommentText("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 bg-gray-900">
        Error: {error.message}
      </div>
    );

  if (!Array.isArray(data))
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        No data received from server
      </div>
    );

  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        No videos available
      </div>
    );

  return (
    <div className="flex w-full h-screen overflow-hidden bg-black">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div
        ref={containerRef}
        className="relative flex-1 h-full overflow-y-scroll scroll-smooth hide-scrollbar"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {data.map((video, index) => (
          <div
            key={video.id}
            className="relative flex items-center justify-center w-full h-screen"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-lg" />

            <div
              className="relative flex items-center justify-center w-full h-full"
              onClick={() => togglePlayPause(index)}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                controls={false}
                autoPlay={index === 0}
                playsInline
                loop
                className="object-contain w-full h-full"
              >
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {!isPlaying[index] && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
                onClick={() => togglePlayPause(index)}
              >
                <div className="flex items-center justify-center w-20 h-20 transition-all rounded-full bg-black/50 hover:bg-black/70">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.8L17 10l-10.7 7.2V2.8z" />
                  </svg>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex flex-col justify-end p-6 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div className="mb-6 pointer-events-auto">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  {video.title}
                </h3>
                <p className="mb-4 text-lg text-gray-300">
                  {video.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex flex-col w-full max-w-[200px]">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${video.credibility_score}%` }}
                      ></div>
                    </div>
                    <span>{video.credibility_score}% Credible</span>
                  </div>
                  <span>⏱️ {video.duration_seconds}s</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8 pointer-events-auto">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <span className="text-xl font-bold text-white">
                    {video.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-medium text-white">
                    @{video.user?.username || "creator"}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-gray-300">
                    <FaMusic className="text-purple-400" /> Original Sound
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`absolute ${
                i18n.dir(i18n.language) === "rtl" ? "left-4" : "right-4"
              } bottom-1/4 flex flex-col items-center gap-6 z-20`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    navigate("/login");
                    return;
                  }
                  if (video?.user?.id) {
                    navigate(`/pubprofile/${video.user.id}`);
                  } else {
                    console.warn("No user ID available for this video");
                  }
                }}
                className="flex flex-col items-center group"
              >
                <div className="p-3 transition-all rounded-full bg-black/30 hover:bg-black/50 group-hover:scale-110">
                  <FaUserCircle className="text-2xl text-white" />
                </div>
                <span className="mt-1 text-xs font-medium">Profile</span>
              </button>

              <div className="flex flex-col items-center">
            <button
              className="flex flex-col items-center text-white"
              onClick={() => toggleLike(video.id)}
              disabled={likingVideo}
            >
              <div className="p-3 transition-all rounded-full bg-black/30 hover:bg-black/50">
                {hasUserLiked(video.id) ? (
                  <FaHeart className="text-2xl text-red-500" />
                ) : (
                  <FaRegHeart className="text-2xl text-white" />
                )}
              </div>
              <span className="mt-1 text-xs font-medium">
                {getLikeCount(video.id).toLocaleString()}
              </span>
            </button>
              </div>

              <div className="flex flex-col items-center">
                <button
                  className="flex flex-col items-center text-white"
                  onClick={() => toggleComments(video.id)}
                >
                  <div className="p-3 transition-all rounded-full bg-black/30 hover:bg-black/50">
                    <FaComment className="text-2xl text-white" />
                  </div>
                  <span className="mt-1 text-xs font-medium">
                    {getVideoComments(video.id).length || "0"}
                  </span>
                </button>
              </div>

              <div className="flex flex-col items-center">
                <button className="flex flex-col items-center text-white">
                  <div className="p-3 transition-all rounded-full bg-black/30 hover:bg-black/50">
                    <FaShare className="text-2xl text-white" />
                  </div>
                  <span className="mt-1 text-xs font-medium">Share</span>
                </button>
              </div>

              <div className="flex items-center justify-center w-12 h-12 transition-all rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg">
                <FaMusic size={20} className="text-white" />
              </div>
            </div>

            {showComments[video.id] && (
              <div
                className={`absolute ${
                  i18n.dir(i18n.language) === "rtl" ? "left-20" : "right-20"
                } bottom-20 w-1/4 h-72 bg-black/70 rounded-lg overflow-hidden flex flex-col border border-gray-700`}
              >
                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                  <h3 className="font-semibold text-white">Comments</h3>
                  <button 
                    onClick={() => setShowComments(prev => ({ ...prev, [video.id]: false }))}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {getVideoComments(video.id).length > 0 ? (
                    getVideoComments(video.id).map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-2 text-white"
                      >
                        <div className="flex-shrink-0">
                          {comment.user?.profile_picture ? (
                            <img
                              src={comment.user.profile_picture}
                              alt={comment.user.name}
                              className="object-cover w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full">
                              <span className="text-xs">
                                {comment.user?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">
                            @{comment.user?.username || "user"}
                          </div>
                          <div className="text-sm">{comment.comment}</div>
                          <div className="mt-1 text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-400">
                      No comments yet
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => handleCommentSubmit(e, video.id)}
                  className="p-3 border-t border-gray-700"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm text-white bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Add a comment..."
                      disabled={postingComment}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || postingComment}
                      className="px-4 py-2 text-sm text-white bg-purple-500 rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postingComment ? "Posting..." : "Post"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center w-16 bg-black">
        <button
          onClick={() => scrollToVideo("up")}
          className="p-2 mb-6 text-white rounded-full hover:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
        <button
          onClick={() => scrollToVideo("down")}
          className="p-2 text-white rounded-full hover:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Showvideo;