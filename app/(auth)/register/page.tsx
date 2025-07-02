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
  
    const goToSingInPage = () => {
      router.push("/login");
    };

    return (
      <div className="w-full flex mt-20 mb-20 justify-center">
        <section className="flex flex-col  max-w-md">

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Sign Up</CardTitle>
              <CardDescription className="text-gray-600 text-lg">Sign up to start making choices</CardDescription>
            </CardHeader>
            <CardContent>

          {/* Sign Up Form */}
        <SignUpForm />
            <div className="space-y-4 pt-2">
              <Button onClick={() => goToSingInPage()} className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Sign In
              </Button>
            </div>
            
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