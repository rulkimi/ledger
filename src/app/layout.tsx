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

export const metadata: Metadata = {
  metadataBase: new URL("https://netledger.com"),
  title: "NetLedger — Personal Finance & Subscription Tracker",
  description:
    "Know exactly what you owe, when you owe it. NetLedger gives you accurate cash-flow forecasting and prorated budgeting for all your subscriptions.",
  icons: {
    icon: "/ledger.svg",
  },
  openGraph: {
    title: "NetLedger — Personal Finance & Subscription Tracker",
    description:
      "Know exactly what you owe, when you owe it. NetLedger gives you accurate cash-flow forecasting and prorated budgeting for all your subscriptions.",
    url: "https://netledger.com",
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
    description:
      "Know exactly what you owe, when you owe it. NetLedger gives you accurate cash-flow forecasting and prorated budgeting for all your subscriptions.",
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
