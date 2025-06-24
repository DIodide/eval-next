-- CreateEnum
CREATE TYPE "SchoolAnnouncementType" AS ENUM ('GENERAL', 'TRYOUT', 'ACHIEVEMENT', 'FACILITY', 'SCHOLARSHIP', 'ALUMNI', 'EVENT', 'SEASON_REVIEW');

-- CreateTable
CREATE TABLE "school_announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "SchoolAnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_announcements_school_id_idx" ON "school_announcements"("school_id");

-- CreateIndex
CREATE INDEX "school_announcements_school_id_created_at_idx" ON "school_announcements"("school_id", "created_at");

-- CreateIndex
CREATE INDEX "school_announcements_school_id_type_idx" ON "school_announcements"("school_id", "type");

-- CreateIndex
CREATE INDEX "school_announcements_school_id_is_pinned_idx" ON "school_announcements"("school_id", "is_pinned");

-- CreateIndex
CREATE INDEX "school_announcements_created_at_idx" ON "school_announcements"("created_at");

-- AddForeignKey
ALTER TABLE "school_announcements" ADD CONSTRAINT "school_announcements_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_announcements" ADD CONSTRAINT "school_announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
