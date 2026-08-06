// Generates the favicon set and the social-share card from the club crest.
// Run: node scripts/generate-brand-assets.mjs
import sharp from "sharp";

const CREST = "public/SEQDVGC-logo-transparent.png";
const NAVY = { r: 11, g: 30, b: 63, alpha: 1 }; // #0B1E3F

// Favicons: crest on transparent, standard sizes.
for (const [size, out] of [
  [32, "public/favicon-32.png"],
  [192, "public/favicon-192.png"],
  [512, "public/favicon-512.png"],
]) {
  await sharp(CREST).resize(size, size).png().toFile(out);
  console.log(`wrote ${out}`);
}

// Apple touch icon: iOS composites onto black if transparent, so give it the
// club navy behind the crest with a little breathing room.
{
  const crest = await sharp(CREST).resize(150, 150).png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: NAVY } })
    .composite([{ input: crest, top: 15, left: 15 }])
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("wrote public/apple-touch-icon.png");
}

// Social share card (Open Graph / Twitter): 1200x630, navy field, crest centred.
{
  const crest = await sharp(CREST).resize(460, 460).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: NAVY } })
    .composite([{ input: crest, top: 85, left: 370 }])
    .png()
    .toFile("public/og-image.png");
  console.log("wrote public/og-image.png");
}
