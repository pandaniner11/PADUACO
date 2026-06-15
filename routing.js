/* routing.js — single source of truth for segment + tag logic.
   Gate: Age 55+ AND TSP $200K+ → Qualified (book the review).
   Everyone else → Common Mistakes nurture (guide + video).
   FEHB / FEGLI answers never gate — they become "blind spot" tags + personalization. */
(function () {
  const SEGMENTS = {
    'Qualified — Retirement Review': {
      track: 'Federal Retirement Review Sequence (Primary)',
      assets: ['TSP Withdrawal vs Rollover Decision Map (2026 Edition)', 'Federal Retirement Readiness Guide'],
      cta: 'Book your free Federal Retirement Review',
      thanks: 'Perfect fit. A Federal HR professional will map your TSP, FEHB and FEGLI numbers in plain English — and flag the costly mistakes before they happen.',
    },
    'Nurture — Common Mistakes': {
      track: 'Common Mistakes Nurture Sequence',
      assets: ['Common Federal Retirement Mistakes Guide', 'Video walkthrough — the mistakes that cost the most'],
      cta: 'Send me the guide',
      thanks: 'We\u2019re sending you the guide to the most common (and costly) federal retirement mistakes, plus a video walkthrough — so you can get ahead of them early.',
      secondary: 'Prefer to talk it through? Book a free call anyway',
    },
  };

  function route(a) {
    const age = a.age55 === '55 or older';
    const asset = a.tsp === 'More than $200K';
    const fehbBlind = !!a.fehb && a.fehb.indexOf('Yes') !== 0;
    const fegliBlind = !!a.fegli && a.fegli.indexOf('Yes') !== 0;
    const qualified = age && asset;

    const segment = qualified ? 'Qualified — Retirement Review' : 'Nurture — Common Mistakes';

    // ---- TAGS (layered, all go to HubSpot) ----
    const tags = [];
    if (qualified) tags.push('Hot Prospect');
    if (age) tags.push('Age 55+');
    if (asset) tags.push('TSP $200K+');
    if (fehbBlind) tags.push('FEHB blind spot');
    if (fegliBlind) tags.push('FEGLI blind spot');
    if (!qualified) tags.push('Nurture Only');

    // ---- personalization note for the thank-you screen / welcome email ----
    let note = null;
    const where = qualified ? 'Your review will include' : 'The guide covers';
    if (fehbBlind && fegliBlind) note = where + ' the two numbers you said you don\u2019t have yet: what FEHB really costs in retirement, and how fast FEGLI premiums climb with age.';
    else if (fehbBlind) note = where + ' the number you said you don\u2019t have yet: what your FEHB health coverage really costs in retirement.';
    else if (fegliBlind) note = where + ' the number you said you don\u2019t have yet: what FEGLI life insurance costs after you retire \u2014 premiums climb steeply with age.';

    const priority = qualified ? 'Urgent — call within 24h' : 'Nurture';
    return { segment, ...SEGMENTS[segment], tags: [...new Set(tags)], priority, note };
  }

  window.PaduaRouting = { route, SEGMENTS };
})();
