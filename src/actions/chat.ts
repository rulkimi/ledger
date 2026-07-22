"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function getLatestChatSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let chatSession = await prisma.chatSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        messages: [],
      },
    });
  }

  return chatSession;
}

export async function getAllChatSessions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  
  // Return them sorted chronologically (oldest left, newest right) like browser tabs
  return sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function createNewChatSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Enforce max 5 chats limit
  const currentSessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "asc" },
  });

  if (currentSessions.length >= 5) {
    // Delete the oldest ones to make room (keep the newest 4)
    const toDelete = currentSessions.slice(0, currentSessions.length - 4);
    await prisma.chatSession.deleteMany({
      where: { id: { in: toDelete.map(s => s.id) } },
    });
  }

  return prisma.chatSession.create({
    data: {
      userId: session.user.id,
      messages: [],
    },
  });
}

export async function getChatSessionById(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chatSession = await prisma.chatSession.findUnique({
    where: { id },
  });

  if (!chatSession || chatSession.userId !== session.user.id) {
    throw new Error("Unauthorized or not found");
  }

  return chatSession;
}

export async function saveChatSession(id: string, messages: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const existing = await prisma.chatSession.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized or not found");
  }

  let newTitle = existing.title;
  
  // If it's a new chat and the first message is from the user, set the title
  if (existing.title === "New Chat" && messages.length > 0) {
    const firstUserMsg = messages.find(m => m.role === "user");
    if (firstUserMsg && typeof firstUserMsg.content === "string") {
      try {
        const response = await generateText({
          model: google("gemini-3.5-flash"),
          system: "You are a helpful assistant. Create a very short, concise title (maximum 3-4 words) for a chat session that starts with the user's message. Do not use quotes or punctuation at the end. Be brief and descriptive.",
          prompt: firstUserMsg.content,
        });
        newTitle = response.text.trim().replace(/^["']|["']$/g, '');
      } catch (e) {
        console.error("Failed to generate title, falling back to snippet:", e);
        newTitle = firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "");
      }
    }
  }

  await prisma.chatSession.update({
    where: { id },
    data: {
      title: newTitle,
      messages: JSON.parse(JSON.stringify(messages)), // ensure valid JSON
    },
  });
}

export async function deleteChatSession(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.chatSession.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.chatSession.delete({
    where: { id },
  });
}
