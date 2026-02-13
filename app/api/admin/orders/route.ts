import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Admin emails whitelist
const ADMIN_EMAILS = [
    'ramprasadre56@gmail.com',
];

// Helper function to check if user is admin via Firebase ID token
async function isUserAdmin(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { isAdmin: false };
    }

    const idToken = authHeader.substring(7);
    if (!idToken) {
        return { isAdmin: false };
    }

    try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        if (decoded.email && ADMIN_EMAILS.includes(decoded.email)) {
            return { isAdmin: true, email: decoded.email };
        }
    } catch {
        // Invalid token
    }

    return { isAdmin: false };
}

export async function GET(request: Request) {
    try {
        const adminCheck = await isUserAdmin(request);

        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        // Build Firestore query — use simple where-only queries to avoid composite index requirements
        let q: FirebaseFirestore.Query = adminDb.collection('orders');

        if (status && status !== 'all') {
            q = q.where('payment_status', '==', status);
        }

        const snapshot = await q.get();
        let orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as any[];

        // Filter by date range in JavaScript to avoid composite index requirements
        if (dateFrom) {
            orders = orders.filter(o => o.created_at && o.created_at >= dateFrom);
        }
        if (dateTo) {
            orders = orders.filter(o => o.created_at && o.created_at <= dateTo + 'T23:59:59');
        }

        // Sort by created_at descending in JavaScript
        orders.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

        return NextResponse.json({ orders });
    } catch (error: unknown) {
        console.error('Admin orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const adminCheck = await isUserAdmin(request);

        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, fulfillmentStatus } = await request.json();

        if (!orderId || !fulfillmentStatus) {
            return NextResponse.json({ error: 'orderId and fulfillmentStatus required' }, { status: 400 });
        }

        await adminDb.collection('orders').doc(orderId).update({
            fulfillment_status: fulfillmentStatus,
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
