import { google } from "@ai-sdk/google";
import { streamText, createUIMessageStreamResponse, toUIMessageStream, convertToModelMessages } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Next.js App Router route handler for the Vercel AI SDK
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;
  const currency = session.user.currency ?? "MYR";

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

  const result = streamText({
    model: google("gemini-3.5-flash-lite"),
    messages: coreMessages,
    system: `You are Cento, a highly opinionated, sharp, and helpful financial subscription advisor (always ready to give your "2 cents").
You help users manage their subscriptions, analyze their spending, and you are NOT afraid to roast them for wasting money on redundant subscriptions (like having Netflix AND Hulu AND Max if they barely watch TV, or 4 different AI tools).
You MUST use your tools to fetch their actual subscription data before giving specific advice.
Always format currency in their preferred currency: ${currency}.
Today's date is: ${new Date().toISOString().split('T')[0]}. Use this to correctly calculate any relative dates the user mentions (e.g. "today", "yesterday", "last week").
CRITICAL: Keep your responses EXTREMELY concise. Use short bullet points, max 2-3 short sentences total per response. Get straight to the point. No fluff.
CRITICAL: You must ALWAYS output a short chat message BEFORE calling ANY tool (including getSubscriptions). If you are about to check their database, say something like "Let me take a look at your current subscriptions..." first.
CRITICAL: When the user asks to add or delete a subscription, ALWAYS call getSubscriptions first. After reviewing the data, output a genuine, personalized chat message analyzing their request (e.g., roasting them if they are adding a 3rd streaming service). DO NOT just say a robotic "Let me add that." Give real advice, and THEN call the tool to draft the addition/deletion.`,
    tools: {
      getSubscriptions: {
        description: "Get all current subscriptions and bills for the user.",
        inputSchema: z.object({}),
        execute: async () => {
          const subs = await prisma.subscription.findMany({ where: { userId } });
          return JSON.parse(JSON.stringify(subs));
        },
      },
      addSubscription: {
        description: "Call this tool to prompt the user to confirm adding a subscription. The UI will wait for them. The tool result will tell you if they Confirmed (and saved) or Canceled.",
        inputSchema: z.object({
          messageToUser: z.string().describe("Your genuine, personalized chat message analyzing their request (e.g. roasting them for a bad financial choice, or praising them). This will be shown to the user right above the confirmation card."),
          name: z.string(),
          cost: z.coerce.number(),
          billingFrequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY", "BI_ANNUALLY", "QUARTERLY"]),
          category: z.string().optional(),
          startDate: z.string().describe("ISO date string for when it started"),
          endDate: z.string().optional().describe("Optional ISO date string for when it ends (e.g. for installments or fixed-term subscriptions)"),
        }),
      },
      deleteSubscription: {
        description: "Call this tool to prompt the user to confirm deleting a subscription. The UI will wait for them. The tool result will tell you if they Confirmed (and deleted) or Canceled.",
        inputSchema: z.object({
          messageToUser: z.string().describe("Your genuine, personalized chat message analyzing their request (e.g. cheering them on for saving money). This will be shown to the user right above the confirmation card."),
          id: z.string(),
          name: z.string().describe("The name of the subscription being deleted, so the user knows what they are confirming."),
          cost: z.coerce.number(),
          billingFrequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY", "BI_ANNUALLY", "QUARTERLY"]),
          startDate: z.string().describe("ISO date string for when it started"),
        }),
      },
    },
  });

  console.log("SERVER: streamText result methods:", Object.keys(result).join(', '));
  console.log("SERVER: streamText result prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(result)).join(', '));

  return createUIMessageStreamResponse({ stream: toUIMessageStream(result) });
}
