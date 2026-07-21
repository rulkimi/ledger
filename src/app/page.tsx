import { auth, signIn, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, ShieldCheck, Layers } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Cash-Flow Forecasting",
    desc: "See every upcoming payment on a rolling calendar — weekly, monthly, bi-annual, or yearly.",
  },
  {
    icon: ShieldCheck,
    title: "True Monthly Cost",
    desc: "Prorate every bill to its exact monthly equivalent so you know exactly what to set aside.",
  },
  {
    icon: Layers,
    title: "6-Month Projection",
    desc: "Plan ahead with a granular month-by-month breakdown of exactly what is due and when.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto max-w-6xl flex items-center justify-between h-16 px-4 sm:px-6">
          <span className="font-extrabold text-xl tracking-tight brand-text">Ledger</span>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm" variant="ghost">Dashboard</Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <Button size="sm" variant="outline" type="submit">Sign Out</Button>
                </form>
              </>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="sm">Log In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/5 text-primary mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Real-time subscription intelligence
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.05]">
          Know exactly{" "}
          <span className="brand-text">what you owe</span>,<br />
          before it hits.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
          Ledger tracks every subscription with rolling due-date accuracy and prorates your bills
          into a single monthly number — in{" "}
          <span className="font-semibold text-foreground">MYR</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          {session?.user ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 min-w-[180px]">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/api/auth/signin">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 min-w-[180px]">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href="#features">
            <Button size="lg" variant="outline" className="min-w-[180px]">
              See Features
            </Button>
          </Link>
        </div>

        {/* Floating stats */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl w-full">
          {[
            { label: "Bills Tracked", value: "∞" },
            { label: "Billing Cycles", value: "4" },
            { label: "Default Currency", value: "MYR" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/60 bg-card/60 glass p-5 flex flex-col items-center gap-1 shadow-sm"
            >
              <span className="text-3xl font-extrabold brand-text">{stat.value}</span>
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section id="features" className="container mx-auto max-w-6xl px-4 sm:px-6 py-24">
        <h2 className="text-3xl font-extrabold text-center mb-3">Built for clarity</h2>
        <p className="text-center text-muted-foreground mb-14 max-w-md mx-auto">
          Every feature is designed around one principle: no surprises in your bank account.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-card p-7 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <div className="p-3 rounded-xl brand-gradient w-fit">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ledger. Built for you.
      </footer>
    </div>
  );
}
