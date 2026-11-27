# Keeping the EMI website safe

## Already built in
- **Content Security Policy** (in `index.html`): the browser only runs scripts from this site, which blocks injected-script (XSS) attacks.
- **Safe text handling**: anything a visitor types is shown with `textContent`, never as HTML.
- **Contact form**: required fields, length limits, email checking, a hidden spam trap, and a 30-second cooldown.
- **Donations**: amounts are limited to whole dollars from $1 to $10,000, and the button only sends people to the one HTTPS payment link you set in `script.js` (`DONATION_URL`).
- **Security headers** (`_headers`): HTTPS-only (HSTS), no embedding the site in other pages (stops clickjacking), no camera/mic/location access.

## Your checklist when you put the site online
1. **Use HTTPS.** Netlify, Cloudflare Pages and GitHub Pages all give you free HTTPS. Turn on "Enforce HTTPS".
2. **Use a trusted payment provider** (PayPal Giving Fund, Stripe, Givebutter, Donorbox). Never ask for card numbers on this site.
3. **Use a trusted form service** (Formspree, Netlify Forms) for the contact form. Turn on its spam filter / reCAPTCHA. Add its domain to `connect-src` and `form-action` in both CSP lines (in `index.html` and `_headers`).
4. **Protect your accounts**: strong passwords and two-factor authentication on your hosting, domain, email and payment accounts.
5. **Students' privacy**: don't post students' full names, photos, or schools without written permission from a parent/guardian.

## Headers on other hosts
- **Netlify / Cloudflare Pages:** `_headers` works as-is.
- **GitHub Pages:** it can't set custom headers. The CSP in `index.html` still protects you; for the rest, put the site behind Cloudflare (free).
- **Apache:** put the same headers in `.htaccess` with `Header always set ...`.
