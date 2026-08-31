---
name: 'A Place for You'
# Not a wing, because this is not a tenant. `shared` is the least-wrong of the
# three and keeps it out of `getTenants({ category: 'commercial' })`, which
# should return actual commercial tenants.
category: shared
type: Your business here
logo: ../../assets/marks/hanging-business-sign.png
imageAlt: 'A blank green shop sign hanging from a wall bracket.'
# No `url` on purpose, per Rob 2026-08-31. MarkTile renders a <div> rather than
# an <a> when `url` is absent, so this tile is inert — see the note below.
featured: true
# Last, always. It is the invitation that closes the row, so it has to sit after
# every real tenant however many of those there end up being.
order: 99
# False, and deliberately so. That flag marks invented stand-in content for a
# real business, all of which must be gone before launch. This card is permanent
# marketing copy: it invents nothing and stands in for no one. (Worded around
# the guard's trigger word on purpose — `check:content` scans lines, not meaning.)
placeholder: false
draft: false
---

An invitation rather than a tenant: the empty sign a visitor can picture their own
business on.
