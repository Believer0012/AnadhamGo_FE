import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCheckInLandmarkGuide } from './accessControl.js';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.resolve(__dir, '../../public/logo.png');

// ── Clean Light Luxury Palette (Matching aanandham.in) ──
const BG_CANVAS   = [248, 249, 245];    // #F8F9F5 Website light stone canvas
const CARD_BG     = [255, 255, 255];    // #FFFFFF Crisp white card
const CARD_INNER  = [243, 246, 240];    // #F3F6F0 Soft stone cell background
const CARD_PLATE  = [234, 240, 230];    // #EAF0E6 Detail container
const BRAND_YELLOW= [229, 169, 59];     // #E5A93B Signature Aanandham website golden yellow
const TEXT_BLACK  = [18, 22, 19];       // #121613 Deep rich charcoal black
const TEXT_MUTED  = [89, 101, 93];      // #59655D Slate forest secondary
const TEXT_DIM    = [120, 135, 125];    // #78877D Dim label
const BORDER_LIGHT= [224, 230, 220];    // #E0E6DC Subtle light border
const GREEN_PAID  = [22, 101, 52];      // #166534 Forest green paid
const AMBER_DUE   = [180, 83, 9];       // #B45309 Warm amber due
const FOREST_DARK = [22, 101, 52];      // #166534 Forest green accent

// Standard A4 Dimensions in Points (72 dpi)
const PAGE_W = 595.28;
const PAGE_H = 841.89;

/**
 * Generates a clean, minimalist, luxury Aanandham booking pass PDF (Light Theme).
 */
export async function generateBookingPassPdf(booking, qrBuffer) {
    return new Promise((resolve, reject) => {
        const chunks = [];

        const doc = new PDFDocument({
            size: [PAGE_W, PAGE_H],
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            info: {
                Title: `Aanandham Pass — ${booking.id}`,
                Author: 'Aanandham.go',
                Subject: `Booking Pass for ${booking.name || 'Guest'}`,
                Keywords: 'Aanandham, Munnar, Glamping, Pass, Booking'
            }
        });

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const isConfirmed = ['confirmed', 'Confirmed'].includes(booking.status);
        const passRef = String(booking.id || 'BK-STAY').toUpperCase();

        // ═════════════════════════════════════════════════════════════
        // 1. BACKGROUND & MAIN CANVAS
        // ═════════════════════════════════════════════════════════════
        doc.rect(0, 0, PAGE_W, PAGE_H).fill(BG_CANVAS);

        // Top Signature Golden Yellow Accent Bar
        doc.rect(0, 0, PAGE_W, 6).fill(BRAND_YELLOW);

        // Main Pass Container Card
        const C_X = 24;
        const C_Y = 24;
        const C_W = PAGE_W - 48; // 547.28 pt
        const C_H = PAGE_H - 48; // 793.89 pt

        doc.roundedRect(C_X, C_Y, C_W, C_H, 20).fill(CARD_BG);
        doc.roundedRect(C_X, C_Y, C_W, C_H, 20)
           .lineWidth(1).strokeColor(BORDER_LIGHT).stroke();

        // ═════════════════════════════════════════════════════════════
        // 2. CENTERED HEADER BRANDING
        // ═════════════════════════════════════════════════════════════
        const HDR_Y = C_Y + 16;
        const LOGO_SZ = 46;
        const LOGO_X = (PAGE_W - LOGO_SZ) / 2;

        // Centered Logo
        if (fs.existsSync(LOGO_PATH)) {
            try {
                doc.image(LOGO_PATH, LOGO_X, HDR_Y, { fit: [LOGO_SZ, LOGO_SZ], align: 'center', valign: 'center' });
            } catch (_) {}
        }

        // Centered Bold Brand Title: Aanandham.go (.go in website golden yellow)
        doc.font('Helvetica-Bold').fontSize(22);
        const titleW = doc.widthOfString('Aanandham.go');
        const titleX = (PAGE_W - titleW) / 2;
        doc.fill(TEXT_BLACK).text('Aanandham', titleX, HDR_Y + 50, { continued: true })
           .fill(BRAND_YELLOW).text('.go');

        // ═════════════════════════════════════════════════════════════
        // 3. STAY TITLE & REFERENCE BANNER
        // ═════════════════════════════════════════════════════════════
        const EXP_Y = HDR_Y + 80;
        const EXP_H = 68;

        doc.roundedRect(C_X + 16, EXP_Y, C_W - 32, EXP_H, 14).fill(CARD_INNER);
        doc.roundedRect(C_X + 16, EXP_Y, C_W - 32, EXP_H, 14)
           .lineWidth(1).strokeColor(BORDER_LIGHT).stroke();

        // Subtitle
        doc.font('Helvetica-Bold').fontSize(8).fill(BRAND_YELLOW)
           .text('OFFICIAL BOOKING PASS', C_X + 32, EXP_Y + 12, { characterSpacing: 1 });

        // Package Title
        const pkgTitle = booking.package || 'Aanandham Mountain Stay';
        doc.font('Helvetica-Bold').fontSize(16).fill(TEXT_BLACK)
           .text(pkgTitle, C_X + 32, EXP_Y + 26, { width: C_W - 190, ellipsis: true });

        // Location
        doc.font('Helvetica').fontSize(9).fill(TEXT_MUTED)
           .text('Suryanelli, Munnar, Kerala  |  7,900 FT Ridge', C_X + 32, EXP_Y + 48);

        // Reference Box (Right side of banner)
        const refBoxW = 120;
        const refBoxX = C_X + C_W - 32 - refBoxW - 12;
        doc.roundedRect(refBoxX, EXP_Y + 12, refBoxW, 44, 10).fill(CARD_BG);
        doc.roundedRect(refBoxX, EXP_Y + 12, refBoxW, 44, 10).lineWidth(0.8).strokeColor(BORDER_LIGHT).stroke();

        doc.font('Helvetica').fontSize(7.5).fill(TEXT_DIM)
           .text('BOOKING REF', refBoxX, EXP_Y + 16, { width: refBoxW, align: 'center', characterSpacing: 0.8 });
        doc.font('Helvetica-Bold').fontSize(11).fill(TEXT_BLACK)
           .text(passRef, refBoxX, EXP_Y + 28, { width: refBoxW, align: 'center', characterSpacing: 1 });

        // ═════════════════════════════════════════════════════════════
        // 4. PERFORATED DIVIDER
        // ═════════════════════════════════════════════════════════════
        const DIV_Y = EXP_Y + EXP_H + 16;

        // Cutout notches
        doc.circle(C_X, DIV_Y, 8).fill(BG_CANVAS);
        doc.circle(C_X + C_W, DIV_Y, 8).fill(BG_CANVAS);

        // Dashed line
        doc.save().dash(5, { space: 6 })
           .moveTo(C_X + 16, DIV_Y).lineTo(C_X + C_W - 16, DIV_Y)
           .lineWidth(1).strokeColor(BORDER_LIGHT).stroke().restore();

        // ═════════════════════════════════════════════════════════════
        // 5. TWO-COLUMN MAIN BODY (Details Left / Check-In QR Right)
        // ═════════════════════════════════════════════════════════════
        const BODY_Y = DIV_Y + 16;
        const COL_PAD = 16;
        const LEFT_W  = 300;
        const RIGHT_W = (C_W - 32) - LEFT_W - COL_PAD; // ~199 pt
        const LEFT_X  = C_X + 16;
        const RIGHT_X = LEFT_X + LEFT_W + COL_PAD;

        // ── LEFT COLUMN: STAY DETAILS ───────────────────────────────
        doc.font('Helvetica-Bold').fontSize(9).fill(FOREST_DARK)
           .text('STAY DETAILS', LEFT_X + 4, BODY_Y, { characterSpacing: 1 });

        const manifestRows = [
            { label: 'LEAD GUEST', val: booking.name || 'Guest' },
            { label: 'DATES', val: booking.dates || 'Scheduled Stay' },
            { label: 'LODGING', val: booking.roomType || 'Alpine Glamping Dome Tent' },
            { label: 'GUESTS', val: `${booking.guests || 2} Campers (${booking.adults || booking.guests || 2} Adults${booking.children ? `, ${Number(booking.children)} Kids` : ''})` },
            { label: 'MEAL PLAN', val: booking.mealSummary || `${booking.vegCount || 0} Veg + ${booking.nonVegCount || 0} Non-Veg BBQ Dinner & Breakfast` },
            { label: 'TOTAL FARE', val: `Rs. ${Number(booking.total || 0).toLocaleString('en-IN')}` },
        ];

        let mY = BODY_Y + 16;
        for (const row of manifestRows) {
            doc.roundedRect(LEFT_X, mY, LEFT_W, 36, 8).fill(CARD_INNER);
            doc.roundedRect(LEFT_X, mY, LEFT_W, 36, 8).lineWidth(0.5).strokeColor(BORDER_LIGHT).stroke();

            doc.font('Helvetica-Bold').fontSize(7.5).fill(TEXT_DIM)
               .text(row.label, LEFT_X + 12, mY + 6, { characterSpacing: 0.6 });
            doc.font('Helvetica-Bold').fontSize(10).fill(TEXT_BLACK)
               .text(row.val, LEFT_X + 12, mY + 18, { width: LEFT_W - 24, ellipsis: true });

            mY += 41;
        }

        // Settlement Status Card (Bottom of left column)
        const balDue = Number(booking.balanceDue || 0);
        const balBg = balDue > 0 ? [254, 249, 195] : [240, 253, 244]; // #FEF9C3 yellow / #F0FDF4 green
        const balBorder = balDue > 0 ? [234, 179, 8] : [34, 197, 94];
        const balTextColor = balDue > 0 ? AMBER_DUE : GREEN_PAID;
        const balTitle = balDue > 0 ? 'BALANCE PAYABLE AT CHECK-IN' : 'PAYMENT STATUS';
        const balText = balDue > 0 
            ? `Rs. ${balDue.toLocaleString('en-IN')} (Cash / Online Payment · Carry cash from Munnar)`
            : '100% Fully Paid Online';

        doc.roundedRect(LEFT_X, mY, LEFT_W, 42, 8).fill(balBg);
        doc.roundedRect(LEFT_X, mY, LEFT_W, 42, 8).lineWidth(1).strokeColor(balBorder).stroke();

        doc.font('Helvetica-Bold').fontSize(7.5).fill(TEXT_MUTED)
           .text(balTitle, LEFT_X + 12, mY + 8, { characterSpacing: 0.8 });
        doc.font('Helvetica-Bold').fontSize(10).fill(balTextColor)
           .text(balText, LEFT_X + 12, mY + 22);

        // ── RIGHT COLUMN: CLEAN UNOBSTRUCTED QR CODE ────────────────
        doc.font('Helvetica-Bold').fontSize(9).fill(FOREST_DARK)
           .text('CHECK-IN PASS', RIGHT_X + 4, BODY_Y, { characterSpacing: 1 });

        // QR Code Card Container (Matching height with left column)
        const QR_BOX_Y = BODY_Y + 16;
        const QR_BOX_H = (mY + 42) - QR_BOX_Y; // ~288 pt

        doc.roundedRect(RIGHT_X, QR_BOX_Y, RIGHT_W, QR_BOX_H, 12).fill(CARD_INNER);
        doc.roundedRect(RIGHT_X, QR_BOX_Y, RIGHT_W, QR_BOX_H, 12)
           .lineWidth(1).strokeColor(BORDER_LIGHT).stroke();

        doc.font('Helvetica-Bold').fontSize(7.5).fill(FOREST_DARK)
           .text('SCAN TO CHECK IN', RIGHT_X, QR_BOX_Y + 12, { width: RIGHT_W, align: 'center', characterSpacing: 1 });

        // Clean, High-Contrast QR Code Image (Dark QR on White Plate)
        const QR_IMG_SIZE = 140;
        const QR_IMG_X = RIGHT_X + (RIGHT_W - QR_IMG_SIZE) / 2;
        const QR_IMG_Y = QR_BOX_Y + 28;

        // White background plate for the QR
        doc.roundedRect(QR_IMG_X - 4, QR_IMG_Y - 4, QR_IMG_SIZE + 8, QR_IMG_SIZE + 8, 8).fill(CARD_BG);
        doc.roundedRect(QR_IMG_X - 4, QR_IMG_Y - 4, QR_IMG_SIZE + 8, QR_IMG_SIZE + 8, 8).lineWidth(0.8).strokeColor(BORDER_LIGHT).stroke();

        if (qrBuffer) {
            try {
                doc.image(qrBuffer, QR_IMG_X, QR_IMG_Y, { width: QR_IMG_SIZE, height: QR_IMG_SIZE });
            } catch (_) {}
        }

        doc.font('Helvetica-Bold').fontSize(8.5).fill(TEXT_BLACK)
           .text('PRESENT ON ARRIVAL', RIGHT_X, QR_BOX_Y + 180, { width: RIGHT_W, align: 'center', characterSpacing: 0.5 });
        doc.font('Helvetica').fontSize(7.5).fill(TEXT_MUTED)
           .text('Scanned to retrieve booking & meals', RIGHT_X, QR_BOX_Y + 194, { width: RIGHT_W, align: 'center' });

        // Bottom Reference Mini Box
        const refMiniY = QR_BOX_Y + 214;
        const refMiniW = RIGHT_W - 24;
        const refMiniX = RIGHT_X + 12;
        doc.roundedRect(refMiniX, refMiniY, refMiniW, 46, 8).fill(CARD_BG);
        doc.roundedRect(refMiniX, refMiniY, refMiniW, 46, 8).lineWidth(0.6).strokeColor(BORDER_LIGHT).stroke();

        doc.font('Helvetica').fontSize(7.5).fill(TEXT_DIM)
           .text('PASS CODE', refMiniX, refMiniY + 8, { width: refMiniW, align: 'center', characterSpacing: 0.8 });
        doc.font('Helvetica-Bold').fontSize(12).fill(TEXT_BLACK)
           .text(passRef, refMiniX, refMiniY + 20, { width: refMiniW, align: 'center', characterSpacing: 1 });

        // ═════════════════════════════════════════════════════════════
        // 6. PICKUP & ARRIVAL GUIDELINES
        // ═════════════════════════════════════════════════════════════
        const CONVOY_Y = mY + 52;
        const CONVOY_H = 80;
        const landmarkGuide = getCheckInLandmarkGuide(booking.campsiteId || booking.package, booking);

        doc.roundedRect(C_X + 16, CONVOY_Y, C_W - 32, CONVOY_H, 12).fill(CARD_INNER);
        doc.roundedRect(C_X + 16, CONVOY_Y, C_W - 32, CONVOY_H, 12).lineWidth(0.8).strokeColor(BORDER_LIGHT).stroke();

        // 3 Feature Columns
        const col3W = (C_W - 32 - 32) / 3;
        const c1X = C_X + 24;
        const c2X = c1X + col3W + 8;
        const c3X = c2X + col3W + 8;

        // Col 1: Pickup Point
        doc.font('Helvetica-Bold').fontSize(8).fill(FOREST_DARK)
           .text('PICKUP POINT', c1X, CONVOY_Y + 12, { characterSpacing: 0.5 });
        doc.font('Helvetica-Bold').fontSize(8).fill(TEXT_BLACK)
           .text(landmarkGuide.hubName, c1X, CONVOY_Y + 24, { width: col3W, height: 20, ellipsis: true });
        doc.font('Helvetica').fontSize(7).fill(TEXT_MUTED)
           .text(landmarkGuide.parkingArea, c1X, CONVOY_Y + 44, { width: col3W, height: 26, ellipsis: true });

        // Col 2: Important Note
        doc.font('Helvetica-Bold').fontSize(8).fill(AMBER_DUE)
           .text('IMPORTANT NOTE', c2X, CONVOY_Y + 12, { characterSpacing: 0.5 });
        doc.font('Helvetica').fontSize(7.5).fill(TEXT_MUTED)
           .text(landmarkGuide.offlineNote || 'Zero Litter. Carry warm layers (8-14 C at night).', c2X, CONVOY_Y + 24, { width: col3W });

        // Col 3: Camp Support
        doc.font('Helvetica-Bold').fontSize(8).fill(FOREST_DARK)
           .text('CAMP SUPPORT', c3X, CONVOY_Y + 12, { characterSpacing: 0.5 });
        doc.font('Helvetica-Bold').fontSize(8.5).fill(TEXT_BLACK)
           .text(landmarkGuide.emergencyMarshalPhone || '+91 90748 58014', c3X, CONVOY_Y + 24);
        doc.font('Helvetica').fontSize(7).fill(TEXT_MUTED)
           .text('WhatsApp active 24/7 for route & pickup help.', c3X, CONVOY_Y + 38, { width: col3W });

        // ═════════════════════════════════════════════════════════════
        // 7. FOOTER
        // ═════════════════════════════════════════════════════════════
        const FOOT_Y = C_Y + C_H - 50;

        doc.rect(C_X + 16, FOOT_Y, C_W - 32, 1).fill(BORDER_LIGHT);

        doc.font('Helvetica-Bold').fontSize(8.5).fill(TEXT_BLACK)
           .text('Aanandham', C_X + 24, FOOT_Y + 12, { continued: true })
           .fill(BRAND_YELLOW).text('.go');
        doc.font('Helvetica').fontSize(7.5).fill(TEXT_MUTED)
           .text('Suryanelli | Kolukkumalai | Meesapulimala | Munnar, Kerala | aanandham.in', C_X + 24, FOOT_Y + 24);

        // Stamp (Right aligned)
        doc.font('Helvetica').fontSize(7).fill(TEXT_DIM)
           .text('OFFICIAL DIGITAL PASS VOUCHER', C_X + 200, FOOT_Y + 18, { width: C_W - 224, align: 'right', characterSpacing: 0.4 });

        // Bottom Accent Golden Yellow Bar
        doc.rect(0, PAGE_H - 6, PAGE_W, 6).fill(BRAND_YELLOW);

        doc.end();
    });
}

