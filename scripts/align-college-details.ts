#!/usr/bin/env tsx

/**
 * College Details Alignment Script
 *
 * This script aligns college_details.json with existing database data from CSV.
 * Database values take precedence (especially name), and state names are always
 * converted to abbreviations.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { readFileSync, writeFileSync } from "fs";
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

// US states list
const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
];

// Map full state names to abbreviations
const STATE_FULL_TO_ABBREV: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

// Convert state to abbreviation (always)
function stateToAbbrev(state: string | null | undefined): string | null {
  if (!state) return null;

  const trimmed = state.trim();

  // If already an abbreviation (2 letters, uppercase), validate and return
  if (trimmed.length === 2 && trimmed === trimmed.toUpperCase()) {
    // Check if it's a valid abbreviation
    const isValidAbbrev = Object.values(STATE_FULL_TO_ABBREV).includes(trimmed);
    if (isValidAbbrev) {
      return trimmed;
    }
  }

  // Check if it's a full state name (case-insensitive)
  const matchedState = US_STATES.find(
    (s) => s.toLowerCase() === trimmed.toLowerCase(),
  );

  if (matchedState && STATE_FULL_TO_ABBREV[matchedState]) {
    return STATE_FULL_TO_ABBREV[matchedState];
  }

  // If we can't map it, return the original (might be non-US)
  return trimmed;
}

// Parse CSV line
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Read CSV file
function readCSV(filePath: string): Array<Record<string, string>> {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = parseCSVLine(lines[0] || "");

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header.trim()] = (values[index] || "").trim();
    });
    return record;
  });
}

// Determine school type from name
function determineSchoolType(
  programName: string,
): "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY" {
  const name = programName.toLowerCase();

  if (name.includes("high school") || name.includes("hs")) {
    return "HIGH_SCHOOL";
  }

  if (
    name.includes("community college") ||
    name.includes("junior college") ||
    name.includes("technical college") ||
    name.includes("cc")
  ) {
    return "COLLEGE";
  }

  return "UNIVERSITY";
}

// Parse location to extract state
function extractStateFromLocation(location: string): string | null {
  const parts = location.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 1] || null;
  }
  return null;
}

// Match schools between CSV and JSON
function matchSchool(
  csvSchool: Record<string, string>,
  jsonCollege: any,
): boolean {
  // Normalize names for comparison (case-insensitive)
  const csvName = csvSchool.name?.toLowerCase().trim() || "";
  const jsonName = jsonCollege.program_name?.toLowerCase().trim() || "";

  // Get states (convert to abbrev for comparison)
  const csvState = stateToAbbrev(csvSchool.state);
  const jsonLocationState = extractStateFromLocation(
    jsonCollege.location || "",
  );
  const jsonState = stateToAbbrev(jsonLocationState);

  // Get types
  const csvType = csvSchool.type || "";
  const jsonType = determineSchoolType(jsonCollege.program_name || "");

  // Match by name (fuzzy), state, and type
  const nameMatch =
    csvName === jsonName ||
    csvName.includes(jsonName) ||
    jsonName.includes(csvName);
  const stateMatch = csvState === jsonState;
  const typeMatch = csvType === jsonType;

  // Require name match and at least state or type match
  return nameMatch && (stateMatch || typeMatch);
}

async function main() {
  log.info("Starting college details alignment...");

  try {
    // Read CSV file
    log.step("Reading schools_rows.csv...");
    const csvPath = join(process.cwd(), "schools_rows.csv");
    const csvSchools = readCSV(csvPath);
    log.success(`Found ${csvSchools.length} schools in CSV file`);

    // Read JSON file
    log.step("Reading college_details.json...");
    const jsonPath = join(process.cwd(), "college_details.json");
    const jsonContent = readFileSync(jsonPath, "utf-8");
    const jsonData = JSON.parse(jsonContent);
    const jsonColleges: any[] = jsonData.colleges || [];
    log.success(`Found ${jsonColleges.length} colleges in JSON file`);

    let matched = 0;
    let updated = 0;
    const unmatched: string[] = [];

    // Process each JSON college
    log.step("Aligning colleges with database data...");
    for (let i = 0; i < jsonColleges.length; i++) {
      const college = jsonColleges[i];
      const collegeName = college.program_name || "";

      // Find matching CSV school
      const matchingSchool = csvSchools.find((csvSchool) =>
        matchSchool(csvSchool, college),
      );

      if (matchingSchool) {
        matched++;

        // Update with database values (database takes precedence)
        if (matchingSchool.name) {
          college.program_name = matchingSchool.name; // Database name takes precedence
        }

        // Always convert state to abbreviation
        const csvState = stateToAbbrev(matchingSchool.state);
        const jsonLocationState = extractStateFromLocation(
          college.location || "",
        );
        const jsonState = stateToAbbrev(jsonLocationState);

        // Use CSV state if available, otherwise use JSON state (both converted to abbrev)
        const finalState = csvState || jsonState;

        // Update location to use abbreviated state
        if (college.location && finalState) {
          const locationParts = college.location
            .split(",")
            .map((p: string) => p.trim());
          if (locationParts.length >= 2) {
            locationParts[locationParts.length - 1] = finalState;
            college.location = locationParts.join(", ");
          } else {
            // If location doesn't have state, add it
            college.location = `${college.location}, ${finalState}`;
          }
        }

        // Update other fields from database if they exist and JSON doesn't have them
        if (matchingSchool.website && !college.official_website) {
          college.official_website = matchingSchool.website;
        }
        if (matchingSchool.logo_url && !college.logo_url) {
          college.logo_url = matchingSchool.logo_url;
        }
        if (matchingSchool.bio && !college.biography) {
          college.biography = matchingSchool.bio;
        }
        if (matchingSchool.email && !college.email) {
          college.email = matchingSchool.email;
        }
        if (matchingSchool.phone && !college.phone) {
          college.phone = matchingSchool.phone;
        }

        updated++;
        log.data(`Matched: ${college.program_name} (${finalState || "N/A"})`);
      } else {
        unmatched.push(collegeName);

        // Still convert state to abbreviation even if no match
        const jsonLocationState = extractStateFromLocation(
          college.location || "",
        );
        const jsonState = stateToAbbrev(jsonLocationState);

        if (college.location && jsonState) {
          const locationParts = college.location
            .split(",")
            .map((p: string) => p.trim());
          if (locationParts.length >= 2) {
            locationParts[locationParts.length - 1] = jsonState;
            college.location = locationParts.join(", ");
          }
        }
      }
    }

    // Save updated JSON
    log.step("Saving aligned college_details.json...");
    const updatedJson = {
      ...jsonData,
      colleges: jsonColleges,
      aligned_at: new Date().toISOString(),
      alignment_stats: {
        total_colleges: jsonColleges.length,
        matched_with_db: matched,
        updated: updated,
        unmatched: unmatched.length,
      },
    };

    // Write to new file first (backup original)
    const backupPath = join(process.cwd(), "college_details.json.backup");
    writeFileSync(backupPath, jsonContent, "utf-8");
    log.success(`Backup created: ${backupPath}`);

    // Write updated JSON
    writeFileSync(jsonPath, JSON.stringify(updatedJson, null, 2), "utf-8");
    log.success(`Updated: ${jsonPath}`);

    // Summary
    console.log("\n" + "=".repeat(80));
    log.success("Alignment completed!");
    console.log("=".repeat(80));
    log.info(`Total colleges: ${jsonColleges.length}`);
    log.info(`Matched with database: ${matched}`);
    log.info(`Updated: ${updated}`);
    log.info(`Unmatched: ${unmatched.length}`);

    if (unmatched.length > 0) {
      console.log("\n" + "-".repeat(80));
      log.warning("Unmatched colleges (not found in database CSV):");
      unmatched.slice(0, 10).forEach((name) => {
        log.data(`  - ${name}`);
      });
      if (unmatched.length > 10) {
        log.data(`  ... and ${unmatched.length - 10} more`);
      }
    }

    log.success("\n✅ Original file backed up as college_details.json.backup");
    log.success("✅ Updated college_details.json is ready for import");
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
