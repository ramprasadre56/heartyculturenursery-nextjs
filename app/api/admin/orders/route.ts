import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Admin emails whitelist - add your email here
const ADMIN_EMAILS = [
    'ramprasadre56@gmail.com',
];

// Admin phone numbers whitelist - add admin phone numbers here (with country code)
const ADMIN_PHONES = [
    '+918919029601', // Example - replace with actual admin phone numbers
];

// Create a service role client for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to get Supabase user from cookies
async function getSupabaseUser() {
    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        // Find any Supabase auth token cookie
        const authTokenCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

        if (authTokenCookie?.value) {
            try {
                const parsedToken = JSON.parse(authTokenCookie.value);
                if (parsedToken.access_token) {
                    const { data } = await supabaseAdmin.auth.getUser(parsedToken.access_token);
                    return data.user;
                }
            } catch {
                // Ignore parsing errors
            }
        }

        // Also check for direct access token cookie
        const accessToken = cookieStore.get('sb-access-token')?.value;
        if (accessToken) {
            const { data } = await supabaseAdmin.auth.getUser(accessToken);
            return data.user;
        }

        return null;
    } catch {
        return null;
    }
}

// Helper function to check if user is admin
async function isUserAdmin(request: Request) {
    // First check NextAuth session
    const session = await auth();
    if (session?.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
        return { isAdmin: true, email: session.user.email, source: 'nextauth' };
    }

    // Then check Supabase session from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token) {
            try {
                const { data, error } = await supabaseAdmin.auth.getUser(token);
                if (!error && data.user) {
                    // Check email
                    if (data.user.email && ADMIN_EMAILS.includes(data.user.email)) {
                        return { isAdmin: true, email: data.user.email, source: 'supabase' };
                    }
                    // Check phone
                    if (data.user.phone && ADMIN_PHONES.includes(data.user.phone)) {
                        return { isAdmin: true, phone: data.user.phone, source: 'supabase' };
                    }
                }
            } catch {
                // Ignore token validation errors
            }
        }
    }

    // Also try cookie-based auth as fallback
    const supabaseUser = await getSupabaseUser();
    if (supabaseUser) {
        // Check email
        if (supabaseUser.email && ADMIN_EMAILS.includes(supabaseUser.email)) {
            return { isAdmin: true, email: supabaseUser.email, source: 'supabase' };
        }
        // Check phone
        if (supabaseUser.phone && ADMIN_PHONES.includes(supabaseUser.phone)) {
            return { isAdmin: true, phone: supabaseUser.phone, source: 'supabase' };
        }
    }

    return { isAdmin: false };
}

export async function GET(request: Request) {
    try {
        // Check if user is admin
        const adminCheck = await isUserAdmin(request);

        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        // Check if user is admin
        const adminCheck = await isUserAdmin(request);

        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
