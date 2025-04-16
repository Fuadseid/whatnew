import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { postLogin } from "../redux/slicer"; // Import your Redux action

function Login() {
  const [post, setPost] = useState({
    password: "",
    email: "",
  });

  const dispatch = useDispatch();
/*   const navigate = useNavigate();
 */  const { isLoading, error } = useSelector((state) => state.auth);

  const handleInput = (e) => {
    setPost({
      ...post,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(postLogin({
        email: post.email,
        password: post.password
      }));

      if (postLogin.fulfilled.match(result)) {
        alert("Login successful");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <form
        className="bg-white shadow-xl border border-gray-200 w-full max-w-md flex flex-col space-y-4 p-9 md:p-8 rounded-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl font-bold text-gray-800 mb-4">
          Login to your account
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {typeof error === 'string' ? error : 'Login failed. Please try again.'}
          </div>
        )}

        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={post.email}
            onChange={handleInput}
            placeholder="Enter your email"
            required
            className="border border-gray-300 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={post.password}
            onChange={handleInput}
            placeholder="Enter your password"
            required
            className="border border-gray-300 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/registre" className="text-blue-600 hover:underline font-medium">
            Create Account
          </Link>
        </p>
      </form>
    </motion.div>
  );
}

export default Login;