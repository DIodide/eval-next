/*
  Warnings:

  - You are about to drop the column `claimed_spots` on the `combines` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "combines" DROP COLUMN "claimed_spots",
ADD COLUMN     "class_years" TEXT[],
ADD COLUMN     "min_gpa" DECIMAL(3,2),
ADD COLUMN     "registered_spots" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "registration_deadline" TIMESTAMP(6),
ADD COLUMN     "required_roles" TEXT[];
