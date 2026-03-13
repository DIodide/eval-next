DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConversationInitiator') THEN
    CREATE TYPE "ConversationInitiator" AS ENUM ('COACH', 'PLAYER');
  END IF;
END
$$;

ALTER TABLE "conversations"
ADD COLUMN IF NOT EXISTS "initiated_by" "ConversationInitiator" NOT NULL DEFAULT 'COACH',
ADD COLUMN IF NOT EXISTS "coach_is_starred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "coach_is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "player_is_starred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "player_is_archived" BOOLEAN NOT NULL DEFAULT false;

UPDATE "conversations"
SET
  "coach_is_starred" = COALESCE("is_starred", false),
  "coach_is_archived" = COALESCE("is_archived", false),
  "player_is_starred" = COALESCE("is_starred", false),
  "player_is_archived" = COALESCE("is_archived", false);

UPDATE "conversations" AS c
SET "initiated_by" = COALESCE(
  (
    SELECT (m."sender_type"::text)::"ConversationInitiator"
    FROM "messages" AS m
    WHERE m."conversation_id" = c."id"
    ORDER BY m."created_at" ASC, m."id" ASC
    LIMIT 1
  ),
  'COACH'::"ConversationInitiator"
);

CREATE INDEX IF NOT EXISTS "conversations_initiated_by_idx"
ON "conversations"("initiated_by");

CREATE INDEX IF NOT EXISTS "conversations_coach_is_archived_updated_at_idx"
ON "conversations"("coach_is_archived", "updated_at");

CREATE INDEX IF NOT EXISTS "conversations_player_is_archived_updated_at_idx"
ON "conversations"("player_is_archived", "updated_at");
