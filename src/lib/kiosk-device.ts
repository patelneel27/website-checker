"use client";

// Per-device kiosk settings, set from staff mode and kept in this browser only.
// - Home: where the tablet goes after a visitor (idle, "Back to start", logo tap). Default:
//   the event home, so the next visitor (or a team member) can pick a demo. A tablet can be
//   locked to one demo instead.
// - Kiosk mode: idle reset and auto-return. On by default on tablets and installed apps, off on
//   phones (a visitor who opened the link from a QR code shouldn't be kicked out mid-form).

export const HOMES = [
  { path: "/", label: "Event home (pick a demo)" },
  { path: "/health-check", label: "Website Health Check" },
  { path: "/staffmain", label: "StaffMain" },
  { path: "/letflows", label: "LetFlows" },
  { path: "/enquiry", label: "General Enquiry" },
] as const;

const HOME_KEY = "sterlix-kiosk-home";
const KIOSK_KEY = "sterlix-kiosk-mode";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode: settings just won't stick.
  }
}

export function getHome(): string {
  const v = read(HOME_KEY);
  return HOMES.some((h) => h.path === v) ? v! : "/";
}
export const setHome = (path: string) => write(HOME_KEY, path === "/" ? null : path);

export type KioskMode = "auto" | "on" | "off";
export const getKioskMode = (): KioskMode => {
  const v = read(KIOSK_KEY);
  return v === "on" || v === "off" ? v : "auto";
};
export const setKioskMode = (mode: KioskMode) => write(KIOSK_KEY, mode === "auto" ? null : mode);

export function isKioskDevice(): boolean {
  const mode = getKioskMode();
  if (mode !== "auto") return mode === "on";
  if (typeof window === "undefined") return true;
  const installed = window.matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  return installed || shortSide >= 700;
}

// Attract mode: a full-screen showreel after a quiet spell on a start screen. On by default.
const ATTRACT_KEY = "sterlix-attract";
export const getAttract = () => read(ATTRACT_KEY) !== "off";
export const setAttract = (on: boolean) => write(ATTRACT_KEY, on ? null : "off");
