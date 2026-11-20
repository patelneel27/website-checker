import "server-only";
import { PRODUCT, serviceName, type ServiceId } from "@/config/enquiry";
import { config, CONTACT, enquiryLinks } from "../config";
import { createProductService, ukDate } from "../product-leads/service";
import { joinNames } from "./schema";
import { enquiryStore, type EnquiryLead } from "./store";

/** Service names, with "Our software" replaced by the products picked. */
function interests(l: EnquiryLead) {
  return l.services.flatMap((id: ServiceId) =>
    id === "software" && l.software.length ? l.software : [id === "software" ? "our software" : id === "other" ? "something else" : serviceName(id)],
  );
}

export const enquiry = createProductService<EnquiryLead>({
  key: "enquiry",
  name: PRODUCT,
  websiteLabel: CONTACT.website,
  links: () => ({ bookingEmail: enquiryLinks().bookingEmail, websiteEmail: enquiryLinks().websiteEmail }),
  utmSource: () => config.enquiry.utmSource,
  store: enquiryStore,

  thanksParagraph: (l) => {
    const how = l.contactPref === "Email" ? " by email" : l.contactPref === "Phone" ? " by phone" : "";
    return `Thanks for talking to us at the Sterlixit stand today. You're interested in ${joinNames(interests(l))}. A member of our team will be in touch within 2 working days${how}.`;
  },
  thanksWording: (l) => ({
    subject: "Thanks for your enquiry",
    heading: "Thanks for your enquiry",
    preview: "A member of our team will be in touch within 2 working days.",
    ctaIntro: "Want to talk sooner?",
    ctaLabel: "Book a free strategy call",
    reason: `You're getting this email because you made an enquiry at our stand at ${l.eventName}.`,
  }),

  zoho: (l) => {
    const f = config.zohoFields;
    const names = l.services.map((id: ServiceId) => serviceName(id));
    return {
      company: l.company ?? `${l.firstName} ${l.lastName}`,
      website: l.website,
      tags: ["General Enquiry", l.eventName, ...l.software, l.filledBy === "Team member" ? "Team member" : ""],
      fields: {
        [f.product]: "General Enquiry",
        [f.services]: [...names, ...l.software].join(", "),
        [f.budget]: l.budget,
        [f.timeframe]: l.timeframe,
        [f.contactPref]: l.contactPref,
        [f.filledBy]: l.filledBy,
      },
      description: [
        `General enquiry: registered at the Sterlixit stand, ${ukDate(l.capturedAt)} (${l.eventName})`,
        `Filled in by: ${l.filledBy}`,
        "",
        "Product interest: General Enquiry",
        `Services: ${names.join(", ")}`,
        ...(l.software.length ? [`Software: ${l.software.join(", ")}`] : []),
        `Tell us more: ${l.message ?? "not given"}`,
        `Website: ${l.website ?? "not given"}`,
        `Budget: ${l.budget ?? "not given"} (not a quote)`,
        `Looking to start: ${l.timeframe ?? "not given"}`,
        `Best way to contact: ${l.contactPref ?? "not given"}`,
        ...(l.note ? ["", `Staff note: ${l.note}`] : []),
        "",
        `Consent to contact given: ${l.consentAt.toISOString()}`,
      ].join("\n"),
    };
  },

  staffDetails: (l) => [
    [l.filledBy === "Team member" ? "Taken by the team" : "Visitor", l.budget, l.timeframe, l.contactPref && `prefers ${l.contactPref.toLowerCase()}`]
      .filter(Boolean)
      .join(" · "),
    `Services: ${joinNames(interests(l))}`,
    ...(l.message ? [`“${l.message}”`] : []),
  ],

  csvRow: (l) => ({
    Company: l.company ?? "",
    Website: l.website ?? "",
    Services: l.services.map((id: ServiceId) => serviceName(id)).join("; "),
    Software: l.software.join("; "),
    Message: l.message ?? "",
    Budget: l.budget ?? "",
    Timeframe: l.timeframe ?? "",
    "Contact by": l.contactPref ?? "",
    "Filled in by": l.filledBy,
  }),
});
