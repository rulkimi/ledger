// Currency utility — extend CURRENCIES to support more in future
export const CURRENCIES: Record<string, { symbol: string; locale: string; label: string }> = {
  MYR: { symbol: "RM", locale: "ms-MY", label: "Malaysian Ringgit (MYR)" },
  USD: { symbol: "$",  locale: "en-US", label: "US Dollar (USD)" },
  EUR: { symbol: "€",  locale: "de-DE", label: "Euro (EUR)" },
  GBP: { symbol: "£",  locale: "en-GB", label: "British Pound (GBP)" },
  SGD: { symbol: "S$", locale: "en-SG", label: "Singapore Dollar (SGD)" },
};

export const DEFAULT_CURRENCY = "MYR";

export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const config = CURRENCIES[currency] ?? CURRENCIES[DEFAULT_CURRENCY];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  return CURRENCIES[currency]?.symbol ?? CURRENCIES[DEFAULT_CURRENCY].symbol;
}
