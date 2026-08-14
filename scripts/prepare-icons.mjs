#!/usr/bin/env node
/**
 * Prepare commissioned pencil illustrations for use as card marks.
 *
 *   node scripts/prepare-icons.mjs reference/tenant-icons src/assets/tenant-icons
 *
 * The generated sketches arrive on a flat warm-tan field (~#DBCCBB) at roughly
 * 1250px square. Two things have to happen before they can sit on a card:
 *
 * 1. LEVEL THE FIELD TO WHITE. The cards use `mix-blend-mode: multiply`, which
 *    is what lets the owner portraits sit on plaster with no visible plate edge
 *    — white multiplies away to nothing. A tan field does not: it multiplies
 *    into the card and leaves a dark square. Dividing each channel by its own
 *    background value maps the field to pure white and neutralises the sepia
 *    cast out of the graphite at the same time, so the warmth comes back from
 *    the surface underneath instead of being baked in.
 *
 * 2. NORMALISE THE INK BOX. Each drawing frames its subject differently — as
 *    delivered the ink spanned 73%–91% of the frame, so at a fixed 88px slot the
 *    rubber duck read as much smaller than the coffee cup even though the files
 *    were identical sizes. Cropping to the ink and rescaling so the longest side
 *    is a constant fraction of the frame is what makes them read as one set.
 *    Aspect ratio is preserved: a tall robot stays tall, it just stops being
 *    small.
 *
 * Originals stay in reference/ (gitignored) — this is lossy and not reversible,
 * so re-run it from the originals rather than over its own output.
 */
import sharp from 'sharp';
import { readdirSync, renameSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** Longest ink dimension as a fraction of the square frame. */
const TARGET = 0.84;
/** Output edge. Well above any rendered size; Astro resizes from here. */
const SIZE = 512;
/** Grey below which a pixel counts as ink rather than paper. */
const INK = 235;

const [src, dst] = process.argv.slice(2);
if (!src || !dst) {
	console.error('usage: node scripts/prepare-icons.mjs <source-dir> <output-dir>');
	process.exit(1);
}
if (!existsSync(dst)) mkdirSync(dst, { recursive: true });

const median = (values) => {
	values.sort((a, b) => a - b);
	return values[values.length >> 1];
};

for (const file of readdirSync(src).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
	const from = join(src, file);
	const to = join(dst, file.replace(/\.(jpe?g|webp)$/i, '.png'));

	// --- 1. field to white ------------------------------------------------
	// Median of a border ring rather than a single corner pixel, so one stray
	// dark pixel at an edge can't drag the whole white point.
	const { data, info } = await sharp(from).raw().toBuffer({ resolveWithObject: true });
	const ring = [[], [], []];
	for (let x = 0; x < info.width; x += 7) {
		for (const y of [2, 3, info.height - 3, info.height - 4]) {
			const i = (y * info.width + x) * info.channels;
			ring[0].push(data[i]);
			ring[1].push(data[i + 1]);
			ring[2].push(data[i + 2]);
		}
	}
	const background = ring.map(median);
	const levelled = await sharp(from)
		.linear(
			background.map((v) => 255 / v),
			[0, 0, 0],
		)
		.png()
		.toBuffer();

	// --- 2. normalise the ink box -----------------------------------------
	const grey = await sharp(levelled).greyscale().raw().toBuffer({ resolveWithObject: true });
	const { width: w, height: h } = grey.info;
	let left = w;
	let top = h;
	let right = 0;
	let bottom = 0;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (grey.data[y * w + x] >= INK) continue;
			if (x < left) left = x;
			if (x > right) right = x;
			if (y < top) top = y;
			if (y > bottom) bottom = y;
		}
	}
	const boxW = right - left + 1;
	const boxH = bottom - top + 1;
	if (boxW <= 0 || boxH <= 0) {
		console.error(`  ! ${file} — no ink found, skipped`);
		continue;
	}

	const scale = (SIZE * TARGET) / Math.max(boxW, boxH);
	const outW = Math.round(boxW * scale);
	const outH = Math.round(boxH * scale);
	const subject = await sharp(levelled)
		.extract({ left, top, width: boxW, height: boxH })
		.resize(outW, outH, { fit: 'fill' })
		.png()
		.toBuffer();

	await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: '#ffffff' } })
		.composite([
			{ input: subject, left: Math.round((SIZE - outW) / 2), top: Math.round((SIZE - outH) / 2) },
		])
		.png({ compressionLevel: 9 })
		.toFile(`${to}.tmp`);
	renameSync(`${to}.tmp`, to);

	const kb = (statSync(to).size / 1024).toFixed(0);
	console.log(
		`  ✓ ${file.padEnd(26)} field ${background.join(',')} → white · ink ${boxW}×${boxH} → ${outW}×${outH} · ${kb}KB`,
	);
}
