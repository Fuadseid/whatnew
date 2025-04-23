import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, resetAuthState } from "../redux/slicer"
import { useEffect, useState } from "react";

function Reset() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [credentials, setCredentials] = useState({
    email: searchParams.get("email") || "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const { loading, error, success } = useSelector((state) => state.auth.resetPassword);
  const token = searchParams.get("token");

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.email) newErrors.email = "Email is required";
    if (!credentials.password) newErrors.password = "Password is required";
    if (credentials.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (credentials.password !== credentials.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(
        resetPassword({
          ...credentials,
          token,
        })
      );
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-xl border border-gray-200 flex flex-col space-y-4 p-6 md:p-8 rounded-lg">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">
              Password reset successful! You can now login with your new password.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-xl border border-gray-200 flex flex-col space-y-4 p-6 md:p-8 rounded-lg"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error.message}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleInput}
            disabled={!!searchParams.get("email")}
            placeholder="your.email@example.com"
            className={`border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full`}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            New Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInput}
            placeholder="Enter your new password"
            className={`border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full`}
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
            Confirm Password *
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={credentials.password_confirmation}
            onChange={handleInput}
            placeholder="Confirm your new password"
            className={`border ${
              errors.password_confirmation ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full`}
          />
          {errors.password_confirmation && (
            <p className="text-red-500 text-xs">{errors.password_confirmation}</p>
          )}
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
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Reset;