/* Domain 5 — Context Management & Reliability (15%, ≈9 items) */
(function (CCA) {
  var fig = function (o) { return CCA.fig(o); };

  CCA.domains.push({
    n: 5,
    orient: '<div class="callout rule"><span class="co-t">Orientation</span>' +
      '<p>The smallest domain by weight, and the one whose ideas appear most often <em>inside</em> other ' +
      'domains\' questions. Everything here is about what survives: which facts survive a long ' +
      'conversation (5.1), which failures survive as usable information rather than silence (5.3), which ' +
      'findings survive a summarisation step with their sources attached (5.6). Plus the two ' +
      'judgment task statements the exam likes — when to escalate (5.2), and when a number about your own ' +
      'accuracy is trustworthy (5.5).</p>' +
      '<p>One recurring instinct to build: <b>when precision is being lost, ask where it is being lost, ' +
      'and stop losing it there</b> — rather than trying to recover it downstream.</p></div>',

    units: [

    /* ================================================================== 5.1 */
    {
      id: '5.1',
      short: 'Preserving facts in long conversations',
      title: 'Manage conversation context to preserve critical information across long interactions',
      scn: [1, 3],
      tldr: 'Three distinct problems, three distinct fixes. <b>Progressive summarisation destroys exact ' +
        'values</b> — so extract amounts, dates, IDs and customer-stated expectations into a persistent ' +
        '"case facts" block held <em>outside</em> the summarised history. <b>Verbose tool results consume ' +
        'context out of proportion to their relevance</b> — so trim them to the fields that matter before ' +
        'they accumulate. And models process the <b>beginning and end</b> of a long input reliably while ' +
        'missing the middle — so put key findings first and use explicit section headers.',

      concept:
      '<h3>Why summarisation loses precisely the wrong things</h3>' +
      '<p>Summarisation compresses by discarding detail, and it has no way of knowing that "a 15% goodwill ' +
      'discount, agreed at 14:20, on order 4471" is load-bearing while three turns of pleasantries are ' +
      'not. So it produces "the agent offered the customer a discount" — fluent, faithful in outline, and ' +
      'useless. The customer says "you said 15%" and the agent no longer knows whether that is true.</p>' +
      '<p>The guide lists exactly what gets destroyed: <b>numerical values, percentages, dates, and ' +
      'customer-stated expectations</b>. Notice that last one — a commitment the agent itself made is a ' +
      'fact about the conversation, and it is the one whose loss is most visible to the customer.</p>' +

      '<h3>The case-facts block</h3>' +
      '<p>The fix is structural: pull transactional facts out of the conversation into a compact block that ' +
      'is <b>included in every prompt verbatim, outside the summarised history</b>. Summarisation then ' +
      'operates only on the discursive part, where compression is harmless.</p>' +

      fig({
        vb: '0 0 700 260',
        caption: 'Facts live outside the compressible region. Summarise the discussion; never summarise ' +
          'the numbers.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Summarising everything</text>' +
          '<rect x="24" y="28" width="300" height="40" rx="6" class="box"/>' +
          '<text x="174" y="53" text-anchor="middle" font-size="10">turns 1–40, including "15% on order 4471"</text>' +
          '<path class="arrow" d="M174 68 L174 86" marker-end="url(#ah)"/>' +
          '<rect x="24" y="86" width="300" height="40" rx="6" class="boxBad"/>' +
          '<text x="174" y="104" text-anchor="middle" font-size="10">"the agent offered a discount"</text>' +
          '<text x="174" y="119" text-anchor="middle" font-size="9.5" class="dim">the number is gone and cannot be recovered</text>' +

          '<text x="376" y="18" font-size="11" font-weight="600">Facts extracted, discussion summarised</text>' +
          '<rect x="376" y="28" width="300" height="40" rx="6" class="boxA"/>' +
          '<text x="526" y="46" text-anchor="middle" font-size="10" font-weight="600">CASE FACTS — verbatim, every prompt</text>' +
          '<text x="526" y="60" text-anchor="middle" font-size="9.5" class="mono">order 4471 · $128.40 · 15% agreed 14:20</text>' +
          '<rect x="376" y="76" width="300" height="34" rx="6" class="box"/>' +
          '<text x="526" y="97" text-anchor="middle" font-size="10">summary of the discussion (lossy, safely)</text>' +
          '<rect x="376" y="118" width="300" height="34" rx="6" class="boxOk"/>' +
          '<text x="526" y="139" text-anchor="middle" font-size="10">recent turns, verbatim</text>' +

          '<line x1="24" y1="172" x2="676" y2="172" class="stroke dashed"/>' +
          '<text x="24" y="196" font-size="11" font-weight="600">Position effects in one long input</text>' +
          '<rect x="24" y="206" width="140" height="34" rx="5" class="boxOk"/>' +
          '<text x="94" y="227" text-anchor="middle" font-size="10">beginning — reliable</text>' +
          '<rect x="172" y="206" width="352" height="34" rx="5" class="boxBad"/>' +
          '<text x="348" y="227" text-anchor="middle" font-size="10">middle — findings get omitted</text>' +
          '<rect x="532" y="206" width="144" height="34" rx="5" class="boxOk"/>' +
          '<text x="604" y="227" text-anchor="middle" font-size="10">end — reliable</text>'
      }) +

      '<pre><code>=== CASE FACTS (do not summarise; include verbatim every turn) ===\n' +
      'customer_id           C-88213  (verified 14:02)\n' +
      'orders in scope       4471 ($128.40, delivered 21 Feb, damaged)\n' +
      '                      4488 ($64.00, in transit)\n' +
      'agent commitments     15% goodwill discount offered at 14:20\n' +
      '                      replacement dispatch promised "within 48h"\n' +
      'customer statements   wants refund on 4471, not a replacement\n' +
      '                      states box was crushed on arrival\n' +
      'open actions          address change pending on account\n' +
      '=================================================================</code></pre>' +
      '<p>Two design points. Everything here is <b>a value, an identifier, a date or a commitment</b> — no ' +
      'narrative. And <code>agent commitments</code> is the field most teams forget: it is what stops the ' +
      'agent contradicting its own earlier offer forty turns later.</p>' +
      '<p>For multi-issue sessions the same idea scales: <b>persist structured issue data</b> — order IDs, ' +
      'amounts, statuses — in a separate context layer, so a session juggling four problems keeps four ' +
      'sets of facts distinct rather than blurring them into one summary.</p>' +

      '<h3>Verbose tool results</h3>' +
      '<p>The second mechanism of context loss is quieter. Your <code>lookup_order</code> returns 40+ ' +
      'fields — warehouse routing codes, audit flags, carrier metadata — of which perhaps five matter for ' +
      'a return decision. Every call plants all forty in the conversation permanently, and by the fourth ' +
      'order lookup a substantial share of the window is occupied by data nobody will read.</p>' +
      '<p>Trim at the point of entry, in a <b>PostToolUse hook</b> (<a href="#/unit/1.5">1.5</a>). ' +
      'Instructing the model to "ignore irrelevant fields" does not help: the tokens are already ' +
      'spent.</p>' +
      '<div class="callout note"><span class="co-t">The same move between agents</span>' +
      '<p>The guide extends this to multi-agent handoffs: when a downstream agent has a limited context ' +
      'budget, modify the <b>upstream</b> agent to return structured data — key facts, citations, ' +
      'relevance scores — rather than verbose content and reasoning chains. Trim at the source, not at the ' +
      'consumer.</p></div>' +

      '<h3>Lost in the middle</h3>' +
      '<p>Models process the beginning and end of a long input reliably and <b>may omit findings from the ' +
      'middle</b>. This is not a bug you can prompt away; it is a property to design around.</p>' +
      '<p>Three consequences:</p>' +
      '<ul>' +
      '<li><b>Put the key findings summary at the beginning</b> of an aggregated input, so the most ' +
      'important material sits in the reliable region.</li>' +
      '<li><b>Use explicit section headers</b> throughout, so the middle is navigable rather than an ' +
      'undifferentiated mass.</li>' +
      '<li><b>Put critical instructions at the start</b>, not buried at turn 30.</li>' +
      '</ul>' +
      '<p>What does <em>not</em> work: randomising the order so everything gets a turn in the good ' +
      'positions (the middle is still missed, just unpredictably), or aggressively summarising to fit a ' +
      'smaller window (you have traded a position problem for a precision problem).</p>' +

      '<h3>And the plain-statelessness case</h3>' +
      '<p>Worth separating from all of the above, because the exam does. If an agent appears to "forget" ' +
      'something from two turns ago, the first thing to check is whether the application is <b>sending the ' +
      'full conversation history</b> at all. The API is stateless (<a href="#/unit/1.1">1.1</a>); a message ' +
      'you did not include was never observed. That is a bug, not a context-management challenge — and it ' +
      'is not solved by summarisation, a vector database or a larger window.</p>',

      example:
      '<h3>Scenario 1 — the 15% that vanished</h3>' +
      '<p>A support conversation runs 40 turns across two orders. At turn 12 the agent offers 15% goodwill. ' +
      'At turn 34 the customer says "so with the 15% off, what do I owe?" and the agent replies that it has ' +
      'no record of a discount.</p>' +
      '<p>The history had been progressively summarised. Turn 12 had become "discussed compensation ' +
      'options" — an accurate summary that destroyed the only detail that mattered.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">What was in context at turn 34</span>' +
      '<pre><code>Summary of turns 1–30:\n"Customer contacted about a damaged\n item. Identity verified. Agent\n reviewed the order and discussed\n compensation options. Customer also\n raised a delivery question about a\n second order."</code></pre>' +
      '<p>Nothing false. Nothing usable. The 15%, the order numbers and the amounts are all gone.</p></div>' +
      '<div class="good"><span class="vs-h">With a case-facts block</span>' +
      '<pre><code>CASE FACTS (verbatim)\n  C-88213 verified 14:02\n  4471 $128.40 damaged\n  4488 $64.00 in transit\n  COMMITMENT: 15% goodwill,\n    offered 14:20, accepted 14:21\n\nSummary of turns 1–30:\n"…discussed compensation options…"</code></pre>' +
      '<p>The summary can be as lossy as it likes. The commitment is not in it.</p></div></div>' +

      '<h3>Scenario 3 — restructuring a 75K-token synthesis input</h3>' +
      '<p>Your synthesis agent receives 75,000 tokens of aggregated subagent findings. Review shows it ' +
      'cites the first ~15K and the last ~10K reliably, and rarely cites the 50K in between — even for ' +
      'material a human reviewer judges more relevant than what did get cited.</p>' +
      '<pre><code>=== KEY FINDINGS (read first) =====================================\n' +
      '  · 12 sources on music production; strongest evidence base\n' +
      '  · 9 sources on film; two conflicting adoption figures (see §3)\n' +
      '  · 4 sources on writing; thin, flag as limited coverage\n' +
      '  · CONFLICT: Okonkwo 2026 reports 45% growth; Marsh 2025 reports 31%\n' +
      '\n' +
      '=== §1 MUSIC PRODUCTION (12 sources) ==============================\n' +
      '  [structured claim records…]\n' +
      '\n' +
      '=== §2 FILM AND TELEVISION (9 sources) ============================\n' +
      '  [structured claim records…]\n' +
      '\n' +
      '=== §3 CONFLICTING FIGURES — REQUIRES ANNOTATION ==================\n' +
      '  [both values, both sources, both dates…]\n' +
      '\n' +
      '=== §4 WRITING AND PUBLISHING (4 sources) =========================\n' +
      '  [structured claim records…]</code></pre>' +
      '<p>Two changes, both cheap. The key findings summary now occupies the reliable opening region, so ' +
      'the conflict and the coverage gap cannot be missed. And explicit headers make the middle ' +
      'addressable — the model can navigate to §3 rather than scanning undifferentiated prose.</p>' +
      '<p>The wrong fixes, for completeness: randomising section order (the middle is still weak, now ' +
      'unpredictably), and summarising the 75K down to 30K (you lose the source-level detail that made the ' +
      'input worth having — see <a href="#/unit/5.6">5.6</a>).</p>',

      mistakes: [
        { t: 'Allowing summarisation to consume exact values',
          d: 'Amounts, percentages, dates, IDs and agent commitments must live in a verbatim case-facts ' +
             'block outside the summarised history.' },
        { t: 'Forgetting to record what the agent promised',
          d: 'A commitment the agent made is a fact about the case. Losing it produces the most visible ' +
             'failure of all — contradicting your own earlier offer.' },
        { t: 'Instructing the model to ignore irrelevant tool fields',
          d: 'The tokens are already in context. Trim the payload in a PostToolUse hook before it ' +
             'accumulates.' },
        { t: 'Passing verbose upstream output to a context-constrained agent',
          d: 'Fix it at the source: have the upstream agent return structured key facts and citations ' +
             'instead of reasoning chains.' },
        { t: 'Burying key findings in the middle of a long input',
          d: 'The middle is the unreliable region. Lead with a key-findings summary and use explicit ' +
             'section headers.' },
        { t: 'Randomising section order to even out position effects',
          d: 'Every ordering has a middle. This makes omissions unpredictable rather than fewer.' },
        { t: 'Summarising a long input to fit a smaller window',
          d: 'Trades a position problem for a precision problem, and destroys the source detail the ' +
             'synthesis needs.' },
        { t: 'Diagnosing a statelessness bug as a context problem',
          d: 'If the app is not sending the full history, the agent never saw the message. That is a bug, ' +
             'not a summarisation challenge.' }
      ],

      exam:
      '<p>Expect the position-effects item: a synthesis agent reliably cites the first 15K and last 10K of ' +
      'a 75K input and misses the middle. Answer: put the key findings summary at the beginning and use ' +
      'explicit section headers — not randomised ordering, not summarising to fit. Expect a transactional-' +
      'facts item where a discount or amount was lost to summarisation, answered by a persistent case-facts ' +
      'block outside the summarised history. And expect the verbose-tool-output item, answered by trimming ' +
      'before accumulation rather than instructing the model to ignore fields.</p>',

      questions: [
        {
          id: 'q5.1.1', scn: 3,
          stem: '<p>Your synthesis agent receives roughly 75,000 tokens of aggregated findings. Analysis ' +
            'shows it reliably cites material from the first ~15,000 and last ~10,000 tokens but rarely ' +
            'cites the ~50,000 in between, including material reviewers consider highly relevant. What ' +
            'change best addresses this?</p>',
          opts: [
            'Place a key findings summary at the beginning of the input and organise the detailed results under explicit section headers throughout.',
            'Randomise the order of sections on each run so that no particular finding is consistently disadvantaged by its position.',
            'Summarise the aggregated findings down to around 25,000 tokens so the entire input sits within the reliably processed region.',
            'Split the input across three separate synthesis requests and merge their outputs afterwards.'
          ],
          ans: [0],
          why: 'Models process the beginning and end of long inputs reliably and may omit findings from ' +
            'the middle. Leading with a key findings summary puts the most important material in the ' +
            'reliable region, and explicit section headers make the middle navigable rather than an ' +
            'undifferentiated mass. This is the guide\'s stated mitigation.',
          wrong: [
            '',
            'Every ordering has a middle. Randomisation converts a predictable weakness into an ' +
            'unpredictable one, which is worse for reliability and impossible to reason about.',
            'This trades a position problem for a precision problem: compressing to a third destroys the ' +
            'source-level detail — excerpts, dates, attributions — that made the input worth passing to ' +
            'synthesis at all.',
            'Three partial syntheses cannot see across each other, so cross-cutting conclusions and ' +
            'conflicts spanning sections are lost, and the merge step becomes a second synthesis problem.'
          ]
        },
        {
          id: 'q5.1.2', scn: 1,
          stem: '<p>In a 40-turn support conversation the agent offered a 15% goodwill discount at turn 12. ' +
            'At turn 34 the customer refers to it and the agent has no record, because the earlier history ' +
            'was progressively summarised to "discussed compensation options". What is the correct ' +
            'architectural fix?</p>',
          opts: [
            'Extract transactional facts — amounts, percentages, dates, order IDs and commitments the agent has made — into a persistent case-facts block included verbatim in every prompt, outside the summarised history.',
            'Instruct the summarisation step to preserve all numerical values and percentages when compressing earlier turns.',
            'Stop summarising and send the full verbatim history on every request, accepting the additional token cost.',
            'Store the conversation in a vector database and retrieve relevant earlier turns when the customer refers to something.'
          ],
          ans: [0],
          why: 'The reliable fix is to remove the critical facts from the compressible region entirely. A ' +
            'compact block of values, identifiers, dates and agent commitments, passed verbatim every ' +
            'turn, means the summary can be as lossy as it likes without endangering anything ' +
            'load-bearing.',
          wrong: [
            '',
            'An instruction to a summarisation step is probabilistic, and the step has no reliable way to ' +
            'know which of many numbers matter. Structuring the facts out of the summary is deterministic; ' +
            'asking the summary to be careful is not.',
            'Postpones the problem rather than solving it — cost and latency grow with every turn and ' +
            'eventually the window fills anyway. Summarisation is the right technique; the error was ' +
            'summarising the wrong material.',
            'Substantial infrastructure for a problem solved by a small structured block, and retrieval ' +
            'still depends on the agent recognising that it needs to look — which is exactly what it ' +
            'failed to do.'
          ]
        },
        {
          id: 'q5.1.3', scn: 1,
          stem: '<p>Each <code>lookup_order</code> call returns more than 40 fields, of which about five ' +
            'are relevant to return and refund decisions. Across a multi-issue session these payloads ' +
            'accumulate and the agent begins losing track of earlier details. What is the most effective ' +
            'measure?</p>',
          opts: [
            'Trim each tool result to the relevant fields in a PostToolUse hook, before it enters the conversation.',
            'Add a system prompt instruction telling the agent to disregard fields that are not relevant to the current task.',
            'Summarise the accumulated tool results once the conversation approaches its context limit.',
            'Reduce the number of order lookups by having the agent request all orders in a single call.'
          ],
          ans: [0],
          why: 'Tool results consume context out of proportion to their relevance, and the tokens are ' +
            'spent the moment the payload enters the conversation. A PostToolUse hook trims before ' +
            'accumulation, which is both deterministic and the only point at which the cost can actually ' +
            'be avoided.',
          wrong: [
            '',
            'Telling the agent to disregard fields does not remove them from context — they are already ' +
            'occupying the window. This addresses attention, not the resource problem.',
            'Reactive: you are compressing data you never needed to ingest, and compaction is ' +
            'indiscriminate about what it loses.',
            'Fewer, larger payloads is not obviously less context, and it does not address the real issue ' +
            'that 35 of 40 fields per order are irrelevant. Batching the calls is orthogonal to trimming ' +
            'them.'
          ]
        },
        {
          id: 'q5.1.4', scn: 1,
          stem: '<p>A user reports that your conversational agent "forgets" what they said two messages ' +
            'earlier, even in short conversations well within the context window. What should you check ' +
            'first?</p>',
          opts: [
            'Whether the application is including the full prior conversation in the <code>messages</code> array on each request, since the API retains no server-side state.',
            'Whether the summarisation threshold is set too aggressively, causing early compression of recent turns.',
            'Whether the system prompt needs an instruction reminding the model to reference earlier parts of the conversation.',
            'Whether the model should be switched to one with a larger context window to accommodate the history.'
          ],
          ans: [0],
          why: 'Each API call is independent and the model has no memory of previous calls, so whatever it ' +
            'must reason about has to be present in the request you send. Forgetting inside a short ' +
            'conversation points at history not being transmitted — a straightforward application bug ' +
            'rather than a context-management challenge.',
          wrong: [
            '',
            'Plausible in a long conversation, but the stem says the conversation is short and well within ' +
            'the window, so there is nothing that should have triggered compression.',
            'No instruction can make the model reference material that was not sent. It cannot recall what ' +
            'it never received.',
            'A larger window cannot help when the content is not being included at all. This is the ' +
            'capacity-instead-of-diagnosis reflex.'
          ]
        },
        {
          id: 'q5.1.5', scn: 3,
          stem: '<p>Your synthesis agent has a limited context budget, and the upstream document-analysis ' +
            'agent currently returns long prose containing its full reasoning alongside its conclusions. ' +
            'Which change best fits the guide\'s recommendation?</p>',
          opts: [
            'Modify the upstream agent to return structured data — key facts, citations and relevance scores — rather than verbose content and reasoning chains.',
            'Have the coordinator summarise the upstream agent\'s prose before passing it to synthesis.',
            'Increase the synthesis agent\'s context budget so it can accommodate the upstream output as it is.',
            'Have the synthesis agent read the upstream output in chunks across several turns, retaining what it judges relevant.'
          ],
          ans: [0],
          why: 'The guide asks for upstream agents to return structured data when downstream agents have ' +
            'limited context budgets. Fixing it at the source removes the verbosity rather than ' +
            'transporting and then compressing it, and structured records also preserve the attribution ' +
            'that synthesis needs (<a href="#/unit/5.6">5.6</a>).',
          wrong: [
            '',
            'Inserts a lossy step that can drop citations and exact figures — precisely the material ' +
            'synthesis depends on. Summarising prose that should not have been prose is a second-best ' +
            'remedy.',
            'Raising the budget accommodates the waste instead of removing it, and reasoning chains from ' +
            'another agent are not merely bulky — they invite synthesis to treat speculation as ' +
            'finding.',
            'Chunked reading multiplies round trips and makes the retention decision at exactly the point ' +
            'where context is scarcest. The upstream agent already knows which facts matter.'
          ]
        }
      ]
    },

    /* ================================================================== 5.2 */
    {
      id: '5.2',
      short: 'Escalation & ambiguity resolution',
      title: 'Design effective escalation and ambiguity resolution patterns',
      scn: [1],
      tldr: 'Escalate on three triggers: the customer <b>explicitly asks for a human</b>, <b>policy is ' +
        'silent or ambiguous</b> on their specific request, or the agent <b>cannot make meaningful ' +
        'progress</b>. Do <em>not</em> escalate on sentiment, on self-reported low confidence, or because ' +
        'a request has several parts. Acknowledge frustration and offer resolution when the issue is within ' +
        'your capability — escalating only if the customer reiterates. On multiple customer matches, ' +
        '<b>ask for another identifier</b>; never choose heuristically. And when calibration is the ' +
        'problem, the fix is <b>explicit criteria with few-shot examples</b>.',

      concept:
      '<h3>The three legitimate triggers</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Trigger</th><th>Why it is a human\'s job</th></tr></thead><tbody>' +
      '<tr><td><b>Explicit request for a human</b></td><td>The customer has told you what they want. ' +
      'Continuing to "try to help first" overrides a stated preference and reads as obstruction.</td></tr>' +
      '<tr><td><b>Policy gap or ambiguity</b></td><td>The request falls outside what policy addresses — ' +
      'competitor price matching when policy covers only own-site adjustments. Interpreting policy is not ' +
      'the agent\'s authority.</td></tr>' +
      '<tr><td><b>Cannot make meaningful progress</b></td><td>Tools exhausted, information unavailable, ' +
      'the path forward requires access the agent does not have.</td></tr>' +
      '</tbody></table></div>' +
      '<p>Note what is <em>not</em> on that list: complexity. A complicated case the policy plainly covers ' +
      'is the agent\'s job. A simple case the policy does not address is not.</p>' +

      '<h3>The two anti-triggers the guide names explicitly</h3>' +

      '<h4>Sentiment</h4>' +
      '<p>Sentiment does not correlate with case complexity, and the counter-examples are symmetric: a ' +
      '<b>frustrated customer with a simple shipping delay</b> does not need a human, while a ' +
      '<b>calm, polite customer whose request falls in a policy gap</b> does. Route on sentiment and you ' +
      'get both errors at once — escalating the easy cases and handling the hard ones autonomously.</p>' +

      '<h4>Self-reported confidence</h4>' +
      '<p>An agent\'s own confidence is a poor proxy for whether it should escalate, and for a specific ' +
      'reason: <b>it is already incorrectly confident on the hard cases</b>. That is what makes them hard. ' +
      'A threshold on an uncalibrated signal filters out the wrong population ' +
      '(<a href="#/unit/5.5">5.5</a>).</p>' +

      fig({
        vb: '0 0 700 230',
        caption: 'Sentiment and complexity are close to independent. Routing on the wrong axis produces ' +
          'errors in both directions.',
        body:
          '<line x1="120" y1="190" x2="650" y2="190" class="stroke"/>' +
          '<line x1="120" y1="190" x2="120" y2="30" class="stroke"/>' +
          '<text x="385" y="216" text-anchor="middle" font-size="10.5" font-weight="600">customer sentiment →</text>' +
          '<text x="112" y="110" text-anchor="end" font-size="10.5" font-weight="600" transform="rotate(-90 112 110)">policy clarity →</text>' +
          '<text x="118" y="44" text-anchor="end" font-size="9.5" class="dim">gap</text>' +
          '<text x="118" y="180" text-anchor="end" font-size="9.5" class="dim">clear</text>' +

          '<rect x="140" y="36" width="240" height="62" rx="6" class="boxA"/>' +
          '<text x="260" y="58" text-anchor="middle" font-size="10.5" font-weight="600">calm · policy gap</text>' +
          '<text x="260" y="76" text-anchor="middle" font-size="9.5" class="dim">ESCALATE — and sentiment routing</text>' +
          '<text x="260" y="90" text-anchor="middle" font-size="9.5" class="dim">would keep this one</text>' +

          '<rect x="392" y="36" width="240" height="62" rx="6" class="boxA"/>' +
          '<text x="512" y="58" text-anchor="middle" font-size="10.5" font-weight="600">angry · policy gap</text>' +
          '<text x="512" y="83" text-anchor="middle" font-size="9.5" class="dim">ESCALATE</text>' +

          '<rect x="140" y="112" width="240" height="62" rx="6" class="boxOk"/>' +
          '<text x="260" y="134" text-anchor="middle" font-size="10.5" font-weight="600">calm · policy clear</text>' +
          '<text x="260" y="159" text-anchor="middle" font-size="9.5" class="dim">RESOLVE</text>' +

          '<rect x="392" y="112" width="240" height="62" rx="6" class="boxOk"/>' +
          '<text x="512" y="134" text-anchor="middle" font-size="10.5" font-weight="600">angry · policy clear</text>' +
          '<text x="512" y="152" text-anchor="middle" font-size="9.5" class="dim">ACKNOWLEDGE, then RESOLVE —</text>' +
          '<text x="512" y="166" text-anchor="middle" font-size="9.5" class="dim">sentiment routing would escalate</text>'
      }) +

      '<h3>Frustration: acknowledge, then resolve</h3>' +
      '<p>A customer writes "this is outrageous, I have been waiting twenty minutes and the quality is ' +
      'appalling". The issue underneath is a shipping delay you can fix. The sequence matters:</p>' +
      '<ol>' +
      '<li><b>Acknowledge the emotion.</b> "I am sorry — a twenty-minute wait on top of a late delivery is ' +
      'genuinely frustrating." Skipping this and jumping to the fix reads as not having listened, even when ' +
      'the fix is correct.</li>' +
      '<li><b>Offer concrete resolution.</b> Not "let me look into that" — the actual options: a ' +
      'replacement dispatched today, or a full refund.</li>' +
      '<li><b>Escalate only if they reiterate</b> the preference for a human.</li>' +
      '</ol>' +
      '<p>The principle: <b>dissatisfaction is not a request for a manager.</b> But if they say "I still ' +
      'want to speak to someone", that <em>is</em> the request, and it is honoured immediately.</p>' +

      '<h3>Explicit requests are honoured immediately</h3>' +
      '<p>"I want to speak to a human right now." The correct response is to escalate — not to attempt ' +
      'diagnosis first, not to ask what the problem is so the handoff is better informed, not to offer to ' +
      'try. Investigating first overrides a stated preference, and the customer experiences it as being ' +
      'held.</p>' +
      '<p>Do compile a structured handoff summary as you escalate (<a href="#/unit/1.4">1.4</a>) — that ' +
      'costs the customer nothing and saves the human from starting cold.</p>' +

      '<h3>Multiple matches: ask, never guess</h3>' +
      '<p><code>get_customer</code> returns two accounts for "J. Smith". The agent must <b>ask for an ' +
      'additional identifier</b> — date of birth, last four digits of the phone number, account number. ' +
      'Heuristic selection is an anti-pattern the guide names outright, and the reasons are concrete: ' +
      '"pick the most recent" and "pick the one with more orders" both cause <b>wrong-customer errors</b>, ' +
      'which in a refund flow means moving one person\'s money on another person\'s instruction.</p>' +
      '<p>Note that this is cheap. One clarifying question costs a turn; a wrong-customer refund costs a ' +
      'chargeback, an incident and a trust problem.</p>' +

      '<h3>When calibration is the problem</h3>' +
      '<p>Suppose first-contact resolution is 55% against an 80% target, and the logs show a specific ' +
      'pattern: the agent escalates <b>straightforward</b> cases (standard damage replacements with photo ' +
      'evidence) while attempting <b>complex</b> ones autonomously (situations needing policy ' +
      'exceptions).</p>' +
      '<p>Nothing here is a hard rule being violated. The escalate/resolve boundary is simply in the wrong ' +
      'place — a judgment problem. The proportionate fix is <b>explicit escalation criteria in the system ' +
      'prompt, with few-shot examples</b> showing when to escalate versus resolve ' +
      '(<a href="#/unit/4.2">4.2</a>).</p>' +
      '<div class="callout trap"><span class="co-t">This is the counter-case to "always use a gate"</span>' +
      '<p>Domain 1 trains you to answer reliability requirements with deterministic enforcement. Here the ' +
      'correct answer is prompt-level, and it is the <em>official</em> answer to sample question 3. The ' +
      'discriminator: <b>a gate enforces a rule; it cannot teach a boundary.</b> Money moving without ' +
      'verification is a rule — gate it. "Which kinds of case deserve a human" is a judgment — teach it ' +
      'with criteria and examples. A whitelist gate here would hard-block escalations nobody ' +
      'anticipated.</p></div>' +

      '<h3>Presenting contradictory evidence</h3>' +
      '<p>One more case worth knowing: tool data contradicts the customer\'s claim — they say the parcel ' +
      'never arrived, tracking shows delivered and signed. This is <b>not</b> automatically an escalation. ' +
      'The agent can present the evidence respectfully and ask about it: "tracking shows it was signed for ' +
      'on Tuesday — is it possible a neighbour or building manager took it in?" Many such cases resolve. ' +
      'Escalate if the contradiction persists and the resolution needs a judgment call outside policy.</p>',

      example:
      '<h3>Scenario 1 — five messages, five decisions</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Customer message</th><th>Decision</th><th>Reason</th></tr></thead><tbody>' +
      '<tr><td>"This is ridiculous, I have waited twenty minutes. My order is three days late."</td>' +
      '<td><b>Acknowledge, then resolve</b></td><td>Frustration plus a straightforward delay the agent can ' +
      'fix. Sentiment is not a trigger — but skipping the acknowledgement is its own error.</td></tr>' +
      '<tr><td>"I want to speak to a human right now."</td><td><b>Escalate immediately</b></td>' +
      '<td>Explicit request. Do not investigate first; do compile a handoff summary.</td></tr>' +
      '<tr><td>"Competitor X has this £40 cheaper — will you match it?" <span class="muted">(policy covers ' +
      'own-site adjustments only, silent on competitors)</span></td><td><b>Escalate</b></td><td>Policy gap. ' +
      'Interpreting silence is not the agent\'s authority — and note the customer is perfectly ' +
      'pleasant.</td></tr>' +
      '<tr><td>"My chair arrived damaged, here is a photo." <span class="muted">(policy explicitly covers ' +
      'damage-with-evidence)</span></td><td><b>Resolve</b></td><td>Squarely inside policy. Escalating this ' +
      'is the miscalibration that drags first-contact resolution down.</td></tr>' +
      '<tr><td>"It never arrived." <span class="muted">(tracking: delivered, signed "M. Reyes")</span></td>' +
      '<td><b>Present the evidence, then resolve or escalate</b></td><td>Ask about the signature ' +
      'respectfully first. Escalate only if it stays unresolved.</td></tr>' +
      '</tbody></table></div>' +

      '<h3>The criteria block that fixed 55% → target</h3>' +
      '<pre><code>ESCALATION CRITERIA\n\n' +
      'Escalate when ANY of these is true:\n' +
      '  1. The customer asks for a human. Escalate on the first clear\n' +
      '     request. Do not investigate first.\n' +
      '  2. Policy does not address their specific request, or two policies\n' +
      '     conflict. Silence is a gap, not permission.\n' +
      '  3. You cannot make meaningful progress — required tool unavailable,\n' +
      '     or the action needs authority you do not have.\n' +
      '\n' +
      'Do NOT escalate merely because:\n' +
      '  · the customer is angry or upset\n' +
      '  · the message contains several separate concerns\n' +
      '  · the case feels complicated but policy covers it\n' +
      '  · tool data contradicts the customer (present it respectfully first)\n' +
      '\n' +
      'EXAMPLE — resolve, not escalate\n' +
      '  "Chair arrived with a cracked leg" + photo, 6 weeks after delivery.\n' +
      '  Reasoning: the 30-day RETURN window has passed, which suggests\n' +
      '  escalation. But policy 4.2 treats delivery damage as a separate\n' +
      '  category with no time limit where damage is reported on arrival.\n' +
      '  The competing reading loses because the window governs returns,\n' +
      '  not damage. Evidence is present. → resolve autonomously.\n' +
      '\n' +
      'EXAMPLE — escalate, not resolve\n' +
      '  "Match competitor X\'s price." Customer polite, request simple.\n' +
      '  Reasoning: policy 7.1 covers own-site price drops within 14 days\n' +
      '  and is silent on competitors. Silence is not authorisation, and\n' +
      '  the simplicity of the request is irrelevant. → escalate.</code></pre>' +
      '<p>Both examples are boundary cases, both state the competing reading and why it loses, and both ' +
      'turn on a <b>criterion</b> rather than on the product involved. That is what makes them generalise ' +
      'to cases nobody wrote down.</p>',

      mistakes: [
        { t: 'Escalating on negative sentiment',
          d: 'Sentiment does not correlate with complexity. You escalate frustrated-but-simple cases and ' +
             'keep calm-but-out-of-policy ones — wrong in both directions.' },
        { t: 'Routing on self-reported confidence',
          d: 'The agent is already confidently wrong on the hard cases, so a threshold filters the wrong ' +
             'population.' },
        { t: 'Investigating before honouring an explicit request for a human',
          d: 'Overrides a stated preference. Escalate immediately — and attach a structured handoff ' +
             'summary.' },
        { t: 'Jumping straight to the fix without acknowledging frustration',
          d: 'Correct outcome, poor handling. Acknowledge the emotion, then offer concrete resolution.' },
        { t: 'Escalating because a message has several concerns',
          d: 'Decompose and handle them with shared context (<a href="#/unit/1.4">1.4</a>). Multi-concern ' +
             'is not a policy gap.' },
        { t: 'Choosing between multiple customer matches heuristically',
          d: '"Most recent" or "most orders" causes wrong-customer errors. Ask for an additional ' +
             'identifier.' },
        { t: 'Treating policy silence as permission',
          d: 'A request policy does not address is a gap requiring human interpretation, however simple ' +
             'it looks.' },
        { t: 'Escalating immediately when tool data contradicts the customer',
          d: 'Present the contradictory evidence respectfully first. Many cases resolve; escalate if it ' +
             'persists.' },
        { t: 'Reaching for a gate to fix miscalibrated escalation',
          d: 'Gates enforce rules; they cannot teach a judgment boundary, and a whitelist would block ' +
             'escalations nobody anticipated. Use explicit criteria plus few-shot examples.' }
      ],

      exam:
      '<p>Official sample question 3 lives here and is the domain\'s signature item: 55% first-contact ' +
      'resolution, escalating easy cases while attempting hard ones, and the answer is <b>explicit ' +
      'escalation criteria with few-shot examples</b>. Its three distractors are worth memorising as a set ' +
      '— self-reported confidence, a separately trained classifier, and sentiment analysis — because each ' +
      'recurs independently. Expect a second item on the frustrated-customer-with-a-simple-problem case ' +
      '(acknowledge, then resolve) or the competitor price match (policy gap, escalate), and possibly the ' +
      'multiple-matches item (ask for another identifier).</p>',

      questions: [
        {
          id: 'q5.2.1', scn: 1, official: true,
          stem: '<p>Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show ' +
            'it escalates straightforward cases (standard damage replacements with photo evidence) while ' +
            'attempting to autonomously handle complex situations requiring policy exceptions. What\'s the ' +
            'most effective way to improve escalation calibration?</p>',
          opts: [
            'Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously.',
            'Have the agent self-report a confidence score (1–10) before each response and automatically route requests to humans when confidence falls below a threshold.',
            'Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing.',
            'Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold.'
          ],
          ans: [0],
          why: 'Adding explicit escalation criteria with few-shot examples directly addresses the root ' +
            'cause: unclear decision boundaries. This is the proportionate first response before adding ' +
            'infrastructure — the agent is not violating a rule, it is drawing the line in the wrong ' +
            'place, and criteria plus boundary examples are what teach a line.',
          wrong: [
            '',
            'LLM self-reported confidence is poorly calibrated — the agent is already incorrectly ' +
            'confident on hard cases, which is precisely the behaviour being diagnosed. A threshold on ' +
            'that signal filters the wrong population.',
            'Over-engineered: it requires labelled data and ML infrastructure when prompt optimisation has ' +
            'not yet been tried. It also freezes today\'s escalation patterns into a model that must be ' +
            'retrained whenever policy changes.',
            'Solves a different problem entirely. Sentiment does not correlate with case complexity, which ' +
            'is the actual issue — a frustrated customer with a simple delay does not need a human, and a ' +
            'calm one with a policy gap does.'
          ]
        },
        {
          id: 'q5.2.2', scn: 1,
          stem: '<p>A customer writes: "This is outrageous — I have been on hold twenty minutes and my ' +
            'order is three days late." The delay is a straightforward shipping issue the agent can ' +
            'resolve. What is the correct handling?</p>',
          opts: [
            'Acknowledge the frustration explicitly, then offer a concrete resolution, escalating only if the customer reiterates a preference for a human.',
            'Escalate to a human, since the strength of the language indicates the customer will not accept an automated resolution.',
            'Resolve the shipping issue directly and efficiently, without commenting on the customer\'s tone, so the fix arrives as quickly as possible.',
            'Ask the customer whether they would prefer to continue with the agent or be transferred, then proceed accordingly.'
          ],
          ans: [0],
          why: 'Dissatisfaction is not a request for a manager. The correct sequence is to acknowledge the ' +
            'emotion, offer concrete resolution because the issue is within the agent\'s capability, and ' +
            'escalate only if the customer reiterates their preference for a human.',
          wrong: [
            '',
            'Sentiment-based escalation is an anti-pattern: it consumes scarce human capacity on cases the ' +
            'agent can resolve, and it is what drags first-contact resolution below target.',
            'The outcome is right and the handling is not. Skipping acknowledgement reads as not having ' +
            'listened, even when the fix is correct — the guide treats the acknowledgement step as ' +
            'essential rather than decorative.',
            'Offering a transfer nobody asked for invites escalation of a case the agent can resolve, and ' +
            'it puts the burden of routing on an already irritated customer.'
          ]
        },
        {
          id: 'q5.2.3', scn: 1,
          stem: '<p>A polite, patient customer asks the agent to match a competitor\'s price. Your ' +
            'published policy covers price adjustments on your own site within 14 days of purchase and ' +
            'says nothing about competitor pricing. What should the agent do?</p>',
          opts: [
            'Escalate to a human, because the policy is silent on this request and interpreting that silence requires authority the agent does not have.',
            'Decline politely, since a price match is not among the adjustments the policy authorises.',
            'Apply the own-site adjustment policy by analogy, since a competitor price drop is functionally similar to a price drop on your own site.',
            'Resolve autonomously by offering a store credit of equivalent value, which is within the agent\'s normal goodwill authority.'
          ],
          ans: [0],
          why: 'A policy gap is one of the three legitimate escalation triggers. Silence is not ' +
            'authorisation and it is not prohibition — resolving it either way is a policy interpretation, ' +
            'which belongs to a human. Note that the customer\'s pleasant tone is irrelevant to the ' +
            'decision.',
          wrong: [
            '',
            'Treating silence as prohibition is itself an interpretation, and it may well be the wrong ' +
            'one — the business may match competitor prices as an unwritten practice. Declining also ' +
            'closes the interaction on a question nobody with authority has answered.',
            'Reasoning by analogy from an adjacent policy is exactly the interpretation the agent is not ' +
            'authorised to make, and the two situations differ commercially in ways policy may care ' +
            'about.',
            'Inventing an equivalent-value remedy circumvents the gap rather than resolving it, and ' +
            'commits the business to a cost no policy sanctioned.'
          ]
        },
        {
          id: 'q5.2.4', scn: 1,
          stem: '<p><code>get_customer</code> returns two accounts matching the name the customer gave, ' +
            'both with recent activity. The customer has asked for a refund. What should the agent ' +
            'do?</p>',
          opts: [
            'Ask the customer for an additional identifier — such as a date of birth, account number, or the last four digits of their phone number — before proceeding.',
            'Select the account with the more recent order, since that is most likely the one the current enquiry concerns.',
            'Select the account with more total orders, since it is more likely the customer\'s primary account.',
            'Escalate to a human, since ambiguous identity cannot be resolved autonomously.'
          ],
          ans: [0],
          why: 'Multiple matches require clarification rather than heuristic selection. One extra question ' +
            'costs a single turn; choosing wrongly in a refund flow moves one person\'s money on another ' +
            'person\'s instruction, which is a wrong-customer error the guide names as an anti-pattern.',
          wrong: [
            '',
            'Recency is a guess. This is exactly the heuristic selection the guide identifies as causing ' +
            'wrong-customer errors, and the consequence here is financial.',
            'Order volume says nothing about which account the person in front of you holds. Same ' +
            'anti-pattern, different proxy.',
            'Unnecessary escalation. Identity ambiguity is routinely resolvable by asking one question, ' +
            'and burning human capacity on it is the miscalibration that suppresses first-contact ' +
            'resolution.'
          ]
        },
        {
          id: 'q5.2.5', scn: 1,
          stem: '<p>Which situations are legitimate triggers for escalating to a human?</p>',
          opts: [
            'The customer clearly and directly asks to speak to a human.',
            'The customer\'s request falls outside what any policy addresses, so resolving it would require interpreting policy.',
            'The customer\'s message raises three separate issues at once.',
            'Tracking data directly contradicts the customer\'s account of what happened.'
          ],
          ans: [0, 1],
          why: 'An explicit request for a human and a policy gap are two of the three legitimate triggers ' +
            '(the third being inability to make meaningful progress). Both reflect limits on the agent\'s ' +
            'authority rather than on its capability.',
          wrong: [
            '', '',
            'Multi-concern messages should be decomposed and handled with shared context ' +
            '(<a href="#/unit/1.4">1.4</a>). Several ordinary concerns are not a policy gap.',
            'A contradiction is not automatically an escalation. The agent can present the evidence ' +
            'respectfully — "tracking shows it was signed for on Tuesday; could a neighbour have taken it ' +
            'in?" — and many such cases resolve. Escalate only if it persists.'
          ]
        }
      ]
    },

    /* ================================================================== 5.3 */
    {
      id: '5.3',
      short: 'Error propagation between agents',
      title: 'Implement error propagation strategies across multi-agent systems',
      scn: [3, 1],
      tldr: 'When a subagent fails, the coordinator needs enough to choose a recovery: the <b>failure ' +
        'type</b>, <b>what was attempted</b>, any <b>partial results</b>, and <b>possible ' +
        'alternatives</b>. Generic statuses like "search unavailable" hide all of that. Two named ' +
        'anti-patterns sit on either side: <b>silently suppressing an error</b> by returning empty results ' +
        'as success, and <b>terminating the whole workflow</b> on one failure. The pattern between them is ' +
        'local recovery first, then propagate — and annotate coverage gaps in the final output.',

      concept:
      '<h3>What the coordinator has to decide</h3>' +
      '<p>A subagent fails. The coordinator now has options: retry with a modified query, delegate to a ' +
      'different subagent, proceed with partial results and annotate the gap, or give up on that subtopic. ' +
      'Choosing well requires information — and a status string does not carry any.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">"search unavailable"</span>' +
      '<p>Was it a timeout, in which case retrying might work? A malformed query the coordinator could ' +
      'rewrite? Did it find anything before failing? Is there another route to this material? The ' +
      'coordinator cannot tell, so it either retries blindly or drops the subtopic.</p></div>' +
      '<div class="good"><span class="vs-h">Structured error context</span>' +
      '<pre><code>{ "status": "partial_failure",\n  "failure_type": "timeout",\n  "attempted": {\n    "query": "AI music production 2026",\n    "elapsed_s": 30, "retries": 2 },\n  "partial_results": [ …4 sources… ],\n  "alternatives": [\n    "narrow to 2025-2026",\n    "try the trade-press index" ] }</code></pre></div></div>' +
      '<p>Those four elements — failure type, what was attempted, partial results, possible alternatives — ' +
      'are the guide\'s list, and each maps to a decision. Type tells the coordinator whether retry is ' +
      'plausible. Attempted tells it what <em>not</em> to repeat. Partial results let it proceed with ' +
      'something. Alternatives give it a next move it might not have derived.</p>' +

      fig({
        vb: '0 0 700 270',
        caption: 'Four handling strategies. Only one leaves the coordinator able to recover, and two are ' +
          'named anti-patterns.',
        body:
          '<rect x="270" y="14" width="160" height="34" rx="6" class="boxBad"/>' +
          '<text x="350" y="36" text-anchor="middle" font-size="11" font-weight="600">subagent times out</text>' +

          '<path class="arrow" d="M300 48 L110 84" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M330 48 L290 84" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M370 48 L440 84" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M400 48 L610 84" marker-end="url(#ah)"/>' +

          '<rect x="24" y="84" width="160" height="76" rx="6" class="boxOk"/>' +
          '<text x="104" y="104" text-anchor="middle" font-size="10" font-weight="600">structured context</text>' +
          '<text x="104" y="121" text-anchor="middle" font-size="9" class="dim">type · attempted ·</text>' +
          '<text x="104" y="134" text-anchor="middle" font-size="9" class="dim">partial · alternatives</text>' +
          '<text x="104" y="152" text-anchor="middle" font-size="9.5" style="fill:var(--ok)">coordinator can choose</text>' +

          '<rect x="204" y="84" width="160" height="76" rx="6" class="box"/>' +
          '<text x="284" y="104" text-anchor="middle" font-size="10" font-weight="600">generic status</text>' +
          '<text x="284" y="121" text-anchor="middle" font-size="9" class="dim">"search unavailable"</text>' +
          '<text x="284" y="139" text-anchor="middle" font-size="9" class="dim">after silent retries</text>' +
          '<text x="284" y="154" text-anchor="middle" font-size="9.5" class="dim">context hidden</text>' +

          '<rect x="384" y="84" width="160" height="76" rx="6" class="boxBad"/>' +
          '<text x="464" y="104" text-anchor="middle" font-size="10" font-weight="600">empty = success</text>' +
          '<text x="464" y="121" text-anchor="middle" font-size="9" class="dim">failure suppressed</text>' +
          '<text x="464" y="139" text-anchor="middle" font-size="9" class="dim">no signal anywhere</text>' +
          '<text x="464" y="154" text-anchor="middle" font-size="9.5" style="fill:var(--bad)">silent data loss</text>' +

          '<rect x="564" y="84" width="112" height="76" rx="6" class="boxBad"/>' +
          '<text x="620" y="104" text-anchor="middle" font-size="10" font-weight="600">kill workflow</text>' +
          '<text x="620" y="124" text-anchor="middle" font-size="9" class="dim">one failure ends</text>' +
          '<text x="620" y="137" text-anchor="middle" font-size="9" class="dim">everything</text>' +
          '<text x="620" y="154" text-anchor="middle" font-size="9.5" style="fill:var(--bad)">no degradation</text>' +

          '<rect x="24" y="184" width="652" height="76" rx="6" class="boxA"/>' +
          '<text x="40" y="204" font-size="11" font-weight="600">The pattern in full</text>' +
          '<text x="40" y="222" font-size="10.5">1 · Recover locally for transient failures — one or two bounded attempts inside the subagent.</text>' +
          '<text x="40" y="238" font-size="10.5">2 · Propagate only what you could not resolve, with type, attempt detail and partial results.</text>' +
          '<text x="40" y="254" font-size="10.5">3 · Annotate the final output: which sections are well-supported, which have gaps and why.</text>'
      }) +

      '<h3>The two anti-patterns, and why they are worse than they look</h3>' +
      '<h4>Silently suppressing the error</h4>' +
      '<p>The subagent catches its timeout and returns an empty result set marked successful. This is the ' +
      'most dangerous option available, because it destroys the signal entirely: the coordinator has no ' +
      'reason to retry, the synthesis proceeds happily, and the report simply omits a topic. Nobody knows. ' +
      'A failure has become <b>undetectably wrong output</b>.</p>' +
      '<p>Note the connection to <a href="#/unit/2.2">2.2</a>: distinguishing an access failure from a ' +
      'valid empty result is the same discipline seen from the tool side. "The search failed" and "the ' +
      'search ran and found nothing" must never be encoded identically.</p>' +

      '<h4>Terminating the whole workflow</h4>' +
      '<p>Propagating the exception to a top-level handler that kills the run throws away every successful ' +
      'subagent result over one failure. If eleven of twelve subtopics succeeded, the correct output is ' +
      'eleven subtopics plus an annotated gap — not nothing.</p>' +

      '<h3>Local recovery first, then propagate</h3>' +
      '<p>Transient failures should be handled where the knowledge is: inside the subagent, one or two ' +
      'bounded attempts (<a href="#/unit/2.2">2.2</a>). What propagates is what local recovery could not ' +
      'fix — with what was attempted and any partial results attached.</p>' +
      '<p>The anti-pattern at this level is <b>unbounded retries inside a subagent</b>: latency burns ' +
      'invisibly while the coordinator waits, and the coordinator never gets the chance to decide that a ' +
      'different approach would be better.</p>' +
      '<div class="callout note"><span class="co-t">Retry inside, but report outward</span>' +
      '<p>Option B in the official item is instructive: it retries with exponential backoff inside the ' +
      'subagent — which is <em>right</em> — and then returns a generic "search unavailable" status, which ' +
      'is wrong. Good local recovery does not excuse a contextless report. Do both halves.</p></div>' +

      '<h3>Coverage annotations — graceful degradation made visible</h3>' +
      '<p>When some subagents fail, the synthesis should say so, in the output, next to the affected ' +
      'material:</p>' +
      '<pre><code>## Music production\n[full section — 12 sources]\n\n' +
      '## Film and television\n[full section — 9 sources]\n\n' +
      '## Writing and publishing  — ⚠ PARTIAL COVERAGE\n[4 sources]\n' +
      '> Coverage limited: the trade-press search timed out after two\n' +
      '> retries. This section draws on academic sources only and may\n' +
      '> understate commercial adoption.</code></pre>' +
      '<p>Two properties worth naming. It <b>preserves the value of what worked</b> — eleven good sections ' +
      'still ship. And it is <b>honest at the point of use</b>: a reader of the writing section sees the ' +
      'caveat, rather than a footnote on page 40 or nothing at all. A confident-looking thin section is ' +
      'worse than a thin section labelled thin.</p>',

      example:
      '<h3>Scenario 3 — one timeout, four possible responses</h3>' +
      '<p>The web search subagent times out researching a complex subtopic. It had already collected four ' +
      'sources before the timeout.</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Response</th><th>What the coordinator can do</th>' +
      '<th>Verdict</th></tr></thead><tbody>' +
      '<tr><td>Structured context: type <code>timeout</code>, the query, elapsed time, the four partial ' +
      'sources, two suggested alternatives</td><td>Retry narrowed, try the alternative index, or proceed ' +
      'with four sources and annotate</td><td><b>Correct</b></td></tr>' +
      '<tr><td>Retry twice internally, then return "search unavailable"</td><td>Retry blindly or drop the ' +
      'subtopic — it does not know a timeout occurred, or that four sources exist</td><td>Local recovery ' +
      'good; report useless</td></tr>' +
      '<tr><td>Catch the timeout, return <code>[]</code> marked successful</td><td>Nothing — it does not ' +
      'know anything went wrong</td><td><b>Worst.</b> Silent data loss</td></tr>' +
      '<tr><td>Propagate the exception, terminate the run</td><td>Nothing — every other subtopic\'s work is ' +
      'discarded</td><td>Unnecessary total failure</td></tr>' +
      '</tbody></table></div>' +

      '<h3>What the coordinator then does</h3>' +
      '<pre><code>received from web_search:\n' +
      '  failure_type    "timeout"\n' +
      '  attempted       q="AI music production 2026", 30s, 2 retries\n' +
      '  partial_results 4 sources (structured claim records)\n' +
      '  alternatives    ["narrow the date range", "trade-press index"]\n' +
      '\n' +
      'coordinator decides:\n' +
      '  1. Re-delegate ONE narrowed query — "alternatives" suggested it and\n' +
      '     "attempted" shows the broad query is what timed out, so this is\n' +
      '     not a blind repeat.\n' +
      '  2. If that also fails: proceed with the 4 partial sources and\n' +
      '     instruct synthesis to mark the section PARTIAL COVERAGE with the\n' +
      '     reason.\n' +
      '  3. Do NOT discard the 4 sources, and do NOT abandon the other 11\n' +
      '     subtopics.</code></pre>' +
      '<p>Step 1 is only available because the error said what was attempted. Without that, "retry" and ' +
      '"repeat the thing that just failed" are the same action.</p>' +

      '<div class="callout tip"><span class="co-t">Design test</span>' +
      '<p>For every error your subagent can return, ask: <b>could the coordinator pick between retry, ' +
      'reroute, proceed-with-partial and abandon, using only this payload?</b> If not, add the field that ' +
      'makes the choice possible. It is the same test as <a href="#/unit/2.2">2.2</a>, one level up.</p></div>',

      mistakes: [
        { t: 'Returning a generic failure status',
          d: '"Search unavailable" hides the type, the attempt and any partial results, so the coordinator ' +
             'cannot choose a recovery.' },
        { t: 'Returning empty results marked successful',
          d: 'The most dangerous option: it converts a recoverable failure into silently incomplete ' +
             'output that nothing will ever flag.' },
        { t: 'Terminating the workflow on a single subagent failure',
          d: 'Discards every successful result. Degrade gracefully — keep what worked and annotate the ' +
             'gap.' },
        { t: 'Discarding partial results on failure',
          d: 'Four sources are worth more than none, and the coordinator may judge them sufficient.' },
        { t: 'Retrying without reporting what was attempted',
          d: 'Local recovery is right; a contextless report is not. Without the attempted query, the ' +
             'coordinator can only repeat what already failed.' },
        { t: 'Unbounded retries inside a subagent',
          d: 'Burns latency invisibly and denies the coordinator the chance to try a different approach.' },
        { t: 'Encoding "failed" and "found nothing" identically',
          d: 'They demand opposite responses. Keep access failures distinct from valid empty results ' +
             '(<a href="#/unit/2.2">2.2</a>).' },
        { t: 'Shipping a thin section with no coverage annotation',
          d: 'A confident-looking gap misleads the reader. Annotate which findings are well-supported and ' +
             'which areas have gaps, at the point of use.' }
      ],

      exam:
      '<p>Official sample question 8 is here, and the four options map exactly onto the four strategies ' +
      'above: structured context (correct), retry-then-generic-status, empty-as-success, and ' +
      'terminate-the-workflow. Learn why each wrong one is wrong — the generic status hides context, ' +
      'empty-as-success prevents any recovery and risks incomplete output, and termination is unnecessary ' +
      'when recovery strategies exist. Expect coverage annotation to appear as a supporting option, and ' +
      'note that it overlaps with <a href="#/unit/5.6">5.6</a>.</p>',

      questions: [
        {
          id: 'q5.3.1', scn: 3, official: true,
          stem: '<p>The web search subagent times out while researching a complex topic. You need to design ' +
            'how this failure information flows back to the coordinator agent. Which error propagation ' +
            'approach best enables intelligent recovery?</p>',
          opts: [
            'Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches.',
            'Implement automatic retry logic with exponential backoff within the subagent, returning a generic "search unavailable" status only after all retries are exhausted.',
            'Catch the timeout within the subagent and return an empty result set marked as successful.',
            'Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow.'
          ],
          ans: [0],
          why: 'Structured error context gives the coordinator the information it needs to make ' +
            'intelligent recovery decisions — whether to retry with a modified query, try an alternative ' +
            'approach, or proceed with partial results. Each element maps to a decision the coordinator ' +
            'must make.',
          wrong: [
            '',
            'The local retry is sound, but the generic status hides valuable context from the coordinator, ' +
            'preventing informed decisions. It cannot tell that a timeout occurred, what was queried, or ' +
            'that partial results exist.',
            'This suppresses the error by marking failure as success, which prevents any recovery and ' +
            'risks incomplete research outputs. Nothing downstream has any reason to suspect a topic is ' +
            'missing.',
            'Terminates the entire workflow unnecessarily when recovery strategies could succeed, ' +
            'discarding every other subagent\'s completed work.'
          ]
        },
        {
          id: 'q5.3.2', scn: 3,
          stem: '<p>Two of your twelve research subtopics failed after local retries were exhausted. The ' +
            'other ten produced good results. What should the final report do?</p>',
          opts: [
            'Present the ten complete sections and include the two affected sections with explicit coverage annotations stating what is missing and why.',
            'Present only the ten complete sections, omitting the two that could not be researched to avoid presenting substandard material.',
            'Delay the report and retry the two failing subtopics until they succeed, so the deliverable is complete.',
            'Present all twelve sections uniformly, since noting internal system failures in a client-facing report undermines confidence in the analysis.'
          ],
          ans: [0],
          why: 'This is graceful degradation: preserve the value of what worked while being transparent ' +
            'about gaps. The annotation belongs next to the affected material so a reader of that section ' +
            'sees the caveat, rather than treating a thin section as a complete one.',
          wrong: [
            '',
            'Silent omission is the same failure as returning empty results as success — the reader cannot ' +
            'tell whether a topic was investigated and found irrelevant, or never investigated at all.',
            'Retrying indefinitely for failures that have already exhausted local recovery is unlikely to ' +
            'converge and blocks a report that is 83% complete and useful now.',
            'Presenting a two-source section as though it were as well-supported as a twelve-source one is ' +
            'the misleading option. Transparency about coverage is what lets a reader weight the ' +
            'conclusions correctly.'
          ]
        },
        {
          id: 'q5.3.3', scn: 1,
          stem: '<p>Your document analysis subagent hits an intermittent gateway error on one document. ' +
            'Which propagation behaviour follows the guide\'s recommended pattern?</p>',
          opts: [
            'Attempt local recovery once or twice inside the subagent, and propagate to the coordinator only if it remains unresolved, including what was attempted and any partial results.',
            'Propagate the error to the coordinator immediately, since the coordinator has the broadest view and should own all recovery decisions.',
            'Retry inside the subagent until it succeeds, since an intermittent error will eventually clear and the coordinator need never know.',
            'Return the successfully analysed documents and record the failure in a log the coordinator can inspect if it chooses.'
          ],
          ans: [0],
          why: 'The pattern is local recovery for transient failures, propagating only what cannot be ' +
            'resolved locally, with attempt detail and partial results attached. Bounded local retries ' +
            'handle the common case invisibly; anything persistent becomes the coordinator\'s decision ' +
            'with enough context to make it.',
          wrong: [
            '',
            'Immediate propagation of every transient blip makes the coordinator handle noise that the ' +
            'subagent could absorb, adding round trips for failures that a single retry would have ' +
            'cleared.',
            'Unbounded retries inside a subagent is a named anti-pattern: latency burns invisibly while ' +
            'the coordinator waits, and "eventually clear" is an assumption that may be false.',
            'A side log the coordinator must think to consult is not propagation. The failure needs to ' +
            'arrive in the response, where the recovery decision is being made.'
          ]
        },
        {
          id: 'q5.3.4', scn: 3,
          stem: '<p>Which elements should a propagated subagent error carry to enable coordinator ' +
            'recovery?</p>',
          opts: [
            'The failure type, distinguishing a timeout from an invalid query or a permission problem.',
            'What was attempted, so the coordinator can construct a genuinely different next attempt rather than repeating the same one.',
            'Any partial results gathered before the failure, so they are not discarded.',
            'The subagent\'s full reasoning trace, so the coordinator can audit how it arrived at the failing query.'
          ],
          ans: [0, 1, 2],
          why: 'The guide names failure type, what was attempted, partial results and potential ' +
            'alternatives. Each supports a specific coordinator decision: whether retry is plausible, what ' +
            'not to repeat, and whether there is enough to proceed with.',
          wrong: [
            '', '', '',
            'A full reasoning trace is bulk that consumes the coordinator\'s context without supporting ' +
            'the recovery decision — the same problem as passing verbose reasoning chains between agents ' +
            '(<a href="#/unit/5.1">5.1</a>). The attempted query is the actionable summary of it.'
          ]
        },
        {
          id: 'q5.3.5', scn: 3,
          stem: '<p>A code reviewer argues that having subagents return empty results on failure is ' +
            'acceptable because "the coordinator can detect a missing subtopic by comparing the result ' +
            'count against the number of subtasks it dispatched". How should you respond?</p>',
          opts: [
            'Reject it: an empty result marked successful is indistinguishable from a genuine finding of nothing relevant, so the coordinator cannot tell a failure from a legitimate null result.',
            'Accept it, provided the coordinator implements the count comparison, since that recovers the missing signal at no cost to the subagent.',
            'Accept it for search subagents only, where an empty result plausibly means nothing was found, but reject it for document analysis.',
            'Reject it, and require subagents instead to raise an exception so the workflow terminates and the failure cannot be missed.'
          ],
          ans: [0],
          why: 'The count comparison detects only that a subtask returned nothing — not why. A search that ' +
            'genuinely found nothing relevant and a search that timed out both produce an empty set, and ' +
            'they demand opposite responses. Keeping access failures distinct from valid empty results is ' +
            'the discipline that makes recovery possible at all.',
          wrong: [
            '',
            'It is not free: the coordinator gains a count discrepancy but no failure type, no attempted ' +
            'query and no partial results, so it cannot choose between retrying, rerouting and proceeding. ' +
            'It also relies on an inference nobody may implement.',
            'The ambiguity is worst precisely for search, where "found nothing" is a common and legitimate ' +
            'outcome. Splitting the convention by subagent type adds inconsistency without removing the ' +
            'problem.',
            'Correct to reject, wrong on the remedy: terminating the workflow on a single failure is the ' +
            'other named anti-pattern and discards every successful result.'
          ]
        }
      ]
    },

    /* ================================================================== 5.4 */
    {
      id: '5.4',
      short: 'Context in codebase exploration',
      title: 'Manage context effectively in large codebase exploration',
      scn: [4, 2],
      tldr: 'Long exploration sessions degrade in a recognisable way: the agent starts referring to ' +
        '"typical patterns" instead of the specific classes it found earlier, and contradicts its own ' +
        'findings. Four techniques. <b>Scratchpad files</b> persist key findings across context ' +
        'boundaries. <b>Subagent delegation</b> keeps verbose exploration out of the main context. ' +
        '<b>Phase summaries</b> get injected into the next phase\'s initial context. <b>Structured state ' +
        'exports plus a manifest</b> make crash recovery possible without redoing everything. ' +
        '<code>/compact</code> is a legitimate tool here.',

      concept:
      '<h3>Recognising context degradation</h3>' +
      '<p>It does not announce itself as an error. The symptoms are behavioural, and the guide names them ' +
      'precisely:</p>' +
      '<ul>' +
      '<li>The agent gives <b>inconsistent answers</b> to questions it answered differently earlier.</li>' +
      '<li>It references <b>"typical patterns"</b> or "commonly you would see" instead of the specific ' +
      'classes and files it actually discovered. This is the clearest tell — generic knowledge has ' +
      'replaced session-specific findings.</li>' +
      '<li>It re-reads files it has already read.</li>' +
      '<li>It contradicts decisions made earlier in the same session.</li>' +
      '</ul>' +
      '<p>The instinct is to blame the model. The cause is that the specific findings have been crowded ' +
      'out or compressed away, leaving only what the model knows in general.</p>' +

      '<h3>Scratchpad files</h3>' +
      '<p>The simplest and most durable technique: have the agent <b>write key findings to a file</b> as it ' +
      'goes, and reference that file for subsequent questions. The findings then live outside the context ' +
      'window entirely, and survive compaction, a new session, or a crash.</p>' +
      '<pre><code># .scratch/refund-flow.md — written by the agent as it explores\n\n' +
      '## Entry points\n' +
      '- POST /api/refunds        → api/handlers/refund.py:34  handle_refund()\n' +
      '- admin action "refund"    → admin/actions.py:112       admin_refund()\n' +
      '\n' +
      '## Call path (verified by reading, not inferred)\n' +
      'handle_refund → RefundService.create (services/refund.py:88)\n' +
      '  → RefundGateway.charge (gateways/refund.py:20)\n' +
      '  → ledger.post (billing/ledger.py:301)\n' +
      '\n' +
      '## Findings\n' +
      '- Idempotency key required by RefundGateway; handle_refund does NOT\n' +
      '  supply one → duplicate-refund risk. (gateways/refund.py:26)\n' +
      '- Two refund paths do not share validation: admin_refund skips the\n' +
      '  $500 ceiling check entirely.\n' +
      '\n' +
      '## Open questions\n' +
      '- Does ledger.post roll back if the gateway later fails? Not yet traced.</code></pre>' +
      '<p>Note the discipline in "verified by reading, not inferred". A scratchpad that mixes confirmed ' +
      'findings with guesses is worse than none, because later phases treat all of it as established.</p>' +

      '<h3>Subagent delegation for exploration</h3>' +
      '<p>The main agent should coordinate; verbose discovery belongs elsewhere. Spawn a subagent for a ' +
      'specific question — "find all test files for the billing module", "trace the dependencies of the ' +
      'refund flow" — and let it return a summary. Hundreds of lines of Glob and Grep output stay in the ' +
      'subagent\'s context; the main agent receives the answer.</p>' +
      '<p>This is the same isolation principle as <code>context: fork</code> ' +
      '(<a href="#/unit/3.2">3.2</a>) and the Explore subagent (<a href="#/unit/3.4">3.4</a>). Three ' +
      'mechanisms, one idea: <b>generate detail where it is needed and pass forward only the ' +
      'conclusion</b>.</p>' +

      fig({
        vb: '0 0 700 250',
        caption: 'Four mechanisms for surviving a long exploration. All of them move detail out of the ' +
          'main context and keep only what the next step needs.',
        body:
          '<rect x="24" y="20" width="150" height="52" rx="6" class="boxA"/>' +
          '<text x="99" y="40" text-anchor="middle" font-size="10.5" font-weight="600">scratchpad file</text>' +
          '<text x="99" y="56" text-anchor="middle" font-size="9.5" class="dim">findings outlive</text>' +
          '<text x="99" y="68" text-anchor="middle" font-size="9.5" class="dim">the window</text>' +

          '<rect x="190" y="20" width="150" height="52" rx="6" class="boxA"/>' +
          '<text x="265" y="40" text-anchor="middle" font-size="10.5" font-weight="600">subagent</text>' +
          '<text x="265" y="56" text-anchor="middle" font-size="9.5" class="dim">verbose discovery</text>' +
          '<text x="265" y="68" text-anchor="middle" font-size="9.5" class="dim">stays isolated</text>' +

          '<rect x="356" y="20" width="150" height="52" rx="6" class="boxA"/>' +
          '<text x="431" y="40" text-anchor="middle" font-size="10.5" font-weight="600">phase summary</text>' +
          '<text x="431" y="56" text-anchor="middle" font-size="9.5" class="dim">injected into the</text>' +
          '<text x="431" y="68" text-anchor="middle" font-size="9.5" class="dim">next phase</text>' +

          '<rect x="522" y="20" width="154" height="52" rx="6" class="boxA"/>' +
          '<text x="599" y="40" text-anchor="middle" font-size="10.5" font-weight="600">state + manifest</text>' +
          '<text x="599" y="56" text-anchor="middle" font-size="9.5" class="dim">crash recovery</text>' +
          '<text x="599" y="68" text-anchor="middle" font-size="9.5" class="dim">without redoing all</text>' +

          '<line x1="24" y1="94" x2="676" y2="94" class="stroke dashed"/>' +

          '<text x="24" y="118" font-size="11" font-weight="600">Phased exploration with summary injection</text>' +
          '<rect x="24" y="130" width="140" height="42" rx="5" class="box"/>' +
          '<text x="94" y="147" text-anchor="middle" font-size="10">phase 1: map</text>' +
          '<text x="94" y="162" text-anchor="middle" font-size="9" class="dim">structure</text>' +
          '<path class="arrow" d="M164 151 L206 151" marker-end="url(#ah)"/>' +
          '<text x="185" y="143" text-anchor="middle" font-size="8.5" class="dim">summary</text>' +
          '<rect x="206" y="130" width="140" height="42" rx="5" class="box"/>' +
          '<text x="276" y="147" text-anchor="middle" font-size="10">phase 2: trace</text>' +
          '<text x="276" y="162" text-anchor="middle" font-size="9" class="dim">refund flow</text>' +
          '<path class="arrow" d="M346 151 L388 151" marker-end="url(#ah)"/>' +
          '<text x="367" y="143" text-anchor="middle" font-size="8.5" class="dim">summary</text>' +
          '<rect x="388" y="130" width="140" height="42" rx="5" class="box"/>' +
          '<text x="458" y="147" text-anchor="middle" font-size="10">phase 3: assess</text>' +
          '<text x="458" y="162" text-anchor="middle" font-size="9" class="dim">test coverage</text>' +
          '<path class="arrow" d="M528 151 L570 151" marker-end="url(#ah)"/>' +
          '<rect x="570" y="130" width="106" height="42" rx="5" class="boxOk"/>' +
          '<text x="623" y="155" text-anchor="middle" font-size="10">plan</text>' +

          '<rect x="24" y="192" width="652" height="46" rx="6" class="box"/>' +
          '<text x="40" y="212" font-size="10.5" font-weight="600">Each phase starts with the prior phase\'s conclusions, not its raw exploration output.</text>' +
          '<text x="40" y="229" font-size="10.5" class="dim">Phase 3 never sees phase 1\'s file listings — only what phase 1 concluded.</text>'
      }) +

      '<h3>Summarise between phases</h3>' +
      '<p>For multi-phase work, summarise the key findings of one phase <b>before</b> spawning the agents ' +
      'for the next, and inject that summary as the next phase\'s initial context. Phase 3 needs phase 1\'s ' +
      '<em>conclusions</em>, never its raw Glob output.</p>' +
      '<p>This is the same structured-state-injection pattern as starting a fresh session in ' +
      '<a href="#/unit/1.7">1.7</a>, applied between phases rather than between sessions.</p>' +

      '<h3>Crash recovery: state exports and a manifest</h3>' +
      '<p>For long-running multi-agent work, each agent <b>exports its state to a known location</b>, and ' +
      'the coordinator loads a <b>manifest</b> on resume and injects the relevant state into agent ' +
      'prompts.</p>' +
      '<pre><code>agent-state/manifest.json\n{\n' +
      '  "web-search":    "completed",\n' +
      '  "doc-analysis":  "in_progress",\n' +
      '  "synthesis":     "not_started",\n' +
      '  "report":        "not_started"\n}\n\n' +
      'agent-state/web-search-agent.json\n{\n' +
      '  "status": "completed",\n' +
      '  "queries_executed": ["…", "…"],\n' +
      '  "key_findings":     [ …structured claim records… ],\n' +
      '  "coverage":         ["music", "film"],\n' +
      '  "gaps":             ["writing — trade press timed out"]\n}</code></pre>' +
      '<p>On resume the coordinator reads the manifest, sees that web search is done and document analysis ' +
      'was interrupted, and restarts only what is unfinished — injecting the completed agent\'s findings ' +
      'rather than re-running its searches.</p>' +

      '<div class="callout note"><span class="co-t"><code>/compact</code> is fine here</span>' +
      '<p>The guide lists <code>/compact</code> as a legitimate technique for reducing context usage ' +
      'during extended exploration when the window has filled with verbose discovery output. Two caveats ' +
      'keep it from being the answer to everything: it is <b>indiscriminate</b> about what it compresses, ' +
      'so pair it with a scratchpad holding the findings you cannot afford to lose; and it does not help ' +
      'when the problem is <b>stale</b> context rather than voluminous context — that needs a fresh ' +
      'session with an injected summary (<a href="#/unit/1.7">1.7</a>).</p></div>',

      example:
      '<h3>Scenario 4 — a four-hour exploration that stops making sense</h3>' +
      '<p>Two hours into mapping a legacy service, the agent is asked which classes handle payment ' +
      'retries. It replies that "typically you would find a retry handler in a service layer or middleware ' +
      'component" — generic knowledge, not the <code>RetryPolicy</code> class it read ninety minutes ' +
      'earlier. Asked again about the refund path, it contradicts its earlier answer.</p>' +
      '<p>The restructured approach:</p>' +
      '<pre><code>Phase 1 — map the structure (delegated)\n' +
      '  Subagent: "List every module under src/, with its public entry\n' +
      '  points. Return a table only — no file contents."\n' +
      '  → main context receives a table, not 400 file listings\n' +
      '  → agent writes .scratch/module-map.md\n' +
      '\n' +
      'Phase 2 — trace the refund flow (delegated, summary injected)\n' +
      '  Subagent prompt opens with phase 1\'s conclusions:\n' +
      '    "Module map: [table]. Trace the refund flow from HTTP entry to\n' +
      '     ledger write. Record each hop with file:line."\n' +
      '  → agent appends findings to .scratch/refund-flow.md\n' +
      '\n' +
      'Phase 3 — assess test coverage (delegated)\n' +
      '  Subagent prompt opens with the refund-flow findings, NOT with\n' +
      '  phase 1 or 2 raw output.\n' +
      '  → appends to .scratch/coverage.md\n' +
      '\n' +
      'Throughout\n' +
      '  Main agent answers questions by reading .scratch/*.md, so a\n' +
      '  specific finding is always retrievable — even after /compact\n' +
      '  or in a brand-new session tomorrow.</code></pre>' +
      '<p>The "typical patterns" symptom disappears, because the specific finding is no longer competing ' +
      'for window space. It is on disk, and the agent knows where.</p>' +

      '<h3>And when the run dies at hour three</h3>' +
      '<pre><code>$ cat agent-state/manifest.json\n{ "module-map": "completed",\n  "refund-trace": "completed",\n' +
      '  "coverage-assessment": "in_progress",\n  "plan": "not_started" }\n\n' +
      '# Resume: reload the two completed states, restart only the\n' +
      '# coverage assessment. Two hours of work preserved.</code></pre>' +
      '<p>Without the manifest, the alternatives are re-running everything or guessing how far it got — ' +
      'and guessing wrong in either direction is expensive.</p>',

      mistakes: [
        { t: 'Missing the "typical patterns" tell',
          d: 'When an agent describes what code usually looks like instead of what it found, ' +
             'session-specific findings have been crowded out. That is degradation, not vagueness.' },
        { t: 'Running verbose exploration in the main context',
          d: 'Delegate discovery to a subagent and receive a summary; hundreds of lines of Grep output do ' +
             'not belong in the coordinating context.' },
        { t: 'Keeping findings only in conversation',
          d: 'They vanish with compaction, a crash or a new session. Write them to a scratchpad file.' },
        { t: 'Mixing verified findings with inferences in a scratchpad',
          d: 'Later phases treat everything in the file as established. Mark what was confirmed by ' +
             'reading.' },
        { t: 'Passing raw output between phases',
          d: 'Summarise each phase\'s conclusions and inject the summary. Phase 3 does not need phase 1\'s ' +
             'file listings.' },
        { t: 'No state export for long multi-agent runs',
          d: 'A crash then means redoing everything. Export per-agent state and a manifest so resume ' +
             'restarts only what is unfinished.' },
        { t: 'Treating <code>/compact</code> as a complete solution',
          d: 'Legitimate for voluminous context, indiscriminate about what it drops, and no help at all ' +
             'when the context is stale rather than large.' },
        { t: 'Reaching for a bigger context window',
          d: 'Postpones degradation without addressing it, and pays for irrelevant discovery output on ' +
             'every turn.' }
      ],

      exam:
      '<p>Expect an item describing degradation symptoms — inconsistent answers, "typical patterns" ' +
      'instead of specific classes — and asking for the fix. Correct answers cluster around scratchpad ' +
      'files, subagent delegation for verbose exploration, and summarising between phases with injection ' +
      'into the next. The distractors are a larger context window and "continue and hope". Expect crash ' +
      'recovery via structured state exports and a manifest to appear at least as an option, and note that ' +
      '<code>/compact</code> is a <em>legitimate</em> answer in this task statement even though it is a ' +
      'distractor elsewhere.</p>',

      questions: [
        {
          id: 'q5.4.1', scn: 4,
          stem: '<p>Two hours into exploring a large legacy service, your agent begins answering questions ' +
            'about specific classes by describing "typical patterns you would expect to find", and gives ' +
            'an answer about the refund path that contradicts one it gave earlier. What is happening, and ' +
            'what is the most effective response?</p>',
          opts: [
            'Context degradation: session-specific findings have been crowded out by accumulated exploration output. Have the agent maintain a scratchpad file of key findings and reference it for subsequent questions.',
            'The model is reaching the limits of its reasoning ability on a codebase this size; switch to a more capable model for the remainder of the exploration.',
            'The agent has misunderstood the task; restate the objective and instruct it to answer only from files it has actually read.',
            'The exploration has covered too many modules; narrow the scope to one module at a time and accept that a whole-service picture is not achievable.'
          ],
          ans: [0],
          why: 'Describing typical patterns rather than discovered specifics is the signature of context ' +
            'degradation — generic knowledge has replaced session findings. A scratchpad moves those ' +
            'findings out of the window entirely, so they remain retrievable regardless of what the ' +
            'conversation does.',
          wrong: [
            '',
            'Capability is not the constraint. The agent found <code>RetryPolicy</code> earlier and could ' +
            'reason about it; the problem is that the finding is no longer reliably available.',
            'The agent is not confused about the task. An instruction cannot restore findings that have ' +
            'been compressed away, and it will simply describe typical patterns again.',
            'Narrowing scope avoids the symptom by doing less. The techniques for surviving a long ' +
            'exploration — scratchpads, delegation, phase summaries — exist so that the whole-service ' +
            'picture remains achievable.'
          ]
        },
        {
          id: 'q5.4.2', scn: 4,
          stem: '<p>You need to answer several specific questions about a codebase — "find all test files ' +
            'for the billing module", "trace the refund flow dependencies" — each of which generates ' +
            'hundreds of lines of search output. How should this be structured?</p>',
          opts: [
            'Spawn a subagent per question, letting each return a summary while the main agent retains high-level coordination.',
            'Run each investigation in the main agent sequentially, using <code>/compact</code> after each one to reclaim the space.',
            'Run all the investigations in the main agent, then summarise the combined output once at the end.',
            'Run each investigation in a separate top-level session and manually collate the answers afterwards.'
          ],
          ans: [0],
          why: 'Delegating specific investigations to subagents keeps verbose exploration output isolated ' +
            'while the main agent preserves the high-level picture — the guide\'s stated approach, and the ' +
            'same isolation principle as <code>context: fork</code> and the Explore subagent.',
          wrong: [
            '',
            'Workable but inferior: the verbose output still enters the main context before being ' +
            'compacted, and compaction is indiscriminate about what it drops from the coordinating ' +
            'picture.',
            'This maximises the problem — all the raw output accumulates before anything is compressed, ' +
            'which is precisely how degradation sets in.',
            'Separate sessions lose the shared coordinating context, and manual collation forfeits the ' +
            'main agent\'s ability to reason across the answers.'
          ]
        },
        {
          id: 'q5.4.3', scn: 3,
          stem: '<p>A long-running multi-agent analysis crashes after three hours, with two of four agents ' +
            'having completed their work. What design would have allowed recovery without redoing ' +
            'everything?</p>',
          opts: [
            'Each agent exports its state to a known location, and the coordinator loads a manifest on resume to identify what completed and inject those findings into the remaining agents\' prompts.',
            'The coordinator writes a running transcript of all agent output to disk, which can be replayed into a new session after a crash.',
            'Each agent runs inside a session that can be resumed by name, so the workflow continues from wherever each agent stopped.',
            'The coordinator checkpoints its own conversation history periodically, so the entire workflow can be restored from the most recent checkpoint.'
          ],
          ans: [0],
          why: 'Structured per-agent state exports plus a manifest let the coordinator see exactly which ' +
            'agents completed and restart only what is unfinished, injecting completed findings rather ' +
            'than re-deriving them. That is the guide\'s crash-recovery pattern.',
          wrong: [
            '',
            'A raw transcript is bulky and unstructured, so replaying it consumes context on exploration ' +
            'detail rather than conclusions — and it does not tell the coordinator which agents finished.',
            'Session resumption helps a single interactive session continue, but it does not give the ' +
            'coordinator a view of which agents completed, and resuming an interrupted agent\'s session ' +
            'may restore stale tool results (<a href="#/unit/1.7">1.7</a>).',
            'Checkpointing the coordinator\'s conversation preserves the orchestration narrative, not the ' +
            'subagents\' findings, which is the expensive part to lose.'
          ]
        },
        {
          id: 'q5.4.4', scn: 4,
          stem: '<p>You are running a three-phase exploration: map the structure, then trace a specific ' +
            'flow, then assess test coverage. What should be passed from each phase to the next?</p>',
          opts: [
            'A summary of the phase\'s key findings and conclusions, injected as the next phase\'s initial context.',
            'The complete raw output of the phase, so no detail is lost and the next phase can re-derive anything it needs.',
            'Nothing — each phase should explore independently so that its conclusions are not anchored by earlier assumptions.',
            'The list of files each phase read, so the next phase can re-read whichever ones it needs.'
          ],
          ans: [0],
          why: 'Summarising key findings before spawning the next phase\'s agents, and injecting that ' +
            'summary as initial context, is the guide\'s stated approach. The next phase needs the ' +
            'conclusions, not the exploration that produced them.',
          wrong: [
            '',
            'Passing raw output forward accumulates every phase\'s discovery noise, which is exactly how ' +
            'the window fills and degradation sets in.',
            'Independence is valuable when comparing approaches (<a href="#/unit/1.7">1.7</a>), but ' +
            'sequential phases genuinely depend on each other — phase 3 cannot assess coverage of a flow ' +
            'phase 2 has not told it about.',
            'A file list forces the next phase to re-read and re-derive, paying twice for the same ' +
            'understanding.'
          ]
        },
        {
          id: 'q5.4.5', scn: 4,
          stem: '<p>Which statements about <code>/compact</code> during extended exploration are ' +
            'correct?</p>',
          opts: [
            'It is a legitimate way to reduce context usage when the window has filled with verbose discovery output.',
            'Because it compresses indiscriminately, it should be paired with a scratchpad file holding findings you cannot afford to lose.',
            'It is the appropriate remedy when prior tool results have become stale because files changed on disk.',
            'It restores specific findings that were previously compressed out of the conversation.'
          ],
          ans: [0, 1],
          why: 'The guide lists <code>/compact</code> as a legitimate technique for reducing context usage ' +
            'during extended exploration. Its limitation is that it cannot know which details are ' +
            'load-bearing, which is exactly why durable findings belong in a file.',
          wrong: [
            '', '',
            'Staleness is a different problem: compaction produces a condensed but still-wrong picture. ' +
            'Stale tool results call for a fresh session with an injected summary ' +
            '(<a href="#/unit/1.7">1.7</a>).',
            'Compaction only ever removes information. Nothing it does can recover a finding that has ' +
            'already been compressed away — which is the argument for persisting findings externally as ' +
            'you go.'
          ]
        }
      ]
    },

    /* ================================================================== 5.5 */
    {
      id: '5.5',
      short: 'Human review & confidence calibration',
      title: 'Design human review workflows and confidence calibration',
      scn: [6],
      tldr: 'Two ideas that together answer "is it safe to reduce human review?" First, <b>aggregate ' +
        'accuracy hides segment failures</b> — 97% overall can conceal 99% on standard documents and 60% ' +
        'on one subtype, so analyse <b>by document type and by field</b> before automating anything. ' +
        'Second, <b>confidence scores are only usable once calibrated against labelled validation ' +
        'data</b>; an uncalibrated 0.9 has no known relationship to 90% accuracy. Monitor with ' +
        '<b>stratified random sampling</b>, and route low-confidence or ambiguous documents to humans.',

      concept:
      '<h3>Why an aggregate number is not an answer</h3>' +
      '<p>A CISO asks whether 97% overall extraction accuracy is good enough to cut human review. The ' +
      'honest answer is that <b>the number does not contain the information needed to decide</b>.</p>' +
      '<p>97% overall is consistent with all of these:</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Segment</th><th>Share of volume</th><th>Accuracy</th>' +
      '<th>Implication</th></tr></thead><tbody>' +
      '<tr><td>Standard supplier invoices</td><td>82%</td><td>99.4%</td><td>Safe to automate</td></tr>' +
      '<tr><td>Multi-currency invoices</td><td>11%</td><td>96%</td><td>Probably fine, monitor</td></tr>' +
      '<tr><td>Handwritten delivery notes</td><td>5%</td><td><b>61%</b></td><td><b>Must stay under ' +
      'review</b></td></tr>' +
      '<tr><td>Scanned faxes (new type)</td><td>2%</td><td><b>44%</b></td><td><b>Must stay under ' +
      'review</b></td></tr>' +
      '</tbody></table></div>' +
      '<p>The weighted average is about 97%. Automating on that number would push a 44%-accurate segment ' +
      'straight through, and the volume is small enough that it barely dents the aggregate while producing ' +
      'a steady stream of wrong data.</p>' +
      '<p>The same applies <b>field by field</b>: 99% on most fields and 50% on <code>payment_terms</code> ' +
      'still averages well, and every downstream consumer of payment terms is being misled half the ' +
      'time.</p>' +
      '<div class="callout rule"><span class="co-t">The answer to "is 97% enough?"</span>' +
      '<p><b>Analyse accuracy by document type and by field first.</b> Automate the segments that clear ' +
      'your bar; keep review on the ones that do not. An aggregate can only tell you the average of things ' +
      'you should be treating differently.</p></div>' +

      fig({
        vb: '0 0 700 220',
        caption: 'One aggregate, four very different segments. Automating on the average exposes the ' +
          'weakest segment completely.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Aggregate: 97%</text>' +
          '<rect x="24" y="28" width="600" height="26" rx="5" class="boxOk"/>' +
          '<text x="324" y="46" text-anchor="middle" font-size="10.5">looks safe to automate</text>' +
          '<text x="636" y="46" font-size="10" class="dim">← one number</text>' +

          '<text x="24" y="82" font-size="11" font-weight="600">Segmented</text>' +
          (function () {
            var rows = [
              ['standard invoices', 82, 99.4, 'boxOk'],
              ['multi-currency', 11, 96, 'boxOk'],
              ['handwritten notes', 5, 61, 'boxBad'],
              ['scanned faxes (new)', 2, 44, 'boxBad']
            ];
            var s = '', y = 92;
            rows.forEach(function (r) {
              var w = Math.max(40, (r[2] / 100) * 420);
              s += '<text x="24" y="' + (y + 15) + '" font-size="10">' + r[0] + '</text>';
              s += '<rect x="180" y="' + y + '" width="' + w.toFixed(0) + '" height="20" rx="4" class="' + r[3] + '"/>';
              s += '<text x="' + (186 + w).toFixed(0) + '" y="' + (y + 15) + '" font-size="10" class="dim">' +
                   r[2] + '%  ·  ' + r[1] + '% of volume</text>';
              y += 28;
            });
            return s;
          })() +
          '<text x="24" y="212" font-size="10.5" style="fill:var(--bad)">The 7% of volume that fails badly is invisible in the aggregate — and it is where the harm is.</text>'
      }) +

      '<h3>Calibrating confidence</h3>' +
      '<p>Having the model emit field-level confidence is useful. Using those numbers as thresholds ' +
      '<b>before calibration</b> is not, because nothing establishes that 0.9 means 90%.</p>' +
      '<p>Calibration is a measurement procedure, not an assumption:</p>' +
      '<ol>' +
      '<li>Assemble a <b>labelled validation set</b> — documents whose correct extractions are known, ' +
      'covering every document type.</li>' +
      '<li>Run extraction and record each field\'s confidence alongside whether it was actually ' +
      'correct.</li>' +
      '<li>Bucket by confidence and compute the <b>observed</b> accuracy in each bucket.</li>' +
      '<li>Set thresholds from the measured error rates — and separately per segment, since a bucket can ' +
      'behave differently on handwritten notes than on clean PDFs.</li>' +
      '</ol>' +
      '<pre><code>confidence bucket   n     observed accuracy\n  0.95 – 1.00      2,140    99.1%     → auto-accept\n' +
      '  0.85 – 0.95      1,006    94.8%     → auto-accept (above the 94% bar)\n' +
      '  0.70 – 0.85        612    88.2%     → human review\n' +
      '  below 0.70         244    71.5%     → human review\n' +
      '\n' +
      'Note: within the 0.85–0.95 bucket, handwritten notes ran at 76%.\n' +
      'Segment before you threshold, or you re-hide the same problem.</code></pre>' +
      '<p>Now a threshold means something: "0.85 corresponds to roughly 95% observed accuracy on clean ' +
      'documents". Without the table, 0.85 is a number the model produced about itself.</p>' +

      '<div class="callout note"><span class="co-t">Reconciling the warnings</span>' +
      '<p>Elsewhere this site says self-reported confidence is unreliable — for escalation routing ' +
      '(<a href="#/unit/5.2">5.2</a>) and for filtering review findings ' +
      '(<a href="#/unit/4.1">4.1</a>). All consistent. Confidence is illegitimate as an <b>unvalidated ' +
      'threshold</b> and legitimate as a <b>measured, supplementary signal</b> once you have established ' +
      'what its values correspond to. The word that separates the two cases is <em>calibrated</em>.</p></div>' +

      '<h3>Stratified sampling for ongoing monitoring</h3>' +
      '<p>Calibration is a snapshot; documents change. Sample continuously — and sample ' +
      '<b>stratified</b>, with proportional representation of each document type.</p>' +
      '<p>A simple random sample of 100 from a corpus that is 82% standard invoices draws about 82 standard ' +
      'invoices and perhaps two of the new fax type. You cannot measure a segment from two observations, ' +
      'so a new type can degrade badly for weeks while your monitoring reports everything fine. Stratify ' +
      'and you deliberately draw enough of each type — <b>especially types that recently entered the ' +
      'corpus</b> — to detect a problem in it.</p>' +
      '<p>The guide also frames sampling of <b>high-confidence</b> extractions specifically, for two ' +
      'purposes: measuring the error rate in the population you have automated, and <b>detecting novel ' +
      'error patterns</b> — failures of a kind your validation set never contained.</p>' +

      '<h3>Routing to human review</h3>' +
      '<p>Reviewer capacity is finite, so route by expected value. Send to a human:</p>' +
      '<ul>' +
      '<li>Extractions with <b>low calibrated confidence</b></li>' +
      '<li>Documents whose source is <b>ambiguous or internally contradictory</b> — a stated total that ' +
      'disagrees with its own line items (<a href="#/unit/4.4">4.4</a>)</li>' +
      '<li>Document types whose <b>measured segment accuracy</b> is below your bar</li>' +
      '<li>Fields where <b>retry has already failed twice</b>, which signals the information is absent</li>' +
      '<li>Anything with an <code>"unclear"</code> enum value (<a href="#/unit/4.3">4.3</a>)</li>' +
      '</ul>' +
      '<p>Note that only the first of these involves confidence at all. The others are structural signals ' +
      'that do not depend on the model\'s self-assessment — which is exactly why they are the more ' +
      'dependable routing criteria.</p>',

      example:
      '<h3>Scenario 6 — answering the CISO properly</h3>' +
      '<p>"We are at 97% accuracy. Can we cut human review from 100% of documents to 20%?"</p>' +
      '<p>The wrong answers are "yes, 97% is above our 95% bar" and "no, 97% is not enough for financial ' +
      'data". Both treat one number as sufficient. The correct response is a segmentation:</p>' +
      '<pre><code>Step 1 — accuracy by document type\n' +
      '  standard invoices   99.4%   82% of volume    → automate\n' +
      '  multi-currency      96.0%   11%              → automate, monitor\n' +
      '  handwritten notes   61.0%    5%              → keep 100% review\n' +
      '  scanned faxes       44.0%    2%              → keep 100% review\n' +
      '\n' +
      'Step 2 — accuracy by field, within the automatable types\n' +
      '  vendor_name        99.6%   → automate\n' +
      '  invoice_total      99.1%   → automate\n' +
      '  line_items         97.8%   → automate\n' +
      '  payment_terms      52.0%   → ALWAYS review this field, even on\n' +
      '                                document types we automate\n' +
      '\n' +
      'Step 3 — the resulting policy\n' +
      '  · Automate standard + multi-currency invoices, EXCEPT the\n' +
      '    payment_terms field, which is reviewed on every document.\n' +
      '  · Keep 100% review on handwritten notes and scanned faxes.\n' +
      '  · Route anything with conflict_detected or low calibrated\n' +
      '    confidence to review regardless of type.\n' +
      '  · Effective review rate: ~14% of documents, plus one field on\n' +
      '    the rest — better than the 20% target, and safe, which the\n' +
      '    aggregate could not have told us.</code></pre>' +
      '<p>The field-level finding is the one the aggregate most thoroughly buried. ' +
      '<code>payment_terms</code> at 52% would have gone straight through on a document-type-only ' +
      'analysis, because the types it appears on are the accurate ones.</p>' +

      '<h3>Ongoing monitoring, stratified</h3>' +
      '<pre><code>Weekly sample: 200 documents, stratified — not simple random\n\n' +
      '  standard invoices     60   (down-weighted: well characterised)\n' +
      '  multi-currency        50\n' +
      '  handwritten notes     40   (over-weighted: known weak)\n' +
      '  scanned faxes         50   (over-weighted: NEW type, unproven)\n' +
      '\n' +
      'Simple random sampling would have drawn ~4 faxes — too few to\n' +
      'measure. Stratified draws 50, so a regression in the newest and\n' +
      'least understood segment is detectable within one week.\n' +
      '\n' +
      'Sample specifically WITHIN high-confidence auto-accepted extractions\n' +
      'as well, to measure the error rate in the population nobody reviews\n' +
      'and to catch novel error patterns the validation set never held.</code></pre>' +

      '<div class="callout tip"><span class="co-t">The generalisable instinct</span>' +
      '<p>Whenever you are handed a single aggregate metric and asked to make a safety decision, ask ' +
      '<b>what is this the average of?</b> That question is the whole task statement.</p></div>',

      mistakes: [
        { t: 'Deciding on an aggregate accuracy figure',
          d: '97% overall can hide a 44% segment. Analyse by document type and by field before reducing ' +
             'review.' },
        { t: 'Segmenting by document type but not by field',
          d: 'A field at 52% inside otherwise accurate types goes straight through. Both cuts are ' +
             'needed.' },
        { t: 'Setting a confidence threshold without calibration',
          d: '0.9 has no established relationship to 90% accuracy. Measure observed accuracy per bucket ' +
             'against labelled data first.' },
        { t: 'Calibrating once, globally',
          d: 'A confidence bucket can behave differently per document type. Calibrate per segment, or you ' +
             're-hide the problem you segmented to find.' },
        { t: 'Monitoring with simple random sampling',
          d: 'Rare and new types are under-drawn, so a regression in them is undetectable. Stratify with ' +
             'proportional representation.' },
        { t: 'Not over-weighting newly arrived document types',
          d: 'They are the least characterised and most likely to fail. Sample them deliberately.' },
        { t: 'Sampling only what humans already review',
          d: 'The unmeasured population is the auto-accepted one. Sample high-confidence extractions to ' +
             'measure their true error rate and catch novel patterns.' },
        { t: 'Routing on confidence alone',
          d: 'Structural signals — internal contradiction, an <code>"unclear"</code> enum, repeated retry ' +
             'failure — are more dependable than the model\'s self-assessment.' }
      ],

      exam:
      '<p>The signature item is the aggregate-accuracy question: a stakeholder cites one overall figure ' +
      'and asks whether review can be reduced. The answer analyses accuracy <b>by document type and by ' +
      'field</b> first, because aggregates mask segment failures. Expect a confidence item whose correct ' +
      'option includes the word <b>calibrated</b> — thresholds set from measured error rates on a labelled ' +
      'validation set, not assumed. And expect <b>stratified</b> random sampling for ongoing monitoring, ' +
      'with proportional representation of each type and particular attention to newly added ones.</p>',

      questions: [
        {
          id: 'q5.5.1', scn: 6,
          stem: '<p>Your extraction system reports 97% overall accuracy. A stakeholder asks whether human ' +
            'review can be reduced from every document to a 20% sample. What is the appropriate ' +
            'response?</p>',
          opts: [
            'Analyse accuracy by document type and by field before deciding, since an aggregate figure can mask poor performance on specific segments.',
            'Proceed, since 97% exceeds the 95% threshold the business has agreed for automated processing.',
            'Decline, since financial document extraction should always retain complete human review regardless of measured accuracy.',
            'Proceed with a 20% sample but increase it to 40% for the first month, then reduce it if the observed error rate stays low.'
          ],
          ans: [0],
          why: 'An aggregate is the average of segments you may need to treat very differently. 97% ' +
            'overall is consistent with 99% on the dominant document type and 44% on a small, recently ' +
            'added one — and automating on the average would push that weak segment straight through. ' +
            'Segment by type and by field, then automate what clears your bar.',
          wrong: [
            '',
            'Compares the wrong number to the threshold. The aggregate says nothing about whether any ' +
            'particular segment meets it, and the segments are what you would be automating.',
            'Too absolute, and it forgoes real value: the analysis may well show that most standard ' +
            'documents can be safely automated while a small weak segment stays under review.',
            'A uniform sample rate cannot detect a segment problem: a 40% sample of a corpus dominated by ' +
            'accurate documents still barely touches the weak type, and the measured error rate stays ' +
            'reassuring while the harm continues.'
          ]
        },
        {
          id: 'q5.5.2', scn: 6,
          stem: '<p>Your team proposes having the model emit a field-level confidence score and ' +
            'auto-accepting anything above 0.9. What is the correct assessment?</p>',
          opts: [
            'Confidence can be a useful routing signal, but the threshold must be set from observed accuracy per confidence bucket measured against a labelled validation set — 0.9 does not inherently mean 90% accurate.',
            'Sound: 0.9 represents high model certainty, so auto-accepting above it is a reasonable balance of throughput and accuracy.',
            'Unsound: model self-reported confidence is meaningless and should play no part in a review workflow.',
            'Sound in principle, but the threshold should be raised to 0.98 to provide an adequate safety margin for financial data.'
          ],
          ans: [0],
          why: 'Confidence scores must be calibrated using labelled validation data before they can drive ' +
            'routing thresholds. Calibration measures the actual error rate at each confidence level, so ' +
            'the threshold reflects observed accuracy rather than an assumed correspondence between a ' +
            'score and a percentage.',
          wrong: [
            '',
            'Assumes the score is calibrated when nothing has established that. Observed accuracy above ' +
            '0.9 might be 99% or 82%, and only measurement distinguishes them.',
            'Too absolute. Confidence is legitimate as a supplementary signal once calibrated — the ' +
            'objection is to using it unvalidated, not to using it at all.',
            'Raising an uncalibrated threshold makes it more conservative, not more meaningful. Without ' +
            'measurement, 0.98 has no known relationship to accuracy either, and you discard throughput ' +
            'for a false sense of safety.'
          ]
        },
        {
          id: 'q5.5.3', scn: 6,
          stem: '<p>You sample 100 documents per week to monitor extraction quality. Your corpus is 80% ' +
            'standard invoices, and a new document type was introduced last month that now accounts for ' +
            '3% of volume. What sampling approach best detects problems?</p>',
          opts: [
            'Stratified random sampling with proportional representation of each document type, deliberately over-weighting the newly introduced type.',
            'Simple random sampling across the whole corpus, which gives each document an equal chance of selection and avoids bias.',
            'Sampling only the documents that human reviewers have already flagged as questionable, since those are where errors concentrate.',
            'Sampling the 100 documents with the lowest model confidence, since that is where errors are most likely to be found.'
          ],
          ans: [0],
          why: 'Simple random sampling would draw about three documents of the new type — far too few to ' +
            'measure anything. Stratified sampling deliberately draws enough of each type, and ' +
            'over-weighting a newly introduced type addresses the segment that is least characterised and ' +
            'most likely to be failing unnoticed.',
          wrong: [
            '',
            'Equal probability per document is not equal information per segment. It under-draws exactly ' +
            'the rare and new types where undetected problems live.',
            'Sampling only flagged documents measures the reviewers\' judgment, not the system\'s accuracy. ' +
            'The population you most need to measure is the one nobody reviews.',
            'Deliberately over-sampling low confidence inflates the observed error rate and tells you ' +
            'nothing about the high-confidence extractions being auto-accepted — which is the risk you ' +
            'are trying to quantify.'
          ]
        },
        {
          id: 'q5.5.4', scn: 6,
          stem: '<p>Your extraction is 99% accurate on nearly every field but 52% accurate on ' +
            '<code>payment_terms</code>, which appears mainly on the document types you have decided to ' +
            'automate. What review policy follows?</p>',
          opts: [
            'Automate those document types but route the <code>payment_terms</code> field to human review on every document, since review can be field-scoped rather than document-scoped.',
            'Keep those document types under full human review, since a field at 52% makes the whole extraction untrustworthy.',
            'Automate those document types and accept the field-level error rate, since the overall document accuracy remains high.',
            'Remove <code>payment_terms</code> from the schema, since a field extracted correctly only half the time provides no value.'
          ],
          ans: [0],
          why: 'Review does not have to be all-or-nothing per document. Field-level segmentation lets you ' +
            'automate the 99% fields and keep human attention on the one that needs it — which is the ' +
            'practical payoff of analysing accuracy by field rather than only by document type.',
          wrong: [
            '',
            'Discards the value of automating dozens of reliable fields because one is weak. Reviewer ' +
            'capacity is finite and this spends it on fields that do not need it.',
            'Passing a 52%-accurate field downstream means every consumer of payment terms is misled about ' +
            'half the time. High document-level accuracy does not make a specific wrong field harmless.',
            'The field is evidently wanted, or it would not be in the schema. Removing it converts a ' +
            'measurable quality problem into a silent capability gap.'
          ]
        },
        {
          id: 'q5.5.5', scn: 6,
          stem: '<p>Which extractions should be routed to human review, given finite reviewer ' +
            'capacity?</p>',
          opts: [
            'Documents whose source is internally contradictory — for example a stated total that disagrees with its own line items.',
            'Documents of a type whose measured segment accuracy falls below your acceptance bar.',
            'A random 20% of all extractions, so that review coverage is unbiased across the corpus.',
            'Every extraction where the model called any tool more than once, since repeated tool use indicates difficulty.'
          ],
          ans: [0, 1],
          why: 'Both are structural signals that do not depend on the model\'s self-assessment. An ' +
            'internal contradiction means the document or the extraction is unreliable regardless of ' +
            'confidence, and a segment measured below your bar is precisely the population automation ' +
            'should not cover.',
          wrong: [
            '', '',
            'A random slice is the right shape for <em>measurement</em> but the wrong basis for ' +
            '<em>routing</em>: it spends scarce reviewer time on documents that are almost certainly ' +
            'correct while letting known-risky ones through.',
            'Tool-call count is not a quality signal. A complex but correctly handled document may involve ' +
            'several calls, and a badly misread one may involve a single call.'
          ]
        }
      ]
    },

    /* ================================================================== 5.6 */
    {
      id: '5.6',
      short: 'Provenance & conflicting sources',
      title: 'Preserve information provenance and handle uncertainty in multi-source synthesis',
      scn: [3],
      tldr: 'Attribution is lost at <b>summarisation steps</b>, when findings are compressed without ' +
        'preserving claim-source mappings — so require upstream agents to emit <b>structured claim-source ' +
        'records</b> that downstream synthesis must carry through. When credible sources conflict, ' +
        '<b>present both with attribution and annotate the conflict explicitly</b>; never average, never ' +
        'silently pick one. Require <b>publication dates</b>, so a genuine change over time is not ' +
        'mistaken for a contradiction. And render content by type — tables for financial data, prose for ' +
        'analysis.',

      concept:
      '<h3>Where citations die</h3>' +
      '<p>A reviewer cannot find which source supports "AI adoption increased by 67%" in your report. The ' +
      'figure is real; the link is gone. It was lost at a <b>summarisation step</b> — some agent compressed ' +
      'a set of findings into prose, and prose has nowhere to put a source.</p>' +
      '<p>The important consequence: <b>you cannot fix this downstream</b>. Once the search agent has ' +
      'returned "findings suggest adoption is rising sharply, with one study reporting 67% growth", the ' +
      'link between claim and source no longer exists anywhere in the pipeline. The synthesis agent cannot ' +
      'restore it; it can only guess. The fix must be applied <b>upstream</b>, at every step that ' +
      'compresses.</p>' +

      fig({
        vb: '0 0 700 250',
        caption: 'Attribution survives only if every compressing step preserves the claim-source mapping. ' +
          'One prose summary anywhere in the chain breaks it permanently.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Lost at the first summarisation</text>' +
          '<rect x="24" y="28" width="120" height="38" rx="5" class="box"/>' +
          '<text x="84" y="45" text-anchor="middle" font-size="9.5">search agent</text>' +
          '<text x="84" y="59" text-anchor="middle" font-size="9" class="dim">14 sources</text>' +
          '<path class="arrow" d="M144 47 L186 47" marker-end="url(#ah)"/>' +
          '<rect x="186" y="28" width="150" height="38" rx="5" class="boxBad"/>' +
          '<text x="261" y="45" text-anchor="middle" font-size="9.5">prose summary</text>' +
          '<text x="261" y="59" text-anchor="middle" font-size="9" class="dim">"one study reports 67%"</text>' +
          '<path class="arrow" d="M336 47 L378 47" marker-end="url(#ah)"/>' +
          '<rect x="378" y="28" width="120" height="38" rx="5" class="box"/>' +
          '<text x="438" y="51" text-anchor="middle" font-size="9.5">synthesis</text>' +
          '<path class="arrow" d="M498 47 L540 47" marker-end="url(#ah)"/>' +
          '<rect x="540" y="28" width="136" height="38" rx="5" class="boxBad"/>' +
          '<text x="608" y="45" text-anchor="middle" font-size="9.5">report: 67%</text>' +
          '<text x="608" y="59" text-anchor="middle" font-size="9" style="fill:var(--bad)">source unrecoverable</text>' +

          '<line x1="24" y1="88" x2="676" y2="88" class="stroke dashed"/>' +

          '<text x="24" y="112" font-size="11" font-weight="600">Preserved end to end</text>' +
          '<rect x="24" y="122" width="120" height="46" rx="5" class="box"/>' +
          '<text x="84" y="140" text-anchor="middle" font-size="9.5">search agent</text>' +
          '<text x="84" y="155" text-anchor="middle" font-size="9" class="dim">14 sources</text>' +
          '<path class="arrow" d="M144 145 L186 145" marker-end="url(#ah)"/>' +
          '<rect x="186" y="122" width="150" height="46" rx="5" class="boxOk"/>' +
          '<text x="261" y="138" text-anchor="middle" font-size="9.5">claim-source records</text>' +
          '<text x="261" y="152" text-anchor="middle" font-size="8.5" class="dim">claim · url · excerpt · date</text>' +
          '<path class="arrow" d="M336 145 L378 145" marker-end="url(#ah)"/>' +
          '<rect x="378" y="122" width="120" height="46" rx="5" class="boxOk"/>' +
          '<text x="438" y="140" text-anchor="middle" font-size="9.5">synthesis</text>' +
          '<text x="438" y="155" text-anchor="middle" font-size="8.5" class="dim">must preserve</text>' +
          '<path class="arrow" d="M498 145 L540 145" marker-end="url(#ah)"/>' +
          '<rect x="540" y="122" width="136" height="46" rx="5" class="boxOk"/>' +
          '<text x="608" y="140" text-anchor="middle" font-size="9.5">report: 67%</text>' +
          '<text x="608" y="155" text-anchor="middle" font-size="8.5" class="dim">Okonkwo 2026, p.14</text>' +

          '<rect x="24" y="196" width="652" height="44" rx="6" class="boxA"/>' +
          '<text x="40" y="216" font-size="10.5" font-weight="600">Fix it upstream. A prose step anywhere destroys attribution for everything after it,</text>' +
          '<text x="40" y="232" font-size="10.5" font-weight="600">and no downstream agent can reconstruct what was already dissolved.</text>'
      }) +

      '<h3>The claim-source record</h3>' +
      '<pre><code>{\n' +
      '  "claim": "Enterprise AI adoption grew 67% year on year",\n' +
      '  "source_name": "Okonkwo & Marsh, State of Enterprise AI 2026",\n' +
      '  "source_url": "https://…",\n' +
      '  "evidence_excerpt": "…adoption among enterprises above 5,000\n' +
      '                       employees grew 67% year on year, from 21%\n' +
      '                       to 35% of firms…",\n' +
      '  "publication_date": "2026-03",\n' +
      '  "data_collection_period": "2025-Q3 to 2025-Q4",\n' +
      '  "methodology_note": "self-reported survey, n=1,240, US and EU only"\n' +
      '}</code></pre>' +
      '<p>Four of those fields do work beyond bookkeeping. The <b>excerpt</b> lets a downstream agent ' +
      'check that the claim is actually supported rather than paraphrased into something stronger. The ' +
      '<b>publication date</b> and <b>collection period</b> are what prevent temporal confusion (below). ' +
      'And the <b>methodology note</b> is what allows a synthesis to say "self-reported survey data" ' +
      'rather than presenting a survey figure as a measurement.</p>' +
      '<p>The instruction to the synthesis agent must be explicit: <b>preserve and merge these mappings; ' +
      'every claim in your output carries its source</b>. Otherwise the compression happens one step ' +
      'later.</p>' +

      '<h3>Conflicting sources: annotate, never resolve</h3>' +
      '<p>Two credible sources report growth as 45% and 31%. The wrong moves, and why:</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Approach</th><th>Why it fails</th></tr></thead><tbody>' +
      '<tr><td><b>Average to 38%</b></td><td>Statistically meaningless — the sources measured different ' +
      'populations by different methods. 38% is a number no source supports and no reader can trace.</td></tr>' +
      '<tr><td><b>Take the more recent</b></td><td>Recency is not authority, and if they cover different ' +
      'periods this destroys a trend (see below).</td></tr>' +
      '<tr><td><b>Take the more authoritative</b></td><td>Subjective, and it silently hides a real ' +
      'disagreement in the field from the reader.</td></tr>' +
      '<tr><td><b>Report only one and omit the other</b></td><td>Presents contested data as settled. The ' +
      'reader cannot know they are seeing one side.</td></tr>' +
      '<tr><td><b>Halt and escalate to the coordinator before continuing</b></td><td>Unnecessary: the ' +
      'analysis agent should complete its work with both values included and annotated, and let the ' +
      'coordinator decide how to reconcile.</td></tr>' +
      '</tbody></table></div>' +
      '<p><b>Right approach:</b> include both values with full attribution, annotate explicitly that they ' +
      'conflict, and preserve each source\'s own characterisation and methodological context. The report ' +
      'should then structure itself to <b>distinguish well-established findings from contested ones</b> — ' +
      'a reader needs to know which is which.</p>' +
      '<pre><code>## Adoption growth — CONTESTED\n\n' +
      'Two credible sources disagree on the magnitude:\n\n' +
      '| Source          | Figure | Period        | Method                  |\n' +
      '|-----------------|--------|---------------|-------------------------|\n' +
      '| Okonkwo 2026    | 45%    | 2025 Q3–Q4    | survey, n=1,240, US/EU  |\n' +
      '| Marsh 2025      | 31%    | 2025 Q1–Q2    | vendor telemetry, global|\n' +
      '\n' +
      '> These figures are not directly comparable: different periods,\n' +
      '> populations and instruments. Both are reported as published.\n' +
      '> The direction of change is consistent; the magnitude is not.</code></pre>' +

      '<h3>Temporal differences are not contradictions</h3>' +
      '<p>The subtlest case, and the reason dates are mandatory. Q1 2022 says 12%; Q4 2025 says 47%. That ' +
      'is not a conflict — <b>it is a trend</b>, and reporting it as a disagreement between sources is a ' +
      'straightforward error of interpretation.</p>' +
      '<p>Distinguishing the two cases requires knowing when each figure refers to, which is only possible ' +
      'if publication and collection dates travelled with the claim. Without dates, a synthesis agent ' +
      'seeing 12% and 47% has no way to tell growth from disagreement — so it will guess, and its guess ' +
      'will sometimes be "these sources conflict".</p>' +
      '<div class="callout rule"><span class="co-t">The test</span>' +
      '<p><b>Same period, different values → conflict.</b> Annotate both. <b>Different periods, different ' +
      'values → trend.</b> Present as a time series, chronologically. You can only tell which you have if ' +
      'dates are present.</p></div>' +

      '<h3>Render content by type</h3>' +
      '<p>A final point the guide makes: do not force everything into one format in the synthesis output.</p>' +
      '<ul>' +
      '<li><b>Financial and comparative data → tables.</b> Four sources with four figures is a table; as ' +
      'prose it is unreadable.</li>' +
      '<li><b>News and analysis → prose.</b> Narrative and causation do not tabulate.</li>' +
      '<li><b>Technical findings → structured lists.</b> Scannable, and each item stands alone.</li>' +
      '<li><b>Time series → chronological order.</b> Which is also what makes a trend visible as a ' +
      'trend.</li>' +
      '</ul>' +
      '<p>Converting everything to uniform prose is the specific failure mode: it is where the conflict ' +
      'table above becomes "estimates vary", and the attribution disappears again.</p>',

      example:
      '<h3>Scenario 3 — tracing an unattributable number</h3>' +
      '<p>The final report says "AI adoption increased by 67% in the past year". A reviewer asks which ' +
      'source supports it and nobody can answer. Working backwards through the pipeline:</p>' +
      '<pre><code>report agent      "adoption increased by 67%"        ← no source\n' +
      '  ↑\n' +
      'synthesis agent   "one study reported 67% growth"     ← no source\n' +
      '  ↑\n' +
      'doc analysis      "Findings suggest adoption is        ← ATTRIBUTION\n' +
      '                   rising sharply, with one study         DIED HERE\n' +
      '                   reporting 67% growth, though\n' +
      '                   other sources are less bullish."\n' +
      '  ↑\n' +
      'web search        14 sources, each with url + excerpt ← intact</code></pre>' +
      '<p>The search agent did its job. The <b>document analysis agent</b> compressed fourteen structured ' +
      'records into a paragraph, and everything after that point was working with prose. The synthesis ' +
      'agent is often blamed here and is not at fault — it faithfully passed on what it received.</p>' +

      '<h3>The fix, applied at the right place</h3>' +
      '<pre><code>Document analysis subagent — output contract\n\n' +
      'Return ONLY a JSON array of claim records. Do not write prose.\n' +
      'Do not merge or summarise across sources.\n' +
      '\n' +
      'Each record:\n' +
      '  claim                   one factual assertion, in your words\n' +
      '  source_name             author/publication\n' +
      '  source_url              or document name + page\n' +
      '  evidence_excerpt        verbatim text supporting the claim\n' +
      '  publication_date        YYYY-MM\n' +
      '  data_collection_period  if the source states one\n' +
      '  methodology_note        instrument, sample, population, if stated\n' +
      '\n' +
      'If two sources disagree, emit BOTH records and set\n' +
      'conflicts_with to the other record\'s source_name. Do not\n' +
      'reconcile them — the coordinator decides.\n' +
      '\n' +
      'Synthesis subagent — output contract\n' +
      '\n' +
      'Every claim you state carries its source_name and publication_date.\n' +
      'Where records conflict, present both values in a table with method\n' +
      'and period, and annotate that they are not directly comparable.\n' +
      'Structure the report to separate well-established findings from\n' +
      'contested ones. Render financial data as tables, analysis as prose,\n' +
      'technical findings as lists, and time series chronologically.</code></pre>' +
      '<p>Two contracts, one at each compressing step. The pattern generalises: <b>find every step that ' +
      'compresses, and give each one an output contract that carries provenance through.</b></p>' +

      '<h3>The temporal case, correctly handled</h3>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Read as a conflict</span>' +
      '<pre><code>"Sources disagree on adoption:\n estimates range from 12% to 47%."</code></pre>' +
      '<p>Wrong, and misleading. It presents four years of growth as uncertainty in the ' +
      'measurement.</p></div>' +
      '<div class="good"><span class="vs-h">Read as a trend</span>' +
      '<pre><code>"Adoption has risen steadily:\n 12% (Q1 2022, Marsh),\n 24% (Q2 2023, Okonkwo),\n 47% (Q4 2025, Okonkwo)."</code></pre>' +
      '<p>Only possible because each claim arrived with a date.</p></div></div>',

      mistakes: [
        { t: 'Blaming the synthesis agent for lost citations',
          d: 'It cannot restore a mapping that was dissolved upstream. Find the step that compressed to ' +
             'prose and fix its output contract.' },
        { t: 'Allowing any intermediate agent to return prose summaries',
          d: 'One prose step destroys attribution for everything after it. Require structured claim-source ' +
             'records at every compressing step.' },
        { t: 'Averaging conflicting figures',
          d: 'Statistically invalid when sources measured different populations by different methods, and ' +
             'it produces a number no source supports.' },
        { t: 'Picking the more recent or more authoritative source',
          d: 'Recency is not authority, authority is subjective, and both hide a real disagreement from ' +
             'the reader.' },
        { t: 'Halting to escalate a conflict before finishing the analysis',
          d: 'Complete the analysis with both values included and annotated; let the coordinator decide ' +
             'how to reconcile.' },
        { t: 'Omitting publication and collection dates',
          d: 'Without them a trend is indistinguishable from a contradiction, and the synthesis will ' +
             'sometimes report growth as disagreement.' },
        { t: 'Treating different time periods as conflicting',
          d: 'Same period, different values is a conflict. Different periods is a trend — present it ' +
             'chronologically.' },
        { t: 'Dropping methodological context',
          d: 'A survey figure and a telemetry figure are not comparable, and the reader needs to know ' +
             'which they are reading.' },
        { t: 'Converting everything to uniform prose',
          d: 'Financial comparisons belong in tables, technical findings in lists, time series in ' +
             'chronological order. Uniform prose is where attribution and comparability disappear.' }
      ],

      exam:
      '<p>Expect the lost-citation item: a figure in the final report that nobody can trace, and the ' +
      'answer identifies a <b>summarisation step upstream</b> and requires structured claim-source ' +
      'mappings that downstream agents preserve. Expect the conflict item, where the correct option ' +
      '<b>preserves both values with attribution and explicitly annotates the conflict</b> — with average, ' +
      'pick-the-recent, pick-the-authoritative and halt-to-escalate as distractors. And watch for the ' +
      'temporal variant, where two figures from different periods are a trend rather than a ' +
      'contradiction.</p>',

      questions: [
        {
          id: 'q5.6.1', scn: 3,
          stem: '<p>Your final report states "AI adoption increased by 67% year on year", but a reviewer ' +
            'cannot determine which source supports it. Tracing back, the web search agent returned 14 ' +
            'sources each with a URL and excerpt, while the document analysis agent returned a prose ' +
            'paragraph reading "findings suggest adoption is rising sharply, with one study reporting 67% ' +
            'growth". What is the root cause and fix?</p>',
          opts: [
            'Attribution was lost at the document analysis agent\'s summarisation step; require it to emit structured claim-source records that downstream agents must preserve through synthesis.',
            'The synthesis agent failed to cite its inputs; instruct it to attach a source to every claim it states in the report.',
            'The report generation agent stripped citations when formatting; adjust its template to include a references section.',
            'The web search agent returned too many sources for the pipeline to track; reduce the number of sources per subtopic so attribution is manageable.'
          ],
          ans: [0],
          why: 'The search agent preserved attribution and the document analysis agent dissolved it into ' +
            'prose. Everything downstream was working with text that no longer contained the mapping, so ' +
            'the fix must be applied at the step that compressed — structured claim-source records, with ' +
            'an explicit requirement that later agents carry them through.',
          wrong: [
            '',
            'The synthesis agent cannot cite what it never received. It was handed prose containing a ' +
            'figure and no source, and instructing it to attach sources would invite it to guess.',
            'Formatting is not where the loss occurred — the source was already absent by the time the ' +
            'report agent ran. A references section would have nothing to list against that claim.',
            'Fourteen sources is unremarkable, and the loss had nothing to do with volume. Reducing ' +
            'coverage to make a design flaw less visible degrades the research.'
          ]
        },
        {
          id: 'q5.6.2', scn: 3,
          stem: '<p>Two credible sources report enterprise AI adoption growth for overlapping periods as ' +
            '45% and 31% respectively. How should the synthesis handle this?</p>',
          opts: [
            'Present both figures with full source attribution and methodological context, explicitly annotating that they conflict and are not directly comparable.',
            'Report the average of 38%, noting in a footnote that individual source estimates varied.',
            'Report the figure from the more recent source, since it reflects the most current state of the market.',
            'Report the figure from the more methodologically rigorous source and omit the other to avoid confusing the reader.'
          ],
          ans: [0],
          why: 'Conflicting statistics from credible sources should be annotated with attribution rather ' +
            'than arbitrarily resolved. Preserving both values, with each source\'s own methodology and ' +
            'characterisation, lets the reader understand the actual state of the evidence — which is ' +
            'genuine disagreement, not a single knowable number.',
          wrong: [
            '',
            'Averaging is statistically invalid when the sources measured different populations with ' +
            'different instruments, and it produces a figure no source supports and no reader can ' +
            'trace.',
            'Recency is not authority. The more recent figure may use a narrower population or a weaker ' +
            'method, and silently preferring it hides a real disagreement.',
            'Rigour judgments are subjective, and omitting a credible source presents contested data as ' +
            'settled. The reader cannot tell they are seeing one side of a disagreement.'
          ]
        },
        {
          id: 'q5.6.3', scn: 3,
          stem: '<p>Your synthesis reports "sources disagree on adoption rates, with estimates ranging ' +
            'from 12% to 47%". Investigation shows the 12% figure is from Q1 2022 and the 47% figure from ' +
            'Q4 2025. What went wrong, and what prevents it?</p>',
          opts: [
            'A trend across time was misread as a disagreement between sources; require publication and data-collection dates in every structured output so temporal differences are interpretable.',
            'The two sources genuinely conflict and the synthesis was right to report a range; no change is needed beyond adding the source names.',
            'The older source should have been excluded as out of date; add a recency filter that drops sources older than 18 months.',
            'The synthesis agent should have averaged the two figures rather than presenting a range, which would have avoided implying disagreement.'
          ],
          ans: [0],
          why: 'Different values from different periods describe change over time, not contradiction. ' +
            'Requiring publication and collection dates in structured outputs is what lets a downstream ' +
            'agent tell a trend from a conflict — without dates it has no basis for the distinction and ' +
            'will sometimes guess wrongly.',
          wrong: [
            '',
            'They do not conflict: they describe different moments. Reporting nearly four years of growth ' +
            'as measurement uncertainty misleads the reader about what is known.',
            'Discarding historical data destroys exactly the trend that is the interesting finding. The ' +
            'problem was interpretation, not the presence of an older source.',
            'Averaging a 2022 figure with a 2025 figure produces a number describing no point in time at ' +
            'all, and it conceals the growth entirely.'
          ]
        },
        {
          id: 'q5.6.4', scn: 3,
          stem: '<p>Your document analysis subagent finds two figures in different reports that ' +
            'contradict each other for the same period. What should it do?</p>',
          opts: [
            'Complete its analysis, emitting both values as separate records with attribution and an explicit conflict annotation, and let the coordinator decide how to reconcile them.',
            'Halt and escalate to the coordinator immediately, since proceeding with contradictory data risks corrupting the synthesis.',
            'Select the figure from the report with the larger sample size and note the decision in its output.',
            'Emit both values without annotation, since flagging a conflict is the synthesis agent\'s responsibility rather than the analysis agent\'s.'
          ],
          ans: [0],
          why: 'The analysis agent should finish its work with conflicting values included and explicitly ' +
            'annotated, leaving reconciliation to the coordinator. That preserves the information, keeps ' +
            'the pipeline moving, and puts the judgment where the whole-task view is.',
          wrong: [
            '',
            'Halting mid-analysis wastes the rest of the work it could have completed, and the ' +
            'coordinator cannot reconcile anything usefully without the completed analysis in front of ' +
            'it.',
            'This is the analysis agent resolving a conflict it is not positioned to resolve. Sample size ' +
            'is one consideration among several, and the choice silently removes information the ' +
            'coordinator needed.',
            'Unannotated contradictory values look like two independent findings. The synthesis agent may ' +
            'not notice they conflict, and may state both as though they were compatible.'
          ]
        },
        {
          id: 'q5.6.5', scn: 3,
          stem: '<p>Which practices correctly support provenance and clarity in a multi-source synthesis ' +
            'report?</p>',
          opts: [
            'Structuring the report to distinguish well-established findings from contested ones.',
            'Rendering financial and comparative data as tables, analysis as prose, and technical findings as structured lists.',
            'Converting all findings to a uniform prose narrative so the report reads consistently throughout.',
            'Including each source\'s methodological context, such as instrument and population, alongside its figures.'
          ],
          ans: [0, 1, 3],
          why: 'All three correct practices come from the guide: separating established from contested ' +
            'findings, rendering different content types appropriately rather than uniformly, and ' +
            'preserving methodological context so a survey figure is not read as a measurement.',
          wrong: [
            '', '',
            'Uniform prose is the specific failure mode named: it is where comparison tables become ' +
            '"estimates vary" and attribution quietly disappears. Consistency of format is not worth the ' +
            'loss of comparability.',
            ''
          ]
        }
      ]
    }

    ]
  });
})(window.CCA);
