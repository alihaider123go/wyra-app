"use client";
import React, { useState } from "react";
import AuthButton from "./AuthButton";
import { forgotPassword } from "@/actions/auth";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ForgotPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await forgotPassword(formData);
    if (result.status === "success") {
      // alert("Password reset email sent successfully.");
      setSuccess(true);
    } else {
      setError(result.status);
    }
    setLoading(false);
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <Alert className="border-yellow-200 bg-yellow-50/80 backdrop-blur-sm">
                <AlertDescription className="text-yellow-700">Password reset email sent successfully. Please check your email.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}


            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="Email"
                className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                required
              />
            </div>

            <div className="space-y-4 pt-2">
          <AuthButton type="Forgot Password" loading={loading} />
            </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
