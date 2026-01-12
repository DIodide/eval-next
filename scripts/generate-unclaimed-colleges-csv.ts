#!/usr/bin/env tsx

/**
 * Unclaimed Colleges CSV Generator Script
 *
 * This script generates a CSV file containing all unclaimed college/university profiles
 * (schools with no associated coaches) along with their claim links.
 *
 * Usage:
 *   npx tsx scripts/generate-unclaimed-colleges-csv.ts [--base-url=https://evalgaming.com] [--output=unclaimed-colleges.csv]
 *
 * Options:
 *   --base-url  Base URL for generating profile and claim links (default: https://evalgaming.com)
 *   --output    Output file path (default: unclaimed-colleges-{date}.csv)
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { writeFileSync } from "fs";
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

// Parse command line arguments
function parseArgs(): { baseUrl: string; output: string } {
  const args = process.argv.slice(2);
  let baseUrl = "https://evalgaming.com";
  let output = `unclaimed-colleges-${new Date().toISOString().split("T")[0]}.csv`;

  for (const arg of args) {
    if (arg.startsWith("--base-url=")) {
      baseUrl = arg.split("=")[1] ?? baseUrl;
    } else if (arg.startsWith("--output=")) {
      output = arg.split("=")[1] ?? output;
    }
  }

  return { baseUrl, output };
}

// Escape CSV field values
function escapeCSVField(value: string | null | undefined): string {
  if (!value) return "";
  // If the value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function main() {
  const { baseUrl, output } = parseArgs();

  log.info("Unclaimed Colleges CSV Generator");
  log.info("================================");
  log.data(`Base URL: ${baseUrl}`);
  log.data(`Output file: ${output}`);
  console.log("");

  try {
    log.step("Connecting to database...");

    // Fetch all unclaimed colleges/universities
    log.step("Fetching unclaimed college profiles...");
    const schools = await db.school.findMany({
      where: {
        type: {
          in: ["COLLEGE", "UNIVERSITY"],
        },
        coaches: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        location: true,
        state: true,
        region: true,
        country: true,
        website: true,
      },
      orderBy: [{ state: "asc" }, { name: "asc" }],
    });

    if (schools.length === 0) {
      log.warning("No unclaimed colleges found!");
      await db.$disconnect();
      return;
    }

    log.success(`Found ${schools.length} unclaimed college profiles`);

    // Generate CSV content
    log.step("Generating CSV content...");

    const headers = [
      "School Name",
      "School Type",
      "Location",
      "State",
      "Region",
      "Country",
      "Website",
      "Profile URL",
      "Claim Link",
    ];

    const rows = schools.map((school) => {
      const profileUrl = `${baseUrl}/profiles/school/${school.id}`;
      const claimLink = `${baseUrl}/onboarding/coach?schoolId=${school.id}&schoolName=${encodeURIComponent(school.name)}`;

      return [
        escapeCSVField(school.name),
        school.type,
        escapeCSVField(school.location),
        escapeCSVField(school.state),
        escapeCSVField(school.region),
        escapeCSVField(school.country ?? "USA"),
        escapeCSVField(school.website),
        profileUrl,
        claimLink,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Write CSV file
    log.step(`Writing CSV file to ${output}...`);
    writeFileSync(output, csvContent, "utf-8");

    log.success(`CSV file generated successfully!`);
    console.log("");
    log.info("Summary:");
    log.data(`  - Total unclaimed colleges: ${schools.length}`);
    log.data(`  - Output file: ${output}`);
    log.data(`  - File size: ${(csvContent.length / 1024).toFixed(2)} KB`);

    // Print some sample data
    console.log("");
    log.info("Sample entries (first 5):");
    schools.slice(0, 5).forEach((school, i) => {
      log.data(
        `  ${i + 1}. ${school.name} (${school.state || "Unknown State"})`,
      );
    });

    // Cleanup
    await db.$disconnect();

    log.success("Script completed successfully!");
  } catch (error) {
    log.error(`Error generating CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  log.error(`Unhandled error: ${error instanceof Error ? error.message : "Unknown error"}`);
  console.error(error);
  process.exit(1);
});
