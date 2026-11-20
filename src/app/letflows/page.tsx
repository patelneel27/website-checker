import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { LetflowsKiosk } from "@/components/letflows/LetflowsKiosk";
import { config, letflowsLinks } from "@/lib/config";

export const metadata: Metadata = {
  title: "LetFlows",
  description: "Let it flow: all your properties, one platform. Book a free LetFlows demo at the Sterlixit stand.",
};

async function LetflowsWithConfig() {
  await connection();
  const links = letflowsLinks();
  return (
    <LetflowsKiosk
      config={{
        bookingQrUrl: links.bookingQr,
        bookingButtonUrl: links.bookingKiosk,
        websiteQrUrl: links.websiteQr,
        privacyUrl: config.privacyUrl,
        demoUrl: config.demoUrl,
      }}
    />
  );
}

export default function LetflowsPage() {
  return (
    <Suspense fallback={<main className="paper h-dvh" />}>
      <LetflowsWithConfig />
    </Suspense>
  );
}
