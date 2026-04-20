-- AlterTable (additive only — no data loss).
-- Lessons gain media metadata for richer playback.
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_hls_url" TEXT;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "transcript_vtt_url" TEXT;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "poster_url" TEXT;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "duration_seconds" INTEGER;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "chapters" JSONB;

-- UserLessonProgress gains a resume-from-position column.
ALTER TABLE "user_lesson_progress" ADD COLUMN IF NOT EXISTS "last_position_seconds" INTEGER;
