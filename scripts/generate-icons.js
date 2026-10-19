const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCrc = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  buf.writeUInt32BE(crc32(toCrc), 8 + len);
  return buf;
}

function createPng(width, height, getPixelRgba) {
  // Each row starts with filter type byte (0 = None) followed by width * 4 RGBA bytes
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance from point (px, py) to line segment (x1, y1)-(x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Point in polygon test
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function renderVFlowIcon(size, maskable = false) {
  return createPng(size, size, (x, y, w, h) => {
    // Coordinate normalized to [0, 100]
    const nx = (x / w) * 100;
    const ny = (y / h) * 100;

    // Background: rounded rect rx=24 (or full bleed if maskable)
    let inBg = true;
    if (!maskable) {
      const rx = 24;
      const rxLeft = 0 + rx;
      const rxRight = 100 - rx;
      const ryTop = 0 + rx;
      const ryBottom = 100 - rx;

      if (nx < rxLeft && ny < ryTop) {
        inBg = Math.hypot(nx - rxLeft, ny - ryTop) <= rx;
      } else if (nx > rxRight && ny < ryTop) {
        inBg = Math.hypot(nx - rxRight, ny - ryTop) <= rx;
      } else if (nx < rxLeft && ny > ryBottom) {
        inBg = Math.hypot(nx - rxLeft, ny - ryBottom) <= rx;
      } else if (nx > rxRight && ny > ryBottom) {
        inBg = Math.hypot(nx - rxRight, ny - ryBottom) <= rx;
      }
    }

    if (!inBg) {
      return [0, 0, 0, 0]; // Transparent outside rounded corner
    }

    // Background color: #059669 -> RGB(5, 150, 105)
    let r = 5, g = 150, b = 105, a = 255;

    // Check "V" stroke: (26, 28) -> (50, 74) -> (74, 28), stroke-width=10, stroke-linecap=round
    const d1 = distToSegment(nx, ny, 26, 28, 50, 74);
    const d2 = distToSegment(nx, ny, 50, 74, 74, 28);
    const minD = Math.min(d1, d2);
    const strokeWidth = 5; // radius is 5 (diameter is 10)

    if (minD <= strokeWidth) {
      // White "V"
      r = 255; g = 255; b = 255;
    }

    // Check lightning bolt: (50, 20) -> (42, 42) -> (58, 42) -> (50, 64) -> (48, 42) -> (50, 42)...
    // From SVG: M50 20L42 42H58L50 64
    // Triangles or polygon: (50, 20), (42, 42), (58, 42), (50, 64)
    // In SVG: M50 20L42 42H58L50 64 -> upper triangle (50,20)-(42,42)-(58,42), lower segment/polygon
    const boltPoly = [
      [50, 20],
      [42, 42],
      [50, 42],
      [47, 64],
      [58, 38],
      [51, 38]
    ];
    // Also SVG exact path M50 20L42 42H58L50 64:
    // Let's test if point is inside lightning bolt
    const boltPolySimple = [
      [50, 20],
      [41, 43],
      [49, 43],
      [46, 64],
      [59, 39],
      [51, 39]
    ];

    if (pointInPoly(nx, ny, boltPolySimple)) {
      // #34D399 -> RGB(52, 211, 153)
      r = 52; g = 211; b = 153;
    }

    return [r, g, b, a];
  });
}

const targetDir = path.join(__dirname, '..', 'apps', 'web', 'public');
fs.writeFileSync(path.join(targetDir, 'pwa-192x192.png'), renderVFlowIcon(192));
fs.writeFileSync(path.join(targetDir, 'pwa-512x512.png'), renderVFlowIcon(512));
fs.writeFileSync(path.join(targetDir, 'apple-touch-icon.png'), renderVFlowIcon(192));
console.log('Successfully generated PWA PNG icons!');
