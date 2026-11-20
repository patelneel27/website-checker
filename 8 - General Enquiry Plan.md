# General Enquiry: Plan & Prompt

A section of our event site (same subdomain as the Website Health Check) at **`/enquiry`**. It's the catch-all: when a visitor wants something that isn't the health check, Staffmain or LetFlows, or **when the team isn't sure where a visitor fits**, they use this. The visitor (or a team member on their behalf) sees our services, picks what they need, and leaves their details. The team follows up after the event.

Already in place and reused as it is: the event site, the Zoho CRM connection, the offline queue, kiosk mode and staff mode. This plan only covers what's new for the general enquiry.

This file has two parts:

1. **The plan** (sections 1–7).
2. **A ready-to-paste build prompt** for Claude Code or a developer (section 8).

---

## 1. Goal

| Item | Target |
|---|---|
| Purpose | Capture every other conversation as a lead, so no visitor leaves without their details taken |
| When to use it | The visitor wants a service (a website, branding, an app, marketing…), or the team isn't sure which section fits |
| Who fills it in | The visitor, or a team member while talking to them |
| Time | Under 1 minute |
| Success | No interested visitor leaves without being in the system |

**Rule for the team:** if in doubt, use General Enquiry. It's always the right answer when you're not sure.

---

## 2. User flow (4 screens)

1. **Welcome:** Sterlixit logo, "How can we help?", and the line "Tell us what you're looking for and we'll get back to you within 2 working days." Button: "Start".
2. **Our services (pick any):** 7 big cards, each with an icon, the service name and one line (section 3). Plus two extra cards: "Our software (Staffmain / LetFlows)" and "Something else / not sure". Button: "Next".
3. **Your details:** the General Enquiry form (section 4).
4. **Thank you:** "Thanks. We'll be in touch within 2 working days." QR code to the booking page ("Want to talk sooner? Book a free strategy call"), and "Back to start". Returns to the event home after 20 seconds.

**Shortcut for the team:** a "Quick enquiry" button in staff mode opens screen 3 straight away with a services picker at the top, so a team member can take details in 30 seconds during a busy moment.

---

## 3. Services we show

| Service | One line on the card |
|---|---|
| Web Design & Development | "Fast, premium websites that work on every screen." |
| Graphics & Branding | "Logos, brand identity and design that people remember." |
| Custom SaaS & IT | "Software built around how your business works." |
| Digital Marketing | "SEO, social and campaigns that bring the right customers." |
| MVP Development | "Turn your app or software idea into a first working version." |
| E-Commerce Solutions | "Online shops that are easy to run and easy to buy from." |
| Support & Maintenance | "We keep your website and software secure and up to date." |
| Our software (Staffmain / LetFlows) | "HR management and property management software, built by us." |
| Something else / not sure | "Tell us what you need and we'll point you the right way." |

Picking "Our software" shows two small chips underneath: Staffmain · LetFlows (pick any).

---

## 4. The General Enquiry form

| Field | Type | Required |
|---|---|---|
| Services | Pre-filled from screen 2 (can change) | Yes (at least one) |
| First name | Text | Yes |
| Last name | Text | Yes |
| Email | Email | Yes |
| Phone | Tel | No |
| Company | Text | No |
| Website (if you have one) | URL | No |
| Tell us a bit more | Text box, 2–3 lines, placeholder: "e.g. We need a new website for our clinic by spring" | No |
| Budget range | Chips: Under £2k · £2k–£5k · £5k–£15k · £15k+ · Not sure yet | No |
| When are you looking to start? | Chips: Now, In 1–3 months, Just researching | No |
| Best way to contact you | Chips: Email · Phone · Either | No |
| Consent | Checkbox, unticked | Yes |

**Consent wording** (linked to the Sterlix privacy policy): "I'd like Sterlix to contact me about my enquiry and send me related information. I can unsubscribe at any time."

**Sent with the lead** through the existing Zoho connection:
- Product interest: **General Enquiry**, plus the services picked (and Staffmain / LetFlows if chosen)
- All form answers
- Who filled it in: "Visitor" or "Team member" (set automatically when the staff-mode "Quick enquiry" button is used)
- The event name, and the note "Registered at the Sterlix stand, {date}" plus any staff note

Never quote a price on the stand. The budget chips help us prepare; they're not a quote.

---

## 5. Follow-up email

**Thank you (sent straight away)**

> Subject: Thanks for your enquiry
>
> Hi {First name},
>
> Thanks for talking to us at the Sterlix stand today. You're interested in {services}. A member of our team will be in touch within 2 working days {by email / by phone}.
>
> Want to talk sooner? Book a free strategy call: {Booking link}
>
> The Sterlix team · +44 20 8004 3327 · hello@sterlixit.co.uk · www.sterlixit.co.uk

**After the event:** the team reviews each enquiry within 2 working days. Enquiries that pick Staffmain or LetFlows are handed to whoever handles that product.

---

## 6. Staff mode and event day

- Staff mode shows General Enquiry leads with their services, budget and timeframe, and a note box per lead.
- The **"Quick enquiry"** button (section 2) is on the staff-mode home for fast capture.
- Print a QR code to `/enquiry` for the stand.
- Before doors open, send one test enquiry as a visitor and one as a team member; check both arrive tagged **General Enquiry** with the right services, then delete them.

---

## 7. Acceptance checklist

- [ ] All 9 service cards show, can be picked in any combination, and "Our software" shows the Staffmain / LetFlows chips
- [ ] Services picked on screen 2 are pre-filled in the form
- [ ] The form can't be sent without at least one service, first name, last name, email and consent
- [ ] Staff-mode "Quick enquiry" opens the form directly and tags the lead "Team member"
- [ ] A test enquiry arrives tagged General Enquiry with every answer and service
- [ ] With Wi-Fi off, the visitor still sees Thank you and the enquiry sends later
- [ ] `/enquiry` works on its own from the QR code on a phone
- [ ] All copy is UK English

---

## 8. Build prompt (paste into Claude Code or give to a developer)

```text
Add a General Enquiry section at /enquiry to our existing event site (the one with the Website Health Check).
Reuse the existing stack, styling, Zoho lead integration, offline queue, kiosk mode and staff mode — don't
change them. Put all copy in config/enquiry.ts so it's easy to edit.

FLOW (4 screens):
1) Welcome — Sterlixit logo, "How can we help?", "Tell us what you're looking for and we'll get back to you
   within 2 working days.", button "Start".
2) Services — multi-select cards (icon, name, one line):
   Web Design & Development — "Fast, premium websites that work on every screen."
   Graphics & Branding — "Logos, brand identity and design that people remember."
   Custom SaaS & IT — "Software built around how your business works."
   Digital Marketing — "SEO, social and campaigns that bring the right customers."
   MVP Development — "Turn your app or software idea into a first working version."
   E-Commerce Solutions — "Online shops that are easy to run and easy to buy from."
   Support & Maintenance — "We keep your website and software secure and up to date."
   Our software (Staffmain / LetFlows) — "HR management and property management software, built by us."
     (when picked, show chips Staffmain · LetFlows, multi)
   Something else / not sure — "Tell us what you need and we'll point you the right way."
   Button "Next" (needs at least one).
3) Form — services* (pre-filled from step 2, editable), first name*, last name*, email*, phone, company,
   website (URL), "Tell us a bit more" (textarea, placeholder "e.g. We need a new website for our clinic by
   spring"), budget (Under £2k, £2k–£5k, £5k–£15k, £15k+, Not sure yet), timeframe (Now, In 1–3 months, Just
   researching), contact preference (Email, Phone, Either), consent* unticked: "I'd like Sterlix to contact me
   about my enquiry and send me related information. I can unsubscribe at any time." linking to our privacy
   policy.
4) Thank you — "Thanks. We'll be in touch within 2 working days.", QR code to the booking link with "Want to
   talk sooner? Book a free strategy call", "Back to start"; return to the event home after 20 s.

STAFF MODE: add a "Quick enquiry" button on the staff-mode home that opens step 3 directly with a services
picker at the top and tags the lead "Team member" (visitor-submitted leads are tagged "Visitor"). List General
Enquiry leads with services, budget and timeframe; note box per lead.

LEAD: send through the existing Zoho integration with product interest "General Enquiry", the services
picked (plus Staffmain/LetFlows if chosen), all form answers, filled-in-by, event name and note "Registered at
the Sterlix stand, {date}". Add new field names to the existing Zoho field config in one place.

Touch targets ≥ 56 px, text ≥ 16 px, UK English. Logo returns to the event home; 90 s idle returns there too.

DONE WHEN: the acceptance checklist in the plan file passes.
```
