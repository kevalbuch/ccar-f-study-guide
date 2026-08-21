# CCAR-F Study Guide

A self-contained study curriculum and exam simulator for Anthropic's **Claude Certified
Architect – Foundations** certification (exam code `CCAR-F`).

Open `index.html` in a browser. No build step, no server, no dependencies — it works from
`file://`, offline. Progress is stored in `localStorage`.

## What is in it

- **30 learning units**, one per official task statement (1.1 … 5.6). Each has a one-paragraph
  summary, a concept explanation with diagrams, a worked production example, a common-mistakes
  table, a note on how the topic is tested, and 5 practice questions.
- **150 practice questions**, every one with a rationale for the correct answer *and* an
  explanation for each distractor. Includes all **12 official sample questions** published in
  Section 9 of the exam guide, badged as such.
- **Full mock exam** — 60 items drawn to the official domain weighting (16/11/12/12/9), a
  120-minute timer, question palette with flagging, scaled scoring against the 720 cut, and a
  per-domain breakdown with item-by-item review.
- **Review sets** — `#/drill/wrong` collects every question you have answered incorrectly and
  `#/drill/unseen` everything you have not attempted. Questions render ten at a time with a live
  correct/wrong/remaining tally.
- **Readiness dashboard** on the overview: per-domain progress weighted exactly as the exam
  weights its domains (coverage 40%, demonstrated accuracy 60%, accuracy discounted below eight
  attempts), plus a single "do this next" recommendation.
- **Command palette** (`⌘K` / `Ctrl-K`, or `/`) searching all 30 units, 150 questions and 134
  glossary terms, with typed result badges and keyboard navigation.
- **Per-domain drills**, a **134-term glossary** with a letter index and deep links, and a
  **flashcard** mode with term→definition and definition→term directions.
- **Answer-pattern cheatsheet** for last-minute revision.
- **Sources page** recording exactly what the site was built from.
- **Print styles**: a unit prints as a clean revision sheet with the site chrome stripped.

## Keyboard

| Where | Keys |
|---|---|
| Anywhere | `⌘K` / `Ctrl-K` or `/` open search · `Esc` closes search or the mobile nav |
| Mock exam | `←` `→` move · `1`–`9` select an option · `F` flag for review |
| Flashcards | `Space` flip · `←` `→` move · `K` mark known · `R` reverse the direction |
| Unit page | `J` next unit · `K` previous unit · `M` mark complete |

An attempt at the mock exam is written to `localStorage` as you answer, and the deadline is
stored as an absolute time — so a refresh, a crash or a closed tab does not lose it, and the
clock keeps honest time. Navigating away mid-attempt asks first; the exam page then offers to
resume or discard.

## Provenance

The blueprint is **not inferred**. Domain names, weightings, all 30 task statements, the six
scenarios, the scoring model and the in/out-of-scope lists are taken from Anthropic's own
*Claude Certified Architect – Foundations Exam Guide*, Version 1.0 (effective July 2026),
archived in `build/` as both PDF and extracted text.

Verified 20 August 2026 against:

| Source | Used for |
|---|---|
| Official exam guide PDF (archived in `build/`) | Blueprint, scenarios, scoring, scope, 12 sample questions |
| Anthropic Partner Academy certification page | Fee, scope statement |
| Pearson VUE Anthropic page | Exam code `CCAR-F`, program structure |
| `code.claude.com/docs/en/agent-sdk/overview` | Agent SDK surface |
| `code.claude.com/docs/en/hooks` | Hook names; PreToolUse blocks, PostToolUse does not |
| `platform.claude.com/docs/en/api/messages` | `stop_reason` values, `tool_choice` modes, batch behaviour |
| `modelcontextprotocol.io` | MCP tools vs resources, `isError` |

Everything the site adds beyond the guide is labelled as such in-page — most importantly the
mock exam's raw-to-scaled conversion, which is a stated linear approximation
(`scaled = 100 + raw/60 × 900`, putting the 720 cut at 42/60). Anthropic's real conversion
comes from a standard-setting study and is not public.

Unofficial and independent. Not affiliated with or endorsed by Anthropic. No confidential exam
content is reproduced.

## Layout

```
index.html            shell, nav, script tags
assets/styles.css     design system; dark-first, [data-theme="light"] overrides
assets/app.js         hash router, lesson renderer, quiz engine, exam engine
assets/motion.js      optional motion layer (degrades cleanly if the GSAP CDN is unreachable;
                      counters land on their true value even if rAF is starved)
content/meta.js       blueprint, scenarios, sources, the CCA.fig() diagram helper
content/d1..d5.js     one file per domain: units, examples, mistakes, questions
content/glossary.js   glossary / flashcard bank
build/validate.js     content integrity checks
build/official-*      archived source of truth
```

### Adding or editing content

Units and questions are plain data. A question is:

```js
{
  id: 'q1.1.1',            // unique across the whole bank
  scn: 1,                  // optional scenario number (1–6)
  official: true,          // optional — badges it as a published sample
  stem: '<p>…</p>',
  opts: ['…', '…', '…', '…'],
  ans: [0],                // indices; more than one makes it multiple-response
  why: 'why the key is right',
  wrong: ['', 'why B fails', 'why C fails', 'why D fails']  // parallel to opts
}
```

`wrong` must be the same length as `opts`, empty at the correct indices and non-empty at every
distractor. Do not write "Select N responses" into a stem — the renderer emits it from
`ans.length`.

Diagrams are authored as `fig({ vb, body, caption })`. Write SVG into `body` using the palette
classes (`box`, `boxA`, `boxOk`, `boxBad`, `arrow`, `dashed`) and `marker-end="url(#ah)"`; each
call mints a unique marker id so multiple diagrams can share a page.

### Verifying

```bash
node build/validate.js
```

Checks unit counts per domain against the blueprint, question counts, answer-key bounds,
`wrong`/`opts` alignment, duplicate ids, dangling cross-references, that the bank is large
enough to build a weighted 60-item exam, and that domain weights and item counts still sum
correctly.

## Before you sit the exam

Download the current exam guide from the Anthropic Partner Academy and compare its *Exam Details
at a Glance* table and blueprint against the site's **Exam blueprint** page. If Anthropic has
published a version later than 1.0 (July 2026), the official guide wins and this site needs
updating.
