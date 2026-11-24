# Sterlixit event site

Kiosk web app for the Sterlixit stand: one link for the whole team.

| Page | What it is |
|---|---|
| `/` | **Event home.** Pick a demo. Long-press the logo for staff mode. |
| `/health-check` | **Website Health Check.** A visitor enters their website, sees four Lighthouse scores, three quick wins and our own checks, then gets the full report by email. Spec: `5 - Website Health Check Build Plan.md`. |
| `/staffmain` | **StaffMain showcase.** Six feature screens, four quick questions (type of business, team size, sites, what takes the most time), a personal result with the **14-day free trial** (full access, no card required), then a demo request. Works on its own from a QR code on a phone. Spec: `6 - Staffmain Showcase & Lead Capture Plan.md`. |
| `/enquiry` | **General Enquiry.** Services picker, details form, thank-you. The catch-all: if in doubt, use this. Staff mode → **+ Quick enquiry** opens the form directly and tags the lead "Team member" (only trusted from a staff-signed-in device). Spec: `8 - General Enquiry Plan.md`; copy in `src/config/enquiry.ts`. |
| `/letflows` | **LetFlows showcase.** Same flow for landlords and letting agents, in LetFlows' brick-orange accent. Spec: `7 - LetFlows Showcase & Lead Capture Plan.md`. |

Both showcases run on one shared engine (`src/components/showcase/`, `src/lib/product-leads/`).
Each product only defines its copy, questions, result rules and hero:

- StaffMain: `src/config/staffmain.ts`, `src/components/staffmain/`, `src/lib/staffmain/`
- LetFlows: `src/config/letflows.ts` (features from LetFlows' own site config; `SHOW_MTD` hides
  every Making Tax Digital option), `src/components/letflows/`, `src/lib/letflows/`. LetFlows is
  pitched as a whole-property platform ("Let it flow"), never as just lettings.

Each product also has a **Live page** (`/letflows/live`, `/staffmain/live`): a scroll story where
the display stays pinned and changes with each step, then the screens it runs on, the 3-step set-up
and a call to action (`src/components/live/`). StaffMain's welcome also shows the **tap-to-clock-in
scene** (`src/components/staffmain/ClockInScene.tsx`). LetFlows uses logo **Direction A** (Flow
Roof) from `letlfows/brand/directions/svg/`.

**Attract mode** (`src/components/AttractMode.tsx`): after 45 s with nobody touching a start screen
(event home or any demo's welcome), a full-screen showreel of the four demos plays; a tap opens the
demo on screen. Kiosk devices only, never mid-form or over staff mode; switch it off per tablet in
staff mode → This device.

Both welcome screens end with a **"Live" display teaser** (coming soon, only for that product's
customers): an Apple-Home-style screen whose tiles update by themselves. Its tiles and updates are
`LIVE_TILES` / `LIVE_EVENTS` in each product's config file.

Screenshots: `public/staffmain/` (captured from the StaffMain app with its seeded demo company;
Expenses still uses a drawn preview, as no expenses module was found) and `public/letflows/`
(frames from LetFlows' product film on letflows.com; swap in screenshots of app.letflows.com when
there's a demo login). Change a slide's image with `media` in the config file.

**Leads:** every demo sends leads to the same Zoho CRM connection (tags "Website Health Check",
"StaffMain" or "LetFlows", plus the event name). An existing email gets a Note instead of a
duplicate. Optional custom Zoho fields are set in one place (`ZOHO_FIELD_*`). Product leads are
also saved in `data/<product>-leads.json`, and queued on the device if the Wi-Fi drops (they send
themselves when it's back; retries are never saved twice).

**Product emails:** "Thanks for stopping by" goes straight away; "Your … account is ready" is sent
from staff mode (StaffMain or LetFlows tab → Account ready email) once the account exists.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion (Framer Motion) ·
Zoho CRM (leads) · nodemailer + React Email (SMTP via mail.sterlixit.co.uk) · installable PWA.
No database: leads go to Zoho CRM, with a local JSON backup (`data/leads.json`).

## Quick start (local)

```bash
npm install
cp .env.example .env.local    # fill in SMTP_PASSWORD, ZOHO_*, PSI_API_KEY, STAFF_PIN
npm run dev                   # http://localhost:3000
```

Without SMTP settings, report emails are printed to the server console. Without Zoho settings,
leads are only kept in `data/leads.json`.

## Environment variables

See `.env.example`; every variable is described there. The important ones:
`PSI_API_KEY`, `SMTP_*`, `ZOHO_*`, `STAFF_PIN`, `BOOKING_URL`, `EVENT_NAME`.

## How it works

- `POST /api/scan` normalises the URL, blocks private/internal addresses, then runs PageSpeed
  (mobile, lab data only) and our quick checks in parallel: HTTPS, server speed, title, meta
  description, viewport, H1, social tags, robots/sitemap, plus Ahrefs-style on-page checks
  (indexable, canonical, image alt text, favicon). The site's favicon and title head the results
  and the email.
- **Repeat scans are instant:** the same site (www and trailing slash ignored) reuses its last
  result for 24 h, or 1 h if PageSpeed failed. If PageSpeed is still running, a repeat scan joins
  it instead of starting another. Scans are saved in `data/scans.json`, so this survives restarts.
  Staff mode → **Warm up demo** always runs a fresh scan. Results are cached per URL,
  and requests are rate-limited (10/min per tablet, 30/min per IP). If PageSpeed takes over 45 s,
  the visitor gets the quick checks straight away. PageSpeed finishes in the background and the
  results screen updates itself (`GET /api/scan/:id`).
- `POST /api/lead` validates the form (consent required), saves the lead to `data/leads.json`,
  responds straight away, then emails the report over SMTP and creates the lead in Zoho CRM
  (Lead Source `Stand – <EVENT_NAME>`, tags, website, scores and top fixes in the Description).
  If that email already exists in Zoho, the record isn't overwritten: the health check is added
  as a Note instead. If PageSpeed is still running, the email waits until it finishes.
- **Staff mode:** long-press the logo for 1.5 s, then enter the PIN. The PIN is asked for **every
  time** staff mode opens, and closing it signs out. It shows today's leads and
  scans with their email and Zoho status, lets you re-send a report, retry the Zoho sync, export
  to CSV (today or all), warm up the demo scan and reset the kiosk.
  The **StaffMain guide** tab lists every StaffMain feature (`src/config/staffmain-guide.ts`).
  **Show to visitor** opens it full screen with no leads visible; closing it signs out.
- **Kiosk:** after 90 s idle it shows "Still there?" for 10 s, then clears everything and goes
  back to Welcome. Form autofill is off so one visitor's details never show for the next.

Key files: `src/components/Kiosk.tsx` (screen flow), `src/components/screens/*`,
`src/lib/pagespeed.ts` (plain-English copy for audits), `src/lib/quick-checks.ts`,
`src/lib/scan-service.ts`, `src/lib/email/ReportEmail.tsx`, `src/lib/zoho.ts`, `src/lib/mailer.ts`,
`src/lib/store.ts`.

## Booking links and analytics

Every "Book a free strategy call" link goes to `BOOKING_URL` with UTM tags, so bookings show up
in Google Analytics by channel: `utm_source=website-health-check`,
`utm_medium=qr|kiosk|email`, `utm_campaign=<event slug>`,
`utm_content=thank-you-qr|thank-you-button|report-cta|report-footer`.

## Logo

The official star mark from the sterlixit website (`public/sterlixit.svg`) lives in
`src/lib/brand/mark.tsx` and is used for the kiosk, PWA icons and the email (embedded as a PNG).

## Deploying

Best run as a single long-lived Node server (`npm run build && npm start`), e.g. a small VPS or
the office machine, so `data/leads.json` persists. On Vercel the local backup isn't persistent;
Zoho remains the record. Scan and lead routes set `maxDuration = 60`.

## Event day

1. Use a 4G/5G hotspot as the main connection; venue Wi-Fi as backup.
2. Install the app on the tablet: Chrome → "Install app" (Android), or Safari → Share → "Add to
   Home Screen" plus Guided Access (iPad). Turn auto-lock off.
3. Before doors open: Staff mode → **Warm up demo**, so `sterlixit.co.uk` is instant.
4. Staff mode → **This device**: choose where each tablet starts (event home, or lock it to one
   demo). Kiosk mode (90 s idle reset) is automatic on tablets and off on phones.
5. Print QR codes to `/staffmain`, `/letflows` and `/enquiry` for the stand. Send one test lead for each and
   check it arrives in Zoho tagged **StaffMain** / **LetFlows** with all its answers, then delete it.
6. Afterwards: Staff mode → **Retry Zoho sync** (if any show "Not in Zoho yet"), then **Export all
   (CSV)** on the Health check, StaffMain and LetFlows tabs. Add notes to StaffMain leads as you go.
