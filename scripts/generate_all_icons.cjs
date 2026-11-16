const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PNG = require('../node_modules/pngjs').PNG;

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const ASSETS = path.join(ROOT, 'assets');
const ANDROID_RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

const SRC_512 = path.join(PUBLIC, 'icon-512.png');
const TEMP_1024 = path.join(ROOT, 'scripts', 'temp-1024.png');

if (!fs.existsSync(ASSETS)) {
  fs.mkdirSync(ASSETS, { recursive: true });
}

// 1. Generate 1024x1024 master icon using sips
console.log('Generating 1024x1024 master...');
execSync(`sips -z 1024 1024 "${SRC_512}" --out "${TEMP_1024}"`);

function resizeWithSips(src, dst, size) {
  execSync(`sips -z ${size} ${size} "${src}" --out "${dst}"`);
}

function createPaddedIcon(srcPath, outPath, totalSize, innerSize, bg) {
  const tempInner = path.join(ROOT, 'scripts', `temp-${innerSize}.png`);
  resizeWithSips(srcPath, tempInner, innerSize);
  const srcPng = PNG.sync.read(fs.readFileSync(tempInner));
  const dst = new PNG({ width: totalSize, height: totalSize });

  // Fill background
  for (let y = 0; y < totalSize; y++) {
    for (let x = 0; x < totalSize; x++) {
      const idx = (totalSize * y + x) * 4;
      dst.data[idx] = bg.r;
      dst.data[idx + 1] = bg.g;
      dst.data[idx + 2] = bg.b;
      dst.data[idx + 3] = bg.a;
    }
  }

  const offset = Math.floor((totalSize - innerSize) / 2);
  for (let y = 0; y < innerSize; y++) {
    for (let x = 0; x < innerSize; x++) {
      const srcIdx = (innerSize * y + x) * 4;
      const dstIdx = (totalSize * (y + offset) + (x + offset)) * 4;
      const alpha = srcPng.data[srcIdx + 3] / 255;

      if (alpha === 1) {
        dst.data[dstIdx] = srcPng.data[srcIdx];
        dst.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
        dst.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
        dst.data[dstIdx + 3] = 255;
      } else if (alpha > 0) {
        dst.data[dstIdx] = Math.round(srcPng.data[srcIdx] * alpha + dst.data[dstIdx] * (1 - alpha));
        dst.data[dstIdx + 1] = Math.round(srcPng.data[srcIdx + 1] * alpha + dst.data[dstIdx + 1] * (1 - alpha));
        dst.data[dstIdx + 2] = Math.round(srcPng.data[srcIdx + 2] * alpha + dst.data[dstIdx + 2] * (1 - alpha));
        dst.data[dstIdx + 3] = Math.max(dst.data[dstIdx + 3], srcPng.data[srcIdx + 3]);
      }
    }
  }

  fs.writeFileSync(outPath, PNG.sync.write(dst));
  try { fs.unlinkSync(tempInner); } catch (e) {}
}

function createRoundIcon(srcPath, outPath) {
  const srcPng = PNG.sync.read(fs.readFileSync(srcPath));
  const size = srcPng.width;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const idx = (size * y + x) * 4;

      if (dist > radius) {
        srcPng.data[idx + 3] = 0;
      } else if (dist > radius - 1) {
        srcPng.data[idx + 3] = Math.round(srcPng.data[idx + 3] * (radius - dist));
      }
    }
  }

  fs.writeFileSync(outPath, PNG.sync.write(srcPng));
}

function packPngsToIco(pngBuffers, outPath) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = 6 + 16 * pngBuffers.length;
  const entries = [];
  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }

  const finalIco = Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
  fs.writeFileSync(outPath, finalIco);
}

// 2. Generate standard public/ icons
console.log('Generating public/ web icons...');
resizeWithSips(TEMP_1024, path.join(PUBLIC, 'icon-512.png'), 512);
resizeWithSips(TEMP_1024, path.join(PUBLIC, 'icon-192.png'), 192);
resizeWithSips(TEMP_1024, path.join(PUBLIC, 'icon-app-512.png'), 512);
resizeWithSips(TEMP_1024, path.join(PUBLIC, 'logo.png'), 512);
resizeWithSips(TEMP_1024, path.join(PUBLIC, 'logo-mark.png'), 256);
resizeWithSips(TEMP_1024, path.join(PUBLIC, 'apple-touch-icon.png'), 180);
resizeWithSips(TEMP_1024, path.join(PUBLIC, 'favicon.png'), 48);

// Maskable PWA icons (central 80% safe zone with #1c1917 background)
console.log('Generating maskable PWA icons...');
const BG_DARK = { r: 28, g: 25, b: 23, a: 255 }; // #1c1917
createPaddedIcon(TEMP_1024, path.join(PUBLIC, 'icon-maskable-512.png'), 512, 410, BG_DARK);
createPaddedIcon(TEMP_1024, path.join(PUBLIC, 'icon-maskable-192.png'), 192, 154, BG_DARK);

// Favicon.ico (16, 32, 48)
console.log('Generating favicon.ico...');
const temp16 = path.join(ROOT, 'scripts', 'temp-16.png');
const temp32 = path.join(ROOT, 'scripts', 'temp-32.png');
const temp48 = path.join(ROOT, 'scripts', 'temp-48.png');
resizeWithSips(TEMP_1024, temp16, 16);
resizeWithSips(TEMP_1024, temp32, 32);
resizeWithSips(TEMP_1024, temp48, 48);

packPngsToIco(
  [
    { width: 16, height: 16, buffer: fs.readFileSync(temp16) },
    { width: 32, height: 32, buffer: fs.readFileSync(temp32) },
    { width: 48, height: 48, buffer: fs.readFileSync(temp48) },
  ],
  path.join(PUBLIC, 'favicon.ico')
);
try {
  fs.unlinkSync(temp16);
  fs.unlinkSync(temp32);
  fs.unlinkSync(temp48);
} catch (e) {}

// 3. Generate assets/ icons for Capacitor
console.log('Generating assets/ Capacitor icons...');
fs.copyFileSync(TEMP_1024, path.join(ASSETS, 'icon-only.png'));
fs.copyFileSync(TEMP_1024, path.join(ASSETS, 'logo.png'));

// Adaptive foreground (720px inner on 1024x1024 transparent)
const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };
createPaddedIcon(TEMP_1024, path.join(ASSETS, 'icon-foreground.png'), 1024, 720, TRANSPARENT);

// Background solid #1c1917
const bgPng = new PNG({ width: 1024, height: 1024 });
for (let i = 0; i < 1024 * 1024 * 4; i += 4) {
  bgPng.data[i] = BG_DARK.r;
  bgPng.data[i + 1] = BG_DARK.g;
  bgPng.data[i + 2] = BG_DARK.b;
  bgPng.data[i + 3] = BG_DARK.a;
}
fs.writeFileSync(path.join(ASSETS, 'icon-background.png'), PNG.sync.write(bgPng));

// 4. Generate native Android launcher mipmap icons
if (fs.existsSync(ANDROID_RES)) {
  console.log('Generating native Android mipmap icons...');
  
  // Set ic_launcher_background.xml to #1c1917
  const bgXmlPath = path.join(ANDROID_RES, 'values', 'ic_launcher_background.xml');
  if (fs.existsSync(bgXmlPath)) {
    fs.writeFileSync(
      bgXmlPath,
      '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1c1917</color>\n</resources>\n'
    );
  }

  const densities = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108, fgInner: 72 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162, fgInner: 108 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216, fgInner: 144 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324, fgInner: 216 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432, fgInner: 288 },
  ];

  for (const { dir, size, fgSize, fgInner } of densities) {
    const targetDir = path.join(ANDROID_RES, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const icLauncher = path.join(targetDir, 'ic_launcher.png');
    const icLauncherRound = path.join(targetDir, 'ic_launcher_round.png');
    const icLauncherFg = path.join(targetDir, 'ic_launcher_foreground.png');

    // Square legacy launcher
    resizeWithSips(TEMP_1024, icLauncher, size);

    // Circular launcher
    createRoundIcon(icLauncher, icLauncherRound);

    // Adaptive foreground (transparent border)
    createPaddedIcon(TEMP_1024, icLauncherFg, fgSize, fgInner, TRANSPARENT);
  }
}

// Cleanup temp
try { fs.unlinkSync(TEMP_1024); } catch (e) {}
console.log('All icons generated successfully!');

