"use client";
import React, { useState } from "react";
import AuthButton from "@/components/AuthButton";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Heart, Sparkles, Zap, Users } from "lucide-react"
import { useRouter } from "next/navigation";
import { signIn } from "@/actions/auth";

const ResetPasswordForm = () => {
  
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        // const formData = new FormData(event.currentTarget);
        // const result = await signIn(formData);
        // if (result.status === "success") {
        //     setSuccessMsg("Password updated successfully!");
        // } else {
        //   setErrorMsg(result.status);
        // }
        setTimeout(() => {
            setSuccessMsg("Password updated successfully!");
            setLoading(false);
        }, 2000);

  };
  return (
    <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
            <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                <AlertDescription className="text-red-700">{errorMsg}</AlertDescription>
            </Alert>
            )}
    
            {successMsg && (
            <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm">
                <AlertDescription className="text-green-700">{successMsg}</AlertDescription>
            </Alert>
            )}
    
            <div className="space-y-2">
              <Label htmlFor="oldPassword" className="text-sm font-semibold text-gray-700">
                Old Password
              </Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Old Password"
                  className="h-14 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="h-14 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-sm font-semibold text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  className="h-14 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </div>


            <div className="space-y-4 pt-2">
              <AuthButton type="Reset Password" loading={loading} />
            </div>
          </form>
       
    </div>
  );
};

export default ResetPasswordForm;
