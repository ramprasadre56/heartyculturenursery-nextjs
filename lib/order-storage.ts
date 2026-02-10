
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'heartyculture_session_id';
const ORDERS_LOCAL_KEY = 'heartyculture_orders';

export interface StoredOrder {
    id: string;
    items: any[];
    date: string;
    customer?: {
        name: string;
        email: string;
        phone: string;
    };
    shipping?: {
        address: string;
        city: string;
        state: string;
        zip: string;
    };
}

const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
};

// localStorage helpers
function getLocalOrders(): (StoredOrder & { payment_status?: string })[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(ORDERS_LOCAL_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveLocalOrder(order: StoredOrder & { payment_status?: string }) {
    if (typeof window === 'undefined') return;
    try {
        const orders = getLocalOrders();
        orders.unshift(order);
        localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
    } catch {
        // ignore storage errors
    }
}

export const saveOrder = async (orderId: string, items: any[], paymentInfo?: {
    paymentId?: string;
    status?: string;
    paymentMethod?: string;
    userEmail?: string;
    customer?: { name: string; email: string; phone: string; };
    shipping?: { address: string; city: string; state: string; zip: string; };
}) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const newOrder: StoredOrder & { payment_status?: string } = {
        id: orderId,
        items,
        date: new Date().toISOString(),
        customer: paymentInfo?.customer,
        shipping: paymentInfo?.shipping,
        payment_status: paymentInfo?.status
    };

    // Always save to localStorage as fallback
    saveLocalOrder(newOrder);

    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                user_session_id: sessionId,
                user_email: paymentInfo?.userEmail,
                details: newOrder,
                payment_id: paymentInfo?.paymentId,
                payment_status: paymentInfo?.status
            });

        if (error) {
            console.warn('Failed to save order to Supabase:', error?.message || error);
        }
    } catch (e) {
        console.warn('Exception saving to Supabase:', e);
    }
};


export const getStoredOrders = async (userEmail?: string): Promise<(StoredOrder & { payment_status?: string })[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return [];

    if (!supabase) return getLocalOrders();

    try {
        let query = supabase
            .from('orders')
            .select('details, created_at, user_email, payment_status')
            .order('created_at', { ascending: false });

        if (userEmail) {
            query = query.or(`user_email.eq.${userEmail},user_session_id.eq.${sessionId}`);
        } else {
            query = query.eq('user_session_id', sessionId);
        }

        const { data, error } = await query;

        if (error) {
            console.warn('Failed to fetch orders from Supabase:', error?.message || error);
            return getLocalOrders();
        }

        const supabaseOrders = data.map((row: any) => ({ ...row.details, payment_status: row.payment_status }));

        // Merge with localStorage orders, deduplicating by ID
        const localOrders = getLocalOrders();
        const seenIds = new Set(supabaseOrders.map((o: any) => o.id));
        const mergedOrders = [
            ...supabaseOrders,
            ...localOrders.filter(o => !seenIds.has(o.id))
        ];

        return mergedOrders;
    } catch (e) {
        console.warn('Exception fetching from Supabase:', e);
        return getLocalOrders();
    }
};

// Async wrapper for backward compatibility with consumers expecting IDs
export const getOrderIds = async (): Promise<string[]> => {
    const orders = await getStoredOrders();
    return orders.map(o => o.id);
};

export const getOrderDetailsLocal = async (orderId: string): Promise<(StoredOrder & { payment_status?: string }) | undefined> => {
    // Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('details, payment_status')
                .eq('id', orderId)
                .single();

            if (!error && data) {
                return { ...data.details, payment_status: data.payment_status };
            }
        } catch {
            // fall through to localStorage
        }
    }

    // Fallback to localStorage
    const localOrders = getLocalOrders();
    return localOrders.find(o => o.id === orderId);
};

// Deprecated wrapper
export const saveOrderId = async (orderId: string) => {
    await saveOrder(orderId, []);
};
