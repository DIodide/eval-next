/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `schools` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "esports_titles" TEXT[],
ADD COLUMN     "slug" TEXT,
ALTER COLUMN "state" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "schools_slug_key" ON "schools"("slug");
