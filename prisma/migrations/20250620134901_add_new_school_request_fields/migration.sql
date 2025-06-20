-- DropForeignKey
ALTER TABLE "school_association_requests" DROP CONSTRAINT "school_association_requests_school_id_fkey";

-- DropIndex
DROP INDEX "school_association_requests_coach_id_school_id_key";

-- AlterTable
ALTER TABLE "school_association_requests" ADD COLUMN     "created_school_id" UUID,
ADD COLUMN     "is_new_school_request" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proposed_school_location" TEXT,
ADD COLUMN     "proposed_school_name" TEXT,
ADD COLUMN     "proposed_school_region" TEXT,
ADD COLUMN     "proposed_school_state" TEXT,
ADD COLUMN     "proposed_school_type" "SchoolType",
ADD COLUMN     "proposed_school_website" TEXT,
ALTER COLUMN "school_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "school_association_requests_is_new_school_request_idx" ON "school_association_requests"("is_new_school_request");

-- AddForeignKey
ALTER TABLE "school_association_requests" ADD CONSTRAINT "school_association_requests_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_association_requests" ADD CONSTRAINT "school_association_requests_created_school_id_fkey" FOREIGN KEY ("created_school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
