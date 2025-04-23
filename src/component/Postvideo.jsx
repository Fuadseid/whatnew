import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postvideo, selectVideoState, resetAuthState } from "../redux/slicer";
import { useNavigate } from "react-router-dom";

function PostVideo() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    
    // Check file size (60MB max)
    if (file.size > 60 * 1024 * 1024) {
      alert("File size exceeds 60MB limit");
      return;
    }

    // Clean up previous preview if exists
    if (preview) URL.revokeObjectURL(preview);

    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if image file
      if (!file.type.match("image.*")) {
        alert("Please upload an image file (JPEG, PNG)");
        return;
      }

      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert("Thumbnail size exceeds 2MB limit");
        return;
      }

      // Clean up previous preview if exists
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);

      setThumbnailUrlFile(file);
      setThumbnailUrl(URL.createObjectURL(file));
    }
  };
   const checked = true;
  const handlePermissionChange = (e) => {
    const { name,  } = e.target;
    setPermissions(prev => ({
      ...prev,
      [name]: !checked
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
        // Success case
        handleDiscard();
        navigate('/videos'); // Redirect after successful upload
      }
    } catch (err) {
      console.error('Upload error:', err);
      // Error is already handled by the reducer
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

  return (
    <div className="flex justify-center items-center min-h-[300px] p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload Section */}
          <div
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
              {preview ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <>
                  <div className="p-4 bg-blue-100 rounded-full">
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
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">
                    {isDragging
                      ? "Drop your video here"
                      : "Drag & drop your video here"}
                  </h3>
                  <p className="text-sm text-gray-500">or</p>
                </>
              )}

              <label className="cursor-pointer">
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
              </label>

              <p className="text-xs text-gray-500 text-center">
                Supported formats: MP4, MOV, AVI. Max size: 60MB
              </p>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title*
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={100}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <textarea
              name="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              required
              maxLength={500}
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700">
              Thumbnail Image (Required)
            </label>
            <div className="flex items-center space-x-4">
              {thumbnailUrl && (
                <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                  <img 
                    src={thumbnailUrl} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'placeholder-image-url';
                    }}
                  />
                </div>
              )}
              <label className="cursor-pointer">
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
              </label>
            </div>
            <p className="text-xs text-gray-500">Supported formats: JPG, JPEG, PNG. Max size: 2MB</p>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Permissions</label>
            <ul className="space-y-2">
              <li className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_likes"
                  id="allow_likes"
                  checked={permissions.allow_likes}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allow_likes" className="ml-2 text-sm text-gray-700">
                  Allow likes
                </label>
              </li>
              <li className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_comments"
                  id="allow_comments"
                  checked={permissions.allow_comments}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allow_comments" className="ml-2 text-sm text-gray-700">
                  Allow comments
                </label>
              </li>
              <li className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_shares"
                  id="allow_shares"
                  checked={permissions.allow_shares}
                  onChange={handlePermissionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allow_shares" className="ml-2 text-sm text-gray-700">
                  Allow shares
                </label>
              </li>
            </ul>
          </div>

          {/* Status Messages */}
          <div className="space-y-2">
            {error && (
              <div className="p-3 text-red-700 bg-red-50 rounded-md">
                {error.message || "Failed to upload video. Please try again."}
              </div>
            )}
            {success && (
              <div className="p-3 text-green-700 bg-green-50 rounded-md">
                Video uploaded successfully!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={loading}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!preview || loading || !title || !description || !thumbnailUrl}
              className={`px-6 py-2 rounded-md flex items-center justify-center ${
                (!preview || loading || !title || !description || !thumbnailUrl) 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors duration-200 min-w-[120px]`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : 'Post Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostVideo;