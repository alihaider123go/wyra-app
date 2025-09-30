"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";

export default function InviteFriends() {
  const [copied, setCopied] = useState(false);

  const inviteMessage = `Hey! 👋
I’m on this new app called Wyra — it’s like “Would You Rather?” but smarter, sassier, and way more fun. You ask creative two-option questions, your friends pick a side, and (if they’re feeling generous) tell you why. Optional, of course.

Join me on Wyra and let’s find out who’s really got the best takes.

Download here:
App Store: https://apps.apple.com/app/id
Play Store: https://play.google.com/store/apps/details?id=`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-2xl border-0 bg-white dark:bg-black/80 backdrop-blur-lg animate-slide-in-right max-w-3xl mx-auto my-10 p-6">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          🎉 Invite Your Friends to Wyra
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Wyra is more fun when your crew is in on it! Ready to spark debates,
          settle dilemmas, and find out exactly why your friends think pineapple
          does (or does not) belong on pizza?
        </p>
        <p>
          Send them an invite to join you on Wyra — the app where questions get
          interesting, answers get colorful, and the why is always optional.
        </p>
        <p>
          Go on — would you rather keep Wyra all to yourself… or make it the
          hottest thing in your group chat? 😉
        </p>

        <h3 className="text-lg font-semibold text-indigo-700">
          📲 Send Invite:
        </h3>

        <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 relative">
          <p className="whitespace-pre-line text-sm">{inviteMessage}</p>
          <Button
            onClick={handleCopy}
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 text-xs flex gap-1"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
          <a
            href="https://apps.apple.com/app/id"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[120px] h-12"
          >
            <img
              src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-example-preferred.png"
              alt="Download on the App Store"
              className="w-full h-full object-contain"
            />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id="
            target="_blank"
            rel="noopener noreferrer"
            className="w-[120px] h-12"
          >
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="w-full h-full object-contain"
            />
          </a>
        </div>

        <p className="text-center text-sm mt-6 italic text-gray-600 dark:text-gray-300">
          ✅ Pro Tip: Don’t just answer Wyras… create your own, follow your
          friends, join Circles, and watch the whys roll in. Let’s see who
          disagrees with you the most. 😏
        </p>
      </CardContent>
    </Card>
  );
}
