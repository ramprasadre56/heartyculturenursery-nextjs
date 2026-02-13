"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCheckout } from '@/lib/ucp-client';
import { formatSizeDisplay } from '@/lib/data';

import { useAuth } from '@/context/AuthContext';

export default function MyOrdersPage() {
    const router = useRouter();
    const { user, status } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (status === 'loading') return;

            const { getStoredOrders } = await import('@/lib/order-storage');
            const storedOrders = await getStoredOrders(user?.email || undefined);

            if (storedOrders.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const promises = storedOrders.map(order => getCheckout(order.id).catch(err => {
                    console.warn(`Could not fetch backend status for order ${order.id}`, err);
                    return null;
                }));

                const backendResults = await Promise.all(promises);

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
                        return {
                            id: localOrder.id,
                            status: localOrder.payment_status || 'pending',
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
                const localOnlyOrders = storedOrders.map(localOrder => ({
                    id: localOrder.id,
                    status: localOrder.payment_status || 'pending',
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
    }, [user, status]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-b from-[#070e09] via-[#0f2e1a] to-[#070e09] text-white flex justify-center items-center px-4">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#ffd700]/30 border-t-[#ffd700] rounded-full animate-spin"></div>
                    <p className="text-white/50">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-6 lg:px-12 py-8 min-h-screen pt-24 bg-gradient-to-b from-[#070e09] via-[#0f2e1a] to-[#070e09] text-white">
            <h1 className="text-3xl font-bold mb-8 text-[#ffd700]" style={{ fontFamily: 'var(--font-display)' }}>My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center bg-white/[0.03] p-8 rounded-2xl backdrop-blur-xl border border-white/[0.06]">
                    <p className="text-lg mb-6 text-white/50">You haven&apos;t placed any orders yet.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#ffd700] text-[#0f2e1a] px-6 py-3 rounded-xl font-bold hover:bg-[#ffde33] transition-all cursor-pointer"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 w-full">
                    {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="bg-white/[0.03] p-5 rounded-2xl backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer flex justify-between items-center"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#ffd700]/80 font-mono text-sm mb-1">#{order.id}</p>
                                    <p className="text-sm text-white/40 mb-1">{order.line_items.length} items</p>
                                    {order.localDetails?.items?.slice(0, 3).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-white/35">
                                                {item.common_name || item.scientific_name} x{item.quantity || 1}
                                            </span>
                                            {item.sizeSelection && (
                                                <span className="text-[10px] bg-[#ffd700]/[0.06] text-[#ffd700]/60 px-1.5 py-0.5 rounded-full border border-[#ffd700]/[0.1]">
                                                    {formatSizeDisplay(item.sizeSelection)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {order.localDetails?.items?.length > 3 && (
                                        <span className="text-xs text-white/20">+{order.localDetails.items.length - 3} more</span>
                                    )}
                                    <p className="text-sm capitalize mt-1 text-white/50">Status: <span className="font-semibold text-white/70">{order.status}</span></p>
                                </div>
                                <div className="text-right">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </div>
                            </div>
                    ))}
                </div>
            )}
        </div>
    );
}
