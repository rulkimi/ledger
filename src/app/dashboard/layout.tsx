import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DashboardNav } from "./_components/nav-link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const initials = session.user.name
    ? session.user.name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (session.user.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 -z-10 mesh-bg pointer-events-none" />

      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b border-border/40 h-14">
        <div className="container mx-auto max-w-5xl h-full flex items-center justify-between gap-4 px-4 sm:px-6">

          {/* Logo + nav */}
          <div className="flex items-center gap-5">
            <Link href="/" className="font-extrabold text-base tracking-tight brand-text flex-shrink-0">
              Ledger
            </Link>
            <DashboardNav />
          </div>

          {/* User + sign out */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-foreground">{session.user.name ?? "User"}</span>
              <span className="text-[11px] text-muted-foreground">{session.user.email}</span>
            </div>
            <div className="h-8 w-8 rounded-full brand-gradient flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {initials}
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <Button size="sm" variant="ghost" type="submit" className="h-8 gap-1 text-muted-foreground hover:text-foreground px-2" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
