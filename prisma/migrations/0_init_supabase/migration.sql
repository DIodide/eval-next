-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "school" TEXT,
    "coach_email" TEXT,
    "guardian_email" TEXT,
    "gpa" DECIMAL(3,2),
    "transcript" TEXT,
    "highest_ranks" JSONB,
    "trackergg_profile" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "games_played" JSONB[],

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

