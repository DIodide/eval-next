-- CreateEnum
CREATE TYPE "SchoolAssociationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY');

-- CreateEnum
CREATE TYPE "TeamTier" AS ENUM ('ELITE', 'PROFESSIONAL', 'COMPETITIVE', 'DEVELOPMENTAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "TryoutStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'WAITLISTED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CombineStatus" AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LeagueTier" AS ENUM ('ELITE', 'PROFESSIONAL', 'COMPETITIVE', 'DEVELOPMENTAL');

-- CreateEnum
CREATE TYPE "LeagueStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'UPCOMING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RankingCategory" AS ENUM ('COMBINE', 'LEAGUE', 'OVERALL', 'TRYOUT');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('COACH', 'PLAYER');

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "username" TEXT,
    "image_url" TEXT,
    "external_accounts" JSONB,
    "location" TEXT,
    "bio" TEXT,
    "school" TEXT,
    "school_id" UUID,
    "gpa" DECIMAL(3,2),
    "transcript" TEXT,
    "class_year" TEXT,
    "graduation_date" TEXT,
    "intended_major" TEXT,
    "guardian_email" TEXT,
    "scholastic_contact" TEXT,
    "scholastic_contact_email" TEXT,
    "extra_curriculars" TEXT,
    "academic_bio" TEXT,
    "main_game_id" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "image_url" TEXT,
    "external_accounts" JSONB,
    "school" TEXT NOT NULL,
    "school_id" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_association_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coach_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "status" "SchoolAssociationStatus" NOT NULL DEFAULT 'PENDING',
    "request_message" TEXT,
    "admin_notes" TEXT,
    "requested_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(6),
    "reviewed_by" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_association_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_game_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "rank" TEXT,
    "rating" DOUBLE PRECISION,
    "role" TEXT,
    "agents" TEXT[],
    "preferred_maps" TEXT[],
    "play_style" TEXT,
    "combine_score" DOUBLE PRECISION,
    "league_score" DOUBLE PRECISION,
    "tracker_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_game_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_platform_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_platform_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_social_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_social_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "SchoolType" NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "school_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "coach_id" UUID,
    "tier" "TeamTier" NOT NULL DEFAULT 'COMPETITIVE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "role" TEXT,
    "position" TEXT,
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tryouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "long_description" TEXT,
    "game_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "coach_id" UUID,
    "date" TIMESTAMP(6) NOT NULL,
    "time_start" TEXT,
    "time_end" TEXT,
    "location" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "status" "TryoutStatus" NOT NULL DEFAULT 'DRAFT',
    "price" TEXT NOT NULL,
    "max_spots" INTEGER NOT NULL,
    "registered_spots" INTEGER NOT NULL DEFAULT 0,
    "registration_deadline" TIMESTAMP(6),
    "min_gpa" DECIMAL(3,2),
    "class_years" TEXT[],
    "required_roles" TEXT[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tryouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tryout_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tryout_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registered_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "tryout_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "long_description" TEXT,
    "game_id" UUID NOT NULL,
    "coach_id" UUID,
    "date" TIMESTAMP(6) NOT NULL,
    "time_start" TEXT,
    "time_end" TEXT,
    "location" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "year" TEXT NOT NULL,
    "max_spots" INTEGER NOT NULL,
    "claimed_spots" INTEGER NOT NULL DEFAULT 0,
    "prize_pool" TEXT NOT NULL,
    "format" TEXT,
    "status" "CombineStatus" NOT NULL,
    "requirements" TEXT NOT NULL,
    "invite_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combine_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "combine_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "registered_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "combine_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "game_id" UUID NOT NULL,
    "region" TEXT NOT NULL,
    "state" TEXT,
    "tier" "LeagueTier" NOT NULL,
    "season" TEXT NOT NULL,
    "status" "LeagueStatus" NOT NULL,
    "format" TEXT,
    "prize_pool" TEXT,
    "founded_year" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "league_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "season" TEXT NOT NULL,
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "league_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_schools" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "league_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "season" TEXT NOT NULL,
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_leagues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "league_id" UUID NOT NULL,
    "season" TEXT NOT NULL,
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eval_score" DOUBLE PRECISION,
    "main_agent" TEXT,
    "role" TEXT,
    "rank" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "games_played" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "player_leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_rankings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "season" TEXT,
    "category" "RankingCategory" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_performance_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "stats" JSONB NOT NULL,
    "match_type" TEXT NOT NULL,
    "match_id" UUID,
    "recorded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_performance_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "league_id" UUID,
    "team_a_id" UUID NOT NULL,
    "team_b_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(6) NOT NULL,
    "played_at" TIMESTAMP(6),
    "status" "MatchStatus" NOT NULL,
    "team_a_score" INTEGER,
    "team_b_score" INTEGER,
    "winner_id" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coach_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_favorites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coach_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "notes" TEXT,
    "tags" TEXT[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_clerk_id_key" ON "players"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players_username_key" ON "players"("username");

-- CreateIndex
CREATE INDEX "players_school_id_idx" ON "players"("school_id");

-- CreateIndex
CREATE INDEX "players_main_game_id_idx" ON "players"("main_game_id");

-- CreateIndex
CREATE INDEX "players_class_year_idx" ON "players"("class_year");

-- CreateIndex
CREATE INDEX "players_created_at_idx" ON "players"("created_at");

-- CreateIndex
CREATE INDEX "players_location_idx" ON "players"("location");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_clerk_id_key" ON "coaches"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_email_key" ON "coaches"("email");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_username_key" ON "coaches"("username");

-- CreateIndex
CREATE INDEX "school_association_requests_status_idx" ON "school_association_requests"("status");

-- CreateIndex
CREATE INDEX "school_association_requests_requested_at_idx" ON "school_association_requests"("requested_at");

-- CreateIndex
CREATE UNIQUE INDEX "school_association_requests_coach_id_school_id_key" ON "school_association_requests"("coach_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "games_name_key" ON "games"("name");

-- CreateIndex
CREATE UNIQUE INDEX "games_short_name_key" ON "games"("short_name");

-- CreateIndex
CREATE INDEX "player_game_profiles_player_id_game_id_idx" ON "player_game_profiles"("player_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_game_profiles_player_id_game_id_key" ON "player_game_profiles"("player_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_platform_connections_player_id_platform_key" ON "player_platform_connections"("player_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "player_social_connections_player_id_platform_key" ON "player_social_connections"("player_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_type_state_key" ON "schools"("name", "type", "state");

-- CreateIndex
CREATE UNIQUE INDEX "teams_school_id_game_id_name_key" ON "teams"("school_id", "game_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_player_id_key" ON "team_members"("team_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "tryout_registrations_tryout_id_player_id_key" ON "tryout_registrations"("tryout_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "combine_registrations_combine_id_player_id_key" ON "combine_registrations"("combine_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_name_season_game_id_key" ON "leagues"("name", "season", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "league_teams_league_id_team_id_season_key" ON "league_teams"("league_id", "team_id", "season");

-- CreateIndex
CREATE UNIQUE INDEX "league_schools_league_id_school_id_season_key" ON "league_schools"("league_id", "school_id", "season");

-- CreateIndex
CREATE UNIQUE INDEX "player_leagues_player_id_league_id_season_key" ON "player_leagues"("player_id", "league_id", "season");

-- CreateIndex
CREATE UNIQUE INDEX "player_rankings_player_id_game_id_category_season_key" ON "player_rankings"("player_id", "game_id", "category", "season");

-- CreateIndex
CREATE INDEX "player_performance_stats_player_id_game_id_idx" ON "player_performance_stats"("player_id", "game_id");

-- CreateIndex
CREATE INDEX "conversations_coach_id_idx" ON "conversations"("coach_id");

-- CreateIndex
CREATE INDEX "conversations_player_id_idx" ON "conversations"("player_id");

-- CreateIndex
CREATE INDEX "conversations_updated_at_idx" ON "conversations"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_coach_id_player_id_key" ON "conversations"("coach_id", "player_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "messages_is_read_idx" ON "messages"("is_read");

-- CreateIndex
CREATE INDEX "coach_favorites_coach_id_idx" ON "coach_favorites"("coach_id");

-- CreateIndex
CREATE INDEX "coach_favorites_coach_id_updated_at_idx" ON "coach_favorites"("coach_id", "updated_at");

-- CreateIndex
CREATE INDEX "coach_favorites_player_id_idx" ON "coach_favorites"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "coach_favorites_coach_id_player_id_key" ON "coach_favorites"("coach_id", "player_id");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_main_game_id_fkey" FOREIGN KEY ("main_game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_association_requests" ADD CONSTRAINT "school_association_requests_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_association_requests" ADD CONSTRAINT "school_association_requests_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_game_profiles" ADD CONSTRAINT "player_game_profiles_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_game_profiles" ADD CONSTRAINT "player_game_profiles_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_platform_connections" ADD CONSTRAINT "player_platform_connections_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_social_connections" ADD CONSTRAINT "player_social_connections_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryouts" ADD CONSTRAINT "tryouts_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryouts" ADD CONSTRAINT "tryouts_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryouts" ADD CONSTRAINT "tryouts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryout_registrations" ADD CONSTRAINT "tryout_registrations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryout_registrations" ADD CONSTRAINT "tryout_registrations_tryout_id_fkey" FOREIGN KEY ("tryout_id") REFERENCES "tryouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combines" ADD CONSTRAINT "combines_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combines" ADD CONSTRAINT "combines_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combine_registrations" ADD CONSTRAINT "combine_registrations_combine_id_fkey" FOREIGN KEY ("combine_id") REFERENCES "combines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combine_registrations" ADD CONSTRAINT "combine_registrations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_teams" ADD CONSTRAINT "league_teams_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_teams" ADD CONSTRAINT "league_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_schools" ADD CONSTRAINT "league_schools_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_schools" ADD CONSTRAINT "league_schools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_leagues" ADD CONSTRAINT "player_leagues_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_leagues" ADD CONSTRAINT "player_leagues_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rankings" ADD CONSTRAINT "player_rankings_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rankings" ADD CONSTRAINT "player_rankings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_performance_stats" ADD CONSTRAINT "player_performance_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_fkey" FOREIGN KEY ("team_b_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_favorites" ADD CONSTRAINT "coach_favorites_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_favorites" ADD CONSTRAINT "coach_favorites_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

