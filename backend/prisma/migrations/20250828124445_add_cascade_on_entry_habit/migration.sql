-- DropForeignKey
ALTER TABLE "public"."Entry" DROP CONSTRAINT "Entry_habitId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
