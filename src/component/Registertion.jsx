import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const api = axios.create({
  baseURL: `http://localhost:8000/api`,
});

function Registertion() {
  const [post, setPost] = useState({
    name: "",
    username: "",
    password: "",
    confirm_password: "",
    user_type: "news_enthusiast",
    email: "",
  });

  const handleInput = (e) => {
    setPost({
      ...post,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        "/register",
        {
          name: post.name,
          username: post.username,
          password: post.password,
          password_confirmation: post.confirm_password,
          user_type: post.user_type,
          email: post.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        alert("Registration successful");
        setPost({
          name: "",
          username: "",
          password: "",
          confirm_password: "",
          user_type: "news_enthusiast",
          email: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
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
        className="bg-white shadow-xl border-2 border-gray-200 w-full max-w-md md:max-w-lg lg:max-w-xl flex flex-col space-y-4 p-9 md:p-8 rounded-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-xl font-bold text-[#101828] mb-2">
          Create account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={post.name}
              onChange={handleInput}
              placeholder="Your full name"
              required
              className="border border-gray-300 transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={post.username}
              onChange={handleInput}
              placeholder="Choose a username"
              required
              className="border border-gray-300 transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md text-sm"
            />
          </div>
        </div>

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
            placeholder="your.email@example.com"
            required
            className="border border-gray-300 transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={post.password}
              onChange={handleInput}
              placeholder="Create password"
              required
              className="border border-gray-300 transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={post.confirm_password}
              onChange={handleInput}
              placeholder="Confirm password"
              required
              className="border border-gray-300 transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="user_type" className="text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="user_type"
            name="user_type"
            value={post.user_type}
            onChange={handleInput}
            className="border border-gray-300 transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded-md text-sm"
          >
            <option value="news_enthusiast">News Enthusiast</option>
            <option value="content_creator">Content Creator</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
        >
          Register
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}

export default Registertion;