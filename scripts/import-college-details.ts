#!/usr/bin/env tsx

/**
 * College Details Import Script
 *
 * This script imports college details from college_details.json into the database.
 * It matches schools by name, type, and state, and updates existing schools or creates new ones.
 * Logos are downloaded and uploaded to Supabase storage.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import type { SchoolType } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import { uploadFile } from "../src/lib/client/storage";
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

// US states list for validation
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

const US_STATES_ABBREVIATIONS = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
];

// Country name to ISO2 code mapping (common countries)
const COUNTRY_ISO2_MAP: Record<string, string> = {
  "United States": "US",
  USA: "US",
  US: "US",
  Canada: "CA",
  Mexico: "MX",
  "United Kingdom": "GB",
  UK: "GB",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Spain: "ES",
  Italy: "IT",
  Japan: "JP",
  China: "CN",
  "South Korea": "KR",
  Brazil: "BR",
  India: "IN",
  Russia: "RU",
  Netherlands: "NL",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Finland: "FI",
  Poland: "PL",
  Belgium: "BE",
  Switzerland: "CH",
  Austria: "AT",
  Portugal: "PT",
  Greece: "GR",
  Ireland: "IE",
  "New Zealand": "NZ",
  "South Africa": "ZA",
};

// Map state abbreviations to full names
const STATE_ABBREV_TO_FULL: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

// Get country ISO2 code from country name
function getCountryISO2(countryName: string): string {
  const normalized = countryName.trim();

  // Check direct mapping
  if (COUNTRY_ISO2_MAP[normalized]) {
    return COUNTRY_ISO2_MAP[normalized];
  }

  // Check case-insensitive
  const lower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(COUNTRY_ISO2_MAP)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }

  // Default to US if not found
  return "US";
}

// Normalize state name (handle abbreviations)
function normalizeState(stateInput: string | null): string | null {
  if (!stateInput) return null;

  const trimmed = stateInput.trim();

  // Check if it's an abbreviation (2 letters, uppercase)
  if (trimmed.length === 2 && trimmed === trimmed.toUpperCase()) {
    return STATE_ABBREV_TO_FULL[trimmed] || trimmed;
  }

  // Check if it matches a full state name
  const matchedState = US_STATES.find(
    (state) => state.toLowerCase() === trimmed.toLowerCase(),
  );

  if (matchedState) {
    return matchedState;
  }

  // Check if it matches an abbreviation (case-insensitive)
  const upperTrimmed = trimmed.toUpperCase();
  if (STATE_ABBREV_TO_FULL[upperTrimmed]) {
    return STATE_ABBREV_TO_FULL[upperTrimmed];
  }

  return trimmed;
}

// Parse location string to extract city, state, and country
function parseLocation(location: string): {
  city: string;
  state: string | null;
  country: string;
  countryISO2: string;
} {
  const parts = location.split(",").map((p) => p.trim());

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    if (!lastPart) {
      return {
        city: location,
        state: null,
        country: "United States",
        countryISO2: "US",
      };
    }
    const city = parts.slice(0, -1).join(", ");

    // Check if last part is a US state (full name or abbreviation)
    const normalizedState = normalizeState(lastPart);
    const isUSState = normalizedState && US_STATES.includes(normalizedState);

    // Also check if it's a known abbreviation
    const isAbbrev =
      lastPart.length === 2 &&
      lastPart === lastPart.toUpperCase() &&
      STATE_ABBREV_TO_FULL[lastPart];

    if (isUSState || isAbbrev) {
      return {
        city,
        state: normalizedState ?? lastPart,
        country: "United States",
        countryISO2: "US",
      };
    } else {
      // Assume it's a country
      return {
        city: parts.slice(0, -1).join(", "),
        state: null,
        country: lastPart,
        countryISO2: getCountryISO2(lastPart),
      };
    }
  }

  // Default to US if we can't parse
  return {
    city: location,
    state: null,
    country: "United States",
    countryISO2: "US",
  };
}

// Determine school type from name and context
function determineSchoolType(
  programName: string,
  location: string,
): SchoolType {
  const name = programName.toLowerCase();

  // Check for high school indicators
  if (name.includes("high school") || name.includes("hs")) {
    return "HIGH_SCHOOL";
  }

  // Check for college indicators (2-year)
  if (
    name.includes("community college") ||
    name.includes("junior college") ||
    name.includes("technical college") ||
    name.includes("cc")
  ) {
    return "COLLEGE";
  }

  // Default to university (4-year)
  return "UNIVERSITY";
}

// Parse GPA string to decimal
function parseGPA(gpa: string | null): number | null {
  if (!gpa || gpa === "N/A") return null;
  const parsed = parseFloat(gpa);
  return isNaN(parsed) ? null : parsed;
}

// Parse SAT/ACT score
function parseScore(score: string | null): number | null {
  if (!score || score === "N/A") return null;
  const parsed = parseInt(score);
  return isNaN(parsed) ? null : parsed;
}

// Generate slug from text (URL-friendly)
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Download and upload logo to Supabase storage
async function downloadAndUploadLogo(
  logoUrl: string | null,
  schoolId: string,
): Promise<string | null> {
  if (!logoUrl) return null;

  try {
    log.step(`Downloading logo from ${logoUrl}...`);

    // Download the image
    const response = await fetch(logoUrl);
    if (!response.ok) {
      log.warning(`Failed to download logo: ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file extension from URL or content type
    const contentType = response.headers.get("content-type") || "image/jpeg";
    let extension = "jpg";
    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("gif")) extension = "gif";
    else if (contentType.includes("svg")) extension = "svg";

    // Generate file path
    const timestamp = Date.now();
    const filePath = `${schoolId}/logo/${timestamp}.${extension}`;

    // Upload to Supabase storage
    const result = await uploadFile(
      "SCHOOLS",
      filePath,
      new File([buffer], filePath, { type: contentType }),
    );

    if (!result.success) {
      log.warning(`Failed to upload logo: ${result.error ?? "Unknown error"}`);
      return null;
    }

    // Get the public URL
    log.success(`Logo uploaded: ${result.url ?? "Unknown error"}`);
    return result.url || null;
  } catch (error) {
    log.warning(
      `Error processing logo: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return null;
  }
}

interface CollegeData {
  slug?: string;
  program_name: string;
  location: string;
  esports_titles: string[];
  social_links: {
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    youtube: string | null;
    twitch: string | null;
  };
  discord_handle: string | null;
  official_website: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  in_state_tuition: string | null;
  out_of_state_tuition: string | null;
  biography: string | null;
  minimum_gpa: string | null;
  minimum_sat: string | null;
  minimum_act: string | null;
  scholarships_available: boolean;
}

async function main() {
  log.info("Starting college details import...");

  try {
    // Read the JSON file
    log.step("Reading college_details.json...");
    const filePath = join(process.cwd(), "college_details.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    const colleges: CollegeData[] = data.colleges || [];
    log.success(`Found ${colleges.length} colleges in JSON file`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ name: string; error: string }> = [];

    // Process each college
    for (const college of colleges) {
      try {
        const { city, state, country, countryISO2 } = parseLocation(
          college.location,
        );
        const schoolType = determineSchoolType(
          college.program_name,
          college.location,
        );

        // Prepare social links JSON
        const socialLinks =
          college.social_links &&
          Object.values(college.social_links).some((v) => v !== null)
            ? college.social_links
            : null;

        // Check if school already exists
        const existingSchool = await db.school.findFirst({
          where: {
            name: college.program_name,
            state: state ?? undefined,
            type: schoolType,
          },
        });

        // Generate UUID if needed (using simple method for compatibility)
        const generateUUID = () => {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            },
          );
        };
        // Download and upload logo if URL exists
        let logoUrl = existingSchool?.logo_url || null;
        if (
          college.logo_url &&
          (!existingSchool || existingSchool.logo_url !== college.logo_url)
        ) {
          // For existing schools, upload immediately. For new schools, we'll upload after creation.
          if (existingSchool) {
            const uploadedLogoUrl = await downloadAndUploadLogo(
              college.logo_url,
              existingSchool.id,
            );
            if (uploadedLogoUrl) {
              logoUrl = uploadedLogoUrl;
            } else {
              // Fallback to original URL if upload fails
              logoUrl = college.logo_url;
            }
          } else {
            // For new schools, we'll use the original URL first, then upload after creation
            logoUrl = college.logo_url;
          }
        }

        // Generate or use slug from JSON
        const slug = college.slug || createSlug(college.program_name);

        // Normalize esports titles (remove null/empty values)
        const esportsTitles = (college.esports_titles || []).filter(
          (title): title is string => Boolean(title && title.trim()),
        );

        // Build school data object with conditional fields
        const schoolDataBase = {
          slug: slug,
          name: college.program_name,
          type: schoolType,
          location: city,
          region: null, // Will need to be set manually or via another process
          country: country,
          country_iso2: countryISO2,
          website: college.official_website || null,
          logo_url: logoUrl,
          bio: college.biography || null,
          email: college.email || null,
          phone: college.phone || null,
          esports_titles: esportsTitles,
          discord_handle: college.discord_handle || null,
          in_state_tuition: college.in_state_tuition || null,
          out_of_state_tuition: college.out_of_state_tuition || null,
          minimum_gpa: parseGPA(college.minimum_gpa),
          minimum_sat: parseScore(college.minimum_sat),
          minimum_act: parseScore(college.minimum_act),
          scholarships_available: college.scholarships_available || false,
        };

        // Add optional fields conditionally
        const schoolData = {
          ...schoolDataBase,
          ...(state ? { state } : {}),
          ...(socialLinks ? { social_links: socialLinks } : {}),
        };

        if (existingSchool) {
          // Update existing school
          await db.school.update({
            where: { id: existingSchool.id },
            data: schoolData as any, // Type assertion needed due to Prisma type generation
          });
          updated++;
          log.data(`Updated: ${college.program_name} (${state ?? "N/A"})`);
        } else {
          // Create new school (Prisma will generate UUID)
          const newSchool = await db.school.create({
            data: schoolData as any, // Type assertion needed due to Prisma type generation
          });

          // Now upload logo with the real school ID
          if (college.logo_url && logoUrl === college.logo_url) {
            const uploadedLogoUrl = await downloadAndUploadLogo(
              college.logo_url,
              newSchool.id,
            );
            if (uploadedLogoUrl) {
              await db.school.update({
                where: { id: newSchool.id },
                data: { logo_url: uploadedLogoUrl },
              });
            }
          }

          created++;
          log.data(`Created: ${college.program_name} (${state})`);
        }
      } catch (error) {
        skipped++;
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        errors.push({ name: college.program_name, error: errorMsg });
        log.warning(`Skipped ${college.program_name}: ${errorMsg}`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(80));
    log.success("Import completed!");
    console.log("=".repeat(80));
    log.info(`Created: ${created} schools`);
    log.info(`Updated: ${updated} schools`);
    log.info(`Skipped: ${skipped} schools`);

    if (errors.length > 0) {
      console.log("\n" + "-".repeat(80));
      log.warning("Errors encountered:");
      errors.forEach(({ name, error }) => {
        log.error(`${name}: ${error}`);
      });
    }
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
