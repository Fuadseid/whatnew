import { useDispatch, useSelector } from "react-redux";
import { forgetPassword, resetAuthState } from "../redux/slicer"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Forgetpass() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { loading, error, success, emailSent } = useSelector(
    (state) => state.auth.forgetPassword
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgetPassword(email));
  };

  useEffect(() => {
    // Reset auth state when component mounts
    dispatch(resetAuthState());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl border border-gray-200 w-full max-w-md flex flex-col space-y-4 p-6 md:p-8 rounded-lg"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Forgot Password</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error.message}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Password reset link sent to {emailSent}
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium py-2 px-4 rounded-md transition-colors mt-4 flex justify-center items-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Remember your password? Login here
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default Forgetpass;