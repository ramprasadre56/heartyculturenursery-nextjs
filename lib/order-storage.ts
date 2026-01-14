
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'heartyculture_session_id';

export interface StoredOrder {
    id: string;
    items: any[];
    date: string;
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

export const saveOrder = async (orderId: string, items: any[]) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const newOrder: StoredOrder = {
        id: orderId,
        items,
        date: new Date().toISOString()
    };

    try {
        const { error } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                user_session_id: sessionId,
                details: newOrder // JSONB column
            });

        if (error) {
            console.error('Failed to save order to Supabase:', error);
        }
    } catch (e) {
        console.error('Exception saving to Supabase:', e);
    }
};

export const getStoredOrders = async (): Promise<StoredOrder[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return [];

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('details, created_at')
            .eq('user_session_id', sessionId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch orders from Supabase:', error);
            return [];
        }

        return data.map((row: any) => row.details);
    } catch (e) {
        console.error('Exception fetching from Supabase:', e);
        return [];
    }
};

// Async wrapper for backward compatibility with consumers expecting IDs
export const getOrderIds = async (): Promise<string[]> => {
    const orders = await getStoredOrders();
    return orders.map(o => o.id);
};

export const getOrderDetailsLocal = async (orderId: string): Promise<StoredOrder | undefined> => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('details')
            .eq('id', orderId)
            .single();

        if (error || !data) return undefined;
        return data.details;
    } catch (e) {
        console.error('Error fetching details:', e);
        return undefined;
    }
};

// Deprecated wrapper
export const saveOrderId = async (orderId: string) => {
    await saveOrder(orderId, []);
};
