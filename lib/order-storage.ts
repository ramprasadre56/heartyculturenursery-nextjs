
import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
    notes?: string;
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

    try {
        await setDoc(doc(db, 'orders', orderId), {
            user_session_id: sessionId,
            user_email: paymentInfo?.userEmail || null,
            details: newOrder,
            payment_id: paymentInfo?.paymentId || null,
            payment_status: paymentInfo?.status || null,
            fulfillment_status: 'pending',
            created_at: new Date().toISOString(),
        });
    } catch (e) {
        console.warn('Failed to save order to Firestore:', e);
    }
};


export const getStoredOrders = async (userEmail?: string): Promise<(StoredOrder & { payment_status?: string })[]> => {
    const sessionId = getSessionId();
    if (!sessionId && !userEmail) return [];

    try {
        // When user is authenticated, only fetch orders for their email
        // This prevents orders from other accounts on the same browser from leaking
        const ordersRef = collection(db, 'orders');
        const queries: Promise<any>[] = [];

        if (userEmail) {
            const emailQuery = query(ordersRef, where('user_email', '==', userEmail));
            queries.push(getDocs(emailQuery));
        } else {
            // Only use session-based query for unauthenticated users
            const sessionQuery = query(ordersRef, where('user_session_id', '==', sessionId));
            queries.push(getDocs(sessionQuery));
        }

        const results = await Promise.all(queries);
        const seenIds = new Set<string>();
        const firestoreOrders: (StoredOrder & { payment_status?: string; _created_at?: string })[] = [];

        for (const snapshot of results) {
            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                if (!seenIds.has(docSnap.id)) {
                    seenIds.add(docSnap.id);
                    firestoreOrders.push({ ...data.details, payment_status: data.payment_status, _created_at: data.created_at });
                }
            }
        }

        // Sort by created_at descending (newest first) in JavaScript
        firestoreOrders.sort((a, b) => (b._created_at || b.date || '').localeCompare(a._created_at || a.date || ''));
        // Remove temp sort key
        const cleanedOrders = firestoreOrders.map(({ _created_at, ...rest }) => rest);

        // Merge with localStorage orders, deduplicating by ID
        // When authenticated, only include local orders that match the user's email
        const localOrders = getLocalOrders();
        const filteredLocalOrders = userEmail
            ? localOrders.filter(o => !seenIds.has(o.id) && o.customer?.email === userEmail)
            : localOrders.filter(o => !seenIds.has(o.id));
        const mergedOrders = [
            ...cleanedOrders,
            ...filteredLocalOrders
        ];

        return mergedOrders;
    } catch (e) {
        console.warn('Exception fetching from Firestore, falling back to localStorage:', e);
        const localOrders = getLocalOrders();
        return userEmail
            ? localOrders.filter(o => o.customer?.email === userEmail)
            : localOrders;
    }
};

// Async wrapper for backward compatibility with consumers expecting IDs
export const getOrderIds = async (): Promise<string[]> => {
    const orders = await getStoredOrders();
    return orders.map(o => o.id);
};

export const getOrderDetailsLocal = async (orderId: string): Promise<(StoredOrder & { payment_status?: string }) | undefined> => {
    // Try Firestore first
    try {
        const docSnap = await getDoc(doc(db, 'orders', orderId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            return { ...data.details, payment_status: data.payment_status };
        }
    } catch {
        // fall through to localStorage
    }

    // Fallback to localStorage
    const localOrders = getLocalOrders();
    return localOrders.find(o => o.id === orderId);
};

// Deprecated wrapper
export const saveOrderId = async (orderId: string) => {
    await saveOrder(orderId, []);
};
