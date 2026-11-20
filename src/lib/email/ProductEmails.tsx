/* eslint-disable react/no-unescaped-entities -- plain apostrophes are fine in email HTML */
import { Body, Button, Column, Container, Head, Heading, Hr, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";

// Demo follow-up emails for a product showcase (StaffMain, LetFlows…), styled to match the
// Website Health Check report email.

const BRAND = { blue: "#1362FB", navy: "#0A1342", body: "#3A4670", bg: "#EEF3FF", line: "#DCE3F5", green: "#067A3E" };
const HEADING_FONT = "Sora, 'Segoe UI', Arial, Helvetica, sans-serif";
const BODY_FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, Helvetica, sans-serif";
const P = { margin: "0 0 16px", fontSize: 16, lineHeight: "24px" } as const;

type Contact = { phone: string; email: string; address: string; website: string; websiteUrl: string };

export type EmailProduct = { name: string; websiteUrl: string; websiteLabel: string };

type Shared = {
  product: EmailProduct;
  firstName: string;
  logoUrl: string | null;
  eventName: string;
  contact: Contact;
};

function Shell({ preview, children, footerReason, ...s }: Shared & { preview: string; children: React.ReactNode; footerReason: string }) {
  return (
    <Html lang="en-GB">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: BRAND.bg, margin: 0, padding: "24px 0", fontFamily: BODY_FONT, color: BRAND.body }}>
        <Container style={{ maxWidth: 600, width: "100%", backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" }}>
          <Section style={{ padding: "24px 32px 20px", borderBottom: `4px solid ${BRAND.blue}` }}>
            <Row>
              {s.logoUrl ? (
                <Column style={{ width: 52, verticalAlign: "middle" }}>
                  <Img src={s.logoUrl} width="42" height="42" alt="Sterlixit" />
                </Column>
              ) : null}
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={{ margin: 0, color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 800, fontSize: 24, letterSpacing: "-0.3px" }}>
                  Sterlixit
                </Text>
              </Column>
              <Column style={{ verticalAlign: "middle", textAlign: "right" }}>
                <Text style={{ margin: 0, color: BRAND.blue, fontWeight: 700, fontSize: 14 }}>{s.product.name}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ padding: "32px 32px 8px" }}>{children}</Section>

          <Hr style={{ borderColor: BRAND.line, margin: "16px 0 0" }} />
          <Section style={{ padding: "20px 32px 28px" }}>
            <Text style={{ margin: "0 0 4px", fontSize: 14, lineHeight: "21px", color: BRAND.navy, fontWeight: 700 }}>The Sterlixit team</Text>
            <Text style={{ margin: 0, fontSize: 14, lineHeight: "21px" }}>
              <Link href={`tel:${s.contact.phone.replace(/\s/g, "")}`} style={{ color: BRAND.body }}>
                {s.contact.phone}
              </Link>{" "}
              ·{" "}
              <Link href={`mailto:${s.contact.email}`} style={{ color: BRAND.blue }}>
                {s.contact.email}
              </Link>
              <br />
              <Link href={s.product.websiteUrl} style={{ color: BRAND.blue }}>
                {s.product.websiteLabel}
              </Link>
            </Text>
            <Text style={{ margin: "16px 0 0", fontSize: 12, lineHeight: "18px", color: "#6B7596" }}>
              Sterlix IT Ltd · {s.contact.address}. {footerReason} To stop hearing from us, just reply with "unsubscribe".
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      href={href}
      style={{ backgroundColor: BRAND.navy, color: "#FFFFFF", padding: "16px 28px", borderRadius: 12, fontWeight: 700, fontSize: 17, textDecoration: "none", display: "inline-block" }}
    >
      {children}
    </Button>
  );
}

// ---- Email 1: thank you (sent straight away) -----------------------------------------------------

export type ThanksEmailProps = Shared & {
  /** The personal paragraph, e.g. "Thanks for visiting… We'll be in touch within 2 working days…" */
  paragraph: string;
  bookingUrl: string;
  /** Wording overrides, e.g. for a general enquiry rather than a demo. */
  wording?: ThanksWording;
};

export type ThanksWording = { subject?: string; heading?: string; preview?: string; ctaIntro?: string; ctaLabel?: string; reason?: string };

export const thanksSubject = (p: EmailProduct, w?: ThanksWording) => w?.subject ?? `Thanks for stopping by: your ${p.name} demo`;

const reason = (p: Shared) => `You're getting this email because you registered for a ${p.product.name} demo at our stand at ${p.eventName}.`;

export function ThanksEmail(p: ThanksEmailProps) {
  return (
    <Shell
      {...p}
      preview={p.wording?.preview ?? `We'll be in touch within 2 working days to set up your ${p.product.name} demo.`}
      footerReason={p.wording?.reason ?? reason(p)}
    >
      <Heading as="h1" style={{ margin: "0 0 16px", color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 800, fontSize: 26, lineHeight: "32px" }}>
        {p.wording?.heading ?? `You're on the list for a ${p.product.name} demo`}
      </Heading>
      <Text style={P}>Hi {p.firstName},</Text>
      <Text style={P}>{p.paragraph}</Text>
      <Text style={{ ...P, color: BRAND.navy, fontWeight: 700 }}>{p.wording?.ctaIntro ?? "Want to choose a time now?"}</Text>
      <CtaButton href={p.bookingUrl}>{p.wording?.ctaLabel ?? "Book my demo"}</CtaButton>
      <Text style={{ ...P, margin: "20px 0 0" }}>
        Have a look around in the meantime at{" "}
        <Link href={p.product.websiteUrl} style={{ color: BRAND.blue, fontWeight: 600 }}>
          {p.product.websiteLabel}
        </Link>
        .
      </Text>
    </Shell>
  );
}

export function thanksPlainText(p: ThanksEmailProps) {
  return [
    `Hi ${p.firstName},`,
    "",
    p.paragraph,
    "",
    `${p.wording?.ctaIntro ?? "Want to choose a time now?"} ${p.wording?.ctaLabel ?? "Book my demo"}: ${p.bookingUrl}`,
    "",
    `The Sterlixit team · ${p.contact.phone} · ${p.contact.email} · ${p.product.websiteLabel}`,
  ].join("\n");
}

// ---- Email 2: account ready (sent by staff) -------------------------------------------------------

export type AccountEmailProps = Shared & {
  signupUrl: string;
  bookingUrl: string;
  /** e.g. "We'll walk through live attendance, weekly rota and leave using your own team's set-up." */
  demoLine: string;
};

export const accountSubject = (p: EmailProduct) => `Your ${p.name} account is ready`;

export function AccountEmail(p: AccountEmailProps) {
  return (
    <Shell {...p} preview="Create your password and pick a time for your live demo." footerReason={reason(p)}>
      <Heading as="h1" style={{ margin: "0 0 16px", color: BRAND.navy, fontFamily: HEADING_FONT, fontWeight: 800, fontSize: 26, lineHeight: "32px" }}>
        Your {p.product.name} account is ready
      </Heading>
      <Text style={P}>Hi {p.firstName},</Text>
      <Text style={P}>Your {p.product.name} account is set up. Create your password to get started:</Text>
      <CtaButton href={p.signupUrl}>Create my password</CtaButton>
      <Text style={{ ...P, margin: "24px 0 16px" }}>Then pick a 30-minute slot for your live demo. {p.demoLine}</Text>
      <Link href={p.bookingUrl} style={{ color: BRAND.blue, fontWeight: 700, fontSize: 16 }}>
        Pick my demo time →
      </Link>
    </Shell>
  );
}

export function accountPlainText(p: AccountEmailProps) {
  return [
    `Hi ${p.firstName},`,
    "",
    `Your ${p.product.name} account is set up. Create your password here: ${p.signupUrl}`,
    "",
    `Then pick a 30-minute slot for your live demo: ${p.bookingUrl}`,
    p.demoLine,
    "",
    `The Sterlixit team · ${p.contact.phone} · ${p.contact.email}`,
  ].join("\n");
}
