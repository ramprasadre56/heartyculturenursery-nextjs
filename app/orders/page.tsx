"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCheckout } from '@/lib/ucp-client';

import { useSession } from 'next-auth/react';

export default function MyOrdersPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [orders, setOrders] = useState<any[]>([]); // Using any for enriched object
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            // Fetch local details (with correct prices)
            const { getStoredOrders } = await import('@/lib/order-storage');
            const storedOrders = await getStoredOrders(session?.user?.email || undefined);

            if (storedOrders.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Try to fetch backend status/details
                const promises = storedOrders.map(order => getCheckout(order.id).catch(err => {
                    console.warn(`Could not fetch backend status for order ${order.id}`, err);
                    return null;
                }));

                const backendResults = await Promise.all(promises);

                // Merge backend data with local details, or use local-only
                const mergedOrders = storedOrders.map(localOrder => {
                    const backendOrder = backendResults.find(
                        (b): b is NonNullable<typeof b> => b !== null && b.id === localOrder.id
                    );

                    if (backendOrder) {
                        return {
                            ...backendOrder,
                            localDetails: localOrder
                        };
                    } else {
                        // Fallback: use local data when backend is unavailable
                        return {
                            id: localOrder.id,
                            status: 'paid',
                            line_items: (localOrder.items || []).map((item: any) => ({
                                item: {
                                    id: item.unique_id || item.id,
                                    name: item.common_name || item.scientific_name || 'Plant',
                                    price: item.price || 0,
                                },
                                quantity: item.quantity || 1
                            })),
                            localDetails: localOrder
                        };
                    }
                });

                setOrders(mergedOrders);
            } catch (err) {
                console.error("Error fetching orders list:", err);
                // Still show local orders on total failure
                const localOnlyOrders = storedOrders.map(localOrder => ({
                    id: localOrder.id,
                    status: 'paid',
                    line_items: (localOrder.items || []).map((item: any) => ({
                        item: {
                            id: item.unique_id || item.id,
                            name: item.common_name || item.scientific_name || 'Plant',
                            price: item.price || 0,
                        },
                        quantity: item.quantity || 1
                    })),
                    localDetails: localOrder
                }));
                setOrders(localOnlyOrders);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [session]);

    // Currency formatter
    const formatPrice = (amount: number, currency = 'INR') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount / 100);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-screen pt-24 bg-[#1a472a] text-white flex justify-center items-center">
                <p className="text-xl">Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen pt-24 bg-[#1a472a] text-white">
            <h1 className="text-3xl font-bold mb-8 text-[#ffd700] text-center">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center bg-white/10 p-8 rounded-lg backdrop-blur-md max-w-2xl mx-auto">
                    <p className="text-xl mb-6">You haven't placed any orders yet.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#ffd700] text-[#1a472a] px-6 py-2 rounded font-bold hover:bg-yellow-400"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 max-w-4xl mx-auto">
                    {orders.map((order) => {
                        // Calculate total from local items if available (stored in cents)
                        // otherwise fallback to backend total
                        let totalAmount = 0;

                        if (order.localDetails?.items && order.localDetails.items.length > 0) {
                            totalAmount = order.localDetails.items.reduce((sum: number, item: any) => {
                                // item.price is stored in cents
                                return sum + ((item.price || 0) * (item.quantity || 1));
                            }, 0);
                        } else {
                            totalAmount = order.totals?.find((t: any) => t.type === 'total')?.amount ||
                                order.line_items.reduce((sum: number, item: any) => sum + (item.item.price * item.quantity), 0);
                        }

                        return (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="bg-white/10 p-6 rounded-lg backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors cursor-pointer flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-[#ffd700] font-mono mb-1">#{order.id}</p>
                                    <p className="text-sm text-gray-300">{order.line_items.length} items</p>
                                    <p className="text-sm capitalize mt-1">Status: <span className="font-bold">{order.status}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">{formatPrice(totalAmount, 'INR')}</p>
                                    <span className="text-xs text-gray-400">View Details &rarr;</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
