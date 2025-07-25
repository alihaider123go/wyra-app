"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
}

interface NotificationProps {
  userId: string | undefined;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: "push_notification",
    label: "Push notifications",
    description: "So you never miss a juicy Wyra. Or turn off for total zen.",
  },
  {
    id: "email_notification",
    label: "Email notifications",
    description: "A little inbox spice — or silence.",
  },
  {
    id: "dm_notification",
    label: "DM notifications",
    description: "Because sometimes “slide into my DMs” is a good thing.",
  },
  {
    id: "follow_me",
    label: "Someone follows me",
    description: "A little ego boost. Or nah.",
  },
  {
    id: "respond_my_wyra",
    label: "Someone responds to my Wyra",
    description: "Who picked what? And why? Stay in the loop.",
  },
  {
    id: "likes_dislikes_my_wyra",
    label: "Someone likes/dislikes my Wyra",
    description: "Feel the love. Or the spicy disagreement.",
  },
  {
    id: "comment_on_my_wyra",
    label: "Someone comments on my Wyra",
    description: "Keep the convo going — or keep it quiet.",
  },
  {
    id: "trending_wyra_posted",
    label: "New trending Wyras posted",
    description: "For the FOMO-prone.",
  },
];

export default function NotificationsSettings({ userId }: NotificationProps) {
  // const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
  //   const initialState: Record<string, boolean> = {};
  //   notificationSettings.forEach((s) => (initialState[s.id] = false));
  //   return initialState;
  // });

  const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});


  const supabase = createClient();


  const handleToggle = async (id: string) => {
  setToggles((prev) => {
    const updated = { ...prev, [id]: !prev[id] };

    supabase
      .from("app_notifications")
      .upsert(
        {
          user_id: userId, // required for upsert to know which row
          [id]: updated[id],
        },
        { onConflict: "user_id" } // ensures it updates if exists, inserts if not
      )
      .then(({ error }) => {
        if (error) console.error("Upsert error:", error);
      });

    return updated;
  });
};

  useEffect(() => {
  async function fetchAllNotificationData() {
    try {
      const { data: notifications, error: notificationError } = await supabase
        .from("app_notifications")
        .select("*")
        .eq("user_id", userId)
        .limit(1); // Only get one row

      if (notificationError) {
        console.error("Notification fetch error:", notificationError);
        return;
      }

      if (notifications && notifications.length > 0) {
        const notification = notifications[0]; // Take first row

        const initialToggles: { [key: string]: boolean } = {};
        notificationSettings.forEach(({ id }) => {
          initialToggles[id] = notification[id] ?? false;
        });

        setToggles(initialToggles);
      } else {
        // No data found → set defaults (optional)
        const defaultToggles: { [key: string]: boolean } = {};
        notificationSettings.forEach(({ id }) => {
          defaultToggles[id] = false;
        });
        setToggles(defaultToggles);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err.message);
    }
  }

  if (userId) fetchAllNotificationData();
}, [userId]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-8 text-gray-800">
      <section>
        <h2 className="text-xl font-semibold mb-6 border-b border-gray-300 pb-2 flex items-center gap-2">
          <span role="img" aria-label="bell">
            🛎️
          </span>{" "}
          Notifications
        </h2>
        <div className="space-y-6">
          {notificationSettings.map(({ id, label, description }) => (
            <div key={id} className="flex items-center justify-between">
              <div>
                <label htmlFor={id} className="font-medium cursor-pointer">
                  {label}
                </label>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              <input
                type="checkbox"
                id={id}
                checked={toggles[id] || false} // Prevent undefined issue
                onChange={() => handleToggle(id)}
                className="w-5 h-5 cursor-pointer accent-indigo-600"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
