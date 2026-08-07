# Portage Place — working conventions

Static Astro site for a restored 1919 bakery in South Bend's Near Northwest
Neighborhood, now leasing commercial and office space. Marketing site: no
database, no auth, no CMS.

**`BUILD_PLAN.md` is the source of truth for decisions.** This file covers *how
the code works*. When the two disagree, BUILD_PLAN wins and this file is stale.

---

## Running it

Rob keeps a dev server on **:4321** permanently and watches it. Don't start a
second one — check whether it's already up first.

```bash
node -v                 # must be >= 22.12 — the default shell here may be on 20
npm run build           # also the fastest correctness check
npm run check:content   # placeholder guard; run before any launch
```

`.nvmrc` and `netlify.toml` both pin Node 22. If a build behaves differently
locally than on Netlify, check the Node version first.

---

## Architecture

```
src/
  styles/       _functions _mixins _abstracts _tokens _reset _base global.scss
  components/   Button Header Footer FloatingCta ContactModal
                primitives/  Container Section Stack
  layouts/      BaseLayout.astro
  config/       nav.ts          — nav + contact, single source of truth
  content/      milestones/ team/ tenants/ *.yaml
  lib/          content.ts      — collection query helpers
  pages/
scripts/        check-content.mjs
reference/      gitignored, never published — research, photos, partner marks
```

### Styling

**SCSS + CSS custom properties.** Tokens are custom properties so they stay
runtime-themeable and survive view transitions; SCSS handles the compile-time
maths and breakpoints.

`abstracts` (functions + mixins, zero CSS output) is auto-injected into every
component `<style>` block via Vite's `additionalData`. Partials loaded through
`@use` do **not** receive that injection and must declare `@use "abstracts" as *`
themselves — that's why `_tokens.scss` has it at the top.

Component styles are Astro-scoped. Reach for `:global()` only to hook a surface
context, as `Button.astro` does with `.pp-on-dark`.

### Colour

Every value is contrast-verified and the ratios are recorded in `_tokens.scss`.
The palette was sampled from photographs of the actual building and
white-balance-corrected — the whole material palette sits in hue 22–36°, which is
why the neutrals are **warm, never gray**. `--pp-espresso` is the measured colour
of the building's door framing.

**Components read semantic aliases** (`--pp-text`, `--pp-surface`,
`--pp-text-muted`), not the raw ramp.

**`.pp-on-dark` is a surface context, not a dark mode.** It remaps those aliases,
so a component dropped inside it gets correct values with no inverse variant of
its own. `<Section tone="dark">` applies it. Before adding an `.is-inverse` class
to anything, check whether the context already handles it.

**Adding a colour means verifying it.** Text needs 4.5:1, non-text UI and borders
need 3:1 (WCAG 1.4.11). Hover and focus states are not exempt — that's how the
first bright-green button failed at 3.14:1.

### Type

**Fraunces** (headings) + **Public Sans** (body), self-hosted via Fontsource.
Both variable, both with true italics.

- Fraunces carries an `opsz` axis, so optical sizing is automatic — heading
  letterforms are redrawn per size, not merely scaled.
- We ship Fraunces' `standard` file (opsz + wght only). **`WONK` is deliberately
  not loaded** — the wonky `g` and swashes read as artisanal-coffee-brand. Adding
  SOFT/WONK means the `full` file at +53 KB.
- Fraunces stops at h4. `h5`/`h6` hand off to letter-spaced Public Sans small
  caps via the `eyebrow` mixin.
- Public Sans reaches 900.

The type is not period. **The art-deco heritage is carried by everything else** —
letter-spaced small caps, geometric rules, the palette, the PP mark, archival
imagery. (And see the "art deco" caveat in BUILD_PLAN — the claim itself is
unverified.)

### Motion

Native CSS only. No GSAP, no Three.js.

- Animate **`transform`/`translate`/`scale`, `opacity`, `box-shadow`, colour** —
  never layout-triggering properties.
- Durations and easings come from tokens. Never hard-code a duration: reduced
  motion is implemented by collapsing those tokens, so a literal `240ms` silently
  opts out of it.
- `prefers-reduced-motion` is handled in **one place**, the token layer. Don't add
  a blanket `* { transition: none !important }` — it overrides the tokens and
  strips the page bare. `_reset.scss` covers only what tokens can't reach
  (infinite animations, native smooth scroll, `[data-parallax]`).

### Accessibility

WCAG 2.2 AA, full keyboard operability, minimum viewport 375px.

- **Focus uses `outline`, never `box-shadow`** — that keeps `box-shadow` free for
  hover rings and lifts, so focused-and-hovered shows both states. Use the
  `focusable()` mixin; it targets `:focus-visible` only.
- Bronze is the single site-wide focus ring: the one accent clearing 3:1 against
  both plaster and espresso.
- Interactive targets are ≥44px (SC 2.5.8).
- `<Button>` renders `<a>` when given `href`, `<button>` otherwise. Never a
  clickable `div`.
- The contact modal is a native `<dialog>` + `showModal()` — focus trap,
  background inertness, Esc, and focus restoration come free. Don't replace it
  with a div-based modal.
- Inputs are ≥16px on mobile or iOS Safari zooms on focus.

**No accessibility overlay widget.** See BUILD_PLAN for the reasoning.

---

## Content

Astro's Content Layer API — `src/content.config.ts`, `glob()`/`file()` loaders,
Zod schemas. Query through `src/lib/content.ts`, not `getCollection` directly, so
draft filtering and sort order live in one place.

Prose-bearing collections (`milestones`, `team`, `tenants`) are one Markdown file
per entry. List-shaped collections (`press`, `neighborhood`, `spaces`) are single
YAML files.

Two schema fields do real work:

- **`confidence`** on milestones — the two research documents in
  `reference/history/` disagree on several dates. Rather than picking a winner
  silently, entries carry `documented` / `contested` / `inferred` plus a
  `confidenceNote`. The timeline hedges its language from that. Never promote a
  contested date to documented without a source.
- **`placeholder`** on tenants/neighborhood/spaces — invented stand-in content.
  These are real businesses in a real building. `npm run check:content` fails
  while any survive.

### Two content rules that are not negotiable

1. **Never invent a fact, name, date, URL, or address.** If it isn't in
   `reference/` or supplied by Rob, it doesn't go in. Mark the gap instead.
2. **Never attribute a quote to a real business or person** unless it was
   actually supplied. The four real tenant entries deliberately carry no quote.

---

## Facts the copy keeps getting wrong

- **Ford Distributing was not Ford Motor Company.** It was a local wholesaler of
  vending goods and tobacco. The current live site calls it a "Ford Distribution
  Center", which reads as automotive. Don't repeat it.
- **The building was probably not "originally the Ward Baking Company."** The
  1919 plant was built by **Busse Baking Company**; Ward took it over around
  1922–24.
- **"Art deco" is unverified** — a 1919 industrial bakery predates the style.
- **Rent starts at $300/mo**, confirmed with the client. The live site's $350 is
  stale.

---

## Working with Rob

- He controls all commits and pushes. Suggest when it's a good moment; don't run
  them.
- Flag Instagram capture moments at phase boundaries (📸 in BUILD_PLAN) — progress
  shots can't be recreated after the fact.
- Raise concerns about tech and design decisions directly; he wants them.
- Accessibility and polish are not in tension by default. Find the compliant
  version of the idea first; if there genuinely isn't one, present the trade-off
  with what's lost on each side rather than deciding unilaterally.

## Docs

<https://docs.astro.build> — [routing](https://docs.astro.build/en/guides/routing/) ·
[components](https://docs.astro.build/en/basics/astro-components/) ·
[content collections](https://docs.astro.build/en/guides/content-collections/) ·
[styling](https://docs.astro.build/en/guides/styling/) ·
[images](https://docs.astro.build/en/guides/images/)
