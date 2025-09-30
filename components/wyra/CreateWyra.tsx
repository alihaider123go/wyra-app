"use client";

import React, { useState } from "react";
import { FaRegImage, FaSmile } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { uploadFiles } from "@/actions/common";
import { insertWyra } from "@/actions/wyra";
import { WyraInsertInput, Circle } from "@/actions/types";
import Button from "@/components/ui/btn";
import CircleMultiSelectModal from "@/components/wyra/CircleMultiSelectModal";
import { Card, CardContent } from "@/components/ui/card";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function CreateWyra({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const [optionOne, setOptionOne] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [filesOne, setFilesOne] = useState<File[]>([]);
  const [filesTwo, setFilesTwo] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCircleModal, setShowCircleModal] = useState(false);
  const [availableCircles, setAvailableCircles] = useState<Circle[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // NEW: Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeOption, setActiveOption] = useState<1 | 2 | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (option: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
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
          {isImage && <img src={url} alt="preview" className="max-h-40 rounded-md" />}
          {isVideo && <video src={url} controls className="max-h-40 rounded-md" />}
        </div>
      );
    });

  const handleEmojiClick = (emojiData: any) => {
    if (activeOption === 1) {
      setOptionOne((prev) => prev + emojiData.emoji);
    } else if (activeOption === 2) {
      setOptionTwo((prev) => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false); // Close after selection
  };

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
    // const circlesWithMembers = (myCircles ?? []).filter(
    //   (circle) => circle.circle_members && circle.circle_members.length > 0
    // );

    if (error) {
      console.error("Failed to fetch user circles:", error.message);
      alert("Failed to load your circles.");
      return;
    }

    if (myCircles.length > 0) {
      setAvailableCircles(myCircles);
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
    if (onTabChange){
      onTabChange("home");
    }

  };
  

  return (
    <div className="w-full flex justify-center relative">
      <section className="flex flex-col max-w-md">
        <Card className="border-0 animate-slide-in-right">
          <CardContent>
            <div className="max-w-2xl mx-auto p-6">
              <h1 className="text-center text-3xl font-bold mb-10 text-black dark:text-white">Would you rather...</h1>

              {/* Option One */}
              <div className="bg-white dark:bg-black border rounded-2xl shadow p-5 mb-8 relative">
                <textarea
                  maxLength={150}
                  rows={4}
                  placeholder="Type option one..."
                  className="w-full border border-gray-300 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-md p-4 resize-none text-base font-medium"
                  value={optionOne}
                  onChange={(e) => setOptionOne(e.target.value)}
                />
                <div className="text-xs text-gray-400 absolute bottom-3 right-6">
                  {150 - optionOne.length} Max
                </div>
                <div className="flex items-center mt-4 gap-4 relative">
                  <label className="cursor-pointer">
                    <FaRegImage size={22} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-200" />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      hidden
                      onChange={(e) => handleFileChange(1, e)}
                    />
                  </label>
                  <FaSmile
                    size={22}
                    className="text-gray-600 dark:text-gray-300 cursor-pointer"
                    onClick={() => {
                      setActiveOption(1);
                      setShowEmojiPicker((prev) => !prev);
                    }}
                  />
                </div>
                {renderPreviews(filesOne)}
              </div>

              <div className="text-center font-semibold text-xl text-gray-700 dark:text-gray-300 mb-8">OR</div>

              {/* Option Two */}
              <div className="bg-white dark:bg-black border rounded-2xl shadow p-5 mb-4 relative">
                <textarea
                  maxLength={150}
                  rows={4}
                  placeholder="Type option two..."
                  className="w-full border border-gray-300 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-md p-4 resize-none text-base font-medium"
                  value={optionTwo}
                  onChange={(e) => setOptionTwo(e.target.value)}
                />
                <div className="text-xs text-gray-400 absolute bottom-3 right-6">
                  {150 - optionTwo.length} Max
                </div>
                <div className="flex items-center mt-4 gap-4 relative">
                  <label className="cursor-pointer">
                    <FaRegImage size={22} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-200" />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      hidden
                      onChange={(e) => handleFileChange(2, e)}
                    />
                  </label>
                  <FaSmile
                    size={22}
                    className="text-gray-600 dark:text-gray-300 cursor-pointer"
                    onClick={() => {
                      setActiveOption(2);
                      setShowEmojiPicker((prev) => !prev);
                    }}
                  />
                </div>
                {renderPreviews(filesTwo)}
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute z-50 bottom-20">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

               <div className="text-center mt-10">
            <Button
              btnText="Create Wyra"
              loading={loading}
              className="bg-blue-600 text-white dark:text-black"
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
