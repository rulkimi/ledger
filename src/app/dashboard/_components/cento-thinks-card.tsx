"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, Loader2, Send, RefreshCw } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { createNewChatSession } from "@/actions/chat";
import { useSound } from "@/hooks/use-sound";

const SUGGESTIONS = [
  { icon: "🌶️", title: "Roast my spending", description: "Get a brutal reality check on your subscriptions.", prompt: "Roast my financial choices and tell me if my subscriptions are reasonable." },
  { icon: "🔍", title: "Find wasted money", description: "Identify unused or redundant subscriptions.", prompt: "Look through my subscriptions and suggest which ones I should probably cancel to save money." },
  { icon: "💸", title: "Add new expense", description: "Track a new recurring bill.", prompt: "I want to add a new subscription." },
  { icon: "✂️", title: "Cancel a sub", description: "Remove an expense from your ledger.", prompt: "I want to cancel one of my subscriptions." },
];

export default function CentoThinksCard({ className }: { className?: string }) {
  const [verdict, setVerdict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [starting, setStarting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { play } = useSound();
  // Keep play stable in closures across renders
  const playRef = useRef(play);
  playRef.current = play;
  // Tracks whether the fetch was triggered by a user action (vs initial page load)
  const isTriggeredRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function doFetch() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/cento-verdict");
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setVerdict(data.verdict);
            // Only play sound on user-triggered refreshes, not initial page load
            if (isTriggeredRef.current) playRef.current("success");
          }
        } else {
          if (active) setVerdict("I'm looking at your subscriptions... they look a bit questionable. Click below to chat about them!");
        }
      } catch (e) {
        console.error(e);
        if (active) setVerdict("I'm looking at your subscriptions... they look a bit questionable. Click below to chat about them!");
      } finally {
        isTriggeredRef.current = false;
        if (active) setLoading(false);
      }
    }

    doFetch();

    function handleRefresh() {
      if (active) {
        isTriggeredRef.current = true;
        doFetch();
      }
    }

    window.addEventListener("cento-refresh", handleRefresh);
    return () => {
      active = false;
      window.removeEventListener("cento-refresh", handleRefresh);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || starting) return;
    setStarting(true);
    try {
      const session = await createNewChatSession();
      router.push(`/dashboard/advisor?session=${session.id}&q=${encodeURIComponent(q)}`);
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  }

  return (
    <div className={`flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card ${className ?? ""}`}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 h-12 border-b border-border/40">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold">Cento&apos;s Verdict</p>
        {loading && verdict !== null && (
          <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground/40 ml-auto" />
        )}
      </div>

      {/* Verdict body */}
      <div className="p-4 flex flex-col justify-between gap-3 flex-1 min-h-0">
        {loading ? (
          <div className="flex-1 min-h-0 overflow-y-auto italic text-muted-foreground/60 bg-muted/20 px-3.5 py-3 rounded-xl border border-border/30 animate-pulse text-xs flex items-start gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0 mt-0.5" />
            Cento is analyzing your spending...
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin prose prose-sm dark:prose-invert max-w-none break-words italic text-muted-foreground/90 bg-muted/20 px-3.5 py-3 rounded-xl border border-border/30 text-xs leading-relaxed [&>p:not(:last-child)]:mb-3 [&>ul]:mt-1 [&>ul]:mb-3 [&>li]:mb-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {verdict || ""}
            </ReactMarkdown>
          </div>
        )}

        {/* Bottom controls — pinned to bottom by justify-between */}
        <div className="flex flex-col gap-3">
          {/* Quick suggestion compact buttons (2x2 grid) */}
          <div className="grid grid-cols-2 gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                disabled={starting}
                onClick={() => {
                  setQuestion(s.prompt);
                  setStarting(true);
                  createNewChatSession()
                    .then((session) => router.push(`/dashboard/advisor?session=${session.id}&q=${encodeURIComponent(s.prompt)}`))
                    .catch((err) => { console.error(err); setStarting(false); });
                }}
                className="flex items-center gap-2 p-2 bg-muted/20 hover:bg-muted/60 border border-border/50 rounded-lg transition-all text-left hover:border-primary/30 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className="font-medium text-[10px] text-muted-foreground group-hover:text-foreground line-clamp-1">{s.title}</span>
              </button>
            ))}
          </div>
          {/* Mini ask input */}
          <form onSubmit={handleAsk} className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={starting}
              placeholder="Ask Cento something..."
              className="flex-1 min-w-0 h-8 text-xs bg-muted/30 border border-border/50 rounded-lg px-3 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!question.trim() || starting}
              className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {starting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </form>

          {/* Open advisor link */}
          <Link
            href="/dashboard/advisor"
            className="group flex items-center justify-between w-full text-xs font-semibold py-2 px-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-primary"
          >
            <span>Open Cento</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
}
