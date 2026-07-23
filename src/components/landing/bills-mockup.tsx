"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ChevronRight, Inbox, Sparkles, SlidersHorizontal } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

const BILLS_DATA = [
  { id: "1", name: "Gym Membership", category: "Health", nextDate: "14 Aug", daysUntil: 4, rawCost: 1440.00, freq: "/yr", monthlyBurn: 120.00, isUrgent: true },
  { id: "2", name: "Adobe Creative Cloud", category: "Software", nextDate: "21 Aug", daysUntil: 11, rawCost: 2820.00, freq: "/yr", monthlyBurn: 235.00, isUrgent: false },
  { id: "3", name: "Netflix", category: "Entertainment", nextDate: "2 Aug", daysUntil: 23, rawCost: 55.00, freq: "/mo", monthlyBurn: 55.00, isUrgent: false },
];

export function BillsMockup() {
  const [view, setView] = useState<"original" | "monthly">("original");
  const { play } = useSound();

  const handleSetView = (v: "original" | "monthly") => {
    if (v !== view) play("click");
    setView(v);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl relative"
    >
      {/* Header Area */}
      <div className="p-4 border-b border-border/40 bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold tracking-tight">Normalization Engine</span>
        </div>
        
        {/* Toggle View */}
        <div className="flex bg-muted rounded-lg p-0.5 border border-border/50">
          <button
            onClick={() => handleSetView("original")}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${view === "original" ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Raw View
          </button>
          <button
            onClick={() => handleSetView("monthly")}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${view === "monthly" ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Sparkles className="h-3 w-3" /> Monthly
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center px-4 py-2 bg-muted/30 border-b border-border/40">
        <span className="w-1.5 flex-shrink-0" />
        <span className="ml-3 flex-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Subscription</span>
        <span className="hidden sm:block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px] text-right ml-4">
          Next Due
        </span>
        <span className="hidden sm:block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px] text-right ml-4">
          {view === "original" ? "Monthly Burn" : "Original"}
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider min-w-[70px] text-right ml-4 ${view === "monthly" ? "text-primary" : "text-muted-foreground"}`}>
          {view === "monthly" ? "Equiv" : "Amount"}
        </span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border/40">
        {BILLS_DATA.map((bill) => (
          <div key={bill.id} className="flex items-center px-4 py-3 hover:bg-muted/20 transition-colors">
            {/* Status Dot */}
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${bill.isUrgent ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            
            {/* Name & Category */}
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{bill.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{bill.category}</p>
            </div>

            {/* Next Due Column */}
            <div className="hidden sm:flex flex-col items-end min-w-[70px] ml-4">
              <p className={`text-[11px] font-medium ${bill.isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                {bill.nextDate}
              </p>
              <p className={`text-[9px] ${bill.isUrgent ? "text-destructive/70 font-semibold" : "text-muted-foreground/50"}`}>
                in {bill.daysUntil}d
              </p>
            </div>

            {/* Middle Column (Animates between Burn and Original) */}
            <div className="hidden sm:flex min-w-[70px] ml-4 flex-col items-end relative h-[30px] overflow-hidden">
              <AnimatePresence mode="popLayout">
                {view === "original" ? (
                  <motion.div 
                    key="original-mid"
                    initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                    className="flex flex-col items-end w-full"
                  >
                    <p className="text-[11px] font-mono text-muted-foreground">RM {bill.monthlyBurn.toFixed(2)}</p>
                    <p className="text-[9px] text-muted-foreground/50">/mo</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="monthly-mid"
                    initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                    className="flex flex-col items-end w-full"
                  >
                    <p className="text-[11px] font-mono text-muted-foreground">RM {bill.rawCost.toFixed(2)}</p>
                    <p className="text-[9px] text-muted-foreground/50">{bill.freq}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column (Animates between Amount and Normalized) */}
            <div className="min-w-[70px] ml-4 flex flex-col items-end relative h-[30px] overflow-hidden">
              <AnimatePresence mode="popLayout">
                {view === "original" ? (
                  <motion.div 
                    key="original-right"
                    initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                    className="flex flex-col items-end w-full"
                  >
                    <p className="text-[11px] font-bold font-mono text-foreground">RM {bill.rawCost.toFixed(2)}</p>
                    <p className="text-[9px] text-muted-foreground/60">{bill.freq}</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="monthly-right"
                    initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                    className="flex flex-col items-end w-full"
                  >
                    <p className="text-[11px] font-bold font-mono text-primary">RM {bill.monthlyBurn.toFixed(2)}</p>
                    <p className="text-[9px] text-muted-foreground/60">/mo equiv.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        ))}
      </div>
      
      {/* Footer Total Row */}
      <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between px-4">
        <span className="text-xs font-medium text-muted-foreground">True Monthly Burn</span>
        <span className="text-sm font-bold font-mono text-primary">RM 410.00</span>
      </div>
    </motion.div>
  );
}
