import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Kiosk } from "@/components/Kiosk";
import { bookingLinks, config } from "@/lib/config";

export const metadata: Metadata = { title: "Website Health Check" };

// Env-based settings are read at request time so they can change without a rebuild.
async function KioskWithConfig() {
  await connection();
  return (
    <Kiosk
      config={{
        bookingQrUrl: bookingLinks().qr,
        bookingButtonUrl: bookingLinks().kiosk,
        privacyUrl: config.privacyUrl,
        eventName: config.eventName,
        demoUrl: config.demoUrl,
      }}
    />
  );
}

export default function HealthCheckPage() {
  return (
    <Suspense fallback={<main className="paper h-dvh" />}>
      <KioskWithConfig />
    </Suspense>
  );
}
