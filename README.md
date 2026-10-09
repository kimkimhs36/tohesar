# TOHEŞAR — Digital Flagship

Fresh static website for https://tohesar.com. No framework, build step, router, or runtime dependencies. Designed for root deployment via GitHub Pages.

## Deployment
- Publish the root of the main branch through GitHub Pages (Settings → Pages → Deploy from a branch → main / root), after review and merge.
- Keep the CNAME file containing `tohesar.com`.
- Verify DNS and HTTPS in Pages settings; repository changes alone cannot fix domain DNS.
- Internal navigation uses anchors to prevent client-side route refresh 404s.

## Preview
Open index.html with a local static server, or deploy the rebuild branch to a preview host. Review responsive layout and external links before merging.

## Notes
This is an original typographic/art-direction prototype using CSS-generated art, not finished photography. Replace abstract hero artwork with properly licensed TOHEŞAR photography later.
