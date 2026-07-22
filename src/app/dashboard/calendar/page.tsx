import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { buildYearlyCalendar } from "@/lib/subscription-utils";
import { CalendarView } from "./calendar-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar Forecast | NetLedger",
  description: "View dynamic monthly billing projections, rolling due dates, and year-long cash flow forecasts.",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currency = session.user.currency ?? "MYR";
  const now      = new Date();

  const subs = await prisma.subscription.findMany({
    where:  { userId: session.user.id, isActive: true },
    select: { name: true, startDate: true, billingFrequency: true, cost: true, category: true },
  });

  const raw = buildYearlyCalendar(
    subs.map((s) => ({ ...s, cost: Number(s.cost) })),
    now
  );

  // Serialise Date objects → ISO strings so they can cross the Server→Client boundary
  const months = raw.map((m) => ({
    label:  m.label,
    total:  m.total,
    payments: m.payments.map((p) => ({
      name:     p.name,
      date:     p.date.toISOString(),
      amount:   p.amount,
      category: p.category,
    })),
  }));

  const maxTotal   = Math.max(...months.map((m) => m.total), 1);
  const grandTotal = months.reduce((a, m) => a + m.total, 0);

  return (
    <CalendarView
      months={months}
      maxTotal={maxTotal}
      grandTotal={grandTotal}
      currency={currency}
    />
  );
}
