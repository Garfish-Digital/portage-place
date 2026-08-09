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
		build: {
			// esbuild, not the default lightningcss.
			//
			// lightningcss folds `animation-timeline` into the `animation` shorthand:
			//   animation: linear both milestone-in view()
			// `animation-timeline` is a RESET-ONLY sub-property — the shorthand resets
			// it but cannot set it — so that declaration is invalid, gets dropped, and
			// takes the animation name down with it. The History timeline silently lost
			// all its scroll-driven motion on Android and ChromeOS, and the bronze rail
			// was left stuck at `scale: 1 0` — invisible rather than merely static.
			//
			// esbuild does not synthesise shorthands, so the longhand survives. Costs
			// ~1 KB gzipped across the whole site. Revisit only if lightningcss fixes
			// this; verify against dist/_astro/*.css before switching back.
			cssMinify: 'esbuild',
		},
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
