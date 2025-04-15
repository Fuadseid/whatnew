import axios from "axios";
import { useState } from "react";

const api = axios.create({
  baseURL: `http://localhost:8000/api`,
});

function Login() {
  const [post, setPost] = useState({
    password: "",
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
        "/login",
        {
          password: post.password,
          email: post.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        alert("Login successful");
        setPost({
          password: "",
          email: "",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed. Please try again.");
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={post.email}
          onChange={handleInput}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={post.password}
          onChange={handleInput}
          placeholder="Password"
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
