
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import ChatSidebar from './_components/ChatSidebar';
import ChatInterface from './_components/ChatInterface';
import { ChatSession, createChatSession, getUserChatSessions } from '@/lib/chat-storage';

export default function ChatPage() {
    const { data: session, status } = useSession();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleNewChat = useCallback(async () => {
        if (!session?.user?.email) return;

        let newId = await createChatSession(session.user.email, 'New Chat');

        // Fallback if DB is not set up yet
        if (!newId) {
            console.warn("Using local session ID fallback.");
            newId = crypto.randomUUID();
        }

        if (newId) {
            const newSession: ChatSession = {
                id: newId,
                title: 'New Chat',
                created_at: new Date().toISOString()
            };
            setSessions(prev => [newSession, ...prev]);
            setCurrentSessionId(newId);
        }
    }, [session]);

    // Fetch sessions on load
    useEffect(() => {
        async function initSessions() {
            if (session?.user?.email) {
                const loadedSessions = await getUserChatSessions(session.user.email);

                if (loadedSessions && loadedSessions.length > 0) {
                    setSessions(loadedSessions);
                    setCurrentSessionId(loadedSessions[0].id);
                } else {
                    // Create first session for new user
                    handleNewChat();
                }
            }
        }
        if (status === 'authenticated') {
            initSessions();
        }
    }, [session, status, handleNewChat]);

    const handleSelectSession = (id: string) => {
        setCurrentSessionId(id);
    };

    if (status === 'loading') {
        return <div className="flex items-center justify-center h-[80vh]">Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Welcome to Business Agent</h2>
                <p className="text-gray-600">Please sign in to start chatting and save your history.</p>
                <button
                    onClick={() => signIn('google')}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
                >
                    Sign In with Google
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-[85vh] border-t border-gray-200">
            {/* Sidebar */}
            <div className={`hidden md:block h-full shadow-inner z-10 transition-all duration-300`}>
                <ChatSidebar
                    sessions={sessions}
                    currentSessionId={currentSessionId}
                    onSelectSession={handleSelectSession}
                    onNewChat={handleNewChat}
                    userEmail={session?.user?.email}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 h-full min-w-0 bg-white relative">
                {currentSessionId ? (
                    <ChatInterface
                        key={currentSessionId}
                        sessionId={currentSessionId}
                        userEmail={session?.user?.email || null}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full flex-col gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="text-sm text-gray-500">Initializing workspace...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
