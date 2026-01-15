
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayPaymentError {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
    };
}

interface RazorpayOptions {
    key: string | undefined;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: { name: string; email: string };
    notes: { address: string };
    theme: { color: string };
    modal: { ondismiss: () => void };
}

interface RazorpayInstance {
    on: (event: string, callback: (response: RazorpayPaymentError) => void) => void;
    open: () => void;
}

interface SavedAddress {
    id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    zip_code: string;
    country: string;
    is_default: boolean;
}

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    // Address management
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Load saved addresses
    const fetchAddresses = useCallback(async () => {
        if (!session?.user?.email) return;

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_email', session.user.email)
            .order('is_default', { ascending: false });

        if (!error && data) {
            setSavedAddresses(data);
            // Auto-select default address and populate formData
            const defaultAddr = data.find((a: SavedAddress) => a.is_default);
            const selectedAddr = defaultAddr || data[0];
            if (selectedAddr) {
                setSelectedAddressId(selectedAddr.id);
                // Also populate formData with the selected address
                setFormData(prev => ({
                    ...prev,
                    fullName: selectedAddr.full_name,
                    phone: selectedAddr.phone || '',
                    address: selectedAddr.address_line1,
                    city: selectedAddr.city,
                    state: selectedAddr.state || '',
                    zip: selectedAddr.zip_code,
                }));
            }
        }
    }, [session?.user?.email]);

    useEffect(() => {
        fetchAddresses();
        // Pre-fill email from session
        if (session?.user?.email) {
            setFormData(prev => ({ ...prev, email: session.user?.email || '' }));
        }
        if (session?.user?.name) {
            setFormData(prev => ({ ...prev, fullName: session.user?.name || '' }));
        }
    }, [session, fetchAddresses]);

    const getPrice = (item: { id?: string; unique_id?: string; category?: string }) => {
        if (!item.id && !item.unique_id) return 250;
        const idStr = (item.id || '') + (item.category || '');
        let hash = 0;
        for (let i = 0; i < idStr.length; i++) {
            hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % 400) + 150;
    };

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + getPrice(item) * item.quantity;
    }, 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = async () => {
        if (!session?.user?.email) {
            setError('Please sign in to save addresses');
            return;
        }

        setSavingAddress(true);
        try {
            // Check for duplicate address
            const { data: existing } = await supabase
                .from('addresses')
                .select('id')
                .eq('user_email', session.user.email)
                .eq('address_line1', formData.address)
                .eq('zip_code', formData.zip)
                .single();

            if (existing) {
                setError('This address is already saved. Please select it from the list.');
                setSavingAddress(false);
                return;
            }

            const { data, error: insertError } = await supabase
                .from('addresses')
                .insert({
                    user_email: session.user.email,
                    full_name: formData.fullName,
                    phone: formData.phone,
                    address_line1: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zip,
                    is_default: savedAddresses.length === 0
                })
                .select()
                .single();

            if (insertError) throw insertError;


            setSavedAddresses([...savedAddresses, data]);
            setSelectedAddressId(data.id);
            setShowAddressForm(false);
            setFormData({ fullName: '', email: session.user.email, phone: '', address: '', city: '', state: '', zip: '' });
        } catch (err: unknown) {
            console.error('Failed to save address:', err);
            setError('Failed to save address');
        } finally {
            setSavingAddress(false);
        }
    };

    const selectAddress = (address: SavedAddress) => {
        setSelectedAddressId(address.id);
        setFormData({
            fullName: address.full_name,
            email: session?.user?.email || '',
            phone: address.phone || '',
            address: address.address_line1,
            city: address.city,
            state: address.state || '',
            zip: address.zip_code,
        });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!razorpayLoaded) {
            setError("Payment system is loading. Please try again.");
            setLoading(false);
            return;
        }

        // Validate we have address info
        if (!formData.fullName || !formData.address || !formData.city || !formData.zip) {
            setError("Please fill in all required address fields");
            setLoading(false);
            return;
        }

        try {
            const orderResponse = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: subtotal,
                    currency: 'INR',
                    receipt: `order_${Date.now()}`
                })
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const { orderId, amount, currency } = await orderResponse.json();

            const options: RazorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: 'Horticulture Nursery',
                description: 'Plant Order',
                image: '/logo.png',
                order_id: orderId,
                handler: async function (response: RazorpayResponse) {
                    const verifyResponse = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        const { saveOrder } = await import('@/lib/order-storage');
                        const enrichedItems = cartItems.map(item => ({
                            ...item,
                            price: Math.round(getPrice(item) * 100)
                        }));
                        await saveOrder(response.razorpay_order_id, enrichedItems, {
                            paymentId: response.razorpay_payment_id,
                            status: 'paid'
                        });

                        clearCart();
                        router.push(`/orders/${response.razorpay_order_id}`);
                    } else {
                        setError('Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.fullName,
                    email: formData.email,
                },
                notes: {
                    address: `${formData.address}, ${formData.city}, ${formData.zip}`
                },
                theme: {
                    color: '#1a472a'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response: RazorpayPaymentError) {
                setError(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            razorpay.open();

        } catch (err: unknown) {
            console.error(err);
            setError(`Failed to place order: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
                {/* Shipping Details - NOW ON LEFT */}
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-md border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">Delivery Address</h2>
                    {error && <div className="bg-red-500/50 text-white p-3 rounded mb-4">{error}</div>}

                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && !showAddressForm && (
                        <div className="space-y-3 mb-4">
                            <p className="text-sm text-gray-300 mb-2">Your saved addresses ({savedAddresses.length})</p>
                            {savedAddresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    onClick={() => selectAddress(addr)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedAddressId === addr.id
                                        ? 'border-[#ffd700] bg-[#ffd700]/10'
                                        : 'border-white/20 hover:border-white/40'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            checked={selectedAddressId === addr.id}
                                            onChange={() => selectAddress(addr)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{addr.full_name}</p>
                                            <p className="text-sm text-gray-300">{addr.address_line1}</p>
                                            <p className="text-sm text-gray-300">
                                                {addr.city}, {addr.state} {addr.zip_code}
                                            </p>
                                            {addr.phone && <p className="text-sm text-gray-400">Phone: {addr.phone}</p>}
                                            {addr.is_default && (
                                                <span className="inline-block mt-1 text-xs bg-[#ffd700]/20 text-[#ffd700] px-2 py-0.5 rounded">Default</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setShowAddressForm(true)}
                                className="text-[#ffd700] text-sm hover:underline"
                            >
                                + Add a new delivery address
                            </button>
                        </div>
                    )}

                    {/* Add New Address Form */}
                    {(savedAddresses.length === 0 || showAddressForm) && (
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }} className="space-y-4">
                            {showAddressForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(false)}
                                    className="text-gray-400 text-sm hover:text-white mb-2"
                                >
                                    ← Back to saved addresses
                                </button>
                            )}
                            <div>
                                <label className="block text-sm mb-1 text-gray-200">Full Name *</label>
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
                                <label className="block text-sm mb-1 text-gray-200">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-200">Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="House no, Building, Street, Area"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 text-gray-200">City *</label>
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
                                    <label className="block text-sm mb-1 text-gray-200">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-200">PIN Code *</label>
                                <input
                                    type="text"
                                    name="zip"
                                    required
                                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                    value={formData.zip}
                                    onChange={handleInputChange}
                                    placeholder="6 digit PIN code"
                                />
                            </div>

                            {session?.user?.email ? (
                                <button
                                    type="submit"
                                    disabled={savingAddress}
                                    className="w-full bg-white/20 text-white font-bold py-2 rounded hover:bg-white/30 transition-colors disabled:opacity-50"
                                >
                                    {savingAddress ? 'Saving...' : 'Save & Use This Address'}
                                </button>
                            ) : (
                                <p className="text-sm text-gray-400">Sign in to save addresses for future use</p>
                            )}
                        </form>
                    )}
                </div>

                {/* Order Summary - NOW ON RIGHT with Sticky Position */}
                <div className="sticky top-24 h-fit">
                    <div className="bg-white/10 p-6 rounded-lg backdrop-blur-md border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">Order Summary</h2>

                        {/* Place Order Button - At Top */}
                        {(selectedAddressId || (!showAddressForm && formData.address)) && (
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-[#ffd700] text-[#1a472a] font-semibold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 mb-4 shadow-md text-sm"
                            >
                                {loading ? 'Processing...' : '🛒 Place Order'}
                            </button>
                        )}

                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                            {cartItems.map((item) => (
                                <div key={item.unique_id} className="flex gap-3 border-b border-white/20 pb-3">
                                    {/* Product Image */}
                                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.common_name || item.scientific_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                                        )}
                                    </div>
                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white text-sm truncate">{item.common_name || item.scientific_name}</p>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                    {/* Price */}
                                    <p className="text-[#ffd700] font-semibold text-sm flex-shrink-0">₹{(getPrice(item) * item.quantity).toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-4 font-bold text-lg border-t border-white/30 mt-4">
                            <span>Total</span>
                            <span className="text-[#ffd700] text-xl">₹{subtotal.toFixed(0)}</span>
                        </div>

                        {/* Trust badges */}
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-xs text-gray-400 flex items-center gap-2">💳 Secure payment via Razorpay</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
