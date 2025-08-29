"use client";

import React, { useState, useEffect, useRef } from "react";
import { Forward } from "lucide-react";
import {
  FacebookShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
} from "react-share";

interface ShareButtonProps {
  wyraId: string;
  userId?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ wyraId }) => {
  const [open, setOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/#${wyraId}`;
  const shareMessage = `Just found a Wyra that totally made me think 😂 
Would you rather…? Had to share it with you! 

Hit the link: ${shareUrl}

P.s there are tons more of these on the Wyra app!

Download here:
Play Store: https://play.google.com/store/apps/details?id=com.example.app

App Store: https://apps.apple.com/app/id000000000
`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: shareMessage,
          // url: shareUrl, // optional here since included in message
        });
      } catch (err) {
        console.log("Sharing canceled", err);
      }
    } else {
      setOpen((prev) => !prev); // this opens fallback modal or component
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={shareRef}>
      <button
        onClick={handleShare}
        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer
        bg-gray-200 text-gray-800`}
      >
        <Forward className="w-4 h-4 mr-1" />
        <span className="md:block hidden">Share</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "-90px",
            left: -100,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "10px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            zIndex: 9999,
          }}
        >
          <FacebookShareButton url={shareUrl} title={shareMessage}>
            <FacebookIcon className="flex justify-center w-full" size={32} round /> Facebook
          </FacebookShareButton>

          <WhatsappShareButton url={shareUrl} title={shareMessage}>
            <WhatsappIcon className="flex justify-center w-full" size={32} round /> WhatsApp
          </WhatsappShareButton>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
