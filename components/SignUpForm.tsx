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
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import TermsOfService from "./tos";
import { X } from "lucide-react";
import PrivacyPolicy from "./policies/privacy";
import Cookies from "./policies/cookies";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<any>({
    isOpen: false,
    type: "",
  });

  const [username, setUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [gender, setGender] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const today = new Date();
  const minAgeDate = new Date(
    today.getFullYear() - 13,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
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
      router.push("/");
    } else {
      setError(result.status);
    }

    setLoading(false);
  };

  const goToSingInPage = () => {
    router.push("/login");
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
            <Label
              htmlFor="firstname"
              className="text-sm font-semibold text-gray-700"
            >
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
            <Label
              htmlFor="lastname"
              className="text-sm font-semibold text-gray-700"
            >
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
            <Label
              htmlFor="dob"
              className="text-sm font-semibold text-gray-700"
            >
              Date Of Birth
            </Label>
            <Input
              type="date"
              id="dob"
              name="dob"
              placeholder="DOB"
              className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
              required
              max={minAgeDate}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="gender"
              className="text-sm font-semibold text-gray-700"
            >
              Gender
            </Label>
            <div className="relative w-full">
              <select
                id="gender"
                name="gender"
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full h-14 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none rounded-xl bg-white/90 backdrop-blur-sm px-4 pr-10 appearance-none 
        ${gender === "" ? "text-gray-400" : "text-gray-900"}`}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>

              {/* Custom Dropdown Icon */}
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-semibold text-gray-700"
            >
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
                    <span className="text-gray-500">
                      Checking availability...
                    </span>
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <span className="text-green-600">
                      Username is available ✓
                    </span>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="text-red-600">Username is taken ✗</span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  gap-3">
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
                placeholder="Password"
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
          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-semibold text-gray-700"
            >
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
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className=" flex items-center">
          <label className=" items-start space-x-2">
            <input
              type="checkbox"
              required
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-0 focus:outline-none"
            />
          </label>
          <span className="text-sm font-semibold text-gray-700 ml-2">
            I agree to the
            <span
              onClick={() => setIsModalOpen({ isOpen: true, type: "terms" })}
              className="text-blue-600 cursor-pointer underline mx-1"
            >
              Terms & Conditions
            </span>
            ,
            <span
              onClick={() => setIsModalOpen({ isOpen: true, type: "privacy" })}
              className="text-blue-600 cursor-pointer underline mx-1"
            >
              Privacy Policy
            </span>
            , and{" "}
            <span
              onClick={() => setIsModalOpen({ isOpen: true, type: "cookies" })}
              className="text-blue-600 cursor-pointer underline mx-1"
            >
              Cookies Policy
            </span>
            .
          </span>
        </div>

        <div className="grid gap-3 md:justify-center">
          <div className="space-y-4 md:pt-2">
            <AuthButton type="Sign up" loading={loading} />
          </div>

          <div className="space-y-4 md:pt-2 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => goToSingInPage()}
                className="text-purple-600 hover:text-purple-800 font-medium underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </form>

      <Modal isOpen={isModalOpen.isOpen} hideCloseButton={true}>
        <ModalContent className="h-[500px]">
          <ModalHeader className="flex flex-col justify-center items-center gap-1">
            {" "}
            <button
              onClick={() => setIsModalOpen({ isOpen: false, type: "" })}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Close comment modal"
            >
              <X className="w-6 h-6" />
            </button>
          </ModalHeader>
          <ModalBody className="overflow-y-auto">
            <div className="">
              {isModalOpen.type === "terms" ? (
                <TermsOfService />
              ) : isModalOpen.type === "privacy" ? (
                <PrivacyPolicy />
              ) : isModalOpen.type === "cookies" ? (
                <Cookies />
              ) : (
                ""
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SignUpForm;
