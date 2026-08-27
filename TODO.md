

Your OG image is good — one note

Clean lockup, white on #16130f, correct 1200×630. 19.4 KB is small because it's flat colour, which is exactly right — no banding risk since there are no gradients.

The one thing to consider: it's the mark alone, no photograph and no words. Someone seeing it in a Facebook or LinkedIn feed learns the name but nothing about what the building is or that space is for lease. BUILD_PLAN's Phase 7 plan was hand-made OG images per page. This is a strong default in the meantime — and ogImage is a per-page prop, so any page can override it without touching the others.

What to test

- Tab favicon — hard-refresh; browsers cache favicons aggressively.
- Add to Home Screen on your Pixel 9 — this is the one to check against the Capital One Shopping icon sitting next to it.
- iPhone Add to Home Screen — confirm iOS isn't double-rounding.
- Social preview — opengraph.xyz or LinkedIn's Post Inspector against the Netlify URL.

One caveat for launch: the OG URL currently resolves to portageplace.netlify.app because that's site in astro.config.mjs. That must change to the apex domain at cutover, or every share will point at the staging host.
