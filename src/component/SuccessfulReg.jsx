import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { postRegister } from "../redux/slicer";

function SuccessfulReg() {
  const navigate = useNavigate();
  const { success } = useSelector((state) => state.auth);
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div className="w-[532px] bg-white shadow-xl border border-gray-200  max-w-md flex flex-col space-y-4 p-6 md:p-8 rounded-lg">
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">
            Registration successful! Please login.
          </p>
        </div>
      )}
   
        <button onClick={(e)=>{
            e.preventDefault();
            navigate('/login')
        }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4">
          Go to Login
        </button>
    </div>
    </div>
  );
}

export default SuccessfulReg;
