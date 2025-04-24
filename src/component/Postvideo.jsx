import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postvideo, selectVideoState, resetAuthState } from "../redux/slicer";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function PostVideo() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { loading, error, success } = useSelector(selectVideoState);
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [thumbnailUrlFile, setThumbnailUrlFile] = useState(null);
  const [permissions, setPermissions] = useState({
    allow_comments: true,
    allow_shares: true,
    allow_likes: true
  });
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  // Reset success/error states when component unmounts
  useEffect(() => {
    return () => {
      if (success || error) {
        dispatch(resetAuthState());
      }
      // Clean up object URLs
      if (preview) URL.revokeObjectURL(preview);
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [success, error, dispatch, preview, thumbnailUrl]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleVideoFile(files[0]);
    }
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleVideoFile(file);
    }
  };

  const handleVideoFile = (file) => {
    if (!file.type.match("video.*")) {
      alert("Please upload a video file (MP4, MOV, or AVI)");
      return;
    }
    
    if (file.size > 60 * 1024 * 1024) {
      alert("File size exceeds 60MB limit");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        alert("Please upload an image file (JPEG, PNG)");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Thumbnail size exceeds 2MB limit");
        return;
      }

      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);

      setThumbnailUrlFile(file);
      setThumbnailUrl(URL.createObjectURL(file));
    }
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    if (!videoFile) {
      alert('Please select a video first');
      return;
    }

    if (!thumbnailUrlFile) {
      alert('Please select a thumbnail image');
      return;
    }
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('video_url', videoFile);
    formData.append('description', description);
    formData.append('thumbnail_url', thumbnailUrlFile);
    formData.append('allow_likes', permissions.allow_likes);
    formData.append('allow_comments', permissions.allow_comments);
    formData.append('allow_shares', permissions.allow_shares);
  
    try {
      const resultAction = await dispatch(postvideo(formData));
      
      if (postvideo.fulfilled.match(resultAction)) {
        handleDiscard();
        navigate('/videos');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleDiscard = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    
    setPreview(null);
    setVideoFile(null);
    setTitle("");
    setDescription("");
    setThumbnailUrl(null);
    setThumbnailUrlFile(null);
    setPermissions({
      allow_comments: true,
      allow_shares: true,
      allow_likes: true
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const dropZoneVariants = {
    initial: { scale: 1 },
    dragging: { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)" }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center min-h-[300px] p-4"
    >
      <motion.div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Video Upload Section */}
          <motion.div
            variants={itemVariants}
            animate={isDragging ? "dragging" : "initial"}
            variants={dropZoneVariants}
            className={`relative rounded-xl border-2 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-dashed border-blue-300"
            } transition-all duration-200 p-6`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full aspect-video rounded-lg overflow-hidden bg-black"
                  >
                    <video
                      src={preview}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload-prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 bg-blue-100 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </motion.div>
                    <motion.h3 
                      className="text-lg font-medium text-gray-700"
                      whileHover={{ scale: 1.01 }}
                    >
                      {isDragging
                        ? "Drop your video here"
                        : "Drag & drop your video here"}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-gray-500"
                      whileHover={{ scale: 1.01 }}
                    >
                      or
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.label 
                className="cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                  Browse files
                </span>
                <input
                  type="file"
                  name="video"
                  className="hidden"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={handleVideoChange}
                />
              </motion.label>

              <motion.p 
                className="text-xs text-gray-500 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Supported formats: MP4, MOV, AVI. Max size: 60MB
              </motion.p>
            </div>
          </motion.div>

          {/* Title Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title*
            </label>
            <motion.input
              type="text"
              name="title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={100}
              whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
            />
          </motion.div>

          {/* Description Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <motion.textarea
              name="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              required
              maxLength={500}
              whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
            />
          </motion.div>

          {/* Thumbnail Upload */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700">
              Thumbnail Image (Required)
            </label>
            <div className="flex items-center space-x-4">
              <AnimatePresence>
                {thumbnailUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-20 h-20 rounded-md overflow-hidden border border-gray-200"
                  >
                    <img 
                      src={thumbnailUrl} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'placeholder-image-url';
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.label 
                className="cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200">
                  {thumbnailUrl ? "Change Thumbnail" : "Add Thumbnail"}
                </span>
                <input
                  type="file"
                  name="thumbnail_url"
                  id="thumbnail_url"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleThumbnailChange}
                  required
                />
              </motion.label>
            </div>
            <motion.p 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Supported formats: JPG, JPEG, PNG. Max size: 2MB
            </motion.p>
          </motion.div>

          {/* Permissions */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Permissions</label>
            <ul className="space-y-2">
              {Object.entries(permissions).map(([key, value]) => (
                <motion.li 
                  key={key}
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                >
                  <input
                    type="checkbox"
                    name={key}
                    id={key}
                    checked={value}
                    onChange={handlePermissionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                    Allow {key.split('_')[1]}
                  </label>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
                key="status-message"
              >
                {error && (
                  <motion.div 
                    className="p-3 text-red-700 bg-red-50 rounded-md"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    {error.message || "Failed to upload video. Please try again."}
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    className="p-3 text-green-700 bg-green-50 rounded-md"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    Video uploaded successfully!
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-end space-x-4 pt-4"
          >
            <motion.button
              type="button"
              onClick={handleDiscard}
              disabled={loading}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Discard
            </motion.button>
            <motion.button
              type="submit"
              disabled={!preview || loading || !title || !description || !thumbnailUrl}
              className={`px-6 py-2 rounded-md flex items-center justify-center ${
                (!preview || loading || !title || !description || !thumbnailUrl) 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors duration-200 min-w-[120px]`}
              whileHover={{ 
                scale: (!preview || loading || !title || !description || !thumbnailUrl) ? 1 : 1.05 
              }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex items-center"
                >
                  <svg className="mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </motion.span>
              ) : 'Post Video'}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

export default PostVideo;