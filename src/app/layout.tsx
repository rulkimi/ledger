import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const siteDescription = "Track subscriptions, calculate true monthly burn, and forecast cash-flow. Stay in complete control of bills.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "NetLedger — Personal Finance & Subscription Tracker",
  description: siteDescription,
  icons: {
    icon: "/ledger.svg",
  },
  openGraph: {
    title: "NetLedger — Personal Finance & Subscription Tracker",
    description: siteDescription,
    url: baseUrl,
    siteName: "NetLedger",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NetLedger — Personal Finance & Subscription Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NetLedger — Personal Finance & Subscription Tracker",
    description: siteDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
