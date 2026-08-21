/* glossary.js — cross-cutting term bank, also used as the flashcard deck.
   Each entry: t = term, d = definition (HTML allowed), ref = where it is taught. */
(function (CCA) {
  var G = function (t, d, ref) { CCA.glossary.push({ t: t, d: d, ref: ref }); };

  /* ---------------------------------------------------------- exam mechanics */
  G('CCAR-F',
    'The official exam code for Claude Certified Architect – Foundations. 60 items, 120 minutes, ' +
    'scaled 100–1000 with a cut score of 720, $125, valid 12 months, proctored via Pearson VUE.',
    'Exam blueprint');
  G('Criterion-referenced assessment',
    'Scoring against a fixed performance standard rather than against other candidates. You pass by ' +
    'demonstrating the blueprint\'s knowledge and skills, not by beating a percentage of peers.',
    'Exam blueprint');
  G('Standard-setting study',
    'The formal process in which trained subject-matter experts judge the performance expected of a ' +
    'minimally qualified candidate. It produced the 720 cut score, and it is why no third party can ' +
    'reproduce the real raw-to-scaled conversion.',
    'Exam blueprint');
  G('Task statement',
    'One of the 30 numbered objectives in the blueprint (1.1 … 5.6). Exam items are written directly ' +
    'against these, so the task statement list is the syllabus.',
    'Exam blueprint');
  G('Scenario (exam structure)',
    'A realistic production context that frames a cluster of questions. Four of six scenarios appear on ' +
    'any given form, selected at random — so all six must be prepared.',
    'The 6 scenarios');

  /* ------------------------------------------------------- D1: agentic loops */
  G('Agentic loop',
    'The control structure that makes a model an agent: send the conversation and tools, inspect ' +
    '<code>stop_reason</code>, execute any requested tools, append the results, and call again until the ' +
    'model ends its turn.',
    '1.1');
  G('stop_reason',
    'The response field that controls the agentic loop. <code>"tool_use"</code> means execute and ' +
    'iterate; <code>"end_turn"</code> means stop. It is the only reliable loop condition — never parse ' +
    'the assistant\'s prose.',
    '1.1');
  G('end_turn',
    'Ends the assistant\'s current <em>turn</em>, not the session. A follow-up user message is appended ' +
    'to the same history rather than starting a new session.',
    '1.1');
  G('max_tokens (as a stop reason)',
    'Output was truncated at the configured ceiling, mid-thought. Not a completion signal — request a ' +
    'continuation rather than treating partial output as an answer.',
    '1.1');
  G('Statelessness',
    'Each Messages API call is independent; the model retains no server-side memory. Everything it must ' +
    'reason about has to be in the request you send, which is why tool results must be appended to ' +
    'history.',
    '1.1');
  G('tool_result',
    'The content block that returns a tool\'s output to the model, tied to the originating ' +
    '<code>tool_use</code> id. All results from one assistant turn belong in a single user message.',
    '1.1');
  G('Parallel tool use',
    'One assistant response may contain several <code>tool_use</code> blocks. Execute them concurrently ' +
    'and return every result in one user message — splitting them trains the model to stop emitting ' +
    'parallel calls.',
    '1.1');
  G('Model-driven decision-making',
    'Letting the model reason about which tool to call next from current context, as opposed to a ' +
    'pre-configured decision tree or fixed tool sequence written in your code.',
    '1.1');

  /* ------------------------------------------------ D1: multi-agent patterns */
  G('Coordinator',
    'The agent that decomposes a task, delegates to subagents, aggregates their results and judges ' +
    'whether coverage is sufficient. The only node with a view of the whole task.',
    '1.2');
  G('Hub-and-spoke architecture',
    'All inter-subagent communication routes through the coordinator. Preserves observability, consistent ' +
    'error handling and controlled information flow — all three of which a mesh destroys.',
    '1.2');
  G('Task decomposition',
    'Splitting a request into subtasks for delegation. Coverage gaps in a multi-agent output almost ' +
    'always trace back to decomposition rather than to subagent execution.',
    '1.2');
  G('Iterative refinement loop (coordinator)',
    'The coordinator evaluates synthesis output for gaps, re-delegates <em>targeted</em> queries to fill ' +
    'them, and re-invokes synthesis until coverage is sufficient.',
    '1.2');
  G('Scope partitioning',
    'Assigning each subagent a distinct subtopic, source type or time window so parallel agents do not ' +
    'return the same results at N times the cost.',
    '1.2');
  G('Task tool',
    'The mechanism for spawning a subagent. <code>"Task"</code> must appear in the coordinator\'s ' +
    '<code>allowedTools</code> or it cannot delegate at all — it will silently attempt everything itself.',
    '1.3');
  G('allowedTools',
    'The per-agent list of permitted tools. Governs both delegation capability (via <code>"Task"</code>) ' +
    'and least-privilege tool scoping.',
    '1.3');
  G('AgentDefinition',
    'The configuration object for an agent: description, system prompt and tool restrictions. Each ' +
    'subagent type has its own.',
    '1.3');
  G('Context isolation (subagents)',
    'Subagents begin with a fresh context and inherit nothing. Every finding they need must be included ' +
    'explicitly in their prompt — a prompt referring to "the findings" gives them nothing.',
    '1.3');
  G('Parallel subagent spawning',
    'Emitting multiple <code>Task</code> calls in a <em>single</em> coordinator response so the runtime ' +
    'runs them concurrently. One call per turn serialises independent work.',
    '1.3');

  /* -------------------------------------------------------- D1: enforcement */
  G('Probabilistic enforcement',
    'Steering behaviour via prompts, instructions or examples. Reliable most of the time and never all of ' +
    'the time — appropriate for preferences, not for guarantees.',
    '1.4');
  G('Deterministic enforcement',
    'Code outside the model that allows or blocks an action, so compliance does not depend on the ' +
    'model\'s choices. Required when the stem says guaranteed, must never, compliance, financial or ' +
    'irreversible.',
    '1.4');
  G('Prerequisite gate',
    'Orchestration-layer code that blocks a tool call until a precondition is met — for example refusing ' +
    '<code>process_refund</code> until <code>get_customer</code> has returned a verified customer id.',
    '1.4');
  G('Multi-concern decomposition',
    'Splitting a message containing several distinct concerns into separate items, investigating them in ' +
    'parallel using <em>shared</em> context (one identity verification), then replying once covering all ' +
    'of them.',
    '1.4');
  G('Structured handoff summary',
    'What you compile when escalating: customer id, root cause, amount, why you escalated, a recommended ' +
    'action, and anything already promised to the customer — because the receiving human cannot see the ' +
    'transcript.',
    '1.4');
  G('PreToolUse hook',
    'Fires before a tool executes and <b>can deny it</b> (exit code 2, or ' +
    '<code>permissionDecision: "deny"</code>). The mechanism for guaranteed business rules such as a ' +
    'refund ceiling.',
    '1.5');
  G('PostToolUse hook',
    'Fires after a tool has executed. Cannot block, but can transform the result before the model sees ' +
    'it — the right place to normalise heterogeneous formats and trim verbose payloads.',
    '1.5');
  G('Format normalisation (hooks)',
    'Converting Unix timestamps, ISO 8601 strings and numeric status codes from different MCP servers ' +
    'into one vocabulary in a PostToolUse hook, rather than asking the model to do the conversion each ' +
    'turn.',
    '1.5');

  /* ------------------------------------------- D1: decomposition & sessions */
  G('Prompt chaining',
    'A fixed sequence of focused passes, each feeding the next. Suits predictable multi-aspect work such ' +
    'as reviewing each file and then checking cross-file consistency.',
    '1.6');
  G('Dynamic decomposition',
    'Generating subtasks from what each step discovers. Suits open-ended investigation — "add ' +
    'comprehensive tests to a legacy codebase" — where the plan depends on findings.',
    '1.6');
  G('Attention dilution',
    'Spreading a single pass across many items produces uneven depth, missed defects and contradictory ' +
    'verdicts. Not a capacity problem: the content already fits, so a bigger window does not fix it.',
    '1.6');
  G('--resume',
    'Continues a specific named prior conversation. Correct when the prior context — including its tool ' +
    'results — is still valid.',
    '1.7');
  G('fork_session',
    'Creates independent branches from a shared baseline, so divergent approaches can be compared from an ' +
    'identical starting point without either contaminating the other.',
    '1.7');
  G('Stale context',
    'Prior tool results that no longer describe reality because files changed. Resuming is then worse ' +
    'than starting fresh with an injected summary of conclusions, because the agent cannot tell its ' +
    'history is obsolete.',
    '1.7');

  /* ------------------------------------------------------------ D2: tools */
  G('Tool description',
    'The primary mechanism a model uses to select tools. A good one carries purpose, input format, what ' +
    'it returns, when to use it, when <em>not</em> to use it versus similar tools, and edge cases.',
    '2.1');
  G('Tool boundary ("do not use when")',
    'The clause that names the alternative tool for cases this one does not cover. The highest-value line ' +
    'in a description and the one most often omitted.',
    '2.1');
  G('Tool splitting',
    'Breaking an over-general tool into purpose-specific tools with defined contracts — ' +
    '<code>analyze_document</code> into <code>extract_data_points</code>, <code>summarize_content</code> ' +
    'and <code>verify_claim_against_source</code>. Use when one tool is doing several jobs; no ' +
    'description can bound that.',
    '2.1');
  G('System prompt keyword sensitivity',
    'A standing instruction such as "always consult the internal documentation" can override well-written ' +
    'tool descriptions. Audit the system prompt for accidental keyword pulls before rewriting tools.',
    '2.1');
  G('isError',
    'The MCP flag indicating a tool failure. Must be <code>false</code> for a query that ran correctly ' +
    'and matched nothing — an empty result is a successful answer, not a failure.',
    '2.2');
  G('errorCategory',
    'Structured metadata classifying a failure as transient, validation, business or permission. It is ' +
    'what lets the agent pick between retry, correct-the-input, explain-and-escalate, and escalate.',
    '2.2');
  G('Transient error',
    'Timeout, 503, connection reset, rate limit. Retryable — and best retried inside the tool, which ' +
    'knows the category definitively.',
    '2.2');
  G('Validation error',
    'Malformed or invalid input. Not retryable as-is: the input must be corrected first, so retrying the ' +
    'identical call is guaranteed to fail again.',
    '2.2');
  G('Business error',
    'A policy violation or threshold breach, such as a refund above the autonomous limit. Not retryable ' +
    'and not a malfunction — explain it to the customer and escalate. Never split the request to evade ' +
    'the control.',
    '2.2');
  G('Permission error',
    'Access denied or insufficient scope. Not retryable — escalate, because the agent cannot grant itself ' +
    'authority.',
    '2.2');
  G('customerMessage',
    'A customer-appropriate explanation returned alongside a business error, so the agent can relay it ' +
    'rather than paraphrasing an internal error string.',
    '2.2');
  G('Local recovery then propagate',
    'Bounded retries (one or two) inside the subagent or tool for transient failures; anything unresolved ' +
    'propagates upward with what was attempted and any partial results. Unbounded retries at the lowest ' +
    'level are an anti-pattern.',
    '2.2 · 5.3');
  G('Tool overload',
    'Selection reliability degrades as the tool count grows — 18 tools instead of 4–5 measurably worsens ' +
    'choice by increasing decision complexity.',
    '2.3');
  G('Cross-specialisation misuse',
    'An agent using tools outside its role, such as a synthesis agent running its own web searches. The ' +
    'fix is to remove the capability, not to request restraint.',
    '2.3');
  G('Scoped cross-role tool',
    'A narrow tool granted to an agent outside its core role to serve a genuine high-frequency need — a ' +
    '<code>verify_fact</code> tool for the synthesis agent — while complex cases still route through the ' +
    'coordinator.',
    '2.3');
  G('Constrained tool replacement',
    'Replacing a general-purpose tool with a restricted alternative so misuse becomes architecturally ' +
    'impossible: <code>fetch_url</code> → <code>load_document</code>, which validates document URLs.',
    '2.3');
  G('tool_choice',
    'Controls whether and which tool is called. <code>"auto"</code> permits a text response; ' +
    '<code>"any"</code> requires some tool call; <code>{"type":"tool","name":"…"}</code> forces one ' +
    'specific tool. It constrains the current request only, so it cannot express a sequence.',
    '2.3 · 4.3');

  /* --------------------------------------------------------------- D2: MCP */
  G('Model Context Protocol (MCP)',
    'The protocol through which agents reach external tools and data. On this exam you configure and ' +
    'design MCP interfaces; deploying or hosting MCP servers is explicitly out of scope.',
    '2.4');
  G('MCP tool',
    'A function the agent <em>calls</em> to take an action or fetch something specific — ' +
    '<code>create_issue</code>, <code>process_refund</code>.',
    '2.4');
  G('MCP resource',
    'Readable content the agent <em>consults</em> for context without taking an action — an issue ' +
    'catalogue, a database schema, a documentation hierarchy. Exists to remove exploratory tool calls by ' +
    'supplying the map upfront.',
    '2.4');
  G('.mcp.json',
    'Project-scoped MCP server configuration, committed to version control so the whole team gets it. ' +
    'Credentials go in as <code>${ENV_VAR}</code> expansions, never as literals.',
    '2.4');
  G('~/.claude.json',
    'User-scoped MCP server configuration, for personal or experimental servers. Not shared, and active ' +
    'simultaneously with project-scoped servers.',
    '2.4');
  G('Environment variable expansion',
    'Writing <code>${GITHUB_TOKEN}</code> in a committed config so each developer supplies their own ' +
    'credential from their environment. Beats a committed placeholder, which leaves every clone ' +
    'permanently modified and invites an accidental token commit.',
    '2.4');
  G('Grep',
    'Built-in tool that searches file <em>contents</em> for a pattern. Use it to find callers of a ' +
    'function, locate an error message, or find imports.',
    '2.5');
  G('Glob',
    'Built-in tool that matches file <em>paths</em> by pattern, such as <code>**/*.test.tsx</code>. Use ' +
    'it to find files by name or extension.',
    '2.5');
  G('Edit',
    'Built-in tool making a targeted change located by unique anchor text. Preferred over Read + Write ' +
    'for modifying existing files. <b>Fails</b> when the anchor is not unique rather than picking the ' +
    'first match.',
    '2.5');
  G('Read + Write fallback',
    'The remedy when an Edit anchor cannot be made unique or the change is genuinely file-wide: load the ' +
    'whole file, transform it, write it back.',
    '2.5');
  G('Incremental exploration',
    'Grep for entry points, then Read to follow imports and trace flows — spending context only on the ' +
    'relevant path instead of reading everything upfront.',
    '2.5');
  G('Wrapper tracing',
    'Finding indirect callers by first identifying all exported names and re-exports, then searching for ' +
    'each name. Stopping at direct callers systematically under-reports usage.',
    '2.5');

  /* --------------------------------------------------------- D3: Claude Code */
  G('CLAUDE.md hierarchy',
    'Three levels: user (<code>~/.claude/CLAUDE.md</code>, never shared), project ' +
    '(<code>.claude/CLAUDE.md</code> or root, committed and shared), and directory (a CLAUDE.md bound to ' +
    'that subtree).',
    '3.1');
  G('@import',
    'References an external file from inside CLAUDE.md to keep it modular. No space after the ' +
    '<code>@</code>; relative paths resolve against the importing file; maximum nesting depth is 5.',
    '3.1');
  G('/memory',
    'The configuration diagnostic: shows which CLAUDE.md files are actually loaded in the current ' +
    'session. The command to run when teammates report inconsistent behaviour — not <code>/compact</code>.',
    '3.1');
  G('/compact',
    'Compresses the current conversation to reclaim context. Legitimate during extended exploration; ' +
    'indiscriminate about what it drops, and no help when context is <em>stale</em> rather than large.',
    '3.1 · 5.4');
  G('.claude/rules/',
    'Directory of topic-specific rule files, each able to carry YAML frontmatter that path-scopes it. The ' +
    'answer to a monolithic CLAUDE.md.',
    '3.1 · 3.3');
  G('.claude/commands/',
    'Project-scoped slash commands, shared via version control so every developer has them on clone. The ' +
    'user-scoped equivalent is <code>~/.claude/commands/</code>.',
    '3.2');
  G('SKILL.md',
    'The definition file for a skill in <code>.claude/skills/</code>. Supports frontmatter: ' +
    '<code>context: fork</code>, <code>allowed-tools</code> and <code>argument-hint</code>.',
    '3.2');
  G('context: fork',
    'Skill frontmatter that runs the skill in an isolated subagent context, so verbose output stays out ' +
    'of the main conversation and only the summary returns.',
    '3.2');
  G('allowed-tools (skill frontmatter)',
    'Restricts a skill\'s tool access during execution — for example limiting a boilerplate generator to ' +
    'file writes so it cannot run destructive shell commands.',
    '3.2');
  G('argument-hint',
    'Skill frontmatter that prompts the developer for a required parameter when the skill is invoked ' +
    'bare, instead of proceeding on a guess.',
    '3.2');
  G('Path-scoped rule',
    'A <code>.claude/rules/</code> file whose YAML <code>paths</code> globs load it only when matching ' +
    'files are edited. The only mechanism that reaches files scattered across many directories, such as ' +
    'tests beside their components.',
    '3.3');
  G('Plan mode',
    'Explores the codebase and designs an approach before making changes. For large-scale change, ' +
    'multiple valid approaches, architectural decisions and multi-file modification — a 45+ file ' +
    'migration, a monolith split.',
    '3.4');
  G('Direct execution',
    'Making the change without a planning phase. Correct for well-scoped, well-understood work: a ' +
    'single-file fix with a clear stack trace, adding one validation conditional.',
    '3.4');
  G('Explore subagent',
    'Isolates a verbose discovery phase and returns a summary, so multi-phase work does not exhaust its ' +
    'context window before implementation begins.',
    '3.4');
  G('Interview pattern',
    'Having Claude ask <em>you</em> questions before implementing, to surface considerations you had not ' +
    'anticipated. Explores <b>requirements</b>, where plan mode explores the <b>codebase</b>.',
    '3.5');
  G('Test-driven iteration',
    'Write the test suite first — behaviour, edge cases, performance — then iterate by sharing actual ' +
    'failures. Concrete and machine-verifiable where prose feedback is interpreted inconsistently, and ' +
    'the passing tests stop earlier fixes regressing.',
    '3.5');
  G('Concrete I/O examples',
    '2–3 input/output pairs that demonstrate a transformation. More effective than rewriting a prose ' +
    'description that is being interpreted inconsistently.',
    '3.5');
  G('Sequential vs batched fixes',
    'Issues that <em>interact</em> go in one detailed message, because fixing one alone produces the ' +
    'wrong fix for the others. Independent issues are fixed sequentially, one per turn.',
    '3.5');
  G('-p / --print',
    'Runs Claude Code non-interactively: process the prompt, write to stdout, exit. Without it a CI job ' +
    'hangs waiting for input. Each invocation gets a fresh, isolated context.',
    '3.6');
  G('--output-format json',
    'Emits machine-parseable JSON instead of prose markdown, so a pipeline can parse findings and post ' +
    'them as inline PR comments.',
    '3.6');
  G('--json-schema',
    'Constrains CI output to a schema you define, guaranteeing every finding carries the fields your ' +
    'posting script expects.',
    '3.6');
  G('Re-review context injection',
    'Passing prior review findings into a re-run and instructing the model to report only new or ' +
    'still-unaddressed issues. Without it, each fresh <code>-p</code> invocation re-posts the same ' +
    'comments after every commit.',
    '3.6');

  /* -------------------------------------------------- D4: prompting & output */
  G('Explicit criteria',
    'Stating the test the model should apply, plus what to exclude — "flag a comment only when its ' +
    'claimed behaviour contradicts the code" — rather than a vague standard.',
    '4.1');
  G('Hedging instruction',
    '"Be conservative", "only report high-confidence findings". Carries no information about where the ' +
    'boundary lies, so the model reports fewer findings of every kind: volume falls, precision barely ' +
    'moves, real defects are lost.',
    '4.1');
  G('Trust spillover',
    'A high false positive rate in one review category erodes confidence in the accurate categories too. ' +
    'The remedy is to disable the noisy category while its prompt is fixed.',
    '4.1');
  G('Few-shot examples',
    '2–4 targeted examples aimed at <em>ambiguous</em> cases, each showing the reasoning for why one ' +
    'action beat a plausible alternative. Large sets of typical cases teach what the model already knows ' +
    'and encourage pattern matching.',
    '4.2');
  G('Matched-pair example',
    'Two near-identical cases with opposite verdicts plus a stated discriminator, used to teach the one ' +
    'feature that separates an acceptable pattern from a genuine defect.',
    '4.2');
  G('tool_use (structured output)',
    'Having the model populate a declared JSON schema instead of generating JSON text. Eliminates syntax ' +
    'errors, markdown fences and preamble — and eliminates nothing semantic.',
    '4.3');
  G('Semantic error',
    'Output that is schema-valid and wrong: line items that do not sum to the total, the vendor name in ' +
    'the customer field, a fabricated value for an absent field. Requires application-level validation.',
    '4.3 · 4.4');
  G('Nullable field',
    'The anti-fabrication mechanism. A required field the document does not contain forces the model to ' +
    'invent a value; making absence representable removes the pressure.',
    '4.3');
  G('"other" + detail',
    'An enum escape value for a type the document states clearly but your enum lacks, paired with a ' +
    'nullable detail string. Recurring detail values are a signal to extend the enum.',
    '4.3');
  G('"unclear" enum value',
    'For a document that does not specify clearly enough to choose. Distinct from <code>"other"</code>: ' +
    'this is a document-quality signal and routes to human review.',
    '4.3');
  G('Empty array vs null',
    'For list fields, <code>[]</code> means the document states there were none; <code>null</code> means ' +
    'it does not address the topic. Two different facts, and downstream analysis needs to tell them apart.',
    '4.3');
  G('Normalisation rules',
    'Prompt-level instructions constraining value <em>form</em>, which a schema cannot: dates as ISO 8601 ' +
    'with relative expressions resolved, currency as amount plus code, percentages as decimals.',
    '4.3');
  G('Retry with error feedback',
    'Re-requesting an extraction with the original document, the failed output, and the specific ' +
    'validation error. Must state which field is authoritative, or the model will "fix" the correct one.',
    '4.4');
  G('Limits of retry',
    'Retries correct format and structural errors. They cannot supply information absent from the source ' +
    '— two failures on the same field with specific feedback means route to human review, not another ' +
    'attempt.',
    '4.4');
  G('Dual extraction',
    'Extracting the stated value and an independently calculated one, with a ' +
    '<code>conflict_detected</code> flag. Distinguishes an extraction error from a source document that ' +
    'is internally inconsistent.',
    '4.4');
  G('detected_pattern',
    'A field recording which code construct triggered a review finding, so dismissals can be aggregated ' +
    'by pattern and the specific misfiring category identified and fixed.',
    '4.4');
  G('Pydantic',
    'Python validation library. Validates structure, supports custom validators for semantic rules, and ' +
    'can generate the JSON Schema passed to <code>tool_use</code> — one definition as the single source ' +
    'of truth.',
    '4.4');
  G('Message Batches API',
    '50% cost saving, processing window up to 24 hours, <b>no latency SLA</b>, and no multi-turn tool ' +
    'calling. For latency-tolerant work only.',
    '4.5');
  G('custom_id',
    'The identifier attached to each batch request and returned on its result. Batch results arrive in ' +
    'arbitrary order, so results must be keyed by <code>custom_id</code> and never by position.',
    '4.5');
  G('Batch SLA arithmetic',
    'Submission window = SLA − worst-case processing window. A 30-hour SLA against 24 hours leaves 6 ' +
    'hours, so submit every 4 hours to retain margin for one resubmission.',
    '4.5');
  G('Sample-before-batching',
    'Validating a prompt on 5–10 documents before committing 100+. A systematic flaw found after a large ' +
    'batch means resubmitting all of it, which erases the 50% saving.',
    '4.5');
  G('Self-review limitation',
    'A session that generated code retains the reasoning that justified it and is unlikely to question ' +
    'it. An independent instance with no generation context catches more — in CI, a separate ' +
    '<code>-p</code> invocation.',
    '4.6');
  G('Multi-pass review',
    'Per-file passes for local defects, using an identical prompt each time, plus a separate cross-file ' +
    'integration pass. Fixes both uneven depth and contradictory verdicts.',
    '4.6 · 1.6');

  /* ---------------------------------------------- D5: context & reliability */
  G('Case facts block',
    'Transactional facts — amounts, percentages, dates, order ids, and commitments the agent has made — ' +
    'held verbatim in every prompt, <em>outside</em> the summarised history, so summarisation cannot ' +
    'destroy them.',
    '5.1');
  G('Progressive summarisation risk',
    'Summaries discard exactly what matters: numerical values, percentages, dates and customer-stated ' +
    'expectations. "Discussed compensation options" is accurate and useless.',
    '5.1');
  G('Lost in the middle',
    'Models process the beginning and end of a long input reliably and may omit findings from the middle. ' +
    'Mitigate by leading with a key-findings summary and using explicit section headers — not by ' +
    'randomising order or summarising to fit.',
    '5.1');
  G('Tool output trimming',
    'Reducing a verbose payload to the relevant fields before it enters the conversation, in a PostToolUse ' +
    'hook. Instructing the model to ignore fields does not help — the tokens are already spent.',
    '5.1 · 1.5');
  G('Escalation triggers',
    'Three legitimate ones: an explicit request for a human, a policy gap or ambiguity, and inability to ' +
    'make meaningful progress. Complexity alone is not one.',
    '5.2');
  G('Sentiment as an escalation trigger',
    'An anti-pattern. Sentiment does not correlate with case complexity: a frustrated customer with a ' +
    'simple delay does not need a human, and a calm one with a policy gap does.',
    '5.2');
  G('Acknowledge then resolve',
    'For a frustrated customer whose issue is within the agent\'s capability: acknowledge the emotion, ' +
    'offer concrete resolution, and escalate only if they reiterate the preference for a human.',
    '5.2');
  G('Multiple-match handling',
    'When a lookup returns several candidate customers, ask for an additional identifier. Heuristic ' +
    'selection ("most recent", "most orders") causes wrong-customer errors.',
    '5.2');
  G('Structured error context',
    'What a failing subagent propagates: failure type, what was attempted, partial results, and possible ' +
    'alternatives. Each element supports a specific coordinator recovery decision.',
    '5.3');
  G('Silent error suppression',
    'Returning empty results marked successful. The most dangerous failure handling available — it ' +
    'converts a recoverable failure into undetectably incomplete output.',
    '5.3');
  G('Coverage annotation',
    'Marking sections of a synthesis output as partial, with the reason, so a thin section is not read as ' +
    'a complete one. Graceful degradation made visible at the point of use.',
    '5.3');
  G('Context degradation',
    'The failure mode of long sessions: inconsistent answers, re-reading files, contradicting earlier ' +
    'decisions, and — the clearest tell — describing "typical patterns" instead of the specific classes ' +
    'discovered earlier.',
    '5.4');
  G('Scratchpad file',
    'A file the agent writes key findings to as it explores, referenced for later questions. Findings ' +
    'then survive compaction, a crash and a new session.',
    '5.4');
  G('Phase summary injection',
    'Summarising one exploration phase\'s conclusions and injecting them as the next phase\'s initial ' +
    'context, so later phases never carry earlier phases\' raw output.',
    '5.4');
  G('State manifest',
    'A file recording each agent\'s completion status, loaded by the coordinator on resume so a crashed ' +
    'run restarts only what is unfinished and injects completed findings rather than re-deriving them.',
    '5.4');
  G('Aggregate accuracy masking',
    '97% overall can conceal 99% on the dominant document type and 44% on a small recent one. Analyse by ' +
    'document type <em>and</em> by field before reducing human review.',
    '5.5');
  G('Confidence calibration',
    'Measuring observed accuracy per confidence bucket against a labelled validation set, so a threshold ' +
    'reflects real error rates. Uncalibrated, 0.9 has no known relationship to 90% accuracy.',
    '5.5');
  G('Stratified random sampling',
    'Sampling with proportional representation of each document type, over-weighting newly introduced ' +
    'types. Simple random sampling under-draws rare and new segments, so regressions there go undetected.',
    '5.5');
  G('Claim-source mapping',
    'A structured record binding one claim to its source name, URL, verbatim excerpt, publication date ' +
    'and methodology. What must be preserved through every compressing step for citations to survive.',
    '5.6');
  G('Attribution loss',
    'Citations die at summarisation steps, when findings are compressed into prose. It cannot be repaired ' +
    'downstream — the mapping no longer exists anywhere — so the fix must be applied upstream.',
    '5.6');
  G('Conflict annotation',
    'Presenting both conflicting values with full attribution and methodological context, explicitly ' +
    'marked as conflicting. Never average, never silently pick one, never halt mid-analysis to escalate.',
    '5.6');
  G('Temporal vs conflicting data',
    'Same period, different values → a conflict to annotate. Different periods, different values → a ' +
    'trend to present chronologically. Only distinguishable if publication and collection dates travel ' +
    'with each claim.',
    '5.6');
  G('Render by content type',
    'Financial and comparative data as tables, analysis as prose, technical findings as structured lists, ' +
    'time series chronologically. Uniform prose is where comparability and attribution disappear.',
    '5.6');
})(window.CCA);
