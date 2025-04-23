import { useDispatch, useSelector } from "react-redux";
import { showvideo, selectVideoState } from "../redux/slicer";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiMusic,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";

function Showvideo() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(selectVideoState);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const containerRef = useRef();
  const [isPlaying, setIsPlaying] = useState(() => {
    const initialStates = Array(data?.length || 0).fill(false);
    initialStates[0] = true; 
    return initialStates;
  });
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    dispatch(showvideo())
      .unwrap()
      .then((data) => {
        console.log("Received data:", data);
        const initialStates = Array(data.length).fill(false);
        initialStates[0] = true;
        setIsPlaying(initialStates);
      })
      .catch((err) => console.error("Error:", err));
  }, [dispatch]);

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

      // Hide scroll indicator after first scroll
      if (scrollPosition > 10) {
        setShowScrollIndicator(false);
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent border-purple-500 rounded-full"
        />
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
    <div className="flex h-screen w-full bg-black">
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
        {/* Scroll indicators (shown only initially) */}
        {showScrollIndicator && (
          <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col items-center gap-4">
            <motion.div
              animate={{ y: [-5, 5] }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
              }}
              className="text-white/80"
            >
              <FiChevronUp size={24} />
            </motion.div>
            <span className="text-white/80 text-xs">Scroll</span>
            <motion.div
              animate={{ y: [5, -5] }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
              }}
              className="text-white/80"
            >
              <FiChevronDown size={24} />
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {data.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-screen flex justify-center items-center"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Video Player with perfect sizing */}
              <div
                className="relative w-full h-full flex justify-center items-center bg-black"
                onClick={() => togglePlayPause(index)}
              >
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  controls={false}
                  muted
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

              <div
                className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                onClick={() => togglePlayPause(index)}
              >
                {!isPlaying[index] && (
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-all">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.8L17 10l-10.7 7.2V2.8z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Video Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 pointer-events-auto"
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{video.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>Credibility: {video.credibility_score}%</span>
                    <span>Duration: {video.duration_seconds}s</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-3 pointer-events-auto"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {video.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      @{video.user?.username || "creator"}
                    </p>
                    <p className="text-gray-300 text-sm">Original Sound</p>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons - Right Side */}
              <div
                className="absolute right-4 bottom-1/4 flex flex-col items-center gap-6 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  className="flex flex-col items-center text-white"
                >
                  <div className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all">
                    <FiHeart size={24} />
                  </div>
                  <span className="text-xs mt-1">24.5K</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 1.2 }}
                  className="flex flex-col items-center text-white"
                >
                  <div className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all">
                    <FiMessageSquare size={24} />
                  </div>
                  <span className="text-xs mt-1">1.2K</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 1.2 }}
                  className="flex flex-col items-center text-white"
                >
                  <div className="p-3 bg-black/30 rounded-full hover:bg-black/50 transition-all">
                    <FiShare2 size={24} />
                  </div>
                  <span className="text-xs mt-1">Share</span>
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-all"
                >
                  <FiMusic size={20} className="text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Right Sidebar with Scroll Controls */}
      <div className="w-16 md:w-20 h-full flex flex-col items-center justify-between py-8 bg-black/30 border-l border-gray-800 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToVideo("up")}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
        >
          <FiChevronUp size={24} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToVideo("down")}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
        >
          <FiChevronDown size={24} />
        </motion.button>
      </div>
    </div>
  );
}

export default Showvideo;
