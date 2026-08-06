/**
 * Site navigation — single source of truth for the header, the footer, and any
 * future sitemap. Adding a page means editing this file and nothing else.
 *
 * `shortLabel` is what the header uses when the full phrase would crowd the bar.
 * "Find Your Space" is deliberately NOT called "Availability": that's the CRE
 * convention, but it promises live vacancy data we've decided not to maintain,
 * and a visitor who clicks it and finds static floor plans feels misled.
 */
export interface NavItem {
	label: string;
	shortLabel?: string;
	href: string;
	description?: string;
}

export const NAV_ITEMS: NavItem[] = [
	{
		label: 'Home',
		href: '/',
	},
	{
		label: 'Find Your Space',
		shortLabel: 'Spaces',
		href: '/spaces',
		description: 'Floor plans, sizes, and what fits here.',
	},
	{
		label: 'History',
		href: '/history',
		description: 'Ward Baking Company, 1920 to now.',
	},
	{
		label: 'Community',
		href: '/community',
		description: 'Tenants, owners, neighbourhood, partners.',
	},
	{
		label: 'Contact',
		href: '/contact',
		description: 'Address, hours, and how to reach us.',
	},
];

/**
 * The single conversion action. One address, one low-friction ask.
 *
 * ⚠️ EVERY VALUE BELOW IS A PLACEHOLDER — do not ship without confirming.
 * The real recipient address is the one already live on portageplacesb.com and
 * has to be carried over deliberately (see the DNS/MX cutover checklist in
 * BUILD_PLAN.md — breaking that mailbox is the highest-risk item in the build).
 * The street address needs to come from the client, not from a search result.
 */
export const CONTACT = {
	email: 'PLACEHOLDER@portageplacesb.com',
	address: {
		street: 'PLACEHOLDER — confirm with client',
		city: 'South Bend',
		region: 'IN',
		postalCode: 'PLACEHOLDER',
	},
} as const;
