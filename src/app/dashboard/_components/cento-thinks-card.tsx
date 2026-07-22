import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { calculateTrueMonthlyCost, FREQUENCY_LABEL } from "@/lib/subscription-utils";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { unstable_cache } from "next/cache";

// Cache LLM generation using unstable_cache to avoid hitting Gemini on every page load
const getCachedCentoThoughts = unstable_cache(
  async (formattedSubs: string, totalBurn: number, currency: string) => {
    const response = await generateText({
      model: google("gemini-3.5-flash"),
      system: "You are Cento, a sharp, opinionated financial subscription advisor. Write a very brief, concise 2-sentence summary analysis or playful roast of the user's active subscriptions list. Focus on their total monthly burn, categories, or duplicate services if any. Keep it under 200 characters, straight to the point, sharp, and helpful. Do not start with greetings, introductions, or robotic transitions.",
      prompt: `User's preferred currency: ${currency}. Total Average Monthly Burn: ${totalBurn.toFixed(2)}. Active Subscriptions:\n${formattedSubs}`,
    });
    return response.text.trim();
  },
  ["cento-thoughts-cache"],
  { revalidate: 3600, tags: ["cento-thoughts"] } // cache for 1 hour, or re-run when key changes
);

async function CentoThoughtsText() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true },
  });

  let latestMsgText = "";

  if (subs.length === 0) {
    latestMsgText = "Your ledger is completely clean! You aren't wasting any money on subscriptions yet. Click add to start tracking!";
  } else {
    try {
      const formattedSubs = subs
        .map(s => `- ${s.name}: RM${s.cost} (${FREQUENCY_LABEL[s.billingFrequency] || s.billingFrequency}) [${s.category}]`)
        .join("\n");
      const totalBurn = subs.reduce((acc, s) => acc + calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency), 0);
      const currency = session.user.currency || "MYR";

      // Pass variables to getCachedCentoThoughts. Next.js cache key checks these parameters
      latestMsgText = await getCachedCentoThoughts(formattedSubs, totalBurn, currency);
    } catch (e) {
      console.error("Failed to generate Cento's thoughts:", e);
      latestMsgText = "I'm looking at your subscriptions... they look a bit questionable. Click below to chat about them!";
    }
  }

  if (latestMsgText.length > 250) {
    latestMsgText = latestMsgText.slice(0, 247) + "...";
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words italic text-muted-foreground/90 bg-muted/20 p-3.5 rounded-xl border border-border/30 relative">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {latestMsgText}
      </ReactMarkdown>
    </div>
  );
}

export default function CentoThinksCard() {
  return (
    <div className="h-full flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card min-h-0">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
          <p className="text-xs font-semibold">Cento&apos;s Verdict</p>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto min-h-0">
        <Suspense fallback={
          <div className="italic text-muted-foreground/60 bg-muted/20 p-3.5 rounded-xl border border-border/30 animate-pulse text-xs">
            Cento is analyzing your spending...
          </div>
        }>
          <CentoThoughtsText />
        </Suspense>
        
        <Link
          href="/dashboard/advisor"
          className="mt-4 group flex items-center justify-between w-full text-xs font-semibold py-2 px-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-primary"
        >
          <span>Ask Cento For Advice</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
