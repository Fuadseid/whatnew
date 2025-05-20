import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import  logo  from "../assets/logo-transparent-png.png";
import { 
  FiHome, 
  FiUser, 
  FiCompass, 
  FiUpload, 
  FiGlobe, 
  FiHeart,
  FiLogOut,
  FiPlusCircle,
  FiMenu
} from "react-icons/fi";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/slicer";

function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [activeHover, setActiveHover] = useState(null);
  const { t } = useTranslation('Sidebar');
  const currentUser = useSelector(selectCurrentUser);


  const navItems = [
    { to: "/showvideo", icon: <FiHome />, label: t('navItems.forYou') },
    { to: "/following", icon: <FiHeart />, label: t('navItems.following') },
    { to: "/discover", icon: <FiCompass />, label: t('navItems.discover'), highlight: true },
    { to: "/upload", icon: <FiUpload />, label: t('navItems.upload') },
    { to: "/language", icon: <FiGlobe />, label: t('navItems.language') },
    { 
      
      to: currentUser? `/profile/${currentUser.id}` : "/login", 
      icon: <FiUser />, 
      label: t("navItems.profile") 
    },
    { to: "/logout", icon: <FiLogOut />, label: t('navItems.logout') },
  ];

  // Animation variants
  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" }
  };

  const navItemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  const tooltipVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const highlightBadgeVariants = {
    initial: { scale: 0 },
    animate: { scale: 1, transition: { type: "spring", stiffness: 500 } },
    exit: { scale: 0 }
  };

  return (
    <div
      initial={false}
      animate={expanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      className="sticky top-0 flex flex-col h-screen px-6 overflow-hidden text-white bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Header */}

      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          {/* {expanded && (
            <h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text"
            >
              {t('appName')}
            </h1>
          )} */}
          {expanded && (
            <img src={logo} className="w-auto h-12" /> // Show just the logo when collapsed
          )}

        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 transition-colors rounded-lg hover:bg-gray-800"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiMenu className="text-xl" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-grow gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex items-center gap-3 py-4 px-0  rounded-lg transition-all
              ${isActive ? 'bg-purple-900/50 text-white' : 'hover:bg-gray-800/50 text-gray-300'}
              ${item.highlight ? 'mt-4' : ''}
              ${expanded ? 'justify-start' : 'justify-center'}
            `}
            onMouseEnter={() => setActiveHover(item.to)}
            onMouseLeave={() => setActiveHover(null)}
          >
            <div>
              {item.highlight && expanded && (
                <span
                  variants={highlightBadgeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`absolute -top-1 left-[60%] transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full`}
                >
                  {t("newBadge")}
                </span>
              )}
            </div>
            
            <span
              className={`${item.highlight ? 'text-purple-400' : ''} text-xl`}
              animate={{
                scale: activeHover === item.to ? 1.1 : 1,
                rotate: activeHover === item.to ? [0, 10, -10, 0] : 0
              }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {item.icon}
            </span>
            
            <div>
              {expanded && (
                <span
                  variants={navItemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.label}
                </span>
              )}
            </div>
            
            <div>
              {!expanded && activeHover === item.to && (
                <div
                  variants={tooltipVariants}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute px-3 py-2 ml-4 text-sm text-white bg-gray-900 rounded-md shadow-lg left-full whitespace-nowrap"
                >
                  {item.label}
                </div>
              )}
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Collapsed Tooltip */}
      <div>
        {!expanded && (
          <div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
            className="absolute px-3 py-2 ml-2 text-sm text-white transform -translate-y-1/2 bg-gray-900 rounded-md shadow-lg left-full top-1/2"
          >
            {t('expandTooltip')}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className={`p-4 border-t border-gray-800 flex items-center ${expanded ? 'gap-3' : 'justify-center'}`}>
        <div
          className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiUser />
        </div>
        <div>
          {expanded && (
            <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="font-medium truncate">{t('user.username')}</p>
              <p className="text-xs text-gray-400 truncate">{t('user.handle')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;