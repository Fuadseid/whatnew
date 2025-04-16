import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Login from "./component/Login";
import Registertion from "./component/Registertion";
import Home from "./Home";

function App() {
  return (
    <>
      <nav>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/registre">Register</Link>
        </li>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registre" element={<Registertion />} />
      </Routes>
    </>
  );
}

export default App;
