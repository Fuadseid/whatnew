import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Login from "./component/Login";
import Registertion from "./component/Registertion";
import Home from "./Home";
import Forgetpass from "./component/Forgetpass";
import SuccessfulReg from "./component/SuccessfulReg";
import Reset from "./component/Reset";
import Postvideo from "./component/Postvideo";
import Showvideo from "./component/Showvideo";
import Sidebar from "./component/Sidebar";
import LogoutButton from "./component/LogoutButton";
import ProtectedRoute from "./component/ProtectedRoute";
import Language from "./component/Language";
import Discovery from "./component/Discovery";
import Following from "./component/Following";
import Profile from "./component/Profile";
import PubProfile from "./component/PubProfile";
import AuthCallback from "./component/AuthCallback";
function App() {
  
  return (
    
    <div className="flex ">
      <Sidebar />
      <div className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registertion />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forget-password" element={<Forgetpass />} />
          <Route path="/successreg" element={<SuccessfulReg />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<Postvideo />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/showvideo" element={<Showvideo />} />
            <Route path="/language" element={<Language />} />
            <Route path="/following" element={<Following />} />
            {/* <Route path="/foryou" element={<ForYouPage />} /> */}
            <Route path="discover" element={<Discovery />} />
            <Route path="/pubprofile/:id" element={<PubProfile />} />
          </Route>
          <Route path="/logout" element={<LogoutButton />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
