/*
  Warnings:

  - Made the column `created_at` on table `player_embeddings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `player_embeddings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "player_embeddings" DROP CONSTRAINT "player_embeddings_player_id_fkey";

-- DropIndex
DROP INDEX "player_embeddings_vector_idx";

-- AlterTable
ALTER TABLE "player_embeddings" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "player_embeddings" ADD CONSTRAINT "player_embeddings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
