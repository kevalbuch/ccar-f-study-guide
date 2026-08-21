/* ==========================================================================
   meta.js — exam blueprint, scenarios, sources.
   Every figure in the site is authored as { vb, body, caption }; app.js wraps
   `body` in an <svg> that carries a uniquely-numbered arrowhead marker, so
   multiple diagrams on one page never collide on the same marker id.
   ========================================================================== */

window.CCA = {
  domains: [],   // pushed by d1.js … d5.js
  glossary: [],  // pushed by glossary.js

  /* fig({vb, body, caption}) -> <figure> HTML.
     Each call mints a fresh arrowhead marker id, so any number of diagrams can
     share a page without the browser resolving url(#ah) to the wrong marker.
     Author `body` with class="box|boxA|boxOk|boxBad|arrow|dashed|stroke" and
     marker-end="url(#ah)"; the palette classes live in styles.css. */
  _figN: 0,
  fig: function (f) {
    if (!f) return '';
    var id = 'ah' + (++this._figN);
    var body = f.body.replace(/url\(#ah\)/g, 'url(#' + id + ')');
    var label = (f.caption || 'Diagram').replace(/<[^>]*>/g, '').replace(/"/g, '&quot;');
    return '<figure class="figure"><div class="fig-box">' +
      '<svg viewBox="' + f.vb + '" role="img" aria-label="' + label + '">' +
      '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" ' +
      'markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path class="arrowhead" d="M0,0 L10,5 L0,10 z"/></marker></defs>' +
      body + '</svg></div>' +
      (f.caption ? '<figcaption>' + f.caption + '</figcaption>' : '') +
      '</figure>';
  },

  meta: {
    code: 'CCAR-F',
    name: 'Claude Certified Architect – Foundations',
    guideVersion: 'Version 1.0',
    guideEffective: 'July 2026',
    verifiedOn: '2026-08-20',
    items: 60,
    minutes: 120,
    scenariosShown: 4,
    scenariosPool: 6,
    passScaled: 720,
    scaleMin: 100,
    scaleMax: 1000,
    fee: '$125 USD',
    validity: '12 months',
    delivery: 'Proctored — online proctored or Pearson VUE test centre',
    itemFormat: 'Multiple-choice and multiple-response; each item states how many responses to select',
    // Raw-correct equivalent of the 720 cut score under this site's linear
    // approximation. Stated openly on the exam page — the real exam uses a
    // standard-setting study we cannot reproduce.
    approxRawToPass: 42
  },

  scenarios: [
    {
      n: 1,
      title: 'Customer Support Resolution Agent',
      domains: [1, 2, 5],
      body: `You are building a customer support resolution agent using the Claude Agent SDK. The agent
      handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to
      your backend systems through custom MCP tools (<code>get_customer</code>, <code>lookup_order</code>,
      <code>process_refund</code>, <code>escalate_to_human</code>). Your target is 80%+ first-contact
      resolution while knowing when to escalate.`,
      watchFor: [
        'Deterministic gating before money moves (identity verification, refund ceilings)',
        'Escalation calibration — policy gaps and explicit human requests, not sentiment',
        'Multi-concern decomposition with one shared identity lookup',
        'Trimming 40-field order payloads before they pile up in context'
      ]
    },
    {
      n: 2,
      title: 'Code Generation with Claude Code',
      domains: [3, 5],
      body: `You are using Claude Code to accelerate software development. Your team uses it for code
      generation, refactoring, debugging, and documentation. You need to integrate it into your development
      workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode
      vs direct execution.`,
      watchFor: [
        'Configuration hierarchy — which scope reaches teammates through version control',
        'Plan mode vs direct execution triggers',
        'Path-scoped rules vs directory-level CLAUDE.md',
        'Iterative refinement: concrete I/O examples over more prose'
      ]
    },
    {
      n: 3,
      title: 'Multi-Agent Research System',
      domains: [1, 2, 5],
      body: `You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent
      delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes
      findings, and one generates reports. The system researches topics and produces comprehensive, cited
      reports.`,
      watchFor: [
        'Hub-and-spoke: all traffic through the coordinator',
        'Coverage gaps trace back to coordinator decomposition, not subagent execution',
        'Structured claim-source mappings that survive synthesis',
        'Structured error context instead of "search unavailable"'
      ]
    },
    {
      n: 4,
      title: 'Developer Productivity with Claude',
      domains: [2, 3, 1],
      body: `You are building developer productivity tools using the Claude Agent SDK. The agent helps
      engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and
      automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates
      with MCP servers.`,
      watchFor: [
        'Built-in tool selection: Grep for content, Glob for paths, Edit for anchored change',
        'Incremental exploration over reading everything upfront',
        'Wrapper/re-export tracing when finding all callers',
        'Scratchpads and subagents to survive long exploration sessions'
      ]
    },
    {
      n: 5,
      title: 'Claude Code for Continuous Integration',
      domains: [3, 4],
      body: `You are integrating Claude Code into your CI/CD pipeline. The system runs automated code
      reviews, generates test cases, and provides feedback on pull requests. You need to design prompts
      that provide actionable feedback and minimize false positives.`,
      watchFor: [
        '<code>-p</code> for non-interactive runs; <code>--output-format json</code> + <code>--json-schema</code> for parseable findings',
        'Independent review instance beats self-review',
        'Multi-pass review for large PRs',
        'Explicit criteria — not "be conservative" — to cut false positives'
      ]
    },
    {
      n: 6,
      title: 'Structured Data Extraction',
      domains: [4, 5],
      body: `You are building a structured data extraction system using Claude. The system extracts
      information from unstructured documents, validates the output using JSON schemas, and maintains high
      accuracy. It must handle edge cases gracefully and integrate with downstream systems.`,
      watchFor: [
        'Nullable fields to stop fabrication; "other" + detail and "unclear" enums',
        'tool_use kills syntax errors, never semantic ones',
        'Retry-with-error-feedback, and knowing when retry cannot work',
        'Batch API latency tolerance and custom_id correlation'
      ]
    }
  ],

  /* Domain shells. d1.js … d5.js push their `units` array onto these. */
  domainMeta: [
    {
      n: 1, id: 'd1', slug: 'agentic-architecture',
      title: 'Agentic Architecture & Orchestration',
      weight: 27, items: 16, color: 'var(--d1)',
      blurb: `The heaviest domain on the exam. Agentic loops driven by <code>stop_reason</code>,
        coordinator–subagent orchestration, deterministic enforcement via hooks and prerequisite gates,
        task decomposition, and session resumption or forking.`
    },
    {
      n: 2, id: 'd2', slug: 'tool-design-mcp',
      title: 'Tool Design & MCP Integration',
      weight: 18, items: 11, color: 'var(--d2)',
      blurb: `Tool descriptions as the selection mechanism, structured MCP error responses, least-privilege
        tool distribution, <code>tool_choice</code>, MCP server scoping and resources, and picking the right
        built-in tool.`
    },
    {
      n: 3, id: 'd3', slug: 'claude-code',
      title: 'Claude Code Configuration & Workflows',
      weight: 20, items: 12, color: 'var(--d3)',
      blurb: `CLAUDE.md hierarchy and modular imports, commands and skills with frontmatter, path-scoped
        rules, plan mode vs direct execution, iterative refinement, and CI/CD integration.`
    },
    {
      n: 4, id: 'd4', slug: 'prompting-structured-output',
      title: 'Prompt Engineering & Structured Output',
      weight: 20, items: 12, color: 'var(--d4)',
      blurb: `Explicit criteria over vague hedges, few-shot examples aimed at ambiguity, <code>tool_use</code>
        with JSON schemas, validation and retry loops, batch processing strategy, and multi-pass review
        architectures.`
    },
    {
      n: 5, id: 'd5', slug: 'context-reliability',
      title: 'Context Management & Reliability',
      weight: 15, items: 9, color: 'var(--d5)',
      blurb: `Preserving transactional facts across long sessions, escalation and ambiguity resolution,
        error propagation between agents, large-codebase context strategy, human review and confidence
        calibration, and provenance in multi-source synthesis.`
    }
  ],

  sources: {
    primary: [
      {
        t: 'Claude Certified Architect – Foundations Exam Guide, Version 1.0 (effective July 2026)',
        u: 'https://everpath-course-content.s3-accelerate.amazonaws.com/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1783542750/Claude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf',
        note: `Anthropic's own exam guide, retrieved and read in full. Every domain name, weighting, task
          statement, scenario, exam-detail figure, in-scope list and out-of-scope list on this site comes
          from this document. Its Section 9 contains 12 official sample questions.`
      },
      {
        t: 'Claude Certified Architect – Foundations certification page, Anthropic Partner Academy',
        u: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification',
        note: `Confirms the $125 fee, the scope statement ("Claude Code, the Claude Agent SDK, the Claude
          API, and Model Context Protocol"), and that the exam guide PDF is the required pre-exam reading.`
      },
      {
        t: 'Claude Certification Program — Pearson VUE',
        u: 'https://www.pearsonvue.com/us/en/anthropic.html',
        note: `Confirms the official exam code <code>CCAR-F</code> and that the credential sits in a
          four-exam program (CCAO-F, CCAR-F, CCAR-P, CCDV-F). Registration and scheduling run through here.`
      }
    ],
    technical: [
      {
        t: 'Claude Agent SDK overview',
        u: 'https://code.claude.com/docs/en/agent-sdk/overview',
        note: `Used to verify the Agent SDK surface: built-in tools, hooks, subagents, MCP, permissions and
          sessions; and that the SDK ships for Python and TypeScript, with the CLI (<code>-p</code> plus
          <code>--output-format json</code>) as the path for other languages.`
      },
      {
        t: 'Claude Code hooks reference',
        u: 'https://code.claude.com/docs/en/hooks',
        note: `Used to verify hook event names and blocking semantics — notably that <b>PreToolUse</b> can
          deny a tool call (exit 2, or <code>permissionDecision: "deny"</code>) while <b>PostToolUse</b>
          runs after the tool has already executed and cannot block it.`
      },
      {
        t: 'Anthropic API reference — Messages, tool use and Message Batches',
        u: 'https://platform.claude.com/docs/en/api/messages',
        note: `Used to verify <code>stop_reason</code> values, the three <code>tool_choice</code> modes,
          strict tool schemas, and Message Batches behaviour — in particular that batch results return in
          arbitrary order and must be keyed by <code>custom_id</code>, never by position.`
      },
      {
        t: 'Model Context Protocol specification',
        u: 'https://modelcontextprotocol.io/',
        note: 'Reference for the tools-vs-resources distinction and the <code>isError</code> result flag.'
      }
    ]
  }
};
