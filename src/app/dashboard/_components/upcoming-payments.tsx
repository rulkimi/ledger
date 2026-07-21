import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateNextPaymentDate, calculateTrueMonthlyCost, daysUntil, FREQUENCY_LABEL } from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarClock, AlertCircle } from "lucide-react";
import { DeleteSubscriptionButton } from "./delete-subscription-button";

type SortOption = "date" | "cost" | "name";

export default async function UpcomingPayments({
  category,
  sort = "date",
}: {
  category?: string;
  sort?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currency = session.user.currency ?? "MYR";
  const now = new Date();

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true, ...(category ? { category } : {}) },
  });

  const enriched = subs.map((s) => ({
    ...s,
    nextPaymentDate: calculateNextPaymentDate(s.startDate, s.billingFrequency, now),
    trueMonthlyCost: calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency),
  }));

  const sortKey = sort as SortOption;
  const sorted = [...enriched].sort((a, b) => {
    if (sortKey === "cost") return Number(b.cost) - Number(a.cost);
    if (sortKey === "name") return a.name.localeCompare(b.name);
    return a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime();
  });

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm flex flex-col">
      <CardHeader className="border-b border-border/40 py-4 px-6">
        <CardTitle className="flex items-center justify-between text-base font-bold">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Upcoming Payments
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {sorted.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-4 rounded-2xl bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold">No subscriptions found</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first bill using the button above</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="pl-6 py-3 text-xs font-bold uppercase tracking-wider">Subscription</TableHead>
                <TableHead className="py-3 text-xs font-bold uppercase tracking-wider">Next Due</TableHead>
                <TableHead className="py-3 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Frequency</TableHead>
                <TableHead className="py-3 text-xs font-bold uppercase tracking-wider hidden md:table-cell">~/Month</TableHead>
                <TableHead className="py-3 text-right text-xs font-bold uppercase tracking-wider">Amount</TableHead>
                <TableHead className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((sub) => {
                const days = daysUntil(sub.nextPaymentDate, now);
                const isUrgent = days <= 7;
                const isVeryUrgent = days <= 2;

                return (
                  <TableRow key={sub.id} className="group hover:bg-muted/20 transition-colors h-[60px]">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${isVeryUrgent ? "bg-destructive animate-pulse" : isUrgent ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <div>
                          <p className="font-semibold text-[14px] leading-tight">{sub.name}</p>
                          {sub.category && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{sub.category}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-semibold ${isUrgent ? "text-destructive" : ""}`}>
                          {format(sub.nextPaymentDate, "d MMM yyyy")}
                        </span>
                        {isUrgent ? (
                          <Badge variant={isVeryUrgent ? "destructive" : "outline"} className={`text-[10px] w-fit px-1.5 py-0 ${!isVeryUrgent ? "border-amber-500/50 text-amber-600 bg-amber-50 dark:bg-amber-950/30" : ""}`}>
                            {days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days`}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">in {days} days</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs text-muted-foreground border-border/60 bg-muted/20">
                        {FREQUENCY_LABEL[sub.billingFrequency]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm font-medium text-muted-foreground font-mono">
                        {formatCurrency(sub.trueMonthlyCost, currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-[15px] font-mono">
                        {formatCurrency(Number(sub.cost), currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DeleteSubscriptionButton id={sub.id} name={sub.name} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
