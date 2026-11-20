"use client";

// Offline queue for lead forms. If the stand's Wi-Fi drops, the visitor still sees "Thank you":
// the lead waits in this browser and is sent as soon as the connection is back. The server
// deduplicates by clientId, so retries never create a second lead. Items are removed once sent.

const KEY = "sterlix-lead-queue";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type Item = { id: string; url: string; body: unknown; queuedAt: number };
export type SendResult = { ok: true; queued: boolean } | { ok: false; field?: string; message: string };

function load(): Item[] {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Item[];
    return items.filter((i) => Date.now() - i.queuedAt < MAX_AGE_MS);
  } catch {
    return [];
  }
}
function save(items: Item[]) {
  try {
    if (items.length) localStorage.setItem(KEY, JSON.stringify(items));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing more we can do on this device.
  }
}

async function post(url: string, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });
}

/** Sends a lead now, or queues it if the network/server is unavailable. */
export async function sendLead(url: string, id: string, body: unknown): Promise<SendResult> {
  try {
    const res = await post(url, body);
    if (res.ok) return { ok: true, queued: false };
    if (res.status === 400) {
      const b = (await res.json().catch(() => null)) as { field?: string; message?: string } | null;
      return { ok: false, field: b?.field, message: b?.message ?? "Please check the form." };
    }
  } catch {
    // Offline or timed out: fall through to the queue.
  }
  save([...load().filter((i) => i.id !== id), { id, url, body, queuedAt: Date.now() }]);
  return { ok: true, queued: true };
}

let flushing = false;
/** Tries to send everything waiting. Returns how many are still queued. */
export async function flushLeadQueue(): Promise<number> {
  if (flushing) return load().length;
  flushing = true;
  try {
    for (const item of load()) {
      try {
        const res = await post(item.url, item.body);
        // 400 means the server will never accept it; drop it rather than retry forever.
        if (res.ok || res.status === 400) save(load().filter((i) => i.id !== item.id));
      } catch {
        break; // still offline
      }
    }
  } finally {
    flushing = false;
  }
  return load().length;
}

export const queuedLeadCount = () => load().length;
