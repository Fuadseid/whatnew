import React from 'react';
import { useDispatch } from 'react-redux';
import {  logout } from "../redux/slicer";
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
    };
  
    return (
      <button 
        onClick={handleLogout}
        className="logout-button" // Add your own styling classes
      >
        Logout
      </button>
    );
  };
  
  export default LogoutButton;