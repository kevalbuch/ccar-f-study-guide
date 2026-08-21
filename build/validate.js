/* Content validator. Run: node build/validate.js
   Loads the site's content files in a fake browser global and asserts the
   invariants the renderer and exam engine rely on. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { window: {}, console };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

for (const f of ['content/meta.js', 'content/d1.js', 'content/d2.js', 'content/d3.js',
                 'content/d4.js', 'content/d5.js', 'content/glossary.js']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { console.log(`· skipped (not yet written): ${f}`); continue; }
  vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox, { filename: f });
}

const CCA = sandbox.window.CCA;
const errors = [];
const warns = [];
const E = (m) => errors.push(m);
const W = (m) => warns.push(m);

/* ---------- structure ---------- */
const expected = { 1: 7, 2: 5, 3: 6, 4: 6, 5: 6 };
const expectedItems = { 1: 16, 2: 11, 3: 12, 4: 12, 5: 9 };
let totalUnits = 0, totalQ = 0;
const seenQids = new Set();
const seenUnitIds = new Set();
const perDomainQ = {};

for (const dm of CCA.domainMeta) {
  const d = CCA.domains.find((x) => x.n === dm.n);
  if (!d) { W(`D${dm.n} has no content file yet`); continue; }
  const units = d.units || [];
  if (units.length !== expected[dm.n]) {
    E(`D${dm.n}: expected ${expected[dm.n]} task statements, found ${units.length}`);
  }
  perDomainQ[dm.n] = 0;

  for (const u of units) {
    totalUnits++;
    if (seenUnitIds.has(u.id)) E(`duplicate unit id ${u.id}`);
    seenUnitIds.add(u.id);

    if (!u.id.startsWith(dm.n + '.')) E(`unit ${u.id} is filed under D${dm.n}`);
    for (const field of ['short', 'title', 'concept', 'example', 'tldr']) {
      if (!u[field] || !String(u[field]).trim()) E(`unit ${u.id}: missing ${field}`);
    }
    if (/\bTBD\b|\bTODO\b|\bFIXME\b|lorem ipsum|coming soon|\[placeholder\]/i.test(u.concept + u.example)) {
      E(`unit ${u.id}: contains a placeholder marker`);
    }
    if (!u.mistakes || u.mistakes.length < 3) {
      E(`unit ${u.id}: needs at least 3 common mistakes, has ${(u.mistakes || []).length}`);
    }
    (u.mistakes || []).forEach((m, i) => {
      if (!m.t || !m.d) E(`unit ${u.id}: mistake ${i} missing t/d`);
    });

    const qs = u.questions || [];
    if (qs.length < 3 || qs.length > 6) {
      E(`unit ${u.id}: expected 3–6 practice questions, found ${qs.length}`);
    }
    totalQ += qs.length;
    perDomainQ[dm.n] += qs.length;

    for (const q of qs) {
      const at = `${u.id} / ${q.id}`;
      if (!q.id) { E(`${u.id}: question with no id`); continue; }
      if (seenQids.has(q.id)) E(`duplicate question id ${q.id}`);
      seenQids.add(q.id);

      if (!q.stem || !q.stem.trim()) E(`${at}: empty stem`);
      if (!Array.isArray(q.opts) || q.opts.length < 3) E(`${at}: needs >=3 options`);
      if (q.opts.length > 8) E(`${at}: more options than letters A–H`);
      if (!Array.isArray(q.ans) || !q.ans.length) E(`${at}: no answer key`);

      for (const a of q.ans || []) {
        if (!Number.isInteger(a) || a < 0 || a >= q.opts.length) {
          E(`${at}: answer index ${a} out of range (0..${q.opts.length - 1})`);
        }
      }
      if (new Set(q.ans).size !== q.ans.length) E(`${at}: duplicate index in answer key`);
      if (q.ans.length >= q.opts.length) E(`${at}: every option marked correct`);

      if (!q.why || !q.why.trim()) E(`${at}: missing rationale for the correct answer`);

      // `wrong` is parallel to `opts`: '' for correct options, prose for distractors.
      if (!Array.isArray(q.wrong)) {
        E(`${at}: 'wrong' must be an array parallel to opts`);
      } else {
        if (q.wrong.length !== q.opts.length) {
          E(`${at}: 'wrong' has ${q.wrong.length} entries for ${q.opts.length} options`);
        }
        q.opts.forEach((_, i) => {
          const isAns = q.ans.includes(i);
          const text = (q.wrong[i] || '').trim();
          if (isAns && text) E(`${at}: option ${i} is correct but has distractor prose`);
          if (!isAns && !text) E(`${at}: distractor ${i} has no explanation`);
        });
      }

      // stems must not hand-roll the select-N line; the renderer emits it
      if (/select \d+ response/i.test(q.stem)) {
        E(`${at}: stem duplicates the "Select N responses" instruction`);
      }
      if (q.scn && !CCA.scenarios.some((s) => s.n === q.scn)) {
        E(`${at}: unknown scenario ${q.scn}`);
      }
    }
  }
}

/* ---------- exam feasibility ---------- */
for (const dm of CCA.domainMeta) {
  const have = perDomainQ[dm.n] || 0;
  if (have && have < expectedItems[dm.n]) {
    E(`D${dm.n}: exam needs ${expectedItems[dm.n]} items but the bank holds only ${have}`);
  }
}
const weightSum = CCA.domainMeta.reduce((a, d) => a + d.weight, 0);
if (weightSum !== 100) E(`domain weights sum to ${weightSum}, not 100`);
const itemSum = CCA.domainMeta.reduce((a, d) => a + d.items, 0);
if (itemSum !== CCA.meta.items) E(`per-domain items sum to ${itemSum}, not ${CCA.meta.items}`);

/* ---------- cross-references ---------- */
const allText = JSON.stringify(CCA.domains);
const refs = [...allText.matchAll(/#\/unit\/(\d+\.\d+)/g)].map((m) => m[1]);
for (const r of new Set(refs)) {
  if (!seenUnitIds.has(r)) E(`dangling cross-reference to unit ${r}`);
}
const domRefs = [...allText.matchAll(/#\/domain\/(\d+)/g)].map((m) => +m[1]);
for (const r of new Set(domRefs)) {
  if (!CCA.domainMeta.some((d) => d.n === r)) E(`dangling reference to domain ${r}`);
}

/* ---------- glossary ---------- */
const gl = CCA.glossary || [];
const glSeen = new Set();
for (const g of gl) {
  if (!g.t || !g.d) E(`glossary entry missing term or definition: ${JSON.stringify(g).slice(0, 60)}`);
  if (glSeen.has(g.t)) E(`duplicate glossary term "${g.t}"`);
  glSeen.add(g.t);
}
if (gl.length && gl.length < 60) W(`glossary has only ${gl.length} terms`);

/* ---------- unbalanced markup in authored HTML ---------- */
const tagCheck = (name, html, where) => {
  const open = (html.match(new RegExp(`<${name}[\\s>]`, 'g')) || []).length;
  const close = (html.match(new RegExp(`</${name}>`, 'g')) || []).length;
  if (open !== close) W(`${where}: <${name}> ${open} open vs ${close} close`);
};
for (const d of CCA.domains) {
  for (const u of d.units || []) {
    for (const [field, html] of [['concept', u.concept], ['example', u.example]]) {
      ['p', 'ul', 'ol', 'li', 'table', 'div', 'pre', 'code', 'text', 'h3', 'h4'].forEach((t) =>
        tagCheck(t, html || '', `${u.id}.${field}`));
    }
  }
}

/* ---------- report ---------- */
console.log('');
console.log(`units: ${totalUnits}/30   questions: ${totalQ}   glossary: ${gl.length}`);
console.log('per-domain questions:', JSON.stringify(perDomainQ));
const official = [...seenQids].length &&
  CCA.domains.flatMap((d) => (d.units || []).flatMap((u) => u.questions || []))
    .filter((q) => q.official).length;
console.log(`official sample questions included: ${official}/12`);
console.log('');

if (warns.length) {
  console.log(`${warns.length} warning(s):`);
  warns.forEach((w) => console.log('  ~ ' + w));
  console.log('');
}
if (errors.length) {
  console.log(`FAILED — ${errors.length} error(s):`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('All content checks passed.');
