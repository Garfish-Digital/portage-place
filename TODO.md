

=====


- Mobile label density. At a 375px viewport the image renders about 352px wide — a 0.15× scale, which turns those street labels into roughly 4px of noise. Desktop is fine (~0.44×, ~11px labels). If you care, the fix is art direction: a tighter-cropped variant for small screens via <picture>. Otherwise mobile visitors lean on the "open in Google Maps" escape, which is a legitimate answer.
- old-location.png is still sitting in src/assets/maps/. Nothing imports it so it won't ship, but it's dead weight in the repo.

One thing the swap left stale

contact.astro:345 sets object-position: 20% 30%, with a comment reading "The pin sits high and left in the artwork." That was tuned for the old map and is no longer true.

It isn't broken — the ratios happen to match closely (1240/730 = 1.6986, your 2300/1354 = 1.6987), so desktop shows the image uncropped and object-position does nothing at all. Below md the container goes 4/3 and crops ~21% off the width; at 20% the pin lands about 56% across, so it still survives. But it survives by luck, not intent. object-position: center puts it dead center on mobile, and the comment needs rewriting before it misleads someone.

The heading question

First, a clarification: spaces.astro:105–108 is a block-head — the two-line variant without a block-head__lede. So you're not choosing between two patterns, you're choosing a density of the same one.

And there's a structural reason to add one, beyond looks. The map section currently has no heading at all. Meanwhile "Interactive map" is an <h2> two sections up, next to the Get directions button. So the map region is orphaned in the document outline — the heading that names it isn't attached to it. A screen-reader user navigating by heading arrives at "Interactive map," gets a button, and the actual map is somewhere below with nothing announcing it.

My recommendation: the two-line block-head — eyebrow + h2, exactly the spaces.astro pattern.

Why that density and not the full three-line version: the Suites floor plan is the closest analogue on the site — a section whose entire content is one static visual artifact that will later become interactive — and it uses precisely this. A block-head__lede would be padding here, because the map__escape paragraph below the map already carries the explanatory copy.

Some content options:

┌──────────────────┬──────────────────────────────┐
│     Eyebrow      │              h2              │
├──────────────────┼──────────────────────────────┤
│ Where we are     │ Portage Avenue at California │
├──────────────────┼──────────────────────────────┤
│ Find us          │ In the Near Northwest        │
├──────────────────┼──────────────────────────────┤
│ The neighborhood │ Ten minutes from everything  │
└──────────────────┴──────────────────────────────┘

I lean toward the first — the cross-street orientation is the one piece of information the map is actually there to deliver, and it doesn't repeat the address block above.

Two issues to decide alongside it:

1. You'd then have two h2s about the map. "Interactive map" in the details grid names a button, not a map. If the map section gets its own heading, rename that one to "Directions" — the trio becomes Address / Getting here / Directions, which is cleaner anyway.
2. A visual weight jump. Those three detail__label h2s use the eyebrow mixin — small letter-spaced caps. A real <h2> on the map section will be substantially larger. I think that's correct, since the map is a section and those are field labels, but it will change the page's rhythm and it's worth seeing before committing.

Say the word and I'll implement: block-head with your chosen wording, Directions rename, object-position fix plus corrected comment, and the attribution caption.


=====

I pulled up the actual image. The problem isn't resolution — it's four separate things, and one of them is free to fix.

Why it reads as pasted-in

1. The pin is in the corner. Portage Place sits about 10% from the left edge and 12% from the top. The optical center of the frame is Leeper Park and a block of unrelated houses. The subject of the image isn't the subject of the image — that alone reads as "screenshot of a map" rather than "a map of this building."

2. Blue. The river is #A8CCE8 and the parks are a yellow-green. Your entire palette lives in hue 22–36° with no cool color anywhere, so that river is the most saturated thing on the Contact page, and it owns the top-right quarter of the frame.

3. The labels are the provider's font. Every other character on the site is Fraunces or Public Sans. Map type in a generic humanist sans is an instant tell.

4. No hierarchy. Every building footprint, parking-lot striping, one-way arrows, a roundabout, "No. 6 Scratch Kitchen," "Memorial Hospital of South Bend." A professional location map is an illustration that omits things. This one omits nothing.

Plus the baked-in attribution renders in link-blue at bottom right.

The reframe that saves you from provider weeds

This is one image of one address that will never change. You need exactly one successful export, ever. So free-tier request limits and subscriptions are almost irrelevant — you're not making API calls in production, you're committing a PNG.

The only thing that actually matters is whether the output is licensed for commercial use, and this is a commercial leasing site. That's where the free tiers differ, so verify before you invest time:

┌─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│         Source          │                                       Worth a look because                                       │                                               Watch out                                               │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MapTiler Cloud          │ Cloud style editor lets you set every color by hand, no code, then request a static image        │ Free tier requires an account; confirm commercial terms                                               │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Geoapify                │ Static Maps API, several muted styles, no card                                                   │ Attribution required                                                                                  │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CARTO Positron          │ Near-monochrome light basemap, closest off-the-shelf to a neutral palette                        │ Attribution                                                                                           │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Stadia (Alidade Smooth) │ Warm-neutral and almost colorless — visually the nearest match to your palette                   │ ⚠️ Free tier is non-commercial; likely disqualifying here                                             │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Maputnik                │ Free, browser-based, open source; edit a MapLibre style JSON directly against a free tile source │ An hour of learning curve                                                                             │
├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Thunderforest (current) │ —                                                                                                │ Free "Hobby" plan is non-commercial; worth checking what the current image is actually licensed under │
└─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────┘

That last row is worth a real check. If the existing map was pulled on a non-commercial tier, it's a licensing problem independent of how it looks.

But here's my actual recommendation: Figma

Restyling fixes color. It does not fix hierarchy. Even a perfectly palette-matched OSM render still draws every building footprint and every parking stripe, because that's what the data contains. Problem #4 survives every option in that table. Problems #1 and #4 are the ones doing the most damage.

BUILD_PLAN already anticipated this — "hand-drawn in Figma is genuinely viable here since the location never changes and you already work in Figma." I think that was right.

It's less work than it sounds, if you draw the right amount. A good location map is roughly 30 paths, not 3,000:

- The St. Joseph River (and label it — it's the strongest orienting landmark you have)
- Leeper Park
- Eight named streets: Portage, California, Riverside, Leland, Forest, N Michigan, N Main, Lindsey
- The building's own block, filled in --pp-brick-light
- The PP mark or a bronze pin on the building
- Everything else: gone

Ground in --pp-limestone, streets in --pp-plaster, labels in Public Sans at two sizes, park in a desaturated green pulled toward the palette.

The one real design decision: what color is the river? Your palette has no bldetail view) becomes trivial once the artwork is vector, since it's the same file at two crops.

Realistic time: 1–3 hours, not a day, if you're ruthless about what to leave out. Trace over an OSM screenshot for geometry, and credit © OpenStreetMap contributors — a traced map is still a produced work under ODbL. Trace from OSM, never from Google; Google's terms prohibit it.

Two things I can fix right now, whatever you decide

1. Move the attribution out of the image and into HTML. The code comment claims baked-in attribution is what ODbL requires — that's not right. A visible credit adjacent to the map satisfies it. As a styled caption in Public Sans it stops being blue link-text sitting inside your photograph, and it survives any future map swap.
2. Re-crop the current PNG so the building is near center. It's still the wrong palette, but "map centered on the subject" buys most of the perceived professionalism back while you decide on the real fix.

Want me to do either of those now?

=====
=====
=====


For the News, Neighbor and Partner icons

Worth flagging before you generate: the News items are no longer cards — they're index rows now, with the outlet name in a fixed left column. An icon there would either shrink to ~20px (where this level of detail is lost) or reintroduce the height variation we just removed. And six drawings for six outlets is a harder brief than six for six trades — a newspaper drawn six ways is weaker than the typographic treatment already there. Neighbor (4) and Partner (3) are much better fits: real businesses with concrete associated objects, in card slots that can carry 88px.

If you do generate more, the spec that makes them drop straight in:
- Square, ~1250px, one object, no text or lettering
- Ask for a plain white background — saves the levelling step, though the script handles tan fine
- Don't worry about framing or margins; the script normalises them
- Objects, not people — people are the owners' visual language, and mixing them blurs the distinction

=====

Community is the whole problem, and it's concentrated:
- 10 identical placeholder quotes, each the full sentence "This is a placeholder quote for the card and will need to be replaced by an actual tenant quote…"
- 10 red "Attribution needed" labels
- 4 more from the neighbour entries — now resolved

There are also five different visual treatments across the site for the same idea (placeholder prose, red "Attribution needed", dashed border + chip, red "Placeholder.", "⚠️ … permission pending"). No shared language, which is exactly what makes it hard for a non-technical reviewer to parse.

My recommendation, against your two stated goals:

1. Where there's no real quote, don't render the quote block at all. That removes 20 of Community's 24 cues at a stroke. Reading the same explanatory sentence ten times is worse than not seeing it — and it stops the client reviewing the card design, which is the point of Round 1.
2. One badge treatment replacing all five variants — a short neutral label, not a sentence.
3. One section-level note explaining what's pending, said once instead of ten times.

=====

https://www.953mnc.com/2022/03/10/century-old-building-in-south-bend-to-be-renovated-into-commercial-center/

https://www.southbendtribune.com/story/news/local/2022/03/09/facade-renovation-ward-baking-building-south-bend/9424146002/

https://www.wndu.com/2022/03/08/42-million-renovations-underway-old-ward-baking-co-building-south-bend/

https://www.jsonline.com/story/news/solutions/2022/02/24/south-bends-micro-scale-developers-changing-indiana-city/6887375001/

https://www.wvpe.org/indiana-news/2021-06-15/south-bend-common-council-approves-tax-abatements-for-ward-bakery-building-redevelopment

https://southbendelkhart.org/news/40-million-awarded-in-south-bend-elkhart-region-readi-funds/

https://westsb.com/features/ward?rq=ward



=====
=====
=====

Tile services you can style and export from:
- Mapbox Studio — the most control. Design a monochrome style to the palette, export via the Static Images API. Free tier is generous.
- MapTiler Cloud — similar, custom styles, static maps API, easier pricing.
- Stadia Maps — hosts the Stamen styles. Alidade Smooth is very close to what this site wants: minimal, warm-neutral, almost no colour.
- CARTO Positron — clean and near-monochrome, a good tracing base.
- Thunderforest — more characterful styles (Pioneer, Atlas) if you want something less clinical.
- Protomaps — open and self-hostable, full styling control, no vendor.

## Notes


- Should we include "WCAG 2.2 AA compliant" in the footer or somewhere tucked away?


=====
