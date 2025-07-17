"use client";

import React, { useState } from "react";
import CommentModal from "./CommentModal";
import { MessageCircle } from "lucide-react";
import {  Modal,  ModalContent,  ModalHeader,  ModalBody,  ModalFooter} from "@heroui/modal";

interface Props {
  wyraId: string;
  userId: string | undefined;
}

const CommentButton: React.FC<Props> = ({ wyraId, userId }) => {
  const [open, setOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
               <span className="md:block hidden">Comment</span>
      </button>

{/* Circle Detail Modal */}
      {open && (
       <Modal isOpen={open} hideCloseButton={true} isDismissable={true}>
        <ModalContent>
            <ModalBody className="text-center">
              <CommentModal wyraId={wyraId} userId={userId} onClose={() => setOpen(false)} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default CommentButton;