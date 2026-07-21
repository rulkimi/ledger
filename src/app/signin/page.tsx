import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";

const perks = [
  { icon: TrendingUp, text: "Rolling due-date forecasting" },
  { icon: ShieldCheck, text: "True monthly cost calculation" },
  { icon: BarChart3, text: "6-month projection chart" },
];

export default async function SignInPage(props: { searchParams: Promise<{ registered?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  
  const searchParams = await props.searchParams;
  const isRegistered = searchParams?.registered === "true";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* ── Left brand panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 brand-gradient overflow-hidden">
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/8 rounded-full blur-3xl" />

        <Link href="/" className="relative font-extrabold text-2xl tracking-tight text-white">
          Ledger
        </Link>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-snug">
              Your subscriptions,<br />completely under control.
            </h2>
            <p className="mt-3 text-white/65 text-sm leading-relaxed max-w-sm">
              Ledger gives you accurate rolling due dates, prorated monthly costs,
              and a 6-month cash-flow forecast — all in one place.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/15">
                  <p.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/85 text-sm font-medium">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-white/40 text-xs">© {new Date().getFullYear()} Ledger</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block font-extrabold text-2xl tracking-tight brand-text">
            Ledger
          </Link>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {isRegistered && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm px-3 py-2 font-medium">
              Account created successfully. Please sign in.
            </div>
          )}

          <LoginForm />

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground pt-4">
            <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-4">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
