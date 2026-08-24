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
	// { icon: 'lucide:briefcase', label: 'Offices' },
	{ icon: 'lucide:palette', label: 'Artist studios' },
	{ icon: 'lucide:scale', label: 'Professional services' },
	// { icon: 'lucide:wrench', label: 'Light industrial' },
	{ icon: 'lucide:hammer', label: 'Maker space' },
	{ icon: 'lucide:heart-pulse', label: 'Health & wellness' },
	{ icon: 'lucide:graduation-cap', label: 'Education & non-profits' },
] as const;

/**
 * Icon per unit `type` in spaces.yaml, for the Spaces page's "kinds of space"
 * grid. Keyed by the exact `type` string — if a new type appears in the YAML
 * without an entry here it falls back to a neutral square, so the grid never
 * breaks, it just looks unfinished (which is the correct signal).
 */
export const SPACE_TYPE_ICONS: Record<string, string> = {
	Retail: 'lucide:store',
	Studio: 'lucide:palette',
	Office: 'lucide:briefcase',
	Restaurant: 'lucide:utensils',
	Warehouse: 'lucide:warehouse',
	Flex: 'lucide:blocks',
	'Resale retail': 'lucide:recycle',
};

export const SPACE_TYPE_ICON_FALLBACK = 'lucide:square';

/**
 * Stat strip. Every figure here is sourced:
 * - 200–1,800 sq ft — client-confirmed 2026-08-19, superseding their earlier
 *   rounded "2,000". It now agrees with what `getSpaceRange()` derives from
 *   spaces.yaml (largest usable figure is 1,789), so the quoted range and the
 *   floor-plan data no longer contradict each other. The old 2,000 was most
 *   likely a rentable figure — that plan reaches 2,433 RSF — and quoting
 *   rentable as though it were usable is how a first conversation goes wrong.
 * - 1919 — the datestone on the building's own parapet
 * - 20 private offices — client (9 commercial + 11 office tenants currently)
 * - $300/mo — confirmed with the client; supersedes the live site's stale $350
 * - $4.2M — WNDU, South Bend Tribune, March 2022
 */
export const STATS = [
	// { value: '1919', label: 'Built' },
	{ value: '200–1,800', unit: 'sq ft', label: 'Suite sizes' },
	// { value: '$4.2M', label: 'Renovation' },
	{ value: '$300', unit: '/mo', label: 'Starting rent' }
] as const;

/**
 * Proximity list — supplied by Rob, 2026-08-11.
 *
 * Note this is a *cultural landmarks* list, not the commuting list the old site
 * used. It answers "what kind of place is this?" rather than "how long is my
 * drive?", which suits a building whose pitch is character and community.
 *
 * The three institutions from the old copy are still here, reached through their
 * landmarks: IU South Bend via the Civil Rights Heritage Center, Saint Mary's via
 * Le Mans Hall, Notre Dame via the Golden Dome.
 *
 * Times are approximate drive times and are rendered as such — never as absolute
 * claims. `minutes` stays a string so ranges ("2–3") survive.
 */
export const PROXIMITY = [
	{
		name: 'Morris Performing Arts Center',
		category: 'Arts & culture',
		minutes: '3',
	},
	// {
	// 	name: 'The History Museum & Oliver Mansion',
	// 	landmark: 'Copshaholm',
	// 	category: 'Architecture & local history',
	// 	minutes: '2–3',
	// },
	// {
	// 	name: 'Civil Rights Heritage Center',
	// 	landmark: 'IU South Bend',
	// 	category: 'African American history',
	// 	minutes: '3–4',
	// },
	{
		name: 'Studebaker National Museum',
		category: 'Industrial & automotive history',
		minutes: '4',
	},
	{
		name: "Saint Mary's College",
		landmark: 'Le Mans Hall',
		category: 'Catholic higher education',
		minutes: '5',
	},
	{
		name: 'University of Notre Dame',
		landmark: 'Golden Dome',
		category: 'Religion & collegiate history',
		minutes: '7',
	},
] as const;

/** Neighborhood context, from the current site's copy. */
export const ACCESS = [
	'Pedestrian and bike friendly',
	'On a public transit route',
	'Easy access to the toll road',
] as const;
