import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';

// Admin emails whitelist - add your email here
const ADMIN_EMAILS = [
    'ramprasadre56@gmail.com',
];

// Create a service role client for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
    try {
        // Check authentication
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        if (!ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        // Build query
        let query = supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('payment_status', status);
        }

        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }

        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to fetch orders:', error);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        return NextResponse.json({ orders: data });
    } catch (error: unknown) {
        console.error('Admin orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        // Check authentication
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { orderId, fulfillmentStatus } = await request.json();

        if (!orderId || !fulfillmentStatus) {
            return NextResponse.json({ error: 'orderId and fulfillmentStatus required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('orders')
            .update({ fulfillment_status: fulfillmentStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Failed to update order:', error);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
