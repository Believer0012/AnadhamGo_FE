// ── PARVATI VALLEY TRAVEL GUIDES ──
// Real editorial guides (not sample data). Figures are deliberately approximate ("~") and anything
// that changes year to year (camping rules, road conditions) tells readers to check locally.
const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HIMALAYA_BLOG_POSTS = [
  {
    slug: 'kheerganga-trek-guide',
    region: 'himalaya',
    title: 'Kheerganga Trek: Route, Difficulty & Best Time (A Practical Guide)',
    metaTitle: 'Kheerganga Trek Guide — Route, Distance, Difficulty & Best Time',
    metaDescription:
      'Everything you need for the Kheerganga trek from Barshaini: which route to take, how long it takes, how hard it is, the best months to go and what to pack.',
    date: '2026-09-27',
    readMinutes: 7,
    category: 'Trekking Guides',
    image: img('1642474606747-76312351789d'),
    imageAlt: 'Trail sign on the forest path to Kheerganga in the Parvati Valley',
    excerpt:
      'The Parvati Valley’s classic trek climbs from the road head at Barshaini to a high meadow with a natural hot spring. Here’s how to plan it: routes, timing, difficulty and what to carry.',
    keywords: ['kheerganga trek', 'kheerganga trek distance', 'kheerganga trek difficulty', 'kheerganga best time', 'barshaini to kheerganga', 'kheerganga hot spring', 'parvati valley trek'],
    sections: [
      {
        h2: 'Kheerganga at a glance',
        paragraphs: [
          'Kheerganga is a meadow at roughly 2,950 m at the head of the Parvati Valley, known for its natural hot-spring pool and a small Shiva temple. The trek starts near Barshaini, the last point on the road beyond Kasol and Manikaran, and climbs through villages, forest and past waterfalls.',
        ],
        lists: [
          'Start: near Barshaini (road head), ~1.5–2 hours’ drive from Kasol',
          'Distance: ~12 km one way on the most popular route',
          'Time: ~5–7 hours up, ~3–4 hours down',
          'Difficulty: moderate — long and steady rather than technical',
          'Top: ~2,950 m',
        ],
      },
      {
        h2: 'Which route should you take?',
        paragraphs: [
          'Most people walk from Barshaini via Nakthan village and the Rudra Nag waterfall. It is the most used path, with small cafés along the way, and the easiest to follow.',
          'A quieter alternative starts on the Kalga side and runs through forest higher up the valley. It is less crowded and very beautiful, but has fewer stops — go with someone who knows it, or ask locally for the current state of the trail.',
          'Whichever way you go up, many people come down the main route because it is easier to follow and faster on tired legs.',
        ],
      },
      {
        h2: 'Best time to do the Kheerganga trek',
        paragraphs: [
          'The usual season runs from around May to June and again from September to October. Autumn tends to bring the clearest skies and the best views.',
          'In the monsoon (roughly July–August) the trail gets muddy and slippery, and landslides can close the road to Barshaini. From late autumn into early spring, snow can cover the upper sections — many cafés and camps on the route close, and the trek is not recommended without an experienced guide.',
        ],
      },
      {
        h2: 'Staying overnight',
        paragraphs: [
          'Walking up, soaking in the hot spring and staying the night to see sunrise over the meadow is the classic way to do it. Rules on overnight camping and tent sites at the meadow have changed over the years, so check the current situation locally (or with us) before you go, and plan to camp only where it is permitted.',
          'If you would rather not stay up top, it is possible to do the trek as a long day walk and come back down to Kalga, Pulga or Barshaini for the night.',
        ],
        internalLinks: [
          { href: '/destinations/kheerganga', text: 'Kheerganga destination guide' },
          { href: '/destinations/pulga', text: 'Stay a night in Pulga before or after the trek' },
        ],
      },
      {
        h2: 'What to pack',
        paragraphs: [
          'Nights are cold at the top even in summer, and the weather turns quickly in the mountains. Pack light but pack layers.',
        ],
        lists: [
          'Warm layer and a rain jacket',
          'Trekking shoes with good grip (the trail is rocky and can be wet)',
          'Headlamp or torch',
          'Water bottle and some snacks',
          'Cash — ATMs and card payments are unreliable past Kasol and Manikaran',
          'A bag to carry your rubbish back down',
        ],
      },
      {
        h2: 'Plan the rest of your trip',
        paragraphs: [
          'Kheerganga fits naturally into a few days in the upper valley: arrive in Kasol, move up to Pulga or Kalga, do the trek, and come back down through Manikaran’s hot springs on the way home.',
        ],
        internalLinks: [{ href: '/plan?days=5&with=friends&i=trekking,adventure', text: 'Build a 5-day plan with the Kheerganga trek' }],
      },
    ],
    faq: [
      { q: 'How long is the Kheerganga trek?', a: 'About 12 km one way on the main route from Barshaini, usually 5–7 hours up and 3–4 hours down.' },
      { q: 'Is the Kheerganga trek difficult?', a: 'It is a moderate trek — long and uphill but not technical. Reasonably fit beginners manage it with a steady pace and breaks.' },
      { q: 'When is the best time for Kheerganga?', a: 'Around May–June and September–October. Avoid the monsoon (landslides, slippery trail) and winter (snow on the upper sections).' },
      { q: 'Can you camp at Kheerganga?', a: 'Overnight camping rules at the meadow have changed over the years — check the current situation locally before you go and only camp where it is permitted.' },
    ],
  },
  {
    slug: 'kalga-vs-pulga-vs-tosh',
    region: 'himalaya',
    title: 'Kalga vs Pulga vs Tosh: Which Parvati Valley Village Is Right for You?',
    metaTitle: 'Kalga vs Pulga vs Tosh — Which Village to Stay In (Parvati Valley)',
    metaDescription:
      'Kalga, Pulga and Tosh sit close together above Barshaini but feel very different. Compare the vibe, access, views and who each village suits best.',
    date: '2026-09-26',
    readMinutes: 5,
    category: 'Comparison Guides',
    image: img('1655921779882-f166fbe5ce48'),
    imageAlt: 'Snow peaks framed by deodar trees in the Parvati Valley',
    excerpt:
      'Three villages, one road head. Kalga, Pulga and Tosh are all within an hour of Barshaini — but each has its own pace. Here’s how to choose.',
    keywords: ['kalga vs pulga', 'kalga vs tosh', 'pulga or kalga', 'where to stay parvati valley', 'pulga village', 'kalga village', 'tosh village'],
    sections: [
      {
        h2: 'The short answer',
        paragraphs: [
          'Choose Pulga for forest and quiet, Kalga for orchards, meadows and open views, and Tosh for the most dramatic snow-peak scenery and a livelier evening. All three are reached from Barshaini, the end of the road past Manikaran, so you can easily visit the others on day walks.',
        ],
      },
      {
        h2: 'Pulga: forest and slow mornings',
        paragraphs: [
          'Pulga is a car-free village of wooden, slate-roofed houses reached by a short walk from Barshaini. Just above it is the old deodar grove locals call the Fairy Forest. It suits people who want quiet: reading, short forest walks, long evenings by the fire.',
        ],
        internalLinks: [{ href: '/destinations/pulga', text: 'Explore Pulga' }],
      },
      {
        h2: 'Kalga: orchards, meadows and stars',
        paragraphs: [
          'Kalga is a cluster of farmhouses and apple orchards on a ridge above Barshaini, a steady uphill walk from the road. It feels open and sunny, with meadows and long views — and dark skies that are good for stargazing. It is also a common starting point for the quieter Kheerganga route.',
        ],
        internalLinks: [{ href: '/destinations/kalga', text: 'Explore Kalga' }],
      },
      {
        h2: 'Tosh: the view at the end of the valley',
        paragraphs: [
          'Tosh climbs a hillside at the head of the Tosh valley, looking straight at snowfields and peaks. It is a little more developed than Pulga and Kalga, with more guesthouses and cafés, and it is the base for walks further up the valley.',
        ],
        internalLinks: [{ href: '/destinations/tosh', text: 'Explore Tosh' }],
      },
      {
        h2: 'Quick comparison',
        lists: [
          'Quietest: Pulga',
          'Best for meadows and stargazing: Kalga',
          'Most dramatic views: Tosh',
          'Easiest access from the road: Pulga and Tosh (short walks/drive); Kalga is a steadier climb',
          'Best base for Kheerganga: Kalga or Pulga',
        ],
      },
      {
        h2: 'Can’t decide? Do two',
        paragraphs: [
          'They are close enough that many travellers split a few nights between two of them — for example two nights in Pulga for rest and one in Tosh for the views.',
        ],
        internalLinks: [{ href: '/plan?days=5&with=couple&i=nature,photography', text: 'Plan a 5-day trip across the villages' }],
      },
    ],
    faq: [
      { q: 'Which is better, Kalga or Pulga?', a: 'Pulga is quieter and more forested; Kalga is more open, with orchards, meadows and wide views. Both are close to Barshaini.' },
      { q: 'How do you reach Kalga, Pulga and Tosh?', a: 'Travel to Barshaini, the road head beyond Kasol and Manikaran. Pulga is a short walk, Kalga a steady uphill walk, and Tosh a short drive or walk from there.' },
      { q: 'Which village is best for a first visit?', a: 'Pulga or Tosh — both are easy to reach and have enough places to stay and eat. Add Kalga if you want meadows and stargazing.' },
    ],
  },
  {
    slug: 'best-time-to-visit-kasol-parvati-valley',
    region: 'himalaya',
    title: 'Best Time to Visit Kasol & the Parvati Valley (Season by Season)',
    metaTitle: 'Best Time to Visit Kasol & Parvati Valley — Season-by-Season Guide',
    metaDescription:
      'When to visit Kasol, Pulga, Kalga and Tosh: what spring, monsoon, autumn and winter are really like in the Parvati Valley, and what each season is best for.',
    date: '2026-09-25',
    readMinutes: 5,
    category: 'Planning Guides',
    image: img('1612638039814-1a67ea727114'),
    imageAlt: 'The Parvati river at Kasol under pine forest',
    excerpt:
      'Spring blossoms, monsoon green, crisp autumn skies or winter snow — the Parvati Valley changes completely through the year. Here’s what each season is like and who it suits.',
    keywords: ['best time to visit kasol', 'kasol weather', 'parvati valley best time', 'kasol in winter', 'kasol in monsoon', 'best time for kheerganga'],
    sections: [
      {
        h2: 'The short answer',
        paragraphs: [
          'For most people the best times are spring into early summer (around March to June) and autumn (around September to November). Autumn usually has the clearest skies; spring has blossom and green. Winter is beautiful but cold, and the monsoon brings rain and the risk of landslides on the roads.',
        ],
      },
      {
        h2: 'Spring and early summer (March–June)',
        paragraphs: [
          'Days in Kasol are mild and pleasant, orchards blossom in spring, and the higher villages open up as the snow melts. It is a good time for walks, cafés and the Kheerganga trek later in the season. May and June are the busiest months, so book ahead.',
        ],
      },
      {
        h2: 'Monsoon (July–August)',
        paragraphs: [
          'The valley turns intensely green and quiet, but rain is frequent and landslides can block the roads to Kasol and beyond. Trails get slippery. If you go, keep your plans flexible and leave buffer days for travel.',
        ],
      },
      {
        h2: 'Autumn (September–November)',
        paragraphs: [
          'After the rain, the air clears: blue skies, sharp views of the snow peaks and cold, starry nights. It is the favourite season for photography, stargazing and trekking. Nights get cold by November, especially in Tosh, Pulga and Kalga.',
        ],
      },
      {
        h2: 'Winter (December–February)',
        paragraphs: [
          'Kasol stays open and is often quiet and peaceful, but it is cold, and the higher villages can get heavy snow. Some guesthouses and cafés close, roads beyond Barshaini can be affected, and Kheerganga is generally not trekked in winter. Come for snow and solitude, with warm clothes and flexible plans.',
        ],
      },
      {
        h2: 'Which season for what',
        lists: [
          'Trekking (Kheerganga): around May–June and September–October',
          'Clear views and stargazing: autumn',
          'Blossom and green: spring',
          'Snow: winter (higher villages)',
          'Fewest crowds: monsoon and winter — with more weather risk',
        ],
        internalLinks: [
          { href: '/destinations/kasol', text: 'Kasol destination guide' },
          { href: '/plan', text: 'Plan your trip' },
        ],
      },
    ],
    faq: [
      { q: 'What is the best month to visit Kasol?', a: 'Around April–June or September–October, depending on whether you want spring green or autumn’s clearer skies.' },
      { q: 'Is Kasol good in winter?', a: 'Yes, if you are prepared for cold and possible snow. Kasol stays open; the higher villages can be snowbound and some places close.' },
      { q: 'Should I visit Kasol in the monsoon?', a: 'It is green and quiet but roads can be blocked by landslides. Keep plans flexible and leave buffer days.' },
    ],
  },
];
