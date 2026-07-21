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

/** Short suffix shown inline with an amount: "/wk", "/mo", "/6mo", "/yr" */
export const FREQUENCY_SHORT: Record<BillingFrequency, string> = {
  [BillingFrequency.WEEKLY]:      "/wk",
  [BillingFrequency.MONTHLY]:     "/mo",
  [BillingFrequency.BI_ANNUALLY]: "/6mo",
  [BillingFrequency.YEARLY]:      "/yr",
};

export type NormalizeView = "original" | "weekly" | "monthly" | "yearly";

/** Normalize a cost to a chosen view period */
export function calculateNormalizedCost(
  cost: number,
  frequency: BillingFrequency,
  view: NormalizeView
): number {
  const annualCost = cost * FREQUENCY_MULTIPLIER[frequency];
  switch (view) {
    case "weekly":   return annualCost / 52;
    case "monthly":  return annualCost / 12;
    case "yearly":   return annualCost;
    default:         return cost;          // "original" — raw billing amount
  }
}

export const NORMALIZE_VIEW_LABEL: Record<NormalizeView, string> = {
  original: "Original",
  weekly:   "Weekly",
  monthly:  "Monthly",
  yearly:   "Yearly",
};

export const NORMALIZE_VIEW_SUFFIX: Record<NormalizeView, string> = {
  original: "",
  weekly:   "/wk",
  monthly:  "/mo",
  yearly:   "/yr",
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

export interface CalendarPayment {
  name:     string;
  date:     Date;
  amount:   number;
  category: string | null;
}

export interface CalendarMonth {
  label:    string;   // "Aug 2026"
  total:    number;
  payments: CalendarPayment[];
}

/**
 * Build a 12-month calendar of actual payments for each subscription.
 * Each month contains the individual payments that physically land in it.
 */
export function buildYearlyCalendar(
  subscriptions: Array<{
    name:             string;
    startDate:        Date;
    billingFrequency: BillingFrequency;
    cost:             number;
    category:         string | null;
  }>,
  currentDate: Date = new Date()
): CalendarMonth[] {
  const months: CalendarMonth[] = [];

  for (let i = 0; i < 12; i++) {
    const d     = addMonths(currentDate, i);
    const label = d.toLocaleDateString("en-MY", { month: "short", year: "numeric" });
    months.push({ label, total: 0, payments: [] });
  }

  const endDate = addMonths(currentDate, 12);

  for (const sub of subscriptions) {
    let next = calculateNextPaymentDate(sub.startDate, sub.billingFrequency, currentDate);
    while (next <= endDate) {
      const label = next.toLocaleDateString("en-MY", { month: "short", year: "numeric" });
      const month = months.find((m) => m.label === label);
      if (month) {
        month.total += sub.cost;
        month.payments.push({
          name:     sub.name,
          date:     new Date(next),
          amount:   sub.cost,
          category: sub.category,
        });
      }
      next = advanceByFrequency(next, sub.billingFrequency);
    }
  }

  // Sort payments within each month by date
  for (const month of months) {
    month.payments.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  return months;
}

