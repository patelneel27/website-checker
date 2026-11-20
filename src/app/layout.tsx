import type { Metadata, Viewport } from "next";
import { Anton, Plus_Jakarta_Sans, Sora } from "next/font/google";
import { LeadQueueRunner } from "@/components/LeadQueueRunner";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-sora" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: { default: "Sterlixit", template: "%s · Sterlixit" },
  description: "Sterlixit at the stand: free website health check and StaffMain HR software demos.",
  applicationName: "Sterlixit",
  appleWebApp: { capable: true, title: "Sterlixit", statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg", apple: "/icons/icon-192" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F1F1EE",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${sora.variable} ${jakarta.variable} ${anton.variable}`}>
      <body>
        {children}
        <LeadQueueRunner />
      </body>
    </html>
  );
}
