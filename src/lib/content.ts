import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Query helpers.
 *
 * Pages should use these rather than calling getCollection directly, so drafts
 * are filtered and sort order is defined in one place. Sorting inline in a page
 * template is how two pages end up disagreeing about the order of the same list.
 */

const notDraft = <T extends { data: { draft?: boolean } }>(entry: T) => !entry.data.draft;

/** Timeline order, oldest first. */
export async function getMilestones(): Promise<CollectionEntry<'milestones'>[]> {
	const entries = await getCollection('milestones', notDraft);
	return entries.sort((a, b) => a.data.sortYear - b.data.sortYear);
}

/** Owners in explicit order; mentors excluded — they render separately and small. */
export async function getOwners(): Promise<CollectionEntry<'team'>[]> {
	const entries = await getCollection('team', (e) => notDraft(e) && e.data.kind === 'owner');
	return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getMentors(): Promise<CollectionEntry<'team'>[]> {
	const entries = await getCollection('team', (e) => notDraft(e) && e.data.kind === 'mentor');
	return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getTenants(options?: {
	category?: 'commercial' | 'office' | 'shared';
	featuredOnly?: boolean;
}): Promise<CollectionEntry<'tenants'>[]> {
	const entries = await getCollection('tenants', (entry) => {
		if (!notDraft(entry)) return false;
		if (options?.category && entry.data.category !== options.category) return false;
		if (options?.featuredOnly && !entry.data.featured) return false;
		return true;
	});
	return entries.sort((a, b) => a.data.order - b.data.order);
}

/** Only tenants who have actually given us a testimonial. */
export async function getTenantQuotes(): Promise<CollectionEntry<'tenants'>[]> {
	const entries = await getTenants();
	return entries.filter((entry) => Boolean(entry.data.quote));
}

export async function getNeighborhood(relationship?: 'neighbor' | 'partner') {
	const entries = await getCollection('neighborhood', (entry) =>
		relationship ? entry.data.relationship === relationship : true,
	);
	return entries.sort((a, b) => a.data.order - b.data.order);
}

/** Newest first — undated entries sort last rather than to 1970. */
export async function getPress() {
	const entries = await getCollection('press');
	return entries.sort((a, b) => {
		const aTime = a.data.date?.getTime();
		const bTime = b.data.date?.getTime();
		if (aTime === undefined && bTime === undefined) return 0;
		if (aTime === undefined) return 1;
		if (bTime === undefined) return -1;
		return bTime - aTime;
	});
}

export async function getSpaces(wing?: 'commercial' | 'office' | 'shared') {
	const entries = await getCollection('spaces', (entry) =>
		wing ? entry.data.wing === wing : true,
	);
	return entries.sort((a, b) => a.data.sqftMin - b.data.sqftMin);
}

/**
 * The overall size range quoted in marketing copy, derived from the data rather
 * than typed into a template. Keeps "200–1,800 sq ft" from going stale silently
 * when the real floor plans land.
 *
 * `min` is the smallest usable figure and `max` the largest usable figure — NOT
 * the largest rentable one. Mixing the two would quote a range no single unit
 * actually spans.
 */
export async function getSpaceRange(): Promise<{ min: number; max: number }> {
	const spaces = await getSpaces();
	const leasable = spaces.filter((entry) => entry.data.wing !== 'shared');
	return {
		min: Math.min(...leasable.map((entry) => entry.data.sqftMin)),
		max: Math.max(...leasable.map((entry) => entry.data.sqftMin)),
	};
}

/** Distinct unit types, in descending order of how many units carry each. */
export async function getSpaceTypes(): Promise<{ type: string; count: number }[]> {
	const spaces = await getSpaces();
	const counts = new Map<string, number>();
	for (const entry of spaces) {
		counts.set(entry.data.type, (counts.get(entry.data.type) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([type, count]) => ({ type, count }))
		.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}

export interface SpaceTypeSummary {
	type: string;
	count: number;
	/** Smallest and largest USABLE figure among units of this type. */
	usable: { min: number; max: number };
	/** Smallest and largest RENTABLE figure among units of this type. */
	rentable: { min: number; max: number };
}

/**
 * One row per unit type for "Sizes at a glance", replacing a 33-row unit-by-unit
 * table that was the densest thing on the site.
 *
 * The two ranges are kept separate on purpose. `sqftMin`/`sqftMax` are not the
 * ends of a size range — they are usable and rentable area for the SAME unit, so
 * spanning min(sqftMin) to max(sqftMax) would advertise a spread no unit has,
 * built from two different measures. Same trap `getSpaceRange` guards against.
 */
export async function getSpaceTypeSummary(): Promise<SpaceTypeSummary[]> {
	const spaces = await getSpaces();
	const groups = new Map<string, { sqftMin: number; sqftMax: number }[]>();
	for (const entry of spaces) {
		const bucket = groups.get(entry.data.type) ?? [];
		bucket.push({ sqftMin: entry.data.sqftMin, sqftMax: entry.data.sqftMax });
		groups.set(entry.data.type, bucket);
	}

	return [...groups.entries()]
		.map(([type, units]) => ({
			type,
			count: units.length,
			usable: {
				min: Math.min(...units.map((u) => u.sqftMin)),
				max: Math.max(...units.map((u) => u.sqftMin)),
			},
			rentable: {
				min: Math.min(...units.map((u) => u.sqftMax)),
				max: Math.max(...units.map((u) => u.sqftMax)),
			},
		}))
		.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}
