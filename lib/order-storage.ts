
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'heartyculture_session_id';

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

export const saveOrder = async (orderId: string, items: any[], paymentInfo?: {
    paymentId?: string;
    status?: string;
    userEmail?: string;
    customer?: { name: string; email: string; phone: string; };
    shipping?: { address: string; city: string; state: string; zip: string; };
}) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const newOrder: StoredOrder = {
        id: orderId,
        items,
        date: new Date().toISOString(),
        customer: paymentInfo?.customer,
        shipping: paymentInfo?.shipping
    };

    try {
        const { error } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                user_session_id: sessionId,
                user_email: paymentInfo?.userEmail, // Link to user email
                details: newOrder, // JSONB column
                payment_id: paymentInfo?.paymentId,
                payment_status: paymentInfo?.status
            });

        if (error) {
            console.error('Failed to save order to Supabase:', error);
        }
    } catch (e) {
        console.error('Exception saving to Supabase:', e);
    }
};


export const getStoredOrders = async (userEmail?: string): Promise<StoredOrder[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return [];

    try {
        let query = supabase
            .from('orders')
            .select('details, created_at, user_email') // Fetch user_email to allow filtering
            .order('created_at', { ascending: false });

        if (userEmail) {
            // If user is logged in, get orders for email OR session (to catch orders just made)
            query = query.or(`user_email.eq.${userEmail},user_session_id.eq.${sessionId}`);
        } else {
            // Anonymous user
            query = query.eq('user_session_id', sessionId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to fetch orders from Supabase:', error);
            return [];
        }

        // Filter: 
        // 1. If I have no email (anonymous), I only see orders with NO email attached (truly anonymous) 
        //    OR orders that I just created in this session (but if they have an email, they shouldn't legally exist for me unless I logged out? 
        //    Actually, if I am anonymous, I shouldn't see orders belonging to 'user@gmail.com' even if session matches.)
        // 2. If I have an email, I see my orders + anonymous orders from this session. 
        //    I should NOT see orders from this session that belong to 'other@gmail.com'.

        return data.filter((row: any) => {
            if (userEmail) {
                // I am logged in.
                // Show if it belongs to me OR if it belongs to nobody (anonymous session order)
                return row.user_email === userEmail || row.user_email === null;
            } else {
                // I am anonymous.
                // Show only if it belongs to nobody.
                // If it belongs to a user, I shouldn't see it (privacy).
                return row.user_email === null;
            }
        }).map((row: any) => row.details);
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
