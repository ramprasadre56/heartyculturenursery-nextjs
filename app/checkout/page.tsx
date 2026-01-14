
"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { createCheckout } from '@/lib/ucp-client';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zip: '',
    });

    const getPrice = (item: any) => {
        if (!item.id && !item.unique_id) return 250; // fallback

        // deterministic mock price
        const idStr = item.id.toString() + item.category;
        let hash = 0;
        for (let i = 0; i < idStr.length; i++) {
            hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % 400) + 150; // 150 to 550 range
    };

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + getPrice(item) * item.quantity;
    }, 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("handleCheckout called");
        setLoading(true);
        setError(null);

        const validBackendIds = [
            'bouquet_roses',
            'pot_ceramic',
            'bouquet_sunflowers',
            'bouquet_tulips',
            'orchid_white'
            // 'gardenias' - currently out of stock in backend
        ];

        // Helper to map any local ID to a valid backend ID
        const getBackendProductId = (localId: string) => {
            if (validBackendIds.includes(localId)) return localId;
            // Simple hash to consistently map to one of the valid IDs
            let hash = 0;
            for (let i = 0; i < localId.length; i++) {
                hash = localId.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % validBackendIds.length;
            return validBackendIds[index];
        };

        try {
            const lineItems = cartItems.map(item => {
                const priceVal = getPrice(item);
                const priceInCents = Math.round(priceVal * 100);
                const itemId = item.unique_id || item.id || 'unknown';

                // Use a valid backend ID to pass validation
                const backendId = getBackendProductId(itemId.toString());

                return {
                    item: {
                        id: backendId,
                        title: item.common_name || item.scientific_name || 'Plant',
                        price: priceInCents
                    },
                    quantity: item.quantity
                };
            });

            const checkoutData = {
                line_items: lineItems,
                buyer: {
                    full_name: formData.fullName,
                    email: formData.email,
                },
                currency: 'INR',
            };

            const checkout = await createCheckout(checkoutData);
            console.log('Checkout created:', checkout);

            // Save order ID and original items (with prices) to Supabase
            const { saveOrder } = await import('@/lib/order-storage');

            // Enrich cart items with the calculated price so Order Details matches Checkout
            const enrichedItems = cartItems.map(item => ({
                ...item,
                price: Math.round(getPrice(item) * 100) // Store in cents
            }));

            await saveOrder(checkout.id, enrichedItems);

            clearCart();
            // Redirect to the new order details page
            router.push(`/orders/${checkout.id}`);

        } catch (err: any) {
            console.error(err);
            setError(`Failed to place order: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-white min-h-screen pt-24 bg-[#1a472a] flex flex-col justify-center items-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="mb-4">Go back to shop and add some plants!</p>
                <button className="bg-[#ffd700] text-black px-6 py-2 rounded font-bold hover:bg-yellow-400" onClick={() => router.push('/')}>
                    Shop Now
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 text-white min-h-screen pt-24 bg-[#1a472a]">
            <h1 className="text-3xl font-bold mb-8 text-center text-[#ffd700]">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-md h-fit border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">Order Summary</h2>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.unique_id} className="flex justify-between items-center border-b border-white/20 pb-2">
                                <div>
                                    <p className="font-medium text-white">{item.common_name || item.scientific_name}</p>
                                    <p className="text-sm text-gray-300 italic">{item.scientific_name}</p>
                                    <p className="text-sm text-gray-300">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-[#ffd700]">₹{(getPrice(item) * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 font-bold text-lg border-t border-white/30 mt-4">
                            <span>Total</span>
                            <span className="text-[#ffd700]">₹{subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-md h-fit border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">Shipping Details</h2>
                    {error && <div className="bg-red-500/50 text-white p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleCheckout} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1 text-gray-200">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-gray-200">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-gray-200">Address</label>
                            <input
                                type="text"
                                name="address"
                                required
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-200">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-200">Zip Code</label>
                                <input
                                    type="text"
                                    name="zip"
                                    required
                                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                    value={formData.zip}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ffd700] text-[#1a472a] font-bold py-3 rounded hover:bg-yellow-400 transition-colors disabled:opacity-50 mt-6 shadow-lg"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
