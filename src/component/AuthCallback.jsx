import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken,updateCurrentUser } from '../redux/slicer';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

// AuthCallback.js
// AuthCallback.js
useEffect(() => {
  const token = searchParams.get('token');
  const user = searchParams.get('user');
  const error = searchParams.get('error');

  if (error) {
    navigate('/login', { state: { error } });
    return;
  }

  if (token && user) {
    try {
      const userData = JSON.parse(decodeURIComponent(user));
      
      // Dispatch an action that properly sets both token and user
      dispatch(setToken(token));
      dispatch({ 
        type: 'auth/googleLogin/fulfilled', 
        payload: { 
          token, 
          user: userData 
        } 
      });
      
      localStorage.setItem('token', token);
      navigate('/showvideo');
    } catch (err) {
      console.error('Error processing login:', err);
      navigate('/login', { state: { error: 'Login processing failed' } });
    }
  } else {
    navigate('/login', { state: { error: 'Missing authentication data' } });
  }
}, [searchParams, dispatch, navigate]);

  return <div>Processing login...</div>;
}