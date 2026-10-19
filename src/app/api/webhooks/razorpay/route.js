import { NextResponse } from 'next/server';

export { POST } from '@/app/api/payments/webhook/route';

export async function GET() {
    return NextResponse.json({
        status: 'active',
        service: 'Aanandham Razorpay Webhook Gateway',
        timestamp: new Date().toISOString()
    });
}
