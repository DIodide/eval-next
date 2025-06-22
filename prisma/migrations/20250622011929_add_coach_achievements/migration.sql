-- CreateTable
CREATE TABLE "coach_achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coach_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "date_achieved" DATE NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_achievements_coach_id_idx" ON "coach_achievements"("coach_id");

-- CreateIndex
CREATE INDEX "coach_achievements_date_achieved_idx" ON "coach_achievements"("date_achieved");

-- AddForeignKey
ALTER TABLE "coach_achievements" ADD CONSTRAINT "coach_achievements_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
