-- DropForeignKey
ALTER TABLE "school_association_requests" DROP CONSTRAINT "school_association_requests_coach_id_fkey";

-- AddForeignKey
ALTER TABLE "school_association_requests" ADD CONSTRAINT "school_association_requests_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
