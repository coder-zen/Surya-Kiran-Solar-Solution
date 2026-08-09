/**
 * Recompresses the brand images in public/assets in place.
 *
 * These files are shipped straight off a DSLR — 5-9MB each, several thousand
 * pixels wide, for slots that render at a few hundred CSS pixels. The homepage
 * alone pulled ~30MB before anything was readable, which is a minute-plus on
 * the 4G connections most visitors arrive on.
 *
 * Nothing here touches admin-uploaded photos: those live on Cloudinary and are
 * already resized at delivery (src/utils/cloudinaryImage.js). This covers only
 * the static assets Vercel serves from public/, which that helper deliberately
 * passes through untouched.
 *
 * Run after adding or replacing any file in public/assets:
 *   npm run compress-assets
 *
 * Safe to re-run: anything already at or under the target is skipped, so a
 * second pass is a no-op rather than a slow quality death by re-encoding.
 * The pre-compression originals remain in git history if one is ever needed
 * back at full resolution.
 */
import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "public", "assets");

/** Widest slot any of these fill is a full-bleed hero; 2000px covers it on a 2x screen. */
const MAX_EDGE = 2000;
const JPEG_QUALITY = 80;
/** Anything this small is already web-sized; re-encoding would only lose quality. */
const SKIP_UNDER_BYTES = 300 * 1024;
/**
 * Bytes per pixel is what actually distinguishes "already compressed" from
 * "straight off the camera", independent of resolution: a quality-80 mozjpeg
 * lands near 0.1, while a raw DSLR frame is 0.5 and up. Comparing file size
 * alone would re-encode an already-optimised 400KB image on every run and
 * shave quality off it each time.
 */
const SKIP_OVER_BPP = 0.25;

const EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const mb = (bytes) => (bytes / 1048576).toFixed(2);

const compress = async (file) => {
  const before = statSync(file).size;
  const ext = extname(file).toLowerCase();

  if (!EXTENSIONS.has(ext)) return null;
  if (before < SKIP_UNDER_BYTES) return { file, before, after: before, skipped: true };

  // Already within the target dimensions and already efficiently encoded —
  // this is a file a previous run produced, so leave it alone.
  const { width, height } = await sharp(file).metadata();
  const fitsTarget = width <= MAX_EDGE && height <= MAX_EDGE;
  if (fitsTarget && before / (width * height) < SKIP_OVER_BPP) {
    return { file, before, after: before, skipped: true };
  }

  // sharp cannot read and write the same path in one pass, so encode to a
  // temporary neighbour and swap it in only once it has written cleanly —
  // a crash mid-encode then leaves the original intact rather than a stub.
  const temp = `${file}.tmp`;
  const pipeline = sharp(file).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  await (ext === ".png"
    ? pipeline.png({ compressionLevel: 9, palette: true }).toFile(temp)
    : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toFile(temp)
  );

  const after = statSync(temp).size;

  // Refuse to make a file bigger — some already-optimised PNGs re-encode larger.
  if (after >= before) {
    unlinkSync(temp);
    return { file, before, after: before, skipped: true };
  }

  renameSync(temp, file);
  return { file, before, after, skipped: false };
};

const run = async () => {
  const files = walk(ASSETS_DIR);
  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const file of files) {
    const result = await compress(file).catch((err) => {
      console.error(`  FAILED ${file}: ${err.message}`);
      return null;
    });
    if (!result) continue;

    totalBefore += result.before;
    totalAfter += result.after;
    if (result.skipped) continue;

    changed += 1;
    const saved = (100 - (result.after / result.before) * 100).toFixed(0);
    console.log(
      `  ${mb(result.before).padStart(7)} MB -> ${mb(result.after).padStart(6)} MB  (-${saved}%)  ${file.replace(ASSETS_DIR, "")}`
    );
  }

  console.log(
    `\n${changed} file(s) recompressed. public/assets: ${mb(totalBefore)} MB -> ${mb(totalAfter)} MB` +
      ` (${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}% smaller).`
  );
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
