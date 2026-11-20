// All General Enquiry copy lives here so it's easy to edit. UK English throughout.
// Safe to import on the client and the server.

export const PRODUCT = "General Enquiry";

export const WELCOME = {
  headline: ["How can we", "help?"],
  subline: "Tell us what you're looking for and we'll get back to you within 2 working days.",
  cta: "Start",
  rule: "Not sure which demo fits? This is always the right place.",
};

export const SERVICES = [
  { id: "web", name: "Web Design & Development", line: "Fast, premium websites that work on every screen." },
  { id: "branding", name: "Graphics & Branding", line: "Logos, brand identity and design that people remember." },
  { id: "saas", name: "Custom SaaS & IT", line: "Software built around how your business works." },
  { id: "marketing", name: "Digital Marketing", line: "SEO, social and campaigns that bring the right customers." },
  { id: "mvp", name: "MVP Development", line: "Turn your app or software idea into a first working version." },
  { id: "ecommerce", name: "E-Commerce Solutions", line: "Online shops that are easy to run and easy to buy from." },
  { id: "support", name: "Support & Maintenance", line: "We keep your website and software secure and up to date." },
  { id: "software", name: "Our software (StaffMain / LetFlows)", line: "HR management and property management software, built by us." },
  { id: "other", name: "Something else / not sure", line: "Tell us what you need and we'll point you the right way." },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export const SERVICE_IDS = SERVICES.map((s) => s.id) as [ServiceId, ...ServiceId[]];
export const serviceName = (id: ServiceId) => SERVICES.find((s) => s.id === id)!.name;

/** Shown under "Our software" when it's picked. */
export const SOFTWARE = ["StaffMain", "LetFlows"] as const;
export type Software = (typeof SOFTWARE)[number];

export const SERVICES_SCREEN = {
  eyebrow: "Our services",
  headline: ["What are you", "looking for?"],
  subline: "Pick as many as you like.",
  cta: "Next",
  needed: "Pick at least one to carry on.",
  softwareLabel: "Which software?",
};

export const BUDGETS = ["Under £2k", "£2k–£5k", "£5k–£15k", "£15k+", "Not sure yet"] as const;
export const TIMEFRAMES = ["Now", "In 1–3 months", "Just researching"] as const;
export const CONTACT_PREFS = ["Email", "Phone", "Either"] as const;
export const FILLED_BY = ["Visitor", "Team member"] as const;

export const FORM = {
  eyebrow: "Your details",
  headline: ["Where can we", "reach you?"],
  subline: "A member of our team will be in touch within 2 working days.",
  quickEyebrow: "Quick enquiry · filled in by the team",
  servicesLabel: "What they're interested in",
  messageLabel: "Tell us a bit more",
  messagePlaceholder: "e.g. We need a new website for our clinic by spring",
  budgetLabel: "Budget range",
  budgetHint: "This helps us prepare. It's not a quote.",
  consent: "I'd like Sterlixit (Sterlix IT Ltd) to contact me about my enquiry and send me related information. I can unsubscribe at any time.",
  submit: "Send my enquiry",
};

export const THANKS = {
  headline: ["Thanks.", "We’ll be in touch."],
  text: "A member of our team will be in touch within 2 working days.",
  qrTitle: "Want to talk sooner?",
  qrText: "Book a free strategy call: scan with your phone camera to pick a time.",
  back: "Back to start",
  returnAfterS: 20,
};
