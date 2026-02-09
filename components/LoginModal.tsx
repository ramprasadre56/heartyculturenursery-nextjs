"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { signIn } from 'next-auth/react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type View = 'login' | 'check-email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapSupabaseError(message: string): string {
    if (message.includes('rate limit') || message.includes('too many requests')) return 'Too many attempts. Please wait a moment.';
    if (message.includes('Email not confirmed')) return 'Please check your email to confirm your account.';
    return 'Something went wrong. Please try again.';
}

function EmailIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [view, setView] = useState<View>('login');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Animate in on open
    useEffect(() => {
        if (isOpen) {
            setView('login');
            setEmail('');
            setEmailError('');
            setError('');
            setLoading(false);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    // Escape key to close
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const handleEmailChange = useCallback((value: string) => {
        setEmail(value);
        if (emailError) setEmailError('');
    }, [emailError]);

    const handleEmailBlur = useCallback(() => {
        if (email && !EMAIL_REGEX.test(email)) {
            setEmailError('Please enter a valid email.');
        }
    }, [email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!EMAIL_REGEX.test(email)) {
            setEmailError('Please enter a valid email.');
            return;
        }

        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOtp({ email });
            if (authError) throw authError;
            setView('check-email');
        } catch (err: any) {
            const message = err?.message || '';
            setError(mapSupabaseError(message));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google');
    };

    if (!isOpen) return null;

    return (
        <div
            className={`${styles.overlay} ${visible ? styles.overlayVisible : ''}`}
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Sign in"
            >
                {/* Close Button */}
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {view === 'login' ? 'Namaskaram' : 'Check Your Email'}
                    </h2>
                    <p className={styles.subtitle}>
                        {view === 'login'
                            ? 'Sign in or create an account with your email'
                            : ''
                        }
                    </p>
                </div>

                <div className={styles.formContent}>
                    {/* Check Email Success */}
                    {view === 'check-email' && (
                        <div className={`${styles.viewTransition} ${styles.successBanner}`}>
                            <div className={styles.successIcon}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                            <h3 className={styles.successTitle}>Check your inbox</h3>
                            <p className={styles.successText}>
                                We&apos;ve sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
                            </p>
                            <button
                                type="button"
                                className={styles.submitBtn}
                                onClick={() => {
                                    setView('login');
                                    setError('');
                                }}
                            >
                                Back to Sign In
                            </button>
                        </div>
                    )}

                    {/* Login Form */}
                    {view === 'login' && (
                        <div className={styles.viewTransition}>
                            {error && (
                                <div className={styles.errorBanner}>
                                    <span className={styles.errorIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    </span>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className={styles.inputGroup}>
                                    <div className={styles.inputWrapper}>
                                        <span className={styles.inputIcon}><EmailIcon /></span>
                                        <input
                                            type="email"
                                            className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            onBlur={handleEmailBlur}
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                    {emailError && <p className={styles.fieldError}>{emailError}</p>}
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading && <span className={styles.spinner} />}
                                    {loading ? 'Sending link...' : 'Continue with Email'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className={styles.divider}>
                                <span className={styles.dividerText}>or</span>
                            </div>

                            {/* Google OAuth */}
                            <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
                                <GoogleIcon />
                                Continue with Google
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    By continuing, you accept our{' '}
                    <a href="#">Terms of Service</a> and{' '}
                    <a href="#">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
