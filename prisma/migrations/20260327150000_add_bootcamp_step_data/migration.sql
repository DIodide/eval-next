-- AlterTable (additive only - no data loss)
ALTER TABLE "user_lesson_progress" ADD COLUMN IF NOT EXISTS "step_data" JSONB;
