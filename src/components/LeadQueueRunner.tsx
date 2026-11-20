"use client";

import { useEffect } from "react";
import { flushLeadQueue } from "@/lib/lead-queue";

/** Sends any leads that were captured while offline: on load, when back online, and every 30 s. */
export function LeadQueueRunner() {
  useEffect(() => {
    const flush = () => void flushLeadQueue();
    flush();
    window.addEventListener("online", flush);
    const t = setInterval(flush, 30_000);
    return () => {
      window.removeEventListener("online", flush);
      clearInterval(t);
    };
  }, []);
  return null;
}
