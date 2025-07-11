"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import AuthButton from "./AuthButton";
import { useRouter } from "next/navigation";
import { signUp } from "@/actions/auth";
import { createClient } from "@/utils/supabase/client";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [username, setUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Real-time username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const delay = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("username", username)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          setUsernameAvailable(null);
        } else {
          setUsernameAvailable(!data);
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [username, supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm-password")?.toString();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      setError("Username is already taken");
      setLoading(false);
      return;
    }

    formData.set("username", username); // ensure username from state

    const result = await signUp(formData);
    if (result.status === "success") {
      router.push("/login");
    } else {
      setError(result.status);
    }

    setLoading(false);
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstname" className="text-sm font-semibold text-gray-700">
              First Name
            </Label>
            <Input
              type="text"
              id="firstname"
              name="firstname"
              placeholder="First Name"
              className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastname" className="text-sm font-semibold text-gray-700">
              Last Name
            </Label>
            <Input
              type="text"
              id="lastname"
              name="lastname"
              placeholder="Last Name"
              className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">
              Date Of Birth
            </Label>
            <Input
              type="date"
              id="dob"
              name="dob"
              placeholder="DOB"
              className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
              Gender
            </Label>
            <select
              id="gender"
              name="gender"
              required
              defaultValue=""
              className="w-full h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm px-4"
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            minLength={3}
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
            required
          />
          <div className="text-sm mt-1">
            {username.length >= 3 && (
              <>
                {checkingUsername && (
                  <span className="text-gray-500">Checking availability...</span>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-green-600">Username is available ✓</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-red-600">Username is taken ✗</span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
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

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="h-14 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
