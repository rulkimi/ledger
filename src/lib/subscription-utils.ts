import { BillingFrequency } from "@/generated/prisma/client";
import { addDays, addMonths, addWeeks, addYears, differenceInDays } from "date-fns";

/** How many times per year this frequency fires */
export const FREQUENCY_MULTIPLIER: Record<BillingFrequency, number> = {
  [BillingFrequency.WEEKLY]:      52,
  [BillingFrequency.MONTHLY]:     12,
  [BillingFrequency.BI_ANNUALLY]: 2,
  [BillingFrequency.YEARLY]:      1,
};

export const FREQUENCY_LABEL: Record<BillingFrequency, string> = {
  [BillingFrequency.WEEKLY]:      "Weekly",
  [BillingFrequency.MONTHLY]:     "Monthly",
  [BillingFrequency.BI_ANNUALLY]: "Bi-Annually",
  [BillingFrequency.YEARLY]:      "Yearly",
};

/** True prorated monthly cost for any frequency */
export function calculateTrueMonthlyCost(cost: number, frequency: BillingFrequency): number {
  return (cost * FREQUENCY_MULTIPLIER[frequency]) / 12;
}

/** Advance a date by one billing period */
function advanceByFrequency(date: Date, frequency: BillingFrequency): Date {
  switch (frequency) {
    case BillingFrequency.WEEKLY:      return addWeeks(date, 1);
    case BillingFrequency.MONTHLY:     return addMonths(date, 1);
    case BillingFrequency.BI_ANNUALLY: return addMonths(date, 6);
    case BillingFrequency.YEARLY:      return addYears(date, 1);
  }
}

/** Next payment date on or after today, rolling from startDate */
export function calculateNextPaymentDate(
  startDate: Date,
  frequency: BillingFrequency,
  currentDate: Date = new Date()
): Date {
  let next = new Date(startDate);
  if (next > currentDate) return next;
  while (next <= currentDate) {
    next = advanceByFrequency(next, frequency);
  }
  return next;
}

/** All payments in the next N months for a subscription */
export function getPaymentsInWindow(
  startDate: Date,
  frequency: BillingFrequency,
  cost: number,
  months: number,
  currentDate: Date = new Date()
): Array<{ date: Date; amount: number }> {
  const endDate = addMonths(currentDate, months);
  const payments: Array<{ date: Date; amount: number }> = [];
  let next = calculateNextPaymentDate(startDate, frequency, currentDate);
  while (next <= endDate) {
    payments.push({ date: new Date(next), amount: cost });
    next = advanceByFrequency(next, frequency);
  }
  return payments;
}

export interface MonthlyBreakdown {
  month: string;  // "Jul 2026"
  total: number;
}

/** Aggregate payments into monthly totals for N months ahead */
export function buildMonthlyProjection(
  subscriptions: Array<{ startDate: Date; billingFrequency: BillingFrequency; cost: number }>,
  months: number = 6,
  currentDate: Date = new Date()
): MonthlyBreakdown[] {
  const buckets = new Map<string, number>();

  for (let i = 0; i < months; i++) {
    const d = addMonths(currentDate, i);
    const key = d.toLocaleDateString("en-MY", { month: "short", year: "numeric" });
    buckets.set(key, 0);
  }

  for (const sub of subscriptions) {
    const payments = getPaymentsInWindow(sub.startDate, sub.billingFrequency, sub.cost, months, currentDate);
    for (const payment of payments) {
      const key = payment.date.toLocaleDateString("en-MY", { month: "short", year: "numeric" });
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + payment.amount);
      }
    }
  }

  return Array.from(buckets.entries()).map(([month, total]) => ({ month, total }));
}

/** Days until next payment */
export function daysUntil(date: Date, from: Date = new Date()): number {
  return differenceInDays(date, from);
}
