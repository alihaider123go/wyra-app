"use client";

import React, { useState } from "react";
import { FaRegImage, FaSmile } from "react-icons/fa";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { createClient } from "@/utils/supabase/client";
import { uploadFiles } from "@/actions/common";
import { insertWyra } from "@/actions/wyra";
import { WyraInsertInput, Circle } from "@/actions/types";
import Button from "@/components/ui/btn";
import CircleMultiSelectModal from "@/components/wyra/CircleMultiSelectModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/common/loader";
import Link from "next/link";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function CreateWyra() {
  const [optionOne, setOptionOne] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [filesOne, setFilesOne] = useState<File[]>([]);
  const [filesTwo, setFilesTwo] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCircleModal, setShowCircleModal] = useState(false);
  const [availableCircles, setAvailableCircles] = useState<Circle[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [createdWyraId, setCreatedWyraId] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (
    option: 1 | 2,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;
    const array = Array.from(files);
    if (option === 1) setFilesOne((prev) => [...prev, ...array]);
    else setFilesTwo((prev) => [...prev, ...array]);
  };

  const renderPreviews = (files: File[]) =>
    files.map((file, idx) => {
      const url = URL.createObjectURL(file);
      const isImage = file.type.startsWith("image");
      const isVideo = file.type.startsWith("video");
      return (
        <div key={idx} className="mt-3">
          {isImage && (
            <img src={url} alt="preview" className="max-h-40 rounded-md" />
          )}
          {isVideo && (
            <video src={url} controls className="max-h-40 rounded-md" />
          )}
        </div>
      );
    });

  const prepareToSubmit = async () => {
    if (!optionOne.trim() || !optionTwo.trim()) {
      alert("Both options must be filled.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setUserId(user.id);

    const { data: myCircles, error } = await supabase
      .from("circles")
      .select(
        "*, circle_members(user_id, user_profiles(id,firstname,lastname,email, username, avatar))"
      )
      .eq("created_by", user.id);

    // ✅ Only keep circles with at least one member
    const circlesWithMembers = (myCircles ?? []).filter(
      (circle) => circle.circle_members && circle.circle_members.length > 0
    );

    console.log("Circles with members:", circlesWithMembers);
    if (error) {
      console.error("Failed to fetch user circles:", error.message);
      alert("Failed to load your circles.");
      return;
    }

    if (circlesWithMembers.length > 0) {
      setAvailableCircles(circlesWithMembers);
      setShowCircleModal(true);
    } else {
      handleSubmit([]);
    }
  };

  const handleSubmit = async (circleIds: string[]) => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const uploadedOne =
      filesOne.length > 0
        ? await uploadFiles(filesOne, user.id, "wyra-media")
        : [];
    const uploadedTwo =
      filesTwo.length > 0
        ? await uploadFiles(filesTwo, user.id, "wyra-media")
        : [];

    const optionOneUrls = uploadedOne.map((f) => f.publicUrl);
    const optionTwoUrls = uploadedTwo.map((f) => f.publicUrl);

    const insertData: WyraInsertInput = {
      created_by: user.id,
      options: [
        {
          option_text: optionOne,
          media_files: optionOneUrls.map((url) => ({
            url,
            media_type: url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
          })),
        },
        {
          option_text: optionTwo,
          media_files: optionTwoUrls.map((url) => ({
            url,
            media_type: url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
          })),
        },
      ],
    };

    const wyra = await insertWyra(insertData);
    if (wyra?.id && circleIds.length > 0) {
      await supabase
        .from("wyra_circles")
        .insert(circleIds.map((cid) => ({ wyra_id: wyra.id, circle_id: cid })));
    }

    setLoading(false);
    router.push("/");
  };

  return (
      <div className="w-full flex mt-20 mb-20 justify-center">
        <section className="flex flex-col max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
            {/* <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 text-lg">Sign in to start making choices</CardDescription>
            </CardHeader> */}
            <CardContent>

        <h1 className="text-3xl w-full text-center font-bold mb-6 font-semibold text-xl text-gray-700 mb-8">
          Create Wyra
        </h1>
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-center text-3xl font-bold mb-10 text-black">
            Would you rather...
          </h1>

          {/* Option One */}
          <div className="bg-white border rounded-2xl shadow p-5 mb-8 relative">
            <textarea
              maxLength={150}
              rows={4}
              placeholder="Type option one..."
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-4 resize-none text-base font-medium"
              value={optionOne}
              onChange={(e) => setOptionOne(e.target.value)}
            />
            <div className="text-xs text-gray-400 absolute bottom-3 right-6">
              {150 - optionOne.length} Max
            </div>
            <div className="flex items-center mt-4 gap-4 relative">
              <label className="cursor-pointer">
                <FaRegImage
                  size={22}
                  className="text-gray-600 hover:text-gray-800"
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  hidden
                  onChange={(e) => handleFileChange(1, e)}
                />
              </label>
              <FaSmile size={22} className="text-gray-600" />
            </div>
            {renderPreviews(filesOne)}
          </div>

          <div className="text-center font-semibold text-xl text-gray-700 mb-8">
            OR
          </div>

          {/* Option Two */}
          <div className="bg-white border rounded-2xl shadow p-5 mb-4 relative">
            <textarea
              maxLength={150}
              rows={4}
              placeholder="Type option two..."
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-4 resize-none text-base font-medium"
              value={optionTwo}
              onChange={(e) => setOptionTwo(e.target.value)}
            />
            <div className="text-xs text-gray-400 absolute bottom-3 right-6">
              {150 - optionTwo.length} Max
            </div>
            <div className="flex items-center mt-4 gap-4 relative">
              <label className="cursor-pointer">
                <FaRegImage
                  size={22}
                  className="text-gray-600 hover:text-gray-800"
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  hidden
                  onChange={(e) => handleFileChange(2, e)}
                />
              </label>
              <FaSmile size={22} className="text-gray-600" />
            </div>
            {renderPreviews(filesTwo)}
          </div>

          <div className="text-center mt-10">
            <Button
              btnText="Create Wyra"
              loading={loading}
              className="bg-blue-600 text-white"
              loadingText="Creating..."
              onClick={prepareToSubmit}
            />
          </div>

          {/* Modal */}
          {showCircleModal && userId && (
            <CircleMultiSelectModal
              userId={userId}
              circles={availableCircles}
              onCancel={() => setShowCircleModal(false)}
              onSelect={(selectedCircleIds) => {
                setShowCircleModal(false);
                handleSubmit(selectedCircleIds);
              }}
            />
          )}
        </div>
        </CardContent>
        </Card>
      </section>
    </div>
  );
}
