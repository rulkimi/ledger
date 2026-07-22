import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DashboardNav } from "./_components/nav-link";
import { PageTransition } from "@/components/ui/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { SlideOverChat } from "./_components/slide-over-chat";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");


  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="fixed inset-0 -z-10 mesh-bg pointer-events-none" />

      {/* Top bar */}
      <header className="sticky top-0 z-50 liquid-glass h-16">
        <div className="container mx-auto max-w-5xl h-full flex items-center justify-between gap-4 px-4 sm:px-6">

          {/* Logo + nav */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image src="/ledger-title.svg" alt="NetLedger" width={102} height={32} className="h-8 w-auto object-contain" />
              <span className="sr-only">NetLedger</span>
            </Link>
            <DashboardNav />
          </div>

          {/* User + theme toggle + sign out */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 bg-muted/40 p-1 pl-3.5 rounded-full border border-border/50 backdrop-blur-md">
              <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                {session.user.name ?? "User"}
              </span>
              <div className="h-3.5 w-px bg-border/60" />
              <ThemeToggle />
            </div>

            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <Button size="sm" variant="ghost" type="submit" className="h-8 gap-1 text-muted-foreground hover:text-foreground px-2 rounded-full" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs font-medium">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <SlideOverChat />
    </div>
  );
}
