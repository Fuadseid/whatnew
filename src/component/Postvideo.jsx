import React, { useState } from "react";
import { FiUpload, FiImage, FiFilm, FiCheckCircle, FiXCircle, FiYoutube } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { postvideo } from "../redux/slicer";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
function PostVideo({ onUploadComplete, label, validation, location }) {
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth.video);
  const chunkSize = 1024 * 1024; // 1MB
  const {t}= useTranslation('post');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setProgress(0);
    setError('');
  };

  const handleThumbnailChange = (event) => {
    setThumbnail(event.target.files[0]);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file || !thumbnail || !title.trim() || !description.trim()) {
      setError(t('errors.validation'));
      return;
    }

    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    setError('');

    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);
      const formData = new FormData();

      formData.append("file", chunk);  // Instead of "video_chunk"
      formData.append("filename", file.name);  // Add this      formData.append("totalChunks", totalChunks);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location); 
      formData.append("chunk", uploadedChunks);
      if (uploadedChunks === 0) {
        formData.append("thumbnail_url", thumbnail);
      }
      
      try {
        const response = await dispatch(postvideo(formData)).unwrap();

        if (uploadedChunks === totalChunks - 1) {
          if (response && response.data && response.data.file_path) {
            if (onUploadComplete) {
              onUploadComplete(response.data.file_path);
            }
          } else {
            console.error('Unexpected response structure:', response);
          }
        } else {
          console.log(`Uploaded chunk ${uploadedChunks + 1} of ${totalChunks}`);
        }
      
        uploadedChunks++;
        setProgress(Math.min((uploadedChunks / totalChunks) * 100, 100));

      } catch (error) {
        console.error("Error uploading chunk:", error);
        setError("An error occurred during upload. Check console for details.");
        break;
      }
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto border border-gray-100 shadow-xl bg-gradient-to-br from-gray-50 to-white rounded-xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
          <FiYoutube className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {label || t('header.title')}
        </h2>
        <p className="mt-2 text-lg text-gray-600">
         {t('header.subtitle')}
        </p>
      </div>

      {/* Drag and Drop Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-all ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-blue-400'} transform transition-transform duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <FiUpload className="w-12 h-12 text-blue-500" />
            <div className={`absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs transform transition-transform ${isDragActive ? 'scale-125' : 'scale-100'}`}>
              +
            </div>
          </div>
          <p className="font-medium text-gray-700">
            {file ? (
              <span className="text-blue-600">{file.name}</span>
            ) : (
              t('upload.dragDrop')
            )}
          </p>
          <p className="text-sm text-gray-500">{t('upload.requirements')}</p>
          <label 
            className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg ${file ? 'hidden' : 'block'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="relative z-10">{t('upload.selectFiles')}</span>
            <span 
              className={`absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 rounded-lg opacity-0 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            ></span>
            <input 
              type="file" 
              accept={validation} 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
        </div>
      </div>

      {/* File Preview */}
      {file && (
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 transform hover:scale-[1.005] transition-transform">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFilm className="text-xl text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={() => setFile(null)} 
            className="p-1 text-gray-400 transition-colors rounded-full hover:text-red-500 hover:bg-red-50"
          >
            <FiXCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Thumbnail Upload */}
      <div className="mb-6">
        <label className="block mb-3 text-sm font-medium text-gray-700">{t('thumbnail.label')}</label>
        <div className="flex items-center space-x-4">
          {thumbnail ? (
            <div className="relative group">
              <img 
                src={URL.createObjectURL(thumbnail)} 
                alt="Thumbnail preview" 
                className="object-cover w-20 h-20 transition-colors border border-gray-200 rounded-lg group-hover:border-blue-300"
              />
              <button 
                onClick={() => setThumbnail(null)} 
                className="absolute p-1 text-gray-400 transition-colors bg-white rounded-full shadow-sm -top-2 -right-2 hover:text-red-500"
              >
                <FiXCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-20 h-20 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400 group">
              <div className="p-2 transition-colors bg-gray-100 rounded-full group-hover:bg-blue-50">
                <FiImage className="text-gray-400 transition-colors group-hover:text-blue-500" />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleThumbnailChange} 
              />
            </label>
          )}
          <div className="text-sm text-gray-500">
            {thumbnail ? (
              <span>{t('thumbnail.change')}</span>
            ) : (
              <span>{t('thumbnail.placeholder')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-5">
        <label className="flex items-center mb-2 text-sm font-medium text-gray-700 ">
          <span>{t('form.title.label')}</span>
          <span className="ml-1 text-xs text-gray-400">{t('form.required')}</span>
        </label>
        <input
          type="text"
          placeholder={t('form.title.placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500">{t('form.title.hint')}</p>
      </div>

      {/* Description Input */}
      <div className="mb-7">
        <label className="flex items-center mb-2 text-sm font-medium text-gray-700 ">
          <span>{t('form.description.label')}</span>
          <span className="ml-1 text-xs text-gray-400">{t('form.required')}</span>
        </label>
        <textarea
          placeholder={t('form.description.placeholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
          rows="4"
        />
        <p className="mt-1 text-xs text-gray-500">{t('form.description.hint')}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 mb-5 text-sm text-red-700 border border-red-100 rounded-lg bg-red-50">
          <FiXCircle className="flex-shrink-0 mr-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Bar */}
      {progress > 0 && progress < 100 && (
        <div className="mb-6 animate-pulse">
          <div className="flex justify-between mb-2 text-sm text-gray-600">
            <span>{t('progress.uploading')}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">This may take a few moments. Please don't close this window.</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        className={`w-full py-3.5 px-4 flex items-center justify-center rounded-xl text-white font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${loading ? 'bg-blue-400 cursor-not-allowed from-blue-400 to-blue-400' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'}`}
        onClick={uploadFile}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('upload.uploading')}
          </>
        ) : (
          <>
            <FiUpload className="w-5 h-5 mr-2" />
            <span className="text-lg">{t('upload.postButton')}</span>
          </>
        )}
      </button>

      {/* Success Message */}
      {progress === 100 && (
        <div className="flex items-center p-4 mt-5 text-sm text-green-700 border border-green-100 rounded-lg bg-green-50 animate-in fade-in">
          <FiCheckCircle className="flex-shrink-0 w-5 h-5 mr-3" />
          <div>
            <p className="font-medium">{t('upload.success')}</p>
            <p className="mt-1 text-xs text-green-600">{t('upload.processing')}</p>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {!file && (
        <div className="pt-6 mt-8 border-t border-gray-100">
          <h3 className="mb-3 text-sm font-medium text-gray-500">{t('tips.title')}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>{t('tips.items.quality')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>{t('tips.items.duration')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>{t('tips.items.description')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>{t('tips.items.thumbnail')}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PostVideo;