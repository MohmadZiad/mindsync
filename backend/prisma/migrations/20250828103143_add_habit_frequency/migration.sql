-- CreateEnum
CREATE TYPE "public"."HabitFrequency" AS ENUM ('daily', 'weekly');

-- AlterTable
ALTER TABLE "public"."Habit" ADD COLUMN     "frequency" "public"."HabitFrequency" NOT NULL DEFAULT 'daily';
