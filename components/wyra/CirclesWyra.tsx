"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Wyra } from "@/actions/types";
import WyraSection from "./Wyra";

export default function CirclesWyras({
    wyras,
    fetchWyras,
    searchTerm,
    postId
}: any) {
    const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

    const wyrasByCircle = useMemo(() => {
        const grouped: Record<string, Wyra[]> = {};
        wyras.forEach((wyra: any) => {
            wyra.circles?.forEach((circle: any) => {
                if (!grouped[circle.id]) grouped[circle.id] = [];
                grouped[circle.id].push(wyra);
            });
        });
        return grouped;
    }, [wyras]);

    // Extract unique circles for tabs
    const circles = useMemo(() => {
        const map: Record<string, string> = {};
        wyras.forEach((wyra: any) => {
            wyra.circles?.forEach((circle: any) => {
                map[circle.id] = circle.name;
            });
        });
        return Object.entries(map).map(([id, name]) => ({ id, name }));
    }, [wyras]);

    useEffect(() => {
        if (circles.length && !selectedCircleId) {
            setSelectedCircleId(circles[0].id); // Default to first circle
        }
    }, [circles, selectedCircleId]);

    if (!wyras.length) {
        return <div className="text-center py-10">No Wyras yet.</div>;
    }

    return (
        <>
            {/* Circle Tabs */}
            {circles.length > 0 && (
                <div className="flex flex-wrap justify-center mt-2 gap-2 mb-6 border-b pb-2">
                    {circles.map(circle => (
                        <button
                            key={circle.id}
                            onClick={() => setSelectedCircleId(circle.id)}
                            className={`px-4 py-2 rounded-full font-medium transition ${selectedCircleId === circle.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                                }`}
                        >
                            {circle.name}
                        </button>
                    ))}
                </div>
            )}

            <WyraSection 
                      wyras={wyrasByCircle[selectedCircleId!]}
                      fetchWyras={fetchWyras}
                      searchTerm={searchTerm}
                      postId={postId}
            />
        </>
    );
}
