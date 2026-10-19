import QRCode from 'qrcode';

/**
 * ── Standards-Compliant ISO/IEC 18004 QR Code Generator ──
 * 
 * Generates verified, camera-scannable QR Code SVGs with Reed-Solomon Error Correction.
 */

export async function generateLocalQrSvg(text, size = 220) {
    if (!text) return '';
    try {
        const svg = await QRCode.toString(text, {
            type: 'svg',
            width: size,
            margin: 2,
            color: {
                dark: '#121613',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        });
        return svg;
    } catch (e) {
        console.error('Error generating QR code SVG:', e);
        return '';
    }
}

export async function generateQrDataUri(text, size = 220) {
    if (!text) return '';
    try {
        const dataUrl = await QRCode.toDataURL(text, {
            width: size,
            margin: 2,
            color: {
                dark: '#121613',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        });
        return dataUrl;
    } catch (e) {
        console.error('Error generating QR code DataURI:', e);
        return '';
    }
}

/**
 * Generates QR code as a raw PNG Buffer — for attaching as an inline CID
 * image in transactional emails (Resend, Nodemailer, etc.)
 * Email clients (Gmail, Outlook) block data: URIs but correctly render CID attachments.
 */
export async function generateQrBuffer(text, size = 300) {
    if (!text) return null;
    try {
        const buffer = await QRCode.toBuffer(text, {
            width: size,
            margin: 2,
            type: 'png',
            color: {
                dark: '#121613',   // Deep obsidian forest dots
                light: '#FFFFFF'   // Pure white background
            },
            errorCorrectionLevel: 'M'
        });
        return buffer;
    } catch (e) {
        console.error('Error generating QR code Buffer:', e);
        return null;
    }
}

