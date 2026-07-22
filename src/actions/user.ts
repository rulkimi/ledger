"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateMonthlyIncome(income: number | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { monthlyIncome: income !== null ? income : null },
  });

  revalidatePath("/dashboard");
}

import bcrypt from "bcryptjs";

export async function updateProfile(data: { name?: string; email?: string; password?: string; currentPassword?: string; income?: number | null }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.income !== undefined) updateData.monthlyIncome = data.income !== null ? data.income : null;
  
  if (data.password) {
    if (!data.currentPassword) {
      throw new Error("Current password is required to set a new password.");
    }
    if (user.password) {
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) throw new Error("Incorrect current password.");
    }
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  revalidatePath("/dashboard");
}
