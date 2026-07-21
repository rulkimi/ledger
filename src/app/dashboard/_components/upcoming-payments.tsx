import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateNextPaymentDate } from "@/lib/subscription-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarClock, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function UpcomingPayments({ category }: { category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const whereClause = { userId: session.user.id, ...(category ? { category } : {}) };

  const subscriptions = await prisma.subscription.findMany({
    where: whereClause,
  });

  const currentDate = new Date();

  const timeline = subscriptions.map((sub) => {
    const nextDate = calculateNextPaymentDate(sub.startDate, sub.billingFrequency, currentDate);
    return {
      ...sub,
      nextPaymentDate: nextDate,
    };
  }).sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime());

  return (
    <Card className="shadow-md h-full flex flex-col rounded-2xl border-border/60">
      <CardHeader className="border-b bg-muted/10 py-5">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Upcoming Payments Timeline
          </div>
          <Badge variant="secondary" className="font-mono">{timeline.length} Bills</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        {timeline.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center h-full">
            <div className="bg-muted rounded-full p-4 mb-4">
              <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-xl font-semibold text-foreground">No subscriptions found</p>
            <p className="text-md text-muted-foreground mt-1">Try adjusting your filters or add a new bill.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-sm">
              <TableRow>
                <TableHead className="pl-6 h-12 text-xs uppercase tracking-wider font-bold">Subscription</TableHead>
                <TableHead className="h-12 text-xs uppercase tracking-wider font-bold">Next Due Date</TableHead>
                <TableHead className="h-12 text-xs uppercase tracking-wider font-bold">Frequency</TableHead>
                <TableHead className="text-right pr-6 h-12 text-xs uppercase tracking-wider font-bold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeline.map((sub) => {
                const daysUntil = Math.ceil((sub.nextPaymentDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 7;
                
                return (
                  <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors h-16 group">
                    <TableCell className="pl-6">
                      <div className="font-semibold text-[15px]">{sub.name}</div>
                      {sub.category && (
                        <div className="text-xs font-medium text-muted-foreground/80 mt-0.5">{sub.category}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className={isUrgent ? "text-destructive font-bold" : "font-medium"}>
                          {format(sub.nextPaymentDate, "MMM do, yyyy")}
                        </span>
                        {isUrgent && (
                          <Badge variant="destructive" className="text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-sm">
                            In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs font-medium text-muted-foreground border-muted-foreground/30 bg-muted/10 group-hover:bg-muted/50 transition-colors">
                        {sub.billingFrequency.toLowerCase().replace('_', '-')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-bold tabular-nums text-[15px]">
                      ${Number(sub.cost).toFixed(2)}
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
