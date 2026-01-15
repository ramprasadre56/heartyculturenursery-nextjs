"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface OrderItem {
    common_name?: string;
    scientific_name?: string;
    quantity: number;
    price: number;
}

interface OrderDetails {
    id: string;
    items: OrderItem[];
    date: string;
}

interface Order {
    id: string;
    user_session_id: string;
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
    const { status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const fetchOrders = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);

            const response = await fetch(`/api/admin/orders?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch orders');
            }

            setOrders(data.orders || []);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateFulfillmentStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, fulfillmentStatus: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Update local state
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

    const getFulfillmentBadge = (status?: string) => {
        const option = FULFILLMENT_OPTIONS.find(o => o.value === status) || FULFILLMENT_OPTIONS[0];
        return <span className={`${option.color} text-white px-2 py-1 rounded text-sm`}>{option.label}</span>;
    };
    // Suppress unused warning - used for future badge display
    void getFulfillmentBadge;

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#1a472a] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a472a] pt-4 px-6 lg:px-12 pb-8">
            <div className="w-full">
                <h1 className="text-2xl font-bold text-[#ffd700] mb-4">Admin Dashboard</h1>

                {/* Filters */}
                <div className="bg-white/10 rounded-lg p-4 mb-6 backdrop-blur-md">
                    <h2 className="text-white font-semibold mb-3">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Status</label>
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
                            <label className="block text-gray-300 text-sm mb-1">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">To Date</label>
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
                                className="w-full bg-[#ffd700] text-[#1a472a] font-bold py-2 px-4 rounded hover:bg-yellow-400"
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
                        <div className="text-3xl font-bold text-[#ffd700]">{orders.length}</div>
                        <div className="text-gray-300">Total Orders</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-md">
                        <div className="text-3xl font-bold text-green-400">
                            {orders.filter(o => o.payment_status === 'paid').length}
                        </div>
                        <div className="text-gray-300">Paid</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-md">
                        <div className="text-3xl font-bold text-yellow-400">
                            {orders.filter(o => !o.fulfillment_status || o.fulfillment_status === 'pending').length}
                        </div>
                        <div className="text-gray-300">Pending Fulfillment</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-md">
                        <div className="text-3xl font-bold text-[#ffd700]">
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
                    <div className="bg-white/10 rounded-lg overflow-hidden backdrop-blur-md">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="text-left p-4 text-[#ffd700]">Order ID</th>
                                    <th className="text-left p-4 text-[#ffd700]">Date</th>
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
                                            <td className="p-4 text-white font-mono text-sm">
                                                {order.id.substring(0, 12)}...
                                            </td>
                                            <td className="p-4 text-gray-300 text-sm">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="p-4 text-white">
                                                {order.details?.items?.length || 0} items
                                            </td>
                                            <td className="p-4 text-[#ffd700] font-bold">
                                                ₹{getOrderTotal(order).toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-sm ${order.payment_status === 'paid'
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
                                                    className="bg-white/10 text-white border border-white/20 rounded p-1 text-sm"
                                                >
                                                    {FULFILLMENT_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-[#1a472a]">
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
                                                <td colSpan={7} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-[#ffd700] font-semibold mb-2">Order Items</h4>
                                                            <ul className="space-y-1">
                                                                {order.details?.items?.map((item, idx) => (
                                                                    <li key={idx} className="text-gray-300">
                                                                        • {item.common_name || item.scientific_name} x{item.quantity} - ₹{(item.price * item.quantity / 100).toFixed(2)}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[#ffd700] font-semibold mb-2">Payment Details</h4>
                                                            <p className="text-gray-300">Payment ID: {order.payment_id || 'N/A'}</p>
                                                            <p className="text-gray-300">Session: {order.user_session_id?.substring(0, 8)}...</p>
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
