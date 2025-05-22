import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { postLogin, resetAuthState} from "../redux/slicer";
import { useTranslation } from "react-i18next";


function Login() {
  const { t } = useTranslation();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(credentials.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await dispatch(postLogin(credentials)).unwrap();

      if (result) {
        navigate("/showvideo");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };





  

const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8000/auth/google';
};

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50"
    >
      <form
        className="flex flex-col w-full max-w-md p-6 space-y-4 bg-white border border-gray-200 rounded-lg shadow-xl md:p-8"
        onSubmit={handleSubmit}
      >
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">
          {t("title")}
        </h1>
        {/* Add Google Login Button */}
        <div className="mb-4">
<button
  type="button"
  onClick={handleGoogleLogin}
  disabled={isLoading}
  className="flex items-center justify-center w-full px-4 py-2 mt-4 font-medium text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
>
  <svg
    className="w-5 h-5 mr-2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.786-1.667-4.166-2.685-6.735-2.685-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.67-0.069-1.325-0.189-1.961h-9.811z" />
  </svg>
  {t("login_with_google")}
</button>
    </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-4 border-l-4 border-red-500 bg-red-50">
            <div className="flex items-center justify-between">
              <p className="text-red-700">
                {error.message ||
                  "Login failed. Please check your credentials."}
              </p>
              <button
                onClick={() => dispatch(resetAuthState())}
                className="text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t("email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleInput}
            placeholder={t("emailplaceholder")}
            className={`border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              {t("password")}
            </label>
            <Link
              to="/forget-password"
              className="text-sm text-blue-600 hover:underline"
            >
              {t("forgot")} ?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInput}
            placeholder={t("passwordPlaceholder")}
            className={`border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
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
              {t("load")}...
            </span>
          ) : (
            t("login")
          )}
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          {t("remember")}?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            {t("create")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
