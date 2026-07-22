import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { calculateTrueMonthlyCost, FREQUENCY_LABEL } from "@/lib/subscription-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const subs = await prisma.subscription.findMany({
    where: { userId, isActive: true },
  });

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

      const response = await generateText({
        model: google("gemini-3.5-flash"),
        system: "You are Cento, a sharp, opinionated financial subscription advisor. Write a very brief, concise 2-sentence summary analysis or playful roast of the user's active subscriptions list. Focus on their total monthly burn, categories, or duplicate services if any. Keep it under 200 characters, straight to the point, sharp, and helpful. Do not start with greetings, introductions, or robotic transitions.",
        prompt: `User's preferred currency: ${currency}. Total Average Monthly Burn: ${totalBurn.toFixed(2)}. Active Subscriptions:\n${formattedSubs}`,
      });
      verdictText = response.text.trim();
    } catch (e) {
      console.error("Failed to generate Cento's thoughts:", e);
      verdictText = "I'm looking at your subscriptions... they look a bit questionable. Click below to chat about them!";
    }
  }

  if (verdictText.length > 250) {
    verdictText = verdictText.slice(0, 247) + "...";
  }

  return Response.json({ verdict: verdictText });
}
