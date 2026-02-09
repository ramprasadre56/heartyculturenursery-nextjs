
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        notes: '',
    });

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
            const defaultAddr = data.find((a: SavedAddress) => a.is_default);
            const selectedAddr = defaultAddr || data[0];
            if (selectedAddr) {
                setSelectedAddressId(selectedAddr.id);
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
        if (session?.user?.email) {
            setFormData(prev => ({ ...prev, email: session.user?.email || '' }));
        }
        if (session?.user?.name) {
            setFormData(prev => ({ ...prev, fullName: session.user?.name || '' }));
        }
    }, [session, fetchAddresses]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = async () => {
        if (!session?.user?.email) {
            setError('Please sign in to save addresses');
            return;
        }

        setSavingAddress(true);
        try {
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
            setFormData({
                fullName: data.full_name,
                email: session?.user?.email || '',
                phone: data.phone || '',
                address: data.address_line1,
                city: data.city,
                state: data.state || '',
                zip: data.zip_code,
                notes: formData.notes,
            });
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
            notes: formData.notes,
        });
    };

    const handleRequestQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.fullName || !formData.phone) {
            setError("Please provide your name and phone number");
            setLoading(false);
            return;
        }

        try {
            const quoteId = `QUOTE_${Date.now()}`;
            const { saveOrder } = await import('@/lib/order-storage');
            const enrichedItems = cartItems.map(item => ({
                ...item,
                price: 0
            }));
            await saveOrder(quoteId, enrichedItems, {
                paymentId: 'QUOTE',
                status: 'pending',
                paymentMethod: 'quote',
                userEmail: session?.user?.email || formData.email,
                customer: {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone
                },
                shipping: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip
                },
                notes: formData.notes,
            });

            clearCart();
            router.push(`/orders/${quoteId}`);
        } catch (err: unknown) {
            console.error(err);
            setError(`Failed to submit quote request: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="w-full px-6 lg:px-12 py-8 text-center text-white min-h-screen pt-24 bg-[#1a472a] flex flex-col justify-center items-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="mb-4">Go back to shop and add some plants!</p>
                <button className="bg-[#ffd700] text-black px-6 py-2 rounded font-bold hover:bg-yellow-400" onClick={() => router.push('/')}>
                    Shop Now
                </button>
            </div>
        );
    }

    return (
        <div className="w-full px-6 lg:px-12 py-8 text-white min-h-screen pt-24 bg-[#1a472a]">
            <h1 className="text-3xl font-bold mb-2 text-center text-[#ffd700]">Request a Quote</h1>
            <p className="text-center text-gray-300 mb-8 text-sm">Tell us where to deliver and we&apos;ll get back with the best price</p>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 w-full">
                {/* Selected Plants — Main Area */}
                <div>
                    <div className="bg-white/10 p-6 lg:p-8 rounded-2xl backdrop-blur-md border border-white/10">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-[#ffd700]">Your Selection</h2>
                                <span className="text-xs bg-[#ffd700]/20 text-[#ffd700] px-2.5 py-0.5 rounded-full font-semibold">
                                    {cartItems.length} {cartItems.length === 1 ? 'plant' : 'plants'}
                                </span>
                            </div>
                            {/* View Toggle */}
                            <div className="flex bg-white/10 rounded-lg p-0.5 gap-0.5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/20 text-[#ffd700]' : 'text-gray-400 hover:text-white'}`}
                                    aria-label="Grid view"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/20 text-[#ffd700]' : 'text-gray-400 hover:text-white'}`}
                                    aria-label="List view"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {cartItems.map((item) => (
                                    <div key={item.unique_id} className="bg-white/10 rounded-xl border border-white/10 overflow-hidden hover:border-[#ffd700]/40 transition-all hover:shadow-lg hover:shadow-[#ffd700]/5">
                                        <div className="aspect-[4/3] w-full bg-white/5 relative">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.common_name || item.scientific_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                                            )}
                                            <span className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <div className="p-2.5">
                                            <p className="font-semibold text-white text-xs truncate">{item.common_name !== "Unknown" ? item.common_name : item.scientific_name}</p>
                                            <p className="text-[10px] text-gray-400 italic truncate">{item.scientific_name}</p>
                                            {item.category && (
                                                <span className="inline-block mt-1.5 text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-full">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="space-y-2">
                                {cartItems.map((item) => (
                                    <div key={item.unique_id} className="flex items-center gap-4 bg-white/10 rounded-xl border border-white/10 p-3 hover:border-[#ffd700]/40 transition-all">
                                        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.common_name || item.scientific_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white text-sm truncate">{item.common_name !== "Unknown" ? item.common_name : item.scientific_name}</p>
                                            <p className="text-xs text-gray-400 italic truncate">{item.scientific_name}</p>
                                        </div>
                                        {item.category && (
                                            <span className="hidden sm:inline-block text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full flex-shrink-0">
                                                {item.category}
                                            </span>
                                        )}
                                        <span className="text-xs bg-[#ffd700]/20 text-[#ffd700] px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                                            x{item.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-white/15">
                            <p className="text-sm text-gray-300">
                                We&apos;ll review your selection and share the best price via phone or email.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact & Delivery — Compact Sidebar */}
                <div className="lg:sticky lg:top-24 h-fit space-y-4">
                    {/* Submit Quote Button — Always Visible at Top */}
                    {(selectedAddressId || formData.fullName) && (
                        <button
                            onClick={handleRequestQuote}
                            disabled={loading}
                            className="w-full bg-[#ffd700] text-[#1a472a] font-bold py-4 px-4 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-lg text-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {loading ? 'Submitting...' : '📋 Request Quote'}
                        </button>
                    )}

                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                        <h2 className="text-lg font-semibold mb-4 text-[#ffd700]">Your Details</h2>
                        {error && <div className="bg-red-500/50 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>}

                        {/* Saved Addresses */}
                        {savedAddresses.length > 0 && !showAddressForm && (
                            <div className="space-y-2 mb-4">
                                <p className="text-xs text-gray-400 mb-1">Saved addresses</p>
                                {savedAddresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => selectAddress(addr)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${selectedAddressId === addr.id
                                            ? 'border-[#ffd700] bg-[#ffd700]/10'
                                            : 'border-white/20 hover:border-white/40'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="radio"
                                                checked={selectedAddressId === addr.id}
                                                onChange={() => selectAddress(addr)}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{addr.full_name}</p>
                                                <p className="text-xs text-gray-300 truncate">{addr.address_line1}, {addr.city}</p>
                                                {addr.phone && <p className="text-xs text-gray-400">{addr.phone}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(true)}
                                    className="text-[#ffd700] text-xs hover:underline"
                                >
                                    + Add new address
                                </button>
                            </div>
                        )}

                        {/* Address Form */}
                        {(savedAddresses.length === 0 || showAddressForm) && (
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }} className="space-y-3">
                                {showAddressForm && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressForm(false)}
                                        className="text-gray-400 text-xs hover:text-white mb-1"
                                    >
                                        ← Back to saved addresses
                                    </button>
                                )}
                                <div>
                                    <label className="block text-xs mb-1 text-gray-300">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-gray-300">Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 XXXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-gray-300">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="House no, Building, Street, Area"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs mb-1 text-gray-300">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs mb-1 text-gray-300">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs mb-1 text-gray-300">PIN Code</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        placeholder="6 digit PIN code"
                                    />
                                </div>

                                {session?.user?.email ? (
                                    <button
                                        type="submit"
                                        disabled={savingAddress}
                                        className="w-full bg-white/15 text-white font-semibold py-2 rounded-lg hover:bg-white/25 transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {savingAddress ? 'Saving...' : 'Save Address'}
                                    </button>
                                ) : (
                                    <p className="text-xs text-gray-400">Sign in to save addresses</p>
                                )}
                            </form>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                        <h2 className="text-lg font-semibold mb-3 text-[#ffd700]">Notes</h2>
                        <textarea
                            name="notes"
                            className="w-full p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] min-h-[70px] resize-y"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Plant sizes, quantity details, special requests..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
