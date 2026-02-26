"use client";

import { useState } from 'react';
import { Plant } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import SizeSelectorModal from '@/components/SizeSelectorModal';

export default function PlantResultCard({ plant }: { plant: Plant }) {
    const { addToCart } = useCart();
    const [showSizeModal, setShowSizeModal] = useState(false);

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                <div className="aspect-[4/3] w-full bg-gray-50 relative overflow-hidden">
                    {plant.image ? (
                        <img
                            src={plant.image}
                            alt={plant.common_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5">
                                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                        {plant.common_name !== "Unknown" ? plant.common_name : plant.scientific_name}
                    </p>
                    <p className="text-xs text-gray-500 italic truncate">{plant.scientific_name}</p>
                    <div>
                        <span className="inline-block mt-2 mb-2 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                            {plant.category}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowSizeModal(true)}
                        className="w-full mt-auto bg-white border border-gray-300 text-blue-600 text-sm font-medium py-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                    >
                        Select Size
                    </button>
                </div>
            </div>

            {showSizeModal && (
                <SizeSelectorModal
                    isOpen={showSizeModal}
                    plant={plant}
                    onSelectSize={(p, size) => {
                        addToCart(p, size);
                        setShowSizeModal(false);
                    }}
                    onClose={() => setShowSizeModal(false)}
                />
            )}
        </>
    );
}
