import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            await request.json();

        const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body)
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            // Payment verified successfully
            return NextResponse.json({
                success: true,
                message: "Payment verified successfully",
                paymentId: razorpay_payment_id,
            });
        } else {
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Razorpay verification failed:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Verification failed" },
            { status: 500 }
        );
    }
}
