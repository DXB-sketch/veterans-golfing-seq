// Re-encodes every event photo in place: strips EXIF/GPS metadata (phone
// images embed location and time), caps the longest edge at 2000px, and
// recompresses as progressive JPEG. Run after adding new photos:
//   node scripts/optimise-photos.mjs
import { readdir, rename, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const EVENTS_DIR = new URL("../public/images/events/", import.meta.url).pathname;
const MAX_EDGE = 2000;

for (const folder of await readdir(EVENTS_DIR)) {
  const dir = join(EVENTS_DIR, folder);
  if (!(await stat(dir)).isDirectory()) continue;
  for (const file of await readdir(dir)) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
    const path = join(dir, file);
    const before = (await stat(path)).size;
    const meta = await sharp(path).metadata();
    const hasMetadata = Boolean(meta.exif || meta.xmp || meta.iptc);
    const oversize = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE;

    const tmp = `${path}.tmp`;
    // sharp drops all metadata unless asked to keep it, which is the point.
    await sharp(path)
      .rotate() // bake in EXIF orientation before the tag is stripped
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(tmp);
    const after = (await stat(tmp)).size;

    // Recompressing an already well-compressed file can inflate it. Only keep
    // the re-encode when it wins, or when the original had to be rewritten
    // anyway (embedded metadata or too large).
    if (after < before || hasMetadata || oversize) {
      await rename(tmp, path);
      console.log(`${folder}/${file}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`);
    } else {
      await rm(tmp);
      console.log(`${folder}/${file}: ${Math.round(before / 1024)}KB, already clean, left as is`);
    }
  }
}
