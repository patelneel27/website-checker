import type { Metadata } from "next";
import { StaffmainLive } from "@/components/live/StaffmainLive";

export const metadata: Metadata = {
  title: "StaffMain Live",
  description: "Coming soon for StaffMain customers: your team, live on any screen.",
};

export default function Page() {
  return <StaffmainLive />;
}
