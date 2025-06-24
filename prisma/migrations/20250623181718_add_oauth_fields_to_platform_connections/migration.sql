-- AlterTable
ALTER TABLE "player_platform_connections" ADD COLUMN IF NOT EXISTS "oauth_provider" TEXT;
ALTER TABLE "player_platform_connections" ADD COLUMN IF NOT EXISTS "oauth_account_id" TEXT;
