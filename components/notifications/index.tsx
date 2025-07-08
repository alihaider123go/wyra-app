"use client";

import { useState } from "react";

interface Setting {
  id: string;
  label: string;
  description: string;
  category: string;
}

const settings: Setting[] = [
  // Account & Privacy
  {
    id: "showRealName",
    label: "Show my real name on posts",
    description: "Your name is your badge of honor… unless you prefer staying low-key with just your username.",
    category: "Account & Privacy",
  },
  {
    id: "findByEmail",
    label: "Allow people to find me by email",
    description: "For those who love surprise connections. Otherwise? Cloak of invisibility it is.",
    category: "Account & Privacy",
  },
  {
    id: "findByPhone",
    label: "Allow people to find me by phone number",
    description: "Only for the bold. Or the social butterflies.",
    category: "Account & Privacy",
  },
  {
    id: "showOnlineStatus",
    label: "Show online status",
    description: "Sometimes you wanna glow green. Sometimes you wanna ghost.",
    category: "Account & Privacy",
  },
  {
    id: "showCirclesOnProfile",
    label: "Show which Circles I’m in on my profile",
    description: "Wear your Circles proudly — or keep them your little secret.",
    category: "Account & Privacy",
  },
  {
    id: "showWhyAnswers",
    label: "Let followers see my ‘Why’ answers",
    description: "Share your wisdom… or keep them guessing.",
    category: "Account & Privacy",
  },

  // Appearance & Theme
  {
    id: "darkMode",
    label: "Dark Mode",
    description: "For your inner night owl.",
    category: "Appearance & Theme",
  },
  {
    id: "highContrast",
    label: "High-contrast mode",
    description: "Make things pop, accessibility-style.",
    category: "Appearance & Theme",
  },
  {
    id: "animateFloatingEffects",
    label: "Animate floating ‘Agree/Disagree’ effects",
    description: "Because we all deserve a little flair. Or keep it chill.",
    category: "Appearance & Theme",
  },
  {
    id: "multiColoredWhyBoxes",
    label: "Multi-colored ‘Why’ boxes",
    description: "Life’s too short for just one color.",
    category: "Appearance & Theme",
  },

  // Direct Messages (DMs)
  {
    id: "allowDMsEveryone",
    label: "Allow DMs from everyone",
    description: "You’re an open book. Or maybe not.",
    category: "Direct Messages (DMs)",
  },
  {
    id: "allowDMsFollowers",
    label: "Allow DMs only from followers",
    description: "Friendly circle only.",
    category: "Direct Messages (DMs)",
  },
  {
    id: "noDMs",
    label: "Don’t allow DMs at all",
    description: "Anti-social? Anti-noise? We got you.",
    category: "Direct Messages (DMs)",
  },

  // Circles & Community
  {
    id: "autoJoinCircles",
    label: "Auto-join suggested Circles",
    description: "Let us match you to your tribe automatically.",
    category: "Circles & Community",
  },
  {
    id: "showPostsPublicFeed",
    label: "Show my posts in public home feed",
    description: "For the extroverts.",
    category: "Circles & Community",
  },
  {
    id: "showPostsCirclesOnly",
    label: "Only show my posts in my Circles",
    description: "For the cozy, private vibes.",
    category: "Circles & Community",
  },

  // Extras & Fun
  {
    id: "showEditedTag",
    label: "Show 'edited' tag on my edited Wyras",
    description: "Honesty is the best policy — or you can keep it stealthy.",
    category: "Extras & Fun",
  },
  {
    id: "showFavoritesPublicly",
    label: "Show favourites publicly on my profile",
    description: "Flex your taste — or keep your faves secret.",
    category: "Extras & Fun",
  },
  {
    id: "showLikesDislikes",
    label: "Show who liked/disliked my Wyras",
    description: "Names or just numbers? Your call.",
    category: "Extras & Fun",
  },
  {
    id: "enableFloatingReactions",
    label: "Enable floating reactions (Agree/Disagree)",
    description: "It’s extra. But extra is fun.",
    category: "Extras & Fun",
  },
];

export default function AccountPrivacySettings() {
  // Track toggle states per setting id (default all false)
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    settings.forEach((s) => (initialState[s.id] = false));
    return initialState;
  });

  const handleToggle = (id: string) => {
    setToggles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Group settings by category
  const groupedSettings = settings.reduce<Record<string, Setting[]>>((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-8 text-gray-800">
      {Object.entries(groupedSettings).map(([category, settings]) => (
        <section key={category}>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">{category}</h2>
          <div className="space-y-4">
            {settings.map(({ id, label, description }) => (
              <div key={id} className="flex items-center justify-between">
                <div>
                  <label htmlFor={id} className="font-medium cursor-pointer">
                    {label}
                  </label>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id={id}
                    checked={toggles[id]}
                    onChange={() => handleToggle(id)}
                    className="w-5 h-5 cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-10 text-center text-gray-600 text-sm">
        ✨ Need help? Questions? Just shoot us an email at{" "}
        <a href="mailto:info@wyra.xyz" className="text-indigo-600 underline">
          info@wyra.xyz
        </a>{" "}
        — we actually read them.
      </footer>
    </div>
  );
}
