// build-pptx.mjs - generate an EDITABLE PowerPoint (.pptx) from combined.md.
//
// Unlike `marp --pptx` (which rasterizes each slide to an image), this produces
// native PowerPoint text boxes you can edit in PowerPoint / Google Slides /
// Keynote. It re-creates the dark theme as PPTX styling.
//
// Run:  node build-pptx.mjs            -> claude-code-deck.pptx
//       node build-pptx.mjs out.pptx   -> out.pptx
//
// pptxgenjs is fetched on demand by the build script (npx); when run directly it
// must be resolvable (e.g. `npm i pptxgenjs` or run via `npx -p pptxgenjs node ...`).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PptxGenJS = require('pptxgenjs');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'combined.md');
const OUT = path.resolve(ROOT, process.argv[2] || 'claude-code-deck.pptx');

// ---- theme (mirrors the Marp dark theme) ----
const C = {
  bg: '0D1117',
  bgTitle: '111A2B',
  bgSection: '102030',
  fg: 'E6EDF3',
  muted: '9DA7B3',
  accent: 'FFD369',
  accent2: '58A6FF',
  codeBg: '1E242C',
  border: 'FFD369', // yellow frame border for the default (CONTENT) layout
};
const FONT = 'Arial';
const MONO = 'JetBrains Mono';

const md = fs.readFileSync(SRC, 'utf8');

// Drop the YAML front-matter, then split into slides on lines that are exactly '---'.
const noFront = md.replace(/^---\n[\s\S]*?\n---\n/, '');
const rawSlides = noFront.split(/\n---\n/).map(s => s.trim()).filter(Boolean);

// Classify each slide block.
function classify(block) {
  if (/<!--\s*_class:\s*title\s*-->/.test(block)) return 'title';
  if (/<!--\s*_class:\s*section\s*-->/.test(block)) return 'section';
  return 'content';
}

// Parse a content block into a heading + ordered items (bullets / code / text).
function parse(block) {
  const lines = block.replace(/<!--[\s\S]*?-->/g, '').split('\n');
  let heading = null;
  const items = [];
  let i = 0;
  for (; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    const h = lines[i].match(/^#{1,6}\s+(.*)$/);
    if (h) { heading = h[1].trim(); i++; }
    break;
  }
  let buf = [];
  const flush = () => {
    const b = buf.filter(l => l.trim() !== '');
    if (b.length) items.push({ type: 'bullets', lines: b });
    buf = [];
  };
  for (; i < lines.length; i++) {
    const ln = lines[i];
    if (/^```/.test(ln.trim())) {
      flush();
      const code = [];
      i++;
      for (; i < lines.length && !/^```/.test(lines[i].trim()); i++) code.push(lines[i]);
      items.push({ type: 'code', text: code.join('\n') });
    } else if (/^\s*[-*]\s+/.test(ln)) {
      buf.push(ln);
    } else if (/^>\s?/.test(ln)) {
      flush();
      items.push({ type: 'quote', text: ln.replace(/^>\s?/, '') });
    } else if (ln.trim() === '') {
      // ignore blank between blocks
    } else {
      buf.push(ln);
    }
  }
  flush();
  return { heading, items };
}

// Strip simple inline markdown (`code`, **bold**, *italic*) into pptx text runs.
function inlineRuns(text, base) {
  const runs = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index), options: { ...base } });
    if (m[1]) runs.push({ text: m[1].slice(1, -1), options: { ...base, fontFace: MONO, color: C.accent } });
    else if (m[2]) runs.push({ text: m[2].slice(2, -2), options: { ...base, bold: true, color: C.accent } });
    else if (m[3]) runs.push({ text: m[3].slice(1, -1), options: { ...base, italic: true } });
    last = re.lastIndex;
  }
  if (last < text.length) runs.push({ text: text.slice(last), options: { ...base } });
  return runs.length ? runs : [{ text, options: { ...base } }];
}

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'W16x9', width: 13.333, height: 7.5 });
pptx.layout = 'W16x9';
pptx.author = 'ElconLab · Nir Geier';
pptx.title = 'Claude Code - Study Notes';

const W = 13.333, H = 7.5, MX = 0.7;

// ---------------------------------------------------------------------------
// Slide Masters - edit these to restyle the whole deck in one place.
// Each content/section/title slide is built ON one of these masters, so the
// background, accent stripe, header rule and footer all live here (in the
// PowerPoint master), not on every slide. Open View > Slide Master in
// PowerPoint to tweak them visually, or change the values here and rebuild.
// ---------------------------------------------------------------------------
const FOOTER_TEXT = 'ElconLab · Nir Geier';

// Left-edge gradient stripe (like slide #2's section stripe, with a gradient).
// pptxgenjs 4.x does NOT emit real <a:gradFill>, so we simulate a smooth
// vertical gradient by stacking many thin color-stepped bars down the edge.
// width ~0.13in ≈ 12px at the deck's render scale (10-15px range).
const STRIPE_W = 0.13;          // stripe width (inches) ~= 12px
const STRIPE_FROM = 'FFD369';   // top: yellow accent
const STRIPE_TO   = 'C8881F';   // bottom: deeper amber
const STRIPE_STEPS = 24;

function hexLerp(a, b, t) {
  const A = [0, 2, 4].map(i => parseInt(a.substr(i, 2), 16));
  const B = [0, 2, 4].map(i => parseInt(b.substr(i, 2), 16));
  return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Returns an array of rect objects forming a gradient stripe on the left edge.
function leftGradientStripe() {
  const segH = H / STRIPE_STEPS;
  const out = [];
  for (let i = 0; i < STRIPE_STEPS; i++) {
    const color = hexLerp(STRIPE_FROM, STRIPE_TO, i / (STRIPE_STEPS - 1));
    // overlap each segment slightly so no hairline gaps show between bars
    out.push({ rect: { x: 0, y: i * segH, w: STRIPE_W, h: segH + 0.02, fill: { color } } });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Logos - extracted from the user-edited PowerPoint master (claude-code-deck.pptx).
// Same images and same positions (inches, on a 13.333 x 7.5 deck). Edit the
// x/y/w/h here to reposition; replace the files in assets/ to swap artwork.
// ---------------------------------------------------------------------------
const LOGOS = [
  { path: path.join(ROOT, 'assets/logo-top-right.png'),        x: 10.573, y: 0.128, w: 1.983, h: 0.633 }, // ELCON (top-right)
  { path: path.join(ROOT, 'assets/logo-top-right-square.png'), x: 12.594, y: 0.061, w: 0.7,   h: 0.7   }, // Claude (top-right corner)
  { path: path.join(ROOT, 'assets/logo-bottom-left.png'),      x: 0.153,  y: 6.922, w: 1.834, h: 0.506 }, // CodeWizard (bottom-left)
];

// Returns image objects for the slide masters (so logos appear on every slide).
function logoObjects() {
  return LOGOS.map(l => ({ image: { path: l.path, x: l.x, y: l.y, w: l.w, h: l.h } }));
}

// TITLE master - opening slide.
pptx.defineSlideMaster({
  title: 'TITLE',
  background: { color: C.bgTitle },
  objects: [
    // left-edge yellow gradient stripe
    ...leftGradientStripe(),
    // centered accent rule under the title area
    { rect: { x: 4.67, y: 3.45, w: 4.0, h: 0.03, fill: { color: C.accent } } },
    // logos (from the edited PPTX master)
    ...logoObjects(),
  ],
});

// SECTION master - divider before each topic.
pptx.defineSlideMaster({
  title: 'SECTION',
  background: { color: C.bgSection },
  objects: [
    // left-edge yellow gradient stripe
    ...leftGradientStripe(),
    // logos (from the edited PPTX master)
    ...logoObjects(),
  ],
  slideNumber: { x: W - 0.7, y: H - 0.4, color: C.muted, fontFace: FONT, fontSize: 10 },
});

// CONTENT master - every body slide. Header rule + footer + page number live here.
pptx.defineSlideMaster({
  title: 'CONTENT',
  background: { color: C.bg },
  objects: [
    // left-edge yellow gradient stripe (the default layout's border, like slide #2)
    ...leftGradientStripe(),
    // thin accent rule under the heading band
    { rect: { x: MX, y: 1.35, w: W - 2 * MX, h: 0.02, fill: { color: C.accent2 } } },
    // logos (from the edited PPTX master)
    ...logoObjects(),
    // running footer (centered so it doesn't collide with the bottom-left logo)
    { text: { text: FOOTER_TEXT, options: { x: 2.2, y: H - 0.42, w: W - 4.4, h: 0.3, fontFace: FONT, fontSize: 9, color: C.muted, align: 'center' } } },
  ],
  slideNumber: { x: W - 0.7, y: H - 0.4, color: C.muted, fontFace: FONT, fontSize: 10 },
});

let count = 0;
for (const block of rawSlides) {
  const kind = classify(block);
  const masterName = kind === 'title' ? 'TITLE' : kind === 'section' ? 'SECTION' : 'CONTENT';
  const slide = pptx.addSlide({ masterName });

  if (kind === 'title') {
    slide.addText('Claude Code', { x: 0, y: 2.3, w: W, h: 1.2, align: 'center', fontFace: FONT, fontSize: 54, bold: true, color: 'FFFFFF' });
    slide.addText('A Practical Study Deck - 16 Topics', { x: 0, y: 3.6, w: W, h: 0.6, align: 'center', fontFace: FONT, fontSize: 26, bold: true, color: C.accent });
    slide.addText('Original study notes', { x: 0, y: 4.4, w: W, h: 0.4, align: 'center', fontFace: FONT, fontSize: 18, color: C.fg });
    slide.addText('Introduction → Wrapping Up', { x: 0, y: 5.0, w: W, h: 0.4, align: 'center', fontFace: MONO, fontSize: 16, color: C.muted });
    count++;
    continue;
  }

  const { heading, items } = parse(block);

  if (kind === 'section') {
    slide.addText(heading || '', { x: MX + 0.3, y: 2.6, w: W - 2 * MX - 0.3, h: 1.0, fontFace: FONT, fontSize: 40, bold: true, color: C.accent });
    const quote = items.find(it => it.type === 'quote');
    if (quote) {
      slide.addText(inlineRuns(quote.text, { fontFace: FONT, fontSize: 20, color: C.muted, italic: true }),
        { x: MX + 0.3, y: 3.7, w: W - 2 * MX - 0.3, h: 1.1, valign: 'top' });
    }
    count++;
    continue;
  }

  // content slide (background, header rule, footer, page number come from CONTENT master)
  slide.addText(heading || '', { x: MX, y: 0.5, w: W - 2 * MX, h: 0.8, fontFace: FONT, fontSize: 30, bold: true, color: C.accent2 });

  let y = 1.6;
  const bottom = H - 0.6;
  for (const it of items) {
    if (y >= bottom) break; // safety; splitter should prevent overflow
    if (it.type === 'bullets') {
      const paras = it.lines.map((l, idx) => {
        const txt = l.replace(/^\s*[-*]\s+/, '');
        const indent = /^\s{2,}/.test(l) ? 1 : 0;
        const runs = inlineRuns(txt, { fontFace: FONT, fontSize: 20, color: C.fg });
        return runs.map((r, ri) => ({
          text: r.text,
          options: {
            ...r.options,
            bullet: ri === 0 ? { code: '2022', indentLevel: indent } : false,
            paraSpaceAfter: ri === runs.length - 1 ? 6 : 0,
            breakLine: ri === runs.length - 1,
          },
        }));
      }).flat();
      const h = Math.min(bottom - y, it.lines.length * 0.55 + 0.1);
      slide.addText(paras, { x: MX, y, w: W - 2 * MX, h, valign: 'top', color: C.fg });
      y += h + 0.1;
    } else if (it.type === 'code') {
      const codeLines = it.text.split('\n');
      const h = Math.min(bottom - y, codeLines.length * 0.26 + 0.25);
      slide.addText(it.text, {
        x: MX, y, w: W - 2 * MX, h,
        fontFace: MONO, fontSize: 15, color: C.fg,
        fill: { color: C.codeBg }, valign: 'top', align: 'left',
        margin: 8, lineSpacingMultiple: 0.95,
      });
      y += h + 0.15;
    } else if (it.type === 'quote') {
      const h = 0.6;
      slide.addText(inlineRuns(it.text, { fontFace: FONT, fontSize: 18, italic: true, color: C.muted }),
        { x: MX, y, w: W - 2 * MX, h, valign: 'top' });
      y += h + 0.1;
    }
  }
  count++;
}

await pptx.writeFile({ fileName: OUT });
console.log(`Wrote ${count} slides -> ${path.relative(ROOT, OUT)} (editable text)`);
