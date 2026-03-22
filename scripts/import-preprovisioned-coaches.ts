#!/usr/bin/env tsx

/**
 * Preprovisioned Coach Import Script
 *
 * Imports preprovisioned coaches from a CSV file into the database.
 * These are coaches discovered via scraping who don't yet have accounts.
 *
 * Usage:
 *   tsx scripts/import-preprovisioned-coaches.ts <csv-file>
 *   tsx scripts/import-preprovisioned-coaches.ts <csv-file> --dry-run
 */

import dotenv from "dotenv";
dotenv.config();

import { readFileSync } from "fs";
import { resolve } from "path";
import { db } from "../src/server/db";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg: string) =>
    console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg: string) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
};

interface CsvRow {
  first_name: string;
  last_name: string;
  email: string;
  school_name: string;
  title?: string;
}

function parseCsv(filePath: string): CsvRow[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV file must have a header row and at least one data row");
  }

  const headers = lines[0]!
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  
  const requiredHeaders = ["email", "school_name"];
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required CSV column: ${required}`);
    }
  }

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]!.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });

    rows.push({
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      email: row.email ?? "",
      school_name: row.school_name ?? "",
      title: row.title,
    });
  }

  return rows;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("--"));

  if (!csvPath) {
    console.log("Usage: tsx scripts/import-preprovisioned-coaches.ts <csv-file> [--dry-run]");
    process.exit(1);
  }

  const resolvedPath = resolve(csvPath);
  log.info(`Reading CSV from: ${resolvedPath}`);
  if (dryRun) {
    log.warning("DRY RUN MODE — no records will be created");
  }

  const rows = parseCsv(resolvedPath);
  log.info(`Found ${rows.length} rows in CSV`);

  // Preload all schools for matching
  const schools = await db.school.findMany({
    select: { id: true, name: true },
  });
  const schoolMap = new Map(
    schools.map((s) => [s.name.toLowerCase(), s.id]),
  );

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const { first_name, last_name, email, school_name, title } = row;

    // Validate email
    if (!email) {
      const msg = `Row skipped — missing email (school: ${school_name})`;
      log.warning(msg);
      errors.push(msg);
      skipped++;
      continue;
    }

    // Match school
    const schoolId = schoolMap.get(school_name.toLowerCase());
    if (!schoolId) {
      const msg = `Row skipped — school not found: "${school_name}" (email: ${email})`;
      log.warning(msg);
      errors.push(msg);
      skipped++;
      continue;
    }

    // Check for duplicate email
    const existing = await db.coach.findUnique({ where: { email } });
    if (existing) {
      const msg = `Row skipped — duplicate email: ${email}`;
      log.warning(msg);
      skipped++;
      continue;
    }

    // Determine title — default to "Program Email" if no name provided
    const resolvedTitle =
      title ?? (!first_name && !last_name ? "Esports Program" : undefined);

    if (dryRun) {
      log.step(
        `Would create: ${first_name || "(no name)"} ${last_name || ""} <${email}> at "${school_name}"${resolvedTitle ? ` (${resolvedTitle})` : ""}`,
      );
    } else {
      await db.coach.create({
        data: {
          clerk_id: null,
          email,
          first_name: first_name || "",
          last_name: last_name || "",
          username: null,
          school: school_name,
          school_id: schoolId,
          status: "INVITED",
          source: "SCRAPED",
          title: resolvedTitle,
        },
      });
      log.success(
        `Created: ${first_name || "(no name)"} ${last_name || ""} <${email}> at "${school_name}"`,
      );
    }
    created++;
  }

  console.log("\n--- Summary ---");
  log.info(`Total rows:  ${rows.length}`);
  log.success(`Created:     ${created}${dryRun ? " (dry run)" : ""}`);
  log.warning(`Skipped:     ${skipped}`);
  if (errors.length > 0) {
    log.error(`Errors:      ${errors.length}`);
  }

  process.exit(0);
}

main().catch((err) => {
  log.error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
