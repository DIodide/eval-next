-- CreateEnum
CREATE TYPE "LeagueAssociationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "league_administrators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "username" TEXT,
    "image_url" TEXT,
    "external_accounts" JSONB,
    "league" TEXT NOT NULL,
    "league_id" UUID,
    "title" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "league_administrators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_association_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "administrator_id" UUID NOT NULL,
    "league_id" UUID,
    "request_message" TEXT NOT NULL,
    "status" "LeagueAssociationStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "is_new_league_request" BOOLEAN NOT NULL DEFAULT false,
    "proposed_league_name" TEXT,
    "proposed_league_short_name" TEXT,
    "proposed_league_description" TEXT,
    "proposed_game_id" UUID,
    "proposed_region" TEXT,
    "proposed_state" TEXT,
    "proposed_tier" "LeagueTier",
    "proposed_season" TEXT,
    "proposed_format" TEXT,
    "proposed_founded_year" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "league_association_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "league_administrators_clerk_id_key" ON "league_administrators"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "league_administrators_email_key" ON "league_administrators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "league_administrators_username_key" ON "league_administrators"("username");

-- AddForeignKey
ALTER TABLE "league_administrators" ADD CONSTRAINT "league_administrators_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_association_requests" ADD CONSTRAINT "league_association_requests_administrator_id_fkey" FOREIGN KEY ("administrator_id") REFERENCES "league_administrators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_association_requests" ADD CONSTRAINT "league_association_requests_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_association_requests" ADD CONSTRAINT "league_association_requests_proposed_game_id_fkey" FOREIGN KEY ("proposed_game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
