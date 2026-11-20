import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { EnquiryKiosk } from "@/components/enquiry/EnquiryKiosk";
import { config, enquiryLinks } from "@/lib/config";

export const metadata: Metadata = {
  title: "How can we help?",
  description: "Tell Sterlixit what you're looking for and we'll get back to you within 2 working days.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function EnquiryWithConfig({ searchParams }: Props) {
  await connection();
  const quick = (await searchParams).by === "team";
  const links = enquiryLinks();
  return (
    <EnquiryKiosk
      quick={quick}
      config={{ bookingQrUrl: links.bookingQr, bookingButtonUrl: links.bookingKiosk, privacyUrl: config.privacyUrl, demoUrl: config.demoUrl }}
    />
  );
}

export default function EnquiryPage(props: Props) {
  return (
    <Suspense fallback={<main className="paper h-dvh" />}>
      <EnquiryWithConfig {...props} />
    </Suspense>
  );
}
