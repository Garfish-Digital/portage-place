#!/usr/bin/env node
/**
 * Generate the favicon / app-icon set from the master SVGs.
 *
 *   node scripts/make-icons.mjs
 *
 * Everything lands in public/ and is committed. Re-run after any change to
 * src/assets/logo/*.svg.
 *
 * ── Why two different marks ─────────────────────────────────────────────────
 *
 * TAB FAVICON uses icon-heavy. Its stroke is 8.19% of the mark's width against
 * icon.svg's 4.27%, which at a 16px canvas is 1.31px versus 0.68px — and a
 * 0.68px stroke cannot render, it just antialiases to grey. The lockup is worse
 * still at this size: its rules are `stroke-width: 3` in a 555 viewBox, 0.54%,
 * which is 0.09px at 16px.
 *
 * APP ICONS use the full lockup. Measured off a Pixel 9 screenshot, the icon
 * renders at ~157 DEVICE px — not the ~60 CSS px it is easy to reason in, which
 * is the mistake that nearly got the lockup ruled out. At that true size the
 * wordmark lands at ~114px, wider than the Capital One Shopping wordmark
 * sitting next to it on the same home screen, and "PLACE" stays legible.
 *
 * ── The squircle fit ────────────────────────────────────────────────────────
 *
 * Android's documented maskable safe zone is a circle of 80% diameter. Fitting
 * the lockup's DIAGONAL to that circle gives 65% ink width. We go 12% beyond it
 * (72%) deliberately: launchers crop to a squircle rather than a true circle,
 * and the lockup's ink is wide and horizontally centred, so its bounding-box
 * corners — the only thing the conservative figure protects — carry no ink.
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
async function square(file, size, fit = SQUIRCLE) {
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

	return sharp({ create: { width: size, height: size, channels: 4, background: BLACK } })
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
	const src = load('icon-heavy.svg');
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
	icoImages.push({ size, data: await square('icon-heavy.svg', size) });
}
writeFileSync(join(OUT, 'favicon.ico'), ico(icoImages));

// --- app icons: the full lockup ---------------------------------------------
// `apple-touch-icon` must be opaque with square corners — iOS applies its own
// mask, and a pre-rounded icon gets rounded twice.
const appIcons = [
	['apple-touch-icon.png', 180],
	['icon-192.png', 192],
	['icon-512.png', 512],
	['icon-maskable-512.png', 512],
];
for (const [name, size] of appIcons) {
	writeFileSync(join(OUT, name), await sharp(await square('lockup.svg', size)).flatten({ background: BLACK }).png().toBuffer());
}

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
	],
};
writeFileSync(join(OUT, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log('\n  Wrote to public/:');
for (const f of ['favicon.svg', 'favicon.ico', ...appIcons.map(([n]) => n), 'site.webmanifest']) {
	console.log(`    ${f}`);
}
console.log('');
