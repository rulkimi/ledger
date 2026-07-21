"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { BillingFrequency } from "@/generated/prisma/client";

const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  cost: z.coerce.number().positive("Cost must be greater than 0"),
  billingFrequency: z.nativeEnum(BillingFrequency),
  startDate: z.coerce.date(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type SubscriptionInput = z.infer<typeof subscriptionSchema>;

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createSubscription(data: SubscriptionInput) {
  const userId = await getAuthenticatedUserId();
  const parsed = subscriptionSchema.parse(data);
  await prisma.subscription.create({ data: { ...parsed, userId } });
  revalidatePath("/dashboard");
}

export async function updateSubscription(id: string, data: SubscriptionInput) {
  const userId = await getAuthenticatedUserId();
  const parsed = subscriptionSchema.parse(data);
  await prisma.subscription.update({ where: { id, userId }, data: parsed });
  revalidatePath("/dashboard");
}

export async function deleteSubscription(id: string) {
  const userId = await getAuthenticatedUserId();
  await prisma.subscription.delete({ where: { id, userId } });
  revalidatePath("/dashboard");
}
