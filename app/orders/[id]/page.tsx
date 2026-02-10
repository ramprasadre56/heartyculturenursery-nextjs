"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCheckout } from '@/lib/ucp-client';
import { getOrderDetailsLocal } from '@/lib/order-storage';
import { formatSizeDisplay } from '@/lib/data';

interface OrderData {
    id: string;
    status: string;
    line_items: Array<{
        id?: string;
        item: { title: string; price: number };
        quantity: number;
    }>;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [localOrderDetails, setLocalOrderDetails] = useState<{
        id: string;
        items?: Array<{
            common_name?: string;
            scientific_name?: string;
            title?: string;
            price?: number;
            image_url?: string;
            image?: string;
            quantity?: number;
        }>;
        payment_status?: string;
    } | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            // Handle case where params might be null or undefined initially
            if (!params?.id) return;

            const orderId = params.id as string;

            // First, try to get local details
            const local = await getOrderDetailsLocal(orderId);
            if (local) setLocalOrderDetails(local);

            try {
                // Try to fetch from backend
                const orderData = await getCheckout(orderId);
                if (orderData) {
                    setOrder(orderData);
                } else {
                    throw new Error("Order not found on backend");
                }
            } catch (err) {
                console.warn("Backend unavailable, using local data:", err);

                // Fallback: construct order from local data
                if (local && local.items && local.items.length > 0) {
                    const fallbackOrder: OrderData = {
                        id: orderId,
                        status: local.payment_status || 'pending',
                        line_items: local.items.map((item, idx) => ({
                            id: `item_${idx}`,
                            item: {
                                title: item.common_name || item.scientific_name || item.title || 'Plant',
                                price: item.price || 0,
                            },
                            quantity: item.quantity || 1
                        }))
                    };
                    setOrder(fallbackOrder);
                } else {
                    setError("Order not found in local storage.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params?.id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-screen pt-24 bg-[#1a472a] text-white flex justify-center items-center">
                <p className="text-xl">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-screen pt-24 bg-[#1a472a] text-white text-center">
                <h1 className="text-3xl font-bold mb-4 text-red-400">Error</h1>
                <p className="mb-6">{error || "Order not found."}</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-[#ffd700] text-[#1a472a] px-6 py-2 rounded font-bold hover:bg-yellow-400"
                >
                    Return Home
                </button>
            </div>
        );
    }

    const itemsToDisplay = order.line_items.map((lineItem, idx) => {
        const localDetails = (localOrderDetails?.items && localOrderDetails.items[idx])
            ? localOrderDetails.items[idx]
            : null;

        const displayTitle = localDetails
            ? (localDetails.common_name || localDetails.scientific_name || localDetails.title)
            : lineItem.item.title;

        return {
            ...lineItem,
            displayTitle,
            displayImage: localDetails?.image_url || (localDetails as any)?.image,
            sizeSelection: (localDetails as any)?.sizeSelection
        };
    });

    return (
        <div className="w-full px-6 lg:px-12 py-8 min-h-screen pt-24 bg-[#1a472a] text-white">
            <div className="w-full">
                <div className="bg-white/10 p-8 rounded-lg backdrop-blur-md border border-white/10 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/20 pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#ffd700] mb-2">Order Confirmed!</h1>
                            <p className="text-gray-300">Order ID: <span className="font-mono text-white">{order.id}</span></p>
                            <p className="text-gray-300">Status: <span className="capitalize text-[#ffd700] font-bold">{order.status}</span></p>
                        </div>
                        <button
                            onClick={() => router.push('/orders')}
                            className="mt-4 md:mt-0 text-[#ffd700] hover:text-white underline"
                        >
                            View All Orders
                        </button>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">Items Ordered</h2>
                        <div className="space-y-4">
                            {itemsToDisplay.map((item, idx) => {
                                return (
                                    <div key={item.id || idx} className="flex justify-between items-center bg-black/20 p-4 rounded">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-white/10 w-16 h-16 rounded flex items-center justify-center text-2xl overflow-hidden">
                                                {item.displayImage ? (
                                                    <img src={item.displayImage} alt={item.displayTitle} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>🌿</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{item.displayTitle}</p>
                                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                                {item.sizeSelection && (
                                                    <span className="inline-block mt-1 text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
                                                        {formatSizeDisplay(item.sizeSelection)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => router.push('/')}
                            className="bg-[#ffd700] text-[#1a472a] px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition-transform hover:scale-105 shadow-lg"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
