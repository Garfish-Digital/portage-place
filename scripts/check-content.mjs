#!/usr/bin/env node
/**
 * Pre-launch content guard.
 *
 * Fails if any invented stand-in content is still present. This exists because
 * the failure mode it prevents is genuinely bad: Portage Place is a real building
 * with real tenants, and shipping a fabricated business name or a testimonial
 * attributed to a real company is not a cosmetic bug.
 *
 *   npm run check:content
 *
 * Deliberately NOT wired into `npm run build` — placeholders are supposed to
 * exist right now, and a failing build on every deploy would train everyone to
 * ignore it. Run it as part of the launch checklist instead.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT = 'src/content';
const problems = [];

/** Frontmatter/YAML scan — no parser dependency for a job this small. */
const flaggedIn = (text) =>
	text
		.split('\n')
		.map((line, index) => ({ line: line.trim(), number: index + 1 }))
		.filter(({ line }) => /^-?\s*placeholder:\s*true\s*$/.test(line));

// Markdown collections: one file per entry.
for (const dir of ['milestones', 'team', 'tenants']) {
	const path = join(CONTENT, dir);
	if (!existsSync(path)) continue;
	for (const file of readdirSync(path).filter((f) => f.endsWith('.md'))) {
		const full = join(path, file);
		const text = readFileSync(full, 'utf8');
		for (const hit of flaggedIn(text)) {
			problems.push(`${full}:${hit.number} — placeholder entry`);
		}
		if (/PLACEHOLDER/.test(text)) {
			problems.push(`${full} — contains the literal string "PLACEHOLDER"`);
		}
	}
}

// YAML collections: one file, many entries.
for (const file of ['neighborhood.yaml', 'press.yaml', 'spaces.yaml']) {
	const full = join(CONTENT, file);
	if (!existsSync(full)) continue;
	const text = readFileSync(full, 'utf8');
	// Strip comment lines so the explanatory headers don't trip the scan.
	const body = text
		.split('\n')
		.filter((line) => !line.trimStart().startsWith('#'))
		.join('\n');
	for (const hit of flaggedIn(body)) {
		problems.push(`${full} — placeholder entry (line ${hit.number} of uncommented body)`);
	}
	if (/PLACEHOLDER/.test(body)) {
		problems.push(`${full} — contains the literal string "PLACEHOLDER"`);
	}
}

// Contact details.
const navPath = 'src/config/nav.ts';
if (existsSync(navPath)) {
	const nav = readFileSync(navPath, 'utf8');
	if (nav.includes('testing@garfishdigital.com')) {
		problems.push(`${navPath} — still using the dev email alias, not the production recipient`);
	}
	if (/PLACEHOLDER/.test(nav)) {
		problems.push(`${navPath} — contains the literal string "PLACEHOLDER"`);
	}
}

if (problems.length === 0) {
	console.log('✓ No placeholder content found.');
	process.exit(0);
}

console.error(`\n✗ ${problems.length} item(s) must be resolved before launch:\n`);
for (const problem of problems) console.error(`  · ${problem}`);
console.error('');
process.exit(1);
