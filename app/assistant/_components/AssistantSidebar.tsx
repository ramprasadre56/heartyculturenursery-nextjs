"use client";

import React from 'react';
import { AssistantSession } from '@/lib/assistant-storage';

interface AssistantSidebarProps {
    sessions: AssistantSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    userEmail?: string | null;
}

export default function AssistantSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    userEmail,
}: AssistantSidebarProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredSessions = sessions.filter(session =>
        (session.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-64'} h-full flex flex-col transition-all duration-300 ease-in-out font-sans`}
        >
            {/* Header */}
            <div className="p-4 flex flex-col gap-4">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors cursor-pointer"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    {!isCollapsed && (
                        <div className="text-sm font-semibold text-gray-500">Chats</div>
                    )}
                </div>

                <button
                    onClick={onNewChat}
                    className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-full flex items-center transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-0 w-12 h-12 self-center' : 'px-4 w-fit gap-2'}`}
                    title="New Chat"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {!isCollapsed && <span>New chat</span>}
                </button>
            </div>

            {/* Search */}
            {!isCollapsed && (
                <div className="px-4 mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border border-gray-300 text-gray-800 text-sm rounded-full py-2 pl-9 pr-3 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                        <svg
                            className="absolute left-3 top-2.5 text-gray-500"
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-2">
                {!isCollapsed && (
                    <h3 className="text-xs font-semibold text-gray-500 px-3 mt-2 mb-2">
                        Recent
                    </h3>
                )}
                <div className="space-y-1">
                    {filteredSessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            title={isCollapsed ? session.title || 'New Chat' : ''}
                            className={`w-full text-left rounded-full text-sm transition-colors flex items-center cursor-pointer ${isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2.5'} ${currentSessionId === session.id
                                ? 'bg-[#d3e3fd] text-[#041e49] font-medium'
                                : 'text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {isCollapsed ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            ) : (
                                <span className="truncate">{session.title || 'New Chat'}</span>
                            )}
                        </button>
                    ))}
                    {filteredSessions.length === 0 && !isCollapsed && (
                        <p className="text-sm text-gray-400 px-3 py-2 italic text-center">
                            {sessions.length === 0 ? 'No history' : 'No matches'}
                        </p>
                    )}
                </div>
            </div>

            {/* User Profile */}
            <div className={`p-4 mt-auto ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 text-sm">
                        {userEmail ? userEmail[0].toUpperCase() : 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-700 truncate">
                                {userEmail || 'Guest User'}
                            </p>
                            <p className="text-xs text-gray-500">Free version</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
