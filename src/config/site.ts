/**
 * Structural page content that isn't a content collection — small, fixed lists
 * that belong to the design rather than to an editable dataset.
 */

/**
 * Use-type grid. This replaces the homepage's anaphoric "A place for…" wall of
 * text: same information, scannable in three seconds, answering the only
 * question a prospective tenant actually has — *do I belong here?*
 */
export const USE_TYPES = [
	{ icon: 'lucide:store', label: 'Retail & business' },
	{ icon: 'lucide:briefcase', label: 'Offices' },
	{ icon: 'lucide:palette', label: 'Artist studios' },
	{ icon: 'lucide:scale', label: 'Professional services' },
	{ icon: 'lucide:wrench', label: 'Light industrial' },
	{ icon: 'lucide:hammer', label: 'Maker space' },
	{ icon: 'lucide:heart-pulse', label: 'Health & wellness' },
	{ icon: 'lucide:graduation-cap', label: 'Education & non-profits' },
] as const;

/**
 * Stat strip. Every figure here is sourced:
 * - 200–2,000 sq ft — client, and derived from the spaces collection
 * - 1919 — the datestone on the building's own parapet
 * - 20 private offices — client (9 commercial + 11 office tenants currently)
 * - $300/mo — confirmed with the client; supersedes the live site's stale $350
 * - $4.2M — WNDU, South Bend Tribune, March 2022
 */
export const STATS = [
	{ value: '200–2,000', unit: 'sq ft', label: 'Space sizes' },
	{ value: '1919', label: 'Built' },
	{ value: '20', label: 'Private offices' },
	{ value: '$300', unit: '/mo', label: 'Starting rent' },
	{ value: '$4.2M', label: 'Renovation' },
] as const;

/**
 * Proximity list.
 *
 * ⚠️ NO DISTANCES OR DRIVE TIMES. The current site says only "just minutes from",
 * and inventing "4 minutes" or "1.8 miles" would be fabrication. Add them once
 * measured — they make the module considerably more persuasive, so this is worth
 * doing properly rather than dropping.
 */
export const PROXIMITY = [
	{ name: 'Downtown South Bend' },
	{ name: 'University of Notre Dame' },
	{ name: "Saint Mary's College" },
	{ name: 'Indiana University South Bend' },
	{ name: 'Michiana International Airport' },
] as const;

/** Neighbourhood context, from the current site's copy. */
export const ACCESS = [
	'Pedestrian and bike friendly',
	'On a public transport route',
	'Easy access to the toll road',
] as const;
