/**
 * Build certificate-base.png from Donation Certficate.docx media + positions.
 */
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const sharp = require('sharp');

const DOCX = path.join(
  __dirname,
  '../src/assets/certificates/Donation Certficate.docx',
);
const OUT_PNG = path.join(
  __dirname,
  '../src/assets/certificates/certificate-base.png',
);
const OUT_DIR = path.join(__dirname, '../src/assets/certificates/_compose');

const PAGE_W = Math.round(11.69 * 150);
const PAGE_H = Math.round(8.27 * 150);
const EMU_PER_INCH = 914400;
const DPI = 150;

function emuToPx(emu) {
  return Math.round((emu / EMU_PER_INCH) * DPI);
}

function attr(block, name) {
  const m = block.match(new RegExp(`${name}="(\\d+)"`));
  return m ? Number(m[1]) : 0;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const zip = new PizZip(fs.readFileSync(DOCX));
  const rels = zip.file('word/_rels/document.xml.rels').asText();
  const xml = zip.file('word/document.xml').asText();

  const ridToTarget = {};
  for (const m of rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)) {
    ridToTarget[m[1]] = decodeURIComponent(m[2].replace(/^\.\.\//, 'word/').replace(/^\//, ''));
    if (!ridToTarget[m[1]].startsWith('word/')) {
      ridToTarget[m[1]] = 'word/' + ridToTarget[m[1]];
    }
  }

  for (const name of Object.keys(zip.files)) {
    if (!name.startsWith('word/media/')) continue;
    fs.writeFileSync(path.join(OUT_DIR, path.basename(name)), zip.file(name).asNodeBuffer());
  }

  // Group 1 page offset
  const groupBlock = xml.match(
    /<wp:anchor[\s\S]*?<wp:docPr[^>]*name="Group 1"[\s\S]*?<\/wp:anchor>/,
  );
  let groupPosH = 0;
  let groupPosV = 0;
  if (groupBlock) {
    const h = groupBlock[0].match(
      /<wp:positionH[\s\S]*?<wp:posOffset>(\d+)<\/wp:posOffset>/,
    );
    const v = groupBlock[0].match(
      /<wp:positionV[\s\S]*?<wp:posOffset>(\d+)<\/wp:posOffset>/,
    );
    groupPosH = h ? Number(h[1]) : 0;
    groupPosV = v ? Number(v[1]) : 0;
  }

  const pics = [];
  const parts = xml.split(/<pic:pic\b/);
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].slice(0, parts[i].indexOf('</pic:pic>') + 10);
    const name = (block.match(/name="([^"]+)"/) || [])[1] || `pic${i}`;
    const rid = (block.match(/r:embed="(rId\d+)"/) || [])[1];
    if (!rid) continue;
    const xfrm = block.match(/<a:xfrm>[\s\S]*?<\/a:xfrm>/);
    if (!xfrm) continue;
    const x = attr(xfrm[0], 'x');
    const y = attr(xfrm[0], 'y');
    const cx = attr(xfrm[0], 'cx');
    const cy = attr(xfrm[0], 'cy');
    const target = ridToTarget[rid];
    if (!target) continue;
    pics.push({
      name,
      file: path.basename(target),
      x: emuToPx(x + groupPosH),
      y: emuToPx(y + groupPosV),
      w: Math.max(1, emuToPx(cx)),
      h: Math.max(1, emuToPx(cy)),
    });
  }

  // Doc contains duplicated content — keep first occurrence of each name
  const seen = new Set();
  const unique = [];
  for (const p of pics) {
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    unique.push(p);
  }
  console.log(
    'pics',
    unique.length,
    unique.map((p) => `${p.name}:${p.file}@${p.x},${p.y} ${p.w}x${p.h}`).join('\n'),
  );

  const BLACK_BG_FILES = new Set([
    'image2.png',
    'image3.png',
    'image13.png',
    'image17.png',
    'image19.png',
    'image20.png',
    'image30.png',
    'image34.png',
  ]);

  const layers = [];
  for (const p of unique) {
    const src = path.join(OUT_DIR, p.file);
    if (!fs.existsSync(src)) {
      console.warn('missing', p.file);
      continue;
    }
    let img = sharp(src)
      .resize(p.w, p.h, { fit: 'fill' })
      .ensureAlpha();

    if (BLACK_BG_FILES.has(p.file)) {
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] <= 28 && data[i + 1] <= 28 && data[i + 2] <= 28) data[i + 3] = 0;
      }
      img = sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      });
    }

    const buf = await img.png().toBuffer();
    layers.push({
      input: buf,
      left: Math.min(PAGE_W - 1, Math.max(0, p.x)),
      top: Math.min(PAGE_H - 1, Math.max(0, p.y)),
    });
  }

  await sharp({
    create: {
      width: PAGE_W,
      height: PAGE_H,
      channels: 4,
      background: { r: 247, g: 244, b: 236, alpha: 1 },
    },
  })
    .composite(layers)
    .png()
    .toFile(OUT_PNG);

  console.log('wrote', OUT_PNG, fs.statSync(OUT_PNG).size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
