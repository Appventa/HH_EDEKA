import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

const START_B = 104;
const STOP = 106;

function encodeCode128(text) {
  const values = [START_B];
  for (const char of text) {
    const code = char.charCodeAt(0) - 32;
    if (code < 0 || code > 94) continue;
    values.push(code);
  }
  let checksum = values[0];
  for (let i = 1; i < values.length; i++) checksum += values[i] * i;
  values.push(checksum % 103);
  values.push(STOP);

  const segments = [];
  for (const value of values) {
    const pattern = PATTERNS[value];
    for (let i = 0; i < pattern.length; i++) {
      segments.push({ bar: i % 2 === 0, width: Number(pattern[i]) });
    }
  }
  return segments;
}

function barcodeSvg(value, { barWidth = 2, height = 70 } = {}) {
  const segments = encodeCode128(value);
  const totalModules = segments.reduce((sum, s) => sum + s.width, 0);
  const totalWidth = totalModules * barWidth;
  let x = 0;
  let rects = '';
  for (const segment of segments) {
    const width = segment.width * barWidth;
    if (segment.bar) {
      rects += `<rect x="${x}" y="0" width="${width}" height="${height}" fill="#000"/>`;
    }
    x += width;
  }
  return `<svg width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

const brands = [
  { id: 'edeka-foodservice', label: 'EDEKA Foodservice ONE', cssClass: 'edeka' },
  { id: 'handelshof', label: 'Handelshof ONE', cssClass: 'handelshof' },
];

let cards = '';
for (const brand of brands) {
  const products = JSON.parse(readFileSync(join(root, 'src/data/mock', brand.id, 'products.json'), 'utf-8'));
  for (const product of products) {
    cards += `
      <div class="card ${brand.cssClass}">
        <div class="brand">${brand.label}</div>
        <div class="name">${product.name}</div>
        <div class="meta">${product.price.toFixed(2).replace('.', ',')} € ${product.unit}</div>
        ${barcodeSvg(product.ean)}
        <div class="ean">${product.ean}</div>
      </div>`;
  }
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>Test-Barcodes — ONE App</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; margin: 0; }
  h1 { font-size: 16px; margin: 0 0 8mm; }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6mm;
  }
  .card {
    border: 1px solid #ccc;
    border-radius: 4mm;
    padding: 4mm;
    text-align: center;
    break-inside: avoid;
  }
  .card.edeka { background: #FFF6CC; border-color: #FFD500; }
  .card.handelshof { background: #FBE0E3; border-color: #E2001A; }
  .brand { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .name { font-size: 13px; font-weight: bold; margin: 1mm 0; }
  .meta { font-size: 10px; color: #555; margin-bottom: 2mm; }
  svg { width: 100%; height: 18mm; }
  .ean { font-size: 11px; letter-spacing: 2px; margin-top: 1mm; font-family: monospace; }
</style>
</head>
<body>
  <h1>ONE App — Test-Barcodes (Code 128) zum Scannen</h1>
  <div class="grid">${cards}</div>
</body>
</html>`;

const outPath = join(root, 'test-barcodes.html');
writeFileSync(outPath, html, 'utf-8');
console.log(`Wrote ${outPath}`);
