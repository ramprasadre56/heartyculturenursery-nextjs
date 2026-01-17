"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { signIn } from 'next-auth/react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [inputValue, setInputValue] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
    const [otp, setOtp] = useState('');
    const [view, setView] = useState<'login' | 'otp'>('login');
    const [loading, setLoading] = useState(false);

    // Common Country Codes
    const COUNTRY_CODES = [
        { code: '+91', country: 'India', flag: '🇮🇳' },
    ];

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue) return;

        setLoading(true);

        try {
            if (loginMethod === 'email') {
                const { error } = await supabase.auth.signInWithOtp({ email: inputValue });
                if (error) throw error;
                alert('Check your email for the magic link!');
                onClose();
            } else {
                // Phone Flow
                const fullPhoneNumber = `${countryCode}${inputValue}`;
                const { error } = await supabase.auth.signInWithOtp({ phone: fullPhoneNumber });
                if (error) throw error;
                setView('otp');
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            alert(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;
        setLoading(true);
        try {
            const fullPhoneNumber = `${countryCode}${inputValue}`;
            const { error } = await supabase.auth.verifyOtp({
                phone: fullPhoneNumber,
                token: otp,
                type: 'sms'
            });
            if (error) throw error;
            onClose();
            window.location.reload(); // Refresh to update UI state
        } catch (error: any) {
            console.error('OTP Verification failed:', error);
            alert(error.message || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#fcf8e3] w-full max-w-md rounded-lg p-8 relative shadow-2xl border-4 border-[#1a472a]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#1a472a] hover:text-red-500 font-bold text-xl"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#1a472a] mb-2 font-serif">Namaskaram</h2>
                    <p className="text-[#1a472a]/80 text-sm">
                        {view === 'login'
                            ? "Check flow if you have an account, and help create one if you don't."
                            : `Enter the code sent to ${countryCode} ${inputValue}`
                        }
                    </p>
                </div>

                {view === 'login' ? (
                    <>
                        {/* Tabs */}
                        <div className="flex mb-6 border-b border-[#1a472a]/20">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('phone')}
                                className={`flex-1 pb-2 text-sm font-semibold transition-colors ${loginMethod === 'phone'
                                    ? 'text-[#1a472a] border-b-2 border-[#1a472a]'
                                    : 'text-[#1a472a]/40 hover:text-[#1a472a]/70'
                                    }`}
                            >
                                Phone
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('email')}
                                className={`flex-1 pb-2 text-sm font-semibold transition-colors ${loginMethod === 'email'
                                    ? 'text-[#1a472a] border-b-2 border-[#1a472a]'
                                    : 'text-[#1a472a]/40 hover:text-[#1a472a]/70'
                                    }`}
                            >
                                Email
                            </button>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4 mb-6">
                            <div>
                                {loginMethod === 'phone' ? (
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="h-full appearance-none bg-white border border-[#1a472a]/20 rounded p-3 pr-8 focus:outline-none focus:border-[#1a472a] text-[#1a472a]"
                                            >
                                                {COUNTRY_CODES.map((c) => (
                                                    <option key={c.code} value={c.code}>
                                                        {c.code}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="m6 9 6 6 6-6"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))} // Only numbers
                                            className="flex-1 p-3 rounded border border-[#1a472a]/20 bg-white focus:outline-none focus:border-[#1a472a] text-[#1a472a] placeholder-[#1a472a]/40"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="w-full p-3 rounded border border-[#1a472a]/20 bg-white focus:outline-none focus:border-[#1a472a] text-[#1a472a] placeholder-[#1a472a]/40"
                                        required
                                    />
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1a472a] hover:bg-[#143620] text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-70"
                            >
                                {loading ? 'Processing...' : 'Continue'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#1a472a]/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#fcf8e3] text-[#1a472a]/60">or login with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="space-y-3">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        style={{ fill: '#4285F4' }}
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        style={{ fill: '#34A853' }}
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        style={{ fill: '#FBBC05' }}
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        style={{ fill: '#EA4335' }}
                                    />
                                </svg>
                                Google
                            </button>
                        </div>
                    </>
                ) : (
                    /* OTP Verification Form */
                    <form onSubmit={handleVerifyOtp} className="space-y-4 mb-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Enter Verification Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-3 rounded border border-[#1a472a]/20 bg-white focus:outline-none focus:border-[#1a472a] text-[#1a472a] placeholder-[#1a472a]/40 text-center tracking-widest text-lg"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1a472a] hover:bg-[#143620] text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="w-full text-sm text-[#1a472a] hover:underline"
                        >
                            ← Back to Sign In
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-xs text-[#1a472a]/60">
                    By clicking on Continue, you accept our{' '}
                    <a href="#" className="underline hover:text-[#c04b28]">Terms of Service</a> and{' '}
                    <a href="#" className="underline hover:text-[#c04b28]">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
