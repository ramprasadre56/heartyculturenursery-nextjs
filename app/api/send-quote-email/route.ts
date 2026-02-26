import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface QuoteItem {
    common_name?: string;
    scientific_name?: string;
    quantity: number;
    category?: string;
    sizeSelection?: {
        containerType: string;
        size: string;
        weightKg: number;
        categoryLabel: string;
    };
}

interface QuoteRequest {
    orderId: string;
    items: QuoteItem[];
    customer: { name: string; email: string; phone: string };
    shipping: { address: string; city: string; state: string; zip: string };
    notes?: string;
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY not configured, skipping email');
            return NextResponse.json({ success: false, error: 'Email not configured' });
        }

        const body: QuoteRequest = await req.json();
        const { orderId, items, customer, shipping, notes } = body;

        const resend = new Resend(apiKey);

        const itemRows = items.map(item => {
            const name = item.common_name && item.common_name !== 'Unknown'
                ? item.common_name
                : item.scientific_name || 'Unknown Plant';
            const size = item.sizeSelection
                ? `${item.sizeSelection.containerType === 'grow_bag' ? 'Grow Bag' : 'PP Pot'} - ${item.sizeSelection.size} (${item.sizeSelection.categoryLabel})`
                : 'No size selected';
            return `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${name}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-style:italic;color:#6b7280">${item.scientific_name || ''}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${item.category || ''}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${size}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
            </tr>`;
        }).join('');

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
            <div style="background:#064E3B;padding:20px 24px;border-radius:8px 8px 0 0">
                <h1 style="color:#ffd700;margin:0;font-size:22px">New Quote Request</h1>
                <p style="color:#d1fae5;margin:4px 0 0;font-size:14px">Order ID: ${orderId}</p>
            </div>
            <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none">
                <h2 style="color:#064E3B;font-size:16px;margin:0 0 12px">Customer Details</h2>
                <table style="width:100%;margin-bottom:20px">
                    <tr><td style="padding:4px 0;color:#6b7280;width:100px">Name:</td><td style="padding:4px 0">${customer.name}</td></tr>
                    <tr><td style="padding:4px 0;color:#6b7280">Email:</td><td style="padding:4px 0">${customer.email || 'Not provided'}</td></tr>
                    <tr><td style="padding:4px 0;color:#6b7280">Phone:</td><td style="padding:4px 0">${customer.phone}</td></tr>
                </table>

                ${shipping.address ? `
                <h2 style="color:#064E3B;font-size:16px;margin:0 0 12px">Shipping Address</h2>
                <p style="margin:0 0 20px;color:#374151">${shipping.address}${shipping.city ? ', ' + shipping.city : ''}${shipping.state ? ', ' + shipping.state : ''}${shipping.zip ? ' - ' + shipping.zip : ''}</p>
                ` : ''}

                <h2 style="color:#064E3B;font-size:16px;margin:0 0 12px">Plants Requested (${items.length} items)</h2>
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                    <thead>
                        <tr style="background:#f3f4f6">
                            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280">Plant</th>
                            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280">Scientific Name</th>
                            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280">Category</th>
                            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280">Size</th>
                            <th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280">Qty</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>

                ${notes ? `
                <h2 style="color:#064E3B;font-size:16px;margin:0 0 8px">Notes</h2>
                <p style="margin:0;padding:12px;background:#f9fafb;border-radius:6px;color:#374151">${notes}</p>
                ` : ''}
            </div>
            <div style="background:#f3f4f6;padding:16px 24px;border-radius:0 0 8px 8px;text-align:center">
                <p style="margin:0;color:#6b7280;font-size:13px">Hearty Culture Nursery — Govinda&apos;s Horticulture</p>
            </div>
        </div>`;

        await resend.emails.send({
            from: "Govinda's Horticulture Nursery <onboarding@resend.dev>",
            to: 'ramprasadre56@gmail.com',
            subject: `New Quote Request — ${orderId} — ${customer.name}`,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to send quote email:', error);
        return NextResponse.json({ success: false, error: 'Failed to send email' });
    }
}
