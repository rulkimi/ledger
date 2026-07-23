"use client";

import { motion, AnimatePresence } from "motion/react";

export function AnimatedList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border/70 min-h-0 relative">
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  );
}

export function AnimatedListItem({ children, id }: { children: React.ReactNode, id: string }) {
  return (
    <motion.div
      key={id}
      layout
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95, overflow: "hidden" }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="group flex items-center gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors bg-card relative"
    >
      {children}
    </motion.div>
  );
}
