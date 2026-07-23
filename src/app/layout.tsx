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

const siteDescription = "Track subscriptions, cut wasted money, and forecast cash flow with NetLedger. Featuring Cento, an autonomous AI financial advisor that roasts your bad spending habits.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "NetLedger | AI-Powered Subscription & Finance Tracker",
    template: "%s | NetLedger"
  },
  description: siteDescription,
  keywords: ["personal finance", "subscription tracker", "AI financial advisor", "budgeting app", "cash flow forecast", "manage subscriptions"],
  authors: [{ name: "NetLedger Team" }],
  creator: "NetLedger",
  icons: {
    icon: "/ledger.svg",
  },
  openGraph: {
    title: "NetLedger | AI-Powered Subscription & Finance Tracker",
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={true}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
