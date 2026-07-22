"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CentoThinksCard() {
  const [verdict, setVerdict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchVerdict() {
      try {
        const res = await fetch("/api/dashboard/cento-verdict");
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setVerdict(data.verdict);
          }
        } else {
          if (active) {
            setVerdict("I'm looking at your subscriptions... they look a bit questionable. Click below to chat about them!");
          }
        }
      } catch (e) {
        console.error(e);
        if (active) {
          setVerdict("I'm looking at your subscriptions... they look a bit questionable. Click below to chat about them!");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    fetchVerdict();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="h-full flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card min-h-0">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">Cento&apos;s Verdict</p>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto min-h-0">
        <div className="flex-1 min-h-0 flex flex-col justify-center">
          {loading ? (
            <div className="italic text-muted-foreground/60 bg-muted/20 p-3.5 rounded-xl border border-border/30 animate-pulse text-xs flex items-center gap-2 justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              Cento is analyzing your spending...
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words italic text-muted-foreground/90 bg-muted/20 p-3.5 rounded-xl border border-border/30 relative">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {verdict || ""}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <Link
          href="/dashboard/advisor"
          className="mt-4 group flex items-center justify-between w-full text-xs font-semibold py-2 px-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-primary flex-shrink-0"
        >
          <span>Ask Cento For Advice</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
