"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Setting {
  id: string;
  label: string;
  description: string;
  category: string;
}

const settings: Setting[] = [
  // Account & Privacy
  {
    id: "show_real_name",
    label: "Show my real name on posts",
    description: "Your name is your badge of honor… unless you prefer staying low-key with just your username.",
    category: "Account & Privacy",
  },
  {
    id: "find_by_email",
    label: "Allow people to find me by email",
    description: "For those who love surprise connections. Otherwise? Cloak of invisibility it is.",
    category: "Account & Privacy",
  },
  {
    id: "find_by_phone",
    label: "Allow people to find me by phone number",
    description: "Only for the bold. Or the social butterflies.",
    category: "Account & Privacy",
  },
  {
    id: "show_online_status",
    label: "Show online status",
    description: "Sometimes you wanna glow green. Sometimes you wanna ghost.",
    category: "Account & Privacy",
  },
  {
    id: "show_circles_on_profile",
    label: "Show which Circles I’m in on my profile",
    description: "Wear your Circles proudly — or keep them your little secret.",
    category: "Account & Privacy",
  },
  {
    id: "show_why_answers",
    label: "Let followers see my ‘Why’ answers",
    description: "Share your wisdom… or keep them guessing.",
    category: "Account & Privacy",
  },

  // Appearance & Theme
  {
    id: "dark_mode",
    label: "Dark Mode",
    description: "For your inner night owl.",
    category: "Appearance & Theme",
  },
  {
    id: "high_contrast",
    label: "High-contrast mode",
    description: "Make things pop, accessibility-style.",
    category: "Appearance & Theme",
  },
  {
    id: "animate_floating_effects",
    label: "Animate floating ‘Agree/Disagree’ effects",
    description: "Because we all deserve a little flair. Or keep it chill.",
    category: "Appearance & Theme",
  },
  {
    id: "multi_color_why_boxes",
    label: "Multi-colored ‘Why’ boxes",
    description: "Life’s too short for just one color.",
    category: "Appearance & Theme",
  },

  // Direct Messages (DMs)
  {
    id: "allow_dm_everyone",
    label: "Allow DMs from everyone",
    description: "You’re an open book. Or maybe not.",
    category: "Direct Messages (DMs)",
  },
  {
    id: "allow_dm_followers",
    label: "Allow DMs only from followers",
    description: "Friendly circle only.",
    category: "Direct Messages (DMs)",
  },
  {
    id: "no_dm",
    label: "Don’t allow DMs at all",
    description: "Anti-social? Anti-noise? We got you.",
    category: "Direct Messages (DMs)",
  },

  // Circles & Community
  {
    id: "auto_join_circles",
    label: "Auto-join suggested Circles",
    description: "Let us match you to your tribe automatically.",
    category: "Circles & Community",
  },
  {
    id: "show_posts_public_feed",
    label: "Show my posts in public home feed",
    description: "For the extroverts.",
    category: "Circles & Community",
  },
  {
    id: "show_posts_circles_only",
    label: "Only show my posts in my Circles",
    description: "For the cozy, private vibes.",
    category: "Circles & Community",
  },

  // Extras & Fun
  {
    id: "show_edited_tag",
    label: "Show 'edited' tag on my edited Wyras",
    description: "Honesty is the best policy — or you can keep it stealthy.",
    category: "Extras & Fun",
  },
  {
    id: "show_favorites_publicly",
    label: "Show favourites publicly on my profile",
    description: "Flex your taste — or keep your faves secret.",
    category: "Extras & Fun",
  },
  {
    id: "show_likes_dislikes",
    label: "Show who liked/disliked my Wyras",
    description: "Names or just numbers? Your call.",
    category: "Extras & Fun",
  },
  // {
  //   id: "enable_floating_reactions",
  //   label: "Enable floating reactions (Agree/Disagree)",
  //   description: "It’s extra. But extra is fun.",
  //   category: "Extras & Fun",
  // },
];

interface SettingsProps {
  userId: string | undefined;
}

export default function AccountPrivacySettings({ userId }: SettingsProps) {
  // Track toggle states per setting id (default all false)
  // const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
  //   const initialState: Record<string, boolean> = {};
  //   settings.forEach((s) => (initialState[s.id] = false));
  //   return initialState;
  // });
  const supabase = createClient();

  const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});

  // Group settings by category
  const groupedSettings = settings.reduce<Record<string, Setting[]>>((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {});

  // const handleToggle = (id: string) => {
  //   setToggles((prev) => ({
  //     ...prev,
  //     [id]: !prev[id],
  //   }));
  // };

  const dmSettings = ["allow_dm_everyone", "allow_dm_followers", "no_dm"];


  // ✅ Toggle handler with UPSERT
  const handleToggle = async (id: string) => {
    setToggles((prev) => {
      const updated = { ...prev, [id]: !prev[id] };

      // If this toggle is part of the DM settings group
      if (dmSettings.includes(id) && updated[id]) {
        // Uncheck the other DM options
        dmSettings.forEach((dmId) => {
          if (dmId !== id) updated[dmId] = false;
        });
      }

      if (id === "dark_mode") {
        if (updated[id]) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");

        }
      }

      supabase
        .from("account_settings")
        .upsert(
          {
            user_id: userId,
            ...dmSettings.reduce((acc: any, key: any) => {
              acc[key] = updated[key] ?? false;
              return acc;
            }, {}),
            [id]: updated[id],
          },
          { onConflict: "user_id" }
        )
        .then(({ error }) => {
          if (error) console.error("Upsert error:", error);
        });

      return updated;
    });
  };
  // ✅ Fetch settings on mount
  useEffect(() => {
    async function fetchOrCreateAccountSettings() {
      try {
        // Step 1: Try fetching existing data
        const { data: settingsData, error: fetchError }: any = await supabase
          .from("account_settings")
          .select("*")
          .eq("user_id", userId)
          .limit(1);

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Fetch error:", fetchError);
          return;
        }

        let row = settingsData?.[0];

        // Step 2: If no row, create one with only dark_mode defaulted
        if (!row) {
          const { data: upsertedData, error: upsertError } = await supabase
            .from("account_settings")
            .upsert(
              {
                user_id: userId,
                dark_mode: false, // only set dark_mode initially
              },
              { onConflict: "user_id" }
            )
            .select()
            .single();

          if (upsertError) {
            console.error("Upsert error:", upsertError);
            return;
          }

          row = upsertedData;
        }

        // Step 3: Map row data to toggle state
        const initialToggles: { [key: string]: boolean } = {};
        settings.forEach(({ id }) => {
          initialToggles[id] = row[id] ?? false;
        });

        setToggles(initialToggles);
      } catch (err: any) {
        console.error("Error fetching or creating account settings:", err.message);
      }
    }

    if (userId) fetchOrCreateAccountSettings();
  }, [userId]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-black rounded-lg shadow-md space-y-8 text-gray-800 dark:text-gray-200">
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id={id}
                    checked={toggles[id] || false}
                    onChange={() => handleToggle(id)}
                    className="w-5 h-5 cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-10 text-center text-gray-600 dark:text-gray-300 text-sm">
        ✨ Need help? Questions? Just shoot us an email at{" "}
        <a href="mailto:info@wyra.xyz" className="text-indigo-600 underline">
          info@wyra.xyz
        </a>{" "}
        — we actually read them.
      </footer>
    </div>
  );
}
