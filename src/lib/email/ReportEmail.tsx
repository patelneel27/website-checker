/* eslint-disable react/no-unescaped-entities -- plain apostrophes are fine in email HTML */
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { cut, seoFacts, type FactStatus } from "../seo-facts";
import { BAND_COLOURS, BAND_LABELS, CATEGORY_LABELS, CATEGORY_MEANINGS, CATEGORY_ORDER, bandFor } from "../scores";
import type { ScanResult } from "../types";

export type ReportEmailProps = {
  firstName: string;
  scan: ScanResult;
  bookingUrl: string;
  eventName: string;
  logoUrl: string | null;
  /** Visitor's favicon (cid: reference), or null */
  faviconUrl?: string | null;
  contact: { phone: string; email: string; address: string; website: string; websiteUrl: string };
};

const BRAND = { blue: "#1362FB", deep: "#1433D6", navy: "#0A1342", sky: "#5C9BFF", body: "#3A4670", bg: "#EEF3FF" };
const HEADING_FONT = "Sora, 'Segoe UI', Arial, Helvetica, sans-serif";
const BODY_FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, Helvetica, sans-serif";

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ReportEmail({ firstName, scan, bookingUrl, eventName, logoUrl, faviconUrl, contact }: ReportEmailProps) {
  const site = displayUrl(scan.url);
  const scores = scan.scores;
  const hasScores = !!scores && CATEGORY_ORDER.some((k) => scores[k] != null);
  const lcp = scan.metrics?.lcpMs;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>{`Your website health check for ${site}: ${scan.summary}`}</Preview>
      <Body style={{ backgroundColor: BRAND.bg, margin: 0, padding: "24px 0", fontFamily: BODY_FONT, color: BRAND.body }}>
        <Container style={{ maxWidth: 600, width: "100%", backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          <Section style={{ padding: "24px 32px 20px", borderBottom: `4px solid ${BRAND.blue}` }}>
            <Row>
              {logoUrl ? (
                <Column style={{ width: 52, verticalAlign: "middle" }}>
                  <Img src={logoUrl} width="42" height="42" alt="Sterlixit" />
                </Column>
              ) : null}
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={{ margin: 0, color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 800, fontSize: 24, letterSpacing: "-0.3px" }}>
                  Sterlixit
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ padding: "32px 32px 8px" }}>
            <Heading as="h1" style={{ margin: "0 0 8px", color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 800, fontSize: 26, lineHeight: "32px" }}>
              Your website health check
            </Heading>
            <Text style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "24px" }}>
              Hi {firstName}, thanks for stopping by our stand at {eventName}. Here's the full report for{" "}
              <Link href={scan.url} style={{ color: BRAND.blue, fontWeight: 600 }}>
                {site}
              </Link>
              .
            </Text>
            <Section style={{ border: "2px solid #DCE3F5", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
              <Row>
                {faviconUrl ? (
                  <Column style={{ width: 48, verticalAlign: "middle" }}>
                    <Img src={faviconUrl} width="36" height="36" alt="" style={{ borderRadius: 6 }} />
                  </Column>
                ) : null}
                <Column style={{ verticalAlign: "middle" }}>
                  <Text style={{ margin: 0, fontSize: 16, lineHeight: "22px", fontWeight: 700, color: BRAND.navy }}>
                    {scan.site.title ?? site}
                  </Text>
                  <Text style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: BRAND.blue }}>{site}</Text>
                </Column>
              </Row>
            </Section>
            <Text style={{ margin: 0, padding: "14px 18px", backgroundColor: BRAND.bg, borderRadius: 12, fontSize: 16, lineHeight: "24px", color: BRAND.navy, fontWeight: 600 }}>
              {scan.summary}
            </Text>
          </Section>

          {/* Scores */}
          {hasScores ? (
            <Section style={{ padding: "16px 24px 0" }}>
              <Row>
                {CATEGORY_ORDER.map((k) => {
                  const value = scores![k];
                  const band = value == null ? null : bandFor(value);
                  const colours = band ? BAND_COLOURS[band] : { ring: "#C5CBE0", text: BRAND.body, tint: "#F4F6FB" };
                  return (
                    <Column key={k} style={{ width: "25%", padding: "0 6px", verticalAlign: "top" }}>
                      <div style={{ backgroundColor: colours.tint, borderRadius: 12, padding: "14px 4px", textAlign: "center", borderTop: `4px solid ${colours.ring}` }}>
                        <Text style={{ margin: 0, fontFamily: HEADING_FONT, fontSize: 30, fontWeight: 800, lineHeight: "36px", color: colours.text }}>
                          {value ?? "–"}
                        </Text>
                        <Text style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: BRAND.navy, lineHeight: "18px" }}>{CATEGORY_LABELS[k]}</Text>
                        <Text style={{ margin: "2px 0 0", fontSize: 12, color: colours.text, lineHeight: "16px" }}>{band ? BAND_LABELS[band] : "Not measured"}</Text>
                      </div>
                    </Column>
                  );
                })}
              </Row>
              <Text style={{ margin: "12px 8px 0", fontSize: 13, lineHeight: "20px", color: BRAND.body }}>
                {CATEGORY_ORDER.map((k) => `${CATEGORY_LABELS[k]}: ${CATEGORY_MEANINGS[k].toLowerCase()}.`).join(" ")} Scores are out
                of 100 and come from Google's Lighthouse mobile test.
                {lcp ? ` Your main content appeared in ${(lcp / 1000).toFixed(1)} s (under 2.5 s is good).` : ""}
              </Text>
            </Section>
          ) : (
            <Section style={{ padding: "16px 32px 0" }}>
              <Text style={{ margin: 0, fontSize: 15, lineHeight: "22px" }}>
                Google's speed test couldn't complete for your site this time, so this report covers our own checks. We'll happily
                run the full speed test with you on a call.
              </Text>
            </Section>
          )}

          {/* Top 3 fixes */}
          {scan.quickWins.length > 0 && (
            <Section style={{ padding: "24px 32px 0" }}>
              <Heading as="h2" style={{ margin: "0 0 12px", color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 20 }}>
                Your top {scan.quickWins.length === 1 ? "fix" : `${scan.quickWins.length} fixes`}
              </Heading>
              {scan.quickWins.map((w, i) => (
                <Row key={w.id} style={{ marginBottom: 12 }}>
                  <Column style={{ width: 40, verticalAlign: "top" }}>
                    <Text style={{ margin: 0, width: 28, height: 28, lineHeight: "28px", borderRadius: 14, backgroundColor: BRAND.blue, color: "#FFFFFF", textAlign: "center", fontWeight: 800, fontSize: 14 }}>
                      {i + 1}
                    </Text>
                  </Column>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text style={{ margin: 0, fontSize: 16, lineHeight: "23px", color: BRAND.navy, fontWeight: 700 }}>{w.title}</Text>
                    <Text style={{ margin: "4px 0 0", fontSize: 15, lineHeight: "22px" }}>
                      <strong style={{ color: BRAND.deep }}>How we'd fix it:</strong> {w.fix.replace(/^We'd /, "we'd ")}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* SEO at a glance */}
          {scan.seo && <SeoSection scan={scan} faviconUrl={faviconUrl ?? null} />}

          {/* Quick checks */}
          {scan.checks.length > 0 && (
            <Section style={{ padding: "20px 32px 0" }}>
              <Heading as="h2" style={{ margin: "0 0 8px", color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 20 }}>
                Quick checks
              </Heading>
              {scan.checks.map((c) => (
                <Text key={c.id} style={{ margin: "0 0 6px", fontSize: 15, lineHeight: "22px" }}>
                  <span style={{ color: c.pass ? BAND_COLOURS.good.text : BAND_COLOURS.average.text, fontWeight: 800 }}>{c.pass ? "✓" : "!"}</span>
                  &nbsp; {c.message}
                </Text>
              ))}
            </Section>
          )}

          {/* CTA */}
          <Section style={{ padding: "28px 32px", textAlign: "center" }}>
            <Text style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "24px", color: BRAND.navy }}>
              Want a hand with these? Book a free, no-obligation 30-minute strategy call and we'll walk you through exactly what we'd do.
            </Text>
            <Button
              href={bookingUrl}
              style={{ backgroundColor: BRAND.blue, color: "#FFFFFF", padding: "16px 28px", borderRadius: 12, fontWeight: 700, fontSize: 17, textDecoration: "none", display: "inline-block" }}
            >
              Book a free strategy call
            </Button>
          </Section>

          <Hr style={{ borderColor: "#DCE3F5", margin: 0 }} />

          <Section style={{ padding: "20px 32px 28px" }}>
            <Text style={{ margin: "0 0 4px", fontSize: 14, lineHeight: "21px", color: BRAND.navy, fontWeight: 700 }}>Sterlix IT</Text>
            <Text style={{ margin: 0, fontSize: 14, lineHeight: "21px" }}>
              <Link href={`tel:${contact.phone.replace(/\s/g, "")}`} style={{ color: BRAND.body }}>
                {contact.phone}
              </Link>{" "}
              ·{" "}
              <Link href={`mailto:${contact.email}`} style={{ color: BRAND.blue }}>
                {contact.email}
              </Link>
              <br />
              {contact.address}
              <br />
              <Link href={contact.websiteUrl} style={{ color: BRAND.blue }}>
                {contact.website}
              </Link>
            </Text>
            <Text style={{ margin: "16px 0 0", fontSize: 12, lineHeight: "18px", color: "#6B7596" }}>
              You're getting this email because you asked for your website report at our stand at {eventName}. To stop hearing from
              us, just reply with "unsubscribe".
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const FACT_COLOUR: Record<FactStatus, string> = {
  good: BAND_COLOURS.good.text,
  warn: BAND_COLOURS.average.text,
  bad: BAND_COLOURS.poor.text,
  neutral: BRAND.body,
};
const H2 = { margin: "0 0 12px", color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 20 } as const;
const H3 = { margin: "18px 0 8px", color: BRAND.navy, fontSize: 16, fontWeight: 700 } as const;

function SeoSection({ scan, faviconUrl }: { scan: ScanResult; faviconUrl: string | null }) {
  const seo = scan.seo!;
  const u = new URL(scan.url);
  const domain = u.hostname.replace(/^www\./, "");
  const s = seo.social;
  const shareImage = s.ogImage && s.ogImageWorks !== false ? s.ogImage : null;
  const facts = seoFacts(seo);

  return (
    <Section style={{ padding: "24px 32px 0" }}>
      <Heading as="h2" style={H2}>
        Your SEO at a glance
      </Heading>

      <Text style={H3}>How you look on Google</Text>
      <Section style={{ border: "1px solid #DADCE0", borderRadius: 10, padding: "12px 16px", fontFamily: "Arial, sans-serif" }}>
        <Row>
          {faviconUrl ? (
            <Column style={{ width: 30, verticalAlign: "middle" }}>
              <Img src={faviconUrl} width="20" height="20" alt="" />
            </Column>
          ) : null}
          <Column style={{ verticalAlign: "middle" }}>
            <Text style={{ margin: 0, fontSize: 13, color: "#4D5156", lineHeight: "18px" }}>
              {s.ogSiteName ?? domain} · {u.hostname}
            </Text>
          </Column>
        </Row>
        <Text style={{ margin: "6px 0 2px", fontSize: 18, color: "#1A0DAB", lineHeight: "24px" }}>
          {seo.title ? cut(seo.title, 60) : "No page title"}
        </Text>
        <Text style={{ margin: 0, fontSize: 14, color: "#4D5156", lineHeight: "20px" }}>
          {seo.description ? cut(seo.description, 160) : "No description: Google will pick some text from your page."}
        </Text>
      </Section>
      <Text style={{ margin: "6px 0 0", fontSize: 13, color: BRAND.body }}>
        Title: {seo.title ? `${seo.title.length} characters (10–60 is ideal)` : "missing"} · Description:{" "}
        {seo.description ? `${seo.description.length} characters (50–160 is ideal)` : "missing"}
      </Text>

      <Text style={H3}>How you look when shared on social media</Text>
      <Section style={{ border: "1px solid #DADDE1", borderRadius: 10, overflow: "hidden" }}>
        {shareImage ? (
          <Img src={shareImage} width="534" alt="" style={{ width: "100%", maxWidth: 534, height: "auto", display: "block" }} />
        ) : (
          <Text style={{ margin: 0, padding: "28px 16px", backgroundColor: BRAND.bg, textAlign: "center", fontSize: 15, fontWeight: 700, color: BAND_COLOURS.poor.text }}>
            {s.ogImage ? "Your preview image is broken" : "No preview image"}: shares of your site show no picture
          </Text>
        )}
        <Section style={{ backgroundColor: "#F2F3F5", padding: "10px 14px" }}>
          <Text style={{ margin: 0, fontSize: 12, color: "#606770", textTransform: "uppercase" }}>{domain}</Text>
          <Text style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1D2129" }}>{s.ogTitle ?? seo.title ?? "No title"}</Text>
          {(s.ogDescription ?? seo.description) && (
            <Text style={{ margin: 0, fontSize: 14, color: "#606770" }}>{cut((s.ogDescription ?? seo.description)!, 120)}</Text>
          )}
        </Section>
      </Section>
      <Text style={{ margin: "6px 0 0", fontSize: 13, color: BRAND.body }}>
        og:title {s.ogTitle ? "✓" : "missing"} · og:image {shareImage ? "✓" : s.ogImage ? "broken" : "missing"} · og:description{" "}
        {s.ogDescription ? "✓" : "missing"} · X card {s.twitterCard ? `✓ (${s.twitterCard})` : "missing"}
      </Text>

      <Text style={H3}>Structured data (schema)</Text>
      <Text style={{ margin: 0, fontSize: 15, lineHeight: "22px", color: seo.schema.types.length ? BRAND.navy : BAND_COLOURS.poor.text, fontWeight: 600 }}>
        {seo.schema.types.length
          ? `Found: ${seo.schema.types.join(", ")} (${seo.schema.formats.join(", ")})`
          : "None found. Schema helps Google show rich results like your address, reviews, FAQs and breadcrumbs."}
      </Text>

      <Text style={H3}>On-page facts</Text>
      {facts.map((f) => (
        <Row key={f.label}>
          <Column style={{ width: "45%", padding: "4px 0", fontSize: 14, color: BRAND.body, verticalAlign: "top" }}>{f.label}</Column>
          <Column style={{ padding: "4px 0", fontSize: 14, fontWeight: 700, color: FACT_COLOUR[f.status], verticalAlign: "top" }}>
            {f.value}
            {f.note ? <span style={{ fontWeight: 400, color: BRAND.body }}> · {f.note}</span> : null}
          </Column>
        </Row>
      ))}
    </Section>
  );
}

export function reportPlainText({ firstName, scan, bookingUrl, eventName, contact }: ReportEmailProps): string {
  const lines: string[] = [];
  const site = displayUrl(scan.url);
  lines.push(`YOUR WEBSITE HEALTH CHECK: ${site}`, "");
  lines.push(`Hi ${firstName}, thanks for stopping by our stand at ${eventName}. Here's the full report for ${site}.`, "");
  lines.push(scan.summary, "");
  if (scan.scores && CATEGORY_ORDER.some((k) => scan.scores![k] != null)) {
    lines.push("SCORES (out of 100, Google Lighthouse mobile test)");
    for (const k of CATEGORY_ORDER) {
      const v = scan.scores[k];
      lines.push(`- ${CATEGORY_LABELS[k]}: ${v ?? "not measured"}${v != null ? ` (${BAND_LABELS[bandFor(v)]})` : ""}: ${CATEGORY_MEANINGS[k]}`);
    }
    if (scan.metrics?.lcpMs) lines.push(`Your main content appeared in ${(scan.metrics.lcpMs / 1000).toFixed(1)} s (under 2.5 s is good).`);
    lines.push("");
  }
  if (scan.quickWins.length) {
    lines.push("YOUR TOP FIXES");
    scan.quickWins.forEach((w, i) => {
      lines.push(`${i + 1}. ${w.title}`, `   How we'd fix it: ${w.fix.replace(/^We'd /, "we'd ")}`);
    });
    lines.push("");
  }
  if (scan.seo) {
    const seo = scan.seo;
    lines.push("YOUR SEO AT A GLANCE");
    lines.push(`Google title: ${seo.title ?? "missing"}`);
    lines.push(`Google description: ${seo.description ?? "missing"}`);
    lines.push(
      `Social sharing: og:title ${seo.social.ogTitle ? "yes" : "missing"}, og:image ${seo.social.ogImage ? (seo.social.ogImageWorks === false ? "broken" : "yes") : "missing"}, X card ${seo.social.twitterCard ?? "missing"}`,
    );
    lines.push(`Structured data (schema): ${seo.schema.types.length ? seo.schema.types.join(", ") : "none found"}`);
    for (const f of seoFacts(seo)) lines.push(`- ${f.label}: ${f.value}${f.note ? ` (${f.note})` : ""}`);
    lines.push("");
  }
  if (scan.checks.length) {
    lines.push("QUICK CHECKS");
    scan.checks.forEach((c) => lines.push(`${c.pass ? "[OK]" : "[!] "} ${c.message}`));
    lines.push("");
  }
  lines.push("Book a free strategy call:", bookingUrl, "");
  lines.push("Sterlix IT", `${contact.phone} · ${contact.email}`, contact.address, contact.website, "");
  lines.push(`You're getting this email because you asked for your website report at our stand at ${eventName}. To stop hearing from us, just reply with "unsubscribe".`);
  return lines.join("\n");
}
