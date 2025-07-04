"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/btn";
import { Circle } from "@/actions/types";

interface Props {
  userId: string;
  onSelect: (circleIds: string[]) => void;
  onCancel: () => void;
  circles: Circle[];
}

export default function CircleMultiSelectModal({ userId, onSelect, onCancel, circles }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const supabase = createClient();

  const toggleCircle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={true} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">
            Share this Wyra with your circles?
          </Dialog.Title>
          {circles.length === 0 ? (
            <p className="text-gray-500">You don’t have any circles yet.</p>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {circles.map((circle) => (
                <li key={circle.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(circle.id)}
                    onChange={() => toggleCircle(circle.id)}
                  />
                  <span>{circle.name}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button btnText="Cancel" onClick={onCancel} />
            <Button
              btnText="Post Wyra"
              onClick={() => onSelect(selected)}
              className="bg-blue-600 text-white"
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
