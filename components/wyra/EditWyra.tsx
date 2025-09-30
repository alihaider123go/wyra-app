"use client";

import React, { useState, useEffect } from "react";
import { FaSmile, FaTrash, FaRegImage } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/btn";
import { Card, CardContent } from "@/components/ui/card";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface EditWyraProps {
  wyraId: string;
  fetchWyras: any;
  setShowEditWyraModal: any;
}

export default function EditWyra({
  wyraId,
  fetchWyras,
  setShowEditWyraModal,
}: EditWyraProps) {
  const [optionOne, setOptionOne] = useState("");
  const [originalOptionOne, setOriginalOptionOne] = useState("");
  const [originalOptionTwo, setOriginalOptionTwo] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [optionOneId, setOptionOneId] = useState<string | null>(null);
  const [optionTwoId, setOptionTwoId] = useState<string | null>(null);
  const [mediaOne, setMediaOne] = useState<
    { id?: string; url: string; type: string }[]
  >([]);
  const [mediaTwo, setMediaTwo] = useState<
    { id?: string; url: string; type: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeOption, setActiveOption] = useState<1 | 2 | null>(null);
  const [activeTab, setActiveTab] = useState(1); // mobile stepper

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchWyraData() {
      const { data: optionsData, error: optionsError } = await supabase
        .from("wyra_option")
        .select("id, option_text, position")
        .eq("wyra_id", wyraId);

      if (optionsError) {
        console.error("Failed to fetch Wyra options:", optionsError.message);
        return;
      }

      let optionOneID: string | null = null;
      let optionTwoID: string | null = null;

      optionsData?.forEach((option) => {
        if (option.position === 1) {
          // only set state if not already set
          setOptionOne((prev) => prev || option.option_text || "");
          setOriginalOptionOne(option.option_text || "");
          setOptionOneId(option.id);
          optionOneID = option.id;
        } else if (option.position === 2) {
          setOptionTwo((prev) => prev || option.option_text || "");
          setOriginalOptionTwo(option.option_text || "");
          setOptionTwoId(option.id);
          optionTwoID = option.id;
        }
      });

      if (optionOneID || optionTwoID) {
        const { data: mediaData, error: mediaError } = await supabase
          .from("wyra_media")
          .select("id, wyra_option_id, media_url, media_type")
          .in("wyra_option_id", [optionOneID, optionTwoID].filter(Boolean));

        if (mediaError) {
          console.error("Failed to fetch Wyra media:", mediaError.message);
        }

        if (mediaData) {
          const mediaForOptionOne = mediaData
            .filter((m) => m.wyra_option_id === optionOneID)
            .map((m) => ({ id: m.id, url: m.media_url, type: m.media_type }));

          const mediaForOptionTwo = mediaData
            .filter((m) => m.wyra_option_id === optionTwoID)
            .map((m) => ({ id: m.id, url: m.media_url, type: m.media_type }));

          setMediaOne(mediaForOptionOne);
          setMediaTwo(mediaForOptionTwo);
        }
      }
    }

    fetchWyraData();
  }, [wyraId]); // run only when wyraId changes

  const handleEmojiClick = (emojiData: any) => {
    if (activeOption === 1) {
      setOptionOne((prev) => prev + emojiData.emoji);
    } else if (activeOption === 2) {
      setOptionTwo((prev) => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleAddMedia = async (option: 1 | 2, files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const type = file.type.includes("video") ? "video" : "image";

    const filePath = `wyra/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("wyra-media")
      .upload(filePath, file);

    if (uploadError) {
      alert("Failed to upload media.");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wyra-media/${filePath}`;
    const optionId = option === 1 ? optionOneId : optionTwoId;

    if (!optionId) return;

    const { data, error: insertError } = await supabase
      .from("wyra_media")
      .insert({ wyra_option_id: optionId, media_url: url, media_type: type })
      .select()
      .single();

    if (insertError) {
      alert("Failed to save media.");
      return;
    }

    if (option === 1) {
      setMediaOne((prev) => [...prev, { id: data.id, url, type }]);
    } else {
      setMediaTwo((prev) => [...prev, { id: data.id, url, type }]);
    }
  };

  const handleDeleteMedia = async (option: 1 | 2, mediaId?: string) => {
    if (!mediaId) return;

    await supabase.from("wyra_media").delete().eq("id", mediaId);

    if (option === 1) {
      setMediaOne((prev) => prev.filter((m) => m.id !== mediaId));
    } else {
      setMediaTwo((prev) => prev.filter((m) => m.id !== mediaId));
    }
  };

  const handleSubmit = async () => {
    if (!optionOne.trim() || !optionTwo.trim()) {
      alert("Both options must be filled.");
      return;
    }

    setLoading(true);

    const updates = [];

    if (optionOneId && optionOne.trim() !== originalOptionOne.trim()) {
      updates.push(
        supabase
          .from("wyra_option")
          .update({ option_text: optionOne, is_edit: true })
          .eq("id", optionOneId)
      );
    }

    if (optionTwoId && optionTwo.trim() !== originalOptionTwo.trim()) {
      updates.push(
        supabase
          .from("wyra_option")
          .update({ option_text: optionTwo, is_edit: true })
          .eq("id", optionTwoId)
      );
    }

    if (updates.length > 0 && wyraId) {
      updates.push(
        supabase.from("wyra").update({ is_edit: true }).eq("id", wyraId)
      );
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    setLoading(false);
    fetchWyras();
    setShowEditWyraModal({ isShow: false, id: "" });
  };


  return (
    <div className="w-full flex justify-center relative">
      <section className="flex flex-col max-w-md">
        <Card className="border-0 animate-slide-in-right">
          <CardContent>
            <div className="max-w-2xl mx-auto">
              {/* Desktop Layout */}
              <div className="hidden md:block">

                <div className="bg-white dark:bg-black border rounded-2xl shadow p-5 mb-3 md:mb-8 relative">
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
                    <FaSmile
                      size={22}
                      className="text-gray-600 dark:text-gray-300 cursor-pointer"
                      onClick={() => {
                        setActiveOption(1);
                        setShowEmojiPicker((prev) => !prev);
                      }}
                    />
                    <label className="cursor-pointer">
                      <FaRegImage size={22} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-200" />

                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => handleAddMedia(1, e.target.files)}
                      />
                    </label>
                  </div>

                  {/* Media Inside Container */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {mediaOne.map((m) => (
                      <div key={m.id} className="relative w-24 h-24 border rounded-md overflow-hidden">
                        {m.type === "video" ? (
                          <video src={m.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.url} alt="media" className="w-full h-full object-cover" />
                        )}
                        <button
                          className="absolute top-1 right-1 bg-red-600 text-white dark:text-black p-1 rounded-full"
                          onClick={() => handleDeleteMedia(1, m.id)}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center font-semibold text-xl text-gray-700 dark:text-gray-300 mb-3 md:mb-8">
                  OR
                </div>

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
                    <FaSmile
                      size={22}
                      className="text-gray-600 dark:text-gray-300 cursor-pointer"
                      onClick={() => {
                        setActiveOption(2);
                        setShowEmojiPicker((prev) => !prev);
                      }}
                    />
                    <label className="cursor-pointer">
                      <FaRegImage size={22} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-200" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => handleAddMedia(2, e.target.files)}
                      />
                    </label>
                  </div>

                  {/* Media Inside Container */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {mediaTwo.map((m) => (
                      <div key={m.id} className="relative w-24 h-24 border rounded-md overflow-hidden">
                        {m.type === "video" ? (
                          <video src={m.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.url} alt="media" className="w-full h-full object-cover" />
                        )}
                        <button
                          className="absolute top-1 right-1 bg-red-600 text-white dark:text-black p-1 rounded-full"
                          onClick={() => handleDeleteMedia(2, m.id)}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-10">
                  <Button
                    btnText="Update Wyra"
                    loading={loading}
                    className="bg-blue-600 text-white dark:text-black"
                    loadingText="Updating..."
                    onClick={handleSubmit}
                  />
                </div>
              </div>

              {/* Mobile Layout (tabs/steps) */}
              <div className="block md:hidden">
                {activeTab === 1 && (
                  <>
                    <h1 className="font-semibold text-xl text-gray-700 dark:text-gray-300">Option 1:</h1>
                    <div className="bg-white dark:bg-black border rounded-2xl shadow p-5 mb-3 md:mb-8 relative">
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
                        <FaSmile
                          size={22}
                          className="text-gray-600 dark:text-gray-300 cursor-pointer"
                          onClick={() => {
                            setActiveOption(1);
                            setShowEmojiPicker((prev) => !prev);
                          }}
                        />
                        <label className="cursor-pointer">
                          <FaRegImage size={22} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-200" />

                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={(e) => handleAddMedia(1, e.target.files)}
                          />
                        </label>
                      </div>

                      {/* Media Inside Container */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        {mediaOne.map((m) => (
                          <div key={m.id} className="relative w-24 h-24 border rounded-md overflow-hidden">
                            {m.type === "video" ? (
                              <video src={m.url} controls className="w-full h-full object-cover" />
                            ) : (
                              <img src={m.url} alt="media" className="w-full h-full object-cover" />
                            )}
                            <button
                              className="absolute top-1 right-1 bg-red-600 text-white dark:text-black p-1 rounded-full"
                              onClick={() => handleDeleteMedia(1, m.id)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right mt-4">
                      <Button btnText="Option 2" onClick={() => setActiveTab(2)} />
                    </div>
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    <h1 className="font-semibold text-xl text-gray-700 dark:text-gray-300">Option 2:</h1>

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
                        <FaSmile
                          size={22}
                          className="text-gray-600 dark:text-gray-300 cursor-pointer"
                          onClick={() => {
                            setActiveOption(2);
                            setShowEmojiPicker((prev) => !prev);
                          }}
                        />
                        <label className="cursor-pointer">
                          <FaRegImage size={22} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-200" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={(e) => handleAddMedia(2, e.target.files)}
                          />
                        </label>
                      </div>

                      {/* Media Inside Container */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        {mediaTwo.map((m) => (
                          <div key={m.id} className="relative w-24 h-24 border rounded-md overflow-hidden">
                            {m.type === "video" ? (
                              <video src={m.url} controls className="w-full h-full object-cover" />
                            ) : (
                              <img src={m.url} alt="media" className="w-full h-full object-cover" />
                            )}
                            <button
                              className="absolute top-1 right-1 bg-red-600 text-white dark:text-black p-1 rounded-full"
                              onClick={() => handleDeleteMedia(2, m.id)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button btnText="Back" className="w-[28%] px-4 mr-3" onClick={() => setActiveTab(1)} />
                      <Button
                        btnText="Update Wyra"
                        loading={loading}
                        className="bg-blue-600 text-white dark:text-black w-[70%] px-4"
                        loadingText="Updating..."
                        onClick={handleSubmit}
                      />
                    </div>
                  </>
                )}
              </div>

              {showEmojiPicker && (
                <div className="absolute z-50 bottom-20">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
