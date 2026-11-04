const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const fontkit = require('fontkit');
const { decompress } = require('wawoff2');
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'frontend/public');
const out = path.join(publicDir, 'brand');
const families = {};
const variations = new Map();
const mark = '<path d="M40 5H20C11.72 5 5 11.72 5 20h7.5a7.5 7.5 0 0 1 7.5-7.5h15L40 5ZM17.25 20.5H38L33.5 27.5H17.25A3.5 3.5 0 0 1 17.25 20.5ZM8 43H28c8.28 0 15-6.72 15-15h-7.5a7.5 7.5 0 0 1-7.5 7.5H13L8 43Z"/>';
function textPaths(text, x, y, size, fill, weight = 600, family = 'bricolage-grotesque', tracking = -0.035) {
  let cursor = x;
  const result = [];
  for (const char of text) {
    const base = families[family].find(font => font.hasGlyphForCodePoint(char.codePointAt(0))) || families[family][0];
    const key = `${family}:${families[family].indexOf(base)}:${weight}`;
    if (!variations.has(key)) {
      variations.set(key, base.getVariation({ wght: weight }));
    }
    const font = variations.get(key);
    const glyph = font.glyphForCodePoint(char.codePointAt(0));
    const scale = size / font.unitsPerEm;
    result.push(`<path fill="${fill}" transform="translate(${cursor.toFixed(3)} ${y}) scale(${scale} ${-scale})" d="${glyph.path.toSVG()}"/>`);
    cursor += glyph.advanceWidth * scale + size * tracking;
  }
  return { markup: result.join(''), width: cursor - x };
}
function text(...args) { return textPaths(...args).markup; }
function logo(x, y, size, color) {
  const word = textPaths('sportslot.', x + size * 1.28, y + size * .78, size * .92, color, 700, 'bricolage-grotesque', -.052);
  return `<g transform="translate(${x} ${y}) scale(${size / 48})" fill="${color}">${mark}</g>${word.markup}`;
}
const svg = (w, h, inner, title = 'SportSlot') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><title>${title}</title>${inner}</svg>`;
async function main() {
  for (const family of ['bricolage-grotesque', 'inter']) {
    families[family] = [];
    for (const subset of ['latin', 'latin-ext']) {
      const data = fs.readFileSync(path.join(publicDir, `fonts/${family}-${subset}-wght-normal.woff2`));
      families[family].push(fontkit.create(Buffer.from(await decompress(data))));
    }
  }
  fs.mkdirSync(out, { recursive: true });
  for (const [name,color] of Object.entries({ forest:'#173b2b', chalk:'#f7f9f4', lime:'#d2f34c' })) {
    const symbol = svg(48,48,`<g fill="${color}">${mark}</g>`);
    fs.writeFileSync(path.join(out,`sportslot-symbol-${name}.svg`),symbol);
    const wordmark=svg(436,96,logo(8,8,80,color));
    fs.writeFileSync(path.join(out,`sportslot-logo-${name}.svg`),wordmark);
    await sharp(Buffer.from(wordmark)).resize(1664).png().toFile(path.join(out,`sportslot-logo-${name}.png`));
  }
  const icon=svg(512,512,`<rect width="512" height="512" rx="112" fill="#d2f34c"/><g transform="translate(64 64) scale(8)" fill="#173b2b">${mark}</g>`);
  fs.writeFileSync(path.join(out,'sportslot-avatar.svg'),icon);
  await sharp(Buffer.from(icon)).png().toFile(path.join(out,'sportslot-avatar.png'));
  await sharp(Buffer.from(icon)).resize(180).png().toFile(path.join(root,'frontend/src/app/apple-icon.png'));
  const photo = (await sharp(path.join(publicDir,'images/tennis-hero.webp')).jpeg({ quality: 92 }).toBuffer()).toString('base64');
  function campaign(w,h,vertical) {
    const left = vertical ? 64 : 64;
    const headlineSize = vertical ? 104 : 80;
    const line1 = vertical ? h - 470 : 288;
    return svg(w,h,`<defs><linearGradient id="shade" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="#0e2a1c" stop-opacity="${vertical ? '.15' : '.93'}"/><stop offset="1" stop-color="#0e2a1c" stop-opacity="${vertical ? '.95' : '.05'}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="#173b2b"/><image href="data:image/jpeg;base64,${photo}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/><rect width="${w}" height="${h}" fill="url(#shade)"/>${logo(left,54,52,'#f7f9f4')}${text('Méně domlouvání.',left,line1,headlineSize,'#f7f9f4')}${text('Více hraní.',left,line1+headlineSize*1.15,headlineSize,'#d2f34c')}${text('Tvůj čas. Tvoje hra.',left,line1+headlineSize*1.15+60,vertical?28:25,'#f7f9f4',500,'inter',0)}<rect x="${left}" y="${h-128}" width="${vertical?304:242}" height="58" rx="29" fill="#d2f34c"/>${text('Objev SportSlot',left+26,h-91,vertical?26:22,'#173b2b',600,'inter',-.02)}`);
  }
  const share=campaign(1200,630,false);
  await sharp(Buffer.from(share)).jpeg({quality:90}).toFile(path.join(root,'frontend/src/app/opengraph-image.jpg'));
  await sharp(Buffer.from(share)).jpeg({quality:90}).toFile(path.join(out,'sportslot-social-landscape.jpg'));
  await sharp(Buffer.from(campaign(1080,1350,true))).jpeg({quality:90}).toFile(path.join(out,'sportslot-social-portrait.jpg'));
  const board=svg(1600,1100,`<rect width="1600" height="1100" fill="#e6ebe2"/><rect x="32" y="32" width="960" height="410" rx="12" fill="#173b2b"/>${logo(112,166,112,'#f7f9f4')}${text('Méně domlouvání. Více hraní.',112,370,26,'#d2f34c',500,'inter',0)}<rect x="1016" y="32" width="552" height="410" rx="12" fill="#d2f34c"/><g transform="translate(1150 84) scale(6)" fill="#173b2b">${mark}</g><rect x="32" y="466" width="750" height="340" rx="12" fill="#f7f9f4"/>${text('Tvůj čas.',76,595,78,'#173b2b')}${text('Tvoje hra.',76,684,78,'#173b2b')}${text('Bricolage Grotesque + Inter',76,758,22,'#5a685f',400,'inter',0)}<rect x="806" y="466" width="762" height="340" rx="12" fill="#173b2b"/>${text('Najdi místo. Udělej si čas. Hraj.',850,544,28,'#f7f9f4',500,'inter',-.025)}<rect x="850" y="590" width="220" height="144" rx="8" fill="#d2f34c"/><rect x="1086" y="590" width="220" height="144" rx="8" fill="#f7f9f4"/><rect x="1322" y="590" width="200" height="144" rx="8" fill="#5a685f"/>${text('#D2F34C',870,705,20,'#173b2b',500,'inter',0)}${text('#F7F9F4',1106,705,20,'#173b2b',500,'inter',0)}${text('#5A685F',1342,705,20,'#f7f9f4',500,'inter',0)}<rect x="32" y="830" width="1536" height="238" rx="12" fill="#f7f9f4"/>${logo(80,900,88,'#173b2b')}${text('Tři dráhy. Jeden volný slot.',800,930,32,'#173b2b')}${text('Značka pro radost ze hry.',800,982,24,'#5a685f',400,'inter',0)}`);
  fs.writeFileSync(path.join(out,'sportslot-identity.svg'),board);
  await sharp(Buffer.from(board)).png().toFile(path.join(out,'sportslot-identity.png'));
  console.log('Exported SVG / transparent PNG logos, avatar, social images and identity board.');
}
main().catch(error=>{console.error(error);process.exit(1)});
