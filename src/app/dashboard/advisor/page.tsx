import { Metadata } from "next";
import { ChatUI } from "./chat-ui";

export const metadata: Metadata = {
  title: "AI Advisor | Ledger",
  description: "Your personal financial AI advisor.",
};

export default function AdvisorPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="border-b border-border/50 bg-muted/20 px-6 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center glow-ring">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground">Ledger AI</h1>
            <p className="text-xs text-muted-foreground">Powered by Gemini 3.5 Flash</p>
          </div>
        </div>
        
        {/* Chat UI */}
        <ChatUI />
      </div>
    </div>
  );
}
