"use client";

import { useAuth } from '@/context/AuthContext';
import AssistantChat from './_components/AssistantChat';
import AssistantSidebar from './_components/AssistantSidebar';
import { useState, useEffect, useCallback } from 'react';
import { AssistantSession, createAssistantSession, getAssistantSessions } from '@/lib/assistant-storage';

export default function AssistantPage() {
    const { user, status, signInWithGoogle } = useAuth();
    const [sessions, setSessions] = useState<AssistantSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const handleNewChat = useCallback(async () => {
        if (!user?.email) return;
        let newId = await createAssistantSession(user.email, 'New Chat');
        if (!newId) {
            newId = crypto.randomUUID();
        }
        if (newId) {
            const newSession: AssistantSession = {
                id: newId,
                title: 'New Chat',
                created_at: new Date().toISOString()
            };
            setSessions(prev => [newSession, ...prev]);
            setCurrentSessionId(newId);
        }
    }, [user]);

    useEffect(() => {
        async function initSessions() {
            if (user?.email) {
                const loaded = await getAssistantSessions(user.email);
                if (loaded && loaded.length > 0) {
                    setSessions(loaded);
                    setCurrentSessionId(loaded[0].id);
                } else {
                    handleNewChat();
                }
            }
        }
        if (status === 'authenticated') {
            initSessions();
        }
    }, [user, status, handleNewChat]);

    if (status === 'loading') {
        return (
            <div className="bg-white flex items-center justify-center" style={{ height: 'calc(100vh - 72px)' }}>
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-white flex flex-col items-center justify-center text-gray-800 px-4" style={{ height: 'calc(100vh - 72px)' }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                        <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">Gemini Clone</h1>
                <p className="text-gray-500 mb-6 text-center max-w-sm">Sign in to chat with the smart assistant.</p>
                <button
                    onClick={() => signInWithGoogle()}
                    className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3 shadow-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign In with Google
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-col font-sans" style={{ height: 'calc(100vh - 72px)' }}>
            <div className="flex-1 flex h-full">
                {/* Sidebar */}
                <div className="hidden md:block h-full bg-[#f0f4f9]">
                    <AssistantSidebar
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onSelectSession={setCurrentSessionId}
                        onNewChat={handleNewChat}
                        userEmail={user.email}
                    />
                </div>

                {/* Main Chat */}
                <div className="flex-1 h-full min-w-0 bg-white">
                    {currentSessionId ? (
                        <AssistantChat
                            key={currentSessionId}
                            sessionId={currentSessionId}
                            userEmail={user.email || null}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
