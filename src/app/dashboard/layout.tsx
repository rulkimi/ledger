import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";
import { LayoutDashboard, LogOut, ChevronRight } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (session.user.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto max-w-7xl flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="font-extrabold text-lg tracking-tight brand-text">Ledger</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold leading-none">{session.user.name ?? "User"}</span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">{session.user.email}</span>
            </div>
            <div className="h-8 w-8 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button size="sm" variant="ghost" type="submit" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
