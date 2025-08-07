-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
