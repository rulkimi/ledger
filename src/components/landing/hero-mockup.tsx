"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { CalendarDays, ChevronRight, Sparkles, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";

const ROAST_TEXTS = {
  ENABLER: [
    "RM 539.90 next month! Adobe and ChatGPT are great tools. A Gym membership is a solid investment in yourself. Keep crushing it! ✨",
    "RM 539.90 looks scary, but Adobe and the gym are investing in your future. Don't sweat it. 💪",
    "RM 539.90 is just the cost of doing business when you're a creative beast. Keep those subs rolling! 🎨",
    "RM 539.90 next month! Treat yourself to that Gym membership, health is wealth. 🌟",
    "RM 539.90 coming up! ChatGPT is basically your second brain, totally worth every penny. 🧠",
    "RM 539.90. You work hard, you deserve Adobe and Spotify to keep the vibes high. 🎧",
    "RM 539.90 due soon. Don't worry about the cost, focus on the value these apps bring to your life. ✨",
    "RM 539.90. A Gym and Adobe? You're building your body and your portfolio. Huge W. 🏆",
    "RM 539.90. Money comes and goes, but the gains from that gym membership are forever. 💪",
    "RM 539.90. It's an investment in your productivity. Keep stacking those wins! 🚀"
  ],
  MEDIUM: [
    "RM 539.90. You're paying for Adobe and a Gym membership. Are you actually using them enough to justify RM 355/mo? Time for a trim? 🤔",
    "RM 539.90 total. Maybe review that Adobe sub if you haven't opened Photoshop in 3 weeks. Just a thought. 🤨",
    "RM 539.90. Gym and ChatGPT are good, but maybe cancel Amazon Prime if you're not ordering stuff? 📦",
    "RM 539.90 coming up. You've got 6 active subs. Are you really utilizing all of them? 🧐",
    "RM 539.90. RM 120 for the gym is fine, but RM 235 for Adobe? Make sure you're getting your money's worth. 💸",
    "RM 539.90 due. Might be a good time to do an audit. Do you still need Spotify Premium if you use YouTube? 🎵",
    "RM 539.90 total. Not terrible, but RM 500+ on digital services and a gym is getting a bit heavy. 📉",
    "RM 539.90. A decent stack, but keeping Adobe year-round can be pricey if you only do seasonal work. 🤷‍♂️",
    "RM 539.90. You could save RM 1,440 a year by just hitting the park instead of the gym. Worth considering. 🌳",
    "RM 539.90. If you cancel just one of these, you'd have an extra RM 100+ for actual investments. 💡"
  ],
  ROASTER: [
    "RM 539.90 on 6 subs?! Statistically, you're probably paying RM 235 for Adobe just to crop PDFs and donating RM 120 to a gym you don't visit. Cancel them. 💀",
    "RM 539.90? You're basically financing the CEO of Adobe's third yacht. Stop paying for tools you don't use. 🤡",
    "RM 539.90. You pay RM 120 a month to feel guilty about not going to the gym. I'll roast you for free. Cancel it. 🗑️",
    "RM 539.90 on digital junk. You pay RM 95 for ChatGPT to write emails you could type in 10 seconds. Tragic. 🤦‍♂️",
    "RM 539.90. RM 55 for Netflix to fall asleep 10 minutes into a movie. You're bleeding cash for background noise. 📺",
    "RM 539.90. Spotify, Amazon, Netflix... you're subscribing to every distraction possible so you don't have to work on your goals. 🎯",
    "RM 539.90. I see an Adobe sub. Be honest, you haven't exported a single video this year. Cancel it and buy groceries. 🍞",
    "RM 539.90 on 6 subscriptions. Your bank account is screaming, but at least you have 'Premium' music. Priorities, right? 💸",
    "RM 539.90. You're spending a small car payment on apps. Time to touch grass and cancel half of this list. 🌿",
    "RM 539.90. If you invested this instead, you'd actually have wealth. Instead you have a pristine, unused gym pass. 🤡"
  ]
};

export function HeroMockup() {
  const [roastLevel, setRoastLevel] = useState<"ENABLER" | "MEDIUM" | "ROASTER">("MEDIUM");
  const [typedText, setTypedText] = useState("");
  const { play } = useSound();

  // Typing effect for Cento
  useEffect(() => {
    let i = 0;
    setTypedText("");
    
    const variants = ROAST_TEXTS[roastLevel];
    const targetText = variants[Math.floor(Math.random() * variants.length)];

    const timer = setInterval(() => {
      setTypedText(targetText.slice(0, i));
      i++;
      if (i > targetText.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [roastLevel]);

  return (
    <div className="w-full max-w-5xl mx-auto relative perspective-1000">
      {/* Background glow */}
      <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full opacity-50 -z-10 animate-pulse" />

      {/* Main App Window Mockup */}
      <motion.div 
        initial={{ opacity: 0, y: 40, rotateX: 5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: "spring", bounce: 0.1, duration: 1.2 }}
        className="rounded-2xl border border-border/60 bg-background overflow-hidden flex flex-col shadow-2xl relative"
      >
        {/* Fake Window Header */}
        <div className="h-12 liquid-glass border-b border-border/40 flex items-center px-4 sm:px-6 relative z-20">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="text-xs font-bold tracking-tight text-muted-foreground ml-2">NetLedger Dashboard Overview</div>
          </div>
        </div>

        {/* Simplified Dashboard Content */}
        <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4 bg-muted/5">
          {/* Grid: Next Month Preview & Cento Thinks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Next Month Preview Card */}
            <div className="flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card min-h-0 h-[400px]">
              <div className="flex-shrink-0 flex items-center justify-between px-4 h-12 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold">Due in <span className="text-foreground">August 2026</span></p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">6 payments</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-sm font-bold font-mono">RM 539.90</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border/40 min-h-0">
                {[
                  { d: "2 Aug", n: "Netflix", c: "Entertainment", raw: "55.00", freq: "/mo", a: "55.00" },
                  { d: "5 Aug", n: "Spotify Premium", c: "Entertainment", raw: "14.90", freq: "/mo", a: "14.90" },
                  { d: "14 Aug", n: "Gym Membership", c: "Health", raw: "1,440.00", freq: "/yr", a: "120.00" },
                  { d: "18 Aug", n: "Amazon Prime", c: "Shopping", raw: "20.00", freq: "/mo", a: "20.00" },
                  { d: "21 Aug", n: "Adobe Creative Cloud", c: "Software", raw: "235.00", freq: "/mo", a: "235.00" },
                  { d: "28 Aug", n: "ChatGPT Plus", c: "Software", raw: "95.00", freq: "/mo", a: "95.00" },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-muted/20">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground w-10 sm:w-12 flex-shrink-0 text-left">{h.d}</span>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate">{h.n}</p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{h.c}</p>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-end min-w-[70px]">
                      <p className="text-xs font-mono text-muted-foreground">RM {h.raw}</p>
                      <p className="text-[10px] text-muted-foreground/50">{h.freq}</p>
                    </div>

                    <div className="flex flex-col items-end min-w-[60px] sm:min-w-[80px] flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-bold font-mono">RM {h.a}</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground/50">/mo</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 h-14 bg-muted/20 border-t border-border/40 flex items-center justify-between px-4">
                <span className="text-sm font-medium text-muted-foreground">Total to prepare</span>
                <span className="text-lg font-bold font-mono text-primary">RM 539.90</span>
              </div>
            </div>

            {/* Cento Thinks Card with Embedded Settings */}
            <div className="flex flex-col gap-3 h-[400px]">
              <div className="flex-1 rounded-xl border border-border/60 bg-card p-5 relative overflow-hidden flex flex-col shadow-sm">
                
                {/* Header & Roast Level Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Sparkles className="h-4 w-4" /> Cento&apos;s Verdict
                  </div>
                  
                  {/* Interactive settings directly on the card for the mockup */}
                  <div className="flex w-full sm:w-auto bg-muted/50 rounded-lg p-0.5 border border-border/50">
                    {(["ENABLER", "MEDIUM", "ROASTER"] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => { play("click"); setRoastLevel(level); }}
                        className={`flex-1 sm:flex-none text-[9px] font-bold px-2 py-1.5 sm:py-1 rounded-md transition-all ${roastLevel === level ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {level === "ROASTER" ? "RAGE" : level}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Real Cento Verdict block styling */}
                <div className="bg-muted/20 border border-border/50 rounded-xl p-5 text-sm italic text-muted-foreground flex-1 flex flex-col justify-center">
                  <p className="leading-relaxed">
                    {typedText}
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-3.5 bg-primary align-middle ml-1"
                    />
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
