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
 * Address: confirmed by the client.
 *
 * 🚨 `email` IS A DEV ALIAS, NOT THE PRODUCTION RECIPIENT.
 * Production is `tyler@regensb.com`. Swap it at launch — and note the recipient
 * is on **regensb.com**, a different domain from portageplacesb.com. That may
 * mean the DNS cutover carries far less email risk than BUILD_PLAN.md currently
 * assumes, but it has to be confirmed rather than inferred: there may still be a
 * separate mailbox on portageplacesb.com. See the cutover checklist.
 *
 * The Netlify Forms recipient is configured in the Netlify UI, not here — this
 * constant is only for what the site itself renders or links to.
 */
export const CONTACT = {
	/** Dev alias. Production: tyler@regensb.com */
	email: 'testing@garfishdigital.com',
	address: {
		street: '908 Portage Avenue',
		city: 'South Bend',
		region: 'IN',
		postalCode: '46616',
	},
} as const;
