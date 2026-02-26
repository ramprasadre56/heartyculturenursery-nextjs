"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Plant } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import SizeSelectorModal from '@/components/SizeSelectorModal';

interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    products?: Plant[];
}

function PlantMiniCard({ plant }: { plant: Plant }) {
    const { addToCart } = useCart();
    const [showSizeModal, setShowSizeModal] = useState(false);
    return (
        <>
            <button
                onClick={() => setShowSizeModal(true)}
                className="flex items-center gap-2 bg-white/[0.06] rounded-lg p-2 hover:bg-white/[0.12] transition-colors text-left cursor-pointer w-full"
            >
                <div className="w-10 h-10 rounded-md bg-white/[0.1] flex-shrink-0 overflow-hidden">
                    {plant.image && <img src={plant.image} alt={plant.common_name} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-white font-medium truncate">{plant.common_name}</p>
                    <p className="text-[10px] text-white/40 truncate">{plant.scientific_name}</p>
                </div>
                <span className="text-[10px] text-[#ffd700] flex-shrink-0">Add</span>
            </button>
            {showSizeModal && (
                <SizeSelectorModal
                    isOpen={showSizeModal}
                    plant={plant}
                    onSelectSize={(p, size) => {
                        addToCart(p, size);
                        setShowSizeModal(false);
                    }}
                    onClose={() => setShowSizeModal(false)}
                />
            )}
        </>
    );
}

export default function ChatWidget() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    // Hide on /assistant page
    if (pathname === '/assistant') return null;

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, text: m.text }));
            const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: data.text || 'Sorry, I couldn\'t process that.',
                products: data.products?.length ? data.products : undefined,
            }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong.' }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <>
            {/* Chat Panel */}
            {open && (
                <div className="fixed bottom-24 right-4 sm:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] bg-gradient-to-b from-[#0a1a0f] to-[#071210] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#ffd700]/10 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.5">
                                    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                                </svg>
                            </div>
                            <span className="text-white font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Plant Assistant</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white p-1 cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-white/40 text-sm">Ask me about any plants!</p>
                                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                                    {['Mango varieties', 'Indoor plants', 'Flowering plants'].map(q => (
                                        <button
                                            key={q}
                                            onClick={() => setInput(q)}
                                            className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/60 hover:bg-white/[0.12] hover:text-white transition-colors cursor-pointer"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.role === 'user'
                                    ? 'bg-[#ffd700]/20 text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm'
                                    : 'text-white/90 text-sm'
                                    }`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="space-y-2">
                                            <div className="prose prose-invert prose-xs max-w-none [&_p]:text-white/90 [&_p]:text-sm [&_li]:text-white/90 [&_li]:text-sm [&_strong]:text-[#ffd700] [&_h1]:text-[#ffd700] [&_h2]:text-[#ffd700] [&_h3]:text-[#ffd700] [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                            </div>
                                            {msg.products && msg.products.length > 0 && (
                                                <div className="space-y-1.5 mt-2">
                                                    {msg.products.slice(0, 6).map(plant => (
                                                        <PlantMiniCard key={plant.global_id ?? plant.id} plant={plant} />
                                                    ))}
                                                    {msg.products.length > 6 && (
                                                        <p className="text-[10px] text-white/30 text-center">+{msg.products.length - 6} more</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-1 px-3 py-2">
                                    <span className="w-1.5 h-1.5 bg-[#ffd700]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-[#ffd700]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-[#ffd700]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/[0.08] p-3">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask about plants..."
                                className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ffd700]/40"
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="bg-[#ffd700] text-[#064E3B] font-semibold px-3 py-2 rounded-lg hover:bg-[#ffde33] transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 rounded-full bg-[#ffd700] text-[#064E3B] shadow-lg hover:bg-[#ffde33] hover:scale-105 transition-all flex items-center justify-center z-[9999] cursor-pointer"
                aria-label="Chat with Plant Assistant"
            >
                {open ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>
        </>
    );
}
