-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "country" TEXT,
ADD COLUMN     "country_iso2" TEXT DEFAULT 'US',
ADD COLUMN     "discord_handle" TEXT,
ADD COLUMN     "in_state_tuition" TEXT,
ADD COLUMN     "minimum_act" INTEGER,
ADD COLUMN     "minimum_gpa" DECIMAL(3,2),
ADD COLUMN     "minimum_sat" INTEGER,
ADD COLUMN     "out_of_state_tuition" TEXT,
ADD COLUMN     "scholarships_available" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "social_links" JSONB;

-- CreateIndex
CREATE INDEX "schools_country_iso2_idx" ON "schools"("country_iso2");
