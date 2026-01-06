'use client';

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import { sendReportNotificationToAdmin } from "@/actions/reportWyraEmail";

const REPORT_REASONS = [
  "Harassment or bullying",
  "Hate speech or discrimination",
  "Spam or scams",
  "Inappropriate content",
  "Other",
];

const ReportWyraModal = ({
  showReportModal,
  setShowReportModal,
  username,
  wyraId,
  reporterData,
}: any) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setShowReportModal(false);
    setSelectedReason("");
    setDescription("");
    setIsSubmitted(false);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedReason || isLoading) return;

    setIsLoading(true);

    try {
      await sendReportNotificationToAdmin({
        reporterUsername:
          reporterData?.user_metadata?.firstname
            ? `${reporterData.user_metadata.firstname} ${reporterData.user_metadata.lastname || ""}`
            : "Anonymous",
        reporterEmail: reporterData?.email || "No email",
        reportedUsername: username,
        wyraId,
        reason: selectedReason,
        description,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={showReportModal} hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-1 relative">
          {!isSubmitted ? "Report User" : "🚨 Reported"}

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            aria-label="Close report modal"
          >
            <X className="w-6 h-6" />
          </button>
        </ModalHeader>

        <ModalBody>
          {!isSubmitted ? (
            <>
              <p className="text-sm text-gray-700 mb-4">
                Why are you reporting <strong>@{username}</strong>?
              </p>

              <div className="space-y-3 mb-4">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-black"
                      disabled={isLoading}
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                placeholder="Tell us more (optional)…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full min-h-[90px] border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />

              <p className="text-xs text-gray-600 mt-3">
                We’re here to maintain a safe, welcoming and fun space for everyone
                in Wyra. Thanks for speaking up. 💪
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm rounded-lg border disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason || isLoading}
                  className={`px-4 py-2 text-sm rounded-lg text-white flex items-center gap-2 ${
                    selectedReason && !isLoading
                      ? "bg-black hover:bg-gray-900"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isLoading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm">
                Thanks for reporting <strong>@{username}</strong>.
              </p>

              <p className="text-sm text-gray-600">
                Our Trust & Safety team is on it. We take reports seriously and
                review them as quickly as possible.
              </p>

              <p className="text-sm text-gray-600">
                You can block them too if you’d rather not see their content while
                we review.
              </p>

              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 text-sm rounded-lg bg-black text-white"
              >
                Close
              </button>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReportWyraModal;
