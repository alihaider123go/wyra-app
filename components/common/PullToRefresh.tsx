"use client";

import React, { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

interface Props {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  color?: string;
  spinnerColor?: string;
  enableHaptics?: boolean;
}

export default function PullToRefresh({
  onRefresh,
  children,
  color = "#4b9cff",
  spinnerColor = "#007aff",
  enableHaptics = true,
}: Props) {
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [progress, setProgress] = useState(0); // 0 → 1
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trigger haptic feedback
  const vibrate = () => {
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  useEffect(() => {
    const handleStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        setPullStart(e.touches[0].clientY);
      }
    };

    const handleMove = (e: TouchEvent) => {
      if (pullStart !== null) {
        const dist = e.touches[0].clientY - pullStart;

        if (dist > 0) {
          const p = Math.min(dist / 120, 1);
          if (p > 0.8 && progress < 0.8) vibrate(); // haptic trigger
          setProgress(p);
        }
      }
    };

    const handleEnd = async () => {
      if (progress >= 0.8) {
        setIsRefreshing(true);
        vibrate();

        await onRefresh();

        setTimeout(() => {
          setIsRefreshing(false);
        }, 800);
      }

      setPullStart(null);
      setProgress(0);
    };

    window.addEventListener("touchstart", handleStart);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [pullStart, progress, isRefreshing]);

  return (
    <div className="relative overflow-visible">
      {/* Elastic top loader */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{
          transform: `translateY(${isRefreshing ? 60 : progress * 80}px) 
                      scale(${1 + progress * 0.2})`,
          transition: isRefreshing ? "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" : "",
        }}
      >
        {/* Arrow → Spinner */}
        {!isRefreshing ? (
          <ArrowDown
            size={28}
            style={{
              opacity: progress,
              transform: `rotate(${progress * 180}deg)`,
              transition: "transform 0.2s ease",
              color,
            }}
          />
        ) : (
          <div
            className="h-7 w-7 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: spinnerColor }}
          ></div>
        )}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
