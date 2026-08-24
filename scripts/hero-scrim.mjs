#!/usr/bin/env node
/**
 * How much scrim does a hero photograph actually need?
 *
 *   node scripts/hero-scrim.mjs                     # every hero in src/assets/heroes
 *   node scripts/hero-scrim.mjs path/to/photo.jpg   # one file
 *
 * WHY THIS EXISTS
 *
 * The veil over the hero text was a single global value, set by whichever
 * photograph happened to need the most. That makes every page as dark as the
 * worst one — and when the client says "too dark", there is no way to answer
 * except by guessing.
 *
 * This turns the question into a measurement. It samples the bottom 40% of the
 * frame (where the veil sits), takes the brightest 5% of that region as the
 * worst case a letterform might land on, and solves for the espresso opacity at
 * which each piece of hero text reaches its WCAG 1.4.3 threshold.
 *
 * Text is not one requirement. Per SC 1.4.3:
 *
 *   · the title is LARGE text (≥24px) and needs only 3:1
 *   · the lede (20–23px regular) and eyebrow (14–15px semibold) are small text
 *     and need 4.5:1
 *
 * So the binding number is almost always the small text, and the headline —
 * the biggest mass, sitting in the darkest part of the frame — is nowhere near
 * the limit. Worth knowing before anyone reaches for the opacity slider.
 *
 * RE-RUN THIS WHENEVER A HERO IS REPLACED. The professional photography will
 * change every number here, almost certainly downward: these placeholders are
 * phone shots, and the brightest of them is what currently forces the darkest
 * scrim on the site.
 */
import sharp from 'sharp';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HEROES = 'src/assets/heroes';

/** The surface the veil is made of. */
const ESPRESSO = [0x32, 0x2f, 0x2c];
/** Hero text colours: the title is white, everything else is plaster. */
const WHITE = [255, 255, 255];
const PLASTER = [0xf7, 0xf5, 0xf1];

/** Fraction of the frame, measured from the bottom, that the veil covers. */
const TEXT_ZONE = 0.4;
/**
 * Percentile of luminance treated as the worst case. Not the single brightest
 * pixel — one blown speculuar highlight shouldn't drag the whole page darker —
 * but high enough that a letterform can't sit on something brighter.
 */
const PERCENTILE = 0.95;
/** Headroom added to the measured figure, in points. */
const MARGIN = 6;

const srgb = (c) => {
	const v = c / 255;
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);

const contrast = (a, b) => {
	const [x, y] = [luminance(a), luminance(b)];
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** The pixel as it renders once `alpha` of espresso is laid over it. */
const composite = (px, alpha) => px.map((v, i) => alpha * ESPRESSO[i] + (1 - alpha) * v);

/** Lowest espresso opacity at which `text` clears `target` over `px`. */
function required(px, text, target) {
	for (let a = 0; a <= 1.0001; a += 0.005) {
		if (contrast(text, composite(px, a)) >= target) return a;
	}
	return 1;
}

async function measure(file) {
	// Downsampled: we want the tonal character of the region, not pixel detail,
	// and full-size heroes make this slow for no gain.
	const { data, info } = await sharp(file)
		.resize(400)
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const startRow = Math.floor(info.height * (1 - TEXT_ZONE));
	const pixels = [];
	for (let y = startRow; y < info.height; y++) {
		for (let x = 0; x < info.width; x++) {
			const i = (y * info.width + x) * info.channels;
			pixels.push([data[i], data[i + 1], data[i + 2]]);
		}
	}

	pixels.sort((a, b) => luminance(a) - luminance(b));
	const worst = pixels[Math.floor(pixels.length * PERCENTILE)];

	return {
		title: required(worst, WHITE, 3),
		small: required(worst, PLASTER, 4.5),
	};
}

const pct = (n) => `${Math.round(n * 100)}%`;

const args = process.argv.slice(2);
const files = args.length
	? args
	: existsSync(HEROES)
		? readdirSync(HEROES)
				.filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
				.sort()
				.map((f) => join(HEROES, f))
		: [];

if (!files.length) {
	console.error(`No images found. Looked in ${HEROES}/`);
	process.exit(1);
}

console.log('\n  Scrim required for hero text to meet WCAG 1.4.3');
console.log(`  (worst ${pct(PERCENTILE)} of the bottom ${pct(TEXT_ZONE)} of each frame)\n`);
console.log(`  ${'hero'.padEnd(26)}${'title 3:1'.padStart(10)}${'small 4.5:1'.padStart(13)}${`set veil to`.padStart(14)}`);

let binding = 0;
for (const file of files) {
	const { title, small } = await measure(file);
	binding = Math.max(binding, small);
	const set = Math.min(1, small + MARGIN / 100);
	console.log(
		`  ${file.replace(`${HEROES}/`, '').padEnd(26)}${pct(title).padStart(10)}${pct(small).padStart(13)}${pct(set).padStart(14)}`,
	);
}

console.log(
	`\n  Binding constraint across this set: ${pct(binding)} (small text at 4.5:1).`,
);
console.log(
	`  A single global value has to sit at ${pct(Math.min(1, binding + MARGIN / 100))} — which is why\n  per-page values are worth the small amount of extra wiring.\n`,
);
