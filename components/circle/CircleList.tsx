import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Users, X } from "lucide-react";
import CircleDetailModal from "./CircleDetailModal";
import { uploadFiles } from "@/actions/common";
import { Button } from "@/components/ui/button"
import {  Modal,  ModalContent,  ModalHeader,  ModalBody,  ModalFooter} from "@heroui/modal";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CircleListProps {
  userId: string | undefined;
}

export default function CircleList({ userId }: CircleListProps) {
  const supabase = createClient();
  const [circles, setCircles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [createCircleName, setCreateCircleName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  
  const [showAllCircles, setShowAllCircles] = useState(false)
  
  const [circleToDelete, setCircleToDelete] = useState<null | {
    id: string;
    name: string;
  }>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCircles = async () => {
    if (!userId) {
      setCircles([]);
      return;
    }

    const { data, error } = await supabase
      .from("circles")
      .select("id, name, icon, circle_members(count)")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setCircles(data || []);
  };

  useEffect(() => {
    fetchCircles();
  }, [userId]);

  const handleCreateCircle = async () => {
    if (!createCircleName.trim() || !userId) return;

    setUploading(true);

    let iconUrl = null;
    if (iconFile) {
      const uploaded = await uploadFiles(
        [iconFile],
        userId,
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
      created_by: userId,
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
    setShowDeleteModal(false);
    fetchCircles();
  };

  return (
    <>
        

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <button
          onClick={() => setShowModal(true)}
          className="flex justify-center items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          <Plus size={18} /> Create Circle
        </button>
        {(showAllCircles ? circles : circles.slice(0, 3)).map((circle) => (
          <div key={circle.id} onClick={() => {
            setShowDetailsModal(true);
            setSelectedCircleId(circle.id);
          }}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-center items-center text-center gap-4 px-4 py-3">
            {circle.icon ? (
              <img
                src={circle.icon}
                alt={`${circle.name} icon`}
                className="w-20 h-20 shadow-2xl p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 rounded-full flex items-center justify-center text-gray-600 font-bold text-4xl  flex justify-center items-center p-1">
                <div className="w-full h-full bg-white rounded-full flex justify-center items-center">
                  {circle.name[0]?.toUpperCase()}
                </div>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">
                {circle.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Users size={14} /> {circle.circle_members[0]?.count || 0}{" "}
                members
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
                setCircleToDelete({ id: circle.id, name: circle.name });
              }}
              className="text-xs text-red-500 hover:text-red-700"
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
              {showAllCircles ? "Show Less" : `See ${circles.length - 3} More Circles`}
            </Button>
          )}
      </div>

      {/* Create Circle Modal */}
      <Modal isOpen={showModal} hideCloseButton={true}>
        <ModalContent>
            <ModalHeader className="flex flex-col justify-center items-center gap-1">Create New Circle</ModalHeader>
            <ModalBody>

              <div className="space-y-2">
                <Label htmlFor="circleName" className="text-sm font-semibold text-gray-700"> Circle Name </Label>
                <Input
                  id="circleName"
                  type="text"
                  value={createCircleName}
                  onChange={(e) => setCreateCircleName(e.target.value)}
                  placeholder="Circle Name"
                  disabled={uploading}
                  className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="circleIcon" className="text-sm font-semibold text-gray-700"> Upload Icon (optional) </Label>
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
                className="text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                required
                />
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-between">
                <Button
                className="w-full h-14 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" onClick={() => setShowModal(!showModal)}>
                  Cancel
                </Button>
                <Button
                onClick={handleCreateCircle}
                disabled={uploading || !createCircleName.trim()} className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {uploading ? "Uploading..." : "Create"}
                </Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Circle Detail Modal */}
      {selectedCircleId && (
       <Modal isOpen={showDetailsModal} hideCloseButton={true}>
        <ModalContent>
            <ModalBody className="text-center">

        <CircleDetailModal
          circleId={selectedCircleId}
          onClose={() => {
            setSelectedCircleId(null);
            fetchCircles();
            setShowDetailsModal(false);
          }}
        />
</ModalBody>

        </ModalContent>
      </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {circleToDelete && (
      <Modal isOpen={showDeleteModal} hideCloseButton={true}>
        <ModalContent>
            <ModalHeader className="flex flex-col justify-center items-center gap-1">Delete Circle</ModalHeader>
            <ModalBody className="text-center">
              <p className="mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{circleToDelete.name}</span>? This
                action cannot be undone.
              </p>
            </ModalBody>

            <ModalFooter className="flex justify-between">
                <Button
                className="w-full h-14 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" onClick={() => setShowDeleteModal(!showDeleteModal)}>
                  Cancel
                </Button>
                <Button
                onClick={handleDeleteCircle}
                disabled={deleting}
                  className="w-full h-14 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {deleting ? "Deleting..." : "Delete"}
                </Button>
            </ModalFooter>
        </ModalContent>
      </Modal>
      )}

    </>
  );
}
