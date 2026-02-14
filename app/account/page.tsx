"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStoredOrders } from "@/lib/order-storage";

function UserIcon({ size = 48 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
    );
}

function PackageIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    );
}

function MailIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function LogOutIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
    );
}

export default function AccountPage() {
    const router = useRouter();
    const { user, status, signOut } = useAuth();
    const [orderCount, setOrderCount] = useState<number | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        if (user?.email) {
            getStoredOrders(user.email).then((orders) => {
                setOrderCount(orders.length);
            }).catch(() => setOrderCount(0));
        }
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-b from-[#070e09] via-[#064E3B] to-[#070e09] text-white flex justify-center items-center">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#ffd700]/30 border-t-[#ffd700] rounded-full animate-spin" />
                    <p className="text-white/50">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="w-full px-6 lg:px-12 py-8 min-h-screen pt-24 bg-gradient-to-b from-[#070e09] via-[#064E3B] to-[#070e09] text-white">
            <h1 className="text-4xl font-bold mb-8 text-[#ffd700]" style={{ fontFamily: "var(--font-display)" }}>
                My Account
            </h1>

            {/* Profile Card */}
            <div className="bg-white/[0.03] rounded-2xl backdrop-blur-xl border border-white/[0.06] p-6 mb-6">
                <div className="flex items-center gap-5">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name || "Profile"}
                            className="w-16 h-16 rounded-full border-2 border-[#ffd700]/20"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-[#ffd700]/20 flex items-center justify-center bg-white/[0.05] text-[#ffd700]/60">
                            <UserIcon size={32} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-semibold text-white">
                            {user.name || "User"}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-white/50 text-base">
                            <MailIcon size={14} />
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 sm:grid-cols-2">
                <button
                    onClick={() => router.push("/orders")}
                    className="bg-white/[0.03] rounded-2xl backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.12] transition-all p-5 text-left cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#ffd700]/[0.08] flex items-center justify-center text-[#ffd700]/70">
                            <PackageIcon />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">My Orders</h3>
                            <p className="text-sm text-white/40">
                                {orderCount === null
                                    ? "Loading..."
                                    : orderCount === 0
                                      ? "No orders yet"
                                      : `${orderCount} order${orderCount !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={handleSignOut}
                    className="bg-white/[0.03] rounded-2xl backdrop-blur-xl border border-white/[0.06] hover:border-red-500/20 transition-all p-5 text-left cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500/[0.08] flex items-center justify-center text-red-400/70 group-hover:text-red-400">
                            <LogOutIcon />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white group-hover:text-red-300">Sign Out</h3>
                            <p className="text-sm text-white/40">Log out of your account</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
