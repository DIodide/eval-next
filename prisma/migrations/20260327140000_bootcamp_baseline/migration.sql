-- Bootcamp baseline migration.
--
-- Creates the bootcamp tables + BadgeType enum that were introduced in
-- commit 569688f ("bootcamp") but never had a migration file generated. Dev
-- and staging received these via `prisma db push`; production never did,
-- which caused later ALTER migrations to fail on missing tables.
--
-- Every statement is idempotent (IF NOT EXISTS or wrapped in DO blocks) so
-- this is a safe no-op on DBs that already have the schema and a real
-- create on DBs that don't. Zero data loss either way.

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "BadgeType" AS ENUM ('EVAL_VERIFIED', 'PROFILE_COMPLETE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "bootcamps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bootcamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "bootcamp_modules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bootcamp_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bootcamp_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "lessons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "video_url" TEXT,
    "video_hls_url" TEXT,
    "transcript_vtt_url" TEXT,
    "poster_url" TEXT,
    "duration_seconds" INTEGER,
    "chapters" JSONB,
    "content_markdown" TEXT NOT NULL,
    "common_questions" JSONB,
    "order_index" INTEGER NOT NULL,
    "requires_reflection" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "quizzes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lesson_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "passing_score" INTEGER NOT NULL,
    "questions" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_bootcamp_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "bootcamp_id" UUID NOT NULL,
    "started_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(6),
    "current_module_index" INTEGER NOT NULL DEFAULT 0,
    "completion_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_bootcamp_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_lesson_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "video_watched" BOOLEAN NOT NULL DEFAULT false,
    "quiz_passed" BOOLEAN NOT NULL DEFAULT false,
    "quiz_score" INTEGER,
    "quiz_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_quiz_answers" JSONB,
    "reflection_text" TEXT,
    "reflection_submitted_at" TIMESTAMP(6),
    "step_data" JSONB,
    "last_position_seconds" INTEGER,
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "player_badges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "badge_type" "BadgeType" NOT NULL,
    "earned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "player_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bootcamps_slug_key" ON "bootcamps"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "bootcamp_modules_bootcamp_id_idx" ON "bootcamp_modules"("bootcamp_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bootcamp_modules_bootcamp_id_slug_key" ON "bootcamp_modules"("bootcamp_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bootcamp_modules_bootcamp_id_order_index_key" ON "bootcamp_modules"("bootcamp_id", "order_index");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lessons_module_id_idx" ON "lessons"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_module_id_slug_key" ON "lessons"("module_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_module_id_order_index_key" ON "lessons"("module_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "quizzes_lesson_id_key" ON "quizzes"("lesson_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_bootcamp_progress_player_id_idx" ON "user_bootcamp_progress"("player_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_bootcamp_progress_bootcamp_id_idx" ON "user_bootcamp_progress"("bootcamp_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_bootcamp_progress_player_id_bootcamp_id_key" ON "user_bootcamp_progress"("player_id", "bootcamp_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_lesson_progress_player_id_idx" ON "user_lesson_progress"("player_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_lesson_progress_lesson_id_idx" ON "user_lesson_progress"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_lesson_progress_player_id_lesson_id_key" ON "user_lesson_progress"("player_id", "lesson_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "player_badges_player_id_idx" ON "player_badges"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "player_badges_player_id_badge_type_key" ON "player_badges"("player_id", "badge_type");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "bootcamp_modules" ADD CONSTRAINT "bootcamp_modules_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "bootcamp_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "user_bootcamp_progress" ADD CONSTRAINT "user_bootcamp_progress_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "user_bootcamp_progress" ADD CONSTRAINT "user_bootcamp_progress_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "player_badges" ADD CONSTRAINT "player_badges_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
