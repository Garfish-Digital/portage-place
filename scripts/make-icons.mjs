#!/usr/bin/env node
/**
 * Generate the favicon / app-icon set from the master SVGs.
 *
 *   node scripts/make-icons.mjs
 *
 * Everything lands in public/ and is committed. Re-run after any change to
 * src/assets/logo/*.svg.
 *
 * ── One mark everywhere: icon.svg ───────────────────────────────────────────
 *
 * TAB FAVICON uses icon.svg as of 2026-09-04, at the client's direction. It used
 * icon-heavy on this argument, kept because the measurement is real:
 *
 *     "Its stroke is 8.19% of the mark's width against icon.svg's 4.27%, which
 *      at a 16px canvas is 1.31px versus 0.68px — and a 0.68px stroke cannot
 *      render, it just antialiases to grey."
 *
 * The trade that buys: the interlock survives at tab size instead of the two
 * stems fusing into one bar, and the favicon finally matches the app icons. What
 * it costs is measured below in the generated .ico — check it after any change
 * to the mark, because sub-pixel strokes fail silently and look merely "soft".
 *
 * The lockup remains unusable at this size either way: its rules are
 * `stroke-width: 3` in a 555 viewBox, 0.54%, which is 0.09px at 16px.
 *
 * APP ICONS use icon-heavy too, as of 2026-08-31. They used the full lockup, on
 * this argument, which is worth keeping because the arithmetic is right and the
 * conclusion still wrong:
 *
 *     "Measured off a Pixel 9 screenshot, the icon renders at ~157 DEVICE px —
 *      not the ~60 CSS px it is easy to reason in ... the wordmark lands at
 *      ~114px ... and PLACE stays legible."
 *
 * 157 device px is right (Pixel 9 is DPR 2.625, 60dp x 2.625). But device pixels
 * measure RESOLUTION, not apparent size. At 422 ppi that icon is 9.5mm of glass;
 * "PORTAGE" is ~6.9mm wide with a cap height near 1.2mm, and letterspaced
 * "PLACE" is under 1mm. Reading at arm's length wants 1.5-2mm. High density
 * renders the wordmark SHARPLY, not LARGELY — CSS px was the closer proxy for
 * legibility all along, and ruling it out is what let the lockup through.
 *
 * Two things settle it. The launcher already prints "Portage Place" under the
 * icon, so the wordmark is duplicated information rendered worse than the OS
 * renders it. And measured off that same screenshot, neighbouring app marks fill
 * 75% of their disc while the lockup filled 57% — it read as a distant plaque in
 * a row of confident marks.
 *
 * icon.svg, NOT icon-heavy — and this is the trap. icon-heavy was the obvious
 * pick (heavier stroke, holds its weight beside Spotify and WhatsApp) until you
 * look at what its weight does to the mark's middle.
 *
 * Both files share identical path data; only `stroke-width` differs, 11 vs 22.
 * The two long diagonals are parallel and their centrelines are 21.96 user units
 * apart, so:
 *
 *     icon.svg        stroke 11  ->  gap +10.96 units  (4.26% of mark width)
 *     icon-heavy.svg  stroke 22  ->  gap  -0.04 units
 *
 * At 22 the strokes exactly abut. The two stems stop being two stems and become
 * one solid bar — verified by counting lit runs across the centre row of the
 * rendered PNG: icon-heavy gives 3 runs at every size, icon.svg gives 4. It is
 * geometry, not antialiasing, and no canvas size escapes it.
 *
 * That matters because the mark IS two interlocking diamonds, and the interlock
 * reads through that gap. Merged, it becomes a ribbon — handsome, but a
 * different mark from the one in the header and footer.
 *
 * The 16px favicon used to keep icon-heavy for exactly this reason inverted: at
 * that size icon.svg's stroke is sub-pixel and a merged bar beats a grey smudge.
 * That call was reversed 2026-09-04 in favour of one consistent mark. App icons
 * were never in question — icon.svg's stroke lands near 5px at true launcher
 * size, and the gap holds at 5-6px.
 *
 * The SITE keeps the lockup — header, footer, OG card. This is about icons that
 * render at thumbnail size next to other apps, nothing else.
 *
 * ── The squircle fit ────────────────────────────────────────────────────────
 *
 * Android's documented maskable safe zone is a circle of 80% diameter. Fitting a
 * mark's DIAGONAL to that circle leaves it smaller than the circle allows. We go
 * 12% beyond it deliberately: launchers crop to a squircle rather than a true
 * circle, and both the lockup and the diamond mark carry no ink in their
 * bounding-box corners — the only thing the conservative figure protects.
 *
 * Verified after the switch: icon.svg's furthest ink sits well inside the 205px
 * safe radius on a 512 canvas, so nothing clips on a round mask.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOGO = 'src/assets/logo';
const OUT = 'public';

/** The site's black — `--pp-ink-strong`, same as the footer's brand plaque. */
const BLACK = '#16130f';
const WHITE = '#ffffff';

/** Fraction of the canvas diagonal the mark's own diagonal is fitted to. */
const SAFE = 0.8;
const SQUIRCLE = 1.12;

/** Masters are `currentColor`, which resolves to black in a standalone SVG. */
const load = (file) => readFileSync(join(LOGO, file), 'utf8').replace(/currentColor/g, WHITE);

/**
 * Render a mark centred on a black square.
 *
 * The mark is trimmed to its ink first — the source viewBoxes carry their own
 * uneven margins, so fitting the raw box would size each mark differently.
 */
async function square(file, size, fit = SQUIRCLE, background = BLACK) {
	const rendered = await sharp(Buffer.from(load(file)), { density: 1400 }).png().toBuffer();
	const trimmed = await sharp(rendered).trim().toBuffer();
	const { width, height } = await sharp(trimmed).metadata();

	const diagonal = Math.hypot(width, height);
	const target = size * SAFE * fit;
	const mark = await sharp(trimmed)
		.resize({ width: Math.round((width * target) / diagonal) })
		.png()
		.toBuffer();
	const m = await sharp(mark).metadata();

	return sharp({ create: { width: size, height: size, channels: 4, background } })
		.composite([
			{ input: mark, left: Math.round((size - m.width) / 2), top: Math.round((size - m.height) / 2) },
		])
		.png()
		.toBuffer();
}

/**
 * A standalone favicon SVG.
 *
 * Colours are baked rather than inherited: `currentColor` has no context inside
 * an icon and resolves to black, which on a black field is nothing at all.
 */
function faviconSvg() {
	const src = load('icon.svg');
	const viewBox = src.match(/viewBox="([^"]+)"/)[1];
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	const pad = 512 * (1 - SAFE * SQUIRCLE) * 0.5;
	const box = 512 - pad * 2;

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BLACK}"/>
  <svg viewBox="${viewBox}" x="${pad.toFixed(1)}" y="${pad.toFixed(1)}" width="${box.toFixed(1)}" height="${box.toFixed(1)}" preserveAspectRatio="xMidYMid meet">${inner}</svg>
</svg>
`;
}

/**
 * Multi-size .ico. sharp cannot write ICO, but the format has accepted PNG
 * payloads since Vista, so the container is a 6-byte header plus one 16-byte
 * directory entry per size followed by the PNGs themselves.
 */
function ico(images) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);

	let offset = 6 + images.length * 16;
	const entries = [];
	for (const { size, data } of images) {
		const e = Buffer.alloc(16);
		e.writeUInt8(size >= 256 ? 0 : size, 0);
		e.writeUInt8(size >= 256 ? 0 : size, 1);
		e.writeUInt8(0, 2);
		e.writeUInt8(0, 3);
		e.writeUInt16LE(1, 4);
		e.writeUInt16LE(32, 6);
		e.writeUInt32LE(data.length, 8);
		e.writeUInt32LE(offset, 12);
		entries.push(e);
		offset += data.length;
	}
	return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

mkdirSync(OUT, { recursive: true });

// --- tab favicon: icon-heavy -------------------------------------------------
writeFileSync(join(OUT, 'favicon.svg'), faviconSvg());

const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
	icoImages.push({ size, data: await square('icon.svg', size) });
}
writeFileSync(join(OUT, 'favicon.ico'), ico(icoImages));

// --- app icons: the mark alone ----------------------------------------------
// `apple-touch-icon` must be opaque with square corners — iOS applies its own
// mask, and a pre-rounded icon gets rounded twice.
//
// icon-512 is also what Android builds the PWA splash from (background_color +
// this icon + name), so the splash loses the wordmark along with the home
// screen. That is intended, per the client 2026-08-31.
const appIcons = [
	['apple-touch-icon.png', 180],
	['icon-192.png', 192],
	['icon-512.png', 512],
	['icon-maskable-512.png', 512],
];
for (const [name, size] of appIcons) {
	writeFileSync(join(OUT, name), await sharp(await square('icon.svg', size)).flatten({ background: BLACK }).png().toBuffer());
}

// --- themed icon: the mark alone, on transparent -----------------------------
// `purpose: "monochrome"` is what Android 13+ needs for themed icons. The
// platform ignores the colour and uses the ALPHA channel as a stencil, filling
// it with the launcher's own tint — so this file is the mark on transparency,
// with no plaque. Any opaque pixel becomes ink.
//
// That is why the `any`/`maskable` icons cannot double as this one: they are a
// fully opaque black square, so their stencil is the whole square. Without this
// file Android has nothing to tint and falls back to shrinking the opaque icon
// inside the themed circle — which is exactly the small inset plaque visible on
// the Pixel 9 screenshot in reference/, where every neighbouring app fills its
// circle and this one does not.
//
// icon.svg, matching the rest of the app icons — a themed icon that differed
// from the unthemed one would be the same app wearing two marks.
//
// Sized on the same SAFE x SQUIRCLE diagonal fit as the rest of the set, which
// puts the mark at ~63% of the canvas — about 79% of the visible disc once the
// 80% mask is applied. Measured off the same screenshot, neighbouring marks fill
// 75%, so this sits right among them.
writeFileSync(
	join(OUT, 'icon-monochrome-512.png'),
	await square('icon.svg', 512, SQUIRCLE, { r: 0, g: 0, b: 0, alpha: 0 }),
);

// --- manifest ----------------------------------------------------------------
// `standalone` because the owners open this from a home screen when they meet a
// prospective tenant. Android derives its splash from background_color plus the
// 512 icon, so no splash images are generated; iOS would need ~20 device-specific
// PNGs for the same effect and is deliberately not served here.
const manifest = {
	name: 'Portage Place',
	short_name: 'Portage Place',
	description:
		'Commercial and office space for lease in a restored 1919 bakery in South Bend.',
	start_url: '/',
	display: 'standalone',
	background_color: BLACK,
	theme_color: '#322f2c',
	icons: [
		{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
		{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
		{ src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
		{ src: '/icon-monochrome-512.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' },
	],
};
writeFileSync(join(OUT, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log('\n  Wrote to public/:');
for (const f of ['favicon.svg', 'favicon.ico', ...appIcons.map(([n]) => n), 'icon-monochrome-512.png', 'site.webmanifest']) {
	console.log(`    ${f}`);
}
console.log('');
