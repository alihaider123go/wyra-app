"use client";
import LoginForm from "@/components/LoginForm";
import { useRouter } from "next/navigation";
import LoginGithub from "@/components/LoginGithub";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Heart, Sparkles, Zap, Users } from "lucide-react"

export default function LoginPage() {
    const router = useRouter();
  
    const goToSignUpPage = () => {
      router.push("/register");
    };

    const goToForgotPasswordPage = () => {
      router.push("/forgot-password");
    };
  

  return (
    <>
      <div className="w-full flex mt-20 mb-20 justify-center">
        <section className="flex flex-col  max-w-md">
          {/* Tagline */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
              Life's full of choices –<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                make them fun! ✨
              </span>
            </h2>
            <p className="text-gray-600 text-lg">Join millions making meaningful choices together</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 text-lg">Sign in to start making choices</CardDescription>
            </CardHeader>
            <CardContent>

          {/* Sign In Form */}          
          <LoginForm />
          {/* <LoginGithub /> */}
            <div className="space-y-4 pt-2">
              <Button onClick={() => goToSignUpPage()} className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Create Account
              </Button>

            </div>
            
            <div className="text-center pt-4">
              <Button onClick={() => goToForgotPasswordPage()} className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline transition-colors">
                Forgotten password?
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
    </>
  );
}
