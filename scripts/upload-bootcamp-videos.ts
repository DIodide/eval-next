/**
 * Upload bootcamp videos, WebVTT captions, and poster frames to Cloudinary.
 *
 * Required env (either variant works — Cloudinary SDK auto-reads CLOUDINARY_URL):
 *   CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>
 *   — or —
 *   CLOUDINARY_CLOUD_NAME=...
 *   CLOUDINARY_API_KEY=...
 *   CLOUDINARY_API_SECRET=...
 *
 * Sources: local compressed 1080p H.264 files + VTTs with <v Ryan Divan> tags.
 */
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Configure from CLOUDINARY_URL or explicit vars.
// Note: the SDK only auto-parses CLOUDINARY_URL into the module-level config on
// the first call in some code paths; calling cloudinary.config(true) forces a
// re-parse so every uploader method (upload, upload_large, etc.) sees the creds.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true);
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.error(
    "Missing Cloudinary credentials. Set CLOUDINARY_URL in .env, e.g.:",
  );
  console.error("  CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME");
  process.exit(1);
}

// Verify creds loaded without printing them
{
  const c = cloudinary.config();
  if (!c.cloud_name || !c.api_key || !c.api_secret) {
    console.error("Cloudinary config missing fields after load. Check CLOUDINARY_URL format.");
    process.exit(1);
  }
  console.log(`Cloudinary configured (cloud: ${c.cloud_name})\n`);
}

const BOOTCAMP_ID = "recruit-bootcamp";
const COMPRESSED_DIR = "/tmp/bootcamp_compressed";
const VTT_DIR = "/tmp/bootcamp_vtt_tagged";
const POSTER_DIR = "/tmp/bootcamp_posters";

interface MediaFile {
  key: string;
  videoFile: string;
  vttFile: string;
  posterFile: string;
  label: string;
}

const MEDIA: MediaFile[] = [
  { key: "whatswhy", videoFile: "whatswhy.mp4", vttFile: "whatswhy.vtt", posterFile: "whatswhy.jpg", label: "Your Why (hook)" },
  { key: "step-1", videoFile: "step-1.mp4", vttFile: "step1.vtt", posterFile: "step-1.jpg", label: "Step 1 — Welcome & Your Why" },
  { key: "step-2", videoFile: "step-2.mp4", vttFile: "step2.vtt", posterFile: "step-2.jpg", label: "Step 2 — College List" },
  { key: "step-3", videoFile: "step-3.mp4", vttFile: "step3.vtt", posterFile: "step-3.jpg", label: "Step 3 — Application & Profile" },
  { key: "step-4", videoFile: "step-4.mp4", vttFile: "step4.vtt", posterFile: "step-4.jpg", label: "Step 4 — Highlight Reel" },
  { key: "step-5", videoFile: "step-5.mp4", vttFile: "step5.vtt", posterFile: "step-5.jpg", label: "Step 5 — Outreach Email" },
];

interface UploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  duration?: number;
  playback_url?: string;
}

async function uploadVideo(
  localPath: string,
  publicId: string,
): Promise<UploadResult> {
  if (!fs.existsSync(localPath)) throw new Error(`missing: ${localPath}`);
  const sizeMB = (fs.statSync(localPath).size / (1024 * 1024)).toFixed(1);
  process.stdout.write(`    video  ${publicId} (${sizeMB}MB) … `);
  // upload_large resolves with the final chunk's response; wrap in a Promise
  // so we get the full resource descriptor via callback (secure_url etc.).
  const r = await new Promise<Record<string, unknown>>((resolve, reject) => {
    cloudinary.uploader.upload_large(
      localPath,
      {
        resource_type: "video",
        folder: `${BOOTCAMP_ID}/videos`,
        public_id: publicId,
        overwrite: true,
        // Generate HLS manifest in the background for adaptive streaming.
        eager: [{ streaming_profile: "hd", format: "m3u8" }],
        eager_async: true,
      },
      (err, result) => {
        if (err) return reject(err instanceof Error ? err : new Error(String(err)));
        if (!result) return reject(new Error("empty upload_large result"));
        resolve(result as Record<string, unknown>);
      },
    );
  });
  console.log("ok");
  return {
    public_id: String(r.public_id),
    secure_url: String(r.secure_url),
    bytes: Number(r.bytes ?? 0),
    duration: typeof r.duration === "number" ? r.duration : undefined,
    playback_url: typeof r.playback_url === "string" ? r.playback_url : undefined,
  };
}

async function uploadCaption(
  localPath: string,
  publicId: string,
): Promise<UploadResult> {
  if (!fs.existsSync(localPath)) throw new Error(`missing: ${localPath}`);
  process.stdout.write(`    vtt    ${publicId} … `);
  const r = await cloudinary.uploader.upload(localPath, {
    resource_type: "raw",
    folder: `${BOOTCAMP_ID}/captions`,
    public_id: publicId,
    overwrite: true,
    use_filename: false,
    unique_filename: false,
  });
  console.log("ok");
  return { public_id: r.public_id, secure_url: r.secure_url, bytes: r.bytes };
}

async function uploadPoster(
  localPath: string,
  publicId: string,
): Promise<UploadResult> {
  if (!fs.existsSync(localPath)) throw new Error(`missing: ${localPath}`);
  process.stdout.write(`    poster ${publicId} … `);
  const r = await cloudinary.uploader.upload(localPath, {
    resource_type: "image",
    folder: `${BOOTCAMP_ID}/posters`,
    public_id: publicId,
    overwrite: true,
  });
  console.log("ok");
  return { public_id: r.public_id, secure_url: r.secure_url, bytes: r.bytes };
}

async function main() {
  console.log("=== Bootcamp Media → Cloudinary ===\n");

  const results: Array<{
    key: string;
    label: string;
    video: UploadResult;
    caption: UploadResult;
    poster: UploadResult;
  }> = [];

  for (const m of MEDIA) {
    console.log(`${m.key}: ${m.label}`);
    const video = await uploadVideo(
      path.join(COMPRESSED_DIR, m.videoFile),
      m.key,
    );
    const caption = await uploadCaption(
      path.join(VTT_DIR, m.vttFile),
      `${m.key}.vtt`,
    );
    const poster = await uploadPoster(
      path.join(POSTER_DIR, m.posterFile),
      m.key,
    );
    results.push({ key: m.key, label: m.label, video, caption, poster });
    console.log("");
  }

  console.log("\n=== Upload complete ===\n");
  for (const r of results) {
    console.log(`${r.key} — ${r.label}`);
    console.log(`  video    ${r.video.secure_url}`);
    console.log(`  duration ${r.video.duration ?? "?"}s`);
    console.log(`  caption  ${r.caption.secure_url}`);
    console.log(`  poster   ${r.poster.secure_url}`);
    console.log("");
  }

  // JSON for easy copy into seed-bootcamp.ts
  const seedReady = results.map((r) => ({
    key: r.key,
    videoUrl: r.video.secure_url,
    durationSeconds: Math.round(r.video.duration ?? 0),
    captionUrl: r.caption.secure_url,
    posterUrl: r.poster.secure_url,
  }));
  const outPath = "/tmp/bootcamp_upload_manifest.json";
  fs.writeFileSync(outPath, JSON.stringify(seedReady, null, 2));
  console.log(`Manifest written → ${outPath}`);
  console.log(JSON.stringify(seedReady, null, 2));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
