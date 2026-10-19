import { NextResponse } from 'next/server';
import { verifyEmailServer } from '@/lib/emailValidatorServer';
import { validateEmailClient } from '@/lib/emailValidatorCore';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ isValid: false, message: 'Email query parameter is required.' }, { status: 400 });
    }

    try {
        const result = await verifyEmailServer(email);
        return NextResponse.json(result);
    } catch (err) {
        const fallback = validateEmailClient(email);
        return NextResponse.json(fallback);
    }
}
