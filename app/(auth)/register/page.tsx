"use client";
import SignUpForm from "@/components/SignUpForm";
import React from "react";
import { useRouter } from "next/navigation";
import LoginGithub from "@/components/LoginGithub";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Heart, Sparkles, Zap, Users } from "lucide-react"

export default function LoginPage() {
    const router = useRouter();
  
 

    return (
      <div className="w-full flex mt-20 mb-20 justify-center">
        <section className="flex flex-col md:max-w-xl">
          <div className="w-full flex justify-center items-center mb-8">
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

       <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-in-left">
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

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Sign Up</CardTitle>
              <CardDescription className="text-gray-600 text-lg">Sign up to start making choices</CardDescription>
            </CardHeader>
            <CardContent>

          {/* Sign Up Form */}
        <SignUpForm />
           
            
          {/* <div className="mt-2 flex items-center">
            <h1>{`Don't have an account?`}</h1>
            <Link className="font-bold ml-2" href="/register">
              Sign Up
            </Link>
          </div>
          <div className="mt-2 flex items-center">
            <h1>{`Forgot your password?`}</h1>
            <Link className="font-bold ml-2" href="/forgot-password">
              Reset Password
            </Link>
          </div> */}
           </CardContent>
      </Card>
        </section>
      </div>
  );
};