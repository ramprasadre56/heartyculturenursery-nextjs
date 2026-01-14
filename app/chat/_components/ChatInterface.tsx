
"use client";

import React, { useEffect, useRef, useState } from 'react';
import ChatInput from './ChatInput';
import ChatMessageComponent from './ChatMessage';
import Header from './Header';
import { appConfig } from '@/lib/chat/config';
import { CredentialProviderProxy } from '@/lib/chat/mocks/credentialProviderProxy';
import { ChatMessage, PaymentInstrument, Product, Sender } from '@/lib/chat/types';
import { getChatMessages, saveChatMessage, updateSessionTitle } from '@/lib/chat-storage';

interface ChatInterfaceProps {
    sessionId: string;
    userEmail: string | null;
    onSessionCreated?: (newId: string) => void;
}

const initialMessage: ChatMessage = {
    sender: Sender.MODEL,
    text: appConfig.defaultMessage,
};

export default function ChatInterface({ sessionId, userEmail }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [contextId, setContextId] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const credentialProvider = useRef(new CredentialProviderProxy());
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

    // Load history when sessionId changes
    useEffect(() => {
        async function loadHistory() {
            setIsLoading(true);
            try {
                const history = await getChatMessages(sessionId);
                if (history && history.length > 0) {
                    setMessages(history.map(m => ({
                        sender: m.role === 'user' ? Sender.USER : Sender.MODEL,
                        text: m.content,
                        products: m.products,
                    })));
                } else {
                    setMessages([initialMessage]);
                }
            } catch (e) {
                console.error("Failed to load history", e);
                setMessages([initialMessage]);
            } finally {
                setIsHistoryLoaded(true);
                setIsLoading(false);
            }
        }
        if (sessionId) {
            loadHistory();
        } else {
            // Should not happen if parent handles creation, but fallback
            setMessages([initialMessage]);
        }
    }, [sessionId]);


    // Scroll to the bottom when new messages are added
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        // Immediate scroll
        scrollToBottom();
        // and delayed scroll for image loading/layout shifts
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages]);

    const handleAddToCheckout = (productToAdd: Product) => {
        const actionPayload = JSON.stringify({
            action: 'add_to_checkout',
            product_id: productToAdd.productID,
            quantity: 1,
        });
        handleSendMessage(actionPayload, { isUserAction: true });
    };

    const handleStartPayment = () => {
        const actionPayload = JSON.stringify({ action: 'start_payment' });
        handleSendMessage(actionPayload, {
            isUserAction: true,
        });
    };

    const handlePaymentMethodSelection = async (checkout: any) => {
        if (!checkout || !checkout.payment || !checkout.payment.handlers) {
            const errorMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: "Sorry, I couldn't retrieve payment methods.",
            };
            setMessages((prev) => [...prev, errorMessage]);
            return;
        }

        //find the handler with id "example_payment_provider"
        const handler = checkout.payment.handlers.find(
            (handler: any) => handler.id === 'example_payment_provider',
        );
        if (!handler) {
            const errorMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: "Sorry, I couldn't find the supported payment handler.",
            };
            setMessages((prev) => [...prev, errorMessage]);
            return;
        }

        try {
            const paymentResponse =
                await credentialProvider.current.getSupportedPaymentMethods(
                    userEmail || 'test@example.com',
                    handler.config,
                );
            const paymentMethods = paymentResponse.payment_method_aliases;

            const paymentSelectorMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: '',
                paymentMethods,
            };
            setMessages((prev) => [...prev, paymentSelectorMessage]);
        } catch (error) {
            console.error('Failed to resolve mandate:', error);
            const errorMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: "Sorry, I couldn't retrieve payment methods.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handlePaymentMethodSelected = async (selectedMethod: string) => {
        // Hide the payment selector by removing it from the messages
        setMessages((prev) => prev.filter((msg) => !msg.paymentMethods));

        // Add a temporary user message
        const userActionMessage: ChatMessage = {
            sender: Sender.USER,
            text: `User selected payment method: ${selectedMethod}`,
            isUserAction: true,
        };
        setMessages((prev) => [...prev, userActionMessage]);

        try {
            if (!userEmail) {
                throw new Error('User email is not set.');
            }

            const paymentInstrument =
                await credentialProvider.current.getPaymentToken(
                    userEmail,
                    selectedMethod,
                );

            if (!paymentInstrument || !paymentInstrument.credential) {
                throw new Error('Failed to retrieve payment credential');
            }

            const paymentInstrumentMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: '',
                paymentInstrument,
            };
            setMessages((prev) => [...prev, paymentInstrumentMessage]);
        } catch (error) {
            console.error('Failed to process payment mandate:', error);
            const errorMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: "Sorry, I couldn't process the payment. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleConfirmPayment = async (paymentInstrument: PaymentInstrument) => {
        // Hide the payment confirmation component
        const userActionMessage: ChatMessage = {
            sender: Sender.USER,
            text: `User confirmed payment.`,
            isUserAction: true,
        };
        // Let handleSendMessage manage the loading indicator
        setMessages((prev) => [
            ...prev.filter((msg) => !msg.paymentInstrument),
            userActionMessage,
        ]);

        try {
            const parts = [
                { type: 'data', data: { 'action': 'complete_checkout' } },
                {
                    type: 'data',
                    data: {
                        'a2a.ucp.checkout.payment_data': paymentInstrument,
                        'a2a.ucp.checkout.risk_signals': { 'data': 'some risk data' },
                    },
                },
            ];

            await handleSendMessage(parts, {
                isUserAction: true,
            });
        } catch (error) {
            console.error('Error confirming payment:', error);
            const errorMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: 'Sorry, there was an issue confirming your payment.',
            };
            // If handleSendMessage wasn't called, we might need to manually update state
            // In this case, we remove the loading indicator that handleSendMessage would have added
            setMessages((prev) => [...prev.slice(0, -1), errorMessage]); // This assumes handleSendMessage added a loader
            setIsLoading(false); // Ensure loading is stopped on authorization error
        }
    };

    const handleSendMessage = async (
        messageContent: string | any[],
        options?: { isUserAction?: boolean; headers?: Record<string, string> },
    ) => {
        if (isLoading) return;

        const userMessage: ChatMessage = {
            sender: Sender.USER,
            text: options?.isUserAction
                ? '<User Action>'
                : typeof messageContent === 'string'
                    ? messageContent
                    : 'Sent complex data',
        };

        // --- Persistence ---
        await saveChatMessage(sessionId, userMessage);

        // Update Title if it's the first real message (length check approx)
        if (messages.length <= 1 && typeof messageContent === 'string' && messageContent.length > 0) {
            const newTitle = messageContent.substring(0, 30) + (messageContent.length > 30 ? '...' : '');
            updateSessionTitle(sessionId, newTitle);
            // Note: Parent components won't update title instantly unless we trigger a refresh.
        }

        if (userMessage.text) {
            // Only add if there's text
            setMessages((prev) => [...prev, userMessage]);
        }
        setMessages((prev) => [
            ...prev,
            { sender: Sender.MODEL, text: '', isLoading: true },
        ]);
        setIsLoading(true);

        try {
            const requestParts =
                typeof messageContent === 'string'
                    ? [{ type: 'text', text: messageContent }]
                    : messageContent;

            const requestParams: any = {
                message: {
                    role: 'user',
                    parts: requestParts,
                    messageId: crypto.randomUUID(),
                    kind: 'message',
                },
                configuration: {
                    historyLength: 0,
                },
            };

            if (contextId) {
                requestParams.message.contextId = contextId;
            }
            if (taskId) {
                requestParams.message.taskId = taskId;
            }

            const defaultHeaders = {
                'Content-Type': 'application/json',
                'X-A2A-Extensions':
                    'https://ucp.dev/specification/reference?v=2026-01-11',
                // Update URL to match current host
                'UCP-Agent':
                    'profile="https://heartyculturenursery-nextjs.vercel.app/profile/agent_profile.json"',
            };

            // Changed /api to /api/agent
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { ...defaultHeaders, ...options?.headers },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: crypto.randomUUID(),
                    method: 'message/send',
                    params: requestParams,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            // Update context and task IDs from the response for subsequent requests
            if (data.result?.contextId) {
                setContextId(data.result.contextId);
            }
            //if there is a task and it's in one of the active states
            if (
                data.result?.id &&
                ['working', 'submitted', 'input-required'].includes(data.result?.status?.state)
            ) {
                setTaskId(data.result.id);
            } else {
                //if not reset taskId
                setTaskId(null);
            }

            const combinedBotMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: '',
            };

            const responseParts =
                data.result?.parts || data.result?.status?.message?.parts || [];

            for (const part of responseParts) {
                if (part.text) {
                    // Simple text
                    combinedBotMessage.text +=
                        (combinedBotMessage.text ? '\n' : '') + part.text;
                } else if (part.data?.['a2a.product_results']) {
                    // Product results
                    combinedBotMessage.text +=
                        (combinedBotMessage.text ? '\n' : '') +
                        (part.data['a2a.product_results'].content || '');
                    combinedBotMessage.products =
                        part.data['a2a.product_results'].results;
                } else if (part.data?.['a2a.ucp.checkout']) {
                    // Checkout
                    combinedBotMessage.checkout = part.data['a2a.ucp.checkout'];
                }
            }

            const newMessages: ChatMessage[] = [];
            const hasContent =
                combinedBotMessage.text ||
                combinedBotMessage.products ||
                combinedBotMessage.checkout;
            if (hasContent) {
                // --- Persistence ---
                await saveChatMessage(sessionId, combinedBotMessage);
                newMessages.push(combinedBotMessage);
            }

            if (newMessages.length > 0) {
                setMessages((prev) => [...prev.slice(0, -1), ...newMessages]);
            } else {
                const fallbackResponse =
                    "Sorry, I received a response I couldn't understand.";
                // --- Persistence ---
                await saveChatMessage(sessionId, { sender: Sender.MODEL, text: fallbackResponse });
                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { sender: Sender.MODEL, text: fallbackResponse },
                ]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: ChatMessage = {
                sender: Sender.MODEL,
                text: 'Sorry, something went wrong. Please try again.',
            };
            setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const lastCheckoutIndex = messages.map((m) => !!m.checkout).lastIndexOf(true);

    if (!isHistoryLoaded) return <div className="p-4">Loading chat...</div>;

    return (
        <div className="flex flex-col h-full bg-white font-sans relative">
            {/* Header is handled by parent or we can keep it here if it's just 'Business Agent' info */}
            <div className="z-10 bg-white/90 backdrop-blur border-b border-gray-100 p-4">
                <Header />
            </div>

            <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-4 md:p-6 space-y-2 pb-20"
            >
                {messages.map((msg, index) => (
                    <ChatMessageComponent
                        key={index}
                        message={msg}
                        onAddToCart={handleAddToCheckout}
                        onCheckout={
                            msg.checkout?.status !== 'ready_for_complete'
                                ? handleStartPayment
                                : undefined
                        }
                        onSelectPaymentMethod={handlePaymentMethodSelected}
                        onConfirmPayment={handleConfirmPayment}
                        onCompletePayment={
                            msg.checkout?.status === 'ready_for_complete'
                                ? handlePaymentMethodSelection
                                : undefined
                        }
                        isLastCheckout={index === lastCheckoutIndex}></ChatMessageComponent>
                ))}
            </div>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
}
