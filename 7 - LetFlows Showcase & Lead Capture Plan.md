# LetFlows Showcase & Lead Capture: Plan & Prompt

A section of our event site (same subdomain as the Website Health Check) at **`/letflows`**. A landlord or letting agent sees what LetFlows does, screen by screen, gets a **personal "what LetFlows would do for your portfolio" result** (just as the health check gives a result for their website), then registers for a demo with LetFlows' own form.

Already in place and reused as it is: the event site, the Zoho CRM connection, the offline queue, kiosk mode and staff mode. This plan only covers what's new for LetFlows.

> **Before you build: confirm LetFlows' features.** Everything marked **[confirm]** is a placeholder. Swap in LetFlows' real features; the showcase, the result screen and the emails all come from section 3.

This file has two parts:

1. **The plan** (sections 1–8).
2. **A ready-to-paste build prompt** for Claude Code or a developer (section 9).

---

## 1. Goal

| Item | Target |
|---|---|
| Purpose | Show what LetFlows does, show the visitor how it fits their portfolio, and capture a demo request |
| Who we're talking to | Landlords, letting agents and property managers |
| Where it runs | The stand tablet, full screen, plus a QR code so visitors can open it on their own phone |
| Time per visitor | 2–3 minutes |
| Success | Every interested visitor leaves as a LetFlows lead with their role and number of properties filled in |

---

## 2. User flow (6 screens)

1. **Welcome:** LetFlows logo, "Property management, simplified: your lettings in one place", and a big "See what LetFlows does" button. Small "Built by Sterlixit · letflows.com" line underneath.
2. **Showcase (6 swipeable feature screens):** what the software does, one feature per screen (section 3). Each shows a real LetFlows screenshot (or a short screen recording), a title, one benefit line and three bullet points. Progress dots, plus "Skip to my results".
3. **Tell us about your properties (3 quick taps):**
   - "I'm a…" Landlord, Letting agent, Property manager, Other
   - "How many properties?" 1, 2–5, 6–20, 21–100, 100+
   - "What's the biggest headache?" (pick any) Chasing rent · Repairs and maintenance · Certificate renewals · Tenant paperwork · Tax and Making Tax Digital · Keeping track in spreadsheets
4. **Your LetFlows result:** a personal summary built from their answers (section 4). Main button: "Book my free demo".
5. **Register for a demo:** the LetFlows form (section 5).
6. **Thank you:** "You're on the list. We'll email you within 2 working days to set up your LetFlows demo." QR code to the booking page, and "Back to start". Returns to the event home after 20 seconds.

---

## 3. Showcase: what we show

Use real LetFlows screenshots or 5–10 second screen recordings (no mock-ups), saved in `/public/letflows/`.

| # | Screen | Benefit line | Three bullets |
|---|---|---|---|
| 1 | **Portfolio dashboard** [confirm] | "Every property, unit and tenancy in one place." | All properties at a glance · Occupied and vacant units · Key dates coming up |
| 2 | **Rent tracking** [confirm] | "See who's paid, who's late and what's due." | Rent due and received · Arrears flagged early · Payment history per tenant |
| 3 | **Tenants & tenancies** [confirm] | "Tenant details and tenancy dates, always up to date." | Tenant records and contacts · Start, end and renewal dates · Tenancy documents stored securely |
| 4 | **Maintenance** [confirm] | "Log repairs and track every job." | Tenants or staff report issues · Assign contractors · Track each job to done |
| 5 | **Compliance certificates** [confirm] | "Never miss a gas safety, EICR or EPC renewal." | All certificates in one place · Reminders before expiry · Ready when you need to show them |
| 6 | **Making Tax Digital & reports** [confirm] | "Get ready for Making Tax Digital for Income Tax." | Income and expenses kept digitally · Portfolio and arrears reports · Ready for quarterly updates |

**If LetFlows covers Making Tax Digital, make it a headline.** Under HMRC's current timetable, landlords with qualifying income over £50,000 must keep digital records from April 2026, then over £30,000 from April 2027 and over £20,000 from April 2028. Check the latest dates on GOV.UK before the event. If LetFlows doesn't cover MTD, replace screen 6 with Reports and remove the MTD options from sections 2, 4 and 5.

---

## 4. "Your LetFlows result" (screen 4)

The equivalent of the health check's score screen: personal, positive and short.

**Headline:** "Here's how LetFlows would work for your {properties} properties."
(For a letting agent or property manager: "…for the {properties} properties you manage.")

**Then three "what changes" cards,** picked from their biggest headaches (screen 3). If they picked fewer than three, fill up with Rent tracking, Compliance certificates, Maintenance, in that order.

| They picked | Card |
|---|---|
| Chasing rent | "**Rent tracking:** see who's paid and who's late at a glance, with arrears flagged early." |
| Repairs and maintenance | "**Maintenance:** every repair logged, assigned and tracked to done." |
| Certificate renewals | "**Compliance:** gas safety, EICR and EPC dates in one place, with reminders before they expire." |
| Tenant paperwork | "**Tenancies:** tenant details, dates and documents stored securely in one place." |
| Tax and Making Tax Digital | "**Making Tax Digital:** income and expenses kept digitally, ready for HMRC." |
| Keeping track in spreadsheets | "**One dashboard:** your whole portfolio in one place, instead of spreadsheets." |

**Extra line for 21+ properties:** "Built to handle a growing portfolio, with reports across every property."

**Extra line for letting agents and property managers:** "Manage properties for several landlords from one account." [confirm]

**Main button:** "Book my free demo". Second link: "See the features again".

Tone: helpful and confident. Never give tax advice or promise specific savings.

---

## 5. The LetFlows form

| Field | Type | Required |
|---|---|---|
| First name | Text | Yes |
| Last name | Text | Yes |
| Email | Email | Yes |
| Phone | Tel | No |
| Company / agency | Text | No (send "Private landlord" when blank) |
| I'm a… | Pre-filled from screen 3 (can change) | Yes |
| Number of properties | Pre-filled from screen 3 (can change) | Yes |
| Making Tax Digital applies to me | Chips: Yes, from April 2026 · Yes, from 2027 or later · Not sure · No | No |
| What do you use now? | Chips: Spreadsheets/paper, Another property software, An agent manages it, Nothing yet | No |
| When are you looking to start? | Chips: Now, In 1–3 months, Just researching | No |
| Consent | Checkbox, unticked | Yes |

**Consent wording** (linked to the Sterlix privacy policy): "I'd like Sterlix to contact me about a LetFlows demo and send me related information. I can unsubscribe at any time."

**Sent with the lead** through the existing Zoho connection:
- Product interest: **LetFlows**
- Everything from screen 3 (role, number of properties, biggest headaches) plus the form answers
- The event name, and the note "Registered at the Sterlix stand, {date}" plus any staff note

---

## 6. Follow-up emails

**Email 1: thank you (sent straight away)**

> Subject: Thanks for stopping by: your LetFlows demo
>
> Hi {First name},
>
> Thanks for visiting the Sterlix stand today. You told us you look after {properties} properties and {biggest headache} is the biggest headache. We'll be in touch within 2 working days to set up your LetFlows account and a short live demo using a set-up like yours.
>
> Want to choose a time now? {Booking link}
>
> The Sterlix team · +44 20 8004 3327 · hello@sterlixit.co.uk · letflows.com

**Email 2: account and demo (when you're ready)**

> Subject: Your LetFlows account is ready
>
> Hi {First name},
>
> Your LetFlows account is set up. Create your password here: {sign-up link}. Then pick a 30-minute slot for your live demo: {booking link}. We'll show you {features} with a couple of your own properties added.

---

## 7. Staff mode and event day

- Staff mode shows LetFlows leads with their role, number of properties, headaches and MTD answer, and a note box per lead (e.g. "Hot: 40 units, MTD from April").
- Keep a laptop logged in to a LetFlows demo account with sample properties, so visitors who want more can see the real thing.
- Print a QR code to `/letflows` for the stand.
- Before doors open, send one test lead and check it arrives tagged **LetFlows** with all its answers, then delete it.

---

## 8. Acceptance checklist

- [ ] LetFlows features confirmed and every **[confirm]** removed
- [ ] All 6 showcase screens show real LetFlows screenshots or recordings, and swipe smoothly
- [ ] "Your LetFlows result" changes correctly with the answers (try a landlord with 1 property, and an agent with 100+)
- [ ] Role and number of properties are pre-filled in the form
- [ ] The form can't be sent without first name, last name, email, role, number of properties and consent
- [ ] A test lead arrives tagged LetFlows with every answer
- [ ] With Wi-Fi off, the visitor still sees Thank you and the lead sends later
- [ ] `/letflows` works on its own from the QR code on a phone
- [ ] All copy is UK English

---

## 9. Build prompt (paste into Claude Code or give to a developer)

```text
Add a LetFlows section at /letflows to our existing event site (the one with the Website Health Check).
Reuse the existing stack, styling, Zoho lead integration, offline queue, kiosk mode and staff mode — don't
change them. Put all LetFlows copy in config/letflows.ts so it's easy to edit (features are still being
confirmed). Include a showMtd flag: when false, hide every Making Tax Digital option and card.

FLOW (6 screens):
1) Welcome — LetFlows logo, "Property management, simplified: your lettings in one place", button
   "See what LetFlows does", small "Built by Sterlixit · letflows.com".
2) Showcase — 6 swipeable screens, each: real screenshot or short muted looping video from /public/letflows/,
   title, benefit line, 3 bullets; progress dots; "Skip to my results".
   1 Portfolio dashboard — "Every property, unit and tenancy in one place." — All properties at a glance ·
     Occupied and vacant units · Key dates coming up
   2 Rent tracking — "See who's paid, who's late and what's due." — Rent due and received · Arrears flagged
     early · Payment history per tenant
   3 Tenants & tenancies — "Tenant details and tenancy dates, always up to date." — Tenant records and
     contacts · Start, end and renewal dates · Tenancy documents stored securely
   4 Maintenance — "Log repairs and track every job." — Tenants or staff report issues · Assign contractors ·
     Track each job to done
   5 Compliance certificates — "Never miss a gas safety, EICR or EPC renewal." — All certificates in one
     place · Reminders before expiry · Ready when you need to show them
   6 Making Tax Digital & reports — "Get ready for Making Tax Digital for Income Tax." — Income and expenses
     kept digitally · Portfolio and arrears reports · Ready for quarterly updates
3) About your properties — chips: "I'm a…" (Landlord, Letting agent, Property manager, Other)*, "How many
   properties?" (1, 2–5, 6–20, 21–100, 100+)*, "What's the biggest headache?" multi (Chasing rent, Repairs and
   maintenance, Certificate renewals, Tenant paperwork, Tax and Making Tax Digital, Keeping track in
   spreadsheets).
4) Your LetFlows result — headline "Here's how LetFlows would work for your {n} properties." (agents/property
   managers: "…for the {n} properties you manage."). Three cards from the headache answers (mapping in config;
   if fewer than 3, fill with Rent tracking, Compliance certificates, Maintenance). Extra line for 21+:
   "Built to handle a growing portfolio, with reports across every property." Extra line for agents/property
   managers: "Manage properties for several landlords from one account." Button "Book my free demo", link
   "See the features again". Animate the cards in, as the health check does with its scores. No tax advice,
   no promised savings.
5) Form — first name*, last name*, email*, phone, company/agency (send "Private landlord" if blank), role* and
   properties* (pre-filled from step 3, editable), "Making Tax Digital applies to me" (Yes, from April 2026 /
   Yes, from 2027 or later / Not sure / No), current solution (Spreadsheets/paper, Another property software,
   An agent manages it, Nothing yet), timeframe (Now, In 1–3 months, Just researching), consent* unticked:
   "I'd like Sterlix to contact me about a LetFlows demo and send me related information. I can unsubscribe at
   any time." linking to our privacy policy.
6) Thank you — "You're on the list. We'll email you within 2 working days to set up your LetFlows demo." QR
   code to the booking link, "Back to start"; return to the event home after 20 s.

LEAD: send through the existing Zoho integration with product interest "LetFlows", all step-3 answers, form
answers, event name and note "Registered at the Sterlix stand, {date}". Add new field names to the existing
Zoho field config in one place.

STAFF MODE: show LetFlows leads with role, properties, headaches and MTD answer; note box per lead.

Touch targets ≥ 56 px, text ≥ 16 px, UK English. Logo returns to the event home; 90 s idle returns there too.

DONE WHEN: the acceptance checklist in the plan file passes.
```
