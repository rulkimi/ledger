import { google } from "@ai-sdk/google";
import { streamText, createUIMessageStreamResponse, toUIMessageStream, convertToModelMessages } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { buildCentoSystemPrompt } from "@/lib/cento-prompt";

// Next.js App Router route handler for the Vercel AI SDK
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;
  const currency = session.user.currency ?? "MYR";

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscriptions: true } });
  if (!user) return new Response("Unauthorized", { status: 401 });
  
  const subscriptions = user.subscriptions;
  const monthlyIncome = user.monthlyIncome ? Number(user.monthlyIncome) : null;

  const body = await req.json();
  const messages = body.messages || body; // Fallback if body is directly the array
  console.log("SERVER: Received messages:", JSON.stringify(messages, null, 2));
  // Shim to prevent convertToModelMessages from crashing on messages without parts, and filter out the 'continue' trigger
  const shimmedMessages = (messages || [])
    .filter((m: any) => m.content !== '___continue___')
    .map((m: any) => ({
      ...m,
      parts: m.parts || [{ type: 'text', text: m.content || '' }]
    }));

  const coreMessages = await convertToModelMessages(shimmedMessages);

  const baseContext = `Here is the user's current subscriptions/bills data (pre-fetched up-front):
${JSON.stringify(subscriptions, null, 2)}

User's Monthly Income: ${monthlyIncome ? `${currency} ${monthlyIncome}` : 'Not provided yet'}.

If income is known, factor it in. A ${currency} 50/month sub is a non-issue for someone earning ${currency} 10,000. Don't make it a big deal unless it actually is.
If income is 0 or "Not provided yet", don't assume they're broke. Just assume they haven't set it up yet. You can casually mention they can add their income in Settings if they want a burn rate breakdown.

Always format currency in their preferred currency: ${currency}.
Today's date is: ${new Date().toISOString().split('T')[0]}. Use this to correctly calculate any relative dates the user mentions (e.g. "today", "yesterday", "last week").
We also support a ONE_TIME billing frequency for one-time payments, debts, or single bills (where the payment is made once on the start date and doesn't recur in future months, and has no end date). If a user wants to track a one-time bill/debt, use ONE_TIME as the billingFrequency and omit the endDate.
CRITICAL: If a user specifies a future date for a one-time payment/debt (e.g., "I'm going to pay Farid in 2 months" or "due on Sept 15"), you MUST calculate that future target date relative to Today's date and set the 'startDate' parameter to that future target date (not today's date). A ONE_TIME payment is scheduled exactly on its 'startDate'.
CRITICAL: Keep your responses EXTREMELY concise. Max 2-3 short sentences or a few tight bullet points. No fluff, no filler.
Allow the user to log their one-time debts or payments using the ONE_TIME frequency instead of forcing them into monthly/yearly plans.
CRITICAL: When the user asks to add or delete a subscription, give a genuine, personalized take on it first — roast if it's actually ridiculous, advise if it's borderline, or just be chill if it's fine. Then call the tool. Don't just say "Let me add that."`;

  const finalSystemPrompt = buildCentoSystemPrompt(baseContext, user.centoRoastLevel, user.centoPrompt);

  const result = streamText({
    model: google("gemini-3.5-flash-lite"),
    messages: coreMessages,
    // @ts-expect-error - maxSteps is supported at runtime in this version of the Vercel AI SDK
    maxSteps: 5,
    system: finalSystemPrompt,
    tools: {
      addSubscription: {
        description: "Call this tool to prompt the user to confirm adding a subscription. The UI will wait for them. The tool result will tell you if they Confirmed (and saved) or Canceled.",
        inputSchema: z.object({
          messageToUser: z.string().describe("Your genuine, casual take on their request — roast only if it's actually absurd, give light advice if it's borderline, or just confirm if it's fine. No emojis. This will be shown to the user right above the confirmation card."),
          name: z.string(),
          cost: z.coerce.number(),
          billingFrequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY", "BI_ANNUALLY", "ONE_TIME"]),
          category: z.string().optional(),
          startDate: z.string().describe("ISO date string for when it started"),
          endDate: z.string().optional().describe("Optional ISO date string for when it ends (e.g. for installments or fixed-term subscriptions, omit for ONE_TIME)"),
        }),
      },
      deleteSubscription: {
        description: "Call this tool to prompt the user to confirm deleting a subscription. The UI will wait for them. The tool result will tell you if they Confirmed (and deleted) or Canceled.",
        inputSchema: z.object({
          messageToUser: z.string().describe("Your genuine, personalized chat message analyzing their request (e.g. cheering them on for saving money). This will be shown to the user right above the confirmation card."),
          id: z.string(),
          name: z.string().describe("The name of the subscription being deleted, so the user knows what they are confirming."),
          cost: z.coerce.number(),
          billingFrequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY", "BI_ANNUALLY", "ONE_TIME"]),
          startDate: z.string().describe("ISO date string for when it started"),
        }),
      },
    },
  });

  console.log("SERVER: streamText result methods:", Object.keys(result).join(', '));
  console.log("SERVER: streamText result prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(result)).join(', '));

  return createUIMessageStreamResponse({ stream: toUIMessageStream(result) });
}
