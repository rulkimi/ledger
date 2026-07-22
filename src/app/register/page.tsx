import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";
import { RegisterForm } from "./register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | NetLedger",
  description: "Join NetLedger to organize your recurring expenses, optimize your monthly burn, and forecast your future bills.",
};

const perks = [
  { icon: TrendingUp, text: "Rolling due-date forecasting" },
  { icon: ShieldCheck, text: "True monthly cost calculation" },
  { icon: BarChart3, text: "6-month projection chart" },
];

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* ── Left brand panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 brand-gradient overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/8 rounded-full blur-3xl" />

        <Link href="/" className="relative font-extrabold text-2xl tracking-tight text-white flex items-center gap-2.5">
          <Image src="/ledger.svg" alt="NetLedger Logo" width={32} height={32} className="w-8 h-8 invert-0 dark:invert" />
          <span>NetLedger</span>
        </Link>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-snug">
              Start tracking your<br />subscriptions today.
            </h2>
            <p className="mt-3 text-white/65 text-sm leading-relaxed max-w-sm">
              NetLedger helps you take control of your recurring expenses with powerful forecasting and normalization.
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

        <p className="relative text-white/40 text-xs">© {new Date().getFullYear()} NetLedger</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 font-extrabold text-2xl tracking-tight brand-text">
            <Image src="/ledger.svg" alt="NetLedger Logo" width={28} height={28} className="w-7 h-7" />
            <span>NetLedger</span>
          </Link>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Create an account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign up to get started</p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary font-medium hover:underline underline-offset-4">
              Sign in
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
