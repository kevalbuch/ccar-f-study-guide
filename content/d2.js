/* Domain 2 — Tool Design & MCP Integration (18%, ≈11 items) */
(function (CCA) {
  var fig = function (o) { return CCA.fig(o); };

  CCA.domains.push({
    n: 2,
    orient: '<div class="callout rule"><span class="co-t">Orientation</span>' +
      '<p>This domain is about the <b>interface between the model and your systems</b>. Almost every item ' +
      'reduces to one of three questions: does the model have enough information to pick the right tool ' +
      '(2.1), enough information to recover when a tool fails (2.2), and few enough tools that the choice ' +
      'is tractable (2.3)? The remaining two task statements cover wiring MCP servers up (2.4) and knowing ' +
      'which built-in tool does which job (2.5) — the most memorisable material on the whole exam, so bank ' +
      'those marks.</p></div>',

    units: [

    /* ================================================================== 2.1 */
    {
      id: '2.1',
      short: 'Tool descriptions & boundaries',
      title: 'Design effective tool interfaces with clear descriptions and boundaries',
      scn: [1, 3, 4],
      tldr: '<b>Tool descriptions are the primary mechanism the model uses to select tools.</b> When two ' +
        'tools have thin, overlapping descriptions, the model is guessing — and the fix is to rewrite the ' +
        'descriptions with input formats, example queries, edge cases and explicit "use this instead of ' +
        'that" boundaries. Renaming to remove overlap and splitting an over-general tool are the other two ' +
        'moves. And before you blame the descriptions, check the system prompt for stray keywords that are ' +
        'biasing selection.',

      concept:
      '<h3>The description <em>is</em> the interface</h3>' +
      '<p>The model cannot read your tool\'s source code. It cannot see the database behind it. It has the ' +
      'name, the description, and the input schema — and from that it must decide, on every turn, which of ' +
      'your tools fits the user\'s request. If two tools look alike in that projection, the model will ' +
      'sometimes pick wrong, and no amount of exhortation elsewhere fixes it.</p>' +
      '<p>This is why "rewrite the tool descriptions" is so often the right answer on this exam. It is not ' +
      'a cop-out; it is repairing the actual mechanism. Compare what the model sees:</p>' +

      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">What the model is given</span>' +
      '<pre><code>get_customer\n  "Retrieves customer information"\n\nlookup_order\n  "Retrieves order details"</code></pre>' +
      '<p>Both "retrieve", both take an identifier-shaped string. Asked "check my order #12345", the model ' +
      'has no basis for preferring one. It will often be right and reliably sometimes wrong.</p></div>' +
      '<div class="good"><span class="vs-h">What it needs</span>' +
      '<pre><code>lookup_order\n  "Retrieves the full record for ONE order:\n   line items, status, carrier, totals,\n   refund eligibility.\n\n   Input: order_id — 4-8 digits, with or\n   without a leading #. Not an email.\n\n   Use when the user references a specific\n   order, shipment, delivery or return.\n   Example: \'where is order #12345\',\n   \'my delivery is late\'.\n\n   Do NOT use to identify a person or to\n   list someone\'s orders — use\n   get_customer for identity and\n   list_orders for enumeration."</code></pre></div></div>' +

      '<h3>The six things a good description carries</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Element</th><th>Why the model needs it</th></tr></thead><tbody>' +
      '<tr><td><b>Purpose</b> — what it does, specifically</td><td>"Retrieves order details" versus ' +
      '"retrieves line items, status, carrier and refund eligibility for one order". The second tells the ' +
      'model whether this tool answers the question in front of it.</td></tr>' +
      '<tr><td><b>Input format</b>, with shape and counter-examples</td><td>Prevents the model passing an ' +
      'email where an order id belongs — the single most common cause of a wasted call.</td></tr>' +
      '<tr><td><b>What it returns</b></td><td>Lets the model plan two steps ahead: if this returns a ' +
      'customer id, it can chain to a tool that needs one.</td></tr>' +
      '<tr><td><b>When to use it</b>, with example queries</td><td>Grounds the abstract description in ' +
      'phrasings that resemble real user messages.</td></tr>' +
      '<tr><td><b>When NOT to use it</b>, naming the alternative</td><td>The highest-value line, and the ' +
      'one most often missing. It is what converts two overlapping tools into two bounded ones.</td></tr>' +
      '<tr><td><b>Edge cases</b></td><td>What happens with a cancelled order, an archived account, a ' +
      'partial match — so the model is not surprised by its own tool.</td></tr>' +
      '</tbody></table></div>' +

      '<h3>Three distinct fixes, for three distinct diseases</h3>' +
      '<p>The exam distinguishes carefully between these. Pick by diagnosis, not by habit.</p>' +

      fig({
        vb: '0 0 700 280',
        caption: 'Diagnose before prescribing. Overlapping descriptions, colliding names and an ' +
          'over-general tool are three different faults with three different fixes.',
        body:
          '<rect x="24" y="16" width="210" height="86" rx="6" class="box"/>' +
          '<text x="129" y="38" text-anchor="middle" font-size="11" font-weight="600">Distinct purposes,</text>' +
          '<text x="129" y="53" text-anchor="middle" font-size="11" font-weight="600">unclear descriptions</text>' +
          '<text x="129" y="74" text-anchor="middle" font-size="10" class="dim">get_customer vs lookup_order,</text>' +
          '<text x="129" y="88" text-anchor="middle" font-size="10" class="dim">both one thin line</text>' +
          '<path class="arrow" d="M129 102 L129 132" marker-end="url(#ah)"/>' +
          '<rect x="24" y="132" width="210" height="40" rx="6" class="boxOk"/>' +
          '<text x="129" y="149" text-anchor="middle" font-size="11" font-weight="600">Rewrite descriptions</text>' +
          '<text x="129" y="164" text-anchor="middle" font-size="9.5" class="dim">add use / do-not-use boundaries</text>' +

          '<rect x="245" y="16" width="210" height="86" rx="6" class="box"/>' +
          '<text x="350" y="38" text-anchor="middle" font-size="11" font-weight="600">Names collide,</text>' +
          '<text x="350" y="53" text-anchor="middle" font-size="11" font-weight="600">functions overlap</text>' +
          '<text x="350" y="74" text-anchor="middle" font-size="10" class="dim">analyze_content vs</text>' +
          '<text x="350" y="88" text-anchor="middle" font-size="10" class="dim">analyze_document</text>' +
          '<path class="arrow" d="M350 102 L350 132" marker-end="url(#ah)"/>' +
          '<rect x="245" y="132" width="210" height="40" rx="6" class="boxOk"/>' +
          '<text x="350" y="149" text-anchor="middle" font-size="11" font-weight="600">Rename + redescribe</text>' +
          '<text x="350" y="164" text-anchor="middle" font-size="9.5" class="dim">→ extract_web_results</text>' +

          '<rect x="466" y="16" width="210" height="86" rx="6" class="box"/>' +
          '<text x="571" y="38" text-anchor="middle" font-size="11" font-weight="600">One tool doing</text>' +
          '<text x="571" y="53" text-anchor="middle" font-size="11" font-weight="600">several jobs</text>' +
          '<text x="571" y="74" text-anchor="middle" font-size="10" class="dim">analyze_document used for</text>' +
          '<text x="571" y="88" text-anchor="middle" font-size="10" class="dim">3 unrelated operations</text>' +
          '<path class="arrow" d="M571 102 L571 132" marker-end="url(#ah)"/>' +
          '<rect x="466" y="132" width="210" height="40" rx="6" class="boxOk"/>' +
          '<text x="571" y="149" text-anchor="middle" font-size="11" font-weight="600">Split into purpose-specific</text>' +
          '<text x="571" y="164" text-anchor="middle" font-size="9.5" class="dim">extract / summarise / verify</text>' +

          '<rect x="24" y="196" width="652" height="72" rx="6" class="boxA"/>' +
          '<text x="40" y="216" font-size="11" font-weight="600">Check first: is the system prompt biasing selection?</text>' +
          '<text x="40" y="234" font-size="10.5">A system prompt saying "always consult the documents" creates a keyword pull toward</text>' +
          '<text x="40" y="250" font-size="10.5">document_search even when web_search is correct. Well-written tool descriptions can be</text>' +
          '<text x="40" y="263" font-size="10.5">overridden by a stray instruction — so audit the prompt before rewriting the tools.</text>'
      }) +

      '<h4>Fix 1 — rewrite the descriptions</h4>' +
      '<p>Use when the tools have <b>genuinely distinct purposes</b> but the descriptions do not ' +
      'differentiate. This is the common case and, crucially, it is the <b>lowest-effort, ' +
      'highest-leverage</b> option — which is why it wins when a question asks for the "most effective ' +
      'first step".</p>' +

      '<h4>Fix 2 — rename, then redescribe</h4>' +
      '<p>Use when the <b>names themselves</b> are the collision. The guide\'s example: an ' +
      '<code>analyze_content</code> tool that actually processes web search results, sitting next to ' +
      '<code>analyze_document</code>. No description can fully overcome two near-identical names — rename ' +
      'it <code>extract_web_results</code> and give it a web-specific description.</p>' +

      '<h4>Fix 3 — split the tool</h4>' +
      '<p>Use when <b>one tool is doing several unrelated jobs</b>, so it gets invoked for tasks that ' +
      'should be different operations. The guide\'s example splits a generic ' +
      '<code>analyze_document</code> into <code>extract_data_points</code>, ' +
      '<code>summarize_content</code> and <code>verify_claim_against_source</code>, each with a defined ' +
      'input/output contract. Redescribing cannot fix this, because the description would have to say ' +
      '"this tool does three things", which is exactly the problem.</p>' +

      '<div class="callout trap"><span class="co-t">First step versus best architecture</span>' +
      '<p>Official sample question 2 asks for the "most effective <b>first step</b>" when two tools have ' +
      'minimal descriptions. Consolidating them into one <code>lookup_entity</code> tool is called out as ' +
      '<em>a valid architectural choice</em> — but it is more effort than a first step warrants when the ' +
      'immediate problem is inadequate descriptions. Read the question\'s framing: "first step", "most ' +
      'effective", "least effort" all point at the description rewrite.</p></div>' +

      '<h3>The system-prompt trap</h3>' +
      '<p>A subtle failure the guide names explicitly: <b>keyword-sensitive system prompt instructions can ' +
      'override well-written tool descriptions</b>. If your system prompt says "always check the internal ' +
      'documentation before answering", the word "documentation" creates a pull toward a ' +
      '<code>document_search</code> tool even on questions where <code>web_search</code> is plainly ' +
      'correct.</p>' +
      '<p>So the debugging order matters: when tool selection is broken, <b>read the system prompt for ' +
      'accidental keyword associations before you conclude the descriptions are at fault</b>. Rewriting ' +
      'good descriptions to fight a prompt you could simply reword is wasted work.</p>',

      example:
      '<h3>Scenario 1 — repairing two one-line descriptions</h3>' +
      '<p>Production logs show the agent calling <code>get_customer</code> when users ask about orders — ' +
      '"check my order #12345" routes to the identity tool. Both tools carry a single line of description ' +
      'and both accept a similar identifier string.</p>' +
      '<p>Here is the rewrite, with the reasoning for each part:</p>' +
      '<pre><code>{\n' +
      '  "name": "get_customer",\n' +
      '  "description":\n' +
      '    "Identifies and verifies a PERSON and returns their account\\n' +
      '     record: customer_id, verification status, contact details,\\n' +
      '     account tier, open ticket count.\\n' +
      '\\n' +
      '     INPUT: email address, phone number, or account number.\\n' +
      '     Do NOT pass an order number — this tool cannot resolve one.\\n' +
      '\\n' +
      '     USE WHEN: you need to establish WHO you are talking to, or\\n' +
      '     before any order or payment operation (identity must be\\n' +
      '     verified first). Examples: \'I need help with my account\',\\n' +
      '     \'this is dana@example.com\'.\\n' +
      '\\n' +
      '     DO NOT USE to fetch order contents or shipping status — use\\n' +
      '     lookup_order. Do not use to list a customer\'s orders — use\\n' +
      '     list_orders.\\n' +
      '\\n' +
      '     EDGE CASES: may return MULTIPLE matches for a common name;\\n' +
      '     when it does, ask the user for an additional identifier\\n' +
      '     rather than choosing one."\n' +
      '}</code></pre>' +
      '<p>Read the last paragraph again. Documenting the multiple-match edge case <em>in the tool ' +
      'description</em> is what makes the correct behaviour from ' +
      '<a href="#/unit/5.2">task statement 5.2</a> — ask for another identifier, never pick ' +
      'heuristically — available to the model at the moment it matters.</p>' +

      '<p>And the counterpart, bounded against the first:</p>' +
      '<pre><code>{\n' +
      '  "name": "lookup_order",\n' +
      '  "description":\n' +
      '    "Retrieves ONE order by its order number: line items,\\n' +
      '     quantities, prices, order status, carrier and tracking,\\n' +
      '     delivery date, return window, refund eligibility.\\n' +
      '\\n' +
      '     INPUT: order_id — 4 to 8 digits, with or without a leading\\n' +
      '     \'#\'. Not an email, not a customer_id.\\n' +
      '\\n' +
      '     USE WHEN: the user references a specific order, delivery,\\n' +
      '     shipment or return. Examples: \'where is #12345\',\\n' +
      '     \'my order arrived damaged\', \'can I still return this\'.\\n' +
      '\\n' +
      '     DO NOT USE to identify the customer (get_customer) or to\\n' +
      '     enumerate their orders (list_orders). Requires a verified\\n' +
      '     customer_id in session — calls without one are blocked.\\n' +
      '\\n' +
      '     EDGE CASES: returns isError:false with an empty result for a\\n' +
      '     valid-format order number that does not exist."\n' +
      '}</code></pre>' +

      '<p>The two descriptions now do three things the originals could not: they name each other as the ' +
      'wrong choice, they distinguish inputs explicitly (email versus digits), and they surface the ' +
      'behaviours — multiple matches, empty results, the verification gate — that would otherwise ' +
      'surprise the model mid-conversation.</p>' +

      '<div class="callout tip"><span class="co-t">Cheap test for a description</span>' +
      '<p>Read only the descriptions of your tool set, as the model does, and ask: for each of my top ten ' +
      'real user messages, is exactly one tool obviously correct? Wherever the answer is "two look ' +
      'plausible", you have found the item the exam would write about.</p></div>',

      mistakes: [
        { t: 'Answering a selection problem with few-shot examples first',
          d: 'Examples add token overhead on every request while leaving the root cause — descriptions ' +
             'the model cannot distinguish — in place. They are a legitimate secondary technique ' +
             '(<a href="#/unit/4.2">4.2</a>), not the first fix for thin descriptions.' },
        { t: 'Adding a keyword routing layer in front of the model',
          d: 'Over-engineered and it discards the language understanding you are paying for. Keyword ' +
             'rules break on the first paraphrase.' },
        { t: 'Consolidating similar tools as the first move',
          d: 'Sometimes valid architecture, but a bigger change than a description rewrite. When the ' +
             'question says "first step", consolidation is the wrong scale of response.' },
        { t: 'Omitting the "do not use" boundary',
          d: 'The single most valuable line, and the one most often left out. Without it, two tools with ' +
             'good individual descriptions still compete.' },
        { t: 'Describing what a tool is rather than when to use it',
          d: '"Interface to the order microservice" is architecture trivia. The model needs to know which ' +
             'user requests it answers.' },
        { t: 'Rewriting descriptions when the system prompt is the culprit',
          d: 'A keyword-laden instruction can override good descriptions. Audit the prompt for accidental ' +
             'associations before touching the tools.' },
        { t: 'Trying to redescribe a tool that does three jobs',
          d: 'You cannot bound an over-general tool with prose. Split it into purpose-specific tools with ' +
             'defined contracts.' },
        { t: 'Leaving input format ambiguous',
          d: 'Specify shape and give counter-examples ("digits, not an email"). Vague input specs produce ' +
             'wasted calls with the wrong argument type.' }
      ],

      exam:
      '<p>Official sample question 2 lives here and the pattern recurs: two tools, minimal descriptions, ' +
      'confused selection, four options. The winner expands the descriptions to include input formats, ' +
      'example queries, edge cases and boundaries against the similar tool. Few-shot examples, a routing ' +
      'layer and consolidation are the three standing distractors — each defensible in isolation, each ' +
      'wrong as a first step. Expect a second item that distinguishes <em>rename</em> from <em>split</em>: ' +
      'names colliding → rename; one tool serving several unrelated purposes → split. And watch for the ' +
      'system-prompt-keyword variant, where the fix is in the prompt rather than the tools.</p>',

      questions: [
        {
          id: 'q2.1.1', scn: 1, official: true,
          stem: '<p>Production logs show the agent frequently calls <code>get_customer</code> when users ' +
            'ask about orders (e.g. "check my order #12345"), instead of calling ' +
            '<code>lookup_order</code>. Both tools have minimal descriptions ("Retrieves customer ' +
            'information" / "Retrieves order details") and accept similar identifier formats. What\'s the ' +
            'most effective first step to improve tool selection reliability?</p>',
          opts: [
            'Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5–8 examples showing order-related queries routing to <code>lookup_order</code>.',
            'Expand each tool\'s description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools.',
            'Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns.',
            'Consolidate both tools into a single <code>lookup_entity</code> tool that accepts any identifier and internally determines which backend to query.'
          ],
          ans: [1],
          why: 'Tool descriptions are the primary mechanism LLMs use for tool selection. When descriptions ' +
            'are minimal, the model lacks the context to differentiate between similar tools. Expanding ' +
            'them addresses that root cause directly, and it is a low-effort, high-leverage change — ' +
            'exactly what "first step" calls for.',
          wrong: [
            'Few-shot examples add token overhead to every request without fixing the underlying issue. ' +
            'They are the right technique for teaching an ambiguous judgment boundary, not for repairing ' +
            'descriptions that fail to distinguish two clearly different tools.',
            '',
            'Over-engineered, and it bypasses the model\'s natural language understanding. A keyword ' +
            'parser fails on the first phrasing nobody anticipated, and you now maintain a second ' +
            'routing system alongside the model.',
            'A valid architectural choice, but it requires more effort than a "first step" warrants when ' +
            'the immediate problem is inadequate descriptions. Fix the cheap thing first and re-measure.'
          ]
        },
        {
          id: 'q2.1.2', scn: 3,
          stem: '<p>Your research system has a tool named <code>analyze_content</code> whose actual job is ' +
            'processing web search result sets, sitting alongside <code>analyze_document</code>, which ' +
            'processes uploaded PDFs. The agent routinely sends PDFs to <code>analyze_content</code>. You ' +
            'have already expanded both descriptions with explicit boundaries, and misrouting continues at ' +
            'a reduced rate. What is the appropriate next step?</p>',
          opts: [
            'Rename <code>analyze_content</code> to <code>extract_web_results</code> and rewrite its description to be web-specific, so the name itself no longer competes.',
            'Merge the two tools into a single <code>analyze</code> tool that inspects its input and dispatches to the correct backend internally.',
            'Add a <code>content_type</code> enum parameter to both tools so the model must declare what it is passing.',
            'Add few-shot examples to the system prompt showing PDFs routed to <code>analyze_document</code>.'
          ],
          ans: [0],
          why: 'When descriptions have already been improved and confusion persists, the names are the ' +
            'remaining collision: <code>analyze_content</code> and <code>analyze_document</code> are ' +
            'near-synonyms, and "content" is a superset of "document" in ordinary usage. The guide names ' +
            'exactly this fix — rename to <code>extract_web_results</code> with a web-specific ' +
            'description.',
          wrong: [
            '',
            'Merging destroys the boundary you want the model to respect and pushes dispatch logic into ' +
            'the tool, where a mis-dispatch becomes invisible. It also removes the model\'s ability to ' +
            'reason about which operation is appropriate.',
            'An enum parameter records the model\'s belief about the input; it does not correct that ' +
            'belief. A model that thinks a PDF is "content" will declare it as such and still call the ' +
            'wrong tool.',
            'Examples paper over a naming collision at a per-request token cost, and they generalise ' +
            'poorly to content types not covered by the examples.'
          ]
        },
        {
          id: 'q2.1.3', scn: 3,
          stem: '<p>Your <code>analyze_document</code> tool is invoked for three quite different purposes: ' +
            'pulling specific figures out of tables, producing prose summaries, and checking whether a ' +
            'given claim is supported by a source. Its output shape differs each time, downstream parsing ' +
            'is fragile, and the agent sometimes asks for a summary when a figure was needed. What is the ' +
            'right correction?</p>',
          opts: [
            'Split it into <code>extract_data_points</code>, <code>summarize_content</code> and <code>verify_claim_against_source</code>, each with a defined input/output contract.',
            'Keep one tool but expand its description to enumerate the three supported operations and when each applies.',
            'Keep one tool and add a required <code>mode</code> enum with values <code>extract</code>, <code>summarize</code> and <code>verify</code>.',
            'Keep one tool and have a PostToolUse hook normalise its three output shapes into a single schema.'
          ],
          ans: [0],
          why: 'The tool is doing several jobs, so no description can bound it — the description would ' +
            'have to say "this tool does three things", which is the defect. Splitting into ' +
            'purpose-specific tools with defined contracts gives the model a clear choice and gives ' +
            'downstream code a stable output shape per tool. This is the guide\'s own example.',
          wrong: [
            '',
            'Enumerating three purposes in one description leaves the ambiguity intact: the model must ' +
            'still choose an operation <em>within</em> the tool, and the output shape still varies, so ' +
            'downstream parsing stays fragile.',
            'Closer, and a reasonable intermediate step, but it keeps one tool with three output shapes ' +
            'and it makes the mode a parameter rather than a selection decision. Purpose-specific tools ' +
            'let descriptions do the work of steering, and give each operation its own contract.',
            'Normalisation hides the symptom — inconsistent output — while leaving the selection problem ' +
            'entirely unaddressed. The agent still asks for summaries when it needed figures.'
          ]
        },
        {
          id: 'q2.1.4', scn: 3,
          stem: '<p>Your research agent has well-written, clearly bounded descriptions for ' +
            '<code>web_search</code> and <code>document_search</code>. Nevertheless it reaches for ' +
            '<code>document_search</code> on questions about current events that only the web could ' +
            'answer. The system prompt opens: "You are a rigorous analyst. Always consult the internal ' +
            'documentation before forming a conclusion." What should you investigate first?</p>',
          opts: [
            'The system prompt — the instruction to "always consult the internal documentation" creates a keyword association that can override well-written tool descriptions.',
            'The <code>document_search</code> description — it must still contain language broad enough to capture current-events queries.',
            'The tool ordering in the request — <code>document_search</code> is likely listed first, giving it positional advantage.',
            'The model\'s temperature — reducing it will make tool selection more deterministic and consistent.'
          ],
          ans: [0],
          why: 'The guide calls out keyword-sensitive system prompt instructions as able to override good ' +
            'tool descriptions. "Always consult the internal documentation" is a standing instruction ' +
            'pulling every query toward the documentation tool. Rewording the prompt is cheaper and more ' +
            'effective than fighting it from the tool descriptions.',
          wrong: [
            '',
            'The stem states the descriptions are well-written and bounded. Rewriting them to counteract ' +
            'a prompt instruction is fighting your own configuration — and the debugging order the guide ' +
            'recommends is prompt first.',
            'Tool order is not a documented selection lever, and treating it as one would make your ' +
            'system depend on an implementation detail rather than on the descriptions.',
            'Temperature affects sampling variability, not the semantic pull of a standing instruction. ' +
            'At any temperature, "always consult the documentation" biases toward the documentation tool.'
          ]
        },
        {
          id: 'q2.1.5', scn: 1,
          stem: '<p>You are writing the description for a <code>process_refund</code> tool. Which content ' +
            'most improves the model\'s use of it?</p>',
          opts: [
            'The input format and constraints, including that the amount must not exceed the order total and that a verified <code>customer_id</code> is required.',
            'Explicit boundaries naming the alternative: do not use for exchanges (<code>create_exchange</code>) or for goodwill credits (<code>issue_credit</code>).',
            'A note that the tool is implemented as a REST call to the payments microservice and typically completes in under 400 ms.',
            'A reminder that refunds are financially significant and the agent should be careful and double-check before calling it.'
          ],
          ans: [0, 1],
          why: 'Input constraints and prerequisites let the model construct a valid call, and explicit ' +
            '"do not use — use this instead" boundaries stop it reaching for refunds when an exchange or ' +
            'credit is what the situation calls for. Both are core elements of an effective description.',
          wrong: [
            '', '',
            'Implementation detail and latency are invisible to the model\'s decision. Knowing it is a ' +
            'REST call does not help it decide whether a refund is the right action for this customer.',
            'Vague exhortations to "be careful" do not change behaviour, and they are the wrong mechanism ' +
            'for a financial constraint: a refund ceiling belongs in a deterministic gate ' +
            '(<a href="#/unit/1.4">1.4</a>), not in prose the model may or may not weight.'
          ]
        }
      ]
    },

    /* ================================================================== 2.2 */
    {
      id: '2.2',
      short: 'Structured MCP error responses',
      title: 'Implement structured error responses for MCP tools',
      scn: [1, 3],
      tldr: 'A tool failure is information, and a generic "Operation failed" throws it away. MCP signals ' +
        'failure with the <code>isError</code> flag, and a good error result adds structured metadata: an ' +
        '<b>error category</b> (transient / validation / business / permission), an <b>isRetryable</b> ' +
        'boolean, a human-readable description, and what was attempted. Two hard distinctions: retryable ' +
        'versus not, and a genuine failure versus a <b>successful query that found nothing</b>.',

      concept:
      '<h3>Why generic errors are expensive</h3>' +
      '<p>When a tool returns <code>{"error": "lookup_order failed"}</code>, the agent has to guess. Should ' +
      'it retry? Ask the customer for different information? Apologise and escalate? Every one of those is ' +
      'plausible and only one is right, so the agent will pick wrong a lot of the time — and its wrong ' +
      'choices are expensive. Retrying a validation error burns latency for a guaranteed second failure. ' +
      'Failing to retry a transient timeout throws away a request that would have succeeded.</p>' +
      '<p>The fix is to return, alongside the failure, the facts the agent needs to choose a recovery ' +
      'strategy.</p>' +

      '<h3>The four error categories</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Category</th><th>Examples</th><th>Retryable?</th>' +
      '<th>Correct agent response</th></tr></thead><tbody>' +
      '<tr><td><b>Transient</b></td><td>Timeout, 503, connection reset, rate limit</td>' +
      '<td><b>Yes</b></td><td>Retry, ideally with backoff — and preferably inside the tool, see below</td></tr>' +
      '<tr><td><b>Validation</b></td><td>Malformed order id, missing required field, bad date format</td>' +
      '<td><b>No</b> — not as-is</td><td>Correct the input and call again. Retrying the identical call is ' +
      'guaranteed to fail.</td></tr>' +
      '<tr><td><b>Business</b></td><td>Amount exceeds autonomous limit, return window closed, policy ' +
      'violation</td><td><b>No</b></td><td>Explain to the customer in their terms; escalate or offer an ' +
      'alternative. Never retry, never restructure to evade.</td></tr>' +
      '<tr><td><b>Permission</b></td><td>Access denied, insufficient scope, account locked</td>' +
      '<td><b>No</b></td><td>Escalate. The agent cannot grant itself authority.</td></tr>' +
      '</tbody></table></div>' +

      fig({
        vb: '0 0 700 250',
        caption: 'The error category determines the recovery path. A single generic message collapses ' +
          'four different decisions into a guess.',
        body:
          '<rect x="270" y="14" width="160" height="38" rx="6" class="boxBad"/>' +
          '<text x="350" y="38" text-anchor="middle" font-size="11.5" font-weight="600">Tool call fails</text>' +

          '<path class="arrow" d="M300 52 L110 96" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M330 52 L290 96" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M370 52 L420 96" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M400 52 L600 96" marker-end="url(#ah)"/>' +

          '<rect x="24" y="96" width="168" height="42" rx="5" class="box"/>' +
          '<text x="108" y="113" text-anchor="middle" font-size="10.5" font-weight="600">transient</text>' +
          '<text x="108" y="129" text-anchor="middle" font-size="9.5" class="dim">timeout · 503 · reset</text>' +
          '<rect x="24" y="146" width="168" height="34" rx="5" class="boxOk"/>' +
          '<text x="108" y="167" text-anchor="middle" font-size="10.5">retry (in the tool)</text>' +

          '<rect x="204" y="96" width="168" height="42" rx="5" class="box"/>' +
          '<text x="288" y="113" text-anchor="middle" font-size="10.5" font-weight="600">validation</text>' +
          '<text x="288" y="129" text-anchor="middle" font-size="9.5" class="dim">bad input shape</text>' +
          '<rect x="204" y="146" width="168" height="34" rx="5" class="boxA"/>' +
          '<text x="288" y="167" text-anchor="middle" font-size="10.5">fix input, call again</text>' +

          '<rect x="384" y="96" width="140" height="42" rx="5" class="box"/>' +
          '<text x="454" y="113" text-anchor="middle" font-size="10.5" font-weight="600">business</text>' +
          '<text x="454" y="129" text-anchor="middle" font-size="9.5" class="dim">policy · threshold</text>' +
          '<rect x="384" y="146" width="140" height="34" rx="5" class="boxA"/>' +
          '<text x="454" y="167" text-anchor="middle" font-size="10.5">explain + escalate</text>' +

          '<rect x="536" y="96" width="140" height="42" rx="5" class="box"/>' +
          '<text x="606" y="113" text-anchor="middle" font-size="10.5" font-weight="600">permission</text>' +
          '<text x="606" y="129" text-anchor="middle" font-size="9.5" class="dim">denied · no scope</text>' +
          '<rect x="536" y="146" width="140" height="34" rx="5" class="boxA"/>' +
          '<text x="606" y="167" text-anchor="middle" font-size="10.5">escalate</text>' +

          '<rect x="24" y="200" width="652" height="42" rx="6" class="box"/>' +
          '<text x="40" y="219" font-size="11" font-weight="600">Separately: a query that ran fine and matched nothing is NOT an error.</text>' +
          '<text x="40" y="235" font-size="10.5">isError: false, results: [] — "no such customer" is an answer, not a failure.</text>'
      }) +

      '<h3>What a good error result contains</h3>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Useless</span>' +
      '<pre><code>{ "isError": true,\n  "content": "lookup_order failed" }</code></pre>' +
      '<p>Retry? Reword? Escalate? The agent cannot tell, so it guesses — and its guess is wrong three ' +
      'times out of four.</p></div>' +
      '<div class="good"><span class="vs-h">Actionable</span>' +
      '<pre><code>{ "isError": true,\n  "errorCategory": "transient",\n  "isRetryable": true,\n  "description":\n    "Order service timed out after 30s",\n  "attemptedQuery":\n    { "order_id": "4471" },\n  "retryAfterSeconds": 5 }</code></pre></div></div>' +

      '<p>And for a business rule, the extra field that changes the agent\'s behaviour entirely:</p>' +
      '<pre><code>{\n' +
      '  "isError": true,\n' +
      '  "errorCategory": "business",\n' +
      '  "isRetryable": false,\n' +
      '  "description": "Refund amount 812.40 exceeds the 500.00 autonomous limit",\n' +
      '  "customerMessage": "I can help with this refund, but an amount this size\\n' +
      '                      needs a manager to approve it. I am passing it on now\\n' +
      '                      and you should hear back within one business day.",\n' +
      '  "suggestedAction": "escalate_to_human",\n' +
      '  "attemptedQuery": { "order_id": "4471", "amount": 812.40 }\n' +
      '}</code></pre>' +
      '<p>The <code>customerMessage</code> is written for the customer, not the engineer — so the agent can ' +
      'relay it rather than paraphrasing an internal error string. And <code>suggestedAction</code> turns ' +
      'a wall into a path, the same principle as a hook that names its alternative ' +
      '(<a href="#/unit/1.5">1.5</a>).</p>' +

      '<div class="callout trap"><span class="co-t">Never split a request to evade a business error</span>' +
      '<p>Given "amount exceeds the $500 limit", a tempting agent behaviour is two $406 refunds. That is ' +
      'circumventing a control, and the correct response is to relay the customer-facing message and ' +
      'escalate. Any option that proposes splitting, retrying, or "trying a different tool" for a business ' +
      'error is wrong.</p></div>' +

      '<h3>Zero results are not an error</h3>' +
      '<p>The guide calls this out specifically: <b>distinguish access failures from valid empty ' +
      'results</b>. If <code>get_customer</code> searches correctly and finds nobody matching ' +
      '<code>nobody@example.com</code>, the tool worked. Return <code>isError: false</code> with an empty ' +
      'result set.</p>' +
      '<p>Flagging it as an error causes real damage in both directions. The agent may retry a search that ' +
      'will never match, and it may tell the customer "our system is having trouble" when the truthful ' +
      'answer is "I cannot find an account with that email — could it be under a different one?" Those are ' +
      'very different conversations, and only one of them is honest.</p>' +
      '<p>The mirror-image error is worse still, and appears in ' +
      '<a href="#/unit/5.3">task statement 5.3</a>: catching a real failure and returning an empty result ' +
      '<em>marked successful</em>. That converts a recoverable problem into silent data loss — the ' +
      'research report simply omits a topic and nobody knows why.</p>' +

      '<h3>Where retry logic belongs</h3>' +
      '<p>For transient errors, the guide is clear that the <b>tool</b> should handle retries — it has ' +
      'definitive knowledge of what the error was, whereas the agent is interpreting a flag. A tool that ' +
      'knows a 503 is transient can retry twice with backoff and return either a success or a much more ' +
      'informative failure.</p>' +
      '<p>But bound it. The anti-pattern is <b>unbounded retries inside a subagent</b>, which burns latency ' +
      'invisibly while the coordinator waits. The pattern the guide wants: <b>local recovery for one or two ' +
      'attempts, then propagate</b> — with what was attempted and any partial results — so the coordinator ' +
      'can decide.</p>' +

      fig({
        vb: '0 0 700 150',
        caption: 'Local recovery first, then propagate. Bounded retries inside the tool; the coordinator ' +
          'decides only what could not be resolved locally.',
        body:
          '<rect x="24" y="46" width="130" height="44" rx="6" class="box"/>' +
          '<text x="89" y="64" text-anchor="middle" font-size="10.5" font-weight="600">tool call fails</text>' +
          '<text x="89" y="79" text-anchor="middle" font-size="9.5" class="dim">503 transient</text>' +
          '<path class="arrow" d="M154 68 L200 68" marker-end="url(#ah)"/>' +
          '<rect x="200" y="46" width="150" height="44" rx="6" class="boxOk"/>' +
          '<text x="275" y="64" text-anchor="middle" font-size="10.5" font-weight="600">retry ×1–2 in tool</text>' +
          '<text x="275" y="79" text-anchor="middle" font-size="9.5" class="dim">with backoff</text>' +
          '<path class="arrow" d="M350 58 L410 44" marker-end="url(#ah)"/>' +
          '<text x="382" y="34" font-size="9.5" class="dim">ok</text>' +
          '<rect x="410" y="26" width="120" height="32" rx="5" class="boxOk"/>' +
          '<text x="470" y="46" text-anchor="middle" font-size="10.5">return result</text>' +
          '<path class="arrow" d="M350 78 L410 96" marker-end="url(#ah)"/>' +
          '<text x="382" y="104" font-size="9.5" class="dim">still failing</text>' +
          '<rect x="410" y="80" width="266" height="46" rx="5" class="boxA"/>' +
          '<text x="543" y="98" text-anchor="middle" font-size="10.5" font-weight="600">propagate to coordinator</text>' +
          '<text x="543" y="114" text-anchor="middle" font-size="9.5" class="dim">category + what was attempted + partial results</text>'
      }),

      example:
      '<h3>Scenario 1 — four failures, four different conversations</h3>' +
      '<p>Same tool, four failure modes, and the structured metadata makes the agent behave correctly in ' +
      'each without any special-case prompting.</p>' +

      '<h4>1 · Transient</h4>' +
      '<pre><code>{ "isError": true, "errorCategory": "transient", "isRetryable": true,\n' +
      '  "description": "Order service timed out after 30s",\n' +
      '  "attemptedQuery": { "order_id": "4471" }, "retryAfterSeconds": 5 }</code></pre>' +
      '<p>Agent: retries. If it succeeds, the customer never learns anything went wrong.</p>' +

      '<h4>2 · Validation</h4>' +
      '<pre><code>{ "isError": true, "errorCategory": "validation", "isRetryable": false,\n' +
      '  "description": "order_id must be 4-8 digits; received \'my last one\'",\n' +
      '  "expectedFormat": "4-8 digits, optional leading #",\n' +
      '  "attemptedQuery": { "order_id": "my last one" } }</code></pre>' +
      '<p>Agent: does not retry — it now knows the shape required, so it asks the customer for the order ' +
      'number, or calls <code>list_orders</code> to find their most recent one.</p>' +

      '<h4>3 · Business</h4>' +
      '<pre><code>{ "isError": true, "errorCategory": "business", "isRetryable": false,\n' +
      '  "description": "Return window closed 2026-01-14 (63 days after delivery)",\n' +
      '  "customerMessage": "This order is outside our 30-day return window, which\n' +
      '                      closed on 14 January. I can look at a store credit or\n' +
      '                      pass this to a supervisor for a policy exception.",\n' +
      '  "suggestedAction": "offer_credit_or_escalate" }</code></pre>' +
      '<p>Agent: relays the customer-facing text and offers the two real options. No retry, no attempt to ' +
      'reframe the request as something the tool would accept.</p>' +

      '<h4>4 · Not an error at all</h4>' +
      '<pre><code>{ "isError": false, "results": [],\n' +
      '  "description": "No customer matches nobody@example.com",\n' +
      '  "searchedBy": "email" }</code></pre>' +
      '<p>Agent: "I cannot find an account under that email — do you have another address you might have ' +
      'ordered with?" Honest, actionable, and no false claim of a system problem.</p>' +

      '<div class="callout tip"><span class="co-t">Design test</span>' +
      '<p>For every error your tool can return, ask: <b>could the agent choose the right recovery from ' +
      'this payload alone?</b> If it would have to guess, add the field that removes the guess. That single ' +
      'question generates most of the structure above.</p></div>',

      mistakes: [
        { t: 'Returning a uniform generic failure',
          d: '"Operation failed" forces the agent to guess between retry, reword, escalate and explain. ' +
             'Add category, retryability and what was attempted.' },
        { t: 'Marking zero results as an error',
          d: 'A query that ran correctly and matched nothing succeeded. Return <code>isError: false</code> ' +
             'with an empty result set, or the agent will retry futilely and misinform the customer.' },
        { t: 'Returning empty results as success when the call actually failed',
          d: 'The most dangerous inversion: it converts a recoverable failure into silent data loss, with ' +
             'no signal anywhere that a topic was never covered.' },
        { t: 'Retrying a validation or business error',
          d: 'The identical call will fail identically. Validation errors need a corrected input; business ' +
             'errors need an explanation and an escalation.' },
        { t: 'Splitting a request to get under a business threshold',
          d: 'Circumventing a control. Relay the customer-facing message and escalate.' },
        { t: 'Unbounded retries inside a subagent',
          d: 'Burns latency invisibly while the coordinator waits. Recover locally once or twice, then ' +
             'propagate with context.' },
        { t: 'Exposing raw internal errors to customers',
          d: 'Include a separate <code>customerMessage</code> written for the customer, so the agent is ' +
             'not paraphrasing a stack trace.' },
        { t: 'Omitting what was attempted',
          d: 'Without <code>attemptedQuery</code>, neither the agent nor the coordinator can tell an ' +
             'alternative approach from a repeat of the same one.' }
      ],

      exam:
      '<p>The reliable item gives you a business error — typically "amount exceeds the $500 autonomous ' +
      'limit, requires manager approval" with a <code>customerMessage</code> field — and asks what the ' +
      'agent should do. Answer: relay the customer-friendly message and escalate. Distractors: retry, ' +
      'split into smaller transactions, try a different tool. A second item tests the empty-results ' +
      'distinction, and a third asks where retry logic belongs for a tool with both transient and ' +
      'permanent failures — answer: inside the tool, bounded, because the tool knows the category ' +
      'definitively.</p>',

      questions: [
        {
          id: 'q2.2.1', scn: 1,
          stem: '<p>Your <code>process_refund</code> tool returns:</p>' +
            '<pre><code>{ "isError": true,\n  "errorCategory": "business",\n  "isRetryable": false,\n' +
            '  "description": "Amount 812.40 exceeds 500.00 autonomous limit",\n' +
            '  "customerMessage": "An amount this size needs manager approval;\n' +
            '                      I am passing this on now.",\n' +
            '  "suggestedAction": "escalate_to_human" }</code></pre>' +
            '<p>What should the agent do?</p>',
          opts: [
            'Relay the <code>customerMessage</code> to the customer and call <code>escalate_to_human</code> with a structured handoff summary.',
            'Retry the call once in case the limit is evaluated against a stale account tier, then escalate if it fails again.',
            'Issue two refunds of $406.20 each, since each is within the autonomous limit and the customer receives the correct total.',
            'Inform the customer that the refund could not be processed due to a system limitation and close the interaction.'
          ],
          ans: [0],
          why: 'A business error is not retryable and is not a malfunction — it is policy working as ' +
            'designed. The payload supplies both a customer-appropriate explanation and the intended next ' +
            'action, so the agent relays the message and escalates with the handoff detail a human will ' +
            'need (<a href="#/unit/1.4">1.4</a>).',
          wrong: [
            '',
            'The payload states <code>isRetryable: false</code>. Retrying a policy decision wastes a ' +
            'round trip on a guaranteed identical outcome and delays the escalation the customer needs.',
            'This circumvents a financial control, which is a serious defect rather than a clever ' +
            'workaround — and a well-designed gate tracks cumulative session totals precisely to prevent ' +
            'it (<a href="#/unit/1.5">1.5</a>).',
            'Misleading and unhelpful: nothing failed technically, and closing the interaction abandons a ' +
            'customer whose refund is legitimately approvable by a human.'
          ]
        },
        {
          id: 'q2.2.2', scn: 1,
          stem: '<p>Your <code>get_customer</code> tool searches by email and finds no matching account. ' +
            'How should it report this?</p>',
          opts: [
            '<code>isError: false</code> with an empty result set and a description noting that no customer matched the email searched.',
            '<code>isError: true</code> with <code>errorCategory: "validation"</code>, since the supplied email did not resolve to anything usable.',
            '<code>isError: true</code> with <code>isRetryable: true</code>, so the agent retries in case the record is still replicating.',
            '<code>isError: true</code> with a generic "customer not found" message, so the agent clearly understands the lookup did not succeed.'
          ],
          ans: [0],
          why: 'The query executed correctly; the answer is that nothing matched. That is a successful ' +
            'query with an empty result, and the guide asks explicitly for access failures to be ' +
            'distinguished from valid empty results. The agent can then honestly ask whether the customer ' +
            'used a different address.',
          wrong: [
            '',
            'The input was a well-formed email. Nothing was invalid — the account simply does not exist. ' +
            'Labelling it a validation error tells the agent to fix an input that was already correct.',
            'Inventing a replication-lag hypothesis makes the agent retry a search that will keep ' +
            'matching nothing, adding latency and no information.',
            'A generic error conflates "the lookup did not work" with "the lookup worked and the answer ' +
            'is no such customer". The first invites an apology about system trouble; the second invites a ' +
            'useful question.'
          ]
        },
        {
          id: 'q2.2.3', scn: 3,
          stem: '<p>Your <code>load_document</code> tool encounters two kinds of failure: intermittent ' +
            'gateway timeouts that usually succeed on a second attempt, and unparseable-file errors that ' +
            'never succeed. Where should retry logic live?</p>',
          opts: [
            'Inside the tool, which knows the error category definitively and can retry transient failures once or twice before returning a structured error for anything unresolved.',
            'In the agent\'s system prompt, instructing it to retry once whenever a tool returns an error and to give up on the second failure.',
            'In a uniform exponential-backoff wrapper applied to every tool call, so retry behaviour is consistent across the whole tool set.',
            'In the coordinator, which has the broadest view of the workflow and can decide whether a retry is worth the latency.'
          ],
          ans: [0],
          why: 'The tool has definitive knowledge of what failed — it saw the gateway timeout or the parse ' +
            'exception. The agent only ever sees a flag it must interpret. Bounded local recovery inside ' +
            'the tool handles the transient case invisibly, and anything unresolved propagates upward with ' +
            'proper structure.',
          wrong: [
            '',
            'Makes retry behaviour probabilistic and uniform when it should be deterministic and ' +
            'category-dependent. It will retry unparseable files, which can never succeed.',
            'A uniform wrapper cannot tell the two categories apart, so it either retries permanent ' +
            'errors pointlessly or fails to retry transient ones. Retry policy must follow the error ' +
            'category.',
            'The coordinator is too far away and lacks the detail: by the time a failure reaches it, the ' +
            'specific exception is gone. It should be deciding about failures the tool could not resolve, ' +
            'not about individual gateway timeouts.'
          ]
        },
        {
          id: 'q2.2.4', scn: 3,
          stem: '<p>Which fields make a tool error most actionable for the calling agent?</p>' +
            '',
          opts: [
            'An <code>errorCategory</code> distinguishing transient, validation, business and permission failures.',
            'An <code>isRetryable</code> boolean, so the agent does not waste attempts on failures that cannot succeed.',
            'The query or arguments that were attempted, so the agent can tell a genuine alternative from a repeat of the same call.',
            'The stack trace and internal error code from the backend service, giving the agent complete diagnostic detail.'
          ],
          ans: [0, 1, 2],
          why: 'Category selects the recovery strategy, retryability prevents wasted attempts, and the ' +
            'attempted query lets the agent construct a genuinely different next call rather than ' +
            'repeating itself. Together these are what turn a failure into a decision.',
          wrong: [
            '', '', '',
            'A stack trace is diagnostic noise for the model: it consumes context, invites the agent to ' +
            'surface internal detail to customers, and does not answer the only question that matters — ' +
            'what should I do next.'
          ]
        },
        {
          id: 'q2.2.5', scn: 3,
          stem: '<p>A document analysis subagent hits a persistent parse failure on one of eight assigned ' +
            'documents. It has already analysed the other seven. Which propagation behaviour is ' +
            'correct?</p>',
          opts: [
            'Return the seven completed analyses together with a structured error for the eighth, naming the failure type and the document, so the coordinator can proceed with partial results and annotate coverage.',
            'Retry the failing document until it parses, since partial results would make the final report incomplete.',
            'Return an error for the whole subtask, since a partial analysis cannot be relied upon and the coordinator should re-plan.',
            'Return the seven analyses and silently omit the eighth, since the coordinator can detect the missing document by comparing counts.'
          ],
          ans: [0],
          why: 'Local recovery has been exhausted, so the failure propagates — but with the partial ' +
            'results preserved and enough structure for the coordinator to decide. That decision may be to ' +
            'source the document another way, or to proceed and annotate a coverage gap in the output ' +
            '(<a href="#/unit/5.3">5.3</a>).',
          wrong: [
            '',
            'A persistent parse failure will not resolve on repetition; unbounded retries inside a ' +
            'subagent burn latency while the coordinator waits, which the guide names as an anti-pattern.',
            'Discards seven successful analyses over one failure. Graceful degradation — keep what worked, ' +
            'be explicit about what did not — is the point.',
            'Silent omission is the worst option. Expecting the coordinator to notice a count mismatch ' +
            'replaces an explicit signal with an inference nobody will make, and the report ends up ' +
            'quietly missing a source.'
          ]
        }
      ]
    },

    /* ================================================================== 2.3 */
    {
      id: '2.3',
      short: 'Tool distribution & tool_choice',
      title: 'Distribute tools appropriately across agents and configure tool choice',
      scn: [3, 4],
      tldr: 'Two ideas. First, <b>least privilege</b>: an agent with 18 tools selects worse than one with ' +
        '4–5, and an agent holding tools outside its specialisation will misuse them — a synthesis agent ' +
        'with search tools starts researching. Give each agent its role\'s tools, plus narrowly-scoped ' +
        'cross-role tools for genuine high-frequency needs. Second, <b><code>tool_choice</code></b>: ' +
        '<code>"auto"</code> lets the model return text instead of calling anything, <code>"any"</code> ' +
        'forces some tool call, and <code>{"type":"tool","name":"…"}</code> forces one specific tool.',

      concept:
      '<h3>Tool count degrades selection</h3>' +
      '<p>The guide is concrete: giving an agent 18 tools instead of 4–5 <b>degrades tool selection ' +
      'reliability by increasing decision complexity</b>. This is not about context cost, though that ' +
      'exists too. It is that every additional tool is another candidate the model must discriminate ' +
      'against, and discrimination errors compound.</p>' +
      '<p>The usual cause is generosity. A coordinator hands every subagent the full tool set "just in ' +
      'case", and every subagent is now worse at its job than it would have been with four tools.</p>' +

      fig({
        vb: '0 0 700 250',
        caption: 'Least privilege for tools. Each subagent gets its role\'s tools; a narrow cross-role ' +
          'tool covers a genuine high-frequency need without dissolving the role.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Over-provisioned — every agent gets everything</text>' +
          '<rect x="24" y="28" width="300" height="46" rx="6" class="boxBad"/>' +
          '<text x="174" y="48" text-anchor="middle" font-size="10.5">synthesis agent · 18 tools</text>' +
          '<text x="174" y="64" text-anchor="middle" font-size="9.5" class="dim">searches the web instead of synthesising</text' +
          '>' +

          '<text x="360" y="18" font-size="11" font-weight="600">Scoped — role tools + one narrow exception</text>' +
          '<rect x="360" y="28" width="316" height="46" rx="6" class="boxOk"/>' +
          '<text x="518" y="48" text-anchor="middle" font-size="10.5">synthesis agent · 4 tools + verify_fact</text>' +
          '<text x="518" y="64" text-anchor="middle" font-size="9.5" class="dim">synthesises; verifies simple facts in place</text>' +

          '<line x1="24" y1="94" x2="676" y2="94" class="stroke dashed"/>' +

          '<text x="24" y="118" font-size="11" font-weight="600">tool_choice</text>' +

          '<rect x="24" y="130" width="205" height="66" rx="6" class="box"/>' +
          '<text x="126" y="150" text-anchor="middle" font-size="11" font-weight="600" class="mono">"auto"</text>' +
          '<text x="126" y="168" text-anchor="middle" font-size="10" class="dim">may call a tool, may</text>' +
          '<text x="126" y="182" text-anchor="middle" font-size="10" class="dim">just answer in text</text>' +

          '<rect x="243" y="130" width="205" height="66" rx="6" class="boxA"/>' +
          '<text x="345" y="150" text-anchor="middle" font-size="11" font-weight="600" class="mono">"any"</text>' +
          '<text x="345" y="168" text-anchor="middle" font-size="10" class="dim">must call SOME tool;</text>' +
          '<text x="345" y="182" text-anchor="middle" font-size="10" class="dim">model picks which</text>' +

          '<rect x="462" y="130" width="214" height="66" rx="6" class="boxA"/>' +
          '<text x="569" y="150" text-anchor="middle" font-size="10.5" font-weight="600" class="mono">{type:"tool",name:"x"}</text>' +
          '<text x="569" y="168" text-anchor="middle" font-size="10" class="dim">must call exactly x —</text>' +
          '<text x="569" y="182" text-anchor="middle" font-size="10" class="dim">use to force a first step</text>' +

          '<rect x="24" y="210" width="652" height="32" rx="5" class="box"/>' +
          '<text x="40" y="230" font-size="10.5">"auto" is why prompted-JSON extraction sometimes returns prose. "any" guarantees a structured call.</text>'
      }) +

      '<h3>Cross-specialisation misuse</h3>' +
      '<p>Beyond raw count, there is the question of <em>which</em> tools. An agent holding tools outside ' +
      'its specialisation will use them — and in doing so stop doing its job. The guide\'s example is the ' +
      'synthesis agent that "attempts web searches": handed search tools, it starts doing ad-hoc research ' +
      'instead of synthesising what it was given. You get unpredictable behaviour, duplicated work, higher ' +
      'cost, and a role boundary that exists only on your architecture diagram.</p>' +
      '<p>A related case: a document-analysis agent holding a general-purpose <code>fetch_url</code> tool ' +
      'will use it to search the open web. The fix is not an instruction telling it not to — it is ' +
      '<b>replacing the general tool with a constrained one</b>. A <code>load_document</code> tool that ' +
      'validates document URLs makes the misuse structurally impossible, rather than merely ' +
      'discouraged.</p>' +
      '<p>That is the same deterministic-versus-probabilistic move from ' +
      '<a href="#/unit/1.4">task statement 1.4</a>, applied to tool surfaces: <b>constrain the capability ' +
      'rather than requesting restraint</b>.</p>' +

      '<h3>Scoped cross-role tools — the pragmatic exception</h3>' +
      '<p>Strict least privilege can be too strict. If the synthesis agent genuinely needs to check simple ' +
      'facts on 85% of its passes, routing every check through the coordinator costs 2–3 round trips each ' +
      'time. The guide\'s answer is a middle path: give it a <b>narrowly scoped</b> ' +
      '<code>verify_fact</code> tool for the common case, and keep complex investigations flowing through ' +
      'the coordinator.</p>' +
      '<p>Note the shape of that compromise. You do not hand over the search toolset; you hand over one ' +
      'tool that does exactly one thing the role legitimately needs. The role boundary survives.</p>' +

      '<h3><code>tool_choice</code>: three modes</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Setting</th><th>Behaviour</th><th>When to use it</th></tr></thead><tbody>' +
      '<tr><td><code>"auto"</code> <span class="muted">(default)</span></td><td>Model may call a tool or ' +
      'may reply with text.</td><td>Conversational agents, where answering directly is often correct.</td></tr>' +
      '<tr><td><code>"any"</code></td><td>Model <b>must</b> call a tool, but chooses which.</td>' +
      '<td>Guaranteeing structured output when you have several extraction schemas and do not know the ' +
      'document type. Also stops the model returning chat when you need a call.</td></tr>' +
      '<tr><td><code>{"type":"tool","name":"extract_metadata"}</code></td><td>Model <b>must</b> call that ' +
      'specific tool.</td><td>Forcing a particular step first — extract metadata before enrichment — then ' +
      'processing later steps in follow-up turns.</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout note"><span class="co-t">Why <code>"auto"</code> is a bug in an extraction pipeline</span>' +
      '<p>With <code>"auto"</code>, a model asked to extract fields from an ambiguous document may decide ' +
      'the most helpful response is prose — "this document does not appear to contain invoice data" — and ' +
      'return no tool call at all. Your parser then receives text where it expected structure. Setting ' +
      '<code>"any"</code> removes that failure mode entirely. This connects directly to ' +
      '<a href="#/unit/4.3">task statement 4.3</a>.</p></div>' +

      '<div class="callout note"><span class="co-t">A fourth option, outside exam scope</span>' +
      '<p>The API also accepts <code>tool_choice: {"type": "none"}</code>, which forbids tool use for ' +
      'that request. The exam guide\'s objectives name only <code>"auto"</code>, <code>"any"</code> and ' +
      'forced selection, so those three are what items will turn on.</p></div>' +
      '<div class="callout trap"><span class="co-t">Forced tools do not chain</span>' +
      '<p>Forcing a specific tool applies to <em>this</em> request. You cannot express "call ' +
      '<code>extract_metadata</code>, then <code>enrich</code>, then <code>validate</code>" in one ' +
      '<code>tool_choice</code>. Force the first step, then handle the rest in follow-up turns — which is ' +
      'exactly how the guide phrases it.</p></div>',

      example:
      '<h3>Scenario 3 — auditing the tool distribution</h3>' +
      '<p>An audit of the research system finds every subagent holding all 11 tools. Symptoms: the ' +
      'synthesis agent runs its own searches and contradicts the search agent\'s findings; the report ' +
      'agent re-analyses documents instead of rendering; latency and cost are both roughly double ' +
      'projections.</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Agent</th><th>Before</th><th>After</th>' +
      '<th>Reasoning</th></tr></thead><tbody>' +
      '<tr><td>Coordinator</td><td>all 11</td><td><code>Task</code>, <code>Read</code>, ' +
      '<code>Write</code></td><td>It orchestrates. It needs delegation and state, not domain tools.</td></tr>' +
      '<tr><td>Web search</td><td>all 11</td><td><code>web_search</code>, <code>fetch_page</code></td>' +
      '<td>Two tools, one job.</td></tr>' +
      '<tr><td>Doc analysis</td><td>all 11</td><td><code>load_document</code>, ' +
      '<code>extract_data_points</code></td><td><code>fetch_url</code> <b>replaced</b> by ' +
      '<code>load_document</code>, which validates document URLs — so it can no longer wander onto the ' +
      'open web.</td></tr>' +
      '<tr><td>Synthesis</td><td>all 11</td><td><code>Read</code>, <code>Write</code>, ' +
      '<code>verify_fact</code></td><td>Scoped cross-role exception for the 85% simple-fact case; complex ' +
      'verification still goes through the coordinator.</td></tr>' +
      '<tr><td>Report</td><td>all 11</td><td><code>Read</code>, <code>render_report</code></td>' +
      '<td>Rendering only. Nothing to tempt it back upstream.</td></tr>' +
      '</tbody></table></div>' +
      '<p>Three separate wins from one change. Selection accuracy rises because each agent chooses among ' +
      'two or three candidates rather than eleven. Role separation becomes real rather than aspirational. ' +
      'And context cost drops, because tool definitions occupy context in every request an agent makes.</p>' +

      '<h3>Scenario 6 — forcing the first extraction step</h3>' +
      '<p>Your extraction pipeline must always classify a document\'s type and extract its metadata before ' +
      'any enrichment tool runs, because the enrichment depends on the type. Occasionally the model skips ' +
      'straight to enrichment and guesses.</p>' +
      '<pre><code># Turn 1 — force the classification/metadata step\nresp = client.messages.create(\n' +
      '    model       = "claude-opus-5",\n' +
      '    tools       = [extract_metadata, enrich_entities, validate_totals],\n' +
      '    tool_choice = {"type": "tool", "name": "extract_metadata"},   # forced\n' +
      '    messages    = [{"role": "user", "content": document}],\n' +
      ')\n' +
      '\n' +
      '# metadata now guaranteed present. Subsequent steps run in follow-up\n' +
      '# turns, where the model may choose among the remaining tools.\n' +
      'resp2 = client.messages.create(\n' +
      '    model       = "claude-opus-5",\n' +
      '    tools       = [enrich_entities, validate_totals],\n' +
      '    tool_choice = "any",        # must call something, may pick which\n' +
      '    messages    = history,\n' +
      ')</code></pre>' +
      '<p>Turn 1 uses forced selection because exactly one tool is correct. Turn 2 uses ' +
      '<code>"any"</code> because several are legitimate but returning prose is not.</p>',

      mistakes: [
        { t: 'Giving every subagent the full tool set',
          d: 'Degrades selection for all of them and invites cross-specialisation misuse. Scope each ' +
             'agent to its role.' },
        { t: 'Instructing an agent not to misuse a general tool',
          d: 'Probabilistic. Replace <code>fetch_url</code> with a constrained <code>load_document</code> ' +
             'that validates document URLs, and the misuse becomes impossible.' },
        { t: 'Reading least privilege as absolute',
          d: 'A narrowly-scoped cross-role tool for a genuine high-frequency need is the guide\'s ' +
             'recommended answer, not a violation. Scope the tool, not the principle away.' },
        { t: 'Handing over the whole toolset to solve one need',
          d: 'The synthesis agent needed fact verification, not the search suite. Grant the narrow ' +
             'capability.' },
        { t: 'Using <code>"auto"</code> where structured output is required',
          d: 'The model may return prose instead of a tool call, and your parser breaks. Use ' +
             '<code>"any"</code>.' },
        { t: 'Expecting <code>tool_choice</code> to sequence several tools',
          d: 'It constrains the current request only. Force the first step; handle the rest in follow-up ' +
             'turns.' },
        { t: 'Forcing a specific tool when several are legitimate',
          d: 'Over-constrains: if the document type is unknown and you have three extraction schemas, ' +
             '<code>"any"</code> is right and forcing one is wrong.' },
        { t: 'Granting <code>Task</code> to worker subagents',
          d: 'Lets them re-delegate, producing uncontrolled depth and breaking hub-and-spoke ' +
             '(<a href="#/unit/1.3">1.3</a>).' }
      ],

      exam:
      '<p>Expect a tool-overload item — an agent with far too many tools misusing one — where the answer ' +
      'restricts the set to the role. Expect the constrained-replacement item: an agent misusing ' +
      '<code>fetch_url</code> to search the web, fixed by replacing it with <code>load_document</code>, ' +
      'not by instructing it to behave. And expect one <code>tool_choice</code> item; the discriminator is ' +
      'whether you need <em>some</em> tool call (<code>"any"</code>) or <em>one specific</em> tool call ' +
      '(forced). Remember that <code>"auto"</code> permitting a text response is the reason extraction ' +
      'pipelines occasionally return prose.</p>',

      questions: [
        {
          id: 'q2.3.1', scn: 3,
          stem: '<p>Your synthesis subagent has access to 11 tools, including the full web search toolset. ' +
            'In production it frequently runs its own searches rather than synthesising the findings it ' +
            'was given, sometimes producing conclusions that contradict the search agent\'s results. What ' +
            'is the correct fix?</p>',
          opts: [
            'Restrict the synthesis agent\'s tool set to the tools its role requires, removing the general search tools it should not be using.',
            'Add a system prompt instruction telling the synthesis agent that it must not perform its own web searches under any circumstances.',
            'Keep the tools available but have the coordinator review the synthesis agent\'s tool calls and reject any search it attempts.',
            'Give the search agent a higher priority in the coordinator\'s routing so that its findings take precedence in the final report.'
          ],
          ans: [0],
          why: 'Agents with tools outside their specialisation misuse them. Scoping the synthesis agent to ' +
            'its role\'s tools removes the capability rather than asking for restraint, which also ' +
            'improves its selection accuracy among the tools it does keep and cuts the context cost of ' +
            'carrying eleven definitions.',
          wrong: [
            '',
            'Probabilistic enforcement of a boundary you can enforce structurally. It will mostly work ' +
            'and occasionally not, and every request pays for the instruction.',
            'Building a review layer to reject calls the agent should not be able to make is far more ' +
            'machinery than removing the tools, and it puts the coordinator in the business of policing ' +
            'individual tool calls.',
            'Addresses which findings win a conflict, not why the synthesis agent is generating ' +
            'independent findings at all. The contradictions are a symptom; the role violation is the ' +
            'cause.'
          ]
        },
        {
          id: 'q2.3.2', scn: 3,
          stem: '<p>Your document analysis subagent has a general-purpose <code>fetch_url</code> tool for ' +
            'retrieving documents by URL. Logs show it using <code>fetch_url</code> to hit search engines ' +
            'and browse general web pages instead of analysing its assigned documents. What is the most ' +
            'effective correction?</p>',
          opts: [
            'Replace <code>fetch_url</code> with a constrained <code>load_document</code> tool that validates that the URL points to a document in the approved corpus.',
            'Keep <code>fetch_url</code> and add an instruction to the subagent\'s system prompt forbidding its use for web searching.',
            'Keep <code>fetch_url</code> and add a PostToolUse hook that discards results whose content looks like a search engine results page.',
            'Remove <code>fetch_url</code> entirely and require the coordinator to fetch every document and pass its contents in the subagent\'s prompt.'
          ],
          ans: [0],
          why: 'Replacing a general-purpose tool with a constrained alternative makes the misuse ' +
            'architecturally impossible rather than merely discouraged — the guide\'s stated pattern, with ' +
            'this exact example. The agent keeps the capability it legitimately needs and loses the one it ' +
            'was abusing.',
          wrong: [
            '',
            'Instruction is probabilistic where a constraint is available. The tool can still reach any ' +
            'URL, so the failure mode remains live.',
            'Detecting search-results pages by content shape is brittle and reactive: the fetch already ' +
            'happened, and any page that does not match the heuristic still gets through.',
            'Workable but heavy-handed. It funnels every document through the coordinator, inflating its ' +
            'context with document bodies and removing the subagent\'s ability to load what it needs. The ' +
            'constrained tool achieves the boundary without the bottleneck.'
          ]
        },
        {
          id: 'q2.3.3', scn: 6,
          stem: '<p>You are extracting structured data from documents whose type is unknown in advance. ' +
            'You have defined three extraction tools, one per document schema. Occasionally the model ' +
            'returns a prose explanation instead of calling any tool, and your parser fails. Which ' +
            '<code>tool_choice</code> setting resolves this?</p>',
          opts: [
            '<code>"any"</code> — the model must call one of the tools, but may choose which schema fits the document.',
            '<code>"auto"</code> with a system prompt instruction to always call one of the three extraction tools.',
            '<code>{"type": "tool", "name": "extract_generic"}</code> — force a single general-purpose extraction tool to guarantee a call.',
            '<code>"auto"</code> combined with a post-processing step that retries the request when no tool call is present.'
          ],
          ans: [0],
          why: '<code>"any"</code> guarantees a tool call while leaving the schema choice to the model — ' +
            'exactly right when the document type is unknown and several schemas are legitimate. The prose ' +
            'failure mode disappears structurally.',
          wrong: [
            '',
            '<code>"auto"</code> permits a text response by definition, so the failure mode remains and ' +
            'you are relying on an instruction to suppress a behaviour the setting explicitly allows.',
            'Forcing one tool is over-constrained here: you have three schemas precisely because ' +
            'documents differ, and a generic tool would discard the schema-specific structure you built.',
            'A retry loop treats the symptom, paying for a wasted request every time. The setting that ' +
            'prevents it is one parameter away.'
          ]
        },
        {
          id: 'q2.3.4', scn: 6,
          stem: '<p>Your pipeline must always call <code>extract_metadata</code> before any enrichment ' +
            'tool, because enrichment depends on the document type that metadata establishes. How do you ' +
            'guarantee the ordering?</p>',
          opts: [
            'Set <code>tool_choice</code> to <code>{"type": "tool", "name": "extract_metadata"}</code> on the first request, then handle enrichment in follow-up turns.',
            'Set <code>tool_choice</code> to <code>"any"</code> and list <code>extract_metadata</code> first in the tools array so it is preferred.',
            'Set <code>tool_choice</code> to a list of tool names in the required execution order, which the model then follows.',
            'Describe the required ordering in each enrichment tool\'s description so the model knows metadata must come first.'
          ],
          ans: [0],
          why: 'Forced tool selection guarantees that specific call on this request. Because ' +
            '<code>tool_choice</code> constrains only the current request, the remaining steps are handled ' +
            'in follow-up turns — which is precisely how the guide describes the pattern.',
          wrong: [
            '',
            '<code>"any"</code> guarantees some call, not that one, and array order is not a documented ' +
            'selection lever. This would work most of the time and fail unpredictably.',
            '<code>tool_choice</code> does not accept an ordered list — it constrains a single request. ' +
            'Inventing sequencing configuration is a recurring distractor pattern on this exam.',
            'Descriptions influence selection probabilistically. For a genuine dependency where guessing ' +
            'the type produces wrong enrichment, that is not a guarantee.'
          ]
        },
        {
          id: 'q2.3.5', scn: 3,
          stem: '<p>Your synthesis agent needs to verify simple facts — dates, names, figures — on the ' +
            'majority of its passes. Which statement best describes the correct application of least ' +
            'privilege here?</p>',
          opts: [
            'Grant a narrowly-scoped <code>verify_fact</code> tool for the frequent simple case, while complex investigations continue to route through the coordinator.',
            'Grant no additional tools: every verification should route through the coordinator, since that is what preserves role separation.',
            'Grant the full web search toolset, since verification genuinely requires search and least privilege should not obstruct a real need.',
            'Grant no additional tools and instead have the search agent pre-verify every fact it returns, so synthesis never needs to check anything.'
          ],
          ans: [0],
          why: 'Least privilege means the tools the role needs, at the narrowest scope that meets the ' +
            'need — not the fewest tools imaginable. A single-purpose verification tool serves the common ' +
            'case without dissolving the boundary, and complex cases keep the coordinator in the loop.',
          wrong: [
            '',
            'Absolutist reading. Routing every trivial date check through the coordinator adds 2–3 round ' +
            'trips per check for no reliability gain, which is why the guide endorses scoped cross-role ' +
            'tools.',
            'Over-provisioning dressed as pragmatism. The full search toolset invites the synthesis agent ' +
            'to do open-ended research, which is the misuse this task statement is about.',
            'Speculative pre-verification cannot know which claims synthesis will want to check, so it ' +
            'pays to verify facts nobody queries while still missing the ones that come up during ' +
            'synthesis.'
          ]
        }
      ]
    },

    /* ================================================================== 2.4 */
    {
      id: '2.4',
      short: 'MCP server integration & scoping',
      title: 'Integrate MCP servers into Claude Code and agent workflows',
      scn: [4, 2],
      tldr: 'Project-scoped servers go in <code>.mcp.json</code> (committed, shared with the team); ' +
        'personal or experimental ones go in user-scoped <code>~/.claude.json</code>. <b>Never commit a ' +
        'token</b> — use environment variable expansion, <code>${GITHUB_TOKEN}</code>. Tools from all ' +
        'configured servers are discovered at connection time and available simultaneously. And know the ' +
        'distinction that carries real exam weight: <b>MCP tools take actions; MCP resources are readable ' +
        'content</b> that gives the agent a map without exploratory tool calls.',

      concept:
      '<h3>Two scopes, one decision</h3>' +
      '<div class="tablewrap"><table><thead><tr><th></th><th>Project scope</th><th>User scope</th></tr></thead><tbody>' +
      '<tr><th>File</th><td><code>.mcp.json</code> in the repository root</td><td><code>~/.claude.json</code></td></tr>' +
      '<tr><th>Shared?</th><td>Yes — committed to version control, so every teammate gets it on ' +
      'pull</td><td>No — local to that one machine and user</td></tr>' +
      '<tr><th>Use for</th><td>Servers the whole team needs: the company Jira, the internal design system, ' +
      'the shared database schema</td><td>Personal experiments, a server you are prototyping, ' +
      'machine-specific tooling</td></tr>' +
      '<tr><th>Credentials</th><td><code>${ENV_VAR}</code> expansion — never a literal token</td>' +
      '<td>Also prefer env vars, though the blast radius of a mistake is smaller</td></tr>' +
      '</tbody></table></div>' +
      '<p>Both are active at once. Tools from <b>all</b> configured servers are discovered when the ' +
      'connection is established and are available to the agent simultaneously — so a developer can run ' +
      'the team\'s Jira server and their own experimental server side by side without either disabling the ' +
      'other.</p>' +

      '<h3>Credentials: environment variable expansion</h3>' +
      '<p>Six developers, six personal access tokens, one committed config file. The pattern that makes ' +
      'this work:</p>' +
      '<pre><code>// .mcp.json — safe to commit\n{\n' +
      '  "mcpServers": {\n' +
      '    "github": {\n' +
      '      "command": "npx",\n' +
      '      "args": ["-y", "@modelcontextprotocol/server-github"],\n' +
      '      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }\n' +
      '    },\n' +
      '    "jira": {\n' +
      '      "command": "npx",\n' +
      '      "args": ["-y", "@company/mcp-jira"],\n' +
      '      "env": { "JIRA_TOKEN": "${JIRA_TOKEN}", "JIRA_HOST": "${JIRA_HOST}" }\n' +
      '    }\n' +
      '  }\n' +
      '}</code></pre>' +
      '<p>Each developer exports their own <code>GITHUB_TOKEN</code>; the file stays identical for ' +
      'everyone and contains no secret. Document the required variables in the README so a new joiner ' +
      'knows what to set.</p>' +

      '<div class="callout trap"><span class="co-t">Why a placeholder is not equivalent</span>' +
      '<p>A recurring distractor: "commit the file with a placeholder token and tell developers to replace ' +
      'it locally." This is worse in three specific ways. Every developer now has an uncommitted local ' +
      'modification, so the file shows as dirty forever and real config changes get lost in the noise. ' +
      'Someone will eventually <code>git add -A</code> and commit their live token. And there is no ' +
      'mechanism at all — you are relying on people remembering. Env var expansion needs no local edit, so ' +
      'there is nothing to leak and nothing to remember.</p></div>' +

      '<h3>MCP tools versus MCP resources</h3>' +
      '<p>The guide treats this as a first-class concept, and it is the part of 2.4 most likely to appear.</p>' +
      '<div class="vs">' +
      '<div><span class="vs-h">Tools — the agent <em>calls</em> them</span><p>Functions that take an ' +
      'action or fetch a specific thing: <code>create_issue</code>, <code>process_refund</code>, ' +
      '<code>lookup_order</code>. Each call is a round trip the agent must decide to make.</p></div>' +
      '<div><span class="vs-h">Resources — the agent <em>reads</em> them</span><p>Content exposed for ' +
      'context, no action taken: an issue catalogue, a database schema, a documentation hierarchy, a list ' +
      'of available projects. It is a map, available up front.</p></div></div>' +

      fig({
        vb: '0 0 700 200',
        caption: 'Exploratory tool calls versus a resource that supplies the map. Resources cut both ' +
          'round trips and context spent on discovery.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Tools only — the agent must explore to find out what exists</text>' +
          '<rect x="24" y="28" width="92" height="34" rx="5" class="box"/>' +
          '<text x="70" y="49" text-anchor="middle" font-size="9.5" class="mono">list_projects</text>' +
          '<path class="arrow" d="M116 45 L142 45" marker-end="url(#ah)"/>' +
          '<rect x="142" y="28" width="92" height="34" rx="5" class="box"/>' +
          '<text x="188" y="49" text-anchor="middle" font-size="9.5" class="mono">list_issues</text>' +
          '<path class="arrow" d="M234 45 L260 45" marker-end="url(#ah)"/>' +
          '<rect x="260" y="28" width="92" height="34" rx="5" class="box"/>' +
          '<text x="306" y="49" text-anchor="middle" font-size="9.5" class="mono">list_users</text>' +
          '<path class="arrow" d="M352 45 L378 45" marker-end="url(#ah)"/>' +
          '<rect x="378" y="28" width="130" height="34" rx="5" class="boxBad"/>' +
          '<text x="443" y="49" text-anchor="middle" font-size="10">…then the real work</text>' +
          '<text x="520" y="49" font-size="10" class="dim">3 wasted round trips</text>' +

          '<line x1="24" y1="86" x2="676" y2="86" class="stroke dashed"/>' +

          '<text x="24" y="110" font-size="11" font-weight="600">With a resource — the map is already in context</text>' +
          '<rect x="24" y="120" width="210" height="52" rx="6" class="boxOk"/>' +
          '<text x="129" y="140" text-anchor="middle" font-size="10.5" font-weight="600">MCP resource: catalogue</text>' +
          '<text x="129" y="156" text-anchor="middle" font-size="9.5" class="dim">projects · issue summaries · schema</text>' +
          '<path class="arrow" d="M234 146 L300 146" marker-end="url(#ah)"/>' +
          '<rect x="300" y="120" width="200" height="52" rx="6" class="boxA"/>' +
          '<text x="400" y="146" text-anchor="middle" font-size="10.5" font-weight="600">straight to the real work</text>' +
          '<text x="520" y="150" font-size="10" class="dim">0 exploratory calls</text>'
      }) +

      '<p>The payoff the guide names: resources <b>reduce exploratory tool calls</b>. Without a catalogue, ' +
      'an agent asked "which open issues touch the billing module?" must call ' +
      '<code>list_projects</code>, then <code>list_issues</code>, then possibly ' +
      '<code>list_components</code>, just to discover what exists before it can search. Each call is ' +
      'latency plus context. A resource hands it the map in one read.</p>' +

      '<h3>MCP tool descriptions compete with built-ins</h3>' +
      '<p>A subtle integration problem: Claude Code ships capable built-in tools, and the agent knows them ' +
      'well. A thinly-described MCP tool loses to <code>Grep</code> even when it is far better suited — ' +
      'your MCP server might offer semantic code search across the whole monorepo, and the agent will ' +
      'still reach for a regex because <code>Grep</code>\'s behaviour is unambiguous to it.</p>' +
      '<p>The fix is the same as <a href="#/unit/2.1">2.1</a>: <b>enhance the MCP tool descriptions</b> to ' +
      'explain capabilities and outputs in detail, so the model understands what it offers over the ' +
      'built-in.</p>' +

      '<h3>Build or adopt?</h3>' +
      '<p>The guide has a clear preference: <b>choose existing community MCP servers for standard ' +
      'integrations</b> — Jira, GitHub, Postgres — and <b>reserve custom servers for team-specific ' +
      'workflows</b>. A hand-rolled Jira server is maintenance you did not need to own. A server exposing ' +
      'your company\'s internal deployment pipeline is not available anywhere else.</p>' +
      '<div class="callout note"><span class="co-t">Out of scope, worth noting</span>' +
      '<p><em>Deploying or hosting</em> MCP servers — infrastructure, networking, containers — is on the ' +
      'exam\'s explicit out-of-scope list. You need to know how to <b>configure and scope</b> servers and ' +
      'how to design their tool and resource interfaces. You do not need to know how to run one in ' +
      'Kubernetes.</p></div>',

      example:
      '<h3>Scenario 4 — onboarding six developers onto three MCP servers</h3>' +
      '<p>The team needs: the company Jira (everyone), a GitHub server (everyone, personal tokens), and — ' +
      'for one developer — an experimental server they are prototyping. Nobody\'s token may reach the ' +
      'repository.</p>' +
      '<pre><code>// .mcp.json — committed. Identical for all six developers.\n{\n' +
      '  "mcpServers": {\n' +
      '    "jira":   { "command": "npx", "args": ["-y", "@company/mcp-jira"],\n' +
      '                "env": { "JIRA_TOKEN": "${JIRA_TOKEN}",\n' +
      '                         "JIRA_HOST":  "${JIRA_HOST}" } },\n' +
      '    "github": { "command": "npx",\n' +
      '                "args": ["-y", "@modelcontextprotocol/server-github"],\n' +
      '                "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" } }\n' +
      '  }\n' +
      '}</code></pre>' +
      '<pre><code>// ~/.claude.json — Priya\'s machine only, never committed\n{\n' +
      '  "mcpServers": {\n' +
      '    "deploy-experiment": { "command": "node",\n' +
      '                           "args": ["/Users/priya/src/mcp-deploy/index.js"] }\n' +
      '  }\n' +
      '}</code></pre>' +
      '<pre><code># README.md — the missing half of the pattern\n## MCP setup\nexport JIRA_TOKEN=...      # Jira > Profile > Personal Access Tokens\nexport JIRA_HOST=company.atlassian.net\nexport GITHUB_TOKEN=...    # scopes: repo, read:org</code></pre>' +
      '<p>Priya now has all three servers available simultaneously — the two shared ones from the project ' +
      'file and her own from the user file. Her five teammates have two. Nobody has a token in git, and ' +
      'nobody has a permanently-dirty working tree.</p>' +

      '<h3>Adding a resource to stop the exploration</h3>' +
      '<p>The Jira server initially exposed only tools, and traces showed a consistent pattern: three ' +
      'discovery calls before any real work. Exposing a catalogue as a resource removed them.</p>' +
      '<pre><code>resource: "jira://catalogue"\n{\n' +
      '  "projects": [\n' +
      '    { "key": "BILL", "name": "Billing",  "open": 34,\n' +
      '      "components": ["invoicing", "dunning", "tax"] },\n' +
      '    { "key": "PAY",  "name": "Payments", "open": 19,\n' +
      '      "components": ["charge", "refund", "webhooks"] }\n' +
      '  ],\n' +
      '  "issue_types": ["bug", "story", "task", "epic"],\n' +
      '  "workflow_states": ["backlog", "in-progress", "review", "done"]\n' +
      '}</code></pre>' +
      '<p>Asked "which open billing issues involve tax?", the agent now reads the catalogue, sees ' +
      '<code>BILL</code> has a <code>tax</code> component, and issues one targeted search. Three round ' +
      'trips became zero.</p>',

      mistakes: [
        { t: 'Hardcoding a token in <code>.mcp.json</code>',
          d: 'Commits a secret to version history, where it persists even after removal. Use ' +
             '<code>${ENV_VAR}</code> expansion.' },
        { t: 'Committing a placeholder token for developers to overwrite',
          d: 'Leaves every clone with a permanent local modification, invites an accidental commit of a ' +
             'real token, and relies on people remembering. Env var expansion needs no local edit.' },
        { t: 'Putting a team server in user scope',
          d: 'The new joiner does not get it, and you get the classic "works for everyone but the newest ' +
             'developer" bug. Shared tooling belongs in committed <code>.mcp.json</code>.' },
        { t: 'Putting a personal experiment in project scope',
          d: 'Forces a half-finished server on the whole team and pollutes their tool list.' },
        { t: 'Assuming one server must be disabled to use another',
          d: 'Tools from all configured servers are discovered at connection time and available ' +
             'simultaneously.' },
        { t: 'Exposing a data catalogue as another tool',
          d: 'That keeps discovery as a round trip. Readable content the agent consults for context is a ' +
             '<em>resource</em>.' },
        { t: 'Leaving MCP tool descriptions thin',
          d: 'They compete with well-understood built-ins like <code>Grep</code> and lose. Describe ' +
             'capabilities and outputs in detail.' },
        { t: 'Building a custom server for a standard integration',
          d: 'Prefer a community server for Jira, GitHub or Postgres; reserve custom work for ' +
             'team-specific workflows.' },
        { t: 'Not documenting the required environment variables',
          d: 'Env var expansion only works if people know what to export. The README is part of the ' +
             'pattern.' }
      ],

      exam:
      '<p>The credentials item is close to certain: several developers with individual tokens, and the ' +
      'answer is project-scoped <code>.mcp.json</code> with <code>${ENV_VAR}</code> expansion plus README ' +
      'documentation. The placeholder-token option is the designed trap. Expect a scoping item — team ' +
      'server in project scope, experiment in user scope, both active at once — and, with good ' +
      'probability, a resources item: an agent making excessive exploratory calls to discover what data ' +
      'exists, fixed by exposing a catalogue as an MCP resource rather than adding another tool.</p>',

      questions: [
        {
          id: 'q2.4.1', scn: 4,
          stem: '<p>Six developers each have their own GitHub personal access token. You need the GitHub ' +
            'MCP server available to the whole team, with the configuration in version control and no ' +
            'secret committed. What is the correct approach?</p>',
          opts: [
            'Configure the server in project-scoped <code>.mcp.json</code> using <code>${GITHUB_TOKEN}</code> environment variable expansion, and document the required variable in the README.',
            'Commit <code>.mcp.json</code> with a placeholder token value and instruct each developer to replace it with their own token locally.',
            'Have each developer configure the GitHub server in their own <code>~/.claude.json</code> with their token inline.',
            'Commit <code>.mcp.json</code> with a shared service-account token so every developer uses identical, auditable credentials.'
          ],
          ans: [0],
          why: 'Environment variable expansion keeps one identical committed file for everyone while each ' +
            'developer supplies their own credential from their environment. Nothing secret enters git, ' +
            'and nobody needs a local modification. Documenting the variable in the README is the other ' +
            'half — expansion only helps if people know what to export.',
          wrong: [
            '',
            'Leaves every clone permanently dirty, so genuine config changes hide among local edits, and ' +
            'sooner or later someone commits their live token. It also depends entirely on people ' +
            'remembering.',
            'Each developer re-does the same setup and the team configuration is not shared at all — the ' +
            'new joiner gets nothing. Shared tooling belongs in project scope.',
            'A shared token defeats per-developer attribution, makes rotation a coordinated event, and is ' +
            'still a secret committed to version control.'
          ]
        },
        {
          id: 'q2.4.2', scn: 4,
          stem: '<p>Your agent is asked "which open issues in the billing module are unassigned?" Traces ' +
            'show it calling <code>list_projects</code>, then <code>list_issue_types</code>, then ' +
            '<code>list_components</code>, purely to discover what exists, before finally issuing a ' +
            'search. What change eliminates this overhead?</p>',
          opts: [
            'Expose the project, component and issue-type catalogue as an MCP resource the agent can read for context, rather than discovering it through tool calls.',
            'Add a single <code>get_catalogue</code> tool that returns all three listings in one call, reducing three round trips to one.',
            'Include the full catalogue in the system prompt so the agent never needs to look it up.',
            'Improve the <code>search_issues</code> tool description so the agent understands it can search without discovering the catalogue first.'
          ],
          ans: [0],
          why: 'Resources are readable content the agent consults for context without taking an action, ' +
            'and the guide names reducing exploratory tool calls as their purpose. Exposing the catalogue ' +
            'as a resource gives the agent the map up front and removes the discovery phase entirely.',
          wrong: [
            '',
            'Better than three calls, but still a round trip for information that is context rather than ' +
            'action. This is the distractor that tests whether you know resources exist as a distinct ' +
            'concept.',
            'A static copy in the system prompt goes stale as projects and components change, and it pays ' +
            'the full token cost on every request whether or not the catalogue is relevant.',
            'The agent explores because it does not know what values are valid, not because it ' +
            'misunderstands the search tool. Better search documentation does not supply the ' +
            'vocabulary.'
          ]
        },
        {
          id: 'q2.4.3', scn: 2,
          stem: '<p>A developer is prototyping a custom MCP server that wraps your internal deployment ' +
            'tooling. It is unfinished and only works on their machine. They also need the team\'s shared ' +
            'Jira server. What is the correct configuration?</p>',
          opts: [
            'The Jira server in project-scoped <code>.mcp.json</code> and the experimental server in user-scoped <code>~/.claude.json</code>; both will be available simultaneously.',
            'Both servers in project-scoped <code>.mcp.json</code>, with the experimental one commented out until it is ready to share.',
            'Both servers in user-scoped <code>~/.claude.json</code>, so the developer controls their whole configuration in one place.',
            'The Jira server in project scope, and the experimental server added to project scope on a feature branch that is never merged.'
          ],
          ans: [0],
          why: 'Shared team tooling belongs in the committed project file; personal and experimental ' +
            'servers belong in user scope where they affect nobody else. Tools from all configured servers ' +
            'are discovered at connection time, so the developer gets both at once.',
          wrong: [
            '',
            'A commented-out server is dead configuration in a shared file, and uncommenting it locally ' +
            'produces exactly the permanently-dirty working tree that the placeholder-token anti-pattern ' +
            'creates.',
            'Moving Jira to user scope means every teammate must configure it themselves and a new joiner ' +
            'gets nothing — the classic "works for everyone but the newest developer" failure.',
            'Maintaining a never-merged branch to hold local configuration is a manual, fragile substitute ' +
            'for the user-scope file that exists for exactly this purpose.'
          ]
        },
        {
          id: 'q2.4.4', scn: 4,
          stem: '<p>You have added an MCP server offering semantic code search across your monorepo, with ' +
            'the description "Searches code." The agent continues to use the built-in <code>Grep</code> ' +
            'tool for questions where semantic search would be substantially better. What is the fix?</p>',
          opts: [
            'Expand the MCP tool\'s description to explain its capabilities, what it returns, and when it should be preferred over a regex search.',
            'Remove <code>Grep</code> from the agent\'s allowed tools so that the MCP search tool is the only option available.',
            'Rename the MCP tool to <code>grep_semantic</code> so the agent associates it with the search behaviour it already knows.',
            'Add a system prompt instruction telling the agent to always prefer MCP tools over built-in tools.'
          ],
          ans: [0],
          why: 'The agent understands <code>Grep</code> precisely and this tool barely at all, so it picks ' +
            'the one it can reason about. Detailing capabilities, outputs and when to prefer it over a ' +
            'literal search gives the model the basis to choose correctly — the same description principle ' +
            'as <a href="#/unit/2.1">2.1</a>, applied to an MCP tool competing with a built-in.',
          wrong: [
            '',
            'Regex search remains genuinely the right tool for many tasks — finding an exact error string, ' +
            'for instance. Removing it trades one misselection for another.',
            'A name cannot carry capability information, and borrowing "grep" actively suggests literal ' +
            'matching, which is the opposite of what the tool does.',
            'A blanket preference for MCP over built-ins is wrong as a rule and is exactly the kind of ' +
            'keyword-laden instruction that distorts selection across the whole tool set ' +
            '(<a href="#/unit/2.1">2.1</a>).'
          ]
        },
        {
          id: 'q2.4.5', scn: 4,
          stem: '<p>Which statements about MCP tools and resources are correct?</p>',
          opts: [
            'Tools are functions the agent calls to take an action or fetch something specific; resources are readable content the agent consults for context.',
            'Exposing a catalogue as a resource reduces the exploratory tool calls an agent would otherwise make to discover what data exists.',
            'Resources are simply tools that return large payloads, and the distinction is one of response size rather than of purpose.',
            'Only one MCP server\'s tools can be active in a session, so servers must be enabled and disabled as the task changes.'
          ],
          ans: [0, 1],
          why: 'The distinction is purpose, not size: tools act, resources inform. And the practical ' +
            'payoff of a resource is exactly that it removes the discovery round trips an agent makes to ' +
            'learn what exists before it can do useful work.',
          wrong: [
            '', '',
            'Size is incidental. A resource can be small and a tool can return a large payload; what ' +
            'separates them is whether the agent is taking an action or reading context.',
            'Tools from all configured servers are discovered at connection time and available ' +
            'simultaneously. There is no need to toggle servers per task.'
          ]
        }
      ]
    },

    /* ================================================================== 2.5 */
    {
      id: '2.5',
      short: 'Built-in tool selection',
      title: 'Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively',
      scn: [4, 2],
      tldr: 'The most memorisable material on the exam. <b>Grep</b> searches file <em>contents</em>; ' +
        '<b>Glob</b> matches file <em>paths</em>; <b>Read</b> loads a file; <b>Edit</b> makes a targeted ' +
        'change via unique anchor text, and <b>fails when the anchor is not unique</b> — the fallback is ' +
        'Read + Write; <b>Bash</b> runs commands. Two strategy points ride along: explore ' +
        '<b>incrementally</b> (Grep for entry points, then Read to follow imports) rather than reading ' +
        'everything, and trace usage <b>through wrappers</b> by finding exported names first, then ' +
        'searching each one.',

      concept:
      '<h3>The tool map</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Tool</th><th>Job</th><th>Reach for it when</th></tr></thead><tbody>' +
      '<tr><td><b>Grep</b></td><td>Search file <b>contents</b> for a pattern</td><td>Finding all callers ' +
      'of <code>calculateTax</code>, locating an error message, finding every import of a module</td></tr>' +
      '<tr><td><b>Glob</b></td><td>Match file <b>paths</b> by pattern</td><td>Finding all ' +
      '<code>**/*.test.tsx</code>, every migration file, all YAML under <code>config/</code></td></tr>' +
      '<tr><td><b>Read</b></td><td>Load a file\'s contents</td><td>You know which file you need and want ' +
      'to see it</td></tr>' +
      '<tr><td><b>Write</b></td><td>Write a whole file, overwriting</td><td>Generating a file from ' +
      'scratch, or as the Edit fallback</td></tr>' +
      '<tr><td><b>Edit</b></td><td>Targeted modification, located by <b>unique</b> anchor text</td>' +
      '<td>Changing a function signature, fixing one line — the default for modifying existing files</td></tr>' +
      '<tr><td><b>Bash</b></td><td>Run a shell command</td><td>Running tests, git operations, build ' +
      'commands</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout rule"><span class="co-t">The one-line discriminator</span>' +
      '<p><b>Grep looks inside files. Glob looks at their names.</b> "Find where this function is called" ' +
      'is content — Grep. "Find all the test files" is naming — Glob. Nearly every built-in-tool item ' +
      'reduces to that sentence.</p></div>' +

      '<h3>Edit and the uniqueness requirement</h3>' +
      '<p>Edit locates its target by matching text exactly. If that text appears more than once in the ' +
      'file, the edit is ambiguous and <b>fails</b> — it does not silently pick the first occurrence, which ' +
      'is the behaviour you would want but should not assume.</p>' +
      '<p>Two ways forward. Extend the anchor until it is unique — include the surrounding lines, so ' +
      '<code>return total</code> becomes <code>tax = rate * subtotal\\n    return total</code>. Or, when ' +
      'the change is pervasive enough that no anchor helps, fall back to <b>Read + Write</b>: load the ' +
      'whole file, transform it, write it back. The guide names that fallback explicitly.</p>' +
      '<p>Prefer Edit as the default, though. Read + Write on a large file spends context on content you ' +
      'are not changing, and rewriting a whole file to alter three lines risks losing anything you failed ' +
      'to reproduce.</p>' +

      fig({
        vb: '0 0 700 190',
        caption: 'Edit needs a unique anchor. Extend the anchor first; fall back to Read + Write when the ' +
          'change is genuinely file-wide.',
        body:
          '<rect x="24" y="20" width="170" height="40" rx="6" class="boxA"/>' +
          '<text x="109" y="45" text-anchor="middle" font-size="11" font-weight="600">Edit with anchor text</text>' +
          '<path class="arrow" d="M194 40 L250 40" marker-end="url(#ah)"/>' +
          '<polygon points="330,18 400,40 330,62 260,40" class="box"/>' +
          '<text x="330" y="37" text-anchor="middle" font-size="10">anchor</text>' +
          '<text x="330" y="49" text-anchor="middle" font-size="10">unique?</text>' +

          '<path class="arrow" d="M400 32 L460 24" marker-end="url(#ah)"/>' +
          '<text x="428" y="18" font-size="9.5" class="dim">yes</text>' +
          '<rect x="460" y="8" width="216" height="32" rx="5" class="boxOk"/>' +
          '<text x="568" y="28" text-anchor="middle" font-size="10.5">targeted edit applied</text>' +

          '<path class="arrow" d="M400 48 L460 62" marker-end="url(#ah)"/>' +
          '<text x="424" y="70" font-size="9.5" class="dim">no</text>' +
          '<rect x="460" y="46" width="216" height="32" rx="5" class="boxBad"/>' +
          '<text x="568" y="66" text-anchor="middle" font-size="10.5">Edit fails — ambiguous</text>' +

          '<path class="arrow" d="M568 78 L568 104" marker-end="url(#ah)"/>' +
          '<rect x="360" y="104" width="316" height="34" rx="5" class="boxOk"/>' +
          '<text x="518" y="125" text-anchor="middle" font-size="10.5">1 · extend the anchor with surrounding lines</text>' +
          '<rect x="360" y="144" width="316" height="34" rx="5" class="boxOk"/>' +
          '<text x="518" y="165" text-anchor="middle" font-size="10.5">2 · or fall back to Read + Write for the whole file</text>'
      }) +

      '<h3>Incremental exploration beats bulk reading</h3>' +
      '<p>Faced with an unfamiliar codebase, the naive move is to read everything. It exhausts context on ' +
      'files that turn out to be irrelevant, and by the time the agent reaches the code that matters it is ' +
      'operating in a degraded window.</p>' +
      '<p>The guide\'s pattern: <b>start with Grep to find entry points, then Read to follow imports and ' +
      'trace flows</b>. You spend context only on the path that is actually relevant.</p>' +
      '<pre><code># Question: how does a refund actually get processed?\n\n' +
      'Grep  "def process_refund|function processRefund"   → payments/refund.py:88\n' +
      'Read  payments/refund.py                            → calls RefundGateway\n' +
      'Grep  "class RefundGateway"                         → gateways/refund.py:12\n' +
      'Read  gateways/refund.py                            → calls billing.ledger.post\n' +
      'Grep  "def post"  --path billing/ledger.py          → the write path\n\n' +
      '# 3 greps + 2 reads traced the flow. Reading all of payments/ and\n' +
      '# billing/ would have cost an order of magnitude more context.</code></pre>' +

      '<h3>Tracing through wrappers — the item people miss</h3>' +
      '<p>You are asked to find every place a deprecated <code>getUserById</code> is used. You Grep for ' +
      '<code>getUserById</code>, find eleven call sites, and report eleven. You are wrong, because some ' +
      'callers reach it through a wrapper:</p>' +
      '<pre><code>// users/legacy.js\nexport function getUserById(id) { /* deprecated */ }\n\n' +
      '// users/index.js  — a re-export under a different name\nexport { getUserById as fetchUser } from "./legacy";\n\n' +
      '// users/helpers.js — a wrapper\nexport function loadUserProfile(id) {\n' +
      '  return getUserById(id);        // every caller of this is an indirect caller\n' +
      '}</code></pre>' +
      '<p>The guide\'s procedure: <b>first identify all exported names, then search for each name across ' +
      'the codebase.</b> Concretely:</p>' +
      '<ol>' +
      '<li>Grep for <code>getUserById</code> → direct callers, plus the re-export and the wrapper.</li>' +
      '<li>Note every alias and wrapper you found: <code>fetchUser</code>, <code>loadUserProfile</code>.</li>' +
      '<li>Grep for each of those names → the indirect callers.</li>' +
      '<li>Repeat if a wrapper is itself wrapped.</li>' +
      '</ol>' +
      '<p>The trap answer is step 1 alone. Any option that stops at direct callers is incomplete, and any ' +
      'option that proposes reading every file to be thorough is the bulk-reading anti-pattern.</p>',

      example:
      '<h3>Scenario 4 — four requests, four tools</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Request</th><th>Tool</th><th>Why</th></tr></thead><tbody>' +
      '<tr><td>"Find everywhere <code>calculateTax</code> is called."</td><td><b>Grep</b></td>' +
      '<td>Call sites are file <em>contents</em>. Glob would only find files named after it.</td></tr>' +
      '<tr><td>"Find all the TypeScript test files."</td><td><b>Glob</b> <code>**/*.test.{ts,tsx}</code></td>' +
      '<td>A naming pattern. Grepping for "test" would match comments and unrelated prose.</td></tr>' +
      '<tr><td>"Change <code>calculateTax</code> to take a currency argument."</td><td><b>Edit</b></td>' +
      '<td>Targeted change with a unique anchor — the signature line.</td></tr>' +
      '<tr><td>"Run the test suite and show me what fails."</td><td><b>Bash</b></td>' +
      '<td>Executing a command.</td></tr>' +
      '</tbody></table></div>' +

      '<h3>When Edit fails mid-task</h3>' +
      '<p>The agent tries to rename a variable and Edit reports that the anchor text is not unique:</p>' +
      '<pre><code>Edit  old_string: "  const result = compute(x);"\n      → FAILS: 4 occurrences in this file\n\n' +
      '# Option A — extend the anchor until it is unique\nEdit  old_string: "function summarise(x) {\\n  const result = compute(x);"\n      → succeeds, unambiguously the right one\n\n' +
      '# Option B — the change is genuinely file-wide (all 4 occurrences)\nRead  src/report.js          # load the whole file\nWrite src/report.js          # write it back, all 4 renamed</code></pre>' +
      '<p>Choose A when you want <em>one</em> of the occurrences, which is usually the case. Choose B when ' +
      'you want all of them, or when the transformation is structural enough that anchoring is hopeless.</p>' +

      '<div class="callout tip"><span class="co-t">Why these items are worth banking</span>' +
      '<p>Domain 2 is 18% of the exam and this task statement is the least ambiguous material in it. ' +
      'Grep-versus-Glob and the Edit uniqueness rule are pure recall — no judgment, no tradeoff. Get them ' +
      'automatic and you buy yourself thinking time for the Domain 1 architecture items.</p></div>',

      mistakes: [
        { t: 'Using Glob to search file contents',
          d: 'Glob matches paths and names. Finding where a function is called is a content search — ' +
             'Grep.' },
        { t: 'Using Grep to find files by type',
          d: 'Grepping for "test" hits comments, strings and prose. A naming pattern is Glob\'s job: ' +
             '<code>**/*.test.tsx</code>.' },
        { t: 'Reading + writing a whole file for a small change',
          d: 'Wastes context on lines you are not touching and risks losing content you fail to ' +
             'reproduce. Edit is the default for modifying existing files.' },
        { t: 'Assuming Edit picks the first match',
          d: 'A non-unique anchor makes the edit <em>fail</em>. Extend the anchor, or fall back to ' +
             'Read + Write.' },
        { t: 'Reading everything before starting',
          d: 'Exhausts context on irrelevant files. Grep for entry points, then Read to follow the ' +
             'imports that matter.' },
        { t: 'Stopping at direct callers',
          d: 'Re-exports and wrapper functions hide indirect callers. Identify exported names, then ' +
             'search each one.' },
        { t: 'Using Bash <code>grep</code> or <code>find</code> when the tools exist',
          d: 'Grep and Glob are purpose-built for this and return structured results. Save Bash for ' +
             'genuine command execution — tests, git, builds.' }
      ],

      exam:
      '<p>These items are short and unambiguous, and there will likely be more than one. "Find all usages ' +
      'of <code>X</code>" → Grep. "Find all files matching a naming pattern" → Glob. "Modify a function ' +
      'signature in one file" → Edit with unique anchor text. "Run the tests" → Bash. "Edit failed because ' +
      'the text appears several times" → extend the anchor or fall back to Read + Write. The one with any ' +
      'depth is the wrapper-tracing question: the complete answer greps for direct callers, identifies ' +
      'wrappers and re-exports, then greps for each of those names.</p>',

      questions: [
        {
          id: 'q2.5.1', scn: 4,
          stem: '<p>You need to find every place in a large codebase where the deprecated function ' +
            '<code>getUserById</code> is used, including calls that reach it indirectly through wrapper ' +
            'functions and re-exports. What is the correct investigation strategy?</p>',
          opts: [
            'Grep for <code>getUserById</code> to find direct callers and any wrappers or re-exports, then Grep for each wrapper and alias name to find the indirect callers.',
            'Grep for <code>getUserById</code> and report the resulting call sites, since a content search across the codebase is exhaustive by definition.',
            'Glob for all source files, then Read each one so that no usage — direct or indirect — can be missed.',
            'Grep for <code>getUserById</code>, then use Bash to run a call-graph analysis tool over the whole repository.'
          ],
          ans: [0],
          why: 'A single search finds direct references, plus the wrappers and re-exports that reference ' +
            'it. Those wrappers have their own names, and their callers never mention ' +
            '<code>getUserById</code> — so you must search for each discovered name in turn. That is the ' +
            'guide\'s procedure: identify exported names, then search for each across the codebase.',
          wrong: [
            '',
            'Exhaustive for the literal string, incomplete for actual usage. A caller of a wrapper such ' +
            'as <code>loadUserProfile</code> never contains the text you searched for, so this ' +
            'systematically under-reports.',
            'The bulk-reading anti-pattern. It exhausts context on irrelevant files and, in a large ' +
            'codebase, will not finish — while targeted searching answers the question in a handful of ' +
            'calls.',
            'Introduces an external dependency that may not exist in the repository, and the two-stage ' +
            'search already answers the question with tools you have.'
          ]
        },
        {
          id: 'q2.5.2', scn: 4,
          stem: '<p>Match each task to the tool that fits it best.</p>' +
            '<p>You need to (i) locate every file matching <code>**/*.migration.sql</code>, and ' +
            '(ii) find every occurrence of the error string "insufficient funds" across the codebase. ' +
            'Which pairing is correct?</p>',
          opts: [
            '(i) Glob, because it matches file paths by pattern; (ii) Grep, because it searches file contents.',
            '(i) Grep, because it can match the filename pattern in directory listings; (ii) Glob, because the string is a fixed literal.',
            '(i) Glob for both, since a single tool keeps the search consistent across the codebase.',
            '(i) Bash with <code>find</code>; (ii) Bash with <code>grep</code>, since shell tools handle both cases uniformly.'
          ],
          ans: [0],
          why: 'Glob matches paths and names; Grep searches inside files. A migration filename pattern is ' +
            'naming; an error string is content. This is the core distinction the exam tests here.',
          wrong: [
            '',
            'Exactly inverted. Grep does not enumerate filenames by pattern, and Glob cannot search for a ' +
            'string inside files.',
            'Glob cannot search file contents at all, so it cannot answer (ii). Consistency is not a ' +
            'reason to use a tool that does not do the job.',
            'Functionally possible but the wrong choice: Grep and Glob are purpose-built, return ' +
            'structured results, and are what the exam expects. Bash is for executing commands such as ' +
            'tests, git operations and builds.'
          ]
        },
        {
          id: 'q2.5.3', scn: 2,
          stem: '<p>You attempt to modify a line with Edit, using <code>const config = load();</code> as ' +
            'the anchor. The edit fails because that text appears three times in the file. You intend to ' +
            'change only the occurrence inside the <code>initialise</code> function. What should you ' +
            'do?</p>',
          opts: [
            'Extend the anchor text to include enough surrounding context — such as the <code>initialise</code> function signature line — to make the match unique.',
            'Read the entire file and Write it back with all three occurrences updated, since Edit cannot handle repeated text.',
            'Call Edit three times in succession; each call will consume one occurrence until the intended one is reached.',
            'Use Bash with <code>sed</code> and a line-number range to modify only the occurrence inside <code>initialise</code>.'
          ],
          ans: [0],
          why: 'Edit requires a unique anchor, and the natural remedy is to widen the anchor until it ' +
            'identifies exactly one location. Including the enclosing function\'s signature does that ' +
            'while keeping the change minimal and the other two occurrences untouched.',
          wrong: [
            '',
            'Read + Write is the correct fallback when the change is genuinely file-wide, but here you ' +
            'want one of the three occurrences. This would incorrectly modify all of them.',
            'Edit does not consume occurrences. A non-unique anchor fails every time it is attempted, so ' +
            'this simply fails three times.',
            'Line-number editing is brittle — it breaks the moment the file shifts — and it bypasses a ' +
            'purpose-built tool that handles this correctly once the anchor is unique.'
          ]
        },
        {
          id: 'q2.5.4', scn: 4,
          stem: '<p>An agent is asked to explain how order refunds flow through an unfamiliar 400-file ' +
            'service. Which approach best manages context while building accurate understanding?</p>',
          opts: [
            'Grep for the refund entry point, Read that file, then follow its imports with further targeted Greps and Reads, expanding only along the relevant path.',
            'Glob for all source files and Read them in dependency order, so the agent has complete information before answering.',
            'Read the repository\'s README and architecture documentation only, and answer from that rather than from the code.',
            'Grep for the word "refund" across the codebase and Read every file that matches.'
          ],
          ans: [0],
          why: 'Incremental exploration — Grep to find entry points, Read to follow imports and trace ' +
            'flows — spends context only on the code that is actually on the path. This is the guide\'s ' +
            'stated approach for building codebase understanding.',
          wrong: [
            '',
            'Reading 400 files exhausts the context window on material that is mostly irrelevant, and by ' +
            'the time the agent reaches the refund path it is operating in a degraded window.',
            'Documentation is a useful starting orientation but is frequently stale, and the question asks ' +
            'how the code actually behaves. Answering from docs alone risks describing a design that was ' +
            'changed a year ago.',
            'Better than reading everything, but "refund" appears in comments, tests, strings and ' +
            'unrelated features. Reading every match is still bulk reading with a slightly smaller ' +
            'bucket; follow the call path instead.'
          ]
        },
        {
          id: 'q2.5.5', scn: 2,
          stem: '<p>Which statements about the built-in tools are correct?</p>',
          opts: [
            'Edit is preferred over Read + Write for modifying an existing file, because it changes only the targeted text and does not spend context on the rest of the file.',
            'Edit fails when its anchor text is not unique within the file, rather than defaulting to the first occurrence.',
            'Write is preferred over Edit for modifying existing files, because rewriting the whole file guarantees the result is exactly as intended.',
            'Grep and Glob are interchangeable for locating code, differing only in the syntax of the pattern they accept.'
          ],
          ans: [0, 1],
          why: 'Edit is the default for modifying existing files precisely because it is targeted, and its ' +
            'uniqueness requirement is a hard constraint — an ambiguous anchor produces a failure, not a ' +
            'guess. Knowing both facts is what lets you choose the right fallback when an edit fails.',
          wrong: [
            '', '',
            'Rewriting a whole file to change a few lines spends context on unchanged content and risks ' +
            'losing anything not faithfully reproduced. Read + Write is the fallback, not the default.',
            'They search different things entirely: Grep searches file contents, Glob matches file paths. ' +
            'That is a difference of purpose, not of pattern syntax.'
          ]
        }
      ]
    }

    ]
  });
})(window.CCA);
