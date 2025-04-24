import { NavLink } from "react-router-dom";
import { FiHome, FiUser, FiCompass, FiUpload, FiGlobe, FiHeart } from "react-icons/fi";

function Sidebar() {
  return (
    <nav className="flex bg-black flex-col gap-6 p-4 text-white">
      <NavLink 
        to="/showvideo" 
        className={({ isActive }) => 
          `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800'}`
        }
      >
        <FiHome className="text-lg" />
        <span>For You</span>
      </NavLink>
      
      <NavLink 
        to="/following" 
        className={({ isActive }) => 
          `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800'}`
        }
      >
        <FiHeart className="text-lg" />
        <span>Following</span>
      </NavLink>
      
      <NavLink 
        to="/discover" 
        className={({ isActive }) => 
          `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800'}`
        }
      >
        <FiCompass className="text-lg" />
        <span>Discover</span>
      </NavLink>
      
      <NavLink 
        to="/postvideo" 
        className={({ isActive }) => 
          `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800'}`
        }
      >
        <FiUpload className="text-lg" />
        <span>Upload</span>
      </NavLink>
      
      <NavLink 
        to="/language" 
        className={({ isActive }) => 
          `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800'}`
        }
      >
        <FiGlobe className="text-lg" />
        <span>Language</span>
      </NavLink>
      
      <NavLink 
        to="/profile" 
        className={({ isActive }) => 
          `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800'}`
        }
      >
        <FiUser className="text-lg" />
        <span>Profile</span>
      </NavLink>
      <NavLink 
        to="/logout" 
        className={({ isActive }) => 
          `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800'}`
        }
      >
        <FiUser className="text-lg" />
        <span>Logout</span>
      </NavLink>
    </nav>
  );
}

export default Sidebar;