"use client";

import { JSX, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQSection {
  title: string;
  content: JSX.Element;
}

export default function WyraHelpCenter() {
  const [isMobile, setIsMobile] = useState(false);
  const [openSections, setOpenSections] = useState<boolean[]>([]);

  const sections: FAQSection[] = [
    {
      title: "📚 Welcome to the Wyra Help Center",
      content: (
        <p>
          Got questions? Great — because questions are what we’re all about. Tap a category below to expand the answers.
        </p>
      ),
    },
    {
      title: "🔷 Getting Started",
      content: (
        <div className="space-y-3">
          <p><strong>🤔 What is Wyra, exactly?</strong><br />
            Wyra is short for “Would you rather.” It’s your social playground for impossible questions and hot takes. Post a two-option question, others pick and optionally explain why.
          </p>
          <p><strong>📝 Do I need to create an account?</strong><br />
            To interact (like, vote, comment, DM), yes. To just browse Trending Wyras, no.
          </p>
          <p><strong>💻 Is Wyra available on web and mobile?</strong><br />
            Absolutely — use it in your browser or download the app.
          </p>
        </div>
      ),
    },
    {
      title: "🔷 Posting a Wyra",
      content: (
        <div className="space-y-3">
          <p><strong>📜 How do I create my own Wyra?</strong><br />
            Tap Post, fill out the two choices, hit publish. Boom.
          </p>
          <p><strong>🎯 What’s a “Circle”?</strong><br />
            Circles are interest-based groups. You can share your Wyra into up to 5 Circles when posting.
          </p>
          <p><strong>✏️ Can I edit or delete my Wyra?</strong><br />
            Yes — tap (…) on your post to Edit or Delete. Edited posts will say “edited.”
          </p>
        </div>
      ),
    },
    {
      title: "🔷 Answering & Interacting",
      content: (
        <div className="space-y-3">
          <p><strong>🖱️ How do I pick an answer?</strong><br />
            Tap/click your choice. Optional: fill in Why? Then post.
          </p>
          <p><strong>👍 How do likes and dislikes work?</strong><br />
            Like = “Agree” in green. Dislike = “Disagree” in red. Both float up for 2 seconds.
          </p>
          <p><strong>🧡 What does Favorite do?</strong><br />
            Saves the Wyra (with Why? if present) to your favorites list.
          </p>
          <p><strong>🔄 How does sharing work?</strong><br />
            Share Wyras with your followers or even outside Wyra.
          </p>
        </div>
      ),
    },
    {
      title: "🔷 Trending & Profiles",
      content: (
        <div className="space-y-3">
          <p><strong>🔥 How does a Wyra become “Trending”?</strong><br />
            If it gets 10+ likes, it enters the Trending Wyras list.
          </p>
          <p><strong>👀 Can I interact with Trending Wyras without signing in?</strong><br />
            Nope — sign in first to vote, like, comment, etc.
          </p>
          <p><strong>🕺 Can I follow other users?</strong><br />
            Yes — follow cool people, and they can follow you back.
          </p>
          <p><strong>📬 Can I DM people?</strong><br />
            You can — but play nice.
          </p>
        </div>
      ),
    },
    {
      title: "🔷 Why? & Comments",
      content: (
        <div className="space-y-3">
          <p><strong>🧐 What’s the Why? drop-down?</strong><br />
            Expands to show people’s explanations. You can like/dislike/comment on Why? posts.
          </p>
          <p><strong>📝 Do I have to fill out Why?</strong><br />
            Nope — it’s optional.
          </p>
        </div>
      ),
    },
    {
      title: "🔷 Moderation & Reporting",
      content: (
        <div className="space-y-3">
          <p><strong>🚨 What if I see something offensive?</strong><br />
            Tap (…) and Report. Confirm in the pop-up, and it gets sent to our inbox.
          </p>
          <p><strong>🔄 Can I undo a report?</strong><br />
            Nope — but don’t worry, we review every report fairly.
          </p>
        </div>
      ),
    },
    {
      title: "🔷 Technical & Contact",
      content: (
        <div className="space-y-3">
          <p><strong>🧹 Can I log out or clear activity?</strong><br />
            Yep — go to Account Settings for logout, clear data, or deactivate account.
          </p>
          <p><strong>📲 App acting buggy?</strong><br />
            Try restarting. Still buggy? Email <a href="mailto:support@wyra.xyz" className="text-blue-600">support@wyra.xyz</a> with a screenshot & description.
          </p>
          <p><strong>💡 Got a brilliant idea?</strong><br />
            Send it to <a href="mailto:ideas@wyra.xyz" className="text-blue-600">ideas@wyra.xyz</a> — we love new ideas!
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpenSections(Array(sections.length).fill(!mobile));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sections.length]);

  const toggleSection = (index: number) => {
    if (!isMobile) return;
    setOpenSections((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-fade-in max-w-3xl mx-auto my-10">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Wyra Help Center
        </CardTitle>
      </CardHeader>

      <CardContent className="text-left space-y-4 text-gray-700 text-sm leading-relaxed">
        {sections.map((section, i) => (
          <div key={i} className="border-b pb-4">
            <button
              onClick={() => toggleSection(i)}
              className="w-full text-left font-semibold text-indigo-700 text-base hover:underline focus:outline-none flex items-center justify-between"
            >
              <span>{section.title}</span>
              {isMobile && (
                <span className="text-lg">{openSections[i] ? "−" : "+"}</span>
              )}
            </button>
            {openSections[i] && (
              <div className="mt-2 text-gray-700">{section.content}</div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
