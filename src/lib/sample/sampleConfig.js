// ── SAMPLE DATA GATE ──
// Everything under src/lib/sample/ is invented placeholder content (stays, ratings, reviews,
// experiences, events…) used to design and demo the Himalayan platform before real listings exist.
//
// It must never reach real visitors as if it were genuine, so it is:
//   • ON by default in local dev and Vercel preview deploys
//   • OFF by default in production — opt in with NEXT_PUBLIC_ENABLE_SAMPLE_DATA=true
//   • force-OFF anywhere with NEXT_PUBLIC_ENABLE_SAMPLE_DATA=false
// and every sample item carries `isSample: true`, which the UI renders as a visible "Sample" badge.
//
// Replacing a sample with a real listing = add the real record (admin panel / campsData) and
// delete the sample entry. No component changes needed.

export function isSampleDataEnabled() {
  const flag = process.env.NEXT_PUBLIC_ENABLE_SAMPLE_DATA;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
}

export const unsplash = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
