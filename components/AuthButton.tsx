import React from "react";
import { Button } from "@/components/ui/button"

const AuthButton = ({
  type,
  loading,
}: {
  type: "Sign In" | "Sign up" | "Reset Password" | "Forgot Password";
  loading: boolean;
}) => {
  return (
    // <button
    //   disabled={loading}
    //   type="submit"
    //   className={`${
    //     loading ? "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" : "bg-blue-600"
    //   } w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
    // >
    //   {loading ? "Loading..." : type}
    // </button>

    <Button
      type="submit"
      disabled={loading}
      className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          {/* Signing In... */}
        </>
      ) : (
        type
      )}
    </Button>
    
  );
};

export default AuthButton;
