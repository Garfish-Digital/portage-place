/**
 * Site navigation — single source of truth for the header, the footer, and any
 * future sitemap. Adding a page means editing this file and nothing else.
 *
 * `shortLabel` is what the header uses when the full phrase would crowd the bar.
 * No item needs it today — the leasing page's label is already short — but it
 * stays on the interface because the next long page name will want it.
 *
 * The leasing link is deliberately NOT called "Availability": that's the CRE
 * convention, but it promises live vacancy data we've decided not to maintain,
 * and a visitor who clicks it and finds static floor plans feels misled. That
 * reasoning is unaffected by what the link is called instead.
 *
 * ⚠️ "Suites" is the CLIENT'S wording, requested 2026-08-19, replacing our
 * "Find Your Space" / "Spaces" pair. It is deliberately one label rather than a
 * long-and-short pair: the header used to read "Spaces" while the footer and the
 * mobile panel read "Find Your Space", so the same destination had two names
 * depending on where you found it. One word everywhere fixes that.
 */
export interface NavItem {
	label: string;
	shortLabel?: string;
	href: string;
	description?: string;
}

/**
 * Whether a nav item points at the page currently being rendered.
 *
 * Lives here rather than in a component because BOTH navs need it and they must
 * agree — the header had this inline and the footer simply went without, which
 * is why the footer never marked the current page at all. One implementation is
 * the only way two navs stay in step.
 *
 * Home is an exact match; everything else matches by prefix so a future
 * `/spaces/unit-04` still lights up its parent. Trailing slashes are stripped
 * first, since Astro's `pathname` carries one and `href` doesn't.
 */
export function isCurrentPath(pathname: string, href: string): boolean {
	const current = pathname.replace(/\/+$/, '') || '/';
	return href === '/' ? current === '/' : current.startsWith(href);
}

export const NAV_ITEMS: NavItem[] = [
	{
		label: 'Home',
		href: '/',
	},
	// ⚠️ REMOVED FROM THE SITE 2026-08-30, per the client: the floor plan and Phase
	// 2 moved to the homepage and the Suites page came out. The page itself is
	// parked at `src/pages/_spaces.astro` — Astro ignores `_`-prefixed files in
	// `pages/`, so it emits no route while staying intact and diffable.
	//
	// To reverse: `git mv src/pages/_spaces.astro src/pages/spaces.astro` and
	// uncomment this entry.
	// {
	// 	label: 'Suites',
	// 	href: '/spaces',
	// 	description: 'Floor plans, sizes, and what fits here.',
	// },
	// This item before History, per the client 2026-08-24. Array order IS render
	// order for the desktop bar, the mobile panel and the footer — all three map
	// over NAV_ITEMS — so this one edit moves every instance. Nothing else in the
	// codebase depends on the sequence.
	//
	// ⚠️ Renamed from "Community" / `/community` on 2026-08-30. The route moved
	// with the label because the site was still on the Netlify subdomain with no
	// inbound links — free then, a permanent 301 afterwards. Note this is the ONE
	// page whose label under-describes its contents: it runs tenants → owners →
	// neighborhood → partners, and the first section is `#tenants`. Don't "fix"
	// that by narrowing the page to tenants; the order is locked in BUILD_PLAN.
	{
		label: 'Tenants',
		href: '/tenants',
		description: 'Tenants, owners, neighborhood, partners.',
	},
	{
		label: 'History',
		href: '/history',
		description: 'Ward Baking Company, 1920 to now.',
	},
	{
		label: 'Contact',
		href: '/contact',
		description: 'Address, hours, and how to reach us.',
	},
];

/**
 * How to reach the building. Address, email, phone — all client-supplied.
 *
 * ⚠️ CHANGED 2026-08-30. `email` was a dev alias on garfishdigital.com, and the
 * note here recorded `tyler@regensb.com` as the production recipient of the
 * Netlify contact form. Both are superseded: the client removed the email
 * capture entirely and gave `mfkeen@gmail.com` as the address to publish. There
 * is no form on the site now, so this is not a form recipient — it is what
 * renders, as a `mailto:`, in the footer and on Contact.
 *
 * 🚩 Two things worth raising before launch rather than after:
 *   · `tyler@regensb.com` has not been retired by anyone, it was simply not
 *     mentioned. If both addresses are meant to receive enquiries, this file
 *     currently publishes only one of them.
 *   · `mfkeen@gmail.com` is a personal Gmail account, not an address on
 *     portageplacesb.com. That is entirely the client's call, but it does mean
 *     the MX work described in the BUILD_PLAN cutover checklist no longer has
 *     anything on this site depending on it.
 *
 * `phoneHref` is the E.164 form `tel:` needs; `phone` is what a human reads.
 * Keeping both means the displayed number can be reformatted without breaking
 * the link, and satisfies SC 2.5.3 (the visible text stays inside the link).
 */
export const CONTACT = {
	/** Client-supplied 2026-08-30, replacing the dev alias. */
	email: 'mfkeen@gmail.com',
	phone: '574-514-2096',
	phoneHref: '+15745142096',
	address: {
		street: '908 Portage Avenue',
		city: 'South Bend',
		region: 'IN',
		postalCode: '46616',
	},
} as const;

/**
 * Social profiles. An array rather than a single constant so adding a second
 * platform later is a data change and not a template change.
 *
 * The handle renders visibly — name recall is the client's stated #1 goal, and
 * "@portage_place_sb" on the page does more for it than a bare glyph. `platform`
 * is then announced but not shown, so the accessible name reads "Instagram,
 * @portage_place_sb" while the visible label stays just the handle. Note the
 * accessible name has to *contain* the visible text verbatim (SC 2.5.3 Label in
 * Name) or speech-input users can't activate what they can see — which is why
 * the platform is a prefix rather than a rewrite.
 *
 * ⚠️ `lucide:instagram` is one of Lucide's legacy brand glyphs, inherited from
 * Feather and now marked `hidden` upstream — Lucide is steering brand marks to
 * simple-icons. It resolves today and it matches the stroke weight of every
 * other icon on the site, which a filled simple-icons mark would not. If a
 * future Lucide bump removes it, `astro-icon` fails the build loudly rather than
 * rendering nothing, so this degrades safely. The fallback is
 * `@iconify-json/simple-icons` and a `simple-icons:instagram` swap here.
 */
export const SOCIAL = [
	{
		platform: 'Instagram',
		handle: 'portage_place_sb',
		href: 'https://www.instagram.com/portage_place_sb/',
		icon: 'lucide:instagram',
	},
] as const;

/**
 * Google Maps embed for the Contact page's click-to-load map.
 *
 * ⚠️ REPLACE WITH THE SHARE→EMBED URL.
 * In Google Maps: find the building → Share → "Embed a map" → copy the iframe
 * `src`. That gives `https://www.google.com/maps/embed?pb=…`, which is the
 * official, free, no-API-key form. Its `pb=` parameter is an opaque blob
 * encoding the map view and cannot be constructed from an address, which is why
 * it has to be pasted rather than generated.
 *
 * The value below is the constructible `output=embed` form. It works and is
 * widely used, but it is undocumented, so it is a stopgap — not what should ship.
 *
 * Either way the embed is only ever loaded on an explicit click. Google Maps sets
 * third-party cookies and pulls a large payload the moment it loads, and doing
 * that to every visitor who happens to open Contact is exactly what the facade
 * pattern exists to avoid.
 */
export const MAP_EMBED_URL =
	'https://maps.google.com/maps?q=908+Portage+Avenue,+South+Bend,+IN+46616&z=15&output=embed';
