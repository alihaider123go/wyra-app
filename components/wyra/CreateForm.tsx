"use client";

import React, { useState } from "react";
import { FaRegImage, FaSmile } from "react-icons/fa";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { uploadFiles } from "@/actions/common";
import { insertWyra } from "@/actions/wyra";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { WyraInsertInput } from "@/actions/types";
import dynamic from "next/dynamic";
import Button from "../ui/Button";

export default function CreateWyra() {
  const [optionOne, setOptionOne] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [filesOne, setFilesOne] = useState<File[]>([]);
  const [filesTwo, setFilesTwo] = useState<File[]>([]);
  const [showEmojiPickerOne, setShowEmojiPickerOne] = useState(false);
  const [showEmojiPickerTwo, setShowEmojiPickerTwo] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
  });

  const supabase = createClient();

  //  const handleEmojiSelect = (
  //   emojiData: EmojiClickData,
  //   event: MouseEvent,
  //   option: 1 | 2
  // ) => {
  //   const emoji = emojiData.emoji;
  //   if (option === 1 && optionOne.length < 150) {
  //     setOptionOne((prev) => prev + emoji);
  //     setShowEmojiPickerOne(false);
  //   } else if (option === 2 && optionTwo.length < 150) {
  //     setOptionTwo((prev) => prev + emoji);
  //     setShowEmojiPickerTwo(false);
  //   }
  // };

  const handleFileChange = (
    option: 1 | 2,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const filesArray = Array.from(selectedFiles);

    if (option === 1) {
      setFilesOne((prev) => [...prev, ...filesArray]);
    } else {
      setFilesTwo((prev) => [...prev, ...filesArray]);
    }
  };

  const renderPreviews = (files: File[]) => {
    return files.map((file, idx) => {
      const url = URL.createObjectURL(file);
      const isImage = file.type.startsWith("image");
      const isVideo = file.type.startsWith("video");

      return (
        <div key={idx} className="mt-3">
          {isImage && (
            <img
              src={url}
              alt={`preview-${idx}`}
              className="max-h-40 rounded-md"
            />
          )}
          {isVideo && (
            <video src={url} controls className="max-h-40 rounded-md" />
          )}
        </div>
      );
    });
  };

  const handleSubmit = async () => {
    if (!optionOne.trim() || !optionTwo.trim()) {
      alert("Both options must be filled.");
      setError("Both options must be filled.");
      return;
    }
    setLoading(true);
    setError(null);
    // Get user ID from Supabase auth session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in to submit a Wyra.");
      return;
    }

    try {
      console.log(filesOne)
      // Upload files for option 1 if any
      const optionOneUploadResults =
        filesOne.length > 0 ? await uploadFiles(filesOne,user?.id, "wyra-media") : [];

      // Upload files for option 2 if any
      const optionTwoUploadResults =
        filesTwo.length > 0 ? await uploadFiles(filesTwo,user?.id, "wyra-media",) : [];


      const optionOneUrls = optionOneUploadResults.map(f => f.publicUrl);
      const optionTwoUrls = optionTwoUploadResults.map(f => f.publicUrl);

      const insertData: WyraInsertInput = {
        created_by: user?.id,
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
      console.log("Insert Data:", insertData);
      const wyra = await insertWyra(insertData);
      if (wyra) {
        router.push("/");
      }
      

      setLoading(false);
    } catch (error: any) {
      console.log("Failed to submit Wyra: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-center text-3xl font-bold mb-10 text-black">
        Would you rather...
      </h1>

      {/* Option One Card */}
      <div className="bg-white border rounded-2xl shadow p-5 mb-8 relative">
        <textarea
          maxLength={150}
          rows={4}
          placeholder="Type option one..."
          className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-4 resize-none text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <button
            type="button"
            onClick={() => setShowEmojiPickerOne((prev) => !prev)}
          >
            <FaSmile size={22} className="text-gray-600 hover:text-gray-800" />
          </button>

          {/* {showEmojiPickerOne && ( */}
          {/* <div className="absolute top-12 left-0 z-30">
              <EmojiPicker
                onEmojiClick={(emojiData, event) => handleEmojiSelect(emojiData, event, 2)}
              />
            </div> */}
          {/* )} */}
        </div>

        {renderPreviews(filesOne)}
      </div>

      {/* Or Separator */}
      <div className="text-center font-semibold text-xl text-gray-700 mb-8">
        OR
      </div>

      {/* Option Two Card */}
      <div className="bg-white border rounded-2xl shadow p-5 mb-4 relative">
        <textarea
          maxLength={150}
          rows={4}
          placeholder="Type option two..."
          className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-4 resize-none text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <button
            type="button"
            onClick={() => setShowEmojiPickerTwo((prev) => !prev)}
          >
            <FaSmile size={22} className="text-gray-600 hover:text-gray-800" />
          </button>

          {/* {showEmojiPickerTwo && ( */}
          {/* <div className="absolute top-12 left-0 z-30">
              <EmojiPicker
                onEmojiClick={(emojiData, event) => handleEmojiSelect(emojiData, event, 2)}
              />
            </div> */}
          {/* )} */}
        </div>

        {renderPreviews(filesTwo)}
      </div>

      {/* Submit Button */}
      <div className="text-center mt-10">
        {/* <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow transition"
        >
          Submit Wyra
        </button> */}
        <Button
          btnText="Create Wyra"
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow transition"
          loadingText="Creating..."
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
