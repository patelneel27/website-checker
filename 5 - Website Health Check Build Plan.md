# Sterlix Website Health Check: Build Plan & Prompt

A tablet tool for the Sterlix stand. A visitor types in their website, gets a free 60-second health check on screen, and leaves their details to receive the full report by email. Our team then follows up with a strategy call.

This file has three parts:

1. **The plan:** what the tool does and how it's built (sections 1–9).
2. **A ready-to-paste build prompt** for Claude Code or a developer (section 10).
3. **Plan B:** how to run the same check at the event with no build at all (section 11).

---

## 1. Goal

| Item | Target |
|---|---|
| Purpose | Start a real conversation about the visitor's own website, show our expertise in under a minute, and capture a qualified lead |
| Where it runs | A tablet (iPad or Android) on the stand, full screen, plus any team member's phone |
| Time per visitor | Under 2 minutes, including the scan |
| Output | Scores on screen, plus an emailed report with the top 3 fixes and a "Book a free strategy call" link |
| Success | Every scan that shows a score ends with an email captured (with consent) |

---

## 2. User flow (5 screens)

1. **Welcome:** Sterlixit logo with "Free Website Health Check: how fast, findable and mobile-friendly is your site?" and a big "Check my website" button.
2. **Enter URL:** a single input with the `https://` prefix shown, the mobile keyboard set to URL type, and a "Run check" button.
   - Accepts `example.co.uk`, `www.example.co.uk` and full URLs, and normalises them to `https://…`.
   - Has a small "Try with sterlixit.co.uk" link that staff use for demos.
3. **Scanning (15–45 seconds):** a branded progress animation with rotating tips ("Checking mobile speed…", "Looking at SEO basics…", "Testing security…"). Never a blank screen.
4. **Results:**
   - Four score rings (Performance, SEO, Accessibility, Best Practices) using Google's colour bands (see section 4), each with a one-line plain-English meaning.
   - The "3 quick wins": the three biggest problems, in plain English.
   - A friendly summary line, e.g. "Your site is findable but slow on mobile. That's costing you visitors."
   - Main button: "Email me the full report".
5. **Get the report:**
   - Fields: name, email, company (optional), phone (optional), and the question "What would you like help with?" (chips: Website, Branding, SaaS, Marketing, Just curious).
   - A required consent checkbox (section 6). Submitting shows a **Thank you** screen with "Book a free strategy call" and a QR code to the booking page.

**Staff mode** (PIN-protected, hidden behind a long press on the logo):
- See today's scans and leads.
- Re-send a report.
- Export to CSV.
- Reset the kiosk.

---

## 3. What we check

### From Google PageSpeed Insights (Lighthouse lab test, mobile)

- **Endpoint:** `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed`
- **Parameters:**
  - `url`
  - `key`
  - `strategy=mobile`
  - `category`, repeated four times: `performance`, `accessibility`, `best-practices`, `seo`
  - `locale=en_GB`
- **Example:**
  ```
  https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fexample.co.uk&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&locale=en_GB&key=YOUR_KEY
  ```
- **Scores (0–1, multiply by 100):**
  - `lighthouseResult.categories.performance.score`
  - `lighthouseResult.categories.seo.score`
  - `lighthouseResult.categories.accessibility.score`
  - `lighthouseResult.categories['best-practices'].score`
- **Key metrics:**
  - `lighthouseResult.audits['largest-contentful-paint'].numericValue` (ms)
  - `lighthouseResult.audits['cumulative-layout-shift'].numericValue`
  - `lighthouseResult.audits['total-blocking-time'].numericValue` (ms)
- **Quick wins:** take audits with `score < 0.9`, prefer type `opportunity` (largest `details.overallSavingsMs` first), then failed SEO/accessibility audits. Map the top 3 to plain-English copy (see the table below).
- **API key:** free, from Google Cloud Console (enable the "PageSpeed Insights API"). Keep it server-side only. The free tier allows 25,000 requests a day, far more than an event needs.
- **Use lab data only** (`lighthouseResult`). Don't rely on field data (`loadingExperience`): many small sites have none, and Google is phasing it out of this API.

### Our own quick checks (run on our server in parallel)

| Check | How | Plain-English result |
|---|---|---|
| HTTPS / SSL | Final URL starts with `https://`, no certificate error | "Your site is secure (padlock)" / "Visitors may see a 'Not secure' warning" |
| Page title | `<title>` present, 10–60 characters | "Google shows a clear page title" |
| Meta description | Present, 50–160 characters | "Google has a description to show under your link" |
| Mobile viewport | `<meta name="viewport">` present | "Built for mobile screens" |
| Main heading | Exactly one `<h1>` | "Clear main heading for Google" |
| Social preview | `og:title` and `og:image` present | "Looks good when shared on social media" |
| robots.txt / sitemap.xml | `GET /robots.txt`, `GET /sitemap.xml` return 200 | "Google can find all your pages" |
| Server response time | Time to first byte of our own `fetch` | "Your server responds quickly" |

Timeouts: 8 seconds per quick check, 60 seconds for PageSpeed. If a check fails, hide it; never show an error to the visitor.

### Plain-English copy for common audits (starter set)

| Lighthouse audit id | Show the visitor |
|---|---|
| `largest-contentful-paint` (slow) | "Your main content takes **X s** to appear on mobile. Under 2.5 s is good." |
| `render-blocking-resources` | "Some files stop your page showing quickly. We can load them smarter." |
| `uses-optimized-images` / `modern-image-formats` | "Your images are larger than they need to be. Compressing them makes pages faster." |
| `unused-javascript` | "Your site loads code it doesn't use, which slows phones down." |
| `meta-description` (fail) | "Google has no description to show under your link." |
| `document-title` (fail) | "Your page is missing a clear title in Google." |
| `color-contrast` (fail) | "Some text is hard to read against its background." |
| `image-alt` (fail) | "Images are missing descriptions, which hurts accessibility and SEO." |
| `tap-targets` (fail) | "Buttons and links are too close together on mobile." |
| `is-on-https` (fail) | "Your site isn't fully secure (https)." |

For any audit not in the list, fall back to Lighthouse's own `title`.

---

## 4. How scores are shown

These are Google's own Lighthouse colour bands:

| Score | Colour | Label shown |
|---|---|---|
| 90–100 | Green | "Good" |
| 50–89 | Orange | "Needs improvement" |
| 0–49 | Red | "Poor" |

What each score means:

| Score | One-line meaning |
|---|---|
| Performance | "How fast your site loads on a phone" |
| SEO | "How easily Google can find and understand your site" |
| Accessibility | "How easy your site is for everyone to use" |
| Best Practices | "Security and modern web standards" |

Tone is always helpful, never insulting. Say "Here's where you could improve", not "Your site is bad". Never criticise the visitor's current web agency.

---

## 5. Tech stack

- **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion.** React only; no PHP or other server languages.
- **`POST /api/scan`** (Route Handler, Node runtime):
  - Validates and normalises the URL.
  - Runs PageSpeed and the quick checks in parallel with `Promise.allSettled`.
  - Returns a compact JSON: `{ url, scores, metrics, quickWins[3], checks[], scannedAt }`.
  - Sets `export const maxDuration = 60` if hosted on Vercel.
- **Caching:** the same URL within 24 hours returns the cached result instantly (in-memory, or the database below).
- **Rate limit:** 10 scans per minute per device or IP, to protect the API key.
- **`POST /api/lead`:** saves the lead, sends the report email, and returns `{ ok: true }`.
- **Database:** Postgres + Prisma, with two tables:
  - `Scan` (id, url, scores JSON, createdAt)
  - `Lead` (id, scanId, name, email, company, phone, interest, consentAt, source = "Stand – <event name>")
- **Email:** Resend (or the existing email provider) with a React Email template:
  - Logo and the four scores.
  - Top 3 fixes, each with one sentence on what we'd do.
  - "Book a free strategy call" button and our contact details.
  - Plain-text fallback.
- **Staff-mode export:** CSV (or a Google Sheets sync if the team prefers).
- **Kiosk:** installable PWA (`manifest.json`, full-screen display, a portrait-locked option), no address bar, and an auto-reset to the Welcome screen after 90 seconds idle.
- **Environment variables:**
  - `PSI_API_KEY`
  - `DATABASE_URL`
  - `RESEND_API_KEY`
  - `STAFF_PIN`
  - `BOOKING_URL`
  - `EVENT_NAME`

---

## 6. Privacy (UK GDPR)

- **Consent checkbox (unticked by default):** "I'd like Sterlix to email me my website report and contact me about it. I can unsubscribe at any time." Link it to the Sterlix privacy policy.
- **Data:** store only what the form asks for, and record `consentAt` and the event name.
- **What we scan:** only the public website, never anything behind a login.
- **Retention:** delete leads that don't convert after an agreed period (e.g. 12 months), and say so in the privacy policy.

---

## 7. Brand

| Token | Value |
|---|---|
| Brand blue | `#1362FB` |
| Deep blue | `#1433D6` |
| Navy | `#0A1342` |
| Sky blue | `#5C9BFF` |
| Body text | `#3A4670` |
| Background | `#FFFFFF` / `#EEF3FF` |
| Headings | Sora (ExtraBold / Bold) |
| Body | Plus Jakarta Sans |
| Logo | Official Sterlix IT star mark + "Sterlixit" wordmark |

Large touch targets (at least 56 px), text that stays readable at arm's length, and nothing smaller than 16 px.

---

## 8. Event-day robustness

- **Wi-Fi:** don't rely on venue Wi-Fi. Bring a 4G/5G mobile hotspot as the main connection, with the venue Wi-Fi as backup.
- **Power:** a charger and power bank for the tablet; turn screen auto-lock off.
- **Warm-up:** scan `sterlixit.co.uk` before doors open so the demo result is cached and instant.
- **Slow sites:** if PageSpeed takes more than 45 seconds, show the quick-check results and say "We'll email your full speed report shortly", then finish the scan in the background.
- **Fallback:** if the tool is down, use Plan B (section 11). A visitor should never leave without at least their email and website captured.

---

## 9. Acceptance checklist

- [ ] Scan of `sterlixit.co.uk` returns four scores and three quick wins in under 45 seconds on a hotspot
- [ ] URL input accepts `example.co.uk`, `www.example.co.uk` and `https://example.co.uk/page`
- [ ] Unreachable or invalid URL shows a friendly message, not an error
- [ ] Repeat scan of the same URL within 24 hours is instant (cache)
- [ ] Lead form can't be sent without the consent box ticked
- [ ] Report email arrives within 1 minute, looks right in Gmail and Outlook, and every link works
- [ ] Staff mode PIN works; CSV export opens in Excel/Google Sheets
- [ ] Kiosk resets after 90 seconds idle; works full screen on the stand tablet
- [ ] All copy is UK English

---

## 10. Build prompt (paste into Claude Code or give to a developer)

```text
Build "Sterlix Website Health Check": a kiosk web app for our exhibition stand.

STACK: Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion. React only — no PHP or other server
languages. Postgres + Prisma for data, Resend + React Email for email. Installable PWA, full-screen kiosk.

FLOW (5 screens): Welcome → Enter URL → Scanning (branded animation, rotating tips, 15–45 s) → Results →
Lead form → Thank you (Book a free strategy call button + QR code to BOOKING_URL). Auto-reset to Welcome
after 90 s idle. Hidden staff mode (long-press logo + STAFF_PIN): today's scans and leads, re-send report,
CSV export, reset.

SCAN (POST /api/scan, Node runtime, maxDuration 60):
- Normalise the URL (accept example.co.uk / www. / full URLs → https://).
- In parallel (Promise.allSettled):
  1) Google PageSpeed Insights v5: GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
     with url, key=PSI_API_KEY (server-side only), strategy=mobile, locale=en_GB and category repeated for
     performance, accessibility, best-practices, seo. Read lighthouseResult.categories.*.score (×100) and
     audits largest-contentful-paint, cumulative-layout-shift, total-blocking-time. Use lab data only.
  2) Our quick checks with 8 s timeouts: https/SSL, <title> 10–60 chars, meta description 50–160 chars,
     viewport meta, exactly one <h1>, og:title + og:image, /robots.txt and /sitemap.xml return 200,
     server response time.
- Quick wins: failed audits (score < 0.9), opportunities first by details.overallSavingsMs, then failed
  SEO/accessibility audits; top 3 mapped to plain-English copy (use the mapping table in the plan file;
  fall back to the audit title).
- Cache results per URL for 24 h. Rate limit 10 scans/min per IP. Never show raw errors to visitors;
  hide failed checks; if PSI > 45 s show quick checks and finish PSI in the background for the email.

RESULTS SCREEN: four score rings (Performance, SEO, Accessibility, Best Practices) with Lighthouse colour
bands — 90–100 green "Good", 50–89 orange "Needs improvement", 0–49 red "Poor" — each with a one-line
plain-English meaning; three quick wins; a friendly summary; main button "Email me the full report".
Tone: helpful, never insulting.

LEAD (POST /api/lead): name, email, company (optional), phone (optional), interest chips (Website, Branding,
SaaS, Marketing, Just curious), REQUIRED unticked consent checkbox: "I'd like Sterlix to email me my
website report and contact me about it. I can unsubscribe at any time." linking to our privacy policy.
Save Scan + Lead (with consentAt and source = EVENT_NAME), then send the report email (logo, four scores,
top 3 fixes with one sentence each on how Sterlix would fix it, Book a free strategy call button,
contact details: +44 20 8004 3327 · hello@sterlixit.co.uk · 595a Cranbrook Road, Gants Hill, London,
IG2 6JZ · www.sterlixit.co.uk). Plain-text fallback.

BRAND: blue #1362FB, deep blue #1433D6, navy #0A1342, sky #5C9BFF, body text #3A4670, backgrounds
#FFFFFF / #EEF3FF. Headings Sora (ExtraBold/Bold), body Plus Jakarta Sans. Sterlixit logo (I'll provide
the SVG). Touch targets ≥ 56 px, text ≥ 16 px. UK English throughout.

ENV: PSI_API_KEY, DATABASE_URL, RESEND_API_KEY, STAFF_PIN, BOOKING_URL, EVENT_NAME.

DONE WHEN: the acceptance checklist in the plan file passes — scan of sterlixit.co.uk returns 4 scores +
3 quick wins in < 45 s on a mobile hotspot; consent is enforced; report email arrives in < 1 min and
renders in Gmail and Outlook; staff CSV export works; kiosk auto-resets.

Start by proposing the file structure and Prisma schema, then build screen by screen.
```

---

## 11. Plan B: run the check with no build

Use this if the tool isn't ready, or as a fallback on the day.

1. Open **pagespeed.web.dev** on the tablet and pin it to the home screen.
2. Type in the visitor's website and tap **Analyse**. The **Mobile** tab is shown by default.
3. Walk them through the four score circles using the meanings in section 4.
4. Scroll to **Diagnose performance issues** and pick the top 2–3 items to explain in plain English (use the table in section 3).
5. Capture the lead on a **Google Form**: name, email, company, website, interest and a consent checkbox. Keep the form open in a second tab, or as a QR code on the stand.
6. After the event, run each captured website again, screenshot the scores, and send the follow-up email with the top 3 fixes.
