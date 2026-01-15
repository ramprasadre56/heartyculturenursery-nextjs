"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const {
        cartItems,
        totalItems,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart
    } = useCart();

    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);

    // Price calculation
    const getPrice = (item: { id?: number; category?: string }) => {
        if (!item.id) return 250;
        const idStr = item.id.toString() + (item.category || '');
        let hash = 0;
        for (let i = 0; i < idStr.length; i++) {
            hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % 400) + 150;
    };

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + getPrice(item) * item.quantity;
    }, 0);

    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;

    const handleApplyPromo = () => {
        if (promoCode.toLowerCase() === 'plants10') {
            setPromoApplied(true);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1a472a] via-[#2d5a3d] to-[#1a472a] pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/20">
                        <div className="text-8xl mb-6">🌱</div>
                        <h1 className="text-3xl font-bold text-white mb-3">Your cart is empty</h1>
                        <p className="text-gray-300 text-lg mb-8">Discover beautiful plants for your space!</p>
                        <Link
                            href="/plants/flowering-shrubs"
                            className="inline-flex items-center gap-2 bg-[#ffd700] text-[#1a472a] px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg"
                        >
                            🌿 Browse Plants
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-4 pb-8 px-6 lg:px-12">
            <div className="w-full max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1a472a] to-[#2d5a3d] rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-lg">🛒</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
                            <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <Link
                        href="/plants/flowering-shrubs"
                        className="hidden md:flex items-center gap-2 text-[#1a472a] font-semibold hover:text-[#2d5a3d] transition-colors text-sm"
                    >
                        ← Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                    {/* Cart Items - Main section */}
                    <div className="space-y-4">
                        {cartItems.map((item, index) => (
                            <div
                                key={item.unique_id}
                                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex gap-6">
                                    {/* Image */}
                                    <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.common_name || item.scientific_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#1a472a] transition-colors">
                                                    {item.common_name !== "Unknown" ? item.common_name : item.scientific_name}
                                                </h3>
                                                <p className="text-gray-500 italic text-sm mt-1">{item.scientific_name}</p>
                                                <span className="inline-flex items-center mt-2 px-3 py-1 bg-gradient-to-r from-[#1a472a]/10 to-[#2d5a3d]/10 text-[#1a472a] text-xs font-semibold rounded-full">
                                                    🌱 {item.category}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-[#1a472a]">₹{(getPrice(item) * item.quantity).toFixed(0)}</p>
                                                <p className="text-sm text-gray-400">₹{getPrice(item)} each</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                                                <button
                                                    onClick={() => decrementQuantity(item.unique_id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600 font-bold text-xl transition-all hover:scale-110"
                                                >
                                                    −
                                                </button>
                                                <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                                                <button
                                                    onClick={() => incrementQuantity(item.unique_id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600 font-bold text-xl transition-all hover:scale-110"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.unique_id)}
                                                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Clear Cart */}
                        <button
                            onClick={clearCart}
                            className="w-full py-3 text-gray-400 hover:text-red-500 font-medium transition-colors"
                        >
                            Clear entire cart
                        </button>
                    </div>

                    {/* Order Summary - Sticky Sidebar */}
                    <div>
                        <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Promo Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter code"
                                        disabled={promoApplied}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20 outline-none transition-all disabled:bg-gray-50"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoApplied}
                                        className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        {promoApplied ? '✓' : 'Apply'}
                                    </button>
                                </div>
                                {promoApplied && (
                                    <p className="text-green-600 text-sm mt-2">✨ 10% discount applied!</p>
                                )}
                                <p className="text-gray-400 text-xs mt-1">Try: PLANTS10</p>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-medium">-₹{discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total</span>
                                    <span className="text-2xl font-bold text-[#1a472a]">₹{total.toFixed(0)}</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Link
                                href="/checkout"
                                className="block w-full py-4 bg-gradient-to-r from-[#1a472a] to-[#2d5a3d] text-white text-center font-bold text-lg rounded-xl hover:from-[#143821] hover:to-[#1a472a] transition-all hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Proceed to Checkout
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-gray-600 text-sm">
                                    <span className="text-lg">💳</span>
                                    <span>Secure payment via Razorpay</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Checkout Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl lg:hidden z-50">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-xl font-bold text-[#1a472a]">₹{total.toFixed(0)}</p>
                        </div>
                        <Link
                            href="/checkout"
                            className="flex-1 py-4 bg-gradient-to-r from-[#1a472a] to-[#2d5a3d] text-white text-center font-bold rounded-xl"
                        >
                            Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
