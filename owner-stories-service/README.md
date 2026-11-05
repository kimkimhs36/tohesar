# OWNER STORIES — optional private intake

**Not deployed or enabled. NOT READY FOR DEPLOYMENT.** GitHub Pages is static and does not run this API. The live/default client opens a mail draft; it does not submit it. `owner-stories/intake-config.js` intentionally has empty settings. There is no photo upload. The code is public; never put secrets or submissions in the repository, source maps, build artifacts or client configuration.

## Contract

`POST /api/submit` accepts only UTF-8 JSON up to 8,192 wire bytes (no compression), an exact allowlisted HTTPS `Origin`, and an `Idempotency-Key` header containing a random UUIDv4. Fields: `model` (2–120 Unicode code points, max 480 UTF-8 bytes), `story` (8–700, max 2,800 bytes), `theme` (one of the three existing form values), `contact` (ASCII email or `@` Instagram handle), `consent: true`, `turnstileToken`, and optional empty `website` honeypot. Unknown fields, malformed UTF-8, controls, invalid Unicode and overlong values are rejected, never truncated. Story URLs and HTML are inert text, never fetched or rendered as HTML. An email address is used as `reply_to` only after validation; the subject is constant.

Turnstile is checked server-side, including success, exact request-origin hostname, action `owner_story`, and a challenge timestamp within five minutes (30 seconds clock skew). A token is single-use: retries need a **new token**. `202 {ok:true,status:"accepted"}` means Resend accepted the message and returned an ID; it does **not** prove delivery, editorial review or publication. Other outcomes are errors, including the honeypot. `delivery_unconfirmed` includes timeouts, upstream 5xx and malformed successful responses: the provider may have accepted the message. Never automatically send another email or switch immediately to mailto in that case.

Each attempt has a random response `X-Request-ID` and structured server log containing only service, stage and request ID. No inputs, email addresses, tokens, IP addresses, provider bodies, or credentials are intentionally logged by this code. Status codes include 400 (body/key/verification), 403 origin, 405 method, 413 bytes, 415 media/encoding, 422 fields, 409 idempotency conflict, 502 verification/provider rejection and 503 unavailable/ambiguous. Responses are `no-store`. Provider, hosting, CDN and mailbox systems may retain data and operational logs independently; no claim of zero retention is made.

## Dedupe and abuse limitations

Resend's `Idempotency-Key` is the same client-generated UUID with an `owner-stories/` prefix. Resend documents a **24-hour** key window and returns the previous response for an identical request. Concurrent requests or reusing the key with different email parameters may return 409. The client retains the key in memory for unchanged content, including after an ambiguous timeout; it resets the Turnstile widget and retries only after a fresh verification. Reloading the page loses the key, and a new key, changed content, another browser, or retries after the provider's window can result in duplicate mail. There is no database, durable local queue or global exactly-once guarantee. Investigate ambiguous cases in the provider dashboard without placing personal data in logs before retrying after a reload. See [Resend idempotency documentation](https://resend.com/docs/dashboard/emails/idempotency-keys) and verify current provider semantics before launch.

**There is no in-memory or application-level distributed rate limit.** CORS/origin checks and Turnstile are not rate limiting or authentication; `Origin` can be forged outside a browser. Before enabling, an operator must deploy and test a durable edge/WAF limit that covers *every* invocation, including direct function/deployment URLs, concurrent instances, preview hosts, and requests with absent/forged headers. Block bypass at the platform/network layer. Set thresholds and a real client identity at the trusted edge; do not trust arbitrary forwarded IP headers in application code. Add body size, request duration and concurrency limits, abuse alerting and provider spend caps there. `OWNER_STORIES_EDGE_PROTECTION=confirmed` is only an operator attestation and fail-closed configuration gate; it cannot detect or enforce a WAF. If bypass cannot be prevented on the chosen hosting plan, do not enable the API.

## Server-only configuration

Configure these as secret runtime environment variables in a **separate server project** (suggested root: `owner-stories-service`):

- `OWNER_STORIES_ORIGINS`: comma-separated exact HTTPS origins, no slash, path, wildcard or credentials, e.g. `https://tohesar.com,https://www.tohesar.com` only if both are actually authorized and covered by Turnstile. No implicit default.
- `OWNER_STORIES_TO`: approved editorial inbox; restrict mailbox access and retention.
- `OWNER_STORIES_FROM`: verified sender address for the provider.
- `RESEND_API_KEY`: restricted private provider key, managed in secret storage.
- `TURNSTILE_SECRET_KEY`: private Cloudflare secret for the correct widget.
- `OWNER_STORIES_EDGE_PROTECTION=confirmed`: set only after the edge controls and bypass tests above pass. This is **not** a rate limiter.

The Vercel Node body parser is disabled so the function reads bounded raw bytes. Verify the deployment adapter honors `config.api.bodyParser=false`, rejects oversized requests at the edge, and enforces request timeouts. If using another platform, adapt and test its raw stream/body limits rather than relying on parsed JSON size. The upstream deadlines are 8 seconds for verification and 10 seconds for delivery; set platform execution limits accordingly. No automatic provider retries are performed.

## Client activation and privacy

The unconfigured client never loads the Turnstile script or contacts an API. To enable only after the gates below, set `endpoint` to the reviewed HTTPS `https://<approved-service>/api/submit` and `sitekey` to the **public** widget site key in `owner-stories/intake-config.js`; never place a secret there. The user explicitly chooses online preparation, sees the processing notice, supplies one contact method, and checks consent before transmission. Preparing loads Cloudflare's script and can disclose network metadata to Cloudflare. Text, contact and token are sent only on online submission; the separate story-card photo stays in the browser. Mailto and copy remain available. No browser storage or analytics are added by this implementation; third-party behavior must be assessed separately.

Consent covers processing a proposal and replying, not publication, an interview, or photo rights. Obtain separate explicit agreement for those. Before launch, publish an approved privacy notice naming the operator, service providers, purposes, lawful basis, data subject contact, access controls and concrete retention/deletion schedule. No retention period is assumed by the code. Review provider and email mailbox retention and data residency, and establish a deletion process. The application has no submission database but processing and delivery do create copies in provider and mailbox systems.

## Launch, diagnosis and rollback

1. Review this branch together with #28/#27; resolve concurrent changes and run the tests. Confirm the API is excluded from accidental public service exposure unless intentionally deployed. Pages serving source files does not execute them.
2. Establish privacy notice/consent, verified inbox/sender and restricted credentials; configure the Turnstile site/secret with allowed hostnames and `owner_story` action. Confirm DNS and a separate approved service host. Do not use production addresses or paid APIs for development.
3. Configure edge protection, direct-origin blocking, limits and provider spend caps. Test bypass, load and parallel requests across instances. Set the attestation only after validation.
4. In an isolated, approved staging environment, test actual provider verification, idempotency, rejected/expired tokens, timeouts, logs and real delivery **with specifically authorized test recipients**. Check no photo leaves the browser. Then configure the public site key/endpoint and review the complete flow, accessibility, mobile browsers and privacy notice before any release. No production deployment is implied by this repository.
5. Diagnose by response stage and request ID plus privacy-restricted provider dashboard; do not log payloads or ask users to post contact details in tickets. For an ambiguous outcome, do not claim failure or success and do not resend under a new key without checking.
6. Roll back by clearing the public endpoint/site key (restores mailto), disabling the function/edge route and revoking exposed credentials as appropriate. This cannot retract already accepted mail; follow mailbox/provider retention and deletion procedures.

## Local tests

Node >=20, no packages, accounts, secrets or external providers required:

```sh
cd owner-stories-service
npm test
```

Tests simulate verification, provider failures, deadlines, and provider idempotency; an HTTP loopback test covers streaming without a real provider. `tests/owner-stories-browser.cjs` at the repo root exercises the static pages and a mocked online flow in Chromium when Playwright and Chromium are available. Start `python3 -m http.server 8765 --bind 127.0.0.1` from the repository root, then run `node tests/owner-stories-browser.cjs`. All non-local traffic is intercepted. These are mocks, not live service integration or physical-device tests.
