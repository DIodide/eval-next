/**
 * Upload v2 (re-cut step-1 + split step-2 parts) to Cloudinary.
 * Writes manifest to /tmp/bootcamp_upload_manifest_v2.json for merging into seed.
 */
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true);
} else {
  console.error("Missing CLOUDINARY_URL");
  process.exit(1);
}
{
  const c = cloudinary.config();
  if (!c.cloud_name || !c.api_key || !c.api_secret) {
    console.error("Cloudinary config missing fields");
    process.exit(1);
  }
  console.log(`Cloudinary configured (cloud: ${c.cloud_name})\n`);
}

const BOOTCAMP_ID = "recruit-bootcamp";
const COMPRESSED_DIR = "/tmp/bootcamp_compressed_v2";
const VTT_DIR = "/tmp/bootcamp_vtt_v2_tagged";
const POSTER_DIR = "/tmp/bootcamp_posters_v2";

interface MediaFile {
  key: string;
  videoFile: string;
  vttFile: string;
  posterFile: string;
  label: string;
}

const MEDIA: MediaFile[] = [
  {
    key: "step-1",
    videoFile: "step-1.mp4",
    vttFile: "step-1.vtt",
    posterFile: "step-1.jpg",
    label: "Step 1 — Define Your Why (re-cut)",
  },
  {
    key: "step-2-p1-college-list",
    videoFile: "step-2-p1-college-list.mp4",
    vttFile: "step-2-p1-college-list.vtt",
    posterFile: "step-2-p1-college-list.jpg",
    label: "Step 2 Part 1 — Building Your College List",
  },
  {
    key: "step-2-p2-coach-fit",
    videoFile: "step-2-p2-coach-fit.mp4",
    vttFile: "step-2-p2-coach-fit.vtt",
    posterFile: "step-2-p2-coach-fit.jpg",
    label: "Step 2 Part 2 — Choosing the Right Esports Program",
  },
  {
    key: "step-2-p3-eval-search",
    videoFile: "step-2-p3-eval-search.mp4",
    vttFile: "step-2-p3-eval-search.vtt",
    posterFile: "step-2-p3-eval-search.jpg",
    label: "Step 2 Part 3 — Using the EVAL College Search Engine",
  },
];

interface UploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  duration?: number;
  playback_url?: string;
}

async function uploadVideo(localPath: string, publicId: string): Promise<UploadResult> {
  if (!fs.existsSync(localPath)) throw new Error(`missing: ${localPath}`);
  const sizeMB = (fs.statSync(localPath).size / (1024 * 1024)).toFixed(1);
  process.stdout.write(`    video  ${publicId} (${sizeMB}MB) … `);
  const r = await new Promise<Record<string, unknown>>((resolve, reject) => {
    cloudinary.uploader.upload_large(
      localPath,
      {
        resource_type: "video",
        folder: `${BOOTCAMP_ID}/videos`,
        public_id: publicId,
        overwrite: true,
        invalidate: true,
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

async function uploadCaption(localPath: string, publicId: string): Promise<UploadResult> {
  if (!fs.existsSync(localPath)) throw new Error(`missing: ${localPath}`);
  process.stdout.write(`    vtt    ${publicId} … `);
  const r = await cloudinary.uploader.upload(localPath, {
    resource_type: "raw",
    folder: `${BOOTCAMP_ID}/captions`,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    use_filename: false,
    unique_filename: false,
  });
  console.log("ok");
  return { public_id: r.public_id, secure_url: r.secure_url, bytes: r.bytes };
}

async function uploadPoster(localPath: string, publicId: string): Promise<UploadResult> {
  if (!fs.existsSync(localPath)) throw new Error(`missing: ${localPath}`);
  process.stdout.write(`    poster ${publicId} … `);
  const r = await cloudinary.uploader.upload(localPath, {
    resource_type: "image",
    folder: `${BOOTCAMP_ID}/posters`,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  });
  console.log("ok");
  return { public_id: r.public_id, secure_url: r.secure_url, bytes: r.bytes };
}

async function main() {
  console.log("=== Bootcamp v2 → Cloudinary ===\n");
  const results: Array<{
    key: string;
    label: string;
    video: UploadResult;
    caption: UploadResult;
    poster: UploadResult;
  }> = [];

  for (const m of MEDIA) {
    console.log(`${m.key}: ${m.label}`);
    const video = await uploadVideo(path.join(COMPRESSED_DIR, m.videoFile), m.key);
    const caption = await uploadCaption(path.join(VTT_DIR, m.vttFile), `${m.key}.vtt`);
    const poster = await uploadPoster(path.join(POSTER_DIR, m.posterFile), m.key);
    results.push({ key: m.key, label: m.label, video, caption, poster });
    console.log("");
  }

  const seedReady = results.map((r) => ({
    key: r.key,
    label: r.label,
    videoUrl: r.video.secure_url,
    hlsUrl: `https://res.cloudinary.com/${cloudinary.config().cloud_name}/video/upload/sp_hd/${BOOTCAMP_ID}/videos/${r.key}.m3u8`,
    captionUrl: r.caption.secure_url,
    posterUrl: r.poster.secure_url,
    durationSeconds: Math.round(r.video.duration ?? 0),
  }));
  const outPath = "/tmp/bootcamp_upload_manifest_v2.json";
  fs.writeFileSync(outPath, JSON.stringify(seedReady, null, 2));
  console.log(`\nManifest → ${outPath}`);
  console.log(JSON.stringify(seedReady, null, 2));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
