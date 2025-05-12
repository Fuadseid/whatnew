import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { postRegister, resetAuthState } from "../redux/slicer";
import { useTranslation } from "react-i18next";
import { googleLogin } from "../redux/slicer"; 
function Registration() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirm_password: "",
    user_type: "news_enthusiast",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { t } = useTranslation("Create");
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  const handleGoogleLogin = async () => {
    try {
      // Open Google login in a new window
      const googleWindow = window.open(
        "http://localhost:8000/google/redirect",
        "_blank",
        "width=500,height=600"
      );

      // Listen for message from the popup
      const handleMessage = (event) => {
        // Check origin for security
        if (event.origin !== "http://localhost:8000") return;

        if (event.data.token && event.data.user) {
          // Dispatch the googleLogin action
          dispatch(
            googleLogin({ token: event.data.token, user: event.data.user })
          )
            .unwrap()
            .then(() => {
              navigate("/showvideo"); // Redirect to showvideo page
            });

          // Clean up the event listener
          window.removeEventListener("message", handleMessage);
          googleWindow.close();
        }
      };

      window.addEventListener("message", handleMessage, false);
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirm_password, // Laravel expects this field name
      user_type: formData.user_type,
    };

    try {
      const result = await dispatch(postRegister(userData)).unwrap();

      if (result) {
        setFormData({
          name: "",
          username: "",
          password: "",
          confirm_password: "",
          user_type: "news_enthusiast",
          email: "",
        });

        navigate("/successreg");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Header with logo placeholder */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{t("title")}</h1>
          <p className="text-gray-500 mt-2">{t("subtitle")}</p>
        </div>

        {/* Social Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">
            or register with email
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Form */}
        <form
          className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-6 md:p-8">
            {error && (
              <div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
              >
                <div className="flex justify-between items-center">
                  <p className="text-red-700 text-sm">
                    {error.message || "Registration failed"}
                  </p>
                  <button
                    onClick={() => dispatch(resetAuthState())}
                    className="text-red-500 hover:text-red-700 text-lg"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("name")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  placeholder={t("name_placeholder")}
                  className={`w-full border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("username")}
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInput}
                  placeholder={t("username_placeholder")}
                  className={`w-full border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInput}
                placeholder={t("email_placeholder")}
                className={`w-full border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("password")}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInput}
                  placeholder={t("password_placeholder")}
                  className={`w-full border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm_password"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("confirm_password")}
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInput}
                  placeholder={t("confirm_password_placeholder")}
                  className={`w-full border ${
                    errors.confirm_password
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirm_password}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label
                htmlFor="user_type"
                className="text-sm font-medium text-gray-700 block"
              >
                {t("user_type")}
              </label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleInput}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdjQgdjRaIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-right-3 bg-[length:1.5rem]"
              >
                <option value="news_enthusiast">{t("news_enthusiast")}</option>
                <option value="content_creator">{t("content_creator")}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md ${
                isLoading ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  {t("loading")}
                </span>
              ) : (
                <span className="font-semibold">{t("submit")}</span>
              )}
            </button>
          </div>

          <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              {t("login_link")}?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                {t("sign_in")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
