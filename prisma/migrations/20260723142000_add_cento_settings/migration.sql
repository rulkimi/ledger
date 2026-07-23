-- AlterTable
ALTER TABLE "User" ADD COLUMN "centoPrompt" TEXT,
ADD COLUMN "centoRoastLevel" TEXT NOT NULL DEFAULT 'MEDIUM';
