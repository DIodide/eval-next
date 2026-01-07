you dont have to run the migrate game logos since iw ill run and push it oin code

# School Data Setup Guide

This guide covers the setup and import process for enhanced school data, including importing college details and game logos.

## Overview

The school data enhancement adds:

- Country information (name and ISO2 code)
- Social media links (Facebook, Twitter, Instagram, YouTube, Twitch)
- Discord handle
- Tuition information (in-state and out-of-state)
- Academic requirements (GPA, SAT, ACT)
- Scholarship availability
- Game logo mapping system

## Prerequisites

- Node.js and npm installed
- Database connection configured (DATABASE_URL in `.env`)
- Supabase storage configured (for logo uploads)
- Prisma CLI installed

## Step 1: Database Migration

First, apply the schema changes to add the new fields:

<<< Update: just run migrate to run all the latest migrations>>>

```bash
npx prisma migrate dev --name add_school_fields
```

This will:

- Add `country` and `country_iso2` fields to the School model
- Add social media fields (`social_links`, `discord_handle`)
- Add tuition fields (`in_state_tuition`, `out_of_state_tuition`)
- Add academic requirement fields (`minimum_gpa`, `minimum_sat`, `minimum_act`)
- Add `scholarships_available` field
- Remove the `is_us_school` boolean (replaced with `country_iso2`)

After migration, generate the Prisma client:

```bash
npx prisma generate
```

## Step 2: Align College Details with Database (Optional but Recommended)

- Update Army West Point name in json file to match what's in the database (manually)
- Also add the college_details.json and school_rows.csv in the current folder

Before importing, align the JSON data with your existing database to ensure consistency:

```bash
npx tsx -r dotenv/config scripts/align-college-details.ts
```

### What This Script Does

1. **Reads** `schools_rows.csv` (exported from database)
2. **Reads** `college_details.json`
3. **Matches** schools between CSV and JSON by name, state, and type
4. **Updates** JSON with database values (database takes precedence):
   - Uses database `name` (takes precedence)
   - Converts all state names to abbreviations (e.g., "California" → "CA")
   - Merges other database fields (website, logo_url, bio, email, phone) if JSON is missing them
5. **Creates** backup of original JSON as `college_details.json.backup`
6. **Saves** aligned JSON ready for import

### Important Rules

- **Database name takes precedence**: If a school is matched, the database name is used
- **State abbreviations**: All states are converted to abbreviations (e.g., "CA", "TX", "NJ")
- **Non-destructive**: Original JSON is backed up before modification

### Expected Output

```
ℹ️  Starting college details alignment...
🔄 Reading schools_rows.csv...
✅ Found 28 schools in CSV file
🔄 Reading college_details.json...
✅ Found 100 colleges in JSON file
🔄 Aligning colleges with database data...
📄 Matched: ACC Esports (CO)
📄 Matched: ACC FINZ ESPORTS (TX)
...
✅ Alignment completed!
Total colleges: 100
Matched with database: 45
Updated: 45
Unmatched: 55
```

## Step 3: Import College Details

Import college data from `college_details.json`:

```bash
npx tsx -r dotenv/config scripts/import-college-details.ts
```

### What This Script Does

1. **Reads** `college_details.json` from the project root
2. **Parses** location data to extract:
   - City
   - State
   - Country name
   - Country ISO2 code
3. **Determines** school type (HIGH_SCHOOL, COLLEGE, or UNIVERSITY) based on name
4. **Downloads** school logos from URLs in the JSON
5. **Uploads** logos to Supabase `school-assets` bucket
6. **Matches** existing schools by name, type, and state
7. **Updates** existing schools or creates new ones

### Script Behavior

- **Existing Schools**: Updates with new data from JSON (preserves existing data not in JSON)
- **New Schools**: Creates new school records
- **Logos**: Downloads from JSON URLs and uploads to Supabase storage
- **Errors**: Logs errors but continues processing other schools

### Expected Output

```
ℹ️  Starting college details import...
🔄 Reading college_details.json...
✅ Found 100 colleges in JSON file
🔄 Downloading logo from https://...
✅ Logo uploaded: https://...
📄 Created: ACC Esports (Colorado)
📄 Updated: Existing School Name (Texas)
...
✅ Import completed!
Created: 45 schools
Updated: 55 schools
Skipped: 0 schools
```

## Step 4: Migrate Game Logos(**DO NOT RUN**)

No need to run this script as the one I ran already psuhes the updates
Create SVG files and mapping for game logos:

```bash
npx tsx scripts/migrate-game-logos.ts
```

### What This Script Does

1. **Extracts** unique game titles from `college_details.json`
2. **Creates** placeholder SVG files for each game in `public/game-logos/`
3. **Generates** TypeScript mapping file at `src/lib/game-logos.ts`
4. **Creates** JSON mapping file for reference
5. **Creates** README in the game-logos directory

### Generated Files

- `public/game-logos/{normalized-game-name}.svg` - game SVG files
- `src/lib/game-logos.ts` - TypeScript mapping with helper functions
- `public/game-logos/game-logo-mapping.json` - JSON reference mapping
- `public/game-logos/README.md` - Documentation for the directory

### Using Game Logos in Code

```typescript
import { getGameLogoPath } from "@/lib/game-logos";

// Get logo path for a game
const logoPath = getGameLogoPath("VALORANT");
// Returns: "/game-logos/valorant.svg"

// Get all available games
import { getAvailableGameNames } from "@/lib/game-logos";
const games = getAvailableGameNames();
```

### Replacing Placeholder Logos

1. Place actual SVG logo files in `public/game-logos/` with normalized filenames
2. Replace the placeholder files (they won't be overwritten on re-run)
3. The mapping will automatically reference the new files

## Step 5: Verify Data

### Check Database

```bash
npx prisma studio
```

Navigate to the `schools` table and verify:

- New fields are populated
- Country information is correct
- Social links are stored as JSON
- Logos are pointing to Supabase URLs

### Check File System

```bash
ls -la public/game-logos/
```

Verify SVG files were created for each game.

## Schema Changes Summary

### New Fields in School Model

```prisma
model School {
  // ... existing fields ...

  // Location
  country      String?  // Country name for display
  country_iso2  String?  @default("US") // ISO 3166-1 alpha-2 code

  // Social Media
  social_links   Json?  // { facebook, twitter, instagram, youtube, twitch }
  discord_handle String?

  // Tuition
  in_state_tuition    String?
  out_of_state_tuition String?

  // Academic Requirements
  minimum_gpa Decimal? @db.Decimal(3, 2)
  minimum_sat Int?
  minimum_act Int?

  // Scholarships
  scholarships_available Boolean @default(false)
}
```

### Removed Fields

- `is_us_school` (replaced with `country_iso2`)

## API Changes

### Updated tRPC Endpoints

The `schoolProfile` router now returns additional fields:

```typescript
// getById response includes:
{
  // ... existing fields ...
  country: string | null;
  country_iso2: string | null;
  social_links: {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    twitch?: string | null;
  } | null;
  discord_handle: string | null;
  in_state_tuition: string | null;
  out_of_state_tuition: string | null;
  minimum_gpa: number | null;
  minimum_sat: number | null;
  minimum_act: number | null;
  scholarships_available: boolean;
}
```

## UI Updates

### School Profile Page

The school profile page (`/profiles/school/[id]`) now displays:

- Country information with flag indicator
- Social media links section
- Discord handle
- Tuition information
- Academic requirements
- Scholarship availability badge

## Troubleshooting

### Migration Fails

If the migration fails:

1. Check database connection in `.env`
2. Ensure no pending migrations: `npx prisma migrate status`
3. Reset if needed: `npx prisma migrate reset` (⚠️ deletes all data)

### Import Script Issues

**Logos not uploading:**

- Verify Supabase credentials in `.env`
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Ensure `school-assets` bucket exists
- Check network connectivity for logo downloads

**Schools not matching:**

- Check school names match exactly (case-sensitive)
- Verify state names match
- Check school type determination logic

**Country parsing issues:**

- Review location format in JSON
- Check US_STATES list includes all states
- Verify country ISO2 mapping

### Game Logos Script Issues

**SVG files not created:**

- Check `public/game-logos/` directory permissions
- Verify file system write access
- Check for disk space

**Mapping file not generated:**

- Verify TypeScript compilation
- Check `src/lib/` directory exists
- Review console output for errors

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase (for logo uploads)
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..." # Required for logo uploads
```

## File Structure

After setup, you should have:

```
public/
  game-logos/
    valorant.svg
    rocket-league.svg
    ...
    game-logo-mapping.json
    README.md

src/
  lib/
    game-logos.ts  # Auto-generated mapping

scripts/
  import-college-details.ts
  migrate-game-logos.ts
```

## Next Steps

1. **Replace placeholder game logos** with actual SVG files
2. **Review imported school data** for accuracy
3. **Update school logos** if needed (via admin interface)
4. **Test school profile pages** to verify data display
5. **Add game logo URLs** to the script if you have sources

## Maintenance

### Re-running Import Script

The import script is idempotent:

- Existing schools are updated (not duplicated)
- New schools are created
- Logos are re-downloaded if URLs changed

### Re-running Game Logos Script

The game logos script:

- Skips existing SVG files (won't overwrite)
- Updates mapping files
- Creates new SVGs for new games

## Support

For issues:

1. Check console output for specific errors
2. Verify environment variables
3. Review database schema matches Prisma schema
4. Check Supabase storage bucket permissions
