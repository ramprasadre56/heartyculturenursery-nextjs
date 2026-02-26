"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { formatSizeDisplay } from '@/lib/data';

// Admin emails whitelist
const ADMIN_EMAILS = ['ramprasadre56@gmail.com', 'govindashorticulture@ghnursery.in'];

interface OrderItem {
    common_name?: string;
    scientific_name?: string;
    quantity: number;
    price: number;
    sizeSelection?: {
        containerType: 'grow_bag' | 'pp_pot';
        size: string;
        weightKg: number;
        categoryLabel: string;
    };
}

interface OrderDetails {
    id: string;
    items: OrderItem[];
    date: string;
    customer?: {
        name: string;
        email: string;
        phone: string;
    };
    shipping?: {
        address: string;
        city: string;
        state: string;
        zip: string;
    };
}

interface Order {
    id: string;
    user_session_id: string;
    user_email?: string;
    details: OrderDetails;
    payment_id?: string;
    payment_status?: string;
    fulfillment_status?: string;
    created_at: string;
}

const FULFILLMENT_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-500' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export default function AdminDashboard() {
    const { user, status } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const fetchOrders = React.useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            const ordersRef = collection(db, 'orders');

            // Use simple queries to avoid composite index requirements
            let q;
            if (statusFilter && statusFilter !== 'all') {
                q = query(ordersRef, where('payment_status', '==', statusFilter));
            } else {
                q = query(ordersRef);
            }

            const snapshot = await getDocs(q);
            let fetchedOrders: Order[] = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
            } as Order));

            // Filter by date range in JavaScript
            if (dateFrom) {
                fetchedOrders = fetchedOrders.filter(o => o.created_at && o.created_at >= dateFrom);
            }
            if (dateTo) {
                fetchedOrders = fetchedOrders.filter(o => o.created_at && o.created_at <= dateTo + 'T23:59:59');
            }

            // Sort by created_at descending
            fetchedOrders.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

            setOrders(fetchedOrders);
            setError(null);
        } catch (err: unknown) {
            console.error('Admin fetch error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch orders');
            }
        } finally {
            setLoading(false);
        }
    }, [statusFilter, dateFrom, dateTo, isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
        } else if (status !== 'loading') {
            setLoading(false);
        }
    }, [fetchOrders, isAdmin, status]);

    const updateFulfillmentStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                fulfillment_status: newStatus,
            });

            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, fulfillment_status: newStatus }
                    : order
            ));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update order status');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getOrderTotal = (order: Order) => {
        if (!order.details?.items) return 0;
        return order.details.items.reduce((sum, item) => sum + (item.price * item.quantity) / 100, 0);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#059669] flex items-center justify-center">
                <div className="text-white text-2xl">Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#059669] pt-24 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-2xl mb-4">Access Denied</p>
                    <p className="text-gray-400 mb-4">You don&apos;t have admin access.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#ffd700] text-[#059669] font-bold py-2 px-6 rounded hover:bg-yellow-400"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#059669] pt-20 px-6 lg:px-12 pb-8">
            <div className="w-full">
                <h1 className="text-3xl font-bold text-[#ffd700] mb-4">Admin Dashboard</h1>

                {/* Filters */}
                <div className="bg-white/10 rounded-lg p-4 mb-6 backdrop-blur-md">
                    <h2 className="text-white font-semibold mb-3">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-gray-300 text-base mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-base mb-1">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-base mb-1">To Date</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchOrders}
                                className="w-full bg-[#ffd700] text-[#059669] font-bold py-2 px-4 rounded hover:bg-yellow-400"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/50 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Orders Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-md">
                        <div className="text-4xl font-bold text-[#ffd700]">{orders.length}</div>
                        <div className="text-gray-300">Total Orders</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-md">
                        <div className="text-4xl font-bold text-green-400">
                            {orders.filter(o => o.payment_status === 'paid').length}
                        </div>
                        <div className="text-gray-300">Paid</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-md">
                        <div className="text-4xl font-bold text-yellow-400">
                            {orders.filter(o => !o.fulfillment_status || o.fulfillment_status === 'pending').length}
                        </div>
                        <div className="text-gray-300">Pending Fulfillment</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-md">
                        <div className="text-4xl font-bold text-[#ffd700]">
                            ₹{orders.reduce((sum, o) => sum + getOrderTotal(o), 0).toFixed(0)}
                        </div>
                        <div className="text-gray-300">Total Revenue</div>
                    </div>
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="text-white text-center py-8">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-white text-center py-8">No orders found</div>
                ) : (
                    <div className="bg-white/10 rounded-lg overflow-x-auto backdrop-blur-md">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="text-left p-4 text-[#ffd700]">Order ID</th>
                                    <th className="text-left p-4 text-[#ffd700]">Date</th>
                                    <th className="text-left p-4 text-[#ffd700]">Customer</th>
                                    <th className="text-left p-4 text-[#ffd700]">Items</th>
                                    <th className="text-left p-4 text-[#ffd700]">Total</th>
                                    <th className="text-left p-4 text-[#ffd700]">Payment</th>
                                    <th className="text-left p-4 text-[#ffd700]">Fulfillment</th>
                                    <th className="text-left p-4 text-[#ffd700]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr className="border-t border-white/10 hover:bg-white/5">
                                            <td className="p-4 text-white font-mono text-base">
                                                {order.id.substring(0, 12)}...
                                            </td>
                                            <td className="p-4 text-gray-300 text-base">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="p-4 text-gray-300 text-base">
                                                {order.details?.customer?.name || order.user_email || '—'}
                                            </td>
                                            <td className="p-4 text-white">
                                                {order.details?.items?.length || 0} items
                                            </td>
                                            <td className="p-4 text-[#ffd700] font-bold">
                                                ₹{getOrderTotal(order).toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-base ${order.payment_status === 'paid'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-yellow-500 text-black'
                                                    }`}>
                                                    {order.payment_status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={order.fulfillment_status || 'pending'}
                                                    onChange={(e) => updateFulfillmentStatus(order.id, e.target.value)}
                                                    className="bg-white/10 text-white border border-white/20 rounded p-1 text-base"
                                                >
                                                    {FULFILLMENT_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-[#059669]">
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    className="text-[#ffd700] hover:text-yellow-400"
                                                >
                                                    {expandedOrder === order.id ? '▲ Hide' : '▼ Details'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrder === order.id && (
                                            <tr className="bg-white/5">
                                                <td colSpan={8} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-[#ffd700] font-semibold mb-2">Order Items</h4>
                                                            <ul className="space-y-1">
                                                                {order.details?.items?.map((item, idx) => (
                                                                    <li key={idx} className="text-gray-300">
                                                                        • {item.common_name || item.scientific_name} x{item.quantity} - ₹{(item.price * item.quantity / 100).toFixed(2)}
                                                                        {item.sizeSelection && (
                                                                            <span className="ml-2 text-sm bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded-full">
                                                                                {formatSizeDisplay(item.sizeSelection)}
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[#ffd700] font-semibold mb-2">Payment Details</h4>
                                                            <p className="text-gray-300">Payment ID: {order.payment_id || 'N/A'}</p>
                                                            <p className="text-gray-300">User Email: {order.user_email || 'N/A'}</p>
                                                            <p className="text-gray-300">Session: {order.user_session_id?.substring(0, 8)}...</p>
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/20 pt-4 mt-2">
                                                            <div>
                                                                <h4 className="text-[#ffd700] font-semibold mb-2">Customer Details</h4>
                                                                {order.details?.customer ? (
                                                                    <>
                                                                        <p className="text-gray-300"><span className="text-gray-400">Name:</span> {order.details.customer.name}</p>
                                                                        <p className="text-gray-300"><span className="text-gray-400">Email:</span> {order.details.customer.email}</p>
                                                                        <p className="text-gray-300"><span className="text-gray-400">Phone:</span> {order.details.customer.phone}</p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-gray-400 italic">No customer details available</p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[#ffd700] font-semibold mb-2">Shipping Address</h4>
                                                                {order.details?.shipping ? (
                                                                    <>
                                                                        <p className="text-gray-300">{order.details.shipping.address}</p>
                                                                        <p className="text-gray-300">{order.details.shipping.city}, {order.details.shipping.state} - {order.details.shipping.zip}</p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-gray-400 italic">No shipping address available</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
