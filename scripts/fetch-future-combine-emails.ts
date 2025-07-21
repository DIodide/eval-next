#!/usr/bin/env tsx

/**
 * Future Combine Registrations Email Fetcher
 *
 * This script fetches the emails of all players who have combine registrations
 * for all combines that are scheduled in the future.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { db } from "../src/server/db";
import { env } from "../src/env.js";

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

async function main() {
  log.info("Starting future combine registrations email fetch...");

  try {
    // Get current date/time
    const now = new Date();
    log.step(`Current time: ${now.toISOString()}`);

    // Find all future combines
    log.step("Fetching future combines...");
    const futureCombines = await db.combine.findMany({
      where: {
        date: {
          gt: now,
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        registered_spots: true,
        max_spots: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    if (futureCombines.length === 0) {
      log.warning("No future combines found");
      return;
    }

    log.success(`Found ${futureCombines.length} future combines:`);
    futureCombines.forEach((combine, index) => {
      log.data(
        `${index + 1}. ${combine.title} - ${combine.date.toISOString()} @ ${combine.location} (${combine.registered_spots}/${combine.max_spots} spots)`,
      );
    });

    // Get all combine registrations for future combines with player emails
    log.step("Fetching player registrations and emails...");
    const registrations = await db.combineRegistration.findMany({
      where: {
        combine_id: {
          in: futureCombines.map((c) => c.id),
        },
      },
      include: {
        player: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
        combine: {
          select: {
            title: true,
            date: true,
            location: true,
          },
        },
      },
      orderBy: [{ combine: { date: "asc" } }, { player: { last_name: "asc" } }],
    });

    if (registrations.length === 0) {
      log.warning("No registrations found for future combines");
      return;
    }

    log.success(
      `Found ${registrations.length} registrations for future combines`,
    );

    // Extract unique emails
    const uniqueEmails = Array.from(
      new Set(registrations.map((r) => r.player.email)),
    );

    console.log("\n" + "=".repeat(80));
    log.success(
      `SUMMARY: ${uniqueEmails.length} unique player emails registered for future combines`,
    );
    console.log("=".repeat(80));

    // Output all unique emails
    console.log("\n📧 UNIQUE PLAYER EMAILS:");
    console.log("-".repeat(40));
    uniqueEmails.forEach((email, index) => {
      console.log(`${index + 1}. ${email}`);
    });

    // Output detailed breakdown by combine
    console.log("\n📋 DETAILED BREAKDOWN BY COMBINE:");
    console.log("-".repeat(60));

    for (const combine of futureCombines) {
      const combineRegistrations = registrations.filter(
        (r) => r.combine_id === combine.id,
      );

      if (combineRegistrations.length > 0) {
        console.log(`\n🎯 ${combine.title}`);
        console.log(`   📅 Date: ${combine.date.toISOString()}`);
        console.log(`   📍 Location: ${combine.location}`);
        console.log(`   👥 Registrations: ${combineRegistrations.length}`);
        console.log("   📧 Players:");

        combineRegistrations.forEach((reg, index) => {
          const player = reg.player;
          const displayName =
            player.username ?? `${player.first_name} ${player.last_name}`;
          console.log(`      ${index + 1}. ${player.email} (${displayName})`);
        });
      }
    }

    // Output comma-separated email list for easy copy-paste
    console.log("\n📎 COMMA-SEPARATED EMAIL LIST (for copy-paste):");
    console.log("-".repeat(50));
    console.log(uniqueEmails.join(", "));

    console.log("\n" + "=".repeat(80));
    log.success("Email fetch completed successfully!");
  } catch (error) {
    log.error(
      `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.error(error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await db.$disconnect();
  }
}

// Run the script
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
