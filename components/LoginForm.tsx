"use client";
import React, { useState } from "react";
import AuthButton from "./AuthButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Heart, Sparkles, Zap, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "@/actions/auth";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await signIn(formData);
    if (result.status === "success") {
      router.push("/");
    } else {
      setError(result.status);
    }

    setLoading(false);
  };

  const goToSignUpPage = () => {
    router.push("/register");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700"
          >
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
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-gray-700"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              className="h-14 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

      <div className="grid gap-3 md:justify-center">
          <div className="space-y-1 pt-2">
            <AuthButton type="Sign In" loading={loading} />
          </div>
          <div className="space-y-4 pt-2 text-center">
            <p className="text-gray-600 text-sm">
              Don’t have an account?{" "}
              <button
                onClick={() => goToSignUpPage()}
                className="text-purple-600 hover:text-purple-800 font-medium underline"
              >
                Create new
              </button>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
