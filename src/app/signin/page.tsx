import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex mesh-bg">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 brand-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
        <Link href="/" className="relative text-white font-extrabold text-2xl tracking-tight">Ledger</Link>
        <div className="relative">
          <blockquote className="text-white/90 text-2xl font-light leading-relaxed italic">
            "The first step to financial clarity is knowing exactly what you owe — and when."
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full brand-gradient border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Ledger</p>
              <p className="text-white/60 text-xs">Personal Finance Engine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="lg:hidden font-extrabold text-2xl tracking-tight brand-text block mb-8">Ledger</Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to your dashboard</p>
          </div>

          <form
            action={async (formData) => {
              "use server";
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/dashboard",
              });
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="demo@example.com"
                  className="pl-9 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-9 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-2 shadow-lg shadow-primary/20 font-semibold">
              Sign In
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl border border-dashed border-border/60 bg-muted/30">
            <p className="text-xs text-muted-foreground font-medium mb-1">Demo credentials</p>
            <p className="text-sm font-mono">demo@example.com / password123</p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-4">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
