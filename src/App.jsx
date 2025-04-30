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

function App() {
  return (
    <div className="flex ">
      <Sidebar />
      <div className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registertion />} />
          <Route path="/forget-password" element={<Forgetpass />} />
          <Route path="/successreg" element={<SuccessfulReg />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/postvideo" element={<Postvideo />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/showvideo" element={<Showvideo />} />
            <Route path="/language" element={<Language />} />
            <Route path="/following" element={<Following />} />
            <Route path="discover" element={<Discovery />} />
          </Route>
          <Route path="/logout" element={<LogoutButton />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
