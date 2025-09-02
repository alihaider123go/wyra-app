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
import React, { useEffect, useState } from "react";
import { relativeTime } from "@/utils/helper";
import { getAllWyras } from "@/actions/wyra";
import { Plus, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import CustomAvatar from "@/components/ui/custom-avatar";


export default function LoginPage() {
  const router = useRouter();
  const [wyraList, setWyraList] = useState<any[]>([]);

  const fetchWyras = async () => {
    try {
      const result = await getAllWyras();
      setWyraList(result || []);
    } catch (err) {
      console.error("Failed to fetch wyras", err);
    } finally {
      // setLoading(false);
    }
  }

  useEffect(() => {
    fetchWyras();
  }, []);


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

        <div className="w-full md:w-1/2 md:pl-4 mt-8 md:mt-0 flex justify-center items-start">
          <div className="shadow-2xl border-0 p-2 bg-white/80 h-[522px] overflow-x-hidden overflow-y-auto backdrop-blur-lg animate-slide-in-right w-full max-w-md">
            <div className="space-y-6">
              {
                wyraList
                  .filter((wyra: any) => wyra.likeCount > 20).length > 0
                  ?

                  wyraList
                    .filter((wyra: any) => wyra.likeCount > 20)
                    .map((wyra: any, index) => (
                      <Card
                        key={index}
                        className="shadow-md hover:shadow-2xl border-0 bg-white/80 backdrop-blur-lg transition-all pt-4 animate-slide-in-right"
                      >
                        <CardContent className="p-2">
                          <div className="flex md:gap-2">
                            {/* user info */}
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">

                                <CustomAvatar userId={wyra.creator?.id} firstName={wyra.creator.firstname} lastName={wyra.creator.lastname}/>
                                
                              </div>
                              <div>
                                <h2 className="text-lg font-bold text-black">
                                  {wyra.creator.firstname} {wyra.creator.lastname}
                                  <span>
                                    <span className="font-bold text-md mt-6">
                                      {" "}
                                      Asked,{" "}
                                    </span>
                                    <small className="text-gray-500">
                                      {relativeTime(wyra.created_at)}
                                    </small>
                                  </span>
                                </h2>
                                <p className="text-gray-600 text-sm">
                                  @{wyra.creator.username}
                                </p>
                              </div>
                              {/* <span className="font-bold text-lg mt-6">Asks,</span> */}
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="my-3 font-bold text-xl text-center">
                              Would you rather:
                            </p>
                          </div>
                          <div className="flex flex-col items-center justify-center md:gap-4 gap-2">
                            {wyra.wyra_option
                              .sort((a: any, b: any) => a.position - b.position)
                              .map((opt: any, index: number) => {


                                return (
                                  <React.Fragment key={opt.id}>
                                    {index === 1 && (
                                      <span className="w-12 h-12 px-4 text-white rounded-full flex justify-center items-center text-sm font-semibold  bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-600 hover:to-blue-900">
                                        OR
                                      </span>
                                    )}

                                    <div
                                      className={`
            my-1 relative overflow-hidden border shadow p-4 rounded-lg cursor-pointer w-full transition-all duration-300 transform hover:scale-[1.02]
            ${"hover:bg-gray-100"
                                        }
          `}
                                    // onClick={() => {
                                    //   if (!selectedOptionId) {
                                    //     setSelectedOptionId(opt.id);
                                    //   }
                                    // }}

                                    >

                                      <p
                                        className={`text-sm font-medium mb-1 ${"text-gray-500"
                                          }`}
                                      >
                                        Option {index + 1}:
                                      </p>
                                      <p
                                        className={`font-bold text-lg mb-1 ${"text-gray-800"
                                          }`}
                                      >
                                        {opt.option_text}
                                      </p>

                                      <div className="flex flex-wrap gap-3">
                                        {opt.wyra_media.map((media: any) => (
                                          <div key={media.id} className="w-32">
                                            {media.media_type === "image" ? (
                                              <img
                                                src={media.media_url}
                                                alt="Option media"
                                                className="rounded-md object-cover max-h-28 w-full"
                                              />
                                            ) : (
                                              <video
                                                src={media.media_url}
                                                controls
                                                className="rounded-md max-h-28 w-full"
                                              />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </React.Fragment>
                                );
                              })}
                          </div>
                          <hr />
                          <div className="flex justify-between">
                            <div className="mt-4 text-sm text-gray-500 flex gap-4">
                              <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-green-200 text-gray-800 hover:bg-green-300">
                                <ThumbsUp className="w-4 h-4 mr-1" size={18} /> {wyra?.likeCount}{" "}
                              </span>
                              <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-red-200 text-gray-800 hover:bg-red-300">
                                <ThumbsDown className="w-4 h-4 mr-1" size={18} /> {wyra?.dislikeCount}
                              </span>
                              <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-blue-200 text-gray-800 hover:bg-blue-300">
                                <MessageCircle className="w-4 h-4 mr-1" size={18} /> {wyra?.commentCount}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )) :
                  <div className="flex h-[500px] justify-center items-center">
                    <div className="text-center pt-5">
                      <p>Trending Wyras</p>
                    </div>
                  </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );


}
