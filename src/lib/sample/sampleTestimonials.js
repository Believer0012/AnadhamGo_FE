// ── SAMPLE TESTIMONIALS (placeholder — not real guest reviews) ──
// Shown only when isSampleDataEnabled(), always with a "Sample" badge, and with initials instead of
// photos so no real person's face is attached to an invented review.
// Real testimonials come from the admin panel via /api/testimonials.
export const SAMPLE_TESTIMONIALS = [
  {
    id: 'sample-t-pulga-couple',
    author: 'Ananya & Karan',
    from: 'Bengaluru',
    destination: 'Pulga',
    tripType: 'Couple',
    rating: 5,
    quote: 'We booked two nights in Pulga and stayed four. Mornings in the deodar forest, evenings by the fire — it was the slowest, best trip we have had in years.',
  },
  {
    id: 'sample-t-kheerganga-friends',
    author: 'Rohan and friends',
    from: 'Delhi',
    destination: 'Kheerganga',
    tripType: 'Friends',
    rating: 5,
    quote: 'The trek was harder than we expected and completely worth it. The hot spring at the top after six hours of walking is something none of us will forget.',
  },
  {
    id: 'sample-t-kasol-family',
    author: 'The Mehta family',
    from: 'Mumbai',
    destination: 'Kasol & Tosh',
    tripType: 'Family',
    rating: 5,
    quote: 'Easy walks for the kids, a cooking afternoon with a local family, and the view from Tosh that my father still talks about. Planned exactly at our pace.',
  },
  {
    id: 'sample-t-kalga-solo',
    author: 'Ishita S.',
    from: 'Pune',
    destination: 'Kalga',
    tripType: 'Solo',
    rating: 4,
    quote: 'Came alone to work for a week and ended up on a stargazing night with people I now call friends. The Wi-Fi was patchy — the sky made up for it.',
  },
].map((t) => ({ ...t, isSample: true }));
