import type { Metadata } from "next";
import { LetflowsLive } from "@/components/live/LetflowsLive";

export const metadata: Metadata = {
  title: "LetFlows Live",
  description: "Coming soon for LetFlows customers: your whole portfolio, live on any screen.",
};

export default function Page() {
  return <LetflowsLive />;
}
