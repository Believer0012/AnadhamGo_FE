// ── BOOKING MODAL DESIGN TOKENS ──
// Single source of truth for the redesigned booking wizard's colors, radii and
// reusable style objects, so every step (and the mobile sheet) reads as one system.
// Values come from design-reference/HANDOFF.md; fonts are mapped to the site's own
// typography rather than the mockup's Google fonts.

export const BK = {
    // text
    ink: '#13201a',          // main text
    muted: '#56635a',        // secondary text (≥4.5:1 on white)
    body2: '#3f4d44',        // line-item labels
    disabledInk: '#a3aca5',

    // brand
    primary: '#1c6b3c',      // selected, links, progress, checks
    primarySoft: '#eef5ee',  // soft fills (icon chips, info box)
    primaryTint: '#f1f7f1',  // selected card fill
    lime: '#d5ed55',         // altitude badge, status on the selected date only
    cta: '#e9aa3a',          // the one main button per screen
    ctaInk: '#1a1305',

    // surfaces
    white: '#ffffff',
    panel: '#f5f7f1',        // summary aside background
    scrim: '#0f1a13',        // modal backdrop / mobile sheet frame

    // borders
    line: 'rgba(19,32,26,0.10)',
    lineMid: 'rgba(19,32,26,0.14)',
    lineStrong: 'rgba(19,32,26,0.16)',

    // status / meal accents (also differ in lightness for a11y)
    fewLeft: '#9a4f00',
    veg: '#1c6b3c',
    nonveg: '#d9893a',

    // radii
    radiusModal: '24px',
    radiusCard: '16px',
    radiusCardSm: '14px',
    radiusInput: '12px',
    pill: '999px',

    // hit targets
    tapSm: '40px',           // steppers
    tap: '44px',             // close, chips
    ctaHeight: '52px',

    // type — use the site's heading face for display, inherit for body
    fontDisplay: 'var(--font-heading, "Bricolage Grotesque", system-ui, sans-serif)',
    focusRing: '3px solid #1c6b3c',
};

// A selectable card border/background pair (stay cards, add-on rows, date chips)
export function selectedBox(on) {
    return {
        border: on ? `2px solid ${BK.primary}` : `1px solid ${BK.lineStrong}`,
        background: on ? BK.primaryTint : BK.white,
    };
}

// The single amber primary action on each step
export const ctaStyle = {
    minHeight: BK.ctaHeight,
    boxSizing: 'border-box',
    borderRadius: BK.radiusCard,
    background: BK.cta,
    color: BK.ctaInk,
    fontSize: '15px',
    fontWeight: 700,
    border: 'none',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
};

// Secondary / back button
export const ghostStyle = {
    minHeight: BK.ctaHeight,
    padding: '0 18px',
    boxSizing: 'border-box',
    borderRadius: BK.radiusCard,
    border: `1px solid rgba(19,32,26,0.18)`,
    background: BK.white,
    color: BK.ink,
    fontSize: '14.5px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
};

// A round +/- stepper button
export function stepperBtn(disabled) {
    return {
        width: BK.tapSm,
        height: BK.tapSm,
        borderRadius: '50%',
        border: `1.5px solid ${disabled ? BK.line : BK.lineStrong}`,
        background: BK.white,
        color: disabled ? BK.disabledInk : BK.ink,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
    };
}

export const sectionLabel = {
    margin: 0,
    fontFamily: BK.fontDisplay,
    fontSize: '16px',
    fontWeight: 700,
    color: BK.ink,
};

export const fmtINR = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
