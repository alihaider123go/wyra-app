import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Users, X } from "lucide-react";
import CircleDetailModal from "./CircleDetailModal";
import { uploadFiles } from "@/actions/common";
import { Button } from "@/components/ui/button"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CircleListProps {
    userId: string | undefined;
}

export default function AddedCircles({ userId }: CircleListProps) {
    const supabase = createClient();
    const [circles, setCircles] = useState<any[]>([]);
    const [showAllCircles, setShowAllCircles] = useState(false)

    const fetchCircles = async () => {
        if (!userId) {
            setCircles([]);
            return;
        }

        const { data, error } = await supabase
            .from("circles")
            .select(`
      id,
      name,
      icon,
      circle_members!inner (
        count
      )
    `)
            .eq("circle_members.user_id", userId) // Only fetch where you are a member
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setCircles(data?.filter((item)=> item.circle_members[0]?.count !== 0) || []);
        }
    };


    useEffect(() => {
        fetchCircles();
    }, [userId]);



    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {(showAllCircles ? circles : circles.slice(0, 3)).map((circle) => (
                    <div key={circle.id} onClick={() => {
                        // setShowDetailsModal(true);
                        // setSelectedCircleId(circle.id);
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
                        </div>
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
        </>
    );
}
