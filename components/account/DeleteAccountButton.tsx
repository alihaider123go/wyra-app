import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/actions/auth";

// ✅ Function to update user status in database
async function updateUserStatus(email: string, status: "active" | "deactivate") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({ status })
    .eq("email", email);

  if (error) {
    console.error("Error updating user status:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Status updated successfully" };
}

const DeleteAccountButton = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [showFinalOptions, setShowFinalOptions] = useState<boolean>(false);

  const reasons = [
    "Too many notifications",
    "I found a better alternative",
    "Privacy concerns",
    "Other",
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedReason("");
    setShowFinalOptions(false);
  };

  const handleContinue = () => {
    if (!selectedReason) return alert("Please select a reason before proceeding.");
    setShowFinalOptions(true);
  };

  const handleFinalAction = async (action: "deactivate" | "delete") => {
    setLoading(true);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const email = user?.email || "";

    if (!email) {
      alert("No user found. Please login again.");
      setLoading(false);
      return;
    }

    if (action === "deactivate") {
      // ✅ Update status to deactivate
      const { success, message } = await updateUserStatus(email, "deactivate");
      setLoading(false);
      setIsModalOpen(false);

      if (success) {
        // alert("Your account has been deactivated. You can restore it anytime.");
       await signOut();
      } else {
        alert("Error: " + message);
      }
    } else {
      // ✅ Placeholder for permanent delete
      setTimeout(() => {
        setLoading(false);
        setIsModalOpen(false);
        // alert("Your account has been permanently deleted.");
        // TODO: Call delete API to remove from auth & database
      }, 2000);
    }
  };

  return (
    <>
      {/* Main Delete Button */}
      <Button
        disabled={loading}
        onClick={handleOpenModal}
        className="w-full h-14 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Deleting Account...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </>
        )}
      </Button>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col justify-center items-center gap-1">
                {showFinalOptions ? "Confirm Action" : "Delete Account"}
              </ModalHeader>

              <ModalBody>
                {!showFinalOptions ? (
                  <>
                    <p className="text-center">
                      We’d love to know why you are leaving us. Please select a reason:
                    </p>
                    <div className="flex flex-col gap-3 mt-3">
                      {reasons.map((reason) => (
                        <label
                          key={reason}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="deleteReason"
                            value={reason}
                            checked={selectedReason === reason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="accent-red-600 w-4 h-4"
                          />
                          <span className="text-sm">{reason}</span>
                        </label>
                      ))}
                    </div>

                    {selectedReason && (
                      <p className="text-center text-sm text-gray-600 mt-3">
                        We’re sorry to hear this. We’ll work on improving. 
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-center">
                      What would you like to do with your account?
                    </p>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      <strong>Deactivate:</strong> You can restore your account anytime.
                      <br />
                      <strong>Delete Permanently:</strong> All data will be lost forever.
                    </p>
                  </>
                )}
              </ModalBody>

              <ModalFooter className="flex justify-between gap-2">
                {!showFinalOptions ? (
                  <>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold rounded-lg shadow-md"
                      onClick={() => onClose()}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!selectedReason}
                      className="w-full h-12 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleContinue}
                    >
                      Continue
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold rounded-lg shadow-md"
                      onClick={() => handleFinalAction("deactivate")}
                    >
                      Deactivate Account
                    </Button>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg shadow-md"
                      onClick={() => handleFinalAction("delete")}
                    >
                      Delete Permanently
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteAccountButton;
