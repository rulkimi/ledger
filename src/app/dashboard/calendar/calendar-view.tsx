"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { LayoutGrid, List } from "lucide-react";

// Serialised version — dates come as ISO strings from Server Component
export interface SerializedPayment {
  name:     string;
  date:     string; // ISO string
  amount:   number;
  category: string | null;
}

export interface SerializedMonth {
  label:    string;
  total:    number;
  payments: SerializedPayment[];
}

interface Props {
  months:    SerializedMonth[];
  maxTotal:  number;
  grandTotal: number;
  currency:  string;
}

export function CalendarView({ months, maxTotal, grandTotal, currency }: Props) {
  const [detailed, setDetailed] = useState(false);

  return (
    <div className="h-full flex flex-col space-y-6 min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">12-Month Calendar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Actual payments per month — yearly/bi-annual bills spike the month they hit.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Total */}
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-muted-foreground">12-month total</p>
            <p className="text-base font-extrabold font-mono brand-text">{formatCurrency(grandTotal, currency)}</p>
          </div>

          {/* Toggle */}
          <div className="flex items-center border border-border/60 rounded-lg overflow-hidden">
            <button
              onClick={() => setDetailed(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                !detailed ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Simple</span>
            </button>
            <div className="w-px h-5 bg-border/60" />
            <button
              onClick={() => setDetailed(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                detailed ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Detailed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2 pb-10 min-h-0">
        <div className={`grid gap-4 ${detailed ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {months.map((month, idx) => {
          const isCurrentMonth = idx === 0;
          const barWidth       = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0;
          const isEmpty        = month.payments.length === 0;

          return (
            <div
              key={month.label}
              className={`rounded-2xl border overflow-hidden bg-card transition-all ${
                isCurrentMonth ? "border-primary/40 ring-1 ring-primary/20 shadow-sm" : "border-border/60"
              }`}
            >
              {/* Month header */}
              <div className={`p-4 sm:p-5 ${isCurrentMonth ? "bg-primary/5" : ""}`}>
                {/* Top row: Label + Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCurrentMonth ? "text-primary" : "text-muted-foreground"}`}>
                    {month.label}
                  </span>
                  {isCurrentMonth && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                      This month
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <span className="text-xl font-extrabold font-mono tracking-tight text-foreground">
                    {isEmpty ? (
                      <span className="text-muted-foreground/40 font-normal text-sm">—</span>
                    ) : (
                      formatCurrency(month.total, currency)
                    )}
                  </span>
                </div>

                {/* Spend bar */}
                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isEmpty ? "" : isCurrentMonth ? "brand-gradient" : "bg-primary/35"
                    }`}
                    style={{ width: isEmpty ? "0%" : `${Math.max(barWidth, 3)}%` }}
                  />
                </div>

                {/* Progress bar label info */}
                {!isEmpty && (
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground/60 font-medium mt-1">
                    {!detailed ? (
                      <span>{month.payments.length} payment{month.payments.length !== 1 ? "s" : ""}</span>
                    ) : (
                      <span />
                    )}
                    <span>{barWidth.toFixed(0)}% of peak month</span>
                  </div>
                )}
              </div>

              {/* Detailed: individual payment rows */}
              {detailed && !isEmpty && (
                <div className="divide-y divide-border/40">
                  {month.payments.map((p, pi) => (
                    <div key={pi} className="flex items-center justify-between px-4 py-2 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-mono text-muted-foreground/60 w-10 flex-shrink-0 tabular-nums">
                          {format(new Date(p.date), "d MMM")}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{p.name}</p>
                          {p.category && (
                            <p className="text-[10px] text-muted-foreground/50 truncate">{p.category}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-bold font-mono ml-3 flex-shrink-0">
                        {formatCurrency(p.amount, currency)}
                      </p>
                    </div>
                  ))}

                  {/* Footer total when multiple payments */}
                  {month.payments.length > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground">{month.payments.length} payments</span>
                      <span className="text-xs font-extrabold font-mono">{formatCurrency(month.total, currency)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}
