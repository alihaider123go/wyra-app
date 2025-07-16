"use client";
import LoginForm from "@/components/LoginForm";
import { useRouter } from "next/navigation";
import LoginGithub from "@/components/LoginGithub";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Heart, Sparkles, Zap, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();



  const goToForgotPasswordPage = () => {
    router.push("/forgot-password");
  };

return (
  <div className="w-full flex flex-col items-center mt-20 mb-20">
    {/* ===== Top Header: WYRA Logo ===== */}
    <div className="w-full flex justify-center items-center mb-8 animate-fade-in">
      <Link href="/login">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 text-white"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Wyra
          </h1>
        </div>
      </Link>
    </div>

    {/* ===== Tagline ===== */}
    <div className="text-center mb-8 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
        Life&apos;s full of choices – <br />
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          make them fun! ✨
        </span>
      </h2>
      <p className="text-gray-600 text-lg">
        Join millions making meaningful choices together
      </p>
    </div>

       <div className="grid grid-cols-3 lg:w-[30%] gap-4 mb-8 animate-slide-in-left">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Create</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Choose</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Connect</p>
          </div>
        </div>

    {/* ===== Cards Section ===== */}
    <div className="flex flex-col md:flex-row w-full max-w-5xl md:divide-x md:divide-gray-200">
      {/* Left Side: Login Card + Feature Icons */}
      <div className="w-full md:w-1/2 md:pr-4 flex flex-col items-center">
        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right w-full max-w-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Sign in to start making choices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            {/* <div className="space-y-4 pt-2">
              <Button
                onClick={() => goToSignUpPage()}
                className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Create Account
              </Button>
            </div> */}
           
            <div className="text-center pt-4">
              <Button
                onClick={() => goToForgotPasswordPage()}
                className="bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-800 text-sm font-semibold underline transition-colors"
              >
                Forgotten password?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Empty Card */}
      <div className="w-full md:w-1/2 md:pl-4 mt-8 md:mt-0 flex justify-center items-start">
        <Card className="shadow-2xl border-0 bg-white/80 h-[522px] overflow-y-auto backdrop-blur-lg animate-slide-in-right w-full max-w-md flex items-center justify-center">
          <p className="text-gray-500 text-lg">Empty Card Content</p>
        </Card>
      </div>
    </div>
  </div>
);


}
