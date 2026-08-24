

Content: logos + URLs on all 7; addresses folded into the neighborhood blurbs (Brain Lair now reads exactly as you specified); Marketing Specialistd The Botany Shop commented out with restore notes; the commercial/office wing split merged — with four tenants it produced a heading over threetiles and a heading over one.

Schema: neighborhood logo changed from a /public string to image(), so those marks go through the asset pipeline like everything else. Tenants already had logo and url, and logo is now the semantically right field — the schema comment distinguishes our pencil drawing (icon) from their mark (logo), and with permission
these are the latter.

Press cue now reads "Read article ↗" at every width, with at {outlet} hidden alongside. The old rule hid it entirely from md up, leaving desktop wi

Your unified sheet — good work, but it's one file

The reworked marks are a clear improvement: Alchemy is finally dark-on-light (the biggest fix), and the pink/white boxes are gone. But unified-icone contact sheet — I can't slice brand marks out of it without risking damage, and the individual files still in the folder are the old ones.

Two of them are actively wrong:
- icon-alchemy-2.webp is still the white version — invisible on a light card. Your sheet has the correct black one.
- icon-counterspell.webp is 149×55 on a white box (it's the nicer "Cloud Walking + COUNTERSPELL CAFE" lockup, but far too small).

So the page currently builds against the older files, and three marks will look wrong until you export: Cloud Walking (pink box), GreenCrest (whitex) — and Alchemy will be near-invisible.

Export spec — 7 separate files:
- Transparent background, trimmed to the ink (no baked padding — CSS controls spacing)
- Long edge ≥ 600px (the mark box is 160px wide at DPR3 ≈ 480)
- PNG or WebP; SVG is better still if the client has vector
- Alchemy: the black version from your sheet, not the white one
- Drop them into src/assets/marks/ over the current files — filenames already wired, no code change needed

One caution if you're tempted to knock the boxes out with a threshold: GreenCrest has white letterforms on green. A global "remove near-white" would punch holes in the type. That one needs doing from the source.

Cleanup I left alone: the old .cards, .link-card and .group-label CSS is still in community.astro, and TenantCard.astro is now unreferenced. Both are harmless, and given you're keeping commented-out sections until the end, I'd rather not delete anything the client might reverse. Say when and I'll sweep it.









=====
=====
=====

## Notes

- Should we include "WCAG 2.2 AA compliant" in the footer or somewhere tucked away?


=====
