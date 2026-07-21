import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, ShieldCheck, Layers, CheckCircle2 } from "lucide-react";

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
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto max-w-6xl flex items-center justify-between h-16 px-4 sm:px-6">
          <span className="font-extrabold text-xl tracking-tight brand-text">Ledger</span>
          <div className="flex items-center gap-2">
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
                <Link href="/signin">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 sm:pt-28 sm:pb-20">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-primary/25 bg-primary/8 text-primary mb-8 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          Smart subscription tracking
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.06] text-foreground">
          Know exactly{" "}
          <span className="brand-text">what you owe</span>
          {" "}—{" "}
          <span className="brand-text">before it hits.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
          Ledger calculates your true monthly burn across every billing cycle and
          forecasts your cash flow 12 months out. Stay in complete control.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          {session?.user ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 font-semibold min-w-[200px]">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/signin">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 font-semibold min-w-[200px]">
                Start Tracking Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <a href="#features">
            <Button size="lg" variant="outline" className="min-w-[160px] font-medium">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Highlights checklist */}
        <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-left max-w-xl w-full">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold tracking-tight">Built for clarity</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Every feature exists to eliminate one thing: financial uncertainty.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border/60 bg-card p-7 flex flex-col gap-4 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200">
              <div className="p-3 rounded-xl brand-gradient w-fit shadow-sm">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      {!session?.user && (
        <section className="container mx-auto max-w-6xl px-4 sm:px-6 pb-20">
          <div className="brand-gradient rounded-3xl p-10 text-center text-white shadow-xl shadow-primary/20">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to get clarity?</h2>
            <p className="text-white/75 text-sm sm:text-base mb-7 max-w-md mx-auto">
              Create an account and start tracking your subscriptions in seconds.
            </p>
            <Link href="/signin">
              <Button size="lg" variant="secondary" className="font-semibold shadow-lg gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      <footer className="border-t border-border/50 py-7 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ledger · Personal Finance & Subscription Tracker
      </footer>
    </div>
  );
}
