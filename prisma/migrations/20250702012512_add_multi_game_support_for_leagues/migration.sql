/*
  Warnings:

  - You are about to drop the column `proposed_game_id` on the `league_association_requests` table. All the data in the column will be lost.
  - You are about to drop the column `game_id` on the `leagues` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,season]` on the table `leagues` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "league_association_requests" DROP CONSTRAINT "league_association_requests_proposed_game_id_fkey";

-- DropForeignKey
ALTER TABLE "leagues" DROP CONSTRAINT "leagues_game_id_fkey";

-- DropIndex
DROP INDEX "leagues_name_season_game_id_key";

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "created_by_league_id" UUID,
ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "league_association_requests" DROP COLUMN "proposed_game_id",
ADD COLUMN     "gameId" UUID,
ADD COLUMN     "proposed_custom_games" JSONB,
ADD COLUMN     "proposed_game_ids" JSONB;

-- AlterTable
ALTER TABLE "leagues" DROP COLUMN "game_id";

-- CreateTable
CREATE TABLE "league_games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "league_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "added_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "league_games_league_id_game_id_key" ON "league_games"("league_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_name_season_key" ON "leagues"("name", "season");

-- AddForeignKey
ALTER TABLE "league_association_requests" ADD CONSTRAINT "league_association_requests_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_created_by_league_id_fkey" FOREIGN KEY ("created_by_league_id") REFERENCES "leagues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_games" ADD CONSTRAINT "league_games_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_games" ADD CONSTRAINT "league_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
