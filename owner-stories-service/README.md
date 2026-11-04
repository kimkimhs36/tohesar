# OWNER STORIES / Private intake service

Separate opt-in serverless backend for the static TOHEŞAR website.
**Status: implementation and local test complete, NOT deployed or enabled for public traffic.**
Deploy this *subdirectory* as a standalone Vercel project (Root Directory: `owner-stories-service`), and do not modify GitHub Pages `main` merely to test this service.

## What it does
- `POST /api/submit` from a strictly configured origin, JSON only, bounded to 8 KiB.
- Validates vehicle, story (8–700 characters), one of the three editorial formats, contact email or Instagram handle.
- Requires a Cloudflare Turnstile token and verifies that it was issued for the correct origin hostname.
- Forwards a plain-text proposal to the editorial inbox through Resend; never stores or logs personal submissions.
- Returns HTTP 202 only after the mail provider accepts the request, not a guarantee of actual email delivery.
- Fail closed when provider secrets are missing, and never exposes secrets in client responses.

## Required Vercel environment variables (server-side only)
- `OWNER_STORIES_ORIGINS=https://tohesar.com`
- `OWNER_STORIES_TO=<verified editorial inbox>`
- `OWNER_STORIES_FROM=<sender address on a verified Resend domain>`
- `RESEND_API_KEY=<private Resend key>`
- `TURNSTILE_SECRET_KEY=<private Cloudflare Turnstile secret>`

Do not put any of these secrets in GitHub or public HTML. Set up a Turnstile widget for `tohesar.com` before enabling API submissions. Resend domain verification and DNS configuration are prerequisites. The GitHub Pages site has **no native server runtime**, so this folder alone does not make a live form.

## Front-end integration gate
The public pilot currently uses `mailto:`, by design, until the API project is deployed and verified.
When the backend is live, integrate a separate submit branch: collect *one* reply contact, inject Turnstile widget, POST JSON to the Vercel endpoint, show success **only after 202**; retain the mailto fallback. Do not expose API credentials to browsers. Do not pretend that opening a mail draft means it has been sent.

## Tests
```sh
cd owner-stories-service
npm test
```
Node >=20 required. Tests mock provider network calls and require no secrets. Real production verification is a separate step.

## Security and launch checks
- Add durable rate limiting (e.g. Upstash / Cloudflare edge protection) before large-scale public campaigns; Turnstile alone is not a complete anti-abuse policy.
- Check privacy statement/consent language and retention expectations before processing public submissions.
- Test both verified and invalid Turnstile tokens, provider outages, CORS, mobile network errors, and response headers.
- Do not publish the endpoint or point the form at it before the above checks and domain identity are complete.
