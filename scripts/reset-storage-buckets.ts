import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket names (matching STORAGE_BUCKETS from storage.ts)
const STORAGE_BUCKETS = {
  LEAGUES: "league-assets",
  TRYOUTS: "tryout-assets",
  SCHOOLS: "school-assets",
  PLAYERS: "player-assets",
  COACHES: "coach-assets",
} as const;

const bucketNames = Object.values(STORAGE_BUCKETS);

async function emptyBucket(bucketName: string) {
  try {
    console.log(`🗑️  Emptying bucket: ${bucketName}`);

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

    if (listError) {
      if (listError.message.includes("not found")) {
        console.log(`   ⚠️  Bucket '${bucketName}' does not exist`);
        return true;
      }
      console.error(
        `   ❌ Error listing files in bucket '${bucketName}':`,
        listError.message,
      );
      return false;
    }

    if (!files || files.length === 0) {
      console.log(`   ✅ Bucket '${bucketName}' is already empty`);
      return true;
    }

    // Delete all files recursively
    await emptyBucketRecursively(bucketName, "");

    console.log(`   ✅ Successfully emptied bucket '${bucketName}'`);
    return true;
  } catch (error) {
    console.error(
      `   ❌ Unexpected error emptying bucket '${bucketName}':`,
      error,
    );
    return false;
  }
}

async function emptyBucketRecursively(bucketName: string, path: string) {
  const { data: items, error } = await supabase.storage
    .from(bucketName)
    .list(path, { limit: 1000 });

  if (error) {
    throw error;
  }

  if (!items || items.length === 0) {
    return;
  }

  // Separate files and folders
  const files = items.filter((item) => item.metadata != null);
  const folders = items.filter((item) => item.metadata == null);

  // Delete files in current directory
  if (files.length > 0) {
    const filePaths = files.map((file) =>
      path ? `${path}/${file.name}` : file.name,
    );

    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`   🗑️  Deleted ${files.length} files from ${path || "root"}`);
  }

  // Recursively empty subfolders
  for (const folder of folders) {
    const folderPath = path ? `${path}/${folder.name}` : folder.name;
    await emptyBucketRecursively(bucketName, folderPath);
  }
}

async function deleteBucket(bucketName: string) {
  try {
    console.log(`🗑️  Deleting bucket: ${bucketName}`);

    const { error } = await supabase.storage.deleteBucket(bucketName);

    if (error) {
      if (error.message.includes("not found")) {
        console.log(`   ⚠️  Bucket '${bucketName}' does not exist`);
        return true;
      } else {
        console.error(
          `   ❌ Error deleting bucket '${bucketName}':`,
          error.message,
        );
        return false;
      }
    }

    console.log(`   ✅ Successfully deleted bucket '${bucketName}'`);
    return true;
  } catch (error) {
    console.error(
      `   ❌ Unexpected error deleting bucket '${bucketName}':`,
      error,
    );
    return false;
  }
}

async function verifyBucketDeleted(bucketName: string) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);

    if (error?.message.includes("not found")) {
      console.log(`   ✅ Bucket '${bucketName}' successfully deleted`);
      return true;
    }

    if (data) {
      console.log(`   ❌ Bucket '${bucketName}' still exists`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      `   ❌ Unexpected error verifying bucket deletion '${bucketName}':`,
      error,
    );
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Supabase Storage Bucket Reset");
  console.log("==========================================");
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(
    `🔑 Using Service Role Key: ${supabaseServiceKey ? "✅ Present" : "❌ Missing"}`,
  );
  console.log("");
  console.log(
    "⚠️  WARNING: This will permanently delete all storage buckets and their contents!",
  );
  console.log("");

  let successCount = 0;
  const totalBuckets = bucketNames.length;

  // Empty all buckets first
  console.log("🗑️  Step 1: Emptying all buckets...");
  for (const bucketName of bucketNames) {
    const success = await emptyBucket(bucketName);
    console.log("");
  }

  // Delete all buckets
  console.log("🗑️  Step 2: Deleting all buckets...");
  for (const bucketName of bucketNames) {
    const success = await deleteBucket(bucketName);
    if (success) successCount++;
    console.log("");
  }

  // Verify all buckets are deleted
  console.log("🔍 Step 3: Verifying bucket deletion...");
  for (const bucketName of bucketNames) {
    await verifyBucketDeleted(bucketName);
  }
  console.log("");

  // Summary
  console.log("📊 Reset Summary");
  console.log("================");
  console.log(
    `✅ Successfully deleted: ${successCount}/${totalBuckets} buckets`,
  );
  console.log("");

  if (successCount === totalBuckets) {
    console.log("🎉 Storage bucket reset complete!");
    console.log("");
    console.log("📝 Next Steps:");
    console.log("1. Run setup-storage-buckets.ts to recreate the buckets");
    console.log("2. Apply RLS policies in Supabase Dashboard");
    console.log("3. Test file uploads in your application");
    process.exit(0);
  } else {
    console.log(
      "⚠️  Some buckets failed to delete. Please check the errors above.",
    );
    process.exit(1);
  }
}

// Run the reset
main().catch((error) => {
  console.error("❌ Fatal error during reset:", error);
  process.exit(1);
});
