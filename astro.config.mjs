// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
	// Swap to the production apex at cutover. Astro uses this for canonical URLs,
	// sitemap entries, and absolute OG image paths.
	site: 'https://portageplace.netlify.app',
	integrations: [
		icon({
			// Lucide only, inlined at build time — no runtime JS, no network request.
			include: { lucide: ['*'] },
		}),
	],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					// `abstracts` is functions + mixins only — compile-time, zero CSS
					// output — so injecting it into every component <style> block lets
					// them use fluid()/media queries without duplicating any output.
					// Partials pulled in via @use don't receive this and must declare
					// `@use "abstracts" as *` themselves.
					loadPaths: ['src/styles'],
					additionalData: `@use "abstracts" as *;`,
				},
			},
		},
	},
});
