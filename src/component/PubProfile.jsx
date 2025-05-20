import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProfile, 
  clearProfile, 
  followUser, 
  unfollowUser,
  updateProfileUser,
  updateCurrentUser
} from '../redux/slicer';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaMusic, 
  FaUserPlus, 
  FaPlay,
  FaCheck 
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const PubProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const {
    user: profileUser,
    videos,
    likes,
    loading,
    error,
    followError
  } = useSelector((state) => state.auth.profile);

  const currentUser = useSelector((state) => state.auth.user);
  const isCurrentUser = currentUser && currentUser.id === parseInt(id);

  // Get following status from profile data (comes from backend)
  const isFollowing = profileUser?.is_following || false;

  useEffect(() => {
    dispatch(fetchProfile(id));
    return () => dispatch(clearProfile());
  }, [dispatch, id]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        const result = await dispatch(unfollowUser(profileUser.id)).unwrap();
        // Update profile user
        dispatch(updateProfileUser({
          ...profileUser,
          followers_count: result.followers_count,
          is_following: false
        }));
        // Update current user's following list
        if (currentUser.following) {
          dispatch(updateCurrentUser({
            following: currentUser.following.filter(user => user.id !== profileUser.id),
            following_count: result.following_count
          }));
        }
      } else {
        const result = await dispatch(followUser(profileUser.id)).unwrap();
        // Update profile user
        dispatch(updateProfileUser({
          ...profileUser,
          followers_count: result.followers_count,
          is_following: true
        }));
        // Update current user's following list
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-12 h-12 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  );

  if (error && !followError) return (
    <div className="flex items-center justify-center min-h-screen p-4 text-red-500 bg-gray-900">
      <div className="p-4 bg-gray-800 rounded-lg">
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

  if (!profileUser) return (
    <div className="flex items-center justify-center min-h-screen p-4 text-white bg-gray-900">
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
    <div className="min-h-screen text-white bg-gray-900">
      {/* Enhanced Cover Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-purple-900 via-pink-700 to-indigo-800"></div>
        
        <div className="container relative px-4 mx-auto -mt-16 md:px-6">
          <div className="flex flex-col items-center gap-6 p-6 bg-gray-800 shadow-2xl rounded-xl md:flex-row">
            {/* Profile Picture with Ring */}
            <div className="relative group">
              <div className="absolute inset-0 transition-all duration-300 rounded-full opacity-75 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:opacity-100 blur-md"></div>
              <img 
                src={profileUser.profile_picture || '/default-avatar.png'} 
                alt={profileUser.name}
                className="relative z-10 w-32 h-32 border-4 border-gray-900 rounded-full"
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col justify-between md:flex-row md:items-end">
                <div>
                  <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                  <p className="text-lg text-pink-400">@{profileUser.username}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                  {isCurrentUser ? (
                    <button 
                      onClick={() => navigate('/settings')}
                      className="px-6 py-2 font-medium transition-all bg-gray-700 rounded-full hover:bg-gray-600 hover:shadow-lg"
                    >
                      Edit Profile
                    </button>
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
                <StatBox value={videos.length} label="Videos" />
                <StatBox value={likes} label="Likes" />
                <StatBox value={profileUser.followers_count || 0} label="Followers" />
                <StatBox value={profileUser.following_count || 0} label="Following" />
              </div>
              
              {/* Bio */}
              {profileUser.bio && (
                <p className="mt-4 text-gray-300">
                  {profileUser.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="container px-4 py-12 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {isCurrentUser ? 'Your Videos' : 'Videos'}
          </h2>
          {isCurrentUser && (
            <button 
              onClick={() => navigate('/upload')}
              className="px-4 py-2 text-sm font-medium transition-all bg-pink-600 rounded-lg hover:bg-pink-700 hover:shadow-lg"
            >
              Upload New Video
            </button>
          )}
        </div>
        
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-800 rounded-xl">
            <p className="mb-4 text-xl text-gray-400">
              {isCurrentUser ? 'Start sharing your videos!' : 'No videos yet'}
            </p>
            {isCurrentUser && (
              <button 
                onClick={() => navigate('/upload')}
                className="px-6 py-3 font-medium text-white transition-all bg-pink-600 rounded-lg hover:bg-pink-700 hover:shadow-lg"
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
                onClick={() => navigate(`/video/${video.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Stat Component
const StatBox = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-pink-400">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

// Reusable Video Card Component
const VideoCard = ({ video, onClick }) => (
  <div 
    onClick={onClick}
    className="overflow-hidden transition-all bg-gray-800 rounded-xl cursor-pointer hover:shadow-xl hover:scale-[1.02] group"
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
      <h3 className="font-bold line-clamp-2">{video.title}</h3>
      <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
        <span>{video.like_count} likes</span>
        <span>{new Date(video.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

export default PubProfile;
