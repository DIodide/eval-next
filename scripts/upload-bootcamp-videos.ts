import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = "bootcamp-assets";
const BOOTCAMP_SLUG = "recruit-bootcamp";

// Map of step number to local file path
const VIDEO_FILES: { step: number; localPath: string; fileName: string }[] = [
  {
    step: 0,
    localPath: "/Users/ibraheemamin/Downloads/Bootcamp Intergration/Step 0/Step0.mp4",
    fileName: "step-0.mp4",
  },
  {
    step: 1,
    localPath: "/Users/ibraheemamin/Downloads/Bootcamp Intergration/Step 1/Step 1.mp4",
    fileName: "step-1.mp4",
  },
  {
    step: 2,
    localPath: "/Users/ibraheemamin/Downloads/Bootcamp Intergration/Step 2/Step 2.mp4",
    fileName: "step-2.mp4",
  },
  {
    step: 3,
    localPath: "/Users/ibraheemamin/Downloads/Bootcamp Intergration/Step 3/Step 3.mp4",
    fileName: "step-3.mp4",
  },
  {
    step: 4,
    localPath: "/Users/ibraheemamin/Downloads/Bootcamp Intergration/Step 4/Step 4.mp4",
    fileName: "step-4.mp4",
  },
  {
    step: 5,
    localPath: "/Users/ibraheemamin/Downloads/Bootcamp Intergration/Step 5/Step 5.mp4",
    fileName: "step-5.mp4",
  },
];

async function ensureBucketExists() {
  console.log(`Checking bucket: ${BUCKET_NAME}`);

  const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);

  if (error) {
    console.log(`Creating bucket: ${BUCKET_NAME}`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 200 * 1024 * 1024, // 200MB max for videos
      allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
    });

    if (createError) {
      console.error(`Failed to create bucket: ${createError.message}`);
      process.exit(1);
    }
    console.log(`Bucket created: ${BUCKET_NAME}`);
  } else {
    console.log(`Bucket already exists: ${BUCKET_NAME}`);
  }
}

async function uploadVideo(video: (typeof VIDEO_FILES)[number]): Promise<string> {
  const storagePath = `${BOOTCAMP_SLUG}/${video.fileName}`;

  console.log(`Uploading Step ${video.step}: ${video.localPath}`);
  console.log(`  -> ${storagePath}`);

  if (!fs.existsSync(video.localPath)) {
    console.error(`  File not found: ${video.localPath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(video.localPath);
  const fileSizeMB = (fileBuffer.byteLength / (1024 * 1024)).toFixed(1);
  console.log(`  File size: ${fileSizeMB}MB`);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      cacheControl: "86400",
      upsert: true,
    });

  if (error) {
    console.error(`  Upload failed: ${error.message}`);
    process.exit(1);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  console.log(`  Uploaded: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

async function main() {
  console.log("=== Bootcamp Video Upload Script ===\n");

  await ensureBucketExists();
  console.log("");

  const urls: Record<number, string> = {};

  for (const video of VIDEO_FILES) {
    urls[video.step] = await uploadVideo(video);
    console.log("");
  }

  console.log("=== Upload Complete ===\n");
  console.log("Video URLs for seed script:\n");

  for (const [step, url] of Object.entries(urls)) {
    console.log(`Step ${step}: ${url}`);
  }

  console.log("\nCopy these URLs into prisma/seed-bootcamp.ts if needed.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
