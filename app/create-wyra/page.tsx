"use client";

import CreateWyra from "@/components/wyra/CreateWyra";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WyraCreatePage() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "BACK_BUTTON") {
          router.push("/forgot-password");
        }
      } catch {
        console.warn("Invalid message received:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (

    <CreateWyra />

  );
}
