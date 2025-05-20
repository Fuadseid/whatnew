import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from "../redux/slicer";
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showConfirmation, setShowConfirmation] = useState(true);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };
    


    // This assumes your sidebar item has its own styling
    return (
        <>
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
                        <h3 className="mb-3 text-xl font-semibold text-red-500">Logout Request</h3>
                        <p className="mb-6 text-gray-700">Are you sure you want to logout?</p>
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 text-white transition-colors duration-200 bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                            >
                                Yes, Logout
                            </button>
                            <button 
                                onClick={() => {
                                    setShowConfirmation(false);
                                    navigate(-1);
                                }}
                                className="px-4 py-2 text-gray-700 transition-colors duration-200 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LogoutButton;