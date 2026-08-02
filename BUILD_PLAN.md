# Portage Place — Build Plan

Living roadmap. Decisions get promoted here once settled; open questions stay in
the Open Questions section until answered.

---

## Phase 0 — Scaffold & pipeline ✅

**Goal:** prove GitHub → Netlify end to end before writing any real UI.

### Decisions locked

| Area | Decision | Rationale |
|---|---|---|
| Framework | Astro 7.1.6, `minimal` template | Content-first site; zero client JS by default. |
| Output | `static` (SSG) | No adapter, no functions. Netlify serves `dist/`. Adapter can be added later without rework. |
| UI framework | None — `.astro` only | Islands added later only where genuinely interactive. |
| Styling | **Deferred** — placeholder scoped `<style>` on the smoke-test page only | No system committed to yet. See Open Questions. |
| TypeScript | `strict` | Set at scaffold time; cheap now, expensive to retrofit. |
| Node | 22 (LTS "jod"), pinned via `.nvmrc` + `engines` + `netlify.toml` | Astro 7 requires ≥22.12. Local and CI must match. |
| Package manager | npm | `package-lock.json` committed. |

### Repo shape

Single project root at `portage-place/`. Verified: exactly one `package.json`
and one `astro.config.mjs` outside `node_modules`.

```
portage-place/
├── .nvmrc                 # 22
├── netlify.toml           # build cmd, publish dir, NODE_VERSION
├── astro.config.mjs       # currently empty config
├── tsconfig.json          # strict
├── public/                # favicon
└── src/pages/index.astro  # TEMPORARY deploy smoke test
```

> ⚠️ `create-astro` refuses to scaffold into a non-empty directory and silently
> redirects into a generated subfolder instead. It did that here
> (`./extraterrestrial-escape/`) and the contents were flattened up into the real
> root manually. Worth remembering for any future re-scaffold.

### Netlify

`netlify.toml` sets `command = "npm run build"`, `publish = "dist"`,
`NODE_VERSION = "22"`, and builds deploy-previews and branch-deploys identically
to production.

### Smoke test

`src/pages/index.astro` renders the Netlify build context, branch, commit SHA,
and build timestamp — so a deploy can be confirmed as *fresh* rather than cached.
Marked `noindex`. **Delete before launch.**

---

## Phase 1 — Definition

Not started. Blocked on Open Questions below.

---

## Open Questions

1. **What is Portage Place?** Business/venue/property/community org? What does a
   visitor come here to do?
2. **Page inventory** — what pages exist at launch?
3. **Content source** — hardcoded in `.astro`, Markdown content collections, or a
   CMS?
4. **Styling system** — Tailwind v4 vs. plain CSS + custom properties.
5. **Design input** — existing brand/designs to match, or built from scratch?
6. **Domain** — needed to set `site` in `astro.config.mjs` for canonical URLs,
   sitemap, and OG tags.
7. **Forms / dynamic behavior** — contact form, booking, search? Determines
   whether the static-only decision holds.

---

## Conventions

Captured in `CLAUDE.md` as they solidify.

## Housekeeping

- `TODO.md` — scratch pad, delete before launch.
- `BUILD_PLAN.md` — this file, delete before launch.
- `AGENTS.md` / `CLAUDE.md` — currently `create-astro` boilerplate, to be rewritten.
