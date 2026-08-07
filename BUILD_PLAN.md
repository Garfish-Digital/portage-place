# Portage Place — Build Plan

Living roadmap. Decisions get promoted here once settled; open items live in
**Open Decisions** and **Open Questions** until answered.

---

## The Brief

**Portage Place** is a restored 1919 industrial bakery in South Bend's Near
Northwest Neighborhood — built by the **Busse Baking Company**, taken over by
**Ward Baking Company** in the early 1920s, later a warehouse for **Ford
Distributing**, vacant from 2012, and reopened in December 2025 as commercial and
office space for lease.

> ⚠️ **This paragraph replaces an earlier version that was wrong in three ways.**
> The research supplied in `reference/history/` corrects the story the current
> live site tells, and the corrections matter because the audience includes
> people who know this building:
>
> 1. **Not "originally the Ward Baking Company."** The 1919 plant was built by
>    **Fred W. Busse's** South Bend firm for $90,000. Ward acquired it around
>    1922–24 after the price war remembered locally as the *South Bend bread war*.
> 2. **Not a "Ford Distribution Center."** **Ford Distributing** was a local
>    wholesaler of vending machines, coffee makers, tobacco and convenience
>    goods — **not Ford Motor Company**. The current site's phrasing reads as
>    automotive and flatters the building with a history it doesn't have. Both
>    research documents flag this independently and emphatically.
> 3. **"Art deco" is unverified and probably wrong.** A 1919 industrial bakery
>    predates Art Deco, which reaches the US after the 1925 Paris exposition. Any
>    deco flavour more likely comes from the c.1940 north addition (Art Moderne).
>    See Design Direction for what this does and doesn't change.

**Primary goal (client's words, refined):** people should remember the Portage
Place *name* as a place they can rent space in a great location.

**Conversion action:** one low-friction email CTA — *"Email us so we can talk."*
No pricing negotiation, no lengthy inquiry form, nothing that feels like a
commitment. Expected volume: **≤10 emails/month**.

**Positioning insight:** this is not a corporate office tower and should not look
like one. The tenant mix — coffee shop, yarn shop, bakery, two artists, massage
therapists, yoga, psychiatry, an outreach center, plus 20 private offices
holding tech, real estate, medical supplies, solar, marketing — is *eclectic,
warm, and human*. The building's appeal is character and community, not Class-A
polish. The design should read **crafted and warm**, not cold-minimal-luxury.
The art-deco/industrial-bakery heritage is the differentiator no competing
listing can copy.

**Scale:** Phase 1 opened **December 2025** — roughly **20,000 of the building's
~56,000 sq ft**. Commercial wing + office wing, split by the restrooms and a
dividing door. Phase 2 will renovate near-identically. Spaces run
**200–2,000 sq ft**. Currently 9 commercial + 11 office tenants; the finished
building is planned for 50–60.

### ⚠️ The "art deco" question — a design decision, not just a fact-check

The heritage framing runs through the whole design direction, so this needs a
deliberate answer rather than a footnote.

**What we know:** a 1919 sanitary bakery is early-20th-century industrial
vernacular — brick, big windows, utilitarian. That is a *good* identity and it is
the one the palette already reflects, since the colours came off the building's
own brick and mortar.

**Recommendation: stop saying "art deco" and say "1919 industrial bakery."** It is
defensible, more specific, and more interesting. The differentiator was never the
style label — it's that this building baked four thousand loaves an hour, had its
windows bricked shut for forty years, and got them back in 2022.

**Nothing about the visual design has to change.** Letter-spaced small caps,
geometric rules, restrained ornament and the warm material palette read as
period-appropriate for an industrial building of this era. We simply stop
*claiming* a style we can't support.

**Ask the client before changing public copy** — "art deco" is on their current
site and may be something they're attached to. If they want to keep it, the
compromise is to attach it to the c.1940 addition rather than the whole building.
Settling it with the South Bend Historic Preservation Commission or the Indiana
SHAARD database would cost one email.

---

## Phase 0 — Scaffold & pipeline ✅

**Goal:** prove GitHub → Netlify end to end before writing any real UI. Done.

### Decisions locked

| Area | Decision | Rationale |
|---|---|---|
| Framework | Astro 7.1.6, `minimal` template | Content-first; zero client JS by default. |
| Output | `static` (SSG) | No DB, no auth, no per-request logic. Netlify serves `dist/`. |
| UI framework | None — `.astro` only | Islands only where genuinely interactive. |
| TypeScript | `strict` | Cheap now, expensive to retrofit. |
| Node | 22 (LTS "jod") — `.nvmrc` + `engines` + `netlify.toml` | Astro 7 requires ≥22.12. Local and CI must match. |
| Package manager | npm, lockfile committed | — |
| Repo shape | Single root, verified | One `package.json`, one `astro.config.mjs`. |

> ⚠️ `create-astro` refuses to scaffold into a non-empty directory and silently
> redirects into a generated subfolder. It did that here
> (`./extraterrestrial-escape/`); contents were flattened up manually. Remember
> this if we ever re-scaffold.

---

## Phase 1 — Foundations

### Decisions locked

| Area | Decision | Rationale |
|---|---|---|
| Styling | **SCSS + native CSS custom properties** | Tokens as CSS variables (runtime-themeable, survive view transitions); SCSS for fluid-type/breakpoint math and mixins. Astro scoped styles prevent specificity fights. |
| Animation | **Native CSS only — no GSAP, no Three.js** | See Motion Strategy. |
| CMS | **None.** Markdown content collections, typed with Zod | Rob is the sole editor indefinitely; changes are infrequent. |
| Forms | **Netlify Forms**, single recipient | ≤10/mo, one address. Zero backend. |
| Fonts | **Self-hosted via Fontsource** | No external request, no privacy/GDPR surface, no FOUT from a third-party CDN, fully version-pinned. |
| Icons | **`astro-icon` + Lucide set** | Inlines SVG at build time — zero runtime JS, but with a real icon library's ergonomics. Resolves the "Lucide vs. hand-rolled SVG" question in favor of both. |
| Service worker | **Excluded** | Offline access buys nothing here; stale-content bugs are real and would bite exactly when content changes. Webmanifest + full icon/meta coverage still shipped. |
| Analytics | **None** | Client explicitly will not measure. Netlify Forms retains submissions, which is the only signal that matters. |
| Min viewport | **375px** | Plus explicit testing at the ThinkPad E14's short-height desktop viewport. |
| Accessibility | **WCAG 2.2 AA**, full keyboard operability | Non-negotiable per Rob. |

### Motion Strategy

The "$15k feel" comes from **easing, transform, and restraint** — not from a
library. Concretely:

- **Scroll-driven effects** (History timeline, Home parallax) use native CSS
  `animation-timeline: view()` / `scroll()`. This shipped across Chromium,
  Safari, and Firefox over 2023–2025. Older engines simply render the static
  end-state, which is a legitimate design, not a broken one.
- **Reveal states** use a ~20-line `IntersectionObserver` where CSS can't express
  the trigger. This is the only JS we ship for motion.
- **Micro-interactions** — buttons, cards, the CTA — are hand-tuned
  `cubic-bezier` transitions on `transform` and `opacity` only. Never animate
  layout-triggering properties.
- **`prefers-reduced-motion: reduce`** → drop all transforms and parallax, keep
  short opacity fades. Reduce, don't remove; the site should still feel alive.

**Revisit trigger:** if we end up wanting scroll-*scrubbed* video or a multi-step
sequenced timeline, GSAP earns its ~50 KB. Not before.

### Performance budget

Page loads "must be elegant and fast." Targets, enforced by eyeball + Lighthouse
on the deploy preview:

- **Zero blocking JS** on first paint.
- **LCP < 1.5s** on 4G mobile. The hero image/video is the LCP element and gets
  `fetchpriority="high"` + a poster frame.
- **CLS ≈ 0** — every image and video carries explicit dimensions.
- Two font families max, two weights each, `font-display: swap`, critical faces
  preloaded, subset to Latin.

**Measured at the end of Phase 1** (`npm run build`, gzipped):

| | Size |
|---|---|
| Global CSS | **5.7 KB** |
| Home HTML | **5.2 KB** |
| JS bundle files | **0** — all three scripts inline as deferred modules |
| Critical fonts | 67 KB (Fraunces) + 27 KB (Public Sans) |

Italic faces are declared but carry their own `unicode-range`, so the browser
only fetches them when italic text actually renders — they cost nothing on a page
without a pull quote. Only the two upright faces are preloaded; preloading all
four would make the italics compete with the LCP element for bandwidth.

### What Phase 1 shipped

```
src/styles/     _functions  _mixins  _abstracts  _tokens  _reset  _base  global
src/components/ Button  Header  Footer  FloatingCta  ContactModal
                primitives/ Container  Section  Stack
src/layouts/    BaseLayout
src/config/     nav.ts        ← nav + contact, single source of truth
src/pages/      index  specimen  deploy-check
```

Notes worth carrying forward:

- **`.pp-on-dark` is a surface context, not a dark mode.** It remaps the semantic
  colour aliases, so components read `--pp-text` / `--pp-surface` and get correct
  values on espresso automatically. No component needs an inverse variant. Watch
  the specimen's dark section for proof — the same `<Button>` switches pairings
  without being told.
- **`abstracts` is injected into every component `<style>`** via Vite's
  `additionalData`. It's functions and mixins only, so it emits zero CSS no matter
  how many components pull it in. Partials loaded via `@use` don't receive the
  injection and must declare it themselves.
- **Focus uses `outline`, never `box-shadow`.** That keeps `box-shadow` free for
  the buttons' hover ring and lift, so a button that is focused *and* hovered
  shows both states instead of one clobbering the other.
- **The modal is a native `<dialog>` + `showModal()`.** Focus trapping,
  background inertness, Esc-to-close and focus restoration all come free — those
  four are exactly where hand-rolled modals fail.
- **The fluid type scale interpolates in `rem`, not `px`.** A px-only `clamp()`
  ignores the user's browser font-size setting and fails SC 1.4.4.

### ⚠️ Local Node version

`.nvmrc` says 22 and `netlify.toml` pins `NODE_VERSION = "22"`, but the shell
here defaults to **v20.19.0**. Astro 7 requires ≥22.12. `nvm use` before running
anything, or builds will behave differently locally than on Netlify.

---

## Information Architecture

The current sitemap (Home / Team / History / Contact) has **no home for the floor
plans** — which is the site's single most important job. Proposed revision:

| Page | Purpose |
|---|---|
| **Home** | Hero, the pitch, location, teasers into the other pages, CTA. |
| **Find Your Space** ⭐ *new* | Floor plans, size ranges, amenities, "what fits here," location map. The leasing page. |
| **History** | Vertical timeline, 5–10 milestones. |
| **Community** | Tenants → Owners → Neighborhood → Partners, on one shared expandable-card component. |
| **Contact** | Address, hours, directions, the form inline. |

#### Naming the leasing page

Working title **"Find Your Space"** — action-oriented, and it rhymes with the
existing copy voice (*room to think, room to work, room to create, room to
play*). Nav can shorten to **"Spaces"** if the full phrase crowds the header.

**Do not name it "Availability."** That is the CRE convention, but it promises
live vacancy data we have explicitly decided not to maintain. A visitor who
clicks "Availability" and finds static floor plans feels misled — the one thing
this site cannot afford, given the goal is trust and recall.

#### Community page order — LOCKED

1. **Tenants** — who's here now.
2. **Owners** — the people who rescued and run the building. Monte Anderson /
   Taylor Station mentioned small at the bottom of this section, as mentor and
   model links only.
3. **Neighborhood** — nearby businesses and goodwill relationships.
4. **Partners** — civic and community support (carried over from the current
   GoDaddy site; see Partner Marks below).

**On the Team question.** The original sitemap had a standalone Team page, and
merging it here deserves the hard look Rob asked for. Recommendation: **keep the
merge**, for three reasons.

- The owners *are* the property managers, and they are also the people you email.
  A standalone page for 2–4 people who are one click from the Contact page is
  thin and redundant.
- Tenants-first is the stronger rhetorical order. "Look at this ecosystem — and
  here are the people who built it" earns the owners far more credit than a bio
  page in isolation. Their credibility here derives from the community, so lead
  with the evidence.
- With four sections the page has genuine substance instead of two thin ones.

**But split it back if either is true:** the owner bios turn out long and rich
enough to carry their own page, or the client specifically expects a "Team" nav
item because peers have one. Worth asking them directly rather than deciding for
them.

Separately: the owners' *rescue-and-revitalization story* is emotional pitch
material and belongs at the end of **History** or on **Home** — not compressed
into a bio card. The bio card is credentials; the story is persuasion.

### Fixing the wall of text

The current homepage copy is ~10 anaphoric "A place to…" lines plus a dense
location paragraph. The *information* in it is good — the *format* is the
problem. Proposed decomposition:

1. **Hero:** one line. The "Where You Want to Be" energy, tightened.
2. **Use-type grid:** the "all under one roof" list becomes a scannable icon
   grid — retail, offices, studios, professional services, light industrial,
   maker space, health & wellness. Answers "do I belong here?" in three seconds.
3. **Stat strip:** `200–2,000 sq ft` · `Built 1920` · `20 private offices` ·
   `Starting at $300/mo` · `$4.2M renovation`.

   ✅ **Price confirmed with client: $300.** This supersedes the live GoDaddy
   site's "$350," which is now stale. Rendered as `$300/mo` — cents read as
   invoicing, not marketing.
4. **Location module:** the proximity list (downtown, Notre Dame, Saint Mary's,
   IU South Bend, Michiana International Airport) as a compact distance list or
   simple map graphic, not prose.
5. **History teaser** → links to the timeline.

The Monte Anderson / Taylor Station reference is meaningful to developers and
civic people but opaque to a prospective tenant. Suggest demoting it to the
History page rather than the homepage.

---

## Content Model

Markdown collections in `src/content/`, schema-validated with Zod:

- **`tenants`** — name, category (commercial | office), logo or portrait,
  optional quote, optional link, `featured` flag. ~12 surfaced of 20.
- **`neighborhood`** — name, logo, link, one-line description.
- **`team`** — name, role, portrait, bio.
- **`milestones`** — year, title, body, optional archival image. 5–10 entries.
- **`spaces`** — suite type, size range, wing, floor-plan region id.
- **`press`** — outlet, headline, url, date, optional pull quote.

Everything else is page-level content in `.astro`.

---

## Press & Credibility

Client supplied a tentative press list (below). These are worth more than a link
list — they are **third-party validation from named outlets**, which is exactly
the trust signal a prospective tenant needs and which no amount of our own copy
can manufacture.

**Placement: an "In the News" section at the foot of the History page.** They all
document the 2021–2022 renovation, which *is* the most recent chapter of the
building's history — so they extend the timeline rather than interrupting it.

| Date | Outlet | Story |
|---|---|---|
| Jun 2021 | WVPE | Common Council approves tax abatements for Ward Bakery redevelopment |
| Feb 2022 | Milwaukee Journal Sentinel | South Bend's micro-scale developers changing an Indiana city |
| Mar 2022 | WNDU | $4.2M renovations underway at old Ward Baking Co. building |
| Mar 2022 | South Bend Tribune | Façade work underway on the former Ward Baking Building |
| Mar 2022 | 95.3 MNC | Century-old building to be renovated into commercial center |
| — | West SB | New Life for a 102-Year-Old Bakery in South Bend |
| — | SB–Elkhart Regional Partnership | READI funds — $550k awarded |

### What this gives the timeline

The press list resolves most of the History page's content problem:

- **c. 1920** — Ward Baking Company built *(confirmed: "102-year-old" in 2022)*
- **1940s** — building expanded
- **—** — becomes Ford Distribution Center *(date needed)*
- **2012** — abandoned
- **Jun 2021** — tax abatements approved
- **2021/22** — $550k READI funds awarded *(date needed)*
- **Mar 2022** — $4.2M renovation and façade work begin
- **—** — Phase 1 complete, tenants move in *(date needed)*
- **Now** — Phase 2 upcoming

That's 8–9 milestones, inside the 5–10 target, with hard numbers (**$4.2M**,
**$550k**, **102 years**) that make the story concrete instead of vague.

### Accessibility overlay widget — ❌ DECIDED AGAINST

The "person in a circle" icon that opens a menu of text-size, contrast and
dyslexia-font toggles. **We are not shipping one**, and the reasoning is worth
recording because it looks like the accessible choice.

- **They are opposed by the accessibility community**, not embraced by it.
  Thousands of disabled users and accessibility professionals have signed a public
  statement against overlays; screen-reader users report them actively
  interfering with the assistive tech they already run.
- **They mostly duplicate the browser.** Text sizing, zoom, contrast and reader
  modes are all built into the OS and browser, and users who need them have
  already configured them — better than our widget will.
- **They increase legal exposure rather than reducing it.** A large and growing
  share of US web accessibility lawsuits have been filed against sites *running
  overlays*, because the widget advertises a claim the underlying markup doesn't
  meet.
- **They cost the thing this project can't spend.** A third-party script, blocking
  JS, and a floating badge in the corner — against a build whose stated targets
  are zero blocking JS and a strictly controlled visual identity.

**What we do instead** is the real version of the same intent, and it's already
mostly built: semantic markup, genuine keyboard operability, verified contrast,
`prefers-reduced-motion` honoured, focus never suppressed, targets ≥44px, and
respecting the user's own browser font-size (which is why the fluid type scale
interpolates in `rem`).

If the client asks for the icon specifically, the honest answer is that the badge
signals accessibility while the underlying work provides it — and we're doing the
work. Worth having ready, since it's a reasonable thing for them to ask about.

### Implementation notes

- New **`press`** collection: outlet, headline, url, date, optional pull quote.
- Text links with outlet names — **not** outlet logos. Reproducing news
  mastheads raises trademark questions and can imply endorsement rather than
  coverage. Names in Jost, dated, are cleaner and safer.
- `rel="noopener noreferrer"`, opening in a new tab. This is the one place on the
  site where sending the visitor away is acceptable — but we shouldn't lose our
  own page doing it.
- **Verify every link resolves before launch**, and re-check at cutover. Local
  news outlets restructure URLs and paywall archives; a dead credibility link is
  worse than no link.
- Three dates are missing (Ford era, READI award, Phase 1 completion) — see Open
  Questions.

---

## Floor Plans

Source files will likely arrive as **JPG or PDF**; Rob can vectorize in Figma.

**Decision:** interactive SVG floor plan with hoverable/clickable regions showing
**size and space type only — no pricing, no live availability.** The client does
not want up-to-the-day availability maintenance, and stale vacancy data is worse
than none.

- **Desktop:** hover highlights a region, click opens a detail panel.
- **Mobile:** pinch-zoom and pan within a contained viewport, tap for detail.
- Regions are `<path>` elements with `role="button"`, `tabindex`, and accessible
  names, so the whole plan is keyboard-navigable. A plain text list of spaces
  sits alongside as the accessible equivalent, not hidden away.

---

## Location Map

Lives at the bottom of **Find Your Space**, paired with the proximity list
(downtown, Notre Dame, Saint Mary's, IU South Bend, Michiana International).

**Honest answer on styling: the free Google Maps `<iframe>` embed still cannot be
restyled.** That has not changed. Custom map styling requires the Maps JavaScript
API with a Cloud-based Map ID, which means an API key, a billing account, and a
sizeable JS payload. The plain embed also ships ~1 MB+ and sets third-party
cookies before the visitor has done anything.

**Recommended approach — a styled static map with a facade:**

- A **static map image** styled to the site palette (Mapbox Static Images API, or
  hand-drawn in Figma — the latter is genuinely viable here since the location
  never changes and you already work in Figma).
- Overlaid with a branded PP pin and the proximity callouts.
- Two clear buttons: **Get Directions** and **Open in Google Maps**, deep-linking
  to the visitor's own map app.
- Zero JS, zero third-party cookies, zero layout shift, and it looks designed
  rather than pasted in.

If the client insists on a live interactive map, the fallback is **MapLibre GL +
a free tile provider**, which is fully styleable and needs no Google billing
account. Only worth it if pan/zoom is genuinely wanted.

**Local SEO note:** the "remember the name" goal is served more by a well-tended
**Google Business Profile** than by an embedded map. Worth raising with the
client — it costs nothing and drives the branded searches they actually want.

---

## Design Direction

### Palette — ✅ LOCKED

Official colors are black and white; the current site's accent is **red**, which
reads as alarm/urgency — wrong for "welcoming." The direction is a **material
palette** — plaster, limestone, old brick, black steel, brass, mature greenery —
so the site reads architectural rather than trendy, with green as an accent that
suggests growth and occupancy rather than "eco."

#### Grounded in the actual building

Rob photographed the two brick types, the framing, and interior/exterior mortar,
each with a white reference card in frame. Sampling those photos and
white-balance-correcting against the card produced a decisive finding:

**Every material in the building falls in hue 22–36°.** Nothing is neutral gray.

| Material | Measured (WB-corrected) | HSL |
|---|---|---|
| Exterior brick | `#694933` · `#724828` | hsl(24–26, 35–48%, 30–31%) |
| Exterior mortar | `#6C4F37` · `#735442` | hsl(22–27, 27–35%, 27–35%) |
| Interior brick | `#A59078` · `#84735E` | hsl(32–33, 17–20%, 44–56%) |
| Interior mortar | `#767164` · `#857C6C` | hsl(36–43, 8–11%, 43–47%) |
| Framing (dark) | `#322F2C` | hsl(30, 6%, 18%) |

Three consequences, all now baked into the token layer:

1. **The neutrals are warm, not gray.** Pure-neutral `#242424`/`#111111` on a warm
   plaster background read cold and dingy. Replaced with `#22201C` / `#16130F` —
   identical contrast, coherent temperature.
2. **Espresso is literally the building's paint.** The proposed `#35322F` and the
   measured framing `#322F2C` are two points of lightness apart. Adopted the
   measured value.
3. **Terracotta was dropped.** The real exterior brick is hsl(25, 40%, 31%) —
   considerably darker and less red than the proposed `#B66A4A` (hsl 17, 43%,
   50%), which is a Southwestern adobe color this building doesn't have. Pushing
   it to match would land it in the espresso family, so it stops being a bright
   secondary accent at all. It was also colliding with the error red. The
   *interior brick* tones took its place as the mid-tone ramp the palette was
   missing (plaster L96 → limestone L84 → **nothing** → espresso L20).

#### Locked values

Every pairing in use is contrast-verified. Full token list and ratios live in
`src/styles/_tokens.scss`; the working specimen is at `/specimen`.

| Purpose | Token | Hex | Verified |
|---|---|---|---|
| Page background | `--pp-plaster` | `#F7F5F1` | — |
| Alt section | `--pp-limestone` | `#DDD7CF` | — |
| Dark surface | `--pp-espresso` | `#322F2C` | *measured* |
| Headings | `--pp-ink-strong` | `#16130F` | 17.00:1 |
| Body | `--pp-ink` | `#22201C` | 14.93:1 |
| Muted | `--pp-ink-muted` | `#5C5449` | 6.84:1 |
| Muted on dark | `--pp-ink-inverse-muted` | `#AE9C86` | 5.00:1 |
| Brick light / mid / dark | `--pp-brick-*` | `#A59078` `#84735E` `#6B4931` | *measured* |
| CTA rest | `--pp-green` | `#2F6F4E` | 5.99:1 w/ white |
| CTA hover fill | `--pp-green-hover` | `#38835C` | 4.60:1 w/ white |
| CTA hover ring | `--pp-green-ring` | `#43A36A` | decorative only |
| Link | `--pp-green-link` | `#2A6446` | 6.41 / 4.88 on limestone |
| CTA on dark | `--pp-green-on-dark` | `#7FC79B` | 6.68:1 w/ espresso |
| Ornament / focus ring | `--pp-bronze` | `#A97A3D` | 3.48 & 3.51 — non-text |
| Input borders | `--pp-border` | `#8F8476` | 3.37:1 (SC 1.4.11) |
| Error | `--pp-error` | `#96322C` | 6.91:1 |

#### Six problems the contrast pass caught

Worth keeping on record, because each was invisible by eye:

1. **Bright green under white text fails.** `#43A36A` is 3.14:1. WCAG applies to
   hover states, so the fill shifts `#2F6F4E` → `#38835C` (4.60) and the bright
   green becomes the **ring**, not the fill.
2. **The CTA vanished on dark surfaces.** `#2F6F4E` on espresso is 2.13:1 — and
   the CTA appears on the footer and over dark hero overlays on every page. Hence
   the `.pp-on-dark` context and the light-green pairing.
3. **Green links failed on limestone** (4.19). One link green now passes on both
   surfaces.
4. **Bronze can't carry text** (3.48). It's the underline, the rule, the pin, and
   the focus ring — never the label.
5. **Limestone is invisible as a border** (1.31). Meaningful edges use
   `--pp-border`; hairlines use `--pp-rule`.
6. **Terracotta and the error red were the same color.** See above.

**Bronze is the one accent clearing 3:1 against both plaster *and* espresso**,
which is why it became the single site-wide focus ring — no per-surface
overrides, no missed states.

> Open: bronze at 47% saturation is more saturated than anything measured in the
> building. Defensible — it's meant to read as *brass*, and metal is the one
> material not photographed — but worth a second look if it starts to feel
> applied rather than found.

### Type — ✅ LOCKED

**Fraunces** for headings · **Public Sans** for body.

Both self-hosted via Fontsource, both axis-verified at install:

| | Fraunces | Public Sans |
|---|---|---|
| Variable weights | 100–900 | 100–900 |
| Other axes | `opsz` 9–144, `SOFT`, `WONK` | — |
| Italics | ✅ true | ✅ true |
| Role | Headings, display, pull quotes | Body, UI, labels, captions, h5/h6 |

**Governing principle: one family carries the warmth, the other stays quiet.**
Two faces both trying to have character fight each other. Fraunces carries it;
Public Sans is the steady counterweight.

**Why Fraunces.** It exposes an optical-size axis, so the browser redraws the
letterforms per size rather than merely scaling them — thinner hairlines at
display sizes, sturdier at small ones. That is most of why the pairing holds up
across the whole scale, and it's the kind of detail that reads as *crafted*
without anyone being able to name why.

**Why Public Sans.** Out of the US Web Design System (a Libre Franklin
derivative). Civic, plain, unglamorous — it feels like neighborhoods, wayfinding,
and community rather than startup. It also reaches **900**, which resolves the
"no black weight" constraint that the earlier Instrument Sans proposal carried.

**Why not the alternatives.** Source Serif 4 is excellent but neutral, and the
plan had already flagged that this build needs distinctiveness from somewhere.
IBM Plex Sans is architectural as advertised, but it's a large tech company's
house font and reads "engineering." Inter / Montserrat / Poppins / Manrope /
Outfit / DM Sans are all ruled out as overused.

#### Two constraints being actively managed

1. **WONK is switched off, and not even loaded.** We ship Fraunces' `standard`
   file (opsz + wght, 65.7 KB latin). The wonky single-storey `g` and swashes
   read as artisanal-coffee-brand rather than restored-landmark. Adding SOFT and
   WONK means the `full` file at **+53 KB** — not spent. If we ever want SOFT,
   that's the switch.
2. **Fraunces is display-leaning.** Capped at h1–h4 and pull quotes. At h5/h6 it
   hands off to letter-spaced Public Sans small caps — below ~24px the serif
   stops adding character and starts costing legibility.

#### Design consequence to compensate for

Neither face is *period*. The earlier Jost/Futura option carried an explicit
1920s deco echo; this pairing does not. That is a fair trade — the tenant mix is
eclectic and communal, not glamorous, and legibility beats theme. But it means
**the deco heritage has to be carried by everything except the type**: the PP
logo, letter-spaced small-caps treatments (the `eyebrow` mixin), geometric rules
and ornament, the palette, and the archival imagery on the History page.

Fraunces does more work here than Source Serif 4 would have — it has genuine
character — but the burden still mostly sits on ornament and layout.

### Brand assets

- **Figma** for the master PP mark, floor-plan vectorization, and OG images
  (5 pages = hand-crafted OG images are worth it and beat generated ones).
- **realfavicongenerator** for the platform icon matrix and webmanifest, fed from
  the Figma SVG. This answers the earlier open question in favor of *both*, split
  by what each is good at.
- **QR code** linking to `portageplacesb.com`, generated as vector so it prints
  on flyers at any size and displays crisply on a phone.

### Partner marks

Reference copies of two current-site partner marks are parked in
`public/reference-only/`. Both need replacing — they are 3.7 KB and 6.8 KB
rasters that will fall apart at any usable size.

⚠️ **Three issues to resolve before these ship:**

1. ✅ **Resolved.** Moved to `/reference/` at the repo root, which Astro never
   publishes, and added to `.gitignore` so it stays out of the repo too.
   Note: the two `.webp` files had already been `git add`-ed, and **`.gitignore`
   has no effect on files that are already staged or tracked** — they were
   unstaged with `git rm --cached`. Worth remembering: adding a path to
   `.gitignore` does not retroactively remove anything Git already knows about.
   `/reference/` now doubles as the shared scratch space for build notes
   (`DESIGN_RESEARCH.md`, `portage-building-pics/`).
2. **The South Bend mark is the official city seal.** Municipal seals commonly
   carry usage restrictions, and displaying a seal implies *official
   endorsement* rather than partnership. Request the city's standard logo or
   wordmark instead, and confirm permitted use.
3. **Get written permission and vector source** for every partner mark. Ask each
   org for their brand/press kit — most have SVG or EPS on request, which solves
   the resolution problem at the same time.

---

## Forms & CTA

> ⚠️ **The floating button is provisional and explicitly open for revision.** It
> was not a client request — it's our own answer to "reachable at any time." It
> ships in Phase 1 so the conversion path exists end to end, but this feature
> lends directly to the client's #1 purpose and should not be settled by default.
>
> **Alternatives to weigh before Phase 7:** a sticky footer bar (more room for a
> real sentence, no corner collision with iOS chrome); a header-anchored CTA that
> docks after the hero scrolls past; or per-section contextual CTAs ("this space
> is 480 sq ft — ask about it") which convert better than a generic global button
> because they inherit the context the visitor is already in. The third is the
> strongest candidate on paper and the most work.
>
> Current implementation already hides the floating button while the footer CTA
> is on screen — two identical asks in one viewport reads as nagging.

- Persistent floating CTA button, **lower right**, on every page → modal form.
- **Fields:** email (required) + message textarea (**optional**). No name field.
  Many visitors will drop an address and nothing else, and that must feel like a
  complete, successful action — not an abandoned form. The textarea's label and
  placeholder should make optionality obvious at a glance.
- Watch the iOS Safari bottom bar, which overlaps the lower-right corner during
  scroll. Use `env(safe-area-inset-bottom)` and verify on real hardware.
- Netlify Forms with a honeypot field for spam; no CAPTCHA (adds friction and a
  third-party script for a ≤10/mo volume).
- Submit via `fetch` so the success state renders **inside the modal**. Never
  redirect to Netlify's default success page — that would break the "simple and
  low-commitment" feel.
- Modal must trap focus, close on `Esc`, restore focus to the trigger, and be
  labelled. This is the most accessibility-sensitive component on the site.
- **Newsletter note:** Netlify Forms is a delivery mechanism, not a list manager.
  If they ever want to actually *send* to collected addresses, that needs
  Buttondown/Kit or similar. Not now — but we should store submissions in a form
  that could be exported later.

---

## Video & Imagery

- **Hero:** short, silent, heavily compressed, self-hosted loop with a poster
  frame. `autoplay muted playsinline loop`, paused under `prefers-reduced-motion`.
- **Testimonial/story video:** Vimeo, embedded in an on-page lightbox — no
  branding, no suggested videos, never navigating the user off-site.
- Self-hosting everything is rejected: no adaptive bitrate means every mobile
  visitor downloads the desktop-sized file, on Netlify's bandwidth.
- **Interim:** Rob shoots 30-second phone placeholders. Professional photography
  and freelance video arrive in the coming weeks.
- All images served as AVIF/WebP through Astro's `<Image />` with explicit
  dimensions and correct `sizes`.

### Archival image treatment

Bake the treatment into the asset in Figma rather than applying a CSS filter.
CSS `filter: sepia()` applies the same transform to images with wildly different
original casts, so it reads as *a filter* rather than as age — and the archival
set here ranges from a clean scan to a screen grab.

**Don't reach for flat sepia.** Real prints don't age uniformly: they lose
contrast, warm in the highlights, and cool slightly in the shadows. The recipe
that looks expensive:

1. Desaturate to grayscale first.
2. Apply a **split tone** rather than a single-hue wash — highlights warm, shadows
   cool. Use the site palette: highlights toward `--pp-limestone` `#DDD7CF`,
   shadows toward `--pp-espresso` `#322F2C`. That ties the archival images into
   the palette we already sampled off the building, so they look native to the
   page instead of dropped in.
3. Pull contrast slightly *below* the modern photographs. Age reads as softness.
4. Grain sparingly. Vignette very sparingly — a heavy vignette is the single
   fastest way to make a real archival photo look fake.

**Keep untreated masters in `reference/`.** The treatment will get revised.

### The then/now dissolve

Rob shot the modern exteriors at matching angles, which makes a crossfade
genuinely possible. Two constraints if we build it:

- **Keep the archival treatment subtle.** A heavy tint on one side makes the
  transition read as a filter toggle rather than as time passing. The stronger
  effect comes from the *alignment* being right, not from the grading being
  dramatic.
- **It must work without the interaction.** A scrubber or hover crossfade needs a
  static, captioned fallback — both images side by side — for keyboard users,
  reduced-motion users, and anyone whose engine doesn't support the effect.

---

## Deployment & Domain Migration

- **Dev:** `portageplace.netlify.app` (live now).
- **Production:** `portageplacesb.com`, currently a GoDaddy template site with
  GoDaddy hosting.

**Recommendation: migrate to Netlify.** Not because GoDaddy's uptime is bad — for
a brochure site it's unremarkable either way — but because the value is in
*coherence*: Rob maintains this indefinitely, already runs Netlify daily, and
splitting deploy and DNS across two vendors means two dashboards, two support
paths, and a renewal he doesn't control. Atomic deploys, instant rollback, deploy
previews, and automatic Let's Encrypt renewal are all things GoDaddy's static
hosting doesn't offer.

**Suggested split:** move **DNS** to Netlify; leave **registration** at GoDaddy.
Transferring a registrar adds a 60-day lock and buys nothing.

### 🚨 CONFIRMED: live email exists on `portageplacesb.com`

**The domain has a working email address on it, plus an email-capture popup.**
This is the single highest-risk item in the entire build.

### ✅ RESOLVED — the risk is much smaller than assumed (verified 2026-08-06)

The production contact address is **`tyler@regensb.com`** — a *different domain*.
A DNS check settles what that implies:

```
portageplacesb.com   MX    → (none)
portageplacesb.com   TXT   → (none — no SPF)
_dmarc               TXT   → (none)
portageplacesb.com   NS    → ns19/ns20.domaincontrol.com   (GoDaddy)
portageplacesb.com   A     → 76.223.105.230, 13.248.243.5  (GoDaddy builder)
www                  CNAME → apex
mail / email / autodiscover → (none)

regensb.com          MX    → aspmx.l.google.com …          (Google Workspace)
```

**`portageplacesb.com` publishes no MX records at all — nothing receives mail on
that domain today.** Mail sent to `anything@portageplacesb.com` bounces right
now. The address on the current site is a `mailto:` pointing at another domain,
not a mailbox hosted here. `tyler@regensb.com` is a Google Workspace mailbox on
`regensb.com`, which has its own separate DNS that the Netlify cutover cannot
touch.

**Consequence: repointing nameservers cannot break the client's email.** The
scariest item in the build is largely gone. The zone is also trivial — apex A
records, a `www` CNAME, and nothing else.

Two things that stay true regardless:

- **Still export the zone before cutover.** It costs a minute and it is the
  rollback artifact. Records can exist that a bare query doesn't reveal.
- **Still re-verify on the day.** This snapshot is from 2026-08-06; if the client
  adds Workspace to `portageplacesb.com` between now and launch, the full MX
  checklist below comes straight back into force. Re-run the `dig` before
  touching nameservers.

**If we point nameservers at Netlify without first replicating the MX records,
the client's email stops working immediately** — and mail sent during the outage
bounces rather than queuing indefinitely. These are friends, and they are
connected to city officials and investment groups. Breaking their email is the
one failure here with consequences beyond the website.

Because development happens entirely on `portageplace.netlify.app`, **nothing
about DNS needs to change until launch day.** No action required now. What
follows is the launch-day checklist — do not deviate from it.

**Cutover sequence — read fully before touching anything:**

1. **Export the complete existing DNS zone from GoDaddy first.** Every record:
   MX, TXT (SPF), DKIM selectors, DMARC, CNAMEs, A records, subdomains.
   Screenshot it as well as exporting. This is the rollback artifact.
2. **Identify the mail provider** (GoDaddy Email, Microsoft 365, Google
   Workspace). Each publishes an exact required record set — get it in writing
   from their documentation before migrating.
3. Lower TTLs on all existing records to 300s, **~48h ahead** of cutover, so a
   mistake is minutes to undo rather than hours.
4. Add the custom domain in Netlify and let it provision the certificate.
5. **Recreate every non-web record in Netlify DNS *before* flipping
   nameservers.** Nameservers are the last step, never the first.
6. Flip nameservers at GoDaddy.
7. **Send a test email to and from the address within minutes of the flip.**
   Verify inbound *and* outbound. Check the SPF/DKIM/DMARC alignment on a
   received message, not just that it arrived.
8. Verify HTTPS, `www` → apex redirect, and that the old site is fully replaced.
9. Only then cancel GoDaddy hosting — keep it parked briefly as a rollback.

**Also decide before cutover:** what happens to the existing email-capture popup
on the current site, and whether any addresses already collected need to be
preserved or migrated.

---

## Instagram Progress Carousel

Client has approved an **8–10 slide before/after progression carousel**. This is
a parallel deliverable with its own capture discipline, because *progress
screenshots cannot be recreated after the fact.* Miss a capture and that stage is
gone permanently.

### 🚨 Capture these immediately — they are perishable

1. **The current GoDaddy site.** Full-page screenshot, desktop *and* mobile. This
   is the "before" slide and the entire carousel hinges on it. It disappears at
   cutover.
2. **The deploy smoke-test page** (`src/pages/index.astro`), which is scheduled
   for deletion. "Day one: an empty page and a working pipeline" is a genuinely
   good opening beat and it vanishes the moment Phase 1 starts.

### Format

- **1080 × 1350 (4:5 portrait).** Takes maximum vertical feed real estate; square
  wastes ~25% of it.
- Website screenshots are landscape and fight a portrait frame. Three fixes, in
  order of preference:
  - **Mobile-viewport captures (375 × 812)** — near-perfect 4:5 fit, and honest,
    since most viewers are on a phone.
  - **Diagonal or vertical split** before/after in one frame.
  - **Device mockup frames** — polished, but eat real estate.

### The discipline that makes it work

Instagram is consumed in milliseconds, so slide-to-slide difference must be
legible *without reading*. That requires **capturing the same thing every time**:

- Pick **3–4 canonical capture targets** at the start of Phase 1 (e.g. hero,
  spaces section, timeline) and shoot those exact targets, same viewport, same
  scroll position, same content, at every phase boundary. Identical framing makes
  the change pop; drifting framing makes it mush.
- **Automate it.** A small Playwright script (`npm run shots`) at a fixed
  viewport removes framing drift entirely and takes minutes to write. Worth it
  for a capture set spanning weeks.
- Store in a repo-root **`captures/`** directory — *not* `public/`, which would
  publish them. Name `NN-phase-target.png` so ordering is automatic.
- **Vary the media.** Ten webpage screenshots in a row is monotonous. Interleave
  Figma artboards, the palette/token sheet, floor-plan vectorization stages, and
  the building itself. Process shots make the work look like work.

### Sequencing

Do **not** order the carousel chronologically. Standard structure:

- **Slide 1 = the hook.** The strongest before/after or the finished result.
  This slide alone decides whether anyone sees slide 2.
- **Slides 2–9 = the progression**, chronological once they're already engaged.
- **Final slide = the CTA.**

---

## Roadmap

📸 = **capture for the Instagram carousel before starting the next phase.**

| Phase | Scope | Status |
|---|---|---|
| **0** | Scaffold, pipeline, Netlify build config | ✅ Complete |
| **0.5** | 📸 Capture old GoDaddy site + smoke-test page — perishable | ✅ Complete (stored in IG-management structure, outside this repo) |
| **1** | Foundations: SCSS token layer, type scale (Fraunces / Public Sans), layout primitives, base layout, header/footer, floating CTA + modal + Netlify Forms 📸 **capture the `/specimen` sheet** | ✅ Complete |
| **2** | Content model + collection schemas; real copy replacing the wall of text | 🔨 Schemas + seed content done; blocked on client inputs for the rest |
| **3** | Home: hero, use-type grid, stat strip, location module, teasers 📸 | |
| **4** | Find Your Space: floor plans + interactive SVG + location map 📸 — ⚠️ **confirm static-map decision with client before building this page** | |
| **5** | History: scroll-driven vertical timeline 📸 | ✅ Built early — content was ready. Archival images still to come |
| **6** | Community: tenants → owners → neighborhood → partners 📸 | |
| **7** | Contact page, meta/OG/manifest/icon matrix, QR code | |
| **8** | Real photography and video swapped in for placeholders 📸 *(biggest visual delta — highest-value capture)* | |
| **9** | Accessibility audit, Lighthouse pass, real-device testing (iPhone 14/16, Pixel 9, ThinkPad E14) | |
| **10** | 📸 Final captures → assemble carousel; domain cutover; delete `TODO.md`, `BUILD_PLAN.md`, smoke-test page, `reference-only/` | |

---

## Phase 2 (of the building) messaging

Mentioned in copy, not featured. A single line — *"Phase 2 renovation coming
soon"* — near the space listings. Enough that a tenant needing more room than
currently exists knows to ask; not enough to distract from the actual job of
showing what's available today.

---

## Open Decisions

- Whether the Community merge holds, or Team splits back out.
- Whether bronze stays at its current saturation, which is higher than any
  material measured in the building.
- Whether "art deco" stays in client-facing copy, and attached to what. Current
  reading: the designer is using it as a *signage theme*, and a deco character
  plausibly arrived with the c.1940 addition. Copy should credit it as something
  the building acquired over time, not as its origin.

### ✅ Resolved

- ~~**Static styled map vs. live interactive**~~ — **static, confirmed with the
  client.** It only needs to orient a South Bend resident. Two-map approach:
  a wide view carrying enough downtown and the river to place the building, and a
  detail view showing the California Avenue / Rex Street cross streets. Being
  static means it can be styled to the palette, ships zero JS and zero
  third-party cookies, and has no layout shift. Unblocks Phase 4.
- ~~**The floating CTA pattern**~~ — **retired in favour of contextual CTAs.**
  `<FloatingCta />` is commented out in `BaseLayout`. CTAs now get placed per
  section at established decision points, using the button variants against
  whichever surface they sit on. The component is left in the tree rather than
  deleted, in case a sticky variant earns its place later.

## Open Questions

1. **How many owners, and how substantial are their bios?** Decides whether the
   Community merge holds.
2. **City of South Bend mark** — can we get the standard logo rather than the
   official seal, and do we have written permission? Same question for every
   partner and neighborhood mark.
3. ~~**Three missing timeline dates.**~~ ✅ Largely answered by the research in
   `reference/history/`: READI **October 2022**, Phase 1 opened **December 2025**.
   Ford Distributing's arrival remains genuinely contested (fall 1976 vs. the
   1980s) and is now carried as `confidence: contested` in the milestone data
   rather than guessed at.
4. ~~**Which mail provider** serves `portageplacesb.com`?~~ ✅ Answered: none.
   No MX records exist on that domain. The contact mailbox is
   `tyler@regensb.com`, on Google Workspace, on separate DNS. Re-verify before
   cutover in case that changes.
5. **Whose Instagram account** — Garfish Digital's or Portage Place's? This
   changes the framing completely: an agency audience wants craft and process,
   a South Bend audience wants the building and the community. It may justify
   two different cuts of the same captures.
6. **Does the client want approval** over the carousel before it posts, and do
   they want to be tagged?
7. **Do we have a Garfish brand template** for the slides (colors, logo lockup,
   slide furniture), or does that need designing too?
8. **Screenshot masters** — were native-resolution originals kept alongside the
   1080×1350 exports, and are those exports full-page or viewport crops?

---

## Questions for the client — Phase 2 content

Grouped by who can answer. Nothing here blocks schema work; all of it blocks
finished copy.

### Tenants (blocks the Community page)

1. **Which tenants get surfaced?** ~12 of 20. Confirmed so far: Counterspell
   Coffee, Alchemy Healing Arts, Rhyme & Reason Ministry, Cressy & Everett.
2. **Will they give testimonials, and who signs each one?** A quote needs a name
   and role attached, or it reads as invented. We are holding six placeholder
   entries rather than writing words for real businesses.
3. **Logo or portrait for each?** Vector preferred. A photograph of the owner
   often beats a logo for a building selling community.
4. **Permission to link to each tenant's own site.**

### The owners

5. **Is it Dwayne or Duane Borkholder?** The supplied bio says Dwayne; the
   research says Duane. Trivial to fix, embarrassing to ship wrong.
6. **Portraits for all four**, ideally shot consistently.
7. **Do they want a standalone Team page**, or is the Community merge fine? Their
   bios turned out substantial enough that either works.
8. **Is Monte Anderson happy to be named** as mentor/model?

### History

9. **Is "art deco" something they're attached to?** See The Brief — it appears
   unsupported for a 1919 building.
10. **Do they know when Ford Distributing arrived and left?** Sources conflict
    (1976 vs 1980s). If they have the deed or purchase records, that settles it.
11. **Archival image rights.** `reference/history/` holds ads, exterior and
    interior shots, and news images. Which are theirs to license? The Louis Sabo
    2022 façade photograph and Jacob Titus's West.SB photo essay are both
    third-party and would need permission.
12. **The retained bakery fabric** — original oven, yeast-room door, steel levers,
    fire doors. Can we photograph them? These are the best interpretive assets in
    the building and nothing on the current site uses them.

### Contact & launch

13. **What email should actually receive form submissions?** Currently Mike's
    personal address on the live site; Rob is advising against. `tyler@regensb.com`
    is the interim. A proper `@portageplacesb.com` mailbox would need MX records
    set up — and note the domain currently has none at all.
14. **Google Business Profile** — is one claimed and tended? For a "remember the
    name" goal it does more than anything on the site itself.

---

## Housekeeping

- `TODO.md` — scratch pad, delete before launch.
- `BUILD_PLAN.md` — this file, delete before launch.
- `/reference/` — shared scratch space (design research, building photos, partner
  marks). Gitignored and never published; nothing to clean up at launch.
- `CLAUDE.md` / `AGENTS.md` — still `create-astro` boilerplate. The token layer
  and component patterns now exist, so this is ready to be rewritten with real
  conventions.
- `src/pages/deploy-check.astro` — the old smoke test, moved off `/` when Phase 1
  began. `noindex`. Still useful for confirming a Netlify build carried the commit
  you think it did. Delete before launch.
- `src/pages/specimen.astro` — design system specimen. `noindex`. Delete before
  launch, but capture it for the carousel first.
- `CONTACT` in `src/config/nav.ts` — **every value is a placeholder.** The real
  recipient address is the one already live on `portageplacesb.com`; the street
  address has to come from the client. Do not ship as-is.
- **Netlify Forms detection is unverified.** The form is inside a `<dialog>`, and
  Netlify's build bot parses static HTML for `data-netlify`. It should be found,
  but confirm the form appears in the Netlify dashboard on the first deploy
  preview — and send a real test submission — before trusting it.
