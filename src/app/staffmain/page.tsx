import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { StaffmainKiosk } from "@/components/staffmain/StaffmainKiosk";
import { config, staffmainLinks } from "@/lib/config";

export const metadata: Metadata = {
  title: "StaffMain",
  description: "HR made simple: people, leave, rota and attendance in one place. Book a free StaffMain demo.",
};

async function StaffmainWithConfig() {
  await connection();
  const links = staffmainLinks();
  return (
    <StaffmainKiosk
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

export default function StaffmainPage() {
  return (
    <Suspense fallback={<main className="paper h-dvh" />}>
      <StaffmainWithConfig />
    </Suspense>
  );
}
