import { BillingFrequency } from "@/generated/prisma/client";

/**
 * Calculates the exact prorated monthly cost of a subscription to know how much
 * cash needs to be set aside per month.
 */
export function calculateTrueMonthlyCost(cost: number, frequency: BillingFrequency): number {
  switch (frequency) {
    case BillingFrequency.WEEKLY:
      return cost * (52 / 12);
    case BillingFrequency.MONTHLY:
      return cost;
    case BillingFrequency.BI_ANNUALLY:
      return cost / 6;
    case BillingFrequency.YEARLY:
      return cost / 12;
    default:
      throw new Error("Invalid billing frequency");
  }
}

/**
 * Dynamically calculates the next upcoming payment date based on the original start date.
 */
export function calculateNextPaymentDate(
  startDate: Date,
  frequency: BillingFrequency,
  currentDate: Date = new Date()
): Date {
  const nextDate = new Date(startDate);
  
  if (nextDate > currentDate) return nextDate;

  while (nextDate <= currentDate) {
    switch (frequency) {
      case BillingFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case BillingFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case BillingFrequency.BI_ANNUALLY:
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case BillingFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
  }

  return nextDate;
}
