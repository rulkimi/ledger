import { auth, signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, ShieldCheck, Layers, CheckCircle2, Sparkles, Wallet } from "lucide-react";
import { FadeInStaggerGroup, FadeInStaggerItem, ScrollInViewGroup, ScrollInViewElement, HoverCardMotion } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroMockup } from "@/components/landing/hero-mockup";
import { CalendarMockup } from "@/components/landing/calendar-mockup";
import { ChatMockup } from "@/components/landing/chat-mockup";

const features = [
  {
    icon: TrendingUp,
    title: "Cash-Flow Forecasting",
    desc: "See every upcoming payment on a rolling calendar — weekly, monthly, bi-annual, or yearly. No more surprises.",
  },
  {
    icon: ShieldCheck,
    title: "True Monthly Cost",
    desc: "Prorate every bill to its exact monthly equivalent so you always know how much cash to set aside.",
  },
  {
    icon: Layers,
    title: "6-Month Projection",
    desc: "Plan ahead with a precise month-by-month breakdown of what is actually due — not just averages.",
  },
];

const highlights = [
  "Rolling due-date calculation from your original start date",
  "Prorated monthly cost across all billing cycles",
  "Urgent bill alerts with day-level countdown",
  "Filter & sort by category or amount",
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle background */}
      <div className="fixed inset-0 -z-10 mesh-bg pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 liquid-glass h-16">
        <div className="container mx-auto max-w-5xl h-full flex items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            {/* Mobile Logo */}
            <Image src="/ledger.svg" alt="NetLedger" width={28} height={28} className="w-7 h-7 object-contain sm:hidden" />
            {/* Desktop Logo */}
            <Image src="/ledger-title.svg" alt="NetLedger" width={102} height={32} className="h-8 w-auto object-contain hidden sm:block" />
            <h1 className="sr-only">NetLedger</h1>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm" variant="ghost" className="font-medium">Dashboard</Button>
                </Link>
                <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                  <Button size="sm" variant="outline" type="submit">Sign Out</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button size="sm" variant="ghost" className="font-medium">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-10 pb-8 sm:pt-16 sm:pb-12">
        <FadeInStaggerGroup className="flex flex-col items-center w-full">
          {/* Headline */}
          <FadeInStaggerItem>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.06] text-foreground">
              Know exactly{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">what you owe</span>
              {" "}—{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">before it hits.</span>
            </h1>
          </FadeInStaggerItem>

          <FadeInStaggerItem>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed mx-auto">
              NetLedger doesn&apos;t just track your subscriptions. It autonomously identifies wasted money, forecasts your rolling cash flow, and relentlessly roasts your bad spending habits.
            </p>
          </FadeInStaggerItem>

          {/* CTA buttons */}
          <FadeInStaggerItem>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-xl shadow-primary/25 rounded-full transition-all hover:scale-105 group">
                    Go to Dashboard <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-xl shadow-primary/25 rounded-full transition-all hover:scale-105 group">
                    Start Tracking Free <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
            </div>
          </FadeInStaggerItem>

          {/* Interactive Mockup */}
          <FadeInStaggerItem className="w-full mt-10 sm:mt-12 px-2 sm:px-0 relative">
            {/* Sun-like radiant glow */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/10 dark:bg-primary/30 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/15 dark:bg-primary/50 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative [mask-image:linear-gradient(to_bottom,black_80%,transparent)] pb-10">
              <HeroMockup />
            </div>
          </FadeInStaggerItem>

        </FadeInStaggerGroup>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <ScrollInViewElement className="text-center mb-14">
          <h2 className="text-3xl font-extrabold tracking-tight">Built for clarity</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Every feature exists to eliminate one thing: financial uncertainty.
          </p>
        </ScrollInViewElement>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <ScrollInViewElement>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl brand-gradient w-fit shadow-sm">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Cash-Flow Forecasting</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                See every upcoming payment on a rolling calendar — weekly, monthly, bi-annual, or yearly. No more surprises. NetLedger calculates your true monthly burn across every billing cycle and forecasts your cash flow.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> Rolling due-date calculation</li>
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> Urgent bill alerts with countdown</li>
              </ul>
            </div>
          </ScrollInViewElement>
          <ScrollInViewElement delay={0.2}>
            <CalendarMockup />
          </ScrollInViewElement>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-20">
          {features.slice(1).map((f) => (
            <ScrollInViewElement key={f.title}>
              <div className="group h-full rounded-2xl border border-border/60 bg-card p-7 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl brand-gradient w-fit shadow-sm">
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base">{f.title}</h3>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </ScrollInViewElement>
          ))}
        </div>

        {/* Cento AI Section */}
        <div className="flex flex-col items-center mt-28 mb-10">
          <ScrollInViewElement className="text-center mb-12 flex flex-col items-center max-w-2xl mx-auto">
            <div className="p-3 rounded-xl brand-gradient w-fit shadow-sm mb-6 inline-flex">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Meet Cento</h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Cento isn&apos;t just a chatbot. It&apos;s an autonomous AI financial advisor that lives in your ledger. It analyzes your spending, identifies wasted money, and can even edit your subscriptions for you.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8">
              <span className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-primary" /> Autonomous tool calling</span>
              <span className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-primary" /> Inline confirmations</span>
              <span className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-primary" /> Adjustable roasts</span>
            </div>
            <Link href="/register">
              <Button size="lg" className="font-semibold shadow-lg shadow-primary/20 gap-2 rounded-full px-8">
                Chat with Cento <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </ScrollInViewElement>
          
          <ScrollInViewElement className="w-full" delay={0.2}>
            <ChatMockup />
          </ScrollInViewElement>
        </div>
      </section>

      {/* CTA Banner */}
      {!session?.user && (
        <section className="border-t border-border/40 bg-muted/10 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-28 sm:py-36 text-center relative z-10">
            <ScrollInViewElement>
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
                Your ledger, <span className="text-primary">perfected.</span>
              </h2>
              <p className="text-muted-foreground text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users taking back control of their subscriptions. See your true monthly cost in seconds. No credit card required.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-xl shadow-primary/25 rounded-full transition-all hover:scale-105 group">
                  Start tracking for free <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </ScrollInViewElement>
          </div>
        </section>
      )}

      <footer className="border-t border-border/50 py-7 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NetLedger · Personal Finance & Subscription Tracker
      </footer>
    </div>
  );
}
