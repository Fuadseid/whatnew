import { useDispatch, useSelector } from "react-redux";
import { showvideo, selectVideoState } from "../redux/slicer";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiMusic,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaMusic,
} from "react-icons/fa";
import i18n from "../i18n/i18n";

function Showvideo() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(selectVideoState);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const containerRef = useRef();
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated ?? false
  );
  const [likedVideos, setLikedVideos] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

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
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      dispatch(showvideo())
        .unwrap()
        .then((data) => {
          console.log("Received data:", data);
          const initialStates = Array(data.length).fill(false);
          initialStates[0] = true;
          setIsPlaying(initialStates);
        })
        .catch((err) => console.error("Error:", err));
    }
  }, [dispatch, isAuthenticated, navigate]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerHeight = container.clientHeight;
      const scrollPosition = container.scrollTop;
      const newIndex = Math.round(scrollPosition / containerHeight);

      if (newIndex !== currentVideoIndex) {
        // Pause previous video
        if (videoRefs.current[currentVideoIndex]) {
          videoRefs.current[currentVideoIndex].pause();
          setIsPlaying((prev) => {
            const newState = [...prev];
            newState[currentVideoIndex] = false;
            return newState;
          });
        }

        // Play new video
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

  const toggleLike = (videoId) => {
    setLikedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
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

  const handleCommentSubmit = (e, videoId) => {
    e.preventDefault();
    // Add comment logic here
    console.log(`Comment on video ${videoId}:`, commentText);
    setCommentText("");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">
        Error: {error.message}
      </div>
    );

  if (!Array.isArray(data))
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        No data received from server
      </div>
    );

  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        No videos available
      </div>
    );

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      {/* Global styles for hiding scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Main Video Feed */}
      <div
        ref={containerRef}
        className="flex-1 h-full overflow-y-scroll scroll-smooth relative hide-scrollbar"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {data.map((video, index) => (
          <div
            key={video.id}
            className="relative w-full h-screen flex justify-center items-center"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Video Background Blur */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-lg" />

            {/* Video Player with perfect sizing */}
            <div
              className="relative w-full h-full flex justify-center items-center"
              onClick={() => togglePlayPause(index)}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                controls={false}
                autoPlay={index === 0}
                playsInline
                loop
                className="w-full h-full object-contain"
              >
                <source src={video.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Play/Pause overlay - only shown when paused */}
            {!isPlaying[index] && (
              <div
                className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                onClick={() => togglePlayPause(index)}
              >
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-all">
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

            {/* Video Info Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
              <div className="mb-6 pointer-events-auto">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-300 mb-4 text-lg">
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

              <div className="flex items-center gap-3 pointer-events-auto mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {video.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-lg">
                    @{video.user?.username || "creator"}
                  </p>
                  <p className="text-gray-300 text-sm flex items-center gap-1">
                    <FaMusic className="text-purple-400" /> Original Sound
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Right Side */}
            <div
              className={`absolute ${
                i18n.dir(i18n.language) === "rtl" ? "left-4" : "right-4"
              } bottom-1/4 flex flex-col items-center gap-6 z-20`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center">
                <button
                  className="flex flex-col items-center text-white"
                  onClick={() => toggleLike(video.id)}
                >
                  <div className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all">
                    {likedVideos[video.id] ? (
                      <FaHeart className="text-red-500 text-2xl" />
                    ) : (
                      <FaRegHeart className="text-white text-2xl" />
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">
                    {likedVideos[video.id] ? "24.6K" : "24.5K"}
                  </span>
                </button>
              </div>

              <div className="flex flex-col items-center">
                <button
                  className="flex flex-col items-center text-white"
                  onClick={() => setShowComments(!showComments)}
                >
                  <div className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all">
                    <FaComment className="text-white text-2xl" />
                  </div>
                  <span className="text-xs mt-1 font-medium">1.2K</span>
                </button>
              </div>

              <div className="flex flex-col items-center">
                <button className="flex flex-col items-center text-white">
                  <div className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all">
                    <FaShare className="text-white text-2xl" />
                  </div>
                  <span className="text-xs mt-1 font-medium">Share</span>
                </button>
              </div>

              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:shadow-lg transition-all">
                <FiMusic size={20} className="text-white" />
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div
                className={`absolute ${
                  i18n.dir(i18n.language) === "rtl" ? "left-20" : "right-20"
                } bottom-20 w-1/4 h-72 bg-black/70 rounded-lg overflow-y-scroll`}
              >
                <div className="p-4 text-white">
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => handleCommentSubmit(e, video.id)}
                  >
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full p-2 bg-gray-800 text-white rounded-md"
                      placeholder="Add a comment"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-purple-500 rounded-md text-white mt-2"
                    >
                      Post Comment
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Side Navigation */}
      <div className="w-16 bg-black flex flex-col justify-center items-center">
        <button
          onClick={() => scrollToVideo("up")}
          className="p-2 text-white hover:bg-gray-800 rounded-full mb-6"
        >
          <FiChevronUp size={24} />
        </button>
        <button
          onClick={() => scrollToVideo("down")}
          className="p-2 text-white hover:bg-gray-800 rounded-full"
        >
          <FiChevronDown size={24} />
        </button>
      </div>
    </div>
  );
}

export default Showvideo;
