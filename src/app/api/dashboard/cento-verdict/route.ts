import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { calculateTrueMonthlyCost, FREQUENCY_LABEL } from "@/lib/subscription-utils";
import { unstable_cache } from "next/cache";

// Cache LLM generation to avoid hitting Gemini on every request
const getCachedCentoThoughts = unstable_cache(
  async (formattedSubs: string, totalBurn: number, currency: string, monthlyIncome: number | null) => {
    const hasIncome = monthlyIncome !== null && monthlyIncome > 0;
    const incomeContext = hasIncome 
      ? `User's Monthly Income: ${currency} ${monthlyIncome}. Their "burn rate" (subs / income) is ${((totalBurn / monthlyIncome) * 100).toFixed(1)}%.` 
      : "User's monthly income is not configured in the app yet (DO NOT assume they are unemployed or broke, they just haven't entered it).";
    
    const response = await generateText({
      model: google("gemini-3.5-flash-lite"),
      system: "You are Cento, a sharp, opinionated financial subscription advisor. Write a punchy, easy-to-read summary analysis (1-2 short paragraphs, you may use a few brief bullet points if helpful) of the user's active subscriptions. Focus on their total monthly burn, burn rate (if income provided), and playfully roast any duplicate services or expensive categories. Keep it highly opinionated, sharp, and extremely concise. Do not start with greetings, introductions, or robotic transitions.",
      prompt: `User's preferred currency: ${currency}. Total Average Monthly Burn: ${totalBurn.toFixed(2)}. ${incomeContext} Active Subscriptions:\n${formattedSubs}`,
    });
    return response.text.trim();
  },
  ["cento-thoughts-cache"],
  { revalidate: 3600, tags: ["cento-thoughts"] } // cache for 1 hour
);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscriptions: { where: { isActive: true } } }
  });

  if (!user) return new Response("Unauthorized", { status: 401 });

  const subs = user.subscriptions;
  const monthlyIncome = user.monthlyIncome ? Number(user.monthlyIncome) : null;

  let verdictText = "";

  if (subs.length === 0) {
    verdictText = "Your ledger is completely clean! You aren't wasting any money on subscriptions yet. Click add to start tracking!";
  } else {
    try {
      const formattedSubs = subs
        .map(s => `- ${s.name}: RM${s.cost} (${FREQUENCY_LABEL[s.billingFrequency] || s.billingFrequency}) [${s.category}]`)
        .join("\n");
      const totalBurn = subs.reduce((acc, s) => acc + calculateTrueMonthlyCost(Number(s.cost), s.billingFrequency), 0);
      const currency = session.user.currency || "MYR";

      // Uses Next.js unstable_cache to serve cached result if parameters haven't changed
      verdictText = await getCachedCentoThoughts(formattedSubs, totalBurn, currency, monthlyIncome);
    } catch (e) {
      console.error("Failed to generate Cento's thoughts:", e);
      verdictText = "I'm looking at your subscriptions... they look a bit questionable. Click below to chat about them!";
    }
  }

  return Response.json({ verdict: verdictText });
}
