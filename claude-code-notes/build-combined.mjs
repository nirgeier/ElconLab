// Merges the 16 topic decks in slides/ into a single Marp deck: combined.md
// - Dark theme
// - Auto-splits long slides (too many bullets, or bullets + a long code block)
//   across continuation slides labelled "Title (cont.)".
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIR = path.join(ROOT, 'slides');
const files = fs.readdirSync(DIR).filter(f => /^\d\d-.*\.md$/.test(f)).sort();

const titles = {
  '01': 'Introduction to Claude Code', '02': 'Claude Code Under the Hood', '03': 'CLAUDE.md & Plan Mode',
  '04': 'Permissions', '05': 'Effort & Context Windows', '06': 'Skills', '07': 'Hooks', '08': 'MCP Overview',
  '09': 'Subagents', '10': 'Agent Teams', '11': 'Skill Creator', '12': 'Plugins Overview', '13': 'Cowork',
  '14': 'Claude Code Desktop & GitHub Workflow', '15': 'Agent SDK', '16': 'Wrapping Up',
};

// ---- splitting budget (tuned for 16:9 at the theme's font sizes) ----
// Each slide gets a "weight" budget. A bullet line costs ~1, a code line ~0.8,
// a heading is free (repeated on each continuation). When adding the next item
// would exceed the budget, we start a continuation slide.
const SLIDE_BUDGET = 11;     // visual rows that comfortably fit
const BULLET_COST = 1;       // per bullet (incl. wrapped sub-lines)
const CODE_LINE_COST = 0.8;  // per code line (smaller font)
const CODE_FRAME_COST = 1.2; // fixed overhead per code block (padding/border)

const frontmatter = [
  '---',
  'marp: true',
  'theme: cc-dark',
  'paginate: true',
  'size: 16:9',
  "header: 'Claude Code - Study Notes'",
  "footer: 'ElconLab · Nir Geier'",
  'style: |',
  '  /* ===== Dark theme ===== */',
  '  :root {',
  '    --bg: #0d1117;',
  '    --bg-alt: #161b22;',
  '    --fg: #e6edf3;',
  '    --muted: #9da7b3;',
  '    --accent: #ffd369;',
  '    --accent2: #58a6ff;',
  '    --code-bg: #1e242c;',
  '    --border: #30363d;',
  '  }',
  '  section {',
  '    color: var(--fg);',
  '    font-size: 28px;',
  '    padding: 60px 70px;',
  '    /* base color + a 12px left-edge yellow->amber gradient stripe */',
  '    background-color: var(--bg);',
  '    background-image: linear-gradient(180deg, #ffd369 0%, #c8881f 100%);',
  '    background-size: 12px 100%;',
  '    background-position: left top;',
  '    background-repeat: no-repeat;',
  '  }',
  '  h1 { color: var(--accent); font-size: 42px; }',
  '  h2 { color: var(--accent2); font-size: 34px; }',
  '  h3 { color: var(--fg); }',
  '  a { color: var(--accent2); }',
  '  strong { color: var(--accent); }',
  '  blockquote { color: var(--muted); border-left: 4px solid var(--accent); }',
  '  ul, ol { line-height: 1.5; }',
  '  li::marker { color: var(--accent); }',
  "  code { font-family: 'JetBrains Mono', 'Consolas', monospace; background: var(--code-bg); color: #e6edf3; padding: 1px 6px; border-radius: 4px; }",
  "  pre { font-family: 'JetBrains Mono', 'Consolas', monospace; background: var(--code-bg); border: 1px solid var(--border); border-radius: 8px; font-size: 20px; }",
  '  pre code { background: transparent; }',
  '  /* ===== syntax highlighting (highlight.js tokens, GitHub-dark palette) ===== */',
  '  .hljs-comment, .hljs-quote { color: #8b949e; font-style: italic; }',
  '  .hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-name, .hljs-tag { color: #ff7b72; }',
  '  .hljs-string, .hljs-attr, .hljs-template-tag, .hljs-template-variable, .hljs-addition { color: #a5d6ff; }',
  '  .hljs-title, .hljs-section, .hljs-function .hljs-title, .hljs-title.function_ { color: #d2a8ff; }',
  '  .hljs-number, .hljs-literal, .hljs-variable, .hljs-type, .hljs-class .hljs-title { color: #79c0ff; }',
  '  .hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-selector-class { color: #ffa657; }',
  '  .hljs-attribute, .hljs-property { color: #79c0ff; }',
  '  .hljs-deletion { color: #ffa198; }',
  '  .hljs-emphasis { font-style: italic; }',
  '  .hljs-strong { font-weight: bold; }',
  '  table { font-size: 24px; }',
  '  th { background: var(--bg-alt); color: var(--accent); }',
  '  td, th { border: 1px solid var(--border); }',
  '  header, footer { color: var(--muted); font-size: 14px; }',
  '  section::after { color: var(--muted); }  /* page number */',
  '  /* Title slide */',
  '  section.title { background-image: linear-gradient(180deg, #ffd369 0%, #c8881f 100%), linear-gradient(135deg, #0d1117 0%, #1a2333 100%); background-size: 12px 100%, 100% 100%; background-position: left top, left top; background-repeat: no-repeat, no-repeat; justify-content: center; text-align: center; }',
  '  section.title h1 { font-size: 62px; color: #ffffff; }',
  '  section.title h2 { color: var(--accent); font-size: 32px; }',
  '  /* Section divider */',
  '  section.section { background-image: linear-gradient(180deg, #ffd369 0%, #c8881f 100%), linear-gradient(135deg, #161b22 0%, #102030 100%); background-size: 12px 100%, 100% 100%; background-position: left top, left top; background-repeat: no-repeat, no-repeat; justify-content: center; }',
  '  section.section h1 { font-size: 52px; color: var(--accent); border: none; }',
  '  section.section blockquote { font-size: 26px; }',
  '---',
  '',
  '<!-- _class: title -->',
  '',
  '# Claude Code',
  '## A Practical Study Deck - 16 Topics',
  '',
  'Original study notes',
  '',
  '`Introduction → Wrapping Up`',
].join('\n');

// Parse one source slide block into structured pieces, preserving order.
// Returns { heading, items: [{type:'bullets', lines:[...]} | {type:'code', text}] }
function parseSlide(block) {
  const lines = block.split('\n');
  let heading = null;
  const items = [];
  let i = 0;

  // capture leading heading
  for (; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    const h = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (h) { heading = h[2].trim(); i++; }
    break;
  }

  let bulletBuf = [];
  const flushBullets = () => { if (bulletBuf.length) { items.push({ type: 'bullets', lines: bulletBuf }); bulletBuf = []; } };

  for (; i < lines.length; i++) {
    const ln = lines[i];
    if (/^```/.test(ln.trim())) {
      flushBullets();
      const code = [ln];
      i++;
      for (; i < lines.length && !/^```/.test(lines[i].trim()); i++) code.push(lines[i]);
      if (i < lines.length) code.push(lines[i]); // closing fence
      items.push({ type: 'code', text: code.join('\n'), len: code.length });
    } else if (/^\s*[-*] /.test(ln) || (bulletBuf.length && /^\s+\S/.test(ln))) {
      bulletBuf.push(ln);
    } else if (ln.trim() === '') {
      bulletBuf.push(ln); // keep blank lines inside a bullet group lightly
    } else {
      flushBullets();
      items.push({ type: 'text', lines: [ln] });
    }
  }
  flushBullets();
  return { heading, items };
}

// Weight of one rendered item (how much vertical room it takes).
function itemWeight(it) {
  if (it.type === 'code') return CODE_FRAME_COST + it.len * CODE_LINE_COST;
  if (it.type === 'bullets') {
    const n = it.lines.filter(l => l.trim() !== '').length;
    return n * BULLET_COST;
  }
  return it.lines.filter(l => l.trim() !== '').length * BULLET_COST;
}

// Split a bullet group into smaller groups so a single huge group can still be
// distributed across slides.
function explodeBullets(group) {
  // each top-level bullet (with its indented continuation lines) becomes one unit
  const units = [];
  let cur = null;
  for (const l of group.lines) {
    if (/^\s*[-*] /.test(l)) { if (cur) units.push(cur); cur = [l]; }
    else if (cur) cur.push(l);
  }
  if (cur) units.push(cur);
  return units.map(u => ({ type: 'bullets', lines: u }));
}

// Decide whether a slide is "long" and split it into N rendered slides by
// packing items into a per-slide weight budget.
function splitSlide(block) {
  const { heading, items } = parseSlide(block);
  if (!heading) return [block]; // non-standard block (e.g. section divider) untouched

  // Flatten bullet groups into per-bullet units so packing is fine-grained.
  const units = [];
  for (const it of items) {
    if (it.type === 'bullets') units.push(...explodeBullets(it));
    else units.push(it);
  }

  const total = units.reduce((a, u) => a + itemWeight(u), 0);
  if (total <= SLIDE_BUDGET) return [block]; // fits on one slide

  // Pack greedily into pages.
  const pages = [];
  let page = [], w = 0;
  for (const u of units) {
    const uw = itemWeight(u);
    if (page.length && w + uw > SLIDE_BUDGET) { pages.push(page); page = []; w = 0; }
    page.push(u); w += uw;
  }
  if (page.length) pages.push(page);

  return pages.map((p, idx) => {
    const head = idx === 0 ? `## ${heading}` : `## ${heading} (cont.)`;
    return `${head}\n\n${renderItems(p)}`.trim();
  });
}

function renderItems(items) {
  return items.map(it => it.type === 'code' ? it.text : it.lines.join('\n')).join('\n\n').trim();
}

function buildTopic(num, raw) {
  let body = raw;
  body = body.replace(/^#\s+\d+\s*·.*\n/, '');         // drop "# NN · Title"
  const summary = (raw.match(/^>\s*(.+)$/m) || [])[1] || '';
  body = body.replace(/^>\s*.+\n/m, '');                    // drop summary blockquote
  body = body.replace(/^##\s+Slide:\s*/gm, '## ');          // "## Slide: X" -> "## X"

  const blocks = body.split(/\n---\n/).map(b => b.trim()).filter(Boolean);
  const rendered = [];
  for (const b of blocks) rendered.push(...splitSlide(b));

  const divider = `<!-- _class: section -->\n\n# ${num} · ${titles[num]}\n\n> ${summary}`;
  return [divider, ...rendered].join('\n\n---\n\n');
}

const parts = [frontmatter];
for (const f of files) {
  const num = f.slice(0, 2);
  parts.push(buildTopic(num, fs.readFileSync(path.join(DIR, f), 'utf8')));
}
const combined = parts.join('\n\n---\n\n') + '\n';

fs.writeFileSync(path.join(ROOT, 'combined.md'), combined);

const slides = combined.split(/\n---\n/).length;
const conts = (combined.match(/\(cont\.\)/g) || []).length;
console.log(`Merged ${files.length} topic files -> combined.md`);
console.log(`Total slides: ~${slides}  (split created ${conts} continuation slides)`);
console.log(`Bytes: ${combined.length}`);
