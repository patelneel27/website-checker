import { connection } from "next/server";
import { Suspense } from "react";
import { EventHome } from "@/components/EventHome";
import { config } from "@/lib/config";

async function HomeWithConfig() {
  await connection();
  return <EventHome eventName={config.eventName} demoUrl={config.demoUrl} />;
}

export default function Home() {
  return (
    <Suspense fallback={<main className="paper h-dvh" />}>
      <HomeWithConfig />
    </Suspense>
  );
}
