"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { useSound } from "@/hooks/use-sound";

export function CalendarMockup() {
  const [mode, setMode] = useState<"SIMPLE" | "DETAILED">("DETAILED");
  const { play } = useSound();

  const MOCK_MONTHS = [
    { label: "AUGUST 2026", total: "RM 270.00", pct: 36, isCurrent: true, 
      items: [
        { d: "2 Aug", n: "Netflix", a: "RM 55.00" },
        { d: "14 Aug", n: "Gym", a: "RM 120.00" },
        { d: "28 Aug", n: "ChatGPT", a: "RM 95.00" }
      ] 
    },
    { label: "SEPTEMBER 2026", total: "RM 505.00", pct: 67, isCurrent: false, 
      items: [
        { d: "2 Sep", n: "Netflix", a: "RM 55.00" },
        { d: "14 Sep", n: "Gym", a: "RM 120.00" },
        { d: "28 Sep", n: "ChatGPT", a: "RM 95.00" },
        { d: "30 Sep", n: "Adobe CC", a: "RM 235.00" }
      ] 
    },
    { label: "OCTOBER 2026", total: "RM 750.00", pct: 100, isCurrent: false, 
      items: [
        { d: "2 Oct", n: "Netflix", a: "RM 55.00" },
        { d: "10 Oct", n: "Car Insur", a: "RM 480.00" },
        { d: "14 Oct", n: "Gym", a: "RM 120.00" },
        { d: "28 Oct", n: "ChatGPT", a: "RM 95.00" }
      ] 
    },
    { label: "NOVEMBER 2026", total: "RM 270.00", pct: 36, isCurrent: false, 
      items: [
        { d: "2 Nov", n: "Netflix", a: "RM 55.00" },
        { d: "14 Nov", n: "Gym", a: "RM 120.00" },
        { d: "28 Nov", n: "ChatGPT", a: "RM 95.00" }
      ] 
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto relative perspective-1000 mt-10">
      <motion.div 
        initial={{ opacity: 0, rotateY: -5 }}
        whileInView={{ opacity: 1, rotateY: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0.1, duration: 1 }}
        className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CalendarDays className="h-4 w-4 text-primary" />
            12-Month Calendar
          </div>
          
          <div className="flex bg-muted rounded-lg p-0.5 border border-border/50">
            <button 
              onClick={() => { play("click"); setMode("SIMPLE"); }}
              className={`p-1.5 rounded-md transition-all ${mode === "SIMPLE" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { play("click"); setMode("DETAILED"); }}
              className={`p-1.5 rounded-md transition-all ${mode === "DETAILED" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 bg-muted/5">
          {MOCK_MONTHS.map((m, i) => (
            <motion.div 
              key={m.label}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", bounce: 0 }}
              className={`rounded-xl border p-3 flex flex-col gap-3 transition-colors overflow-hidden
                ${m.isCurrent ? 'border-primary/40 ring-1 ring-primary/20 bg-primary/5' : 'border-border/60 bg-card'}
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{m.label}</p>
                    {m.isCurrent && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm font-semibold">This month</span>}
                  </div>
                  <p className="text-lg font-mono font-bold mt-1">{m.total}</p>
                </div>
                {mode === "SIMPLE" && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{m.items.length} subs</span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${m.pct > 80 ? 'bg-destructive/80' : 'bg-primary'}`} 
                />
              </div>

              {/* Detailed Mode Items */}
              <AnimatePresence initial={false}>
                {mode === "DETAILED" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-border/40 flex flex-col gap-1.5">
                      {m.items.map((item, j) => (
                        <div key={j} className="flex justify-between items-center text-[10px]">
                          <div className="flex gap-2">
                            <span className="font-mono text-muted-foreground">{item.d}</span>
                            <span className="font-medium">{item.n}</span>
                          </div>
                          <span className="font-mono font-bold">{item.a}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
