import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  calculateNextPaymentDate,
  calculateTrueMonthlyCost,
  daysUntil,
  FREQUENCY_LABEL,
} from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarClock, Inbox } from "lucide-react";
import { DeleteSubscriptionButton } from "./delete-subscription-button";

export default async function UpcomingPayments({
  category,
  sort = "date",
}: {
  category?: string;
  sort?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currency = (session.user as any).currency ?? "MYR";
  const now = new Date();

  const subs = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      ...(category ? { category } : {}),
    },
  });

  const enriched = subs.map((s) => ({
    ...s,
    nextPaymentDate: calculateNextPaymentDate(s.startDate, s.billingFrequency, now),
    trueMonthlyCost: calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency),
  }));

  const sorted = [...enriched].sort((a, b) => {
    if (sort === "cost") return Number(b.cost) - Number(a.cost);
    if (sort === "name") return a.name.localeCompare(b.name);
    return a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime();
  });

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20 py-3.5 px-5">
        <CardTitle className="flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Upcoming Payments
          </div>
          <Badge variant="secondary" className="font-mono text-xs rounded-full px-2.5">
            {sorted.length} active
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-muted/50">
              <Inbox className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-semibold text-sm">No bills here</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                {category ? `No subscriptions in "${category}". Try clearing the filter.` : "Add your first subscription to get started."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/40">
                  <TableHead className="pl-5 h-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-[35%]">
                    Subscription
                  </TableHead>
                  <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Next Due
                  </TableHead>
                  <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Cycle
                  </TableHead>
                  <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell text-right">
                    /Month
                  </TableHead>
                  <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                    Amount
                  </TableHead>
                  <TableHead className="h-10 w-10 pr-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((sub) => {
                  const days = daysUntil(sub.nextPaymentDate, now);
                  const isVeryUrgent = days <= 2;
                  const isUrgent = days <= 7;

                  return (
                    <TableRow
                      key={sub.id}
                      className="group hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0 h-[58px]"
                    >
                      {/* Name + category */}
                      <TableCell className="pl-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                              isVeryUrgent
                                ? "bg-destructive animate-pulse"
                                : isUrgent
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{sub.name}</p>
                            {sub.category && (
                              <p className="text-[11px] text-muted-foreground/70 truncate">{sub.category}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Due date */}
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <p className={`text-sm font-semibold ${isUrgent ? "text-destructive" : "text-foreground"}`}>
                            {format(sub.nextPaymentDate, "d MMM yyyy")}
                          </p>
                          {isUrgent ? (
                            <Badge
                              variant={isVeryUrgent ? "destructive" : "outline"}
                              className={`text-[10px] px-1.5 py-0 h-4 font-semibold ${
                                !isVeryUrgent
                                  ? "border-amber-400/60 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
                                  : ""
                              }`}
                            >
                              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                            </Badge>
                          ) : (
                            <p className="text-[11px] text-muted-foreground/60">in {days} days</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Frequency */}
                      <TableCell className="hidden sm:table-cell py-3">
                        <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground border-border/50 rounded-md">
                          {FREQUENCY_LABEL[sub.billingFrequency]}
                        </Badge>
                      </TableCell>

                      {/* True monthly cost */}
                      <TableCell className="hidden md:table-cell py-3 text-right">
                        <span className="text-sm text-muted-foreground font-mono">
                          {formatCurrency(sub.trueMonthlyCost, currency)}
                        </span>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="py-3 text-right">
                        <span className="font-bold text-sm font-mono">
                          {formatCurrency(Number(sub.cost), currency)}
                        </span>
                      </TableCell>

                      {/* Delete */}
                      <TableCell className="py-3 pr-3 text-right">
                        <DeleteSubscriptionButton id={sub.id} name={sub.name} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
