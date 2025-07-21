-- CreateEnum
CREATE TYPE "LeagueSchoolCreationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "league_school_creation_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "administrator_id" UUID NOT NULL,
    "status" "LeagueSchoolCreationStatus" NOT NULL DEFAULT 'PENDING',
    "request_message" TEXT NOT NULL,
    "admin_notes" TEXT,
    "requested_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(6),
    "reviewed_by" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "proposed_school_name" TEXT NOT NULL,
    "proposed_school_type" "SchoolType" NOT NULL,
    "proposed_school_location" TEXT NOT NULL,
    "proposed_school_state" TEXT NOT NULL,
    "proposed_school_region" TEXT,
    "proposed_school_website" TEXT,
    "created_school_id" UUID,

    CONSTRAINT "league_school_creation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "league_school_creation_requests_requested_at_idx" ON "league_school_creation_requests"("requested_at");

-- CreateIndex
CREATE INDEX "league_school_creation_requests_administrator_id_idx" ON "league_school_creation_requests"("administrator_id");

-- AddForeignKey
ALTER TABLE "league_school_creation_requests" ADD CONSTRAINT "league_school_creation_requests_administrator_id_fkey" FOREIGN KEY ("administrator_id") REFERENCES "league_administrators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_school_creation_requests" ADD CONSTRAINT "league_school_creation_requests_created_school_id_fkey" FOREIGN KEY ("created_school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
