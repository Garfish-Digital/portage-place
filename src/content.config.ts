import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * Content collections — Portage Place
 *
 * Prose-bearing collections (milestones, team, tenants) are one Markdown file
 * per entry: they have a body, and one-file-per-entry keeps diffs legible when
 * Rob edits a single bio a year from now. List-shaped collections with no body
 * (press, neighborhood, spaces) are single YAML files — splitting a seven-item
 * press list across seven files is filing, not authoring.
 *
 * ---------------------------------------------------------------------------
 * TWO SCHEMA FIELDS THAT ARE NOT DECORATION
 * ---------------------------------------------------------------------------
 *
 * `confidence` (milestones) — the supplied research explicitly separates
 * documented facts from contested claims, and the two research documents
 * disagree with each other on several dates. Rather than silently picking a
 * winner, every milestone carries its evidentiary status. The timeline can then
 * render "c." prefixes and hedged language automatically, and we can never
 * accidentally publish a contested date as settled. Given the audience includes
 * city officials and a neighborhood that knows this building, that matters.
 *
 * `placeholder` (tenants, neighborhood) — invented stand-in content. These are
 * real businesses in a real building; shipping a fabricated tenant name would be
 * a genuine problem, not a cosmetic one. Anything flagged renders with a visible
 * badge, and `npm run check:content` fails if any survive to launch.
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** Where a space sits in the building. The floor plan splits here. */
const wing = z.enum(['commercial', 'office', 'shared']);

const link = z.object({
	label: z.string(),
	url: z.string().url(),
});

// ---------------------------------------------------------------------------
// milestones — the History timeline
// ---------------------------------------------------------------------------
const milestones = defineCollection({
	loader: glob({ base: './src/content/milestones', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			/** Display string. Free-form so ranges and "c." prefixes survive: "c. 1940s", "1919", "2022–2025". */
			year: z.string(),
			/** Sort key only — never rendered. Use the earliest year the entry covers. */
			sortYear: z.number().int(),
			title: z.string(),
			/** One-line summary for collapsed/preview states. */
			summary: z.string(),

			/**
			 * How well-supported this entry is.
			 * - `documented` — multiple sources agree, or a dated primary source exists.
			 * - `contested`  — sources disagree on the date or detail. Render hedged.
			 * - `inferred`   — reasonable reading of the evidence, not directly stated.
			 */
			confidence: z.enum(['documented', 'contested', 'inferred']),
			/** Shown to the reader when confidence !== documented. Keep it short and honest. */
			confidenceNote: z.string().optional(),

			image: image().optional(),
			imageAlt: z.string().optional(),
			/** Credit line for archival images — required if the image isn't ours. */
			imageCredit: z.string().optional(),

			/** Where this came from. Internal; not necessarily rendered. */
			sources: z.array(z.string()).default([]),

			/** Pull this one out as a visual anchor in the timeline. */
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
		}),
});

// ---------------------------------------------------------------------------
// team — the owners
// ---------------------------------------------------------------------------
const team = defineCollection({
	loader: glob({ base: './src/content/team', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			/** Short role for the card. Full title goes in `titles`. */
			role: z.string(),
			org: z.string().optional(),
			/** Credentials and long-form titles, rendered small. */
			titles: z.array(z.string()).default([]),
			portrait: image().optional(),
			portraitAlt: z.string().optional(),
			order: z.number().int(),
			links: z.array(link).default([]),
			/**
			 * `mentor` renders small at the foot of the Owners section rather than
			 * as a full card — Monte Anderson / Taylor Station are the model and the
			 * mentor, not the management.
			 */
			kind: z.enum(['owner', 'mentor']).default('owner'),
			draft: z.boolean().default(false),
		}),
});

// ---------------------------------------------------------------------------
// tenants — Community page
// ---------------------------------------------------------------------------
const tenants = defineCollection({
	loader: glob({ base: './src/content/tenants', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			category: wing,
			/** Plain-language descriptor: "Coffee shop", "Real estate", "Massage therapy". */
			type: z.string(),
			logo: image().optional(),
			portrait: image().optional(),
			imageAlt: z.string().optional(),
			url: z.string().url().optional(),

			/** Testimonial. Body copy is the longer bio, if there is one. */
			quote: z.string().optional(),
			quoteAttribution: z.string().optional(),

			/** Surfaced prominently. ~12 of 20 get surfaced at all. */
			featured: z.boolean().default(false),
			order: z.number().int().default(999),

			/** 🚩 Invented stand-in. Must be false for every entry before launch. */
			placeholder: z.boolean().default(false),
			draft: z.boolean().default(false),
		}),
});

// ---------------------------------------------------------------------------
// neighborhood — nearby businesses and goodwill relationships
// ---------------------------------------------------------------------------
const neighborhood = defineCollection({
	loader: file('./src/content/neighborhood.yaml'),
	schema: z.object({
		id: z.string(),
		name: z.string(),
		blurb: z.string(),
		url: z.string().url().optional(),
		address: z.string().optional(),
		/** Path under /public — these are third-party marks, not our optimized assets. */
		logo: z.string().optional(),
		relationship: z.enum(['neighbor', 'partner']).default('neighbor'),
		order: z.number().int().default(999),
		placeholder: z.boolean().default(false),
	}),
});

// ---------------------------------------------------------------------------
// press — "In the News", foot of the History page
// ---------------------------------------------------------------------------
const press = defineCollection({
	loader: file('./src/content/press.yaml'),
	schema: z.object({
		id: z.string(),
		outlet: z.string(),
		headline: z.string(),
		url: z.string().url(),
		/** ISO date. Coerced so `2022-03-08` in YAML parses cleanly. */
		date: z.coerce.date().optional(),
		/** Short editorial framing — better than a bare link list. */
		blurb: z.string().optional(),
		pullQuote: z.string().optional(),
		/** Path under /public. Never the outlet's masthead — see BUILD_PLAN. */
		image: z.string().optional(),
		imageAlt: z.string().optional(),
		featured: z.boolean().default(false),
		/**
		 * Link-rot guard. Set to the date the URL was last confirmed to resolve.
		 * Local outlets restructure URLs and paywall archives; a dead credibility
		 * link is worse than no link.
		 */
		verifiedOn: z.coerce.date().optional(),
	}),
});

// ---------------------------------------------------------------------------
// spaces — Find Your Space / floor plan
// ---------------------------------------------------------------------------
const spaces = defineCollection({
	loader: file('./src/content/spaces.yaml'),
	schema: z.object({
		/**
		 * Must match the `id` on the corresponding <path> in the floor-plan SVG.
		 * This is the join between the graphic and the data — if they drift, the
		 * interactive plan silently stops highlighting.
		 */
		id: z.string(),
		label: z.string(),
		wing,
		floor: z.enum(['basement', 'ground', 'second']).default('ground'),
		sqftMin: z.number().int().positive(),
		sqftMax: z.number().int().positive(),
		/** "Suite", "Studio", "Retail bay", "Private office". */
		type: z.string(),
		notes: z.string().optional(),
		/**
		 * Deliberately NOT an availability flag. The client does not want
		 * up-to-the-day vacancy maintenance, and stale vacancy data is worse than
		 * none. See BUILD_PLAN — this is a locked decision, not an oversight.
		 */
		placeholder: z.boolean().default(false),
	}),
});

export const collections = { milestones, team, tenants, neighborhood, press, spaces };
