import axios from "axios";
import { useState } from "react";

const api = axios.create({
  baseURL: `http://localhost:8000/api`,
});

function Registertion() {
 
    const [post, setPost] = useState({
        name:'',
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
          const res = await api.post("/register", {
         
            name:post.name,
            username: post.username,
            password: post.password,
            password_confirmation: post.confirm_password,
            user_type: post.user_type,
            email: post.email,
          },  { headers: {
            'Content-Type': 'application/json',
          },});
    
          if (res.status === 200) {
            alert("Registration successful");
            setPost({
              name:'',
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
        <div>
          <form onSubmit={handleSubmit}>
          <input
              type="text"
              name="name"
              value={post.name}
              onChange={handleInput}
              placeholder="name"
              required
            />
            <input
              type="text"
              name="username"
              value={post.username}
              onChange={handleInput}
              placeholder="Username"
              required
            />
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
            <input
              type="password"
              name="confirm_password"
              value={post.confirm_password}
              onChange={handleInput}
              placeholder="Confirm Password"
              required
            />
            <select 
              name="user_type"
              value={post.user_type}
              onChange={handleInput}
            >
              <option value="news_enthusiast">News Enthusiast</option>
              <option value="content_creator">Content Creator</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Register</button>
          </form>
        </div>
      );
    
}

export default Registertion
