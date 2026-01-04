#!/usr/bin/env tsx

/**
 * Game Logos Migration Script
 *
 * This script extracts game titles from college_details.json and creates
 * a mapping file for SVG logos stored in the public/game-logos directory.
 * The mapping allows easy lookup of game logos by game name.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
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
};

interface CollegeData {
  program_name: string;
  esports_titles: string[];
}

// Normalize game name for consistent mapping
function normalizeGameName(gameName: string): string {
  return gameName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Download SVG from URL
async function downloadSVG(url: string, filePath: string): Promise<boolean> {
  try {
    log.step(`Downloading SVG from ${url}...`);
    const response = await fetch(url);

    if (!response.ok) {
      log.warning(`Failed to download ${url}: ${response.statusText}`);
      return false;
    }

    const content = await response.text();

    // Verify it's SVG content
    if (!content.trim().startsWith("<svg") && !content.includes("<?xml")) {
      log.warning(`Content from ${url} doesn't appear to be SVG`);
      return false;
    }

    writeFileSync(filePath, content, "utf-8");
    log.success(`Downloaded: ${filePath}`);
    return true;
  } catch (error) {
    log.warning(
      `Error downloading ${url}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

function addGameLogoSVG(
  filePath: string,
  gameName: string,
  gameLogos: Record<string, string>,
): void {
  let svgContent = gameLogos[gameName];
  if (
    svgContent &&
    !svgContent.includes('xmlns="http://www.w3.org/2000/svg"')
  ) {
    svgContent = svgContent.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"',
    );
  }
  if (svgContent) {
    svgContent = `<?xml version="1.0" encoding="UTF-8"?>${svgContent}`;
    writeFileSync(filePath, svgContent, "utf-8");
    log.data(`Created SVG: ${filePath}`);
  }
}

// Create placeholder SVG file
// function createPlaceholderSVG(gameName: string, filePath: string): void {
//   const svg = `<?xml version="1.0" encoding="UTF-8"?>
// <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
//   <rect width="200" height="200" fill="#1a1a2e" rx="8"/>
//   <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${gameName}</text>
// </svg>`;

//   writeFileSync(filePath, svg, "utf-8");
//   log.data(`Created placeholder SVG: ${filePath}`);
// }

async function main() {
  log.info("Starting game logos mapping generation...");

  try {
    // Read the JSON file
    log.step("Reading college_details.json...");
    const filePath = join(process.cwd(), "college_details.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    const gameLogos = data.game_logos || {};

    const colleges: CollegeData[] = data.colleges || [];
    log.success(`Found ${colleges.length} colleges in JSON file`);

    // Create game-logos directory if it doesn't exist
    const logosDir = join(process.cwd(), "public", "game-logos");
    if (!existsSync(logosDir)) {
      mkdirSync(logosDir, { recursive: true });
      log.success(`Created directory: ${logosDir}`);
    }

    // Collect unique game titles
    const gameTitles = new Set<string>();

    colleges.forEach((college) => {
      college.esports_titles?.forEach((title) => {
        if (title && title.trim()) {
          gameTitles.add(title.trim());
        }
      });
    });

    const uniqueGames = Array.from(gameTitles).sort();
    log.success(`Found ${uniqueGames.length} unique game titles`);

    // Create/download SVG files for each game
    log.step("Creating SVG files for each game...");
    const gameLogoMapping: Record<string, string> = {};
    let created = 0;
    let skipped = 0;

    for (const gameName of uniqueGames) {
      const normalized = normalizeGameName(gameName);
      const filePath = join(logosDir, `${normalized}.svg`);
      const relativePath = `/game-logos/${normalized}.svg`;

      // Check if file already exists
      if (existsSync(filePath)) {
        log.data(`Skipping ${gameName} - file already exists`);
        gameLogoMapping[gameName] = relativePath;
        skipped++;
        continue;
      }

      // Create placeholder SVG (since JSON doesn't have game logo URLs)
      // createPlaceholderSVG(gameName, filePath);
      addGameLogoSVG(filePath, gameName, gameLogos);
      gameLogoMapping[gameName] = relativePath;
      created++;
    }

    log.success(
      `Created ${created} SVG files, skipped ${skipped} existing files`,
    );

    // Create TypeScript mapping file for easy import
    const mappingContent = `// Game Logo Mapping
// This file is auto-generated by scripts/migrate-game-logos.ts
// Maps game names to their SVG logo paths in the public/game-logos directory

export const GAME_LOGO_MAPPING: Record<string, string> = ${JSON.stringify(gameLogoMapping, null, 2)};

/**
 * Get the logo path for a game name
 * @param gameName - The name of the game
 * @returns The path to the SVG logo file, or undefined if not found
 */
export function getGameLogoPath(gameName: string): string | undefined {
  return GAME_LOGO_MAPPING[gameName];
}

/**
 * Get all available game names
 * @returns Array of all game names that have logos
 */
export function getAvailableGameNames(): string[] {
  return Object.keys(GAME_LOGO_MAPPING);
}
`;

    const mappingPath = join(process.cwd(), "src", "lib", "game-logos.ts");
    writeFileSync(mappingPath, mappingContent);
    log.success(`Created TypeScript mapping file: ${mappingPath}`);

    // Create JSON mapping file for reference
    const jsonMappingPath = join(logosDir, "game-logo-mapping.json");
    writeFileSync(
      jsonMappingPath,
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          total_games: uniqueGames.length,
          mapping: gameLogoMapping,
          games: uniqueGames,
          note: "SVG files should be placed in public/game-logos/ directory with the normalized filename (e.g., 'valorant.svg', 'rocket-league.svg')",
        },
        null,
        2,
      ),
    );
    log.success(`Created JSON mapping file: ${jsonMappingPath}`);

    // Create README for the game-logos directory
    const readmeContent = `# Game Logos Directory

This directory contains SVG logo files for esports games.

## File Naming Convention

Logo files should be named using the normalized game name:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Add .svg extension

Example:
- "VALORANT" → \`valorant.svg\`
- "Rocket League" → \`rocket-league.svg\`
- "Super Smash Bros. Ultimate" → \`super-smash-bros-ultimate.svg\`

## Usage

Import the mapping in your code:

\`\`\`typescript
import { getGameLogoPath } from "@/lib/game-logos";

const logoPath = getGameLogoPath("VALORANT");
// Returns: "/game-logos/valorant.svg"
\`\`\`

## Available Games

${uniqueGames.map((game, index) => `${index + 1}. ${game} → \`${gameLogoMapping[game]}\``).join("\n")}

## Adding New Logos

1. Place the SVG file in this directory with the normalized filename
2. Run \`npx tsx scripts/migrate-game-logos.ts\` to regenerate the mapping
3. The mapping will automatically include the new game
`;

    const readmePath = join(logosDir, "README.md");
    writeFileSync(readmePath, readmeContent);
    log.success(`Created README: ${readmePath}`);

    // Summary
    console.log("\n" + "=".repeat(80));
    log.success("Migration completed!");
    console.log("=".repeat(80));
    log.info(`Total unique games: ${uniqueGames.length}`);
    log.info(`SVG files created: ${created}`);
    log.info(`SVG files skipped (already exist): ${skipped}`);
    log.info(`Mapping file created: src/lib/game-logos.ts`);
    log.info(`JSON mapping created: public/game-logos/game-logo-mapping.json`);
    log.warning(
      "Note: Placeholder SVG files were created. Replace them with actual game logos as needed.",
    );

    // Display game titles
    console.log("\n" + "-".repeat(80));
    log.data(
      "Game titles found (place corresponding SVG files in public/game-logos/):",
    );
    uniqueGames.forEach((game, index) => {
      const normalized = normalizeGameName(game);
      console.log(`  ${index + 1}. ${game.padEnd(40)} → ${normalized}.svg`);
    });
  } catch (error) {
    log.error(
      `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
