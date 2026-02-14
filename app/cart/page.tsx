"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatSizeDisplay } from '@/lib/data';

export default function CartPage() {
    const {
        cartItems,
        totalItems,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart
    } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#070e09] via-[#064E3B] to-[#070e09] pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-12 text-center border border-white/[0.06]">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.04] flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.5)" strokeWidth="1.5">
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Your cart is empty</h1>
                        <p className="text-white/50 text-xl mb-8">Discover beautiful plants for your space</p>
                        <Link
                            href="/plants/flowering-shrubs"
                            className="inline-flex items-center gap-2 bg-[#ffd700] text-[#064E3B] px-8 py-4 rounded-xl font-bold text-xl hover:bg-[#ffde33] transition-all cursor-pointer"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                            Browse Plants
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#070e09] via-[#064E3B] to-[#070e09] pt-4 pb-8 px-6 lg:px-12">
            <div className="w-full max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center border border-white/[0.08]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.7)" strokeWidth="1.5">
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Shopping Cart</h1>
                            <p className="text-base text-white/40">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <Link
                        href="/plants/flowering-shrubs"
                        className="hidden md:flex items-center gap-2 text-white/50 font-medium hover:text-[#ffd700] transition-colors text-base cursor-pointer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                    {/* Cart Items */}
                    <div className="space-y-3">
                        {cartItems.map((item, index) => (
                            <div
                                key={item.unique_id}
                                className="group bg-white/[0.03] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                            >
                                <div className="flex gap-5">
                                    {/* Image */}
                                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/[0.04] flex-shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.common_name || item.scientific_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
                                                    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                                                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-white group-hover:text-[#ffd700] transition-colors">
                                                    {item.common_name !== "Unknown" ? item.common_name : item.scientific_name}
                                                </h3>
                                                <p className="text-white/35 italic text-base mt-0.5">{item.scientific_name}</p>
                                                <span className="inline-flex items-center mt-2 px-3 py-1 bg-white/[0.04] text-white/50 text-sm font-medium rounded-full border border-white/[0.06]">
                                                    {item.category}
                                                </span>
                                                {item.sizeSelection && (
                                                    <span className="inline-flex items-center mt-1 ml-1 px-3 py-1 bg-[#ffd700]/[0.06] text-[#ffd700]/70 text-sm font-medium rounded-full border border-[#ffd700]/[0.1]">
                                                        {formatSizeDisplay(item.sizeSelection)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                                            <div className="flex items-center gap-1 bg-white/[0.04] rounded-full p-1 border border-white/[0.06]">
                                                <button
                                                    onClick={() => decrementQuantity(item.unique_id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/60 font-bold text-xl transition-all cursor-pointer"
                                                >
                                                    −
                                                </button>
                                                <span className="w-10 text-center font-bold text-white text-base">{item.quantity}</span>
                                                <button
                                                    onClick={() => incrementQuantity(item.unique_id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/60 font-bold text-xl transition-all cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.unique_id)}
                                                className="flex items-center gap-2 px-3 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] rounded-lg font-medium transition-colors text-base cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="w-full py-3 text-white/20 hover:text-red-400/60 font-medium transition-colors text-base cursor-pointer"
                        >
                            Clear entire cart
                        </button>
                    </div>

                    {/* Quote Summary - Sticky Sidebar */}
                    <div>
                        <div className="sticky top-24 bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06]">
                            <h2 className="text-2xl font-bold text-[#ffd700] mb-6 pb-4 border-b border-white/[0.06]" style={{ fontFamily: 'var(--font-display)' }}>Quote Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-white/50">
                                    <span>{totalItems} {totalItems === 1 ? 'item' : 'items'} selected</span>
                                </div>
                                <p className="text-base text-white/35">Add the plants you want and request a quote. We&apos;ll get back to you with pricing and availability.</p>
                            </div>

                            {/* Request Quote Button */}
                            <Link
                                href="/checkout"
                                className="block w-full py-4 bg-[#ffd700] text-[#064E3B] text-center font-bold text-xl rounded-xl hover:bg-[#ffde33] transition-all cursor-pointer"
                            >
                                Request Quote
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Checkout Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#064E3B]/95 backdrop-blur-xl border-t border-white/[0.06] lg:hidden z-50">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-base text-white/40">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                        </div>
                        <Link
                            href="/checkout"
                            className="flex-1 py-4 bg-[#ffd700] text-[#064E3B] text-center font-bold rounded-xl cursor-pointer"
                        >
                            Request Quote
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
