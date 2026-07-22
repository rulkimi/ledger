import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DashboardNav } from "./_components/nav-link";
import { PageTransition } from "@/components/ui/page-transition";
import { SlideOverChat } from "./_components/slide-over-chat";
import { SettingsDialog } from "./_components/settings-dialog";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { monthlyIncome: true }
  });

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-background md:overflow-hidden">
      <div className="fixed inset-0 -z-10 mesh-bg pointer-events-none" />

      {/* Top bar */}
      <header className="sticky top-0 z-50 liquid-glass h-16">
        <div className="container mx-auto max-w-5xl h-full flex items-center justify-between gap-4 px-4 sm:px-6">

          {/* Logo + nav */}
          <div className="flex items-center gap-2 md:gap-5">
            <Link href="/" className="flex-shrink-0 flex items-center">
              {/* Mobile Logo */}
              <Image priority src="/ledger.svg" alt="NetLedger" width={28} height={28} className="w-7 h-7 object-contain sm:hidden" />
              {/* Desktop Logo */}
              <Image priority style={{ width: "auto" }} src="/ledger-title.svg" alt="NetLedger" width={102} height={32} className="h-8 w-auto object-contain hidden sm:block" />
              <span className="sr-only">NetLedger</span>
            </Link>
            <DashboardNav />
          </div>

          {/* Settings Button */}
          <div className="flex items-center bg-muted/40 p-1 rounded-full border border-border/50 backdrop-blur-md">
            <SettingsDialog user={{
              name: session.user.name,
              email: session.user.email,
              monthlyIncome: dbUser?.monthlyIncome ? Number(dbUser.monthlyIncome) : null
            }} />
          </div>
        </div>
      </header>

      <main className="flex-1 md:min-h-0 md:overflow-hidden flex flex-col container mx-auto max-w-5xl px-4 sm:px-6 py-5 sm:py-8">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <SlideOverChat />
    </div>
  );
}
