"use client";

import { useState } from "react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: "pushNotifications",
    label: "Push notifications",
    description: "So you never miss a juicy Wyra. Or turn off for total zen.",
  },
  {
    id: "emailNotifications",
    label: "Email notifications",
    description: "A little inbox spice — or silence.",
  },
  {
    id: "dmNotifications",
    label: "DM notifications",
    description: "Because sometimes “slide into my DMs” is a good thing.",
  },
  {
    id: "followNotifications",
    label: "Someone follows me",
    description: "A little ego boost. Or nah.",
  },
  {
    id: "responseNotifications",
    label: "Someone responds to my Wyra",
    description: "Who picked what? And why? Stay in the loop.",
  },
  {
    id: "likeDislikeNotifications",
    label: "Someone likes/dislikes my Wyra",
    description: "Feel the love. Or the spicy disagreement.",
  },
  {
    id: "commentNotifications",
    label: "Someone comments on my Wyra",
    description: "Keep the convo going — or keep it quiet.",
  },
  {
    id: "newTrendingNotifications",
    label: "New trending Wyras posted",
    description: "For the FOMO-prone.",
  },
];

export default function NotificationsSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    notificationSettings.forEach((s) => (initialState[s.id] = false));
    return initialState;
  });

  const handleToggle = (id: string) => {
    setToggles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
                checked={toggles[id]}
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
