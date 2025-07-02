"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Heart, Sparkles, Zap, Users } from "lucide-react"
import AuthButton from "./AuthButton";
import { useRouter } from "next/navigation";
import { signUp } from "@/actions/auth";

const SignUpForm = () => {
    const [showPassword, setShowPassword] = useState(false)
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await signUp(formData);
    if (result.status === "success") {
      router.push("/login");
    }else{
      setError(result.status);
    }

    setLoading(false);
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
                <div className="grid grid-cols-2 gap-3">

        <div className="space-y-2">
          <Label htmlFor="firstname" className="text-sm font-semibold text-gray-700">
                First Name
              </Label>
          <Input
            type="text"
            placeholder="First Name"
            id="firstname"
            name="firstname"
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastname" className="text-sm font-semibold text-gray-700">
                Surname
              </Label>
          <Input
            type="text"
            placeholder="Surname"
            id="lastname"
            name="lastname"
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                required
          />
        </div>
</div>
        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">
            Date Of Birth
              </Label>
          <Input
            type="date"
            placeholder="DOB"
            id="dob"
            name="dob"
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                required
          />
        </div>


            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email/Username
              </Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="email/username"
                className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                required
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-14 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </div>


            <div className="space-y-4 pt-2">
              <AuthButton type="Sign up" loading={loading} />
            </div>
          </form>
    </div>
  );
};

export default SignUpForm;
