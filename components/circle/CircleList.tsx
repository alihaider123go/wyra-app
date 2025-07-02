import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Users, X } from "lucide-react";
import CircleDetailModal from "./CircleDetailModal";
import { uploadFiles } from "@/actions/common";
import type { User } from "@supabase/supabase-js";

interface CircleListProps {
  currentUser: User | null;
}

export default function CircleList({ currentUser }: CircleListProps) {
  const supabase = createClient();
  const [circles, setCircles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [createCircleName, setCreateCircleName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [circleToDelete, setCircleToDelete] = useState<null | { id: string; name: string }>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCircles = async () => {
    if (!currentUser) {
      setCircles([]);
      return;
    }

    const { data, error } = await supabase
      .from("circles")
      .select("id, name, icon, circle_members(count)")
      .eq("created_by", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setCircles(data || []);
  };

  useEffect(() => {
    fetchCircles();
  }, [currentUser]);

  const handleCreateCircle = async () => {
    if (!createCircleName.trim() || !currentUser) return;

    setUploading(true);

    let iconUrl = null;
    if (iconFile) {
      const uploaded = await uploadFiles(
        [iconFile],
        currentUser.id,
        "circle-icons"
      );
      if (uploaded.length === 0) {
        alert("Failed to upload icon image");
        setUploading(false);
        return;
      }
      iconUrl = uploaded[0].publicUrl;
    }

    const { error } = await supabase.from("circles").insert({
      name: createCircleName.trim(),
      icon: iconUrl,
      created_by: currentUser.id,
    });

    if (error) {
      console.error(error);
      alert("Failed to create circle");
      setUploading(false);
      return;
    }

    setCreateCircleName("");
    setIconFile(null);
    setShowModal(false);
    setUploading(false);
    fetchCircles();
  };

  const handleDeleteCircle = async () => {
    if (!circleToDelete) return;

    setDeleting(true);
    const { error } = await supabase
      .from("circles")
      .delete()
      .eq("id", circleToDelete.id);

    setDeleting(false);
    setCircleToDelete(null);

    if (error) {
      console.error(error);
      alert("Failed to delete circle");
      return;
    }

    fetchCircles();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">My Circles</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
          aria-label="Create new circle"
          disabled={!currentUser}
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {circles.map((circle) => (
          <div
            key={circle.id}
            onClick={() => setSelectedCircleId(circle.id)}
            className="w-full text-left bg-white border rounded-lg p-4 shadow hover:bg-gray-50 transition flex items-center gap-3 cursor-pointer"
          >
            {circle.icon ? (
              <img
                src={circle.icon}
                alt={`${circle.name} icon`}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                {circle.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{circle.name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Users size={16} /> {circle.circle_members[0]?.count || 0} members
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCircleToDelete({ id: circle.id, name: circle.name });
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Create Circle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
              aria-label="Close create circle modal"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Circle</h2>
            <input
              type="text"
              value={createCircleName}
              onChange={(e) => setCreateCircleName(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Circle name"
              disabled={uploading}
            />
            <label className="block mb-4">
              <span className="text-sm font-medium mb-1 block">
                Upload Icon (optional)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setIconFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-gray-600"
                disabled={uploading}
              />
            </label>

            <button
              onClick={handleCreateCircle}
              disabled={uploading || !createCircleName.trim()}
              className={`px-4 py-2 rounded-lg w-full text-white ${
                uploading || !createCircleName.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uploading ? "Uploading..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Circle Detail Modal */}
      {selectedCircleId && (
        <CircleDetailModal
          circleId={selectedCircleId}
          onClose={() => {
            setSelectedCircleId(null);
            fetchCircles();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {circleToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setCircleToDelete(null)}
              aria-label="Close delete circle modal"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">Delete Circle</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{circleToDelete.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setCircleToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCircle}
                disabled={deleting}
                className={`flex-1 py-2 rounded-lg text-white ${
                  deleting ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
