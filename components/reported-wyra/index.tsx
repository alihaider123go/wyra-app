// ReportedWyraClient.jsx
"use client";

import { useSearchParams } from "next/navigation";
import SelectedWyra from "@/components/wyra/SelectedWyra";
import Link from "next/link";

export default function ReportedWyraClient() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  if (!postId) {
    return (
      <div className="text-center py-10 text-gray-500">
        Invalid or missing Wyra ID
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <nav className="border-b bg-background w-full justify-center flex items-center py-2">
        <Link href="/">
          <div className="max-w-md mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <picture>
                <img
                  src="app_icon.png"
                  alt="app-icon"
                  className="h-[38px] w-[50px]"
                />
              </picture>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-montserrat">
              Wyra
            </h1>
          </div>
        </Link>
      </nav>

      <div className="mt-10 flex justify-center">
        <section>
          <h1 className="text-3xl text-center font-bold mb-6">Reported Wyra</h1>
          <SelectedWyra postId={postId} disableActions />
        </section>
      </div>
    </div>
  );
}
