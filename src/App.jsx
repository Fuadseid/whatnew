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

function App() {
  
  return (
    <div className="flex ">
      {/*       <nav>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/postvideo">Post</Link>
        </li>
        <li>
          <Link to='/showvideo'>Show</Link>
        </li>
      </nav> */}
      <Sidebar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registertion />} />
        <Route path="/forget-password" element={<Forgetpass />} />
        <Route path="/successreg" element={<SuccessfulReg />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route element={<ProtectedRoute/>}>
          <Route path="/postvideo" element={<Postvideo />} />
          <Route path="/showvideo" element={<Showvideo />} />
        </Route>
        <Route path="/logout" element={<LogoutButton />} />
      </Routes>
    </div>
  );
}

export default App;
