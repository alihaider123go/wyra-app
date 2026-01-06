"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Paperclip, Plus, Users } from "lucide-react";
import CircleDetailModal from "./CircleDetailModal";
import { uploadFiles } from "@/actions/common";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";

interface CircleListProps {
  userId: string | undefined;
}

export default function CircleList({ userId }: CircleListProps) {
  const supabase = createClient();

  const [circles, setCircles] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);

  const [createCircleName, setCreateCircleName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [iconUpdateCircleId, setIconUpdateCircleId] = useState<string | null>(
    null
  );
  const [newIconFile, setNewIconFile] = useState<File | null>(null);
  const [iconUpdating, setIconUpdating] = useState(false);

  const [circleToDelete, setCircleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showAllCircles, setShowAllCircles] = useState(false);

  const fetchCircles = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("circles")
      .select(
        `
        id,
        name,
        icon,
        circle_members(count),
        wyra_circles(count)
      `
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    setCircles(data || []);
  };

  useEffect(() => {
    fetchCircles();
  }, [userId]);

  /* ---------------- CREATE ---------------- */
  const handleCreateCircle = async () => {
    if (!createCircleName.trim() || !userId) return;

    setUploading(true);
    let iconUrl = null;

    if (iconFile) {
      const uploaded = await uploadFiles([iconFile], userId, "circle-icons");
      if (!uploaded.length) return alert("Icon upload failed");
      iconUrl = uploaded[0].publicUrl;
    }

    await supabase.from("circles").insert({
      name: createCircleName.trim(),
      icon: iconUrl,
      created_by: userId,
    });

    setUploading(false);
    setCreateCircleName("");
    setIconFile(null);
    setShowCreateModal(false);
    fetchCircles();
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteCircle = async () => {
    if (!circleToDelete) return;

    setDeleting(true);
    await supabase.from("circles").delete().eq("id", circleToDelete.id);
    setDeleting(false);

    setCircleToDelete(null);
    setShowDeleteModal(false);
    fetchCircles();
  };

  /* ---------------- UPDATE ICON ---------------- */
  const handleUpdateCircleIcon = async () => {
    if (!newIconFile || !iconUpdateCircleId || !userId) return;

    setIconUpdating(true);
    const uploaded = await uploadFiles([newIconFile], userId, "circle-icons");
    if (!uploaded.length) return alert("Upload failed");

    await supabase
      .from("circles")
      .update({ icon: uploaded[0].publicUrl })
      .eq("id", iconUpdateCircleId);

    setIconUpdating(false);
    setNewIconFile(null);
    setIconUpdateCircleId(null);
    setShowIconModal(false);
    fetchCircles();
  };

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2"
        >
          <Plus size={18} /> Create Circle
        </button>

        {(showAllCircles ? circles : circles.slice(0, 3)).map((circle) => (
          <div
            key={circle.id}
            onClick={() => {
              setSelectedCircleId(circle.id);
              setShowDetailsModal(true);
            }}
            className="bg-white dark:bg-black rounded-xl border shadow hover:shadow-md p-4 flex flex-col items-center gap-3 cursor-pointer"
          >
            {/* ICON CLICK TO UPDATE */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIconUpdateCircleId(circle.id);
                setShowIconModal(true);
              }}
              className="relative group w-20 h-20 cursor-pointer"
            >
              {/* IMAGE / FALLBACK */}
              {circle.icon ? (
                <img
                  src={`${circle.icon}?t=${Date.now()}`}
                  alt={circle.name}
                  className="w-20 h-20 rounded-full object-cover transition-all duration-300 group-hover:blur-[2px]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white transition-all duration-300 group-hover:blur-[2px]">
                  {circle.name[0]?.toUpperCase()}
                </div>
              )}

              {/* OVERLAY */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* PENCIL ICON */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                <Pencil size={20} className="text-white drop-shadow-md" />
              </div>
            </div>

            <h3 className="font-semibold">{circle.name}</h3>

            <p className="text-sm flex gap-1 items-center">
              <Users size={14} /> {circle.circle_members[0]?.count || 0} Members
            </p>

            <p className="text-sm flex gap-1 items-center">
              <Paperclip size={14} /> {circle.wyra_circles[0]?.count || 0} Wyras
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCircleToDelete({ id: circle.id, name: circle.name });
                setShowDeleteModal(true);
              }}
              className="text-xs text-red-500"
            >
              Delete
            </button>
          </div>
        ))}

        {circles.length > 3 && (
          <Button
            variant="ghost"
            onClick={() => setShowAllCircles(!showAllCircles)}
            className="w-full h-full flex justify-center items-center text-blue-600 hover:text-blue-800"
          >
            {showAllCircles
              ? "Show Less"
              : `See ${circles.length - 3} More Circles`}
          </Button>
        )}
      </div>

      {/* CREATE MODAL */}
      {/* Create Circle Modal */}
      <Modal isOpen={showCreateModal} hideCloseButton={true}>
        <ModalContent>
          <ModalHeader className="flex flex-col justify-center items-center gap-1">
            Create New Circle
          </ModalHeader>
          <ModalBody>
            {" "}
            <div className="space-y-2">
              <Label
                htmlFor="circleName"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {" "}
                Circle Name{" "}
              </Label>
              <Input
                id="circleName"
                type="text"
                value={createCircleName}
                onChange={(e) => setCreateCircleName(e.target.value)}
                placeholder="Circle Name"
                disabled={uploading}
                className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white dark:bg-black/90 backdrop-blur-sm"
                required
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label
                htmlFor="circleIcon"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {" "}
                Upload Icon (optional){" "}
              </Label>
              <Input
                id="circleIcon"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setIconFile(e.target.files[0]);
                  }
                }}
                disabled={uploading}
                className="text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white dark:bg-black/90 backdrop-blur-sm"
                required
              />{" "}
            </div>{" "}
          </ModalBody>{" "}
          <ModalFooter className="flex justify-between">
            {" "}
            <Button
              className="w-full h-14 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white dark:text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={() => setShowCreateModal(!showCreateModal)}
            >
              {" "}
              Cancel{" "}
            </Button>
            <Button
              onClick={handleCreateCircle}
              disabled={uploading || !createCircleName.trim()}
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white dark:text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {" "}
              {uploading ? "Uploading..." : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* UPDATE ICON MODAL */}
      <Modal isOpen={showIconModal} hideCloseButton>
        <ModalContent>
          <ModalHeader>Update Circle Icon</ModalHeader>
          <ModalBody>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setNewIconFile(e.target.files?.[0] || null)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowIconModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCircleIcon}
              disabled={iconUpdating || !newIconFile}
            >
              {iconUpdating ? "Updating..." : "Update"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DETAILS MODAL */}
      {selectedCircleId && (
        <Modal isOpen={showDetailsModal} hideCloseButton>
          <ModalContent>
            <ModalBody>
              <CircleDetailModal
                circleId={selectedCircleId}
                onClose={() => {
                  setSelectedCircleId(null);
                  setShowDetailsModal(false);
                  fetchCircles();
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {/* Delete Confirmation Modal */}
      {circleToDelete && (
        <Modal isOpen={showDeleteModal} hideCloseButton={true}>
          <ModalContent>
            <ModalHeader className="flex flex-col justify-center items-center gap-1">
              Delete Circle
            </ModalHeader>
            <ModalBody className="text-center">
              {" "}
              <p className="mb-4">
                {" "}
                Are you sure you want to delete{" "}
                <span className="font-semibold">{circleToDelete.name}</span>?
                This action cannot be undone.{" "}
              </p>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <Button
                className="w-full h-14 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white dark:text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={() => setShowDeleteModal(!showDeleteModal)}
              >
                Cancel{" "}
              </Button>
              <Button
                onClick={handleDeleteCircle}
                disabled={deleting}
                className="w-full h-14 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white dark:text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {" "}
                {deleting ? "Deleting..." : "Delete"}{" "}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
