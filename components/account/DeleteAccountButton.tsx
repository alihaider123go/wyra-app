import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {  Modal,  ModalContent,  ModalHeader,  ModalBody,  ModalFooter} from "@heroui/modal";

const DeleteAccountButton = () => {

    const [loading, setLoading] = useState<boolean>(false);
    // const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    const handleSubmit = (isModaOpen: boolean) => {
        setLoading(true);
        setIsModalOpen(isModaOpen);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }

    return (
        <>
            <Button
                disabled={loading}
                onClick={() => handleSubmit(true)}
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

            <Modal isOpen={isModalOpen}>
                <ModalContent>
                    <ModalHeader className="flex flex-col justify-center items-center gap-1">Delete Account</ModalHeader>
                    <ModalBody>
                        <p className="text-center">
                            All your data, settings, and saved content will be permanently removed.
                        </p>
                        <p className="text-center">
                            Are you sure you want to proceed?
                        </p>
                    </ModalBody>
                    <ModalFooter className="flex justify-between">
                        <Button className="w-full h-14 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" onClick={() => handleSubmit(false)}>
                        No
                        </Button>
                        <Button className="w-full h-14 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" onClick={() => handleSubmit(false)}>
                        Yes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DeleteAccountButton;
