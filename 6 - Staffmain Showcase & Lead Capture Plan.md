# Staffmain Showcase & Lead Capture: Plan & Prompt

A section of our event site (same subdomain as the Website Health Check) at **`/staffmain`**. A visitor sees what Staffmain does, screen by screen, gets a **personal "what Staffmain would do for you" result** based on their business (just as the health check gives a result for their website), then registers for a demo with Staffmain's own form.

Already in place and reused as it is: the event site, the Zoho CRM connection, the offline queue, kiosk mode and staff mode. This plan only covers what's new for Staffmain.

This file has two parts:

1. **The plan** (sections 1–8).
2. **A ready-to-paste build prompt** for Claude Code or a developer (section 9).

---

## 1. Goal

| Item | Target |
|---|---|
| Purpose | Show what Staffmain does, show the visitor how it fits their business, and capture a demo request |
| Who we're talking to | Business owners, HR and operations managers |
| Where it runs | The stand tablet, full screen, plus a QR code so visitors can open it on their own phone |
| Time per visitor | 2–3 minutes |
| Success | Every interested visitor leaves as a Staffmain lead with their company size and needs filled in |

---

## 2. User flow (6 screens)

1. **Welcome:** Staffmain logo, "HR made simple: people, leave, rota and attendance in one place", and a big "See what Staffmain does" button. Small "Built by Sterlixit" line underneath.
2. **Showcase (6 swipeable feature screens):** what the software does, one feature per screen (section 3). Each shows a real Staffmain screenshot (or a short screen recording), a title, one benefit line and three bullet points. Progress dots, plus "Skip to my results".
3. **Tell us about your business (3 quick taps):**
   - "How many employees?" 1–10, 11–50, 51–200, 201–500, 500+
   - "How many sites or branches?" 1, 2–5, 6–20, 20+
   - "What takes the most time today?" (pick any) Rotas · Holiday requests · Tracking attendance · Right-to-work checks · Expenses · Paperwork and records · Reports
4. **Your Staffmain result:** a personal summary built from their answers (section 4). Main button: "Book my free demo".
5. **Register for a demo:** the Staffmain form (section 5).
6. **Thank you:** "You're on the list. We'll email you within 2 working days to set up your Staffmain demo." QR code to the booking page, and "Back to start". Returns to the event home after 20 seconds.

---

## 3. Showcase: what we show

Use real Staffmain screenshots or 5–10 second screen recordings (no mock-ups), saved in `/public/staffmain/`.

| # | Screen | Benefit line | Three bullets |
|---|---|---|---|
| 1 | **Live attendance** | "See who's in, right now, across every site." | Clock in by QR, NFC, location or IP · Live board for every location · Late and missed clock-ins flagged |
| 2 | **Weekly rota** | "Build the week's rota in minutes, not hours." | Drag-and-drop shifts · Copy last week in one tap · Staff see their rota on their phone |
| 3 | **Leave & bank holidays** | "Holiday requests approved in a tap." | Entitlements worked out for you · UK bank holidays built in · Team calendar shows who's off |
| 4 | **Employee records & documents** | "Every employee and document in one secure place." | Personal and job details · Contracts and documents stored securely · Right-to-work checks with expiry reminders |
| 5 | **Expenses** | "Expenses submitted, approved and tracked." | Staff upload receipts · Managers approve on the go · Clear totals for payroll |
| 6 | **Reports & multi-company** | "Clear reports, for one company or several." | Hours, leave and attendance reports · Several companies or branches in one account · Export when you need it |

---

## 4. "Your Staffmain result" (screen 4)

The equivalent of the health check's score screen: personal, positive and short.

**Headline:** "Here's how Staffmain would work for {employee band} staff across {sites} site(s)."

**Then three "what changes" cards,** picked from what they said takes the most time (screen 3). If they picked fewer than three, fill up with Live attendance, Weekly rota, Leave, in that order.

| They picked | Card |
|---|---|
| Rotas | "**Weekly rota:** build and share the rota in minutes; staff see it on their phone." |
| Holiday requests | "**Leave:** requests and approvals in one tap, with entitlements and bank holidays worked out for you." |
| Tracking attendance | "**Live attendance:** see who's in across every site, with QR, NFC, location or IP clock-in." |
| Right-to-work checks | "**Right-to-work:** documents stored securely, with reminders before anything expires." |
| Expenses | "**Expenses:** receipts uploaded by staff, approved by managers, totals ready for payroll." |
| Paperwork and records | "**Employee records:** every person, contract and document in one secure place." |
| Reports | "**Reports:** hours, leave and attendance reports in a click." |

**Extra line when sites is 2 or more:** "All {sites} sites in one account, with a live view of each."

**Extra line when the band is 51+ employees:** "Managers get their own team view, so HR isn't the bottleneck."

**Main button:** "Book my free demo". Second link: "See the features again".

Tone: helpful and confident. Never promise specific time or money savings.

---

## 5. The Staffmain form

| Field | Type | Required |
|---|---|---|
| First name | Text | Yes |
| Last name | Text | Yes |
| Work email | Email | Yes |
| Phone | Tel | No |
| Company | Text | Yes |
| Job title | Text | No |
| Number of employees | Pre-filled from screen 3 (can change) | Yes |
| Number of sites / branches | Pre-filled from screen 3 (can change) | No |
| What do you use now? | Chips: Spreadsheets/paper, Another HR system, Nothing yet | No |
| When are you looking to start? | Chips: Now, In 1–3 months, Just researching | No |
| Consent | Checkbox, unticked | Yes |

**Consent wording** (linked to the Sterlix privacy policy): "I'd like Sterlix to contact me about a Staffmain demo and send me related information. I can unsubscribe at any time."

**Sent with the lead** through the existing Zoho connection:
- Product interest: **Staffmain**
- Everything from screen 3 (employees, sites, what takes the most time) plus the form answers
- The event name, and the note "Registered at the Sterlix stand, {date}" plus any staff note

---

## 6. Follow-up emails

**Email 1: thank you (sent straight away)**

> Subject: Thanks for stopping by: your Staffmain demo
>
> Hi {First name},
>
> Thanks for visiting the Sterlix stand today. You told us {what takes the most time} takes up too much of your week. We'll be in touch within 2 working days to set up your Staffmain account and a short live demo around how {Company} works.
>
> Want to choose a time now? {Booking link}
>
> The Sterlix team · +44 20 8004 3327 · hello@sterlixit.co.uk

**Email 2: account and demo (when you're ready)**

> Subject: Your Staffmain account is ready
>
> Hi {First name},
>
> Your Staffmain account is set up. Create your password here: {sign-up link}. Then pick a 30-minute slot for your live demo: {booking link}. We'll walk through {features} using your own team's set-up.

---

## 7. Staff mode and event day

- Staff mode shows Staffmain leads with their employee band, sites and "most time" answers, and a note box per lead (e.g. "Hot: 3 care homes, contract ends March").
- Keep a laptop logged in to a Staffmain demo account with sample staff, so visitors who want more can see the real thing.
- Print a QR code to `/staffmain` for the stand.
- Before doors open, send one test lead and check it arrives tagged **Staffmain** with all its answers, then delete it.

---

## 8. Acceptance checklist

- [ ] All 6 showcase screens show real Staffmain screenshots or recordings, and swipe smoothly
- [ ] "Your Staffmain result" changes correctly with the answers (try 1–10 staff / 1 site, and 201–500 / 6–20 sites)
- [ ] Employee and site answers are pre-filled in the form
- [ ] The form can't be sent without first name, last name, email, company, employees and consent
- [ ] A test lead arrives tagged Staffmain with every answer
- [ ] With Wi-Fi off, the visitor still sees Thank you and the lead sends later
- [ ] `/staffmain` works on its own from the QR code on a phone
- [ ] All copy is UK English

---

## 9. Build prompt (paste into Claude Code or give to a developer)

```text
Add a Staffmain section at /staffmain to our existing event site (the one with the Website Health Check).
Reuse the existing stack, styling, Zoho lead integration, offline queue, kiosk mode and staff mode — don't
change them. Put all Staffmain copy in config/staffmain.ts so it's easy to edit.

FLOW (6 screens):
1) Welcome — Staffmain logo, "HR made simple: people, leave, rota and attendance in one place", button
   "See what Staffmain does", small "Built by Sterlixit".
2) Showcase — 6 swipeable screens, each: real screenshot or short muted looping video from /public/staffmain/,
   title, benefit line, 3 bullets; progress dots; "Skip to my results".
   1 Live attendance — "See who's in, right now, across every site." — Clock in by QR, NFC, location or IP ·
     Live board for every location · Late and missed clock-ins flagged
   2 Weekly rota — "Build the week's rota in minutes, not hours." — Drag-and-drop shifts · Copy last week in
     one tap · Staff see their rota on their phone
   3 Leave & bank holidays — "Holiday requests approved in a tap." — Entitlements worked out for you · UK bank
     holidays built in · Team calendar shows who's off
   4 Employee records & documents — "Every employee and document in one secure place." — Personal and job
     details · Contracts and documents stored securely · Right-to-work checks with expiry reminders
   5 Expenses — "Expenses submitted, approved and tracked." — Staff upload receipts · Managers approve on the
     go · Clear totals for payroll
   6 Reports & multi-company — "Clear reports, for one company or several." — Hours, leave and attendance
     reports · Several companies or branches in one account · Export when you need it
3) About your business — chips: employees (1–10, 11–50, 51–200, 201–500, 500+)*, sites (1, 2–5, 6–20, 20+)*,
   "What takes the most time today?" multi (Rotas, Holiday requests, Tracking attendance, Right-to-work checks,
   Expenses, Paperwork and records, Reports).
4) Your Staffmain result — headline "Here's how Staffmain would work for {band} staff across {sites} site(s)."
   Three cards from the "most time" answers (mapping in config; if fewer than 3, fill with Live attendance,
   Weekly rota, Leave). Extra line if sites ≥ 2: "All {sites} sites in one account, with a live view of each."
   Extra line if 51+ employees: "Managers get their own team view, so HR isn't the bottleneck."
   Button "Book my free demo", link "See the features again". Animate the cards in, as the health check does
   with its scores. Never promise specific savings.
5) Form — first name*, last name*, work email*, phone, company*, job title, employees* and sites (pre-filled
   from step 3, editable), current solution (Spreadsheets/paper, Another HR system, Nothing yet), timeframe
   (Now, In 1–3 months, Just researching), consent* unticked: "I'd like Sterlix to contact me about a Staffmain
   demo and send me related information. I can unsubscribe at any time." linking to our privacy policy.
6) Thank you — "You're on the list. We'll email you within 2 working days to set up your Staffmain demo." QR
   code to the booking link, "Back to start"; return to the event home after 20 s.

LEAD: send through the existing Zoho integration with product interest "Staffmain", all step-3 answers, form
answers, event name and note "Registered at the Sterlix stand, {date}". Add new field names to the existing
Zoho field config in one place.

STAFF MODE: show Staffmain leads with employees, sites and "most time" answers; note box per lead.

Touch targets ≥ 56 px, text ≥ 16 px, UK English. Logo returns to the event home; 90 s idle returns there too.

DONE WHEN: the acceptance checklist in the plan file passes.
```
