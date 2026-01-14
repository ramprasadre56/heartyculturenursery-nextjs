
import React from 'react';
import { ChatSession } from '@/lib/chat-storage';

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    userEmail?: string | null;
}

export default function ChatSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    userEmail,
}: ChatSidebarProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredSessions = sessions.filter(session =>
        (session.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-50 border-r border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out`}
        >
            {/* Header: Toggle & New Chat */}
            <div className="p-4 flex flex-col gap-4">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    {!isCollapsed && (
                        <div className="text-sm font-semibold text-gray-500">Chats</div>
                    )}
                </div>

                <button
                    onClick={onNewChat}
                    className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg flex items-center justify-center transition-colors ${isCollapsed ? 'px-0 w-10 h-10 self-center' : 'px-4 w-full gap-2'}`}
                    title="New Chat"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    {!isCollapsed && <span>New Chat</span>}
                </button>
            </div>

            {/* Search Bar */}
            {!isCollapsed && (
                <div className="px-4 mb-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-md py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-2.5 top-2.5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>
            )}


            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-2">
                {!isCollapsed && (
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2">
                        Recent
                    </h3>
                )}

                <div className="space-y-1">
                    {filteredSessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            title={isCollapsed ? session.title || 'New Chat' : ''}
                            className={`w-full text-left rounded-md text-sm transition-colors flex items-center ${isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2'
                                } ${currentSessionId === session.id
                                    ? 'bg-blue-100 text-blue-800 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {isCollapsed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
            <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {userEmail ? userEmail[0].toUpperCase() : 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {userEmail || 'Guest User'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
