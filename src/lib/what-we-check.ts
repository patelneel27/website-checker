// Copy for the welcome screen and the "What we check" explainer. Written so a visitor (or a
// team member asked on the stand) can read it and understand every part of the check.

export type CheckArea = {
  id: string;
  icon: "speed" | "search" | "share" | "schema" | "lock" | "access" | "phone" | "map";
  title: string;
  short: string;
  what: string;
  why: string;
  good: string;
};

export const CHECK_AREAS: CheckArea[] = [
  {
    id: "speed",
    icon: "speed",
    title: "Mobile speed",
    short: "How fast your site loads on a phone",
    what: "We run Google's own Lighthouse test on a simulated mid-range phone over a mobile connection, and measure how long your main content takes to appear, how quickly the page responds to taps and whether it jumps around while loading.",
    why: "Most visitors arrive on a phone. Slow pages lose them before they read a word, and Google uses speed when ranking sites.",
    good: "A Performance score of 90+ and main content showing in under 2.5 seconds.",
  },
  {
    id: "seo",
    icon: "search",
    title: "SEO basics",
    short: "Titles, descriptions and headings Google reads",
    what: "We read your page the way Google does: the page title, the description under your link, your main heading, sub-headings, word count, links and image descriptions (alt text).",
    why: "These are the signals Google uses to understand what you do, and they decide how your link looks in search results.",
    good: "A clear 10–60 character title, a 50–160 character description, one main heading and 300+ words.",
  },
  {
    id: "previews",
    icon: "share",
    title: "Google & social previews",
    short: "How you look in search and when shared",
    what: "We show you how your link appears in Google on a phone, and how it looks when someone shares it on Facebook, LinkedIn, WhatsApp or X, including whether your preview image actually loads.",
    why: "Your search result and shared links are often a customer's first impression. A missing image or cut-off title means fewer clicks.",
    good: "A title, description and working preview image (og:title, og:description, og:image) on every key page.",
  },
  {
    id: "schema",
    icon: "schema",
    title: "Structured data",
    short: "Schema that unlocks rich results",
    what: "We look for structured data (schema.org): hidden labels that tell Google exactly what your business is, where it is, your opening hours, reviews and FAQs.",
    why: "Schema lets Google show rich results such as star ratings, FAQs, your address and opening hours, which make your listing stand out.",
    good: "At least Organization or LocalBusiness and WebSite schema, plus FAQ or Product schema where it fits.",
  },
  {
    id: "security",
    icon: "lock",
    title: "Security & standards",
    short: "The https padlock and modern best practice",
    what: "We check your site loads securely over https with a valid certificate, and run Google's Best Practices audit for things like browser errors and outdated code.",
    why: "Browsers warn visitors about insecure sites, and broken or outdated code can stop forms and features working.",
    good: "The padlock on every page and a Best Practices score of 90+.",
  },
  {
    id: "accessibility",
    icon: "access",
    title: "Accessibility",
    short: "How easy your site is for everyone",
    what: "We run Google's accessibility audit: text contrast, button and link labels, form labels, image descriptions and heading order.",
    why: "Millions of people in the UK live with a disability. An accessible site reaches more customers and is easier for everyone to use.",
    good: "An Accessibility score of 90+.",
  },
  {
    id: "mobile",
    icon: "phone",
    title: "Mobile-friendly",
    short: "Built for phone screens",
    what: "We check your site is set up for mobile screens, that text is readable and that buttons aren't too small or too close together to tap.",
    why: "Google looks at the mobile version of your site first when ranking it. If it's awkward on a phone, visitors leave.",
    good: "A mobile viewport and comfortable tap targets throughout.",
  },
  {
    id: "findability",
    icon: "map",
    title: "Findability",
    short: "Can Google find and index every page?",
    what: "We check your sitemap and robots.txt, that the page isn't hidden from Google (noindex), that it has a canonical tag, a favicon and how quickly your server responds.",
    why: "If Google can't find or isn't allowed to show your pages, nothing else matters. These small settings are easy to get wrong.",
    good: "A sitemap, a robots.txt, no accidental noindex, a canonical tag and a server response under 0.8 seconds.",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Is it really free?",
    a: "Yes. The check and the emailed report are completely free, with no obligation.",
  },
  {
    q: "Do you need access to my website?",
    a: "No. We only look at your public homepage, exactly as any visitor or Google sees it. Nothing behind a login, and we never change anything.",
  },
  {
    q: "Where do the scores come from?",
    a: "The four scores come from Google Lighthouse, the same test Google's PageSpeed Insights uses. Our own checks add the SEO, social and findability details.",
  },
  {
    q: "Why might my score differ from another tool?",
    a: "Lighthouse simulates a mid-range phone on a mobile connection, so scores are stricter than a desktop test and can move a few points between runs.",
  },
  {
    q: "What happens to my details?",
    a: "We use them only to email your report and, if you'd like, follow up about it. You can unsubscribe at any time, and we never sell your data.",
  },
  {
    q: "What happens next?",
    a: "You'll get the full report by email with your top 3 fixes. If you'd like help, book a free 30-minute strategy call and we'll walk you through exactly what we'd do.",
  },
];
