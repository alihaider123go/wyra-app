"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { createClient } from "@/utils/supabase/client";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button"

interface UserOption {
  value: string;
  label: string;
  email: string;
}

export default function CircleDetailModal({
  circleId,
  onClose,
}: {
  circleId: string;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [circle, setCircle] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    fetchCircleDetails();
  }, [circleId]);

  const fetchCircleDetails = async () => {
    const { data, error } = await supabase
      .from("circles")
      .select(
        `
      *,
      circle_members (
        id,
        user_profiles (
          id,
          firstname,
          lastname,
          username,
          email
        )
      )
    `
      )
      .eq("id", circleId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setCircle(data);
    setMembers(data?.circle_members || []);

    // Update user options with fresh members
    await fetchUserOptions(data?.circle_members || []);
  };

  // Fetch users excluding current members
  const fetchUserOptions = async (currentMembers: any[] = []) => {
    const { data: allUsers } = await supabase
      .from("user_profiles")
      .select("id, firstname, lastname, username, email");

    const existingUserIds = currentMembers.map((m) => m.user_profiles.id);
    const filtered = (allUsers || []).filter(
      (user) => !existingUserIds.includes(user.id)
    );

    const options: UserOption[] = filtered.map((user) => ({
      value: user.id,
      label: `${user.firstname} ${user.lastname} (${
        user.username ?? user.email
      })`,
      email: user.email,
    }));

    setUserOptions(options);
  };

  const handleAddMembers = async () => {
    if (!selectedUsers.length) return;

    const inserts = selectedUsers.map((user) => ({
      circle_id: circleId,
      user_id: user.value,
    }));

    const { error } = await supabase.from("circle_members").insert(inserts);

    if (error) {
      console.error(error);
      alert("Failed to add members");
      return;
    }

    setSelectedUsers([]);

    // Refresh members and options
    await fetchCircleDetails();

    // Optionally close modal after adding members:
    // onClose();
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase
      .from("circle_members")
      .delete()
      .eq("id", memberId);
    if (error) {
      console.error(error);
      alert("Failed to remove member");
      return;
    }
    await fetchCircleDetails();
  };

  const closeDetailsModal = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[95%] max-w-md relative max-h-[90vh] overflow-y-auto">
        <h2 className="flex items-center justify-center text-2xl font-bold mb-4 gap-2">
          {circle?.icon && (
            <img
              src={circle.icon}
              alt={`${circle.name} icon`}
              className="w-12 h-12 border rounded-full object-cover"
            />
          )}
          {circle?.name} circle members
        </h2>

        <div className="mb-4">
          <Select
            isMulti
            options={userOptions}
            value={selectedUsers}
            onChange={(value) => setSelectedUsers(value as UserOption[])}
            placeholder="Select members to add..."
            className="react-select-container"
            classNamePrefix="react-select"
            noOptionsMessage={() => "No users available"}
          />
        </div>

        {/* <button
          onClick={handleAddMembers}
          disabled={selectedUsers.length === 0}
          className={`px-4 py-2 rounded w-full mb-6 text-white ${
            selectedUsers.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Add Selected Members
        </button> */}

             <div className="flex justify-between gap-4">
                <Button
                onClick={closeDetailsModal}
                className="w-full h-14 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  Close
                </Button>
                <Button
                  onClick={handleAddMembers}
                  disabled={selectedUsers.length === 0}
                  className="w-full h-14 bg-gradient-to-r from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                        Add Selected Members
                </Button>
            </div>

        <ul className="space-y-3 mt-5">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex justify-between items-center border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium text-left">{`${member.user_profiles.firstname} ${member.user_profiles.lastname}`}</p>
                <p className="text-sm text-gray-600">
                  {member.user_profiles.email}
                </p>
              </div>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="text-red-600 hover:text-red-800"
                aria-label={`Remove ${member.user_profiles.firstname} from circle`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
          {members.length === 0 && (
            <p className="text-center text-gray-500">
              No members yet in this circle.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
