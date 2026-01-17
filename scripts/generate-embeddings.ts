#!/usr/bin/env tsx

/**
 * Player Embeddings Generation Script
 *
 * This script generates vector embeddings for existing players in the database
 * using Google Gemini's text-embedding-004 model.
 *
 * Usage:
 *   npx tsx scripts/generate-embeddings.ts [options]
 *
 * Options:
 *   --only-missing    Only generate embeddings for players without existing embeddings
 *   --batch-size N    Process N players at a time (default: 10)
 *   --batch-delay N   Wait N milliseconds between batches (default: 1000)
 *   --dry-run         Show what would be processed without actually generating embeddings
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { db } from "../src/server/db";

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  dim: "\x1b[2m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg: string) =>
    console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg: string) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
  data: (msg: string) =>
    console.log(`${colors.magenta}📄 ${msg}${colors.reset}`),
  dim: (msg: string) => console.log(`${colors.dim}   ${msg}${colors.reset}`),
};

// Parse command line arguments
function parseArgs(): {
  onlyMissing: boolean;
  batchSize: number;
  batchDelay: number;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  const config = {
    onlyMissing: false,
    batchSize: 10,
    batchDelay: 1000,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--only-missing":
        config.onlyMissing = true;
        break;
      case "--batch-size":
        config.batchSize = parseInt(args[++i] ?? "10", 10);
        break;
      case "--batch-delay":
        config.batchDelay = parseInt(args[++i] ?? "1000", 10);
        break;
      case "--dry-run":
        config.dryRun = true;
        break;
      case "--help":
        console.log(`
Player Embeddings Generation Script

Usage:
  npx tsx scripts/generate-embeddings.ts [options]

Options:
  --only-missing    Only generate embeddings for players without existing embeddings
  --batch-size N    Process N players at a time (default: 10)
  --batch-delay N   Wait N milliseconds between batches (default: 1000)
  --dry-run         Show what would be processed without actually generating embeddings
  --help            Show this help message
        `);
        process.exit(0);
    }
  }

  return config;
}

// Player data structure for embedding generation
interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  location: string | null;
  bio: string | null;
  school: string | null;
  schoolType: string | null;
  classYear: string | null;
  gpa: number | null;
  intendedMajor: string | null;
  mainGame: string | null;
  gameProfiles: {
    game: string;
    username: string;
    rank: string | null;
    role: string | null;
    agents: string[];
    playStyle: string | null;
  }[];
}

// Build text representation for embedding
function buildEmbeddingText(player: PlayerData): string {
  const parts: string[] = [];

  // Basic info
  parts.push(`Player: ${player.firstName} ${player.lastName}`);
  if (player.username) {
    parts.push(`Username: ${player.username}`);
  }

  // Location
  if (player.location) {
    parts.push(`Location: ${player.location}`);
  }

  // Academic info
  if (player.school) {
    parts.push(`School: ${player.school}`);
  }
  if (player.schoolType) {
    const typeLabel =
      player.schoolType === "HIGH_SCHOOL"
        ? "High School"
        : player.schoolType === "COLLEGE"
          ? "College"
          : "University";
    parts.push(`School Type: ${typeLabel}`);
  }
  if (player.classYear) {
    parts.push(`Class Year: ${player.classYear}`);
  }
  if (player.gpa !== null && player.gpa !== undefined) {
    parts.push(`GPA: ${player.gpa}`);
  }
  if (player.intendedMajor) {
    parts.push(`Intended Major: ${player.intendedMajor}`);
  }

  // Bio
  if (player.bio) {
    parts.push(`Bio: ${player.bio}`);
  }

  // Main game
  if (player.mainGame) {
    parts.push(`Main Game: ${player.mainGame}`);
  }

  // Game profiles
  if (player.gameProfiles.length > 0) {
    const gameDetails = player.gameProfiles
      .map((profile) => {
        const details: string[] = [profile.game];
        if (profile.rank) details.push(`Rank: ${profile.rank}`);
        if (profile.role) details.push(`Role: ${profile.role}`);
        if (profile.agents.length > 0)
          details.push(`Plays: ${profile.agents.join(", ")}`);
        if (profile.playStyle) details.push(`Style: ${profile.playStyle}`);
        return details.join(", ");
      })
      .join("; ");
    parts.push(`Games: ${gameDetails}`);
  }

  return parts.join(". ");
}

// Dynamically import Gemini to avoid issues with env validation
async function getGeminiEmbedding(text: string): Promise<number[]> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not set in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const result = await model.embedContent(text);
  const embedding = result.embedding;

  if (!embedding?.values || embedding.values.length === 0) {
    throw new Error("Empty embedding returned from Gemini");
  }

  return embedding.values;
}

// Format embedding for PostgreSQL
function formatEmbeddingForPostgres(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

// Get players to process
async function getPlayersToProcess(onlyMissing: boolean): Promise<
  Array<{
    id: string;
    first_name: string;
    last_name: string;
    username: string | null;
    location: string | null;
    bio: string | null;
    school: string | null;
    class_year: string | null;
    gpa: { toString(): string } | null;
    intended_major: string | null;
    school_ref: { name: string; type: string } | null;
    main_game: { name: string } | null;
    game_profiles: Array<{
      username: string;
      rank: string | null;
      role: string | null;
      agents: string[];
      play_style: string | null;
      game: { name: string };
    }>;
  }>
> {
  if (onlyMissing) {
    // Get players without embeddings
    const playersWithoutEmbeddings = await db.$queryRaw<{ id: string }[]>`
      SELECT p.id 
      FROM players p
      LEFT JOIN player_embeddings pe ON p.id = pe.player_id
      WHERE pe.id IS NULL
    `;

    if (playersWithoutEmbeddings.length === 0) {
      return [];
    }

    const playerIds = playersWithoutEmbeddings.map((p) => p.id);

    return db.player.findMany({
      where: { id: { in: playerIds } },
      include: {
        school_ref: { select: { name: true, type: true } },
        main_game: { select: { name: true } },
        game_profiles: {
          include: { game: { select: { name: true } } },
        },
      },
    });
  }

  // Get all players
  return db.player.findMany({
    include: {
      school_ref: { select: { name: true, type: true } },
      main_game: { select: { name: true } },
      game_profiles: {
        include: { game: { select: { name: true } } },
      },
    },
  });
}

// Process a single player
async function processPlayer(
  player: {
    id: string;
    first_name: string;
    last_name: string;
    username: string | null;
    location: string | null;
    bio: string | null;
    school: string | null;
    class_year: string | null;
    gpa: { toString(): string } | null;
    intended_major: string | null;
    school_ref: { name: string; type: string } | null;
    main_game: { name: string } | null;
    game_profiles: Array<{
      username: string;
      rank: string | null;
      role: string | null;
      agents: string[];
      play_style: string | null;
      game: { name: string };
    }>;
  },
  dryRun: boolean,
): Promise<boolean> {
  const playerData: PlayerData = {
    id: player.id,
    firstName: player.first_name,
    lastName: player.last_name,
    username: player.username,
    location: player.location,
    bio: player.bio,
    school: player.school_ref?.name ?? player.school,
    schoolType: player.school_ref?.type ?? null,
    classYear: player.class_year,
    gpa: player.gpa ? parseFloat(player.gpa.toString()) : null,
    intendedMajor: player.intended_major,
    mainGame: player.main_game?.name ?? null,
    gameProfiles: player.game_profiles.map((profile) => ({
      game: profile.game.name,
      username: profile.username,
      rank: profile.rank,
      role: profile.role,
      agents: profile.agents,
      playStyle: profile.play_style,
    })),
  };

  const embeddingText = buildEmbeddingText(playerData);

  if (dryRun) {
    log.dim(`Would generate embedding for text (${embeddingText.length} chars)`);
    return true;
  }

  // Generate embedding
  const embedding = await getGeminiEmbedding(embeddingText);
  const embeddingVector = formatEmbeddingForPostgres(embedding);

  // Upsert into database
  await db.$executeRaw`
    INSERT INTO player_embeddings (player_id, embedding, embedding_text, updated_at)
    VALUES (${player.id}::uuid, ${embeddingVector}::vector, ${embeddingText}, NOW())
    ON CONFLICT (player_id) 
    DO UPDATE SET 
      embedding = ${embeddingVector}::vector,
      embedding_text = ${embeddingText},
      updated_at = NOW()
  `;

  return true;
}

async function main() {
  const config = parseArgs();

  console.log("\n" + "=".repeat(80));
  log.info("Player Embeddings Generation Script");
  console.log("=".repeat(80) + "\n");

  log.info(`Configuration:`);
  log.dim(`  Only missing: ${config.onlyMissing}`);
  log.dim(`  Batch size: ${config.batchSize}`);
  log.dim(`  Batch delay: ${config.batchDelay}ms`);
  log.dim(`  Dry run: ${config.dryRun}`);
  console.log();

  // Check if Gemini API key is configured
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    log.error("GOOGLE_GEMINI_API_KEY is not set in environment variables");
    log.info("Please add GOOGLE_GEMINI_API_KEY to your .env file");
    process.exit(1);
  }

  try {
    // Get players to process
    log.step("Fetching players to process...");
    const players = await getPlayersToProcess(config.onlyMissing);

    if (players.length === 0) {
      log.success("No players to process!");
      await db.$disconnect();
      return;
    }

    log.info(`Found ${players.length} players to process`);
    console.log();

    // Process statistics
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    const failedPlayers: Array<{ id: string; name: string; error: string }> = [];

    // Process in batches
    for (let i = 0; i < players.length; i += config.batchSize) {
      const batch = players.slice(i, i + config.batchSize);
      const batchNum = Math.floor(i / config.batchSize) + 1;
      const totalBatches = Math.ceil(players.length / config.batchSize);

      log.step(`Processing batch ${batchNum}/${totalBatches} (${batch.length} players)...`);

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(async (player) => {
          try {
            await processPlayer(player, config.dryRun);
            return { success: true, player };
          } catch (error) {
            throw { player, error };
          }
        }),
      );

      // Count results
      for (const result of results) {
        processed++;
        if (result.status === "fulfilled") {
          succeeded++;
          log.data(
            `  ✓ ${result.value.player.first_name} ${result.value.player.last_name}`,
          );
        } else {
          failed++;
          const reason = result.reason as {
            player: { id: string; first_name: string; last_name: string };
            error: unknown;
          };
          const errorMsg =
            reason.error instanceof Error
              ? reason.error.message
              : "Unknown error";
          failedPlayers.push({
            id: reason.player.id,
            name: `${reason.player.first_name} ${reason.player.last_name}`,
            error: errorMsg,
          });
          log.warning(
            `  ✗ ${reason.player.first_name} ${reason.player.last_name}: ${errorMsg}`,
          );
        }
      }

      // Delay between batches (except for last batch)
      if (i + config.batchSize < players.length) {
        log.dim(`  Waiting ${config.batchDelay}ms before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, config.batchDelay));
      }
    }

    // Summary
    console.log("\n" + "=".repeat(80));
    log.success(config.dryRun ? "Dry run completed!" : "Embedding generation completed!");
    console.log("=".repeat(80));
    log.info(`Processed: ${processed} players`);
    log.info(`Succeeded: ${succeeded} players`);
    log.info(`Failed: ${failed} players`);

    if (failedPlayers.length > 0) {
      console.log("\n" + "-".repeat(80));
      log.warning("Failed players:");
      failedPlayers.forEach(({ name, error }) => {
        log.error(`  ${name}: ${error}`);
      });
    }

    // Get final stats
    if (!config.dryRun) {
      console.log("\n" + "-".repeat(80));
      const [embeddingCount] = await db.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM player_embeddings
      `;
      const [playerCount] = await db.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM players
      `;
      const coverage = Math.round(
        (Number(embeddingCount.count) / Number(playerCount.count)) * 100,
      );
      log.info(`Embedding coverage: ${embeddingCount.count}/${playerCount.count} (${coverage}%)`);
    }
  } catch (error) {
    log.error(
      `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
