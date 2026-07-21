"use client";

import { motion } from "motion/react";
import React from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.3,
      }}
      className="h-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
