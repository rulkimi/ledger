"use client";

import { useState } from "react";
import { Flame, Pencil, Check, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { updateMonthlyIncome } from "@/actions/user";
import { useSound } from "@/hooks/use-sound";

export function BurnRateCard({ 
  monthlyExpenses, 
  income, 
  currency 
}: { 
  monthlyExpenses: number; 
  income: number | null; 
  currency: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(income ? income.toString() : "");
  const [loading, setLoading] = useState(false);
  const { play } = useSound();

  const burnRate = income ? (monthlyExpenses / income) * 100 : 0;
  
  // Decide what to show
  let valueStr = "Set Income";
  let labelStr = "Calculate Burn Rate";
  let isDanger = false;

  if (income) {
    valueStr = `${burnRate.toFixed(1)}%`;
    labelStr = `Burn Rate`;
    isDanger = burnRate > 40; // over 40% of income on subs is dangerous
  }

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const parsed = parseFloat(inputValue);
      await updateMonthlyIncome(isNaN(parsed) ? null : parsed);
      play("success");
      window.dispatchEvent(new CustomEvent("cento-refresh"));
      setIsEditing(false);
    } catch (e) {
      play("error");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card flex flex-col items-center justify-center gap-1.5 px-2 py-3 sm:flex-row sm:px-4 sm:py-3 w-full h-full relative">
        <input 
          autoFocus
          type="number" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Monthly RM..."
          className="w-full text-center sm:text-left text-xs bg-muted/30 border border-border/50 rounded px-2 py-1 outline-none focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") { setIsEditing(false); setInputValue(income ? income.toString() : ""); }
          }}
        />
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => { play("click"); setIsEditing(true); }}
      className="bg-card flex flex-col items-center justify-center gap-0.5 px-1 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3 hover:bg-muted/20 transition-colors group text-left w-full h-full"
    >
      <div className="relative">
        <Flame className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${isDanger ? "text-destructive" : "text-primary"}`} />
        <div className="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="h-2 w-2 text-muted-foreground" />
        </div>
      </div>
      <div className="min-w-0 text-center sm:text-left">
        <p className={`text-[11px] sm:text-sm font-bold truncate ${isDanger ? "text-destructive" : "text-foreground"}`}>
          {valueStr}
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight truncate">
          {labelStr}
        </p>
      </div>
    </button>
  );
}
