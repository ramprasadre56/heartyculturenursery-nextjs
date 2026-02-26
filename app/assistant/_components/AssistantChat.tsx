"use client";

import { useState, useRef, useEffect } from 'react';
import { Plant } from '@/lib/data';
import PlantResultCard from './PlantResultCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAssistantMessages, saveAssistantMessage, updateAssistantSessionTitle } from '@/lib/assistant-storage';

interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    products?: Plant[];
}

interface AssistantChatProps {
    sessionId: string;
    userEmail: string | null;
}

export default function AssistantChat({ sessionId, userEmail }: AssistantChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const titleUpdatedRef = useRef(false);

    // Load history from Firestore
    useEffect(() => {
        setHistoryLoaded(false);
        titleUpdatedRef.current = false;
        async function loadHistory() {
            const stored = await getAssistantMessages(sessionId);
            if (stored.length > 0) {
                setMessages(stored.map(m => ({
                    role: m.role,
                    text: m.content,
                    products: m.products,
                })));
                titleUpdatedRef.current = true;
            }
            setHistoryLoaded(true);
        }
        loadHistory();
    }, [sessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput('');
        const userMsg: ChatMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        // Save user message
        saveAssistantMessage(sessionId, { role: 'user', content: text });

        // Update session title from first user message
        if (!titleUpdatedRef.current) {
            titleUpdatedRef.current = true;
            const title = text.length > 40 ? text.slice(0, 40) + '...' : text;
            updateAssistantSessionTitle(sessionId, title);
        }

        try {
            const history = messages.map(m => ({ role: m.role, text: m.text }));
            const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history }),
            });

            if (!res.ok) throw new Error('Failed to get response');

            const data = await res.json();
            const botMsg: ChatMessage = {
                role: 'assistant',
                text: data.text || 'Sorry, I couldn\'t process that.',
                products: data.products?.length ? data.products : undefined,
            };
            setMessages(prev => [...prev, botMsg]);

            // Save assistant message
            saveAssistantMessage(sessionId, {
                role: 'assistant',
                content: botMsg.text,
                products: botMsg.products,
            });
        } catch {
            const errorMsg: ChatMessage = {
                role: 'assistant',
                text: 'Sorry, something went wrong. Please try again.',
            };
            setMessages(prev => [...prev, errorMsg]);
            saveAssistantMessage(sessionId, { role: 'assistant', content: errorMsg.text });
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const showSuggestions = historyLoaded && messages.length === 0;

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {showSuggestions && (
                    <div className="flex-1 flex flex-col justify-center items-center py-16 px-4">
                        <div className="mb-8 w-full max-w-3xl">
                            <h2 className="text-4xl md:text-5xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-400 to-yellow-500 mb-2">
                                Hello{userEmail ? `, ${userEmail.split('@')[0]}` : ''}
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-medium text-gray-300">
                                How can I help you today?
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-start max-w-3xl w-full">
                            {['Show me mango varieties', 'Indoor plants for beginners', 'Flowering plants', 'Fruit trees'].map(q => (
                                <button
                                    key={q}
                                    onClick={() => setInput(q)}
                                    className="text-sm px-5 py-3 rounded-full bg-[#f0f4f9] text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer border border-transparent hover:border-gray-300 shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full max-w-4xl mx-auto`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mr-4 mt-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                            </div>
                        )}
                        <div className={`max-w-[85%] ${msg.role === 'user'
                            ? 'bg-[#f0f4f9] text-gray-800 rounded-3xl px-5 py-3'
                            : 'text-gray-800'
                            }`}>
                            {msg.role === 'assistant' ? (
                                <div className="space-y-3">
                                    <div className="prose prose-sm max-w-none text-gray-800 [&_p]:text-gray-800 [&_li]:text-gray-800 [&_strong]:text-black [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                                            {msg.products.map((plant) => (
                                                <PlantResultCard key={plant.global_id ?? plant.id} plant={plant} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start w-full max-w-4xl mx-auto">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mr-4 mt-1 animate-pulse">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                        <div className="flex gap-1.5 px-2 py-3">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 pb-6 bg-white bg-opacity-90 backdrop-blur-sm relative z-10 bottom-0 w-full">
                <div className="max-w-4xl mx-auto flex items-end">
                    <div className="relative flex-1 flex items-center bg-[#f0f4f9] rounded-full px-2 py-2 shadow-sm focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-gray-200 transition-all duration-200 min-h-[56px]">
                        <button className="p-3 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-black/5" title="Upload image">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </button>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-transparent border-none px-2 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 resize-none max-h-32 min-h-full"
                            rows={1}
                            disabled={loading}
                            style={{ overflowY: 'hidden' }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="p-3 m-1 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-transparent disabled:text-gray-300 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="text-center mt-3 text-xs text-gray-500 max-w-4xl mx-auto">
                    Gemini Clone can make mistakes. Please check important info based on Govinda&apos;s Nursery actual catalog.
                </div>
            </div>
        </div>
    );
}
