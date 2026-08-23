Excellent. 


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
