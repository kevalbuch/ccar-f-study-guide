/* Domain 4 — Prompt Engineering & Structured Output (20%, ≈12 items) */
(function (CCA) {
  var fig = function (o) { return CCA.fig(o); };

  CCA.domains.push({
    n: 4,
    orient: '<div class="callout rule"><span class="co-t">Orientation</span>' +
      '<p>Two halves. The first is about <b>getting the model to judge well</b> — explicit criteria ' +
      'instead of vague hedges (4.1) and examples aimed at the hard cases (4.2). The second is about ' +
      '<b>getting output you can rely on</b> — <code>tool_use</code> with a schema (4.3), validation and ' +
      'retry when the values are wrong (4.4), and choosing the right API for the workload (4.5). Task ' +
      'statement 4.6 belongs to both halves and shares its worked case with ' +
      '<a href="#/unit/1.6">1.6</a>.</p>' +
      '<p>The idea threaded through all six: <b>structure eliminates whole classes of error, but only the ' +
      'class it addresses.</b> A schema kills syntax errors and leaves semantic ones untouched. Know ' +
      'exactly what each mechanism buys you.</p></div>',

    units: [

    /* ================================================================== 4.1 */
    {
      id: '4.1',
      short: 'Explicit criteria & false positives',
      title: 'Design prompts with explicit criteria to improve precision and reduce false positives',
      scn: [5],
      tldr: 'Vague instructions produce vague judgment. "Check that comments are accurate" gets you ' +
        'nitpicks; "flag a comment only when its claimed behaviour contradicts what the code actually ' +
        'does" gets you defects. Crucially, <b>hedging instructions like "be conservative" or "only report ' +
        'high-confidence findings" do not improve precision</b> — they suppress volume indiscriminately. ' +
        'And when one category floods developers with false positives, <b>turn that category off</b> while ' +
        'you fix it, because distrust spills over onto the categories that are accurate.',

      concept:
      '<h3>Specific criteria versus vague instruction</h3>' +
      '<p>Precision problems in a review system are almost always specification problems. The model is ' +
      'doing what you asked; you asked for something under-determined.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Under-determined</span>' +
      '<pre><code>"Check that comments are accurate\n and up to date."</code></pre>' +
      '<p>What is "accurate"? A comment saying "fast path" on code that is merely adequate? A stale ' +
      '<code>@param</code> name? The model resolves the ambiguity differently each time, and much of what ' +
      'it flags is not a defect.</p></div>' +
      '<div class="good"><span class="vs-h">Determined</span>' +
      '<pre><code>"Flag a comment ONLY when the\n behaviour it claims contradicts the\n behaviour of the code it documents\n — e.g. it says the function returns\n null on failure and the function\n raises. Do NOT flag stale wording,\n formatting, or missing comments."</code></pre>' +
      '<p>One test, stated positively and negatively. What gets flagged is now predictable.</p></div></div>' +
      '<p>Notice the shape: a criterion plus an explicit exclusion list. The exclusions do as much work as ' +
      'the criterion, for the same reason "do not use this tool when…" does the heavy lifting in a tool ' +
      'description (<a href="#/unit/2.1">2.1</a>).</p>' +

      '<h3>Why "be conservative" fails</h3>' +
      '<p>This is the part the exam tests hardest, because the instruction feels like it should work.</p>' +
      '<p>Precision is the proportion of your findings that are real. To improve it you must change ' +
      '<b>which</b> findings the model reports — the boundary between defect and non-defect. "Be ' +
      'conservative" contains no information about where that boundary lies. The model has no way to know ' +
      'which of its findings are the weak ones, so it does the only thing available: it reports fewer ' +
      'findings of every kind. You lose real bugs at roughly the same rate as false ones, and your ' +
      'precision barely moves.</p>' +
      '<p>The same objection applies to "only report high-confidence findings", and it applies for the ' +
      'reason developed in <a href="#/unit/5.5">5.5</a>: self-assessed confidence is not calibrated. The ' +
      'model is confidently wrong precisely on the hard cases.</p>' +

      fig({
        vb: '0 0 700 240',
        caption: 'A hedging instruction shrinks the whole output. Explicit criteria move the boundary, ' +
          'which is the only thing that raises precision.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">"Be conservative" — volume falls, ratio does not</text>' +
          '<rect x="24" y="28" width="200" height="30" rx="5" class="box"/>' +
          (function () {
            var s = '';
            for (var i = 0; i < 12; i++) {
              s += '<rect x="' + (30 + i * 16) + '" y="35" width="12" height="16" rx="2" class="' +
                   (i < 7 ? 'boxOk' : 'boxBad') + '"/>';
            }
            return s;
          })() +
          '<text x="238" y="47" font-size="10" class="dim">7 real / 5 false — precision 58%</text>' +
          '<path class="arrow" d="M120 58 L120 76" marker-end="url(#ah)"/>' +
          '<rect x="24" y="76" width="200" height="30" rx="5" class="box"/>' +
          (function () {
            var s = '';
            for (var i = 0; i < 6; i++) {
              s += '<rect x="' + (30 + i * 16) + '" y="83" width="12" height="16" rx="2" class="' +
                   (i < 4 ? 'boxOk' : 'boxBad') + '"/>';
            }
            return s;
          })() +
          '<text x="238" y="95" font-size="10" class="dim">4 real / 2 false — precision 67%, but 3 real bugs lost</text>' +

          '<line x1="24" y1="126" x2="676" y2="126" class="stroke dashed"/>' +

          '<text x="24" y="150" font-size="11" font-weight="600">Explicit criteria — the boundary itself moves</text>' +
          '<rect x="24" y="160" width="200" height="30" rx="5" class="box"/>' +
          (function () {
            var s = '';
            for (var i = 0; i < 12; i++) {
              s += '<rect x="' + (30 + i * 16) + '" y="167" width="12" height="16" rx="2" class="' +
                   (i < 7 ? 'boxOk' : 'boxBad') + '"/>';
            }
            return s;
          })() +
          '<path class="arrow" d="M120 190 L120 206" marker-end="url(#ah)"/>' +
          '<rect x="24" y="206" width="200" height="30" rx="5" class="boxOk"/>' +
          (function () {
            var s = '';
            for (var i = 0; i < 8; i++) {
              s += '<rect x="' + (30 + i * 16) + '" y="213" width="12" height="16" rx="2" class="' +
                   (i < 7 ? 'boxOk' : 'boxBad') + '"/>';
            }
            return s;
          })() +
          '<text x="238" y="225" font-size="10" class="dim">7 real / 1 false — precision 88%, real bugs kept</text>'
      }) +

      '<h3>Trust spillover, and the case for switching a category off</h3>' +
      '<p>Suppose your review posts four categories of finding: security, correctness, performance, and ' +
      'style. Security and correctness are accurate. Style throws a false positive one time in three.</p> ' +
      '<p>What developers experience is not "the style category is unreliable". What they experience is ' +
      '"the bot is unreliable". Once roughly a third of what they read is wrong, they stop reading — and ' +
      'they stop reading the security findings too. <b>The false positive rate in your worst category sets ' +
      'the trust level for all of them.</b></p>' +
      '<p>The guide\'s recommendation is therefore blunt: <b>temporarily disable the high-false-positive ' +
      'category</b> while you improve its prompt, then re-enable it. That trades a little coverage for the ' +
      'credibility of everything else — and coverage you have is worthless if nobody reads it.</p>' +
      '<div class="callout trap"><span class="co-t">The tempting wrong answer</span>' +
      '<p>"Add \'be more conservative about style issues\' to the prompt." It leaves the category live at ' +
      'a slightly lower volume, so developers keep meeting false positives and trust keeps eroding — and ' +
      'you have not learned anything about where the boundary should be. Disable, define explicit criteria ' +
      'with concrete examples, re-enable.</p></div>' +

      '<h3>Severity needs criteria too</h3>' +
      '<p>Asking for a severity label without defining the levels produces drift: the same class of issue ' +
      'is "high" on Monday and "medium" on Thursday, and nobody can triage a queue whose labels do not ' +
      'mean anything. Define each level, with a concrete code example:</p>' +
      '<pre><code>SEVERITY (assign exactly one; a concrete example of each follows)\n\n' +
      'critical — exploitable, or causes data loss / corruption.\n' +
      '           e.g. user input concatenated into a SQL string\n' +
      '           e.g. a migration that drops a column before backfilling\n\n' +
      'high     — incorrect behaviour on a realistic input, no workaround.\n' +
      '           e.g. an off-by-one that skips the final page of results\n' +
      '           e.g. an unhandled null on a field the API marks optional\n\n' +
      'medium   — incorrect behaviour only on an unusual input, or a\n' +
      '           correct-but-fragile construct.\n' +
      '           e.g. an unbounded retry with no backoff\n\n' +
      'low      — maintainability only. No behavioural consequence.\n' +
      '           DO NOT report unless explicitly asked for style review.</code></pre>' +
      '<p>Concrete examples per level are what make this stick — the same reason examples beat prose in ' +
      '<a href="#/unit/3.5">3.5</a>.</p>',

      example:
      '<h3>Scenario 5 — a review nobody reads any more</h3>' +
      '<p>Six weeks after launch, the metrics are bleak: developers dismiss 62% of findings, and the ' +
      'dismissal rate for security findings is as high as for style ones — even though sampling shows the ' +
      'security findings are almost all real. They have stopped distinguishing.</p>' +
      '<p>The breakdown by category:</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Category</th><th>Findings</th>' +
      '<th>False positive rate</th><th>Action</th></tr></thead><tbody>' +
      '<tr><td>Security</td><td>31</td><td>6%</td><td>Keep. Working.</td></tr>' +
      '<tr><td>Correctness</td><td>88</td><td>11%</td><td>Keep, tighten criteria.</td></tr>' +
      '<tr><td>Performance</td><td>24</td><td>29%</td><td>Tighten criteria — no measurement, so it was ' +
      'guessing.</td></tr>' +
      '<tr><td>Style</td><td>203</td><td>34%</td><td><b>Disable</b>, rewrite, re-enable.</td></tr>' +
      '</tbody></table></div>' +
      '<p>Style was 58% of all findings and a third of them were wrong — so the median developer\'s ' +
      'experience of the bot <em>was</em> the style category. Turning it off does not reduce useful signal ' +
      'much; it removes most of the noise.</p>' +

      '<p>Then the prompt rewrite. Before:</p>' +
      '<pre><code>Review the changed files. Report bugs, security issues, performance\nproblems and style concerns. Be thorough but avoid nitpicking. Only\nreport issues you are confident about.</code></pre>' +
      '<p>Every sentence of that is a hedge: "thorough but avoid nitpicking" gives no boundary, and "only ' +
      'report issues you are confident about" outsources the decision to an uncalibrated signal. After:</p>' +
      '<pre><code>Review the changed files. Report findings in these categories ONLY.\n\n' +
      'SECURITY — report when untrusted input reaches a sink without\n' +
      '  validation or escaping (SQL, shell, HTML, path, deserialisation),\n' +
      '  or when an authorisation check is missing on a state-changing path.\n' +
      '  Do NOT report the use of a cryptographic primitive merely because\n' +
      '  a newer one exists.\n\n' +
      'CORRECTNESS — report when the code produces a wrong result or\n' +
      '  raises on an input the surrounding code can actually supply.\n' +
      '  You must name the input that triggers it. If you cannot name one,\n' +
      '  do not report the finding.\n\n' +
      'PERFORMANCE — report ONLY: (a) a query inside a loop over a\n' +
      '  collection that can exceed 100 elements, (b) an unbounded\n' +
      '  fetch with no pagination, (c) an O(n^2) scan over a collection\n' +
      '  documented as unbounded. Do NOT speculate about micro-cost.\n\n' +
      'STYLE — disabled. Do not report style findings.\n\n' +
      'For every finding include: file, line, severity (criteria below),\nthe triggering input or code path, and a concrete suggested fix.</code></pre>' +
      '<p>The clause doing the most work is in CORRECTNESS: <b>"you must name the input that triggers it. ' +
      'If you cannot name one, do not report the finding."</b> That converts a vague standard into a test ' +
      'the model can actually apply to its own candidate finding — and it is a test that speculative ' +
      'findings fail.</p>' +

      '<div class="callout tip"><span class="co-t">Generalisable move</span>' +
      '<p>Wherever you are tempted to write "be careful", "be conservative" or "use good judgment", ' +
      'instead write the <b>test the model should apply</b>. "Name the triggering input or drop the ' +
      'finding" is a test. "Be conservative" is a mood.</p></div>',

      mistakes: [
        { t: 'Adding "be conservative" to reduce false positives',
          d: 'Carries no information about where the boundary lies, so the model reports fewer findings of ' +
             'every kind. Volume falls, precision barely moves, and real bugs are lost.' },
        { t: 'Filtering on self-reported confidence',
          d: 'Uncalibrated — the model is confident precisely where it is wrong ' +
             '(<a href="#/unit/5.5">5.5</a>). Use categorical criteria instead.' },
        { t: 'Stating what to report without stating what to skip',
          d: 'The exclusion list does as much work as the criterion. Name the things you do not want ' +
             'flagged.' },
        { t: 'Leaving a high-false-positive category enabled while you "improve" it',
          d: 'Trust spillover means the worst category sets the credibility of all of them. Disable it, ' +
             'fix it, re-enable it.' },
        { t: 'Requesting severity labels without defining the levels',
          d: 'Labels drift and the triage queue becomes meaningless. Define each level with a concrete ' +
             'code example.' },
        { t: 'Treating a precision problem as a model-capability problem',
          d: 'A stronger model resolves an ambiguous specification differently, not correctly. Fix the ' +
             'specification.' },
        { t: 'Allowing speculative findings',
          d: 'Require the model to name the triggering input or code path. Findings that cannot meet that ' +
             'bar are exactly the false positives.' }
      ],

      exam:
      '<p>The signature item describes a review system with a high false positive rate in one category and ' +
      'asks how to restore developer trust. Two correct moves recur: <b>disable that category temporarily ' +
      'while improving its prompt</b>, and <b>replace vague instructions with explicit categorical ' +
      'criteria</b>. The standing distractors are "add \'be conservative\'", "only report high-confidence ' +
      'findings", and "use a stronger model" — all three fail for reasons you should be able to state in ' +
      'one sentence each. Expect severity-definition to appear as a supporting option.</p>',

      questions: [
        {
          id: 'q4.1.1', scn: 5,
          stem: '<p>Your CI review posts findings in four categories. Sampling shows security and ' +
            'correctness findings are accurate, but roughly one style finding in three is wrong. ' +
            'Developers now dismiss findings across <em>all</em> categories at similar rates, including ' +
            'the accurate ones. What is the most effective response?</p>',
          opts: [
            'Temporarily disable the style category while you rewrite its criteria, then re-enable it once precision is acceptable.',
            'Add an instruction to the prompt telling the model to be more conservative about style issues and report only those it is confident about.',
            'Keep all categories but sort findings so that security and correctness appear first, ensuring the accurate findings are seen.',
            'Reduce the total number of findings per review to at most five, so developers are not overwhelmed and read each one.'
          ],
          ans: [0],
          why: 'A high false positive rate in one category erodes confidence in the accurate categories ' +
            'too — trust spillover. Removing the noisy category restores the credibility of the rest ' +
            'immediately, and you fix its criteria offline rather than while developers are still being ' +
            'shown its mistakes.',
          wrong: [
            '',
            'Hedging instructions carry no information about where the defect boundary lies, so the model ' +
            'reports fewer findings of every kind rather than better ones. The category stays live, ' +
            'developers keep meeting false positives, and trust keeps eroding.',
            'Ordering does not stop developers encountering the false positives further down, and it does ' +
            'nothing about the underlying rate. The problem is what is being reported, not where it ' +
            'appears in the list.',
            'An arbitrary cap may well cut real security findings to make room for style noise, since the ' +
            'cap has no way to prefer the accurate categories.'
          ]
        },
        {
          id: 'q4.1.2', scn: 5,
          stem: '<p>Your review prompt says "check that code comments are accurate". It produces many ' +
            'findings about wording, formatting and missing documentation, and few about genuinely ' +
            'misleading comments. Which rewrite best improves precision?</p>',
          opts: [
            'Flag a comment only when the behaviour it claims contradicts the actual behaviour of the code it documents, and explicitly exclude stale wording, formatting and absent comments.',
            'Flag comments that appear inaccurate, being careful to avoid nitpicking about style or formatting.',
            'Flag comments that appear inaccurate, and assign each finding a confidence score so low-confidence ones can be filtered downstream.',
            'Flag comments that appear inaccurate, and instruct the model to consider carefully whether each finding would be valuable to a reviewer.'
          ],
          ans: [0],
          why: 'It states a single applicable test — does the claim contradict the behaviour — and pairs ' +
            'it with an explicit exclusion list. That moves the reporting boundary rather than shrinking ' +
            'output volume, which is the only thing that actually raises precision.',
          wrong: [
            '',
            '"Being careful to avoid nitpicking" is the same vague hedge in new words. The model still has ' +
            'to guess what counts as a nitpick, which is exactly the ambiguity producing the bad ' +
            'findings.',
            'Pushes the problem downstream onto an uncalibrated signal. The model\'s confidence does not ' +
            'reliably separate real findings from false ones, so the filter discards good findings and ' +
            'keeps bad ones.',
            'An instruction to "consider carefully" adds deliberation without adding a criterion. There is ' +
            'still no test the model can apply to decide whether a given comment qualifies.'
          ]
        },
        {
          id: 'q4.1.3', scn: 5,
          stem: '<p>Your review assigns each finding a severity of critical, high, medium or low. ' +
            'Reviewers complain that the same class of issue receives different severities on different ' +
            'runs, making the triage queue unusable. What addresses this?</p>',
          opts: [
            'Define each severity level explicitly in the prompt, with a concrete code example of what qualifies at that level.',
            'Reduce the scale to two levels — blocking and non-blocking — so there is less room for inconsistency.',
            'Have the model output a numeric risk score from 1 to 100 instead of a categorical label, and derive severity from thresholds.',
            'Run each review three times and assign the severity that appears most often across the runs.'
          ],
          ans: [0],
          why: 'Inconsistent labelling comes from undefined levels. Explicit definitions with a concrete ' +
            'example per level give the model a stable rule to apply, which is the guide\'s stated ' +
            'approach for achieving consistent classification.',
          wrong: [
            '',
            'Fewer buckets narrows the visible variance without defining the boundary, so the same ' +
            'ambiguity now decides whether something blocks a merge — a higher-stakes coin flip.',
            'A 1–100 score invents precision that does not exist and is still uncalibrated. You have ' +
            'replaced an undefined four-level scale with an undefined hundred-level one.',
            'Three runs triple the cost and produce a majority vote over the same underlying ambiguity. ' +
            'Voting stabilises the output without making it correct — and, as in ' +
            '<a href="#/unit/1.6">1.6</a>, consensus filtering also suppresses genuine intermittent ' +
            'findings.'
          ]
        },
        {
          id: 'q4.1.4', scn: 5,
          stem: '<p>Which prompt clauses would genuinely raise the precision of a correctness review?</p>' +
            '',
          opts: [
            'Require every finding to name the specific input or code path that triggers the incorrect behaviour, and to be dropped if none can be named.',
            'Enumerate the constructs that should not be reported — for example, defensive checks that are redundant but harmless.',
            'Instruct the model to report only findings it would be willing to defend to a senior engineer.',
            'Instruct the model to prioritise recall over precision, on the basis that a missed bug costs more than a false positive.'
          ],
          ans: [0, 1],
          why: 'The first converts a vague standard into a test the model can apply to its own candidate ' +
            'finding, and speculative findings fail it. The second is the exclusion list — naming what not ' +
            'to report does as much work as naming what to report. Both move the boundary rather than ' +
            'shrinking volume.',
          wrong: [
            '', '',
            'An appeal to an imagined audience is a mood, not a criterion. It gives the model nothing ' +
            'testable, and functions as another version of "be conservative".',
            'This is a deliberate trade against the stated goal. It may be the right policy in some ' +
            'contexts, but the question asks how to raise precision, and this lowers it.'
          ]
        },
        {
          id: 'q4.1.5', scn: 5,
          stem: '<p>A colleague proposes fixing your review\'s false positive problem by switching to a ' +
            'more capable model, arguing that better judgment will naturally produce fewer spurious ' +
            'findings. How should you evaluate this?</p>',
          opts: [
            'Reject it as the primary fix: the criteria are under-specified, so a more capable model resolves the ambiguity differently rather than correctly, and the same inconsistency persists at higher cost.',
            'Accept it: false positive rates are a direct function of model capability, so a stronger model is the most reliable way to improve precision.',
            'Accept it as an interim measure while the criteria are rewritten, since any reduction in false positives buys back developer trust.',
            'Reject it, and instead lower the temperature so the model produces more deterministic and therefore more precise findings.'
          ],
          ans: [0],
          why: 'When the specification is ambiguous, capability does not supply the missing decision — it ' +
            'just makes a different guess, fluently. Precision improves when the criteria state which ' +
            'issues qualify and which do not, which is a prompt-design change rather than a model ' +
            'change.',
          wrong: [
            '',
            'This is the capability-instead-of-specification distractor that recurs across the exam. The ' +
            'model is already able to apply a clear rule; it has not been given one.',
            'Plausible-sounding, but there is no reason to expect a stronger model to reduce false ' +
            'positives against an ambiguous standard, and adopting it as an interim measure delays the ' +
            'change that would actually work while raising the bill.',
            'Temperature affects variability in phrasing and sampling, not whether a finding meets an ' +
            'undefined bar. A deterministic wrong answer is still wrong.'
          ]
        }
      ]
    },

    /* ================================================================== 4.2 */
    {
      id: '4.2',
      short: 'Few-shot prompting',
      title: 'Apply few-shot prompting to improve output consistency and quality',
      scn: [5, 6],
      tldr: 'Few-shot examples are the most effective technique when detailed instructions alone produce ' +
        'inconsistent output. Aim them at <b>ambiguous cases</b>, not obvious ones, and <b>show the ' +
        'reasoning</b> for why one action was chosen over a plausible alternative. The guide\'s count is ' +
        '<b>2–4 targeted examples</b>. Well-chosen examples let the model generalise judgment to patterns ' +
        'you never enumerated; badly chosen ones just teach it to match the cases you listed.',

      concept:
      '<h3>What examples are for</h3>' +
      '<p>Instructions describe a rule. Examples demonstrate a decision. When a rule is clear, instructions ' +
      'are cheaper and better. When the rule is clear but its <em>application at the boundary</em> is not, ' +
      'examples are the only thing that transfers the judgment.</p>' +
      '<p>So the question is never "should I add examples" in the abstract — it is "is my problem ' +
      'ambiguity at the boundary?" If output format is inconsistent, or ambiguous inputs get handled ' +
      'differently each time, that is a boundary problem and examples are the answer. If the model is ' +
      'picking the wrong tool because two descriptions are interchangeable, that is a description problem ' +
      'and examples are the <em>second</em> fix (<a href="#/unit/2.1">2.1</a>).</p>' +

      '<h3>Target the ambiguous, not the obvious</h3>' +
      fig({
        vb: '0 0 700 230',
        caption: 'Examples spent on clear cases teach nothing. Spend them where the decision is genuinely ' +
          'close, and show why one side won.',
        body:
          '<line x1="60" y1="70" x2="640" y2="70" class="stroke"/>' +
          '<text x="60" y="40" font-size="10.5" font-weight="600">clearly resolve</text>' +
          '<text x="350" y="40" font-size="10.5" font-weight="600" text-anchor="middle">the decision boundary</text>' +
          '<text x="640" y="40" font-size="10.5" font-weight="600" text-anchor="end">clearly escalate</text>' +
          '<line x1="350" y1="52" x2="350" y2="88" class="stroke dashed"/>' +

          (function () {
            var s = '';
            [80, 110, 140, 560, 590, 620].forEach(function (x) {
              s += '<circle cx="' + x + '" cy="70" r="5" class="box"/>';
            });
            [300, 325, 375, 400].forEach(function (x) {
              s += '<circle cx="' + x + '" cy="70" r="6" class="boxA"/>';
            });
            return s;
          })() +

          '<rect x="24" y="104" width="300" height="52" rx="6" class="boxBad"/>' +
          '<text x="40" y="124" font-size="10.5" font-weight="600">10–15 examples of the easy cases</text>' +
          '<text x="40" y="141" font-size="10" class="dim">teaches what the model already knew · costs tokens</text>' +

          '<rect x="376" y="104" width="300" height="52" rx="6" class="boxOk"/>' +
          '<text x="392" y="124" font-size="10.5" font-weight="600">2–4 examples at the boundary, with reasoning</text>' +
          '<text x="392" y="141" font-size="10" class="dim">transfers the judgment · generalises to new cases</text>' +

          '<rect x="24" y="172" width="652" height="48" rx="6" class="box"/>' +
          '<text x="40" y="192" font-size="10.5" font-weight="600">The reasoning is the payload.</text>' +
          '<text x="40" y="209" font-size="10.5">"Resolved rather than escalated BECAUSE the policy covers damage-with-evidence explicitly" —</text>' +
          '<text x="40" y="222" font-size="10" class="dim">that sentence is what lets the model handle a case you never wrote down.</text>'
      }) +

      '<p>The model already handles unambiguous cases. Fifteen examples of obvious escalations teach it ' +
      'nothing it did not know, occupy context in every request, and — worse — can push it toward ' +
      '<b>pattern matching</b> rather than judgment: it learns to recognise the specific situations you ' +
      'listed instead of the principle behind them.</p>' +
      '<p>Two to four examples chosen at the boundary, each stating <em>why</em> that side won, does the ' +
      'opposite. It gives the model the discriminating principle, which is what generalises.</p>' +

      '<h3>Anatomy of a good example</h3>' +
      '<pre><code>EXAMPLE — ambiguous: damage claim outside the return window\n\n' +
      'Customer: "This chair arrived with a cracked leg. I know it has been\n' +
      '           six weeks, but it was damaged when it got here."\n' +
      '\n' +
      'Reasoning: The 30-day return window has passed, which would normally\n' +
      '  end the matter. But policy 4.2 treats delivery damage as a separate\n' +
      '  category from returns, with no time limit where the customer reports\n' +
      '  damage on arrival. The competing reading — "outside the window,\n' +
      '  therefore escalate" — is wrong because the window governs returns,\n' +
      '  not damage claims. Photo evidence is available, so this is inside\n' +
      '  the agent\'s authority.\n' +
      '\n' +
      'Action: resolve autonomously — request photo, then issue replacement.</code></pre>' +
      '<p>Three things make this work. The case is genuinely close. The reasoning <b>names the plausible ' +
      'alternative and says why it loses</b>. And the conclusion follows from a stated principle — damage ' +
      'is not a return — rather than from the specific product involved.</p>' +

      '<h3>Where the guide points examples</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Problem</th><th>What the examples should show</th></tr></thead><tbody>' +
      '<tr><td>Output format is inconsistent</td><td>The exact desired shape — location, issue, severity, ' +
      'suggested fix — demonstrated rather than described</td></tr>' +
      '<tr><td>Tool selection fails on ambiguous requests</td><td>The ambiguous request, the reasoning, ' +
      'and why the chosen tool beat the plausible alternative</td></tr>' +
      '<tr><td>False positives in review</td><td>Pairs: an acceptable pattern <em>and</em> a genuine ' +
      'issue that looks similar, so the discriminator is visible</td></tr>' +
      '<tr><td>Extraction from varied document structures</td><td>One example per structural variant — ' +
      'inline citations versus a bibliography, a methodology section versus details embedded in prose</td></tr>' +
      '<tr><td>Required fields coming back empty or null</td><td>Extraction from documents whose layout ' +
      'differs from the common case, showing where the value actually lives</td></tr>' +
      '<tr><td>Escalation miscalibration</td><td>Boundary cases in both directions, with the criterion ' +
      'that decided each</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout note"><span class="co-t">Two counts, two purposes</span>' +
      '<p><b>2–4</b> is the count for few-shot examples aimed at ambiguous judgment (this task statement). ' +
      '<b>2–3</b> is the count for concrete input/output examples clarifying a transformation ' +
      '(<a href="#/unit/3.5">3.5</a>). Both are small, and both are far from the "10–15 typical cases" ' +
      'that appears as a distractor. If an option proposes a large number of examples of ordinary cases, ' +
      'it is wrong.</p></div>' +

      '<h3>Reducing hallucination in extraction</h3>' +
      '<p>One use worth calling out separately: few-shot examples reduce fabrication in extraction tasks ' +
      'where documents vary structurally. If a required field keeps coming back empty because the value is ' +
      'expressed as "roughly a fortnight" rather than a number, an example showing exactly how to handle ' +
      'that phrasing fixes it in a way no amount of instruction does.</p>' +
      '<p>Note the pairing though: examples handle <em>varied expression</em>; nullable fields handle ' +
      '<em>genuine absence</em> (<a href="#/unit/4.3">4.3</a>). If the information is not in the document ' +
      'at all, no example will conjure it, and requiring the field will produce invention.</p>',

      example:
      '<h3>Scenario 5 — teaching the review to distinguish look-alikes</h3>' +
      '<p>Your review flags every broad <code>except</code> clause. Developers dismiss most of them, ' +
      'because in this codebase a broad catch at a request boundary that logs and re-raises is the house ' +
      'pattern. What they want flagged is the broad catch that <em>swallows</em>.</p>' +
      '<p>Instructions alone struggled here — "flag broad exception handling unless it is appropriate" is ' +
      'exactly the vague standard from <a href="#/unit/4.1">4.1</a>. A paired example makes the ' +
      'discriminator visible:</p>' +
      '<pre><code>EXAMPLE A — do NOT report\n\n' +
      '    try:\n        return handler(request)\n    except Exception as e:\n' +
      '        log.exception("request failed", extra={"path": request.path})\n        raise\n' +
      '\n' +
      'Reasoning: broad, but it re-raises. The exception still propagates,\n' +
      '  so no error is hidden; the catch exists only to attach context.\n' +
      '  This is the sanctioned boundary-logging pattern.\n' +
      '\n' +
      'EXAMPLE B — DO report, severity high\n\n' +
      '    try:\n        return handler(request)\n    except Exception:\n' +
      '        return {"ok": True}\n' +
      '\n' +
      'Reasoning: broad AND swallowing — it converts any failure into a\n' +
      '  success response. The caller cannot distinguish success from\n' +
      '  failure, so faults propagate silently as good data.\n' +
      '  Triggering input: any request that raises inside handler().\n' +
      '\n' +
      'DISCRIMINATOR: does the handler re-raise, or return a value that\n' +
      'claims success? Re-raise → acceptable. Claim success → report.</code></pre>' +
      '<p>Two examples, not fifteen, and they are a <b>matched pair</b> — near-identical code with ' +
      'opposite verdicts. That is what forces the model to attend to the one feature that matters, and it ' +
      'generalises: a broad catch that returns <code>None</code>, or logs at debug level and continues, ' +
      'gets flagged correctly even though neither appears above.</p>' +

      '<h3>Scenario 6 — one example per structural variant</h3>' +
      '<p>Extraction of study metadata is failing on perhaps a fifth of papers. Investigation shows the ' +
      'failures cluster by <b>document structure</b>: some papers state the sample size in a methodology ' +
      'section, others bury it in a results paragraph, others put it only in a table caption.</p>' +
      '<pre><code>EXAMPLE 1 — explicit methodology section\n  "3. Method. We recruited 412 participants (211 female)…"\n' +
      '  → sample_size: 412\n\n' +
      'EXAMPLE 2 — embedded in a results paragraph\n  "Of those surveyed, 1,204 completed both waves; analysis below\n' +
      '   is restricted to this group."\n' +
      '  → sample_size: 1204\n' +
      '  Reasoning: the analysed n is the completers, not those approached.\n\n' +
      'EXAMPLE 3 — only in a table caption\n  "Table 2. Outcomes by cohort (N = 88)."\n' +
      '  → sample_size: 88\n\n' +
      'EXAMPLE 4 — genuinely absent\n  "…a large sample of undergraduate volunteers…"\n' +
      '  → sample_size: null, sample_size_note: "described qualitatively\n' +
      '     as \'large\'; no figure stated"\n' +
      '  Reasoning: no number appears. Do NOT estimate one.</code></pre>' +
      '<p>Four examples, each a different structural variant, and the fourth is the important one: it ' +
      'demonstrates <b>returning null rather than inventing a plausible figure</b>. Examples and nullable ' +
      'schema fields reinforce each other here — the schema permits the null, the example shows when to ' +
      'use it.</p>',

      mistakes: [
        { t: 'Adding 10–15 examples of typical cases',
          d: 'The model already handles the obvious. Large sets of easy examples cost context and push it ' +
             'toward pattern matching rather than judgment.' },
        { t: 'Giving the decision without the reasoning',
          d: 'Input-and-verdict pairs teach the specific case. The sentence explaining why the plausible ' +
             'alternative lost is what generalises.' },
        { t: 'Choosing examples from the middle of the easy region',
          d: 'Spend them at the boundary, where the model actually errs.' },
        { t: 'Reaching for examples when descriptions are the problem',
          d: 'For tool misselection caused by thin descriptions, rewrite the descriptions first ' +
             '(<a href="#/unit/2.1">2.1</a>). Examples are the secondary fix.' },
        { t: 'Showing only positive cases',
          d: 'For false positives, a matched pair — acceptable pattern beside a similar-looking genuine ' +
             'issue — is what makes the discriminator visible.' },
        { t: 'Expecting examples to supply missing information',
          d: 'They teach handling of varied expression, not absent facts. Genuine absence needs a nullable ' +
             'field (<a href="#/unit/4.3">4.3</a>).' },
        { t: 'Confusing the two counts',
          d: '2–4 for ambiguous-judgment few-shot; 2–3 for concrete I/O transformation examples ' +
             '(<a href="#/unit/3.5">3.5</a>).' }
      ],

      exam:
      '<p>The recurring item: something works on clear cases and fails on ambiguous ones, and you have ' +
      'decided to add few-shot examples — how many, and of what? Answer: a small number (2–4) targeting ' +
      '<b>ambiguous</b> scenarios, each showing the <b>reasoning</b> for why one option was chosen over a ' +
      'plausible alternative. The distractor is always a larger set of typical, unambiguous cases. Expect ' +
      'a second item where examples reduce extraction hallucination across varied document structures, and ' +
      'watch for options that confuse "varied expression" with "genuinely absent".</p>',

      questions: [
        {
          id: 'q4.2.1', scn: 1,
          stem: '<p>Your agent selects tools correctly for clear requests but inconsistently for ambiguous ' +
            'ones — "I have a problem with my recent purchase" could reasonably route to several tools. ' +
            'You have already rewritten the tool descriptions and decided to add few-shot examples. What ' +
            'should they contain?</p>',
          opts: [
            'Two to four examples of ambiguous requests, each showing the reasoning for why the chosen tool was preferred over the plausible alternative.',
            'Ten to fifteen examples covering the most common request types, so the model has broad coverage of real traffic.',
            'One example per tool, showing a canonical request that unambiguously belongs to that tool.',
            'Two to four examples of ambiguous requests, showing the request and the correct tool call without commentary, to keep the prompt compact.'
          ],
          ans: [0],
          why: 'Examples should teach the decision the model is getting wrong, which means aiming them at ' +
            'the boundary — and the reasoning is the part that transfers. Naming the plausible alternative ' +
            'and saying why it loses gives the model a discriminating principle that generalises to ' +
            'ambiguous cases you never wrote down.',
          wrong: [
            '',
            'Fifteen examples of common cases teach what the model already handles, consume context on ' +
            'every request, and encourage matching the listed situations rather than applying judgment.',
            'Canonical unambiguous examples address the cases that already work. They give the model no ' +
            'help at the boundary, which is where the failures are.',
            'Right target, wrong content. Without the reasoning the model learns those specific mappings ' +
            'rather than the principle behind them, so it still guesses on the next ambiguous request.'
          ]
        },
        {
          id: 'q4.2.2', scn: 5,
          stem: '<p>Your review flags every broad <code>except Exception</code> clause. In your codebase, ' +
            'a broad catch that logs and re-raises at a request boundary is a sanctioned pattern; a broad ' +
            'catch that returns a success value is a real bug. Which use of few-shot examples best reduces ' +
            'the false positives while keeping the real findings?</p>',
          opts: [
            'A matched pair of near-identical examples with opposite verdicts — one that re-raises and is not reported, one that returns success and is reported — plus a stated discriminator.',
            'Several examples of the sanctioned logging-and-re-raising pattern, labelled as not reportable, so the model learns to recognise it.',
            'An instruction listing the file paths where broad exception handling is permitted, so the model can exclude them by location.',
            'Several examples of genuinely buggy exception handling, labelled as reportable, so the model learns what a real issue looks like.'
          ],
          ans: [0],
          why: 'The two patterns look almost identical, so the model needs to see the single feature that ' +
            'separates them. A matched pair with opposite verdicts and an explicit discriminator — does it ' +
            're-raise, or claim success — forces attention onto that feature and generalises to variants ' +
            'not shown, such as returning <code>None</code>.',
          wrong: [
            '',
            'Negative examples alone teach the model to recognise the one acceptable form. Anything ' +
            'superficially similar is then at risk of being excluded too, and you may start losing real ' +
            'findings.',
            'Location is a poor proxy for correctness: the bug can appear in a permitted file and the ' +
            'sanctioned pattern in any file. It also decays as the codebase moves.',
            'Positive examples alone leave the acceptable pattern undistinguished, so the false positives ' +
            'continue. The problem is discrimination between look-alikes, not recognition of bugs.'
          ]
        },
        {
          id: 'q4.2.3', scn: 6,
          stem: '<p>An extraction pipeline returns null for <code>sample_size</code> on about 20% of ' +
            'research papers. Inspection shows those papers do state a sample size, but express it ' +
            'variously — in a methodology section, inside a results paragraph, or only in a table caption. ' +
            'What is the most effective fix?</p>',
          opts: [
            'Add few-shot examples demonstrating extraction from each structural variant, including one showing a genuinely absent value returning null.',
            'Make <code>sample_size</code> a required field so the model must locate a value rather than defaulting to null.',
            'Add an instruction explaining that sample sizes may appear in methodology sections, results text or table captions.',
            'Increase the extraction prompt\'s detail about what a sample size is and why it matters to downstream analysis.'
          ],
          ans: [0],
          why: 'The failures cluster by document structure, so examples covering each variant address the ' +
            'cause directly — the guide names few-shot examples as the technique for varied document ' +
            'structures. Including a genuinely-absent case is what stops the examples pushing the model ' +
            'toward inventing a figure when none exists.',
          wrong: [
            '',
            'Making it required is actively harmful: for papers that truly do not state a figure, the ' +
            'model will fabricate a plausible one to satisfy the schema ' +
            '(<a href="#/unit/4.3">4.3</a>).',
            'Better than nothing, but an instruction describes the variation abstractly. Demonstrating ' +
            'extraction from each layout is what reliably transfers, particularly for the results-paragraph ' +
            'case where the analysed n differs from the number approached.',
            'More explanation of the concept does not help the model find a number in an unfamiliar ' +
            'layout. It already knows what a sample size is.'
          ]
        },
        {
          id: 'q4.2.4', scn: 5,
          stem: '<p>Your review output varies in shape between runs: sometimes prose paragraphs, sometimes ' +
            'bullet lists, with severity and suggested fixes present inconsistently. Detailed instructions ' +
            'about the required format have not resolved it. What is the most effective technique?</p>',
          opts: [
            'Provide a small number of few-shot examples demonstrating the exact desired output shape, including location, issue, severity and suggested fix.',
            'Repeat the format requirements at both the beginning and the end of the prompt so they cannot be missed.',
            'Add a validation step that rejects and re-requests any output that does not match the expected shape.',
            'Instruct the model to think step by step about the format before writing each finding.'
          ],
          ans: [0],
          why: 'The guide names few-shot examples as the most effective technique for achieving ' +
            'consistently formatted, actionable output when detailed instructions alone produce ' +
            'inconsistent results. A demonstrated shape is unambiguous where a described one is not.',
          wrong: [
            '',
            'Position helps with long inputs (<a href="#/unit/5.1">5.1</a>), but repeating an ambiguous ' +
            'description twice does not disambiguate it.',
            'Reasonable engineering, and it is the right answer when you need a <em>guarantee</em> — but ' +
            'for CI findings the stronger move is <code>--output-format json</code> with a schema ' +
            '(<a href="#/unit/3.6">3.6</a>), and either way a retry loop pays for failures the examples ' +
            'would have prevented.',
            'Deliberation about an under-specified format does not settle it. The model needs to see the ' +
            'target, not think harder about a description of it.'
          ]
        },
        {
          id: 'q4.2.5', scn: 6,
          stem: '<p>Which statements about few-shot example design match the guide\'s ' +
            'recommendations?</p>',
          opts: [
            'A small number of examples — roughly two to four — targeting ambiguous cases is preferable to a large set of typical cases.',
            'Examples should show the reasoning for why one action was chosen over a plausible alternative, so the model can generalise to novel patterns.',
            'Examples work best when they cover the highest-frequency request types, since that is where most production traffic lands.',
            'Examples can substitute for nullable schema fields, because a demonstrated null teaches the model that absence is acceptable.'
          ],
          ans: [0, 1],
          why: 'Both correct statements are the core of the task statement: a small set aimed at ambiguity, ' +
            'with visible reasoning so the model acquires the discriminating principle rather than a ' +
            'lookup table of cases.',
          wrong: [
            '', '',
            'High-frequency requests are usually the ones already handled correctly. Examples are a scarce ' +
            'resource and belong where the model errs, which is at the boundary.',
            'They are complementary, not interchangeable. Examples teach handling of varied expression; a ' +
            'nullable field is what removes the schema pressure to fabricate a value when the information ' +
            'is genuinely absent.'
          ]
        }
      ]
    },

    /* ================================================================== 4.3 */
    {
      id: '4.3',
      short: 'tool_use & JSON schemas',
      title: 'Enforce structured output using tool use and JSON schemas',
      scn: [6],
      tldr: 'For guaranteed schema-compliant output, use <b><code>tool_use</code> with a JSON schema</b> — ' +
        'not a prompt asking for JSON text. It eliminates syntax errors, markdown fences and preamble ' +
        'entirely. But be precise about the limit: <b>it eliminates syntax errors, not semantic ones</b>. ' +
        'Line items that do not sum to the total are schema-valid and wrong. Schema design then does the ' +
        'rest of the work: <b>nullable fields stop fabrication</b>, and <code>"other"</code> + detail and ' +
        '<code>"unclear"</code> handle categories that do not fit.',

      concept:
      '<h3>Prompted JSON versus tool_use</h3>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">"Respond with JSON"</span>' +
      '<p>The model generates text that is <em>meant</em> to be JSON. Failure modes you will meet in ' +
      'production:</p>' +
      '<pre><code>Here is the extracted data:\n\n```json\n{ "total": 150.00, }\n```\n\nLet me know if you\nneed anything else.</code></pre>' +
      '<p>Preamble, markdown fences, a trailing comma, a closing pleasantry. Each is a parse failure.</p></div>' +
      '<div class="good"><span class="vs-h"><code>tool_use</code> with a schema</span>' +
      '<p>The model fills declared fields. The response arrives as a <code>tool_use</code> block whose ' +
      '<code>input</code> is already a structured object.</p>' +
      '<pre><code>{ "type": "tool_use",\n  "name": "extract_invoice",\n  "input": {\n    "total": 150.00,\n    "currency": "USD",\n    "line_items": [ … ]\n  } }</code></pre>' +
      '<p>No fences, no preamble, no trailing commas. The class of error is gone.</p></div></div>' +

      '<div class="callout trap"><span class="co-t">The fence-stripping trap</span>' +
      '<p>"Output sometimes includes markdown code fences — add a post-processing step to strip them." ' +
      'This is the wrong answer, and it is offered often. A regex handles the fences you have seen and not ' +
      'the preamble, the trailing comma, or the apology when the model decides the document is ' +
      'unsuitable. Switch to <code>tool_use</code> and the whole family of failures disappears rather than ' +
      'being patched one by one.</p></div>' +

      '<h3>The limit that matters most</h3>' +
      '<p>Say this to yourself until it is automatic: <b><code>tool_use</code> guarantees the shape, never ' +
      'the meaning.</b></p>' +
      fig({
        vb: '0 0 700 220',
        caption: 'Two independent classes of error. A schema closes one of them completely and the other ' +
          'not at all.',
        body:
          '<rect x="24" y="24" width="310" height="90" rx="8" class="boxOk"/>' +
          '<text x="40" y="46" font-size="11" font-weight="600">Syntax errors — eliminated by tool_use</text>' +
          '<text x="40" y="66" font-size="10">· malformed JSON, trailing commas</text>' +
          '<text x="40" y="82" font-size="10">· markdown code fences, preamble text</text>' +
          '<text x="40" y="98" font-size="10">· missing required field, wrong type, invalid enum</text>' +

          '<rect x="366" y="24" width="310" height="90" rx="8" class="boxBad"/>' +
          '<text x="382" y="46" font-size="11" font-weight="600">Semantic errors — untouched by tool_use</text>' +
          '<text x="382" y="66" font-size="10">· line items that do not sum to the stated total</text>' +
          '<text x="382" y="82" font-size="10">· the vendor name placed in the customer field</text>' +
          '<text x="382" y="98" font-size="10">· a plausible value invented for an absent field</text>' +

          '<path class="arrow" d="M521 114 L521 142" marker-end="url(#ah)"/>' +
          '<rect x="366" y="142" width="310" height="62" rx="8" class="boxA"/>' +
          '<text x="382" y="162" font-size="11" font-weight="600">Needs application-level validation</text>' +
          '<text x="382" y="180" font-size="10">Compute the sum yourself and compare (4.4).</text>' +
          '<text x="382" y="196" font-size="10">Or have the model extract both values and flag the conflict.</text>' +

          '<rect x="24" y="142" width="310" height="62" rx="8" class="box"/>' +
          '<text x="40" y="162" font-size="11" font-weight="600">Nothing further required</text>' +
          '<text x="40" y="180" font-size="10">A schema-valid response is structurally correct</text>' +
          '<text x="40" y="196" font-size="10">by construction.</text>'
      }) +
      '<p>An invoice extraction can be perfectly schema-valid and claim a $150 total against line items ' +
      'summing to $145. The schema has no view about arithmetic. Catching that is application logic, which ' +
      'is <a href="#/unit/4.4">task statement 4.4</a>.</p>' +

      '<h3><code>tool_choice</code>, from the extraction side</h3>' +
      '<p>Declaring an extraction tool does not guarantee it gets called. With <code>tool_choice: ' +
      '"auto"</code> the model may decide prose is more helpful — "this document does not appear to be an ' +
      'invoice" — and your parser receives text.</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Setting</th><th>Use in extraction</th></tr></thead><tbody>' +
      '<tr><td><code>"auto"</code></td><td>Avoid. Permits a text response, which is the failure you are ' +
      'trying to eliminate.</td></tr>' +
      '<tr><td><code>"any"</code></td><td>Several schemas and the document type is unknown — guarantees a ' +
      'call, model picks the schema.</td></tr>' +
      '<tr><td><code>{"type":"tool","name":"extract_metadata"}</code></td><td>One correct tool, or you ' +
      'need a specific step to run first before enrichment.</td></tr>' +
      '</tbody></table></div>' +
      '<p>This is the same content as <a href="#/unit/2.3">2.3</a> approached from the output-reliability ' +
      'direction, and it is examinable from either.</p>' +

      '<h3>Schema design: five patterns</h3>' +

      '<h4>1 · Nullable fields — the anti-fabrication mechanism</h4>' +
      '<p>The single most important idea in the domain. <b>A required field the document does not contain ' +
      'forces the model to invent a value.</b> It is not being careless; it is satisfying the constraint ' +
      'you imposed. Mark <code>cve_reference</code> required and feed it an advisory with no CVE, and you ' +
      'will get a well-formed, plausible, fictitious CVE identifier.</p>' +
      '<pre><code>"cve_reference": { "type": ["string", "null"] }   // absent is representable</code></pre>' +
      '<p>The fix is to make absence expressible. Then "not stated" is a legal answer and the pressure ' +
      'disappears.</p>' +

      '<h4>2 · Approximate and range values</h4>' +
      '<p>Documents say "about £2 million" or "between 40 and 60 staff". One numeric field cannot carry ' +
      'that, so it gets flattened and the imprecision is lost. Use companion fields:</p>' +
      '<pre><code>"contract_value_exact": { "type": ["number", "null"] },\n' +
      '"contract_value_min":   { "type": ["number", "null"] },\n' +
      '"contract_value_max":   { "type": ["number", "null"] },\n' +
      '"is_approximate":       { "type": "boolean" }</code></pre>' +

      '<h4>3 · <code>"other"</code> + detail, and <code>"unclear"</code></h4>' +
      '<p>A closed enum forces every document into your categories. Add two escape values — and note ' +
      'carefully that <b>they mean different things</b>:</p>' +
      '<pre><code>"contract_type": { "enum": ["service", "purchase", "employment",\n' +
      '                            "lease", "other", "unclear"] },\n' +
      '"contract_type_detail": { "type": ["string", "null"] }</code></pre>' +
      '<div class="tablewrap"><table><thead><tr><th>Value</th><th>Means</th><th>Downstream routing</th></tr></thead><tbody>' +
      '<tr><td><code>"other"</code></td><td>The document states a type clearly; it is not in your ' +
      'enum.</td><td>Review the detail strings periodically — recurring ones mean the enum should be ' +
      'extended.</td></tr>' +
      '<tr><td><code>"unclear"</code></td><td>The document does not specify clearly enough to ' +
      'choose.</td><td>Human review. This is a document-quality signal, not a schema gap.</td></tr>' +
      '</tbody></table></div>' +
      '<p>Collapsing them into one value throws away the distinction between "our schema is incomplete" ' +
      'and "this document is ambiguous" — two problems with different owners.</p>' +

      '<h4>4 · Empty array versus null</h4>' +
      '<p>For list fields, the two carry different information and should be used deliberately:</p>' +
      '<ul><li><code>[]</code> — the document addresses this and says there were none. "No adverse events ' +
      'were reported."</li>' +
      '<li><code>null</code> — the document does not address it at all. Silence.</li></ul>' +
      '<p>"No adverse events occurred" and "the paper never mentions adverse events" are very different ' +
      'facts, and a downstream safety analysis needs to tell them apart.</p>' +

      '<h4>5 · Units and currency — do not convert in the schema</h4>' +
      '<p>Extract what the document says, with its unit, as companion fields. Let downstream systems ' +
      'convert.</p>' +
      '<pre><code>"amount": { "type": "number" },\n"currency": { "type": "string" }      // "GBP", as printed</code></pre>' +
      '<p>Converting during extraction bakes in a rate you did not record, at a date you did not record, ' +
      'and destroys the original figure — so nobody can ever check it.</p>' +

      '<div class="callout note"><span class="co-t">Format normalisation is a prompt job</span>' +
      '<p>A schema constrains structure, not the <em>form</em> of values. It will accept ' +
      '<code>"yesterday"</code>, <code>"03/04/26"</code> and <code>"2026-04-03"</code> in a string date ' +
      'field. Add normalisation rules alongside the schema: dates as ISO 8601 with relative expressions ' +
      'resolved to absolute; currency as amount plus code; percentages as decimals. Otherwise you get ' +
      'syntactically valid, mutually inconsistent values.</p></div>',

      example:
      '<h3>Scenario 6 — a schema that stops fabricating</h3>' +
      '<p>Version 1 of a security-advisory extractor marked most fields required. Auditing 200 documents ' +
      'found 23 fabricated CVE identifiers and 41 invented patch dates — all well-formed, all fictional. ' +
      'The schema had made honesty impossible.</p>' +
      '<pre><code>{\n' +
      '  "name": "extract_advisory",\n' +
      '  "description": "Extract structured fields from one security advisory.",\n' +
      '  "input_schema": {\n' +
      '    "type": "object",\n' +
      '    "additionalProperties": false,\n' +
      '    "required": ["advisory_id", "severity", "affected_products"],\n' +
      '    "properties": {\n' +
      '\n' +
      '      "advisory_id": { "type": "string" },\n' +
      '\n' +
      '      "severity": { "enum": ["critical","high","medium","low",\n' +
      '                             "other","unclear"] },\n' +
      '      "severity_detail": { "type": ["string","null"] },\n' +
      '\n' +
      '      "cve_reference": { "type": ["string","null"] },\n' +
      '      "cve_absent_reason": { "enum": ["not_assigned","not_stated",\n' +
      '                                      "not_applicable", null] },\n' +
      '\n' +
      '      "patch_available_date": { "type": ["string","null"],\n' +
      '                                "description": "ISO 8601 date." },\n' +
      '\n' +
      '      "cvss_exact": { "type": ["number","null"] },\n' +
      '      "cvss_min":   { "type": ["number","null"] },\n' +
      '      "cvss_max":   { "type": ["number","null"] },\n' +
      '      "cvss_is_approximate": { "type": "boolean" },\n' +
      '\n' +
      '      "affected_products": {\n' +
      '        "type": ["array","null"],\n' +
      '        "description": "[] = advisory states no products affected. null = advisory does not say.",\n' +
      '        "items": { "type": "object", "required": ["name"],\n' +
      '          "properties": {\n' +
      '            "name":            { "type": "string" },\n' +
      '            "version_range":   { "type": ["string","null"] },\n' +
      '            "fixed_in":        { "type": ["string","null"] } } } },\n' +
      '\n' +
      '      "mitigations": { "type": ["array","null"], "items": { "type": "string" } }\n' +
      '    }\n  }\n}</code></pre>' +
      '<p>Only three fields stayed required, and each is one every advisory necessarily has. Everything ' +
      'that <em>might</em> be absent became nullable — and fabrications went to zero, because there was ' +
      'nothing left to force them.</p>' +
      '<p>Two details worth copying. <code>cve_absent_reason</code> turns a bare null into a diagnosis: ' +
      '"not yet assigned" and "the advisory does not mention one" route differently. And the ' +
      '<code>affected_products</code> description documents the <code>[]</code>-versus-<code>null</code> ' +
      'contract <em>inside the schema</em>, where the model reads it.</p>' +

      '<p>Paired with the normalisation rules in the prompt:</p>' +
      '<pre><code>Extract using the extract_advisory tool. Normalisation rules:\n\n' +
      '  · Dates: ISO 8601 (YYYY-MM-DD). Resolve relative expressions\n' +
      '    ("next Tuesday", "last month") against the advisory\'s own\n' +
      '    publication date. If it cannot be resolved, use null.\n' +
      '  · CVSS: numeric only, no "CVSS:3.1/" prefix.\n' +
      '  · Versions: verbatim as printed. Do not normalise "v2.4" to "2.4".\n' +
      '\n' +
      'Never infer a value that is not stated. A null is always preferable\n' +
      'to a plausible guess — downstream review depends on that distinction.</code></pre>' +
      '<p>And the call itself forces the tool, so no advisory ever comes back as prose:</p>' +
      '<pre><code>tool_choice = {"type": "tool", "name": "extract_advisory"}</code></pre>',

      mistakes: [
        { t: 'Prompting for JSON text instead of using <code>tool_use</code>',
          d: 'Invites fences, preamble, trailing commas and apologies. <code>tool_use</code> with a schema ' +
             'removes the whole class.' },
        { t: 'Stripping markdown fences with a regex',
          d: 'Patches one symptom of prompted JSON and leaves the rest. Change the mechanism instead.' },
        { t: 'Believing a schema prevents semantic errors',
          d: 'It guarantees shape, not meaning. Line items that do not sum are schema-valid ' +
             '(<a href="#/unit/4.4">4.4</a>).' },
        { t: 'Marking a field required so the model "has to find it"',
          d: 'The exam\'s favourite trap. It guarantees fabrication when the value is absent — the ' +
             'constraint is satisfied by invention.' },
        { t: 'Leaving <code>tool_choice</code> on <code>"auto"</code>',
          d: 'The model may answer in prose and your parser breaks. Use <code>"any"</code>, or force the ' +
             'specific tool.' },
        { t: 'Collapsing <code>"other"</code> and <code>"unclear"</code>',
          d: 'They mean different things — an incomplete enum versus an ambiguous document — and route ' +
             'differently.' },
        { t: 'Using <code>[]</code> and <code>null</code> interchangeably for lists',
          d: '"States there were none" and "does not mention it" are different facts. Document the ' +
             'contract in the schema description.' },
        { t: 'Converting currencies or units during extraction',
          d: 'Bakes in an unrecorded rate and destroys the original figure. Extract amount plus code; ' +
             'convert downstream.' },
        { t: 'Relying on the schema for value formatting',
          d: 'A string date field accepts anything. Put normalisation rules in the prompt beside the ' +
             'schema.' }
      ],

      exam:
      '<p>High-yield territory. Expect an item where prompted JSON produces fences or preamble — answer: ' +
      'switch to <code>tool_use</code>, not a regex. Expect an item about a required field producing ' +
      'fabricated values — answer: make it nullable, optionally with a companion enum explaining the ' +
      'absence. Expect the semantic-limit item, where the correct answer notes that <code>tool_use</code> ' +
      'cannot catch line items that do not sum and application-level validation is required. And expect ' +
      'one <code>tool_choice</code> item: <code>"any"</code> when several schemas could apply, forced when ' +
      'one specific tool must run.</p>',

      questions: [
        {
          id: 'q4.3.1', scn: 6,
          stem: '<p>Your extraction pipeline prompts the model to "respond with JSON matching this ' +
            'structure". Roughly 4% of responses fail to parse — some wrapped in markdown code fences, ' +
            'some preceded by an explanatory sentence, occasionally a trailing comma. What is the correct ' +
            'fix?</p>',
          opts: [
            'Define an extraction tool with a JSON schema and use <code>tool_use</code>, so the model fills declared fields rather than generating JSON text.',
            'Add a post-processing step that strips markdown fences and leading prose before parsing.',
            'Strengthen the prompt to state that the response must contain only raw JSON with no fences, preamble or trailing commas.',
            'Add a retry loop that re-requests the extraction whenever parsing fails, with the parse error included in the retry prompt.'
          ],
          ans: [0],
          why: '<code>tool_use</code> with a JSON schema is the reliable approach for guaranteed ' +
            'schema-compliant output: the model populates parameters instead of generating text that ' +
            'imitates JSON, so syntax errors, fences and preamble are eliminated structurally rather than ' +
            'handled case by case.',
          wrong: [
            '',
            'This is the standing trap. A fence-stripping regex handles the failures you have already ' +
            'seen and not the next one — the apology, the trailing comma, the field emitted twice.',
            'A stronger instruction reduces the rate and cannot eliminate it, because generating text that ' +
            'must happen to be valid JSON is inherently error-prone. The mechanism is the problem.',
            'Retries cost a request per failure and are the right tool for <em>semantic</em> errors ' +
            '(<a href="#/unit/4.4">4.4</a>). Paying repeatedly for a class of failure you could ' +
            'eliminate is the wrong trade.'
          ]
        },
        {
          id: 'q4.3.2', scn: 6,
          stem: '<p>You extract security advisories with a strict JSON schema via <code>tool_use</code>. ' +
            '<code>cve_reference</code> is marked required. An audit finds well-formed CVE identifiers in ' +
            'the output that do not exist, for advisories that never mentioned a CVE. What is the ' +
            'fix?</p>',
          opts: [
            'Make <code>cve_reference</code> nullable so absence is representable, optionally adding a companion field recording why it is absent.',
            'Add a validation step that checks each extracted CVE identifier against a public CVE database and rejects unknown ones.',
            'Add an instruction to the prompt stating that the model must never invent a CVE identifier and should leave the field empty if none is present.',
            'Keep the field required but add few-shot examples showing advisories where the CVE appears in an unusual location.'
          ],
          ans: [0],
          why: 'A required field the source does not contain forces the model to produce something, and a ' +
            'plausible identifier is what "something" looks like. Making the field nullable removes the ' +
            'pressure by making "not stated" a legal answer — the guide\'s stated approach for preventing ' +
            'fabrication.',
          wrong: [
            '',
            'External validation catches some fabrications after the fact but not all — a fabricated ' +
            'identifier can collide with a real, unrelated CVE — and it does nothing about the other ' +
            'required fields with the same problem. It treats the symptom.',
            'An instruction that contradicts the schema puts the model in an impossible position: the ' +
            'schema says the field is required and the prompt says leave it empty. Fix the schema.',
            'Examples help when the value is present but expressed unusually. They cannot help when the ' +
            'advisory contains no CVE at all, and the requirement still forces invention.'
          ]
        },
        {
          id: 'q4.3.3', scn: 6,
          stem: '<p>Your invoice extraction uses <code>tool_use</code> with a strict schema, and no ' +
            'response has failed schema validation in a month. However, finance reports invoices where the ' +
            'extracted line items do not sum to the extracted total, and a few where the vendor name ' +
            'appears in the customer field. What is the correct characterisation?</p>',
          opts: [
            'These are semantic errors, which strict schemas do not prevent; catching them requires application-level validation such as computing the sum and comparing it to the stated total.',
            'These indicate the schema is under-constrained; adding numeric constraints and stricter field descriptions will prevent them.',
            'These indicate schema validation is not actually being enforced; verify that <code>strict</code> is set on the tool definition.',
            'These are syntax errors that the schema failed to catch because the fields are typed loosely as numbers and strings.'
          ],
          ans: [0],
          why: 'Strict schemas via tool use eliminate syntax errors but do not prevent semantic errors — ' +
            'values that are individually well-typed and collectively wrong. Arithmetic consistency and ' +
            'correct field placement are application-level checks, and the sum comparison is a canonical ' +
            'example.',
          wrong: [
            '',
            'No schema constraint can express "these numbers must sum to that one", and no field ' +
            'description can guarantee the vendor is not placed in the customer field. This is outside ' +
            'what schemas can express.',
            'Schema validation is evidently working — nothing has failed it. The errors are of a kind that ' +
            'a passing validation says nothing about.',
            'Both problems are semantic, not syntactic. Every value is a legal instance of its declared ' +
            'type; the meaning is wrong.'
          ]
        },
        {
          id: 'q4.3.4', scn: 6,
          stem: '<p>You process a mixed stream of documents — invoices, purchase orders and delivery notes ' +
            '— and have defined one extraction tool per type. The document type is not known before ' +
            'processing. Occasionally the model returns a prose description of the document instead of ' +
            'calling any tool. Which configuration is correct?</p>',
          opts: [
            '<code>tool_choice: "any"</code>, which requires a tool call while letting the model select the schema that fits the document.',
            '<code>tool_choice: "auto"</code> with a prompt instruction to always call exactly one of the three extraction tools.',
            '<code>tool_choice: {"type": "tool", "name": "extract_invoice"}</code>, forcing a single tool and handling type mismatches in post-processing.',
            'A preliminary classification request to determine the document type, followed by a second request forcing the matching tool.'
          ],
          ans: [0],
          why: '<code>"any"</code> guarantees a tool call while leaving the schema choice to the model — ' +
            'exactly the situation the guide describes for guaranteeing structured output when multiple ' +
            'extraction schemas exist and the document type is unknown. The prose failure mode disappears ' +
            'structurally.',
          wrong: [
            '',
            '<code>"auto"</code> permits a text response by definition, so you are using an instruction ' +
            'to suppress a behaviour the setting explicitly allows.',
            'Forcing one schema against a mixed stream extracts purchase orders as invoices. Reconciling ' +
            'that downstream is far harder than letting the model choose.',
            'Workable but wasteful: two requests per document, and the second is redundant because ' +
            '<code>"any"</code> already lets the model classify and extract in a single call.'
          ]
        },
        {
          id: 'q4.3.5', scn: 6,
          stem: '<p>Your clinical-trial schema has an <code>adverse_events</code> array. Downstream safety ' +
            'analysis must distinguish "the paper states no adverse events occurred" from "the paper never ' +
            'discusses adverse events". How should the schema express this?</p>',
          opts: [
            'Allow both an empty array and null, documenting in the schema description that <code>[]</code> means explicitly none and <code>null</code> means not addressed.',
            'Use an empty array for both cases and add a separate boolean field indicating whether the paper discussed adverse events at all.',
            'Make the array required and non-nullable, and have the model insert a single entry reading "none reported" when the paper says so.',
            'Use null for both cases and rely on the extracted methodology text to indicate whether adverse events were discussed.'
          ],
          ans: [0],
          why: 'The two states carry different information, and the schema can represent both directly: ' +
            '<code>[]</code> for an explicit absence of events, <code>null</code> for silence. Documenting ' +
            'the contract in the schema description puts it where the model reads it.',
          wrong: [
            '',
            'Functionally close, but it splits one fact across two fields that can disagree — an empty ' +
            'array with the boolean set true is a contradiction the schema permits. The array\'s own ' +
            'nullability expresses it without the redundancy.',
            'A sentinel entry pollutes the data: every consumer must now special-case a string that looks ' +
            'like an adverse event. Counting events becomes wrong by one.',
            'Collapses the distinction the requirement asks for, then asks a downstream consumer to ' +
            'recover it by reading prose — which is exactly the inference the structured field exists to ' +
            'avoid.'
          ]
        }
      ]
    },

    /* ================================================================== 4.4 */
    {
      id: '4.4',
      short: 'Validation, retry & feedback',
      title: 'Implement validation, retry, and feedback loops for extraction quality',
      scn: [6, 5],
      tldr: 'When validation fails, retry with the <b>original document, the failed extraction, and the ' +
        'specific error</b> — "try again" achieves nothing. Be exact about which field is authoritative, ' +
        'or the model will "fix" the wrong one. Know retry\'s limit: it corrects format and structural ' +
        'errors and <b>cannot conjure information absent from the source</b>, so route those to human ' +
        'review rather than looping. Two supporting patterns: <b>dual extraction</b> (stated versus ' +
        'calculated, with a conflict flag) and <b>detected_pattern</b> for analysing false positives.',

      concept:
      '<h3>Two kinds of validation</h3>' +
      '<div class="tablewrap"><table><thead><tr><th></th><th>Structural</th><th>Semantic</th></tr></thead><tbody>' +
      '<tr><th>Checks</th><td>Types, required fields, enum membership</td><td>Business logic: values sum, ' +
      'dates ordered, cross-field consistency</td></tr>' +
      '<tr><th>Where</th><td>Mostly eliminated up front by <code>tool_use</code> ' +
      '(<a href="#/unit/4.3">4.3</a>); otherwise in code after the response</td><td>Custom validators in ' +
      'your application — Pydantic validators, for instance</td></tr>' +
      '<tr><th>Example failure</th><td><code>severity: "urgent"</code> where the enum permits ' +
      '<code>critical|high|medium|low</code></td><td>Line items summing to $145 against a stated total of ' +
      '$150</td></tr>' +
      '</tbody></table></div>' +
      '<p>Pydantic is worth knowing by name: it validates structure, supports custom validators for ' +
      'semantic rules, and can generate the JSON Schema you pass to <code>tool_use</code> — so one model ' +
      'definition is the single source of truth for both the schema and the validation.</p>' +

      '<h3>Retry with error feedback</h3>' +
      '<p>The retry must carry three things:</p>' +
      '<ol><li>The <b>original document</b> — the model needs the source, not just its own output</li>' +
      '<li>The <b>failed extraction</b> — so it can see what it produced</li>' +
      '<li>The <b>specific validation error</b> — precisely what is wrong</li></ol>' +
      '<p>The third is where retries succeed or fail, and the difference between a vague and a precise ' +
      'error message is large:</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Escalating uselessness</span>' +
      '<pre><code>"Try again."\n\n"The extraction was incorrect."\n\n"The line items do not sum to\n the total."</code></pre>' +
      '<p>The third is genuine information — and still dangerous, because it does not say which side is ' +
      'right. The model will often "fix" the total to match the items it already extracted, destroying the ' +
      'one value that was correct.</p></div>' +
      '<div class="good"><span class="vs-h">Precise and directed</span>' +
      '<pre><code>"The line_items values are incorrect.\n The stated total of $150.00 IS\n correct and must not change.\n Your line items sum to $145.00.\n Re-extract the individual line\n items so that they sum to\n $150.00. Check for a line you\n missed, such as tax, shipping or\n a discount."</code></pre></div></div>' +
      '<p>That message does four things: names the wrong field, <b>pins the authoritative one</b>, states ' +
      'the arithmetic gap, and suggests where the missing value probably lives. This is the exam\'s ' +
      'canonical example of specific error feedback.</p>' +

      fig({
        vb: '0 0 700 260',
        caption: 'The retry loop, with the two exits that matter: success, and the recognition that ' +
          'retrying cannot help.',
        body:
          '<rect x="24" y="20" width="130" height="38" rx="6" class="box"/>' +
          '<text x="89" y="44" text-anchor="middle" font-size="10.5" font-weight="600">extract</text>' +
          '<path class="arrow" d="M154 39 L196 39" marker-end="url(#ah)"/>' +
          '<polygon points="266,17 336,39 266,61 196,39" class="boxA"/>' +
          '<text x="266" y="36" text-anchor="middle" font-size="10">validate</text>' +
          '<text x="266" y="48" text-anchor="middle" font-size="10">passes?</text>' +
          '<path class="arrow" d="M336 39 L396 39" marker-end="url(#ah)"/>' +
          '<text x="366" y="31" text-anchor="middle" font-size="9" class="dim">yes</text>' +
          '<rect x="396" y="20" width="120" height="38" rx="6" class="boxOk"/>' +
          '<text x="456" y="44" text-anchor="middle" font-size="10.5">accept</text>' +

          '<path class="arrow" d="M266 61 L266 98" marker-end="url(#ah)"/>' +
          '<text x="276" y="83" font-size="9" class="dim">no</text>' +

          '<polygon points="266,98 356,126 266,154 176,126" class="box"/>' +
          '<text x="266" y="120" text-anchor="middle" font-size="9.5">is the info</text>' +
          '<text x="266" y="132" text-anchor="middle" font-size="9.5">even in the</text>' +
          '<text x="266" y="144" text-anchor="middle" font-size="9.5">document?</text>' +

          '<path class="arrow" d="M356 126 L420 126" marker-end="url(#ah)"/>' +
          '<text x="388" y="118" text-anchor="middle" font-size="9" class="dim">yes</text>' +
          '<rect x="420" y="104" width="256" height="44" rx="6" class="boxA"/>' +
          '<text x="548" y="122" text-anchor="middle" font-size="10.5" font-weight="600">retry with specific feedback</text>' +
          '<text x="548" y="138" text-anchor="middle" font-size="9.5" class="dim">document + failed output + which field is authoritative</text>' +
          '<path class="arrow dashed" d="M548 148 L548 170 L89 170 L89 58" marker-end="url(#ah)"/>' +

          '<path class="arrow" d="M266 154 L266 196" marker-end="url(#ah)"/>' +
          '<text x="276" y="178" font-size="9" class="dim">no</text>' +
          '<rect x="140" y="196" width="256" height="44" rx="6" class="boxBad"/>' +
          '<text x="268" y="214" text-anchor="middle" font-size="10.5" font-weight="600">human review — do not loop</text>' +
          '<text x="268" y="230" text-anchor="middle" font-size="9.5" class="dim">two failures on the same field ⇒ it is not there</text>' +

          '<text x="420" y="214" font-size="10" class="dim">Retries fix format and structure.</text>' +
          '<text x="420" y="230" font-size="10" class="dim">They cannot supply a missing fact.</text>'
      }) +

      '<h3>When retry cannot work</h3>' +
      '<p>The guide is explicit that retries are <b>ineffective when the required information is simply ' +
      'absent from the source</b>. Retrying then produces one of two bad outcomes: the same null again ' +
      '(wasted requests) or, worse, a fabricated value as the model tries harder to satisfy you.</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Failure</th><th>Retry?</th></tr></thead><tbody>' +
      '<tr><td>Date returned as <code>03/04/26</code> where ISO 8601 was required</td><td><b>Yes</b> — ' +
      'format error, the value is present</td></tr>' +
      '<tr><td>Line items do not sum to the total</td><td><b>Yes</b> — structural, likely a missed line, ' +
      'if you pin the authoritative field</td></tr>' +
      '<tr><td>Vendor name landed in the customer field</td><td><b>Yes</b> — misplacement, both values ' +
      'exist</td></tr>' +
      '<tr><td>The referenced amendment is in a schedule that was not provided</td><td><b>No</b> — the ' +
      'information is not in the input. Human review.</td></tr>' +
      '<tr><td>Same field fails validation twice with specific feedback</td><td><b>No</b> — strong signal ' +
      'it is absent. Route to a human.</td></tr>' +
      '</tbody></table></div>' +
      '<p>The operational rule: <b>two failures on the same field with specific feedback means stop</b>. ' +
      'Loop further and you are paying for requests whose most likely successful outcome is a ' +
      'fabrication.</p>' +

      '<h3>Dual extraction — self-validation inside the schema</h3>' +
      '<p>A neat pattern for catching internal contradictions without a second pass: have the model ' +
      'extract the <b>stated</b> value and independently <b>compute</b> one from the raw data, then flag ' +
      'disagreement.</p>' +
      '<pre><code>{\n' +
      '  "stated_total":     150.00,        // as printed on the document\n' +
      '  "calculated_total": 145.00,        // summed from line_items\n' +
      '  "conflict_detected": true,         // the model\'s own comparison\n' +
      '  "line_items": [ … ]\n' +
      '}</code></pre>' +
      '<p>The flag is a routing signal: <code>conflict_detected</code> sends the document to human review ' +
      'without you having to re-derive the arithmetic. And it catches a case your own validator would ' +
      'miss: a document whose printed total genuinely disagrees with its own line items. That is not an ' +
      'extraction error at all — it is a defective source document, and the right response is a human, ' +
      'not a retry.</p>' +
      '<div class="callout note"><span class="co-t">Belt and braces</span>' +
      '<p>Dual extraction does not replace your own validation. The model computing the sum is still the ' +
      'model; compute it in code too. The value of the pattern is that it distinguishes ' +
      '<em>extraction</em> error from <em>document</em> inconsistency, which your validator alone ' +
      'cannot.</p></div>' +

      '<h3><code>detected_pattern</code> — closing the feedback loop</h3>' +
      '<p>For review systems, record in each finding <b>what code construct triggered it</b>:</p>' +
      '<pre><code>{\n' +
      '  "file": "src/api/orders.py", "line": 88,\n' +
      '  "severity": "medium",\n' +
      '  "issue": "Broad exception handler may mask upstream failures",\n' +
      '  "detected_pattern": "bare-except-returning-value",\n' +
      '  "suggested_fix": "Catch the specific exception and re-raise."\n' +
      '}</code></pre>' +
      '<p>When developers dismiss findings, you can now aggregate dismissals <b>by pattern</b> rather than ' +
      'guessing. If <code>bare-except-returning-value</code> is dismissed 4% of the time and ' +
      '<code>uppercase-constant-in-async-function</code> 71% of the time, you know precisely which prompt ' +
      'category to fix — and you have the evidence to disable it in the meantime ' +
      '(<a href="#/unit/4.1">4.1</a>). This is a feedback-loop design pattern, not merely an extraction ' +
      'field.</p>',

      example:
      '<h3>Scenario 6 — the retry that fixes the wrong field</h3>' +
      '<p>An invoice extraction returns a total of $1,240.00 with line items summing to $1,150.00. Your ' +
      'validator catches it. Two retry prompts, two very different outcomes.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Retry v1 — underspecified</span>' +
      '<pre><code>"The extracted values are\n inconsistent: the line items do\n not sum to the total. Please\n re-extract."</code></pre>' +
      '<p><b>Result:</b> the model returns the same line items with the total changed to $1,150.00. ' +
      'Validation now passes. The data is wrong — the invoice really says $1,240.00 and a $90 freight line ' +
      'was missed. You have converted a caught error into an undetectable one.</p></div>' +
      '<div class="good"><span class="vs-h">Retry v2 — directed</span>' +
      '<pre><code>"The line_items array is\n incomplete.\n\n The stated total of $1,240.00 is\n CORRECT and must not be changed.\n Your line items sum to\n $1,150.00, a shortfall of $90.00.\n\n Re-extract line_items so they sum\n to $1,240.00. A line is probably\n missing — check for freight,\n handling, tax or a surcharge,\n including any line printed\n outside the main table."</code></pre>' +
      '<p><b>Result:</b> the model finds "Freight & handling $90.00" printed below the table. Both values ' +
      'now correct.</p></div></div>' +
      '<p>The lesson generalises well beyond invoices: <b>when two extracted values disagree, tell the ' +
      'model which one to trust.</b> Otherwise it will resolve the contradiction in whichever direction is ' +
      'easiest, and easiest usually means editing the single number rather than re-reading the ' +
      'document.</p>' +

      '<h3>The loop, with its stopping condition</h3>' +
      '<pre><code>def extract_with_validation(document, max_attempts=2):\n' +
      '    """Two attempts, then a human. Not an unbounded loop."""\n' +
      '    attempt, failures = 0, []\n' +
      '\n' +
      '    while attempt < max_attempts:\n' +
      '        result = call_claude(document, prior_failures=failures)\n' +
      '        errors = validate(result)          # structural + semantic\n' +
      '\n' +
      '        if not errors:\n' +
      '            return result, "accepted"\n' +
      '\n' +
      '        # Absent information will not appear on a retry.\n' +
      '        if any(e.kind == "information_absent" for e in errors):\n' +
      '            return result, "human_review:absent_from_source"\n' +
      '\n' +
      '        # Same field failing twice with specific feedback: stop.\n' +
      '        if attempt >= 1 and same_fields(errors, failures[-1]):\n' +
      '            return result, "human_review:retry_ineffective"\n' +
      '\n' +
      '        failures.append(errors)            # feeds the next prompt\n' +
      '        attempt += 1\n' +
      '\n' +
      '    return result, "human_review:max_attempts"</code></pre>' +
      '<p>Note what the loop does <em>not</em> do: keep going. Every exit other than success routes to a ' +
      'human, and the two early exits — information absent, same field twice — exist because those are ' +
      'the cases where additional attempts trade money for fabrication risk.</p>',

      mistakes: [
        { t: 'Retrying with "try again" or "that was incorrect"',
          d: 'Carries no information. Include the document, the failed output, and the specific validation ' +
             'error.' },
        { t: 'Saying values disagree without saying which is authoritative',
          d: 'The model edits whichever is easier — usually the single total — silently destroying the ' +
             'correct value and passing validation.' },
        { t: 'Retrying when the information is absent from the source',
          d: 'It cannot succeed, and the most likely "success" is a fabricated value. Route to human ' +
             'review.' },
        { t: 'Looping indefinitely',
          d: 'Two failures on the same field with specific feedback means the value is not there. Stop ' +
             'and escalate.' },
        { t: 'Omitting the original document from the retry',
          d: 'Asking the model to correct its output without the source invites it to make the numbers ' +
             'consistent rather than correct.' },
        { t: 'Assuming a validation pass means the data is right',
          d: 'A retry that "fixed" the wrong field passes validation. Consistency is not accuracy.' },
        { t: 'Treating a document\'s own inconsistency as an extraction error',
          d: 'Some invoices genuinely do not add up. Dual extraction with a conflict flag distinguishes ' +
             'that from a misread, and it needs a human rather than a retry.' },
        { t: 'Collecting dismissals without recording what triggered the finding',
          d: 'Without <code>detected_pattern</code> you cannot tell which category produces the false ' +
             'positives, so you cannot fix it.' }
      ],

      exam:
      '<p>The reliable item is the sum mismatch: what should the retry say? The correct option names the ' +
      'incorrect field, <b>states that the stated total is correct and must not change</b>, and asks for ' +
      'the line items to be re-extracted. Distractors include a generic "try again", and an option that ' +
      'reports the discrepancy without pinning the authoritative field. Expect a second item on retry\'s ' +
      'limit — information in an external document that was never supplied — where the answer is human ' +
      'review rather than another attempt. <code>detected_pattern</code> and dual extraction appear as ' +
      'supporting options.</p>',

      questions: [
        {
          id: 'q4.4.1', scn: 6,
          stem: '<p>Validation detects that extracted line items sum to $1,150.00 while the extracted ' +
            'total is $1,240.00. The invoice image clearly prints $1,240.00. Which retry prompt is most ' +
            'likely to produce a correct extraction?</p>',
          opts: [
            'State that the line items are incomplete, that the stated total of $1,240.00 is correct and must not be changed, give the $90.00 shortfall, and ask for line items that sum to the stated total — suggesting freight, tax or surcharge lines.',
            'State that the line items and the total are inconsistent and ask the model to re-extract both so that they agree.',
            'Return the failed extraction with the note "validation failed: totals do not reconcile" and ask for a corrected version.',
            'Ask the model to recompute the total from the line items it extracted, so the two values are guaranteed to agree.'
          ],
          ans: [0],
          why: 'Specific feedback must identify which field is wrong <em>and</em> which is authoritative. ' +
            'Pinning the stated total prevents the model resolving the contradiction by editing the one ' +
            'value that was right, and naming the likely missing line types directs the re-read.',
          wrong: [
            '',
            'Reporting the inconsistency without pinning the correct value is the trap: the model will ' +
            'usually adjust the single total to match the items it already has, which passes validation ' +
            'and corrupts the data.',
            'A bare validation message gives no direction at all. The model does not know which value to ' +
            'trust or where to look, so it guesses.',
            'This guarantees agreement and guarantees error — it discards the printed total, which was ' +
            'correct, in favour of an incomplete sum. Consistency is not accuracy.'
          ]
        },
        {
          id: 'q4.4.2', scn: 6,
          stem: '<p>A contract extraction returns null for <code>renewal_terms</code>. The contract states ' +
            'that renewal terms are "as set out in Schedule 4", and Schedule 4 was not included in the ' +
            'file supplied to the pipeline. Retry with specific feedback has failed twice. What is the ' +
            'correct handling?</p>',
          opts: [
            'Route the document to human review, recording that the required information is absent from the supplied source.',
            'Retry with a stronger instruction requiring the model to infer the renewal terms from the surrounding contractual context.',
            'Retry with the schema field marked required, so the model must produce a value rather than returning null.',
            'Accept the null and flag the field as low confidence, letting downstream consumers decide whether to act on it.'
          ],
          ans: [0],
          why: 'Retries correct format and structural errors; they cannot supply information that is not ' +
            'in the input. Two failures with specific feedback on the same field is the signal to stop — ' +
            'further attempts risk a fabricated value, which is worse than a null.',
          wrong: [
            '',
            'Asking for inference invites invention. Renewal terms are legally consequential and cannot be ' +
            'guessed from context.',
            'Making the field required is the exact mechanism that produces fabrication ' +
            '(<a href="#/unit/4.3">4.3</a>). It converts an honest null into a confident fiction.',
            'Better than fabricating, but it silently hands an incomplete extraction downstream with no ' +
            'route to resolution. The missing schedule is retrievable by a human — the document is not ' +
            'defective, the input was.'
          ]
        },
        {
          id: 'q4.4.3', scn: 6,
          stem: '<p>You want to catch invoices whose printed total genuinely disagrees with their own ' +
            'printed line items, distinguishing that from cases where your extraction misread something. ' +
            'Which schema design supports this?</p>',
          opts: [
            'Extract <code>stated_total</code> and <code>calculated_total</code> as separate fields together with a <code>conflict_detected</code> boolean, and route conflicts to human review.',
            'Extract only <code>stated_total</code> and have application code compute the sum from line items, treating any mismatch as an extraction error to retry.',
            'Extract only <code>calculated_total</code>, derived from line items, since a computed value cannot be misread.',
            'Extract <code>stated_total</code> and add a numeric constraint to the schema requiring it to equal the sum of the line items.'
          ],
          ans: [0],
          why: 'Dual extraction makes the comparison explicit in the output, and the flag becomes a ' +
            'routing signal. Critically, it separates two different situations: a mismatch may mean your ' +
            'extraction erred, or that the source document is internally inconsistent — and the second ' +
            'needs a human, not a retry.',
          wrong: [
            '',
            'Computing the sum in code is correct and necessary, but treating every mismatch as an ' +
            'extraction error means you retry documents that are themselves inconsistent — a loop that ' +
            'cannot converge.',
            'Discarding the printed total throws away the authoritative figure. You would never detect a ' +
            'missed line item, because the computed total is always self-consistent.',
            'JSON Schema cannot express a relationship between one field and the sum of another array. ' +
            'This is the class of check that schemas structurally cannot perform ' +
            '(<a href="#/unit/4.3">4.3</a>).'
          ]
        },
        {
          id: 'q4.4.4', scn: 5,
          stem: '<p>Developers dismiss about 40% of your review findings, and you want to determine ' +
            'systematically which categories are generating false positives rather than guessing. What ' +
            'should each finding record?</p>',
          opts: [
            'A <code>detected_pattern</code> field naming the code construct that triggered the finding, so dismissals can be aggregated by pattern.',
            'A confidence score, so dismissal rates can be correlated against the model\'s own certainty.',
            'The full model reasoning that led to the finding, so dismissed findings can be read back and analysed individually.',
            'A category label from the review taxonomy, so dismissals can be grouped by whether they are security, correctness, performance or style.'
          ],
          ans: [0],
          why: 'Recording the triggering construct lets you aggregate dismissals by pattern and identify ' +
            'precisely which constructs produce false positives — the guide\'s stated purpose for ' +
            '<code>detected_pattern</code>. That gives you the evidence to fix, or temporarily disable, ' +
            'one specific rule.',
          wrong: [
            '',
            'Correlating against an uncalibrated signal tells you little, and confidence does not identify ' +
            '<em>which construct</em> is misfiring — which is what you need in order to fix the prompt.',
            'Reading reasoning case by case does not scale to hundreds of findings and yields anecdotes ' +
            'rather than rates. The point is systematic aggregation.',
            'Useful and too coarse. Knowing that "style" is dismissed often does not tell you whether the ' +
            'problem is one construct or twenty, so you cannot target the fix.'
          ]
        },
        {
          id: 'q4.4.5', scn: 6,
          stem: '<p>Which failures are likely to be corrected by a retry with specific error ' +
            'feedback?</p>',
          opts: [
            'A date returned as <code>04/03/26</code> where the schema and prompt require ISO 8601.',
            'A vendor name extracted into the <code>customer_name</code> field when both names appear on the document.',
            'A null <code>total_value</code> for a contract that states the value only in an appendix that was not supplied.',
            'A null <code>sample_size</code> for a paper that describes its sample only as "a large cohort" with no figure.'
          ],
          ans: [0, 1],
          why: 'Both correctable cases involve information that <em>is</em> present in the source and was ' +
            'merely mis-formatted or misplaced. Specific feedback tells the model what was wrong and it ' +
            'can re-read to correct it.',
          wrong: [
            '', '',
            'The value is in a document that was never provided. No amount of re-reading the supplied ' +
            'input will surface it, and pressing harder invites fabrication. Human review.',
            'The paper states no figure. A retry either returns the same null or invents a number — and ' +
            'the correct output here is exactly the null, ideally with a note recording the qualitative ' +
            'description.'
          ]
        }
      ]
    },

    /* ================================================================== 4.5 */
    {
      id: '4.5',
      short: 'Batch processing strategy',
      title: 'Design efficient batch processing strategies',
      scn: [6, 5],
      tldr: 'The Message Batches API gives <b>50% cost savings</b> with a processing window of <b>up to 24 ' +
        'hours</b> and <b>no latency SLA</b>. So: batch for latency-tolerant work — overnight reports, ' +
        'weekly audits, nightly test generation — and keep the synchronous API for anything a developer is ' +
        'waiting on. Correlate results by <b><code>custom_id</code></b>, never by position. Batches ' +
        '<b>cannot do multi-turn tool calling</b>. And test your prompt on a small sample before ' +
        'committing 100+ documents.',

      concept:
      '<h3>The tradeoff, precisely</h3>' +
      '<div class="tablewrap"><table><thead><tr><th></th><th>Synchronous</th><th>Message Batches</th></tr></thead><tbody>' +
      '<tr><th>Cost</th><td>Standard</td><td><b>50% saving</b></td></tr>' +
      '<tr><th>Latency</th><td>Seconds</td><td><b>Up to 24 hours, no SLA</b></td></tr>' +
      '<tr><th>Multi-turn tool calling</th><td>Yes</td><td><b>No</b></td></tr>' +
      '<tr><th>Correlation</th><td>Request/response pairing is direct</td><td>By <code>custom_id</code> — ' +
      'results return in arbitrary order</td></tr>' +
      '<tr><th>Right for</th><td>Blocking pre-merge checks, interactive agents, anything a person is ' +
      'waiting on</td><td>Overnight debt reports, weekly security audits, nightly test generation, bulk ' +
      'document extraction</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout rule"><span class="co-t">The phrase that decides it</span>' +
      '<p><b>No guaranteed latency SLA.</b> Batches often finish much faster than 24 hours, and that is ' +
      'not a commitment you can build on. "It is usually quick" is not an acceptable basis for a check ' +
      'that blocks a merge — so the decision rule is <b>latency tolerance, not cost</b>. Mixing the two ' +
      'approaches by workload is the correct architecture, not a compromise.</p></div>' +

      '<h3><code>custom_id</code>: correlation, not ordering</h3>' +
      '<p>Attach a <code>custom_id</code> to every request in the batch. The same id comes back on the ' +
      'corresponding result. <b>Results arrive in arbitrary order</b>, so keying by position is a bug that ' +
      'will silently mismatch every document with another document\'s extraction.</p>' +
      '<pre><code>requests = [\n' +
      '  {"custom_id": "inv-2026-04-0031", "params": {...}},\n' +
      '  {"custom_id": "inv-2026-04-0032", "params": {...}},\n' +
      ']\n\n' +
      '# later — key by id, never by index\nfor result in batch_results:\n' +
      '    doc = documents_by_id[result.custom_id]        # correct\n' +
      '    # doc = documents[i]                          # silently wrong</code></pre>' +
      '<p>Make the id meaningful — the source filename or a document identifier — so a failed result tells ' +
      'you which input to resubmit without a lookup table.</p>' +
      '<div class="callout trap"><span class="co-t">A distractor that inverts the facts</span>' +
      '<p>Watch for an option claiming batch processing <em>lacks</em> request correlation, or that ' +
      'results must be matched by order. Correlation is exactly what <code>custom_id</code> provides. The ' +
      'real constraint is the 24-hour window.</p></div>' +

      '<h3>No multi-turn tool calling</h3>' +
      '<p>Batch requests cannot execute a tool mid-request and continue with the result. If your workflow ' +
      'needs the model to call a tool, receive output, and reason further, it cannot be batched.</p>' +
      '<p>Note the boundary carefully, because it is easy to over-read: <b>using <code>tool_use</code> to ' +
      'get structured output is fine</b> — that is a single turn producing a structured result. What you ' +
      'cannot do is an agentic loop. So batched extraction with a schema: yes. A batched agent that fetches ' +
      'a referenced document mid-analysis: no.</p>' +

      '<h3>SLA arithmetic</h3>' +
      '<p>The guide expects you to do this calculation, so make it automatic.</p>' +
      fig({
        vb: '0 0 700 190',
        caption: 'A 30-hour SLA against a 24-hour worst case leaves a 6-hour window. Submitting every 4 ' +
          'hours keeps margin for a failed batch.',
        body:
          '<line x1="40" y1="60" x2="660" y2="60" class="stroke"/>' +
          (function () {
            var s = '';
            for (var h = 0; h <= 30; h += 6) {
              var x = 40 + (h / 30) * 620;
              s += '<line x1="' + x + '" y1="55" x2="' + x + '" y2="65" class="stroke"/>';
              s += '<text x="' + x + '" y="80" text-anchor="middle" font-size="9.5" class="dim">' + h + 'h</text>';
            }
            return s;
          })() +
          '<rect x="40" y="28" width="124" height="22" rx="4" class="boxOk"/>' +
          '<text x="102" y="44" text-anchor="middle" font-size="10">submit window</text>' +
          '<text x="102" y="20" text-anchor="middle" font-size="9.5" class="dim">0–6h</text>' +
          '<rect x="164" y="28" width="496" height="22" rx="4" class="box"/>' +
          '<text x="412" y="44" text-anchor="middle" font-size="10">worst-case processing — up to 24h</text>' +
          '<line x1="660" y1="20" x2="660" y2="70" class="stroke" style="stroke:var(--bad)"/>' +
          '<text x="640" y="16" text-anchor="end" font-size="10" style="fill:var(--bad)">30h deadline</text>' +

          '<text x="40" y="112" font-size="10.5" font-weight="600">30h SLA − 24h worst case = a 6h window in which to submit.</text>' +
          '<text x="40" y="132" font-size="10.5">Submit every 4h, not every 6: a batch that fails at hour 5 can still be resubmitted</text>' +
          '<text x="40" y="148" font-size="10.5">and finish inside the deadline. Submitting once and hoping has no recovery path.</text>' +
          '<rect x="40" y="162" width="620" height="22" rx="4" class="boxA"/>' +
          '<text x="350" y="178" text-anchor="middle" font-size="10.5" font-weight="600">Rule: submission cadence ≤ SLA − worst-case window, minus margin for one retry</text>'
      }) +

      '<h3>Handling failures</h3>' +
      '<p>Each result carries its own status, so a partial failure is normal and cheap to handle: ' +
      '<b>resubmit only the failures, identified by <code>custom_id</code></b>, with whatever modification ' +
      'the failure implies. A document that exceeded the context limit gets chunked before resubmission; ' +
      'one that hit a transient error is resubmitted unchanged.</p>' +
      '<pre><code>failed = [r for r in results if r.result.type != "succeeded"]\n' +
      'resubmit = []\nfor r in failed:\n' +
      '    doc = documents_by_id[r.custom_id]\n' +
      '    if r.result.error.type == "context_length_exceeded":\n' +
      '        resubmit += chunk(doc)                 # split, new custom_ids\n' +
      '    else:\n' +
      '        resubmit.append(request_for(doc))      # transient — as-is</code></pre>' +

      '<h3>Sample before you scale</h3>' +
      '<p>Test the prompt on <b>5–10 documents</b> before submitting 100+. The reason is economic: a ' +
      'systematic prompt flaw discovered after a 500-document batch means resubmitting 500 documents, and ' +
      'two rounds of that has consumed the entire 50% saving plus a day of wall-clock time. A ten-document ' +
      'sample costs almost nothing and catches the flaw.</p>',

      example:
      '<h3>Scenario 5 — the manager who wants everything batched</h3>' +
      '<p>Two workflows currently run synchronously. A manager proposes moving both to the Batch API for ' +
      'the 50% saving.</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Workflow</th><th>Waiting on it</th><th>Decision</th></tr></thead><tbody>' +
      '<tr><td>Blocking pre-merge check</td><td>A developer, right now, before they can merge</td>' +
      '<td><b>Keep synchronous.</b> A 24-hour worst case blocks the merge for a day. That batches usually ' +
      'finish sooner is not a guarantee you can put in front of a team.</td></tr>' +
      '<tr><td>Overnight technical debt report</td><td>Nobody until tomorrow morning</td>' +
      '<td><b>Move to batch.</b> Submit at 19:00, read at 09:00 — 14 hours of tolerance against a 24-hour ' +
      'worst case, and take the 50%.</td></tr>' +
      '</tbody></table></div>' +
      '<p>The right answer is <b>both</b>, split by latency tolerance. Note the 14-hour figure though: if ' +
      'the report absolutely must be there at 09:00, an overnight submission has less margin than it ' +
      'appears, and you would submit earlier in the evening or accept the occasional late report.</p>' +

      '<h3>Scenario 6 — a 500-document extraction under a 30-hour SLA</h3>' +
      '<pre><code>Requirement: 500 contracts/day extracted, results within 30 hours\n' +
      '             of receipt. Cost matters. No human waits on any one doc.\n' +
      '\n' +
      '1 · Validate the prompt on a sample\n' +
      '    10 contracts, synchronous. Measure first-pass validation rate.\n' +
      '    Below ~90%? Fix the prompt before batching anything.\n' +
      '\n' +
      '2 · Cadence from the arithmetic\n' +
      '    30h SLA − 24h worst case = 6h window. Submit every 4h,\n' +
      '    leaving room to resubmit once and still land inside 30h.\n' +
      '\n' +
      '3 · Meaningful custom_ids\n' +
      '    custom_id = the contract reference, e.g. "CTR-2026-04-0177".\n' +
      '    A failure then names its own input; no lookup table needed.\n' +
      '\n' +
      '4 · Extraction shape\n' +
      '    tool_use with a JSON schema — fine in a batch, single turn.\n' +
      '    NOT an agent that fetches referenced schedules mid-analysis:\n' +
      '    that needs multi-turn tool calling, which batches cannot do.\n' +
      '\n' +
      '5 · Failure handling\n' +
      '    Resubmit only failures, by custom_id. Oversized contracts get\n' +
      '    chunked; transient errors go back unchanged.\n' +
      '\n' +
      '6 · Validation and review\n' +
      '    Validate every result (4.4). Route conflicts and low-confidence\n' +
      '    extractions to human review (5.5) — that queue is synchronous,\n' +
      '    because a reviewer is waiting on it.</code></pre>' +
      '<p>Step 4 is the one people get wrong. The instinct is that "tool use" and "batch" are ' +
      'incompatible. They are not — a single-turn structured extraction is exactly what batches are good ' +
      'at. What is incompatible is the loop.</p>',

      mistakes: [
        { t: 'Putting a blocking check on the Batch API to save money',
          d: 'Up to 24 hours with no SLA. Developers cannot wait, and "usually faster" is not a ' +
             'guarantee.' },
        { t: 'Choosing the API by cost rather than latency tolerance',
          d: 'Cost is the reward; latency tolerance is the constraint. Mixing approaches by workload is ' +
             'correct architecture.' },
        { t: 'Matching batch results by position',
          d: 'Results return in arbitrary order. Key by <code>custom_id</code> or you will silently pair ' +
             'every document with the wrong extraction.' },
        { t: 'Believing batches lack request correlation',
          d: 'They have <code>custom_id</code> for exactly this. The real constraint is the 24-hour ' +
             'window.' },
        { t: 'Batching an agentic workflow',
          d: 'No multi-turn tool calling. Single-turn <code>tool_use</code> for structured output is ' +
             'fine; a tool-calling loop is not.' },
        { t: 'Submitting once against a tight SLA',
          d: 'No recovery if that batch fails. Compute the window (SLA − 24h) and submit on a cadence ' +
             'inside it.' },
        { t: 'Resubmitting the whole batch after partial failure',
          d: 'Resubmit only the failures, identified by <code>custom_id</code>, with the modification ' +
             'their error implies.' },
        { t: 'Skipping the sample run',
          d: 'A systematic prompt flaw across 500 documents means resubmitting 500. Two rounds erase the ' +
             '50% saving. Test on 5–10 first.' }
      ],

      exam:
      '<p>Official sample question 11 is here — the manager proposing both workflows move to batch — and ' +
      'the answer is <b>batch the overnight report, keep the pre-merge check synchronous</b>. Note that ' +
      'one distractor is wrong specifically because it claims batch results cannot be correlated; know ' +
      'that <code>custom_id</code> refutes it. Expect the SLA arithmetic (30 − 24 = a 6-hour window, so ' +
      'submit every 4–6 hours) and possibly the tool-calling constraint, where the discriminator is ' +
      'single-turn structured output versus a multi-turn loop.</p>',

      questions: [
        {
          id: 'q4.5.1', scn: 5, official: true,
          stem: '<p>Your team wants to reduce API costs for automated analysis. Currently, real-time ' +
            'Claude calls power two workflows: (1) a blocking pre-merge check that must complete before ' +
            'developers can merge, and (2) a technical debt report generated overnight for review the next ' +
            'morning. Your manager proposes switching both to the Message Batches API for its 50% cost ' +
            'savings. How should you evaluate this proposal?</p>',
          opts: [
            'Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.',
            'Switch both workflows to batch processing with status polling to check for completion.',
            'Keep real-time calls for both workflows to avoid batch result ordering issues.',
            'Switch both to batch processing with a timeout fallback to real-time if batches take too long.'
          ],
          ans: [0],
          why: 'The Message Batches API offers 50% cost savings but has processing times up to 24 hours ' +
            'with no guaranteed latency SLA. That makes it unsuitable for blocking pre-merge checks where ' +
            'developers wait for results, and ideal for overnight jobs like technical debt reports. ' +
            'Matching each API to its appropriate use case is the correct architecture.',
          wrong: [
            '',
            'Polling does not change the underlying latency. Relying on batches "often" completing quickly ' +
            'is not acceptable for a workflow that blocks a merge.',
            'This reflects a misconception — batch results can be correlated using <code>custom_id</code> ' +
            'fields, so ordering is not a problem. It also forgoes a legitimate 50% saving on the ' +
            'overnight job.',
            'Adds unnecessary complexity, and a fallback that re-runs work synchronously can end up ' +
            'costing more than the saving. The simpler solution is matching each API to its use case.'
          ]
        },
        {
          id: 'q4.5.2', scn: 6,
          stem: '<p>Your SLA requires extraction results within 30 hours of document receipt. You are ' +
            'using the Message Batches API. What submission strategy meets the SLA reliably?</p>',
          opts: [
            'Submit batches every 4–6 hours, since the 24-hour worst-case processing window leaves roughly a 6-hour submission window and a shorter cadence preserves room to resubmit a failed batch.',
            'Submit one batch per day at a fixed time, since 24 hours of processing comfortably fits inside a 30-hour SLA.',
            'Submit batches every 24 hours and monitor progress, escalating to synchronous processing for any batch that has not completed after 20 hours.',
            'Submit documents individually as they arrive, so each one begins processing at the earliest possible moment.'
          ],
          ans: [0],
          why: 'The arithmetic is 30 − 24 = a 6-hour window in which a submission can still meet the ' +
            'deadline. Submitting every 4 hours keeps every document inside that window and leaves margin ' +
            'to resubmit once if a batch fails, which a 6-hour cadence with no slack does not.',
          wrong: [
            '',
            'A once-daily submission means a document arriving just after the cutoff waits nearly 24 hours ' +
            'before submission, then up to 24 more — well past 30. It also has no recovery path if the ' +
            'batch fails.',
            'The cadence is the same problem as above, and the fallback contradicts the reason for ' +
            'batching: re-running a day\'s documents synchronously costs more than the saving. Building a ' +
            'process around the absence of an SLA is fragile.',
            'Individual submission forgoes the throughput and cost benefit of batching altogether, and ' +
            'each single-request batch is still subject to the same 24-hour window.'
          ]
        },
        {
          id: 'q4.5.3', scn: 6,
          stem: '<p>You submitted 500 documents in one batch. 480 succeeded; 12 failed with ' +
            '<code>context_length_exceeded</code> and 8 with a transient error. What is the correct ' +
            'recovery?</p>',
          opts: [
            'Resubmit only the 20 failures, identified by <code>custom_id</code> — chunking the 12 oversized documents into smaller requests and resubmitting the 8 transient failures unchanged.',
            'Resubmit the entire batch of 500, since partial resubmission risks inconsistency between documents processed in different batches.',
            'Resubmit the 20 failures synchronously, since the batch route has already demonstrated it cannot handle them.',
            'Resubmit the 8 transient failures and route the 12 oversized documents to human review, since exceeding the context limit indicates the document is unsuitable for automated extraction.'
          ],
          ans: [0],
          why: 'Each result carries its own status and <code>custom_id</code>, so failures are precisely ' +
            'identifiable and individually resubmittable. The remedy follows the error type — chunk what ' +
            'was too large, resend what failed transiently — which is exactly the handling the guide ' +
            'describes.',
          wrong: [
            '',
            'Reprocessing 480 successful documents wastes 96% of the cost for no benefit. Documents are ' +
            'extracted independently, so there is no cross-document consistency to preserve.',
            'The transient failures would very likely succeed on a batch retry, and the oversized ones ' +
            'fail synchronously too — the context limit is the same either way. This pays full price ' +
            'unnecessarily.',
            'Oversized documents are a chunking problem, not an unsuitability problem. Sending them to ' +
            'human review discards a mechanical fix and consumes scarce reviewer capacity.'
          ]
        },
        {
          id: 'q4.5.4', scn: 6,
          stem: '<p>Which workflows can run on the Message Batches API?</p>',
          opts: [
            'Single-turn extraction from 1,000 documents using <code>tool_use</code> with a JSON schema, where results are consumed the next morning.',
            'A weekly security audit that analyses the repository and produces a report reviewed at the start of the following week.',
            'An agentic analysis where the model requests a referenced document mid-analysis, receives its contents, and continues reasoning.',
            'A pull request style check that must post comments before the author\'s next push, typically within a few minutes.'
          ],
          ans: [0, 1],
          why: 'Both correct options are latency-tolerant and single-turn. Structured extraction via ' +
            '<code>tool_use</code> is one request producing one structured result, which batches handle ' +
            'well — the constraint is on multi-turn tool calling, not on tool use as such.',
          wrong: [
            '', '',
            'This requires executing a tool mid-request and continuing with its output, which batch ' +
            'processing does not support.',
            'Latency-intolerant: a reviewer is waiting within minutes, and the batch window offers no ' +
            'guarantee at that timescale.'
          ]
        },
        {
          id: 'q4.5.5', scn: 6,
          stem: '<p>Before batch-processing 800 documents with a newly written extraction prompt, which ' +
            'step most reduces total cost and elapsed time?</p>',
          opts: [
            'Run the prompt against a sample of 5–10 documents first and measure the first-pass validation rate, fixing the prompt before committing the full batch.',
            'Split the 800 documents into eight batches of 100 so that any systematic problem affects only one batch at a time.',
            'Submit all 800 and rely on per-result statuses to identify which documents need a corrected prompt on resubmission.',
            'Increase the schema\'s strictness so that any prompt weakness surfaces as a validation failure rather than a silently wrong extraction.'
          ],
          ans: [0],
          why: 'A systematic prompt flaw discovered after 800 documents means resubmitting 800 — and two ' +
            'such rounds consume the entire 50% saving plus a day of wall-clock time. A ten-document ' +
            'sample costs almost nothing and catches the flaw first, which is why the guide recommends ' +
            'sampling before batching at scale.',
          wrong: [
            '',
            'Better than one batch of 800, but you still pay for 100 documents to learn what 10 would have ' +
            'told you, and the batches may be in flight simultaneously.',
            'This is the expensive path the sample run exists to avoid. A prompt weakness typically ' +
            'affects most documents, so you would be resubmitting nearly all of them.',
            'A stricter schema catches structural problems and not semantic ones ' +
            '(<a href="#/unit/4.3">4.3</a>), and it tells you nothing until after you have paid for the ' +
            'batch.'
          ]
        }
      ]
    },

    /* ================================================================== 4.6 */
    {
      id: '4.6',
      short: 'Multi-instance & multi-pass review',
      title: 'Design multi-instance and multi-pass review architectures',
      scn: [5, 2],
      tldr: 'Two independent architectural moves. <b>Multi-instance</b>: a model that generated code ' +
        'retains its own reasoning and is disinclined to question it, so an <b>independent instance with ' +
        'no generation context</b> catches more. <b>Multi-pass</b>: a single pass over many files dilutes ' +
        'attention and produces inconsistent depth and contradictory verdicts, so run <b>per-file local ' +
        'passes plus a separate cross-file integration pass</b>. Neither problem is solved by a bigger ' +
        'model or a bigger window.',

      concept:
      '<h3>Why self-review underperforms</h3>' +
      '<p>When a session writes code, it accumulates justifications: why this cast is safe, why that error ' +
      'cannot occur, why the happy path is the only path. Ask the same session to review the code and it ' +
      'does not re-derive those judgments from scratch — it already holds them. The reasoning that ' +
      'produced the code is the reasoning that now evaluates it.</p>' +
      '<p>An independent instance has none of that. It sees the code as an artefact, with no privileged ' +
      'account of why any line is the way it is, so it asks questions the author would not think to ask. ' +
      'In CI this is easy to arrange, because <b>every <code>-p</code> invocation gets a fresh, isolated ' +
      'context</b> (<a href="#/unit/3.6">3.6</a>).</p>' +
      '<div class="callout trap"><span class="co-t">Three things that do not fix it</span>' +
      '<p>The bias is <em>information already in context</em>, so nothing that leaves that context in place ' +
      'removes it: not "review your own work critically", not extended reasoning, not adding the test ' +
      'files as extra context. All three appear as distractors. The fix is a fresh context, not a better ' +
      'instruction to a contaminated one.</p></div>' +

      '<h3>Why single-pass review degrades with size</h3>' +
      '<p>Give one pass fourteen files and two things happen. Depth becomes uneven — some files get real ' +
      'scrutiny, others a sentence. And the standard drifts, so the same construct is flagged in file 3 ' +
      'and approved in file 11.</p>' +
      '<p>That second symptom is the diagnostic one. <b>Contradictory verdicts within a single review are ' +
      'the signature of attention dilution</b>, not of a model that disagrees with itself about the rule. ' +
      'Run the same prompt against each file separately and the contradiction is impossible by ' +
      'construction: identical criteria, applied fourteen times.</p>' +

      fig({
        vb: '0 0 700 250',
        caption: 'Two orthogonal axes. Independence addresses reviewer bias; multiple passes address ' +
          'attention dilution. Large PRs of generated code need both.',
        body:
          '<line x1="120" y1="200" x2="640" y2="200" class="stroke"/>' +
          '<line x1="120" y1="200" x2="120" y2="30" class="stroke"/>' +
          '<text x="380" y="228" text-anchor="middle" font-size="10.5" font-weight="600">passes →</text>' +
          '<text x="112" y="115" text-anchor="end" font-size="10.5" font-weight="600" transform="rotate(-90 112 115)">independence →</text>' +

          '<rect x="140" y="130" width="230" height="58" rx="6" class="boxBad"/>' +
          '<text x="255" y="152" text-anchor="middle" font-size="10.5" font-weight="600">same session, one pass</text>' +
          '<text x="255" y="170" text-anchor="middle" font-size="9.5" class="dim">biased AND diluted</text>' +

          '<rect x="390" y="130" width="230" height="58" rx="6" class="box"/>' +
          '<text x="505" y="152" text-anchor="middle" font-size="10.5" font-weight="600">same session, multi-pass</text>' +
          '<text x="505" y="170" text-anchor="middle" font-size="9.5" class="dim">consistent depth, still biased</text>' +

          '<rect x="140" y="52" width="230" height="58" rx="6" class="box"/>' +
          '<text x="255" y="74" text-anchor="middle" font-size="10.5" font-weight="600">independent, one pass</text>' +
          '<text x="255" y="92" text-anchor="middle" font-size="9.5" class="dim">unbiased, still diluted on big PRs</text>' +

          '<rect x="390" y="52" width="230" height="58" rx="6" class="boxOk"/>' +
          '<text x="505" y="74" text-anchor="middle" font-size="10.5" font-weight="600">independent, multi-pass</text>' +
          '<text x="505" y="92" text-anchor="middle" font-size="9.5" class="dim">what a 14-file generated PR needs</text>'
      }) +

      '<h3>The two-pass architecture</h3>' +
      '<div class="tablewrap"><table><thead><tr><th></th><th>Pass 1 — per file</th>' +
      '<th>Pass 2 — integration</th></tr></thead><tbody>' +
      '<tr><th>Input</th><td>One file, plus its diff</td><td>The full change set, plus a summary of pass ' +
      '1</td></tr>' +
      '<tr><th>Looks for</th><td>Local defects: logic, error handling, null safety, resource cleanup, ' +
      'unsafe conversions</td><td>Cross-file concerns: interface consistency, data flow across module ' +
      'boundaries, duplicated logic, call-site mismatches</td></tr>' +
      '<tr><th>Prompt</th><td><b>Identical for every file</b> — this is what makes verdicts ' +
      'consistent</td><td>One invocation, cross-file scope only</td></tr>' +
      '<tr><th>Catches</th><td>The bugs a diluted pass skimmed past</td><td>The return type that changed ' +
      'while two callers did not</td></tr>' +
      '</tbody></table></div>' +
      '<p>Both passes are necessary and neither substitutes for the other. Per-file passes alone are blind ' +
      'to a module that now returns a dict where its callers expect a list. An integration pass alone is ' +
      'the diluted single pass again.</p>' +

      '<h3>Confidence in verification passes — carefully</h3>' +
      '<p>The guide mentions running a verification pass where the model self-reports confidence alongside ' +
      'each finding, to enable calibrated review routing. Hold this alongside the warnings elsewhere ' +
      '(<a href="#/unit/4.1">4.1</a>, <a href="#/unit/5.5">5.5</a>) that self-reported confidence is not ' +
      'well calibrated.</p>' +
      '<p>Both are true, and the reconciliation is the word <b>calibrated</b>. Confidence is legitimate as ' +
      'a <b>supplementary routing signal whose thresholds you have measured against labelled data</b>. It ' +
      'is not legitimate as an <b>unvalidated filter</b> — "suppress anything below 0.8" — because nothing ' +
      'guarantees 0.8 corresponds to 80% accuracy. Route with it after measuring; never filter with it on ' +
      'faith.</p>' +

      '<div class="callout rule"><span class="co-t">The two distractors to recognise instantly</span>' +
      '<p><b>"Use a higher-tier model with a larger context window."</b> The files already fit; window is ' +
      'capacity, not attention. <b>"Run three full reviews and report only issues appearing in at least ' +
      'two."</b> This suppresses exactly the intermittently-detected real bugs you are trying to find — it ' +
      'trades recall for precision in a bug hunt, which is the wrong direction.</p></div>',

      example:
      '<h3>Scenario 5 — reviewing a PR that Claude also wrote</h3>' +
      '<p>An agent generates a 14-file feature. You need a review that catches real defects. Both problems ' +
      'are present at once — the generator is biased about its own work, and fourteen files dilute a single ' +
      'pass — so the architecture addresses both.</p>' +
      '<pre><code># WRONG — the generating session reviews itself\nsession = claude_session()\n' +
      'session.send("Implement the feature described in ticket PAY-3391.")\n' +
      'session.send("Now review your implementation critically for defects.")\n' +
      '# → few findings. It already believes the code is correct.\n' +
      '\n' +
      '# RIGHT — independent instances, and one pass per file\nfor path in changed_files:                       # pass 1: 14 invocations\n' +
      '    claude -p "Review $path for local defects: logic errors, error\n' +
      '               handling, null safety, resource cleanup, unsafe casts.\n' +
      '               Apply the criteria in CLAUDE.md. For each finding name\n' +
      '               the triggering input." \\\n' +
      '      --output-format json --json-schema review.json >> findings.jsonl\n' +
      '\n' +
      'claude -p "Examine this full diff for CROSS-FILE issues only:\n' +
      '           interface consistency, data flow across module boundaries,\n' +
      '           duplicated logic, call sites not updated for changed\n' +
      '           signatures. Ignore purely local issues." \\\n' +
      '  --output-format json --json-schema review.json >> findings.jsonl</code></pre>' +
      '<p>Every <code>-p</code> invocation is a fresh context, so no reviewer has seen the generation ' +
      'reasoning — the independence is free, a property of the invocation model rather than something you ' +
      'engineer.</p>' +

      '<h3>What each pass actually found</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Finding</th><th>Found by</th><th>Why the other pass ' +
      'could not</th></tr></thead><tbody>' +
      '<tr><td>Unhandled null when <code>promo_code</code> is absent, <code>cart.py:214</code></td>' +
      '<td>Pass 1</td><td>An integration pass skimming fourteen files would very likely miss a local ' +
      'guard.</td></tr>' +
      '<tr><td><code>inventory/sync.py</code> now returns a dict; two callers still expect a list</td>' +
      '<td>Pass 2</td><td>Invisible from inside any single file — the defect lives in the relationship ' +
      'between three.</td></tr>' +
      '<tr><td>The same bare <code>except</code> judged consistently in both ' +
      '<code>sync.py</code> and <code>reconcile.py</code></td><td>Pass 1</td><td>The single pass had ' +
      'flagged one and approved the other. Identical prompts make that contradiction ' +
      'impossible.</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout note"><span class="co-t">Where else this appears</span>' +
      '<p>This is the same architecture as <a href="#/unit/1.6">task statement 1.6</a>, which frames it as ' +
      'task decomposition, and it is executed with the CI mechanics of ' +
      '<a href="#/unit/3.6">3.6</a>. One pattern, three examinable angles — worth knowing well enough to ' +
      'recognise from any of them.</p></div>',

      mistakes: [
        { t: 'Having the generating session review its own output',
          d: 'It holds the reasoning that produced the code and will not question it. Use an independent ' +
             'instance with no generation context.' },
        { t: 'Trying to fix self-review bias with a stronger instruction',
          d: '"Review critically", extended reasoning and extra context all leave the biasing information ' +
             'in place. Only a fresh context removes it.' },
        { t: 'Answering attention dilution with a bigger context window',
          d: 'The files already fit. Window is capacity; uniform attention across many items is a ' +
             'different property.' },
        { t: 'Intersecting three full reviews',
          d: 'Requiring consensus suppresses the intermittently-detected real bugs that are the whole ' +
             'problem. Wrong trade for a bug hunt.' },
        { t: 'Running per-file passes with no integration pass',
          d: 'Cross-file defects — changed return shapes, unupdated call sites, duplicated logic — are ' +
             'invisible from inside one file.' },
        { t: 'Varying the per-file prompt',
          d: 'Reintroduces the inconsistency you decomposed to remove. The per-file prompt must be ' +
             'identical every time.' },
        { t: 'Filtering findings on uncalibrated confidence',
          d: 'Legitimate as a routing signal once thresholds are measured against labelled data; not as a ' +
             'suppression filter on faith (<a href="#/unit/5.5">5.5</a>).' },
        { t: 'Mandating smaller PRs instead',
          d: 'An organisational workaround for an architectural defect, and some changes legitimately ' +
             'span many files.' }
      ],

      exam:
      '<p>Two near-certain shapes. The self-review item: the same session reviews what it generated and ' +
      'finds little — answer, an independent review instance without the generator\'s reasoning context, ' +
      'in practice a separate <code>-p</code> invocation. The multi-pass item: a large PR produces ' +
      'inconsistent depth and contradictory feedback — answer, per-file local passes plus a separate ' +
      'cross-file integration pass. Recognise "bigger model / bigger window", "three reviews intersected" ' +
      'and "make developers submit smaller PRs" as the standing distractors.</p>',

      questions: [
        {
          id: 'q4.6.1', scn: 5,
          stem: '<p>An agent generates a new module, and the same session is then asked to review its own ' +
            'implementation critically. It reports two trivial findings. An independent review of the ' +
            'identical code surfaces a race condition and an unhandled error path. What is the ' +
            'architectural fix?</p>',
          opts: [
            'Route review to an independent instance that has no access to the generation session\'s reasoning context.',
            'Instruct the generating session to adopt the perspective of a hostile reviewer and to assume its code contains defects.',
            'Give the generating session the test suite and the module\'s consumers as additional context before asking for the review.',
            'Enable extended reasoning on the review request so the session analyses its implementation more deeply.'
          ],
          ans: [0],
          why: 'A session that generated code retains the reasoning that justified it and is therefore ' +
            'unlikely to question those decisions. An independent instance evaluates the code as an ' +
            'artefact, with no privileged account of why any line is as it is, and catches issues the ' +
            'author would not think to look for.',
          wrong: [
            '',
            'A persona instruction does not remove the reasoning already in context. The session still ' +
            'holds its own justifications and will re-apply them, however hostile the framing.',
            'More context does not counteract the bias, and the guide names including test files as one of ' +
            'the approaches that does not fix self-review. It may even reinforce the belief that the ' +
            'implementation is correct.',
            'Deeper analysis from a biased starting point produces a more thorough defence of the same ' +
            'conclusions. The problem is the premises, not the depth.'
          ]
        },
        {
          id: 'q4.6.2', scn: 5,
          stem: '<p>Your single-pass review of a 16-file change produces detailed feedback on four files, ' +
            'one-line comments on the rest, and flags a pattern in one file that it approves in another. ' +
            'Which restructuring addresses both symptoms?</p>',
          opts: [
            'Run an identical per-file review pass for each file, then a separate pass over the full diff scoped to cross-file concerns only.',
            'Run the review three times over the full diff and report only findings that appear in at least two runs.',
            'Move to a model with a larger context window so all 16 files receive adequate attention in a single pass.',
            'Split the review by concern instead of by file — one pass for security, one for correctness, one for performance — each over the full diff.'
          ],
          ans: [0],
          why: 'Per-file passes give every file the same attention budget, and because the prompt is ' +
            'identical each time the contradictory verdicts become impossible. The separate integration ' +
            'pass then covers what no single-file view can see. Both symptoms are addressed by the same ' +
            'decomposition.',
          wrong: [
            '',
            'Consensus filtering suppresses real bugs that are only caught intermittently — precisely the ' +
            'behaviour being complained about — so it trades recall for the appearance of precision.',
            'The files already fit in context. A larger window adds capacity, not uniformity of attention ' +
            'across sixteen items, and costs more per run.',
            'Splitting by concern helps depth per concern but still spreads each pass across all sixteen ' +
            'files, so uneven depth and drifting standards within a pass persist. It also does nothing for ' +
            'cross-file issues.'
          ]
        },
        {
          id: 'q4.6.3', scn: 5,
          stem: '<p>You have adopted per-file review passes and depth is now consistent. A regression then ' +
            'ships: a helper\'s signature changed and two call sites in other files were not updated. ' +
            'Neither per-file pass flagged it. What is missing, and why could the per-file passes not have ' +
            'caught it?</p>',
          opts: [
            'A cross-file integration pass; the defect exists only in the relationship between files, so it is invisible from inside any single one.',
            'A stricter per-file prompt requiring every changed signature to be checked against its documented contract; the passes were not thorough enough.',
            'A larger context window on each per-file pass so it can also see the files that call into the one under review.',
            'A final consensus pass re-running all per-file reviews and reporting findings that recur, since a real defect should surface more than once.'
          ],
          ans: [0],
          why: 'A per-file pass sees one file. The mismatch is a property of three files considered ' +
            'together, so no amount of per-file rigour can surface it. Covering exactly this class of ' +
            'defect is the purpose of the second pass.',
          wrong: [
            '',
            'The changed helper may be entirely consistent with its own documentation — the defect is that ' +
            'the callers were not updated, and the pass reviewing the helper cannot see them.',
            'Widening each per-file pass to include callers drifts back toward the single diluted pass the ' +
            'decomposition was introduced to fix.',
            'Re-running passes that structurally cannot see the problem reproduces the same blind spot, ' +
            'and consensus filtering reduces recall besides.'
          ]
        },
        {
          id: 'q4.6.4', scn: 5,
          stem: '<p>A colleague proposes that your verification pass should have the model output a ' +
            'confidence score with each finding, and that findings below 0.8 be suppressed automatically. ' +
            'How should you respond?</p>',
          opts: [
            'Accept the confidence output but reject automatic suppression until the thresholds have been calibrated against a labelled set, since nothing guarantees 0.8 corresponds to 80% accuracy.',
            'Accept the proposal in full: self-reported confidence is the most direct signal available for prioritising reviewer attention.',
            'Reject the proposal entirely: model self-assessment is unreliable and should play no part in a review architecture.',
            'Accept the proposal but set the threshold at 0.95 instead, so that only findings the model is highly certain about are surfaced.'
          ],
          ans: [0],
          why: 'Both halves of the guidance hold together through the word calibrated. Confidence can be a ' +
            'useful supplementary routing signal, but an uncalibrated threshold is arbitrary — measure the ' +
            'actual error rate at each confidence level against labelled data before letting a number ' +
            'suppress findings.',
          wrong: [
            '',
            'Uncalibrated confidence is exactly the signal that fails on the hard cases, so automatic ' +
            'suppression will discard some of the findings that matter most.',
            'Too absolute. The guide explicitly contemplates confidence-annotated verification passes for ' +
            'calibrated review routing; the objection is to using it unvalidated, not to using it at ' +
            'all.',
            'Raising an arbitrary threshold makes it more aggressive, not more valid. Without calibration, ' +
            '0.95 has no known relationship to accuracy either, and more real findings are lost.'
          ]
        },
        {
          id: 'q4.6.5', scn: 2,
          stem: '<p>Which statements about multi-instance and multi-pass review are correct?</p>',
          opts: [
            'Independence and multiple passes address different problems — reviewer bias and attention dilution respectively — so a large PR of generated code benefits from both.',
            'Using an identical prompt for every per-file pass is what prevents the same construct being flagged in one file and approved in another.',
            'A sufficiently large context window removes the need for multiple passes, since attention dilution is a consequence of content not fitting.',
            'An independent review instance is only necessary when the code was written by a human, since a model reviewing model-generated code has no personal investment in it.'
          ],
          ans: [0, 1],
          why: 'The two mechanisms are orthogonal: independence removes the generator\'s reasoning, and ' +
            'decomposition restores uniform attention. And the identical per-file prompt is precisely what ' +
            'makes contradictory verdicts structurally impossible.',
          wrong: [
            '', '',
            'Attention dilution is not a fitting problem — the content already fits. Spreading one pass ' +
            'across many items degrades uniformity of attention regardless of window size.',
            'Backwards. Self-review bias is specifically about a session reviewing what <em>it</em> ' +
            'generated, so model-generated code reviewed by its own generating session is the exact case ' +
            'the pattern addresses.'
          ]
        }
      ]
    }

    ]
  });
})(window.CCA);
