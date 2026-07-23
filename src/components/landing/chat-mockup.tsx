"use client";

import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, CheckCircle2, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";

export function ChatMockup() {
  const [subs, setSubs] = useState([
    { id: 1, name: "Netflix", cost: 55.00 },
    { id: 2, name: "Spotify Premium", cost: 14.90 },
    { id: 3, name: "Gym Membership", cost: 120.00 },
    { id: 4, name: "Amazon Prime", cost: 20.00 },
    { id: 5, name: "Adobe Creative Cloud", cost: 235.00 },
    { id: 6, name: "ChatGPT Plus", cost: 95.00 },
  ]);

  type Message = {
    id: number;
    role: "user" | "ai";
    content?: string;
    tool?: {
      type: "ADD" | "DELETE";
      name: string;
      cost: number;
      status: "PENDING" | "CONFIRMED";
    };
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "ai", content: "Yo. I've been analyzing your ledger. You've got 6 subscriptions eating up RM 539.90 every month. Need help cutting the fat?" }
  ]);

  const [showAddAction, setShowAddAction] = useState(true);
  const [showDeleteAction, setShowDeleteAction] = useState(true);
  const [showRoastAction, setShowRoastAction] = useState(true);
  const [showWasteAction, setShowWasteAction] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleTriggerAdd = () => {
    play("click");
    setShowAddAction(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: "user", content: "Add Notion for RM 40/mo" }
    ]);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: "ai", content: "Got it. Before I add this, are you sure you need another productivity app? Just saying." },
        { 
          id: Date.now() + 1, 
          role: "ai", 
          tool: { type: "ADD", name: "Notion", cost: 40.00, status: "PENDING" } 
        }
      ]);
    }, 600);
  };

  const handleTriggerDelete = () => {
    play("click");
    setShowDeleteAction(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: "user", content: "Cancel Spotify" }
    ]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: "ai", content: "Smart move." },
        { 
          id: Date.now() + 1, 
          role: "ai", 
          tool: { type: "DELETE", name: "Spotify Premium", cost: 14.90, status: "PENDING" } 
        }
      ]);
    }, 600);
  };

  const handleTriggerRoast = () => {
    play("click");
    setShowRoastAction(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: "user", content: "Roast my spending" }
    ]);

    const total = subs.reduce((sum, s) => sum + s.cost, 0);
    const hasAdobe = subs.some(s => s.name.includes("Adobe"));
    const hasGym = subs.some(s => s.name.includes("Gym"));
    const hasNotion = subs.some(s => s.name.includes("Notion"));
    const hasSpotify = subs.some(s => s.name.includes("Spotify"));

    let roastMsg = `Alright, let's roast. RM ${total.toFixed(2)} on ${subs.length} subs? `;
    let burns = [];
    if (hasAdobe) burns.push("RM 235 on Adobe likely just to make memes");
    if (hasGym) burns.push("RM 120 for a gym you're probably avoiding");
    if (hasNotion) burns.push("RM 40 for Notion to organize a life you aren't living");
    if (hasSpotify) burns.push("RM 14.90 for Spotify just to listen to the same 3 songs");

    if (burns.length > 0) {
      roastMsg += `You're burning ${burns.join(", ")}, and throwing money away on the rest. Wake up.`;
    } else {
      roastMsg += `Even though you trimmed the fat, you're still bleeding cash. Have you looked at your grocery bills?`;
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: "ai", content: roastMsg }
      ]);
    }, 600);
  };

  const handleTriggerWaste = () => {
    play("click");
    setShowWasteAction(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: "user", content: "Find wasted money" }
    ]);

    const hasAdobe = subs.some(s => s.name.includes("Adobe"));
    const hasGym = subs.some(s => s.name.includes("Gym"));
    
    let wasteTotal = 0;
    let items = [];
    if (hasGym) { wasteTotal += 120; items.push("Gym"); }
    if (hasAdobe) { wasteTotal += 235; items.push("Adobe"); }

    let wasteMsg = "";
    if (wasteTotal > 0) {
      wasteMsg = `I found RM ${wasteTotal.toFixed(2)}/mo in potential waste. Be honest, how often do you actually go to that ${items.join(" or open ")}? Cancel the ones you're ignoring and save up to RM ${(wasteTotal * 12).toLocaleString()} a year.`;
    } else {
      wasteMsg = "You're surprisingly lean right now. I don't see any obvious huge waste. Just don't let it creep back up.";
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: "ai", content: wasteMsg }
      ]);
    }, 600);
  };

  const handleConfirmTool = (msgId: number, toolType: "ADD" | "DELETE", name: string, cost: number) => {
    play("success");
    // Update the message tool status
    setMessages(prev => prev.map(m => m.id === msgId && m.tool ? { ...m, tool: { ...m.tool, status: "CONFIRMED" } } : m));
    
    // Update subscriptions list
    if (toolType === "ADD") {
      setSubs(prev => [...prev, { id: Date.now(), name, cost }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), role: "ai", content: `Added ${name}. Try to actually use it this time.` }]);
      }, 500);
    } else {
      setSubs(prev => prev.filter(s => s.name !== name));
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), role: "ai", content: `Done. Removed ${name}. You're RM ${cost.toFixed(2)} richer every month.` }]);
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid md:grid-cols-5 gap-6 h-[500px]">
        
        {/* Chat UI (Left, wider) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0, duration: 0.8 }}
          className="md:col-span-3 rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-2xl flex flex-col h-full overflow-hidden relative"
        >
          <div className="h-14 border-b border-border/40 flex items-center px-4 bg-muted/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tracking-tight">Cento Chat</span>
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted/5 flex flex-col custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.content && (
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground"}`}>
                      {msg.content}
                    </div>
                  )}

                  {msg.tool && (
                    <div className="mt-1 p-3.5 rounded-xl border border-border/60 bg-card shadow-sm text-sm w-full max-w-[280px]">
                      <p className="font-semibold mb-2 flex items-center gap-2 text-foreground text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> 
                        {msg.tool.type === "ADD" ? "Add Subscription" : "Delete Subscription"}
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-muted-foreground mb-3 bg-muted/20 p-2.5 rounded-lg border border-border/40 text-[10px]">
                        <div className="col-span-2">Name: <span className="text-foreground font-medium">{msg.tool.name}</span></div>
                        <div>Cost: <span className="text-foreground font-medium">RM {msg.tool.cost.toFixed(2)}</span></div>
                        <div>Freq: <span className="text-foreground font-medium">Monthly</span></div>
                      </div>
                      
                      {msg.tool.status === "PENDING" ? (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] w-full" disabled>Cancel</Button>
                          <Button 
                            size="sm" 
                            variant={msg.tool.type === "DELETE" ? "destructive" : "default"}
                            className="h-7 text-[10px] w-full" 
                            onClick={() => handleConfirmTool(msg.id, msg.tool!.type, msg.tool!.name, msg.tool!.cost)}
                          >
                            Confirm {msg.tool.type === "DELETE" && <Trash2 className="w-3 h-3 ml-1" />}
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-3 p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] text-emerald-600 dark:text-emerald-400 font-medium text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Action Confirmed
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-3 sm:p-4 border-t border-border/40 bg-background flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar no-scrollbar">
              <AnimatePresence>
                {showAddAction && (
                  <motion.button 
                    exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }}
                    onClick={handleTriggerAdd}
                    className="flex-shrink-0 whitespace-nowrap bg-muted/40 hover:bg-muted border border-border/40 text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    Add Notion 📝
                  </motion.button>
                )}
                {showDeleteAction && (
                  <motion.button 
                    exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }}
                    onClick={handleTriggerDelete}
                    className="flex-shrink-0 whitespace-nowrap bg-muted/40 hover:bg-muted border border-border/40 text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    Cancel Spotify 🎵
                  </motion.button>
                )}
                {showRoastAction && (
                  <motion.button 
                    exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }}
                    onClick={handleTriggerRoast}
                    className="flex-shrink-0 whitespace-nowrap bg-muted/40 hover:bg-muted border border-border/40 text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🌶️ Roast my spending
                  </motion.button>
                )}
                {showWasteAction && (
                  <motion.button 
                    exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }}
                    onClick={handleTriggerWaste}
                    className="flex-shrink-0 whitespace-nowrap bg-muted/40 hover:bg-muted border border-border/40 text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    🔍 Find wasted money
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 border border-border/60 rounded-full px-4 py-2">
              <input disabled placeholder="Type your message..." className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground/50 cursor-not-allowed" />
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center opacity-50">
                <Send className="w-3.5 h-3.5 text-primary-foreground -ml-0.5" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Ledger View (Right, narrower) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.1 }}
          className="md:col-span-2 rounded-2xl border border-border/60 bg-card shadow-lg flex flex-col h-full overflow-hidden relative hidden md:flex"
        >
          <div className="h-14 border-b border-border/40 flex items-center px-5 bg-muted/10">
            <h3 className="text-sm font-bold tracking-tight text-foreground/80 uppercase">Active Subscriptions</h3>
          </div>
          <div className="flex-1 p-5 overflow-y-auto">
            <AnimatePresence initial={false}>
              {subs.map(sub => (
                <motion.div
                  key={sub.name}
                  layout
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
                >
                  <span className="text-sm font-medium">{sub.name}</span>
                  <span className="text-sm font-bold font-mono">RM {sub.cost.toFixed(2)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="p-5 bg-muted/20 border-t border-border/40 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Monthly Total</span>
            <span className="text-lg font-bold font-mono text-primary">
              RM {subs.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
