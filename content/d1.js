/* Domain 1 — Agentic Architecture & Orchestration (27%, ≈16 items) */
(function (CCA) {
  var fig = function (o) { return CCA.fig(o); };

  CCA.domains.push({
    n: 1,
    orient: '<div class="callout rule"><span class="co-t">Orientation</span>' +
      '<p>This is the domain to over-prepare. At 27% it is almost twice Domain 5, and its ideas leak into ' +
      'every other domain — the enforcement question from 1.4 reappears in tool design, the decomposition ' +
      'question from 1.6 reappears in code review, and the context-passing question from 1.3 reappears in ' +
      'provenance. If you internalise one thing here, make it the distinction between what you can ask a ' +
      'model to do and what you must make it impossible to avoid.</p></div>',

    units: [

    /* ================================================================== 1.1 */
    {
      id: '1.1',
      short: 'Agentic loops & stop_reason',
      title: 'Design and implement agentic loops for autonomous task execution',
      scn: [1, 3, 4],
      tldr: 'An agentic loop is a <code>while</code> loop whose exit condition is a single field on the ' +
        'API response: <code>stop_reason</code>. When it is <code>"tool_use"</code> you execute the ' +
        'requested tools, append the results to the conversation, and call the model again. When it is ' +
        '<code>"end_turn"</code> you stop. Everything else — parsing the text for "I\'m finished", capping ' +
        'iterations, checking whether text content exists — is an anti-pattern the exam actively tests.',

      concept:
      '<p>Strip away the vocabulary and an "agent" is a very small piece of control flow. You send a ' +
      'request. You look at one field on the response. You either run something and go round again, or you ' +
      'stop. That is the whole mechanism, and the exam expects you to know it precisely enough to spot ' +
      'four plausible-sounding corruptions of it.</p>' +

      '<h3>The loop, exactly</h3>' +
      '<p>Each call to the Messages API is <b>stateless</b>. The model has no server-side memory of your ' +
      'previous call. Whatever the model is going to reason about on iteration <i>n</i> must be present in ' +
      'the <code>messages</code> array you send on iteration <i>n</i>. That is why "append the tool result ' +
      'to the conversation history" is not housekeeping — it is the only channel through which the model ' +
      'learns what its tool call returned.</p>' +

      fig({
        vb: '0 0 700 300',
        caption: 'The agentic loop. <code>stop_reason</code> is the only branch condition. Tool results ' +
          're-enter the conversation so the next iteration can reason about them.',
        body:
          '<rect x="30" y="24" width="150" height="44" rx="6" class="boxA"/>' +
          '<text x="105" y="43" text-anchor="middle" font-size="12" font-weight="600">Build request</text>' +
          '<text x="105" y="59" text-anchor="middle" font-size="10.5" class="dim">system + messages + tools</text>' +

          '<path class="arrow" d="M180 46 L245 46" marker-end="url(#ah)"/>' +

          '<rect x="245" y="24" width="140" height="44" rx="6" class="box"/>' +
          '<text x="315" y="51" text-anchor="middle" font-size="12" font-weight="600">Call Claude</text>' +

          '<path class="arrow" d="M385 46 L450 46" marker-end="url(#ah)"/>' +

          '<polygon points="530,20 615,46 530,72 445,46" class="box"/>' +
          '<text x="530" y="43" text-anchor="middle" font-size="11" font-weight="600">stop_reason</text>' +
          '<text x="530" y="57" text-anchor="middle" font-size="10" class="dim">?</text>' +

          // end_turn branch
          '<path class="arrow" d="M615 46 L660 46" marker-end="url(#ah)"/>' +
          '<text x="637" y="36" font-size="10" class="mono dim" text-anchor="middle">end</text>' +
          '<rect x="600" y="86" width="80" height="38" rx="6" class="boxOk"/>' +
          '<text x="640" y="103" text-anchor="middle" font-size="11" font-weight="600">Done</text>' +
          '<text x="640" y="116" text-anchor="middle" font-size="9.5" class="dim">return text</text>' +
          '<path class="arrow" d="M660 46 L660 86" marker-end="url(#ah)"/>' +
          '<text x="683" y="64" font-size="9.5" class="mono">"end_turn"</text>' +

          // tool_use branch
          '<path class="arrow" d="M530 72 L530 128" marker-end="url(#ah)"/>' +
          '<text x="540" y="104" font-size="9.5" class="mono">"tool_use"</text>' +

          '<rect x="420" y="128" width="220" height="46" rx="6" class="box"/>' +
          '<text x="530" y="147" text-anchor="middle" font-size="12" font-weight="600">Execute every tool_use block</text>' +
          '<text x="530" y="163" text-anchor="middle" font-size="10" class="dim">in parallel if there are several</text>' +

          '<path class="arrow" d="M420 151 L250 151" marker-end="url(#ah)"/>' +

          '<rect x="60" y="128" width="190" height="46" rx="6" class="boxA"/>' +
          '<text x="155" y="147" text-anchor="middle" font-size="12" font-weight="600">Append tool_result blocks</text>' +
          '<text x="155" y="163" text-anchor="middle" font-size="10" class="dim">one user message, all results</text>' +

          '<path class="arrow" d="M155 128 L155 90 L105 90 L105 68" marker-end="url(#ah)"/>' +
          '<text x="168" y="112" font-size="10" class="dim">iterate</text>' +

          '<rect x="30" y="212" width="640" height="62" rx="6" class="boxBad"/>' +
          '<text x="46" y="232" font-size="11" font-weight="600">Not the exit condition:</text>' +
          '<text x="46" y="249" font-size="10.5">· text that says "I have completed your request"  · a fixed cap of 10 iterations</text>' +
          '<text x="46" y="265" font-size="10.5">· "the response contains a text block"  · the absence of a tool call in the prose</text>'
      }) +

      '<h3>The four <code>stop_reason</code> values you should recognise</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Value</th><th>Meaning</th><th>What the loop does</th></tr></thead><tbody>' +
      '<tr><td><code>"tool_use"</code></td><td>The response contains one or more <code>tool_use</code> ' +
      'blocks; Claude wants results before continuing.</td><td><b>Execute and iterate.</b> Append every ' +
      'result, call again.</td></tr>' +
      '<tr><td><code>"end_turn"</code></td><td>Claude finished this turn naturally.</td>' +
      '<td><b>Exit the loop.</b> Return the text to the user.</td></tr>' +
      '<tr><td><code>"max_tokens"</code></td><td>Output hit the <code>max_tokens</code> ceiling and was ' +
      'truncated mid-thought.</td><td>Not a completion. Request a continuation or raise the ceiling — ' +
      'never treat truncated output as a finished answer.</td></tr>' +
      '<tr><td><code>"stop_sequence"</code></td><td>A configured stop sequence was produced.</td>' +
      '<td>Treat like a controlled end, per your own design.</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout note"><span class="co-t">Scope note</span><p>The Messages API documents a ' +
      'wider set than the four above: also <code>"pause_turn"</code> (a long-running server tool needs ' +
      'another round trip), <code>"refusal"</code> (a safety classifier declined), and ' +
      '<code>"model_context_window_exceeded"</code>. The exam guide names only <code>"tool_use"</code> ' +
      'and <code>"end_turn"</code> in its objectives, so those two are what items will hinge on. Knowing ' +
      'the others exist is useful engineering; they will not be the answer.</p></div>' +

      '<h3>Why <code>end_turn</code> does not mean "conversation over"</h3>' +
      '<p>This trips people up. <code>end_turn</code> ends <b>the assistant\'s turn</b>, not the session. ' +
      'If the agent finishes a refund and the customer immediately asks "and can you also update my ' +
      'address?", you do not start a new session. You append the new user message to the same ' +
      '<code>messages</code> array and re-enter the loop. Starting fresh would throw away the verified ' +
      'customer identity and the refund you just processed — exactly the context the next request needs.</p>' +

      '<h3>Model-driven vs pre-configured control</h3>' +
      '<p>The guide draws an explicit distinction between <b>model-driven decision-making</b> — Claude ' +
      'reasons about which tool to call next from the current context — and a <b>pre-configured decision ' +
      'tree</b> where your code decides the sequence. Both are legitimate designs, and knowing which you ' +
      'have chosen is the point.</p>' +
      '<div class="vs">' +
      '<div class="good"><span class="vs-h">Model-driven loop</span><p>You expose tools and let ' +
      '<code>stop_reason</code> drive. Handles branching you did not anticipate — a customer whose order ' +
      'lookup reveals a second problem. Costs you determinism.</p></div>' +
      '<div class="poor"><span class="vs-h">Hard-coded sequence</span><p>Your code calls tool A, then B, ' +
      'then C. Perfectly predictable, and blind to anything off the happy path. If you find yourself ' +
      'hard-coding the sequence for <em>everything</em>, you have built a workflow and do not need an ' +
      'agent.</p></div></div>' +
      '<p>The nuance the exam rewards: these are not mutually exclusive. You run a model-driven loop, and ' +
      'you still gate specific transitions deterministically where the stakes require it — which is ' +
      'exactly <a href="#/unit/1.4">task statement 1.4</a>.</p>' +

      '<h3>Parallel tool calls in one turn</h3>' +
      '<p>A single assistant response may contain several <code>tool_use</code> blocks. Execute them ' +
      'concurrently, then return <b>all</b> of their <code>tool_result</code> blocks in a <b>single</b> ' +
      'user message. Splitting results across several messages does work, but it teaches the model that ' +
      'parallel calls get handled serially, and it will stop emitting them. If a tool failed, still return ' +
      'a result for it, marked as an error — silently dropping one leaves the model waiting for something ' +
      'that will never arrive.</p>',

      example:
      '<h3>Scenario 1 — the support agent\'s loop, one turn at a time</h3>' +
      '<p>The customer writes: <em>"My order 4471 arrived smashed. I want my money back."</em> Here is ' +
      'what the loop actually does, iteration by iteration.</p>' +
      '<pre><code>iteration 1 ─────────────────────────────────────────────\n' +
      'send:    system + [user: "order 4471 arrived smashed…"] + tools\n' +
      'receive: stop_reason = "tool_use"\n' +
      '         tool_use { id: "tu_01", name: "get_customer",\n' +
      '                    input: { email: "dana@example.com" } }\n' +
      'do:      run get_customer → { customer_id: "C-88213", verified: true }\n' +
      '         append user message: [ tool_result(tu_01, …) ]\n' +
      '\n' +
      'iteration 2 ─────────────────────────────────────────────\n' +
      'send:    full history so far (nothing is remembered server-side)\n' +
      'receive: stop_reason = "tool_use"\n' +
      '         tool_use { id: "tu_02", name: "lookup_order",\n' +
      '                    input: { order_id: "4471" } }\n' +
      'do:      run lookup_order → { total: 128.40, status: "delivered", … }\n' +
      '         append tool_result(tu_02, …)\n' +
      '\n' +
      'iteration 3 ─────────────────────────────────────────────\n' +
      'receive: stop_reason = "tool_use"\n' +
      '         tool_use { id: "tu_03", name: "process_refund",\n' +
      '                    input: { order_id: "4471", amount: 128.40 } }\n' +
      'do:      PreToolUse gate checks: has get_customer returned a verified\n' +
      '         id this session? yes → allow. amount ≤ 500? yes → allow.\n' +
      '         run process_refund → { refund_id: "R-5512" }\n' +
      '         append tool_result(tu_03, …)\n' +
      '\n' +
      'iteration 4 ─────────────────────────────────────────────\n' +
      'receive: stop_reason = "end_turn"\n' +
      '         text: "I\'ve refunded $128.40 to your original payment method…"\n' +
      'do:      EXIT the loop. Show the text. Keep the history.\n' +
      '\n' +
      '── customer replies "thanks — also change my address" ──\n' +
      'do:      append the new user message to the SAME history and re-enter\n' +
      '         the loop. Do not start a new session: C-88213 is already\n' +
      '         verified and R-5512 already happened.</code></pre>' +

      '<p>Three things to notice. First, the loop body never inspects the assistant\'s prose — only ' +
      '<code>stop_reason</code>. Second, the full history is re-sent every iteration, because the API is ' +
      'stateless; this is also why cost and latency climb as a conversation grows, which is ' +
      '<a href="#/unit/5.1">task statement 5.1</a>. Third, the deterministic gate at iteration 3 sits ' +
      '<em>outside</em> the model, in the loop — the model asked to refund, and code decided whether that ' +
      'was allowed.</p>' +

      '<div class="callout tip"><span class="co-t">A safety cap is fine — as a cap</span>' +
      '<p>Wrapping the loop in <code>for i in range(25)</code> to stop a runaway is good engineering. The ' +
      'exam\'s objection is to using the cap as the <b>primary</b> stopping mechanism, or setting it so ' +
      'low (10) that legitimate multi-step work gets guillotined. Cap for safety; branch on ' +
      '<code>stop_reason</code>.</p></div>',

      mistakes: [
        { t: 'Parsing the text for completion signals',
          d: 'Looking for "I have completed", "Is there anything else?", or the mere presence of a text ' +
             'block. Model prose is not a protocol. It changes with prompt, model and temperature — and ' +
             'Claude often writes explanatory text <em>alongside</em> a <code>tool_use</code> block, so ' +
             '"there is text, therefore it is done" is wrong even on the happy path.' },
        { t: 'Using a max-iteration count as the exit condition',
          d: 'A cap terminates work that was progressing fine and hides the real signal. Keep it as an ' +
             'outer safety net; branch on <code>stop_reason</code>.' },
        { t: 'Not appending tool results to the conversation',
          d: 'The most consequential bug in the domain. The API is stateless — a result you do not append ' +
             'was never observed. Symptom: the agent calls the same tool repeatedly, or answers as though ' +
             'the tool returned nothing.' },
        { t: 'Starting a new session after <code>end_turn</code>',
          d: 'Discards verified identity, completed actions and everything the customer said. Append the ' +
             'follow-up to the existing history instead.' },
        { t: 'Splitting parallel tool results across several user messages',
          d: 'Return every <code>tool_result</code> from one assistant turn in a single user message. ' +
             'Splitting them trains the model out of emitting parallel calls, quietly costing you latency ' +
             'for the rest of the session.' },
        { t: 'Dropping the result of a failed tool',
          d: 'Return it with an error flag and structured context (see <a href="#/unit/2.2">2.2</a>). ' +
             'Omitting it leaves a dangling <code>tool_use</code> with no matching result.' },
        { t: 'Treating <code>max_tokens</code> as completion',
          d: 'Truncated output looks like an answer and is not one. Detect it and continue, or the agent ' +
             'will act on half a thought.' }
      ],

      exam:
      '<p>Items here are usually one of three shapes. <b>(a)</b> "Claude returns <code>stop_reason: ' +
      '"tool_use"</code> — what does the loop do next?" The answer always contains all three beats: ' +
      'execute the tool, append the result to history, call Claude again with the updated history. An ' +
      'option that executes the tool but forgets to append is the trap. <b>(b)</b> "The agent finished and ' +
      'the user asks a follow-up." The answer continues the same session. <b>(c)</b> An option list where ' +
      'three choices are text-parsing or iteration-capping schemes and one checks ' +
      '<code>stop_reason</code>. Pick the field, every time.</p>',

      questions: [
        {
          id: 'q1.1.1', scn: 1,
          stem: '<p>Your support agent sends a request and receives a response with ' +
            '<code>stop_reason: "tool_use"</code> containing a single <code>tool_use</code> block for ' +
            '<code>lookup_order</code>. What must your loop do before the model can reason about the ' +
            'order data?</p>',
          opts: [
            'Execute <code>lookup_order</code>, append a <code>tool_result</code> block referencing that <code>tool_use</code> id to the conversation history, and call Claude again with the complete updated history.',
            'Execute <code>lookup_order</code> and pass the result as a new <code>system</code> prompt on the next call, keeping the message history unchanged.',
            'Execute <code>lookup_order</code> and store the result in your application\'s session object, then call Claude again — the model will request the data if it needs it.',
            'Inspect the assistant\'s text block first to confirm it intends to continue, then execute the tool only if the text does not indicate completion.'
          ],
          ans: [0],
          why: 'The Messages API is stateless: the model reasons only over what you send in the current ' +
            'request. A <code>tool_result</code> block, tied to the originating <code>tool_use</code> id ' +
            'and appended to the message history, is the sole channel by which the tool\'s output reaches ' +
            'the next iteration. Then you re-send the whole history.',
          wrong: [
            '',
            'The <code>system</code> prompt is for durable instructions and persona, not per-iteration ' +
            'tool output. It also breaks the <code>tool_use</code>/<code>tool_result</code> pairing the ' +
            'API expects, and destroys prompt-cache stability by rewriting the prefix every turn.',
            'Application-side state is invisible to the model. Nothing in the API lets Claude reach into ' +
            'your session object — this is the classic statelessness mistake, and the symptom is an agent ' +
            'that calls the same tool over and over.',
            'Text is not the control channel. Claude frequently emits explanatory prose in the same ' +
            'response as a tool call, so gating execution on the text will both skip legitimate calls and ' +
            'introduce a failure mode that <code>stop_reason</code> already rules out.'
          ]
        },
        {
          id: 'q1.1.2', scn: 1,
          stem: '<p>A code reviewer flags this loop in your agent:</p>' +
            '<pre><code>for _ in range(10):\n' +
            '    resp = call_claude(history, tools)\n' +
            '    text = extract_text(resp)\n' +
            '    if "let me know if you need anything else" in text.lower():\n' +
            '        break\n' +
            '    run_tools(resp)          # results discarded\n' +
            '</code></pre>' +
            '<p>Which combination of defects would you fix first?</p>',
          opts: [
            'Termination is decided by matching assistant prose instead of <code>stop_reason</code>, and tool results are never appended to <code>history</code>.',
            'The iteration limit of 10 is too low, and <code>call_claude</code> should be wrapped in a retry with exponential backoff.',
            'The loop should call a more capable model so that the completion phrase is emitted more consistently.',
            'The loop should check for the presence of a text block rather than a specific phrase, making the completion test more robust.'
          ],
          ans: [0],
          why: 'Two independent, severe bugs. Matching prose is unreliable by construction — the phrase ' +
            'may never appear, or may appear alongside a genuine tool call. And discarding tool results ' +
            'means the model never sees what its tools returned, so it loops calling the same tool or ' +
            'answers from nothing. Both must be fixed before anything else matters.',
          wrong: [
            '',
            'The cap is a symptom, not the disease — raising it just lets a broken loop spin longer. ' +
            'Backoff is sound engineering but irrelevant to why this loop produces wrong answers.',
            'This is the model-as-a-fix distractor. No model makes prose-matching a reliable protocol, and ' +
            'the discarded-results bug is entirely in your code.',
            'Checking for "a text block exists" is <em>worse</em>, not better: Claude routinely returns ' +
            'text and a <code>tool_use</code> block in the same response, so this would terminate the ' +
            'loop mid-task.'
          ]
        },
        {
          id: 'q1.1.3', scn: 1,
          stem: '<p>Your agent processes a refund and returns <code>stop_reason: "end_turn"</code> with a ' +
            'confirmation message. Four seconds later the same customer sends: "Great — can you also ' +
            'update the shipping address on my next order?" What is the correct handling?</p>',
          opts: [
            'Append the new user message to the existing conversation history and re-enter the agentic loop.',
            'Begin a new session with a fresh history, since <code>end_turn</code> signalled that the interaction was complete.',
            'Begin a new session but replay a summary of the refund into the system prompt so context is not lost.',
            'Keep the history but reset the tool list, because the refund tools are no longer relevant to an address change.'
          ],
          ans: [0],
          why: '<code>end_turn</code> terminates the assistant\'s <em>turn</em>, not the session. The ' +
            'existing history holds the verified customer identity and the completed refund — precisely ' +
            'what the next request needs. Append and continue.',
          wrong: [
            '',
            'This is the central misreading of <code>end_turn</code>. A fresh session throws away the ' +
            'verified customer id, forcing re-verification and risking a second refund on an order the ' +
            'agent no longer knows about.',
            'Better than a bare restart, but still needless loss: summarising costs tokens and fidelity ' +
            'when the verbatim history is right there. Summary injection is the answer when prior context ' +
            'is <em>stale</em> (see <a href="#/unit/1.7">1.7</a>), not when it is four seconds old.',
            'There is no reason to withdraw tools mid-conversation, and doing so could strand the model ' +
            'if the address change turns out to need order data. Tool scoping is a per-agent design ' +
            'decision (<a href="#/unit/2.3">2.3</a>), not a per-turn one.'
          ]
        },
        {
          id: 'q1.1.4', scn: 4,
          stem: '<p>A developer-productivity agent responds with <b>three</b> <code>tool_use</code> blocks ' +
            'in one assistant message: two <code>Grep</code> calls and one <code>Glob</code> call, all ' +
            'independent. One of the <code>Grep</code> calls raises a timeout in your executor. How should ' +
            'the loop respond?</p>',
          opts: [
            'Execute all three concurrently, then send one user message containing three <code>tool_result</code> blocks — including an error-flagged result for the timed-out call.',
            'Execute all three concurrently, then send one user message containing the two successful <code>tool_result</code> blocks, omitting the failed one so the model is not confused by it.',
            'Send the two successful results immediately in one message, then send the failure in a second message once you have retried it.',
            'Abandon the turn, discard all three results, and re-issue the original request so the model can plan again with a clean slate.'
          ],
          ans: [0],
          why: 'Every <code>tool_use</code> block needs a matching <code>tool_result</code>, and all ' +
            'results from one assistant turn belong in a single user message. A failure is reported as a ' +
            'result marked as an error with context about what went wrong — that is what lets the model ' +
            'decide whether to retry, work around it, or tell the user.',
          wrong: [
            '',
            'Omitting a result leaves a dangling <code>tool_use</code> with nothing answering it. Far from ' +
            'reducing confusion, it removes the information the model needs to react to the failure.',
            'Splitting results across messages trains the model to stop emitting parallel calls, so you ' +
            'lose the concurrency benefit for the rest of the session. Retry logic belongs inside the ' +
            'tool (<a href="#/unit/2.2">2.2</a>), not in a second round trip.',
            'Throwing away two successful results to redo work is pure waste, and the model has no way of ' +
            'knowing what changed, so it may well plan the same three calls again.'
          ]
        },
        {
          id: 'q1.1.5', scn: 3,
          stem: '<p>Your research agent returns a response with <code>stop_reason: "max_tokens"</code>. ' +
            'The visible text ends mid-sentence, part-way through what looks like a list of findings. What ' +
            'is the correct interpretation and action?</p>',
          opts: [
            'The output was truncated by the token ceiling; treat it as incomplete and either request a continuation or raise <code>max_tokens</code>, rather than passing the partial text downstream.',
            'The model has finished its reasoning and hit the ceiling only on formatting; the content is complete enough to pass to the synthesis agent.',
            'The model is signalling that the task is too large; decompose it into subtasks and discard this response entirely.',
            'The conversation history has exceeded the context window; summarise the history before retrying.'
          ],
          ans: [0],
          why: '<code>max_tokens</code> means generation was cut off at your configured output ceiling, ' +
            'mid-thought. It is not a completion signal. Handing truncated findings to a downstream agent ' +
            'propagates a silently incomplete result — one of the nastier bugs to diagnose later.',
          wrong: [
            '',
            'There is no basis for assuming only the formatting was lost. The cut lands wherever the ' +
            'ceiling fell, frequently mid-fact, and downstream agents cannot tell truncated input from ' +
            'complete input.',
            '<code>max_tokens</code> says nothing about task size — it reports your own output limit. ' +
            'Decomposition may be a reasonable design (see <a href="#/unit/1.6">1.6</a>) but discarding ' +
            'usable partial output and misreading the signal are both wrong.',
            'A different failure with its own distinct signal — an over-long input surfaces as ' +
            '<code>model_context_window_exceeded</code>, not as <code>max_tokens</code>, which reports ' +
            'your configured <em>output</em> ceiling.'
          ]
        }
      ]
    },

    /* ================================================================== 1.2 */
    {
      id: '1.2',
      short: 'Coordinator–subagent orchestration',
      title: 'Orchestrate multi-agent systems with coordinator-subagent patterns',
      scn: [3, 4],
      tldr: 'Multi-agent systems on this exam are <b>hub-and-spoke</b>: a coordinator decomposes the task, ' +
        'delegates to specialised subagents, and every message between subagents passes through it. ' +
        'Subagents never talk to each other. When the final output has a coverage gap, look at the ' +
        'coordinator\'s decomposition first — the subagents almost always executed their instructions ' +
        'correctly.',

      concept:
      '<p>A coordinator is an agent whose tools include the ability to spawn other agents. It reads the ' +
      'request, decides what work exists, hands pieces to specialists, collects what comes back, and ' +
      'decides whether the result is good enough. Everything interesting about the architecture follows ' +
      'from one constraint: <b>the coordinator is the only node with a view of the whole task</b>.</p>' +

      fig({
        vb: '0 0 700 300',
        caption: 'Hub-and-spoke. Solid lines are the only permitted paths. The dashed line — a subagent ' +
          'talking directly to another — is the anti-pattern the exam tests.',
        body:
          '<rect x="255" y="18" width="190" height="52" rx="8" class="boxA"/>' +
          '<text x="350" y="40" text-anchor="middle" font-size="13" font-weight="600">Coordinator</text>' +
          '<text x="350" y="57" text-anchor="middle" font-size="10" class="dim">decompose · route · aggregate · judge</text>' +

          '<path class="arrow" d="M290 70 L120 128" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M330 70 L285 128" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M370 70 L450 128" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M410 70 L610 128" marker-end="url(#ah)"/>' +

          '<rect x="40" y="128" width="150" height="52" rx="6" class="box"/>' +
          '<text x="115" y="149" text-anchor="middle" font-size="11.5" font-weight="600">Web search</text>' +
          '<text x="115" y="165" text-anchor="middle" font-size="9.5" class="dim">web_search</text>' +

          '<rect x="212" y="128" width="150" height="52" rx="6" class="box"/>' +
          '<text x="287" y="149" text-anchor="middle" font-size="11.5" font-weight="600">Doc analysis</text>' +
          '<text x="287" y="165" text-anchor="middle" font-size="9.5" class="dim">load_document</text>' +

          '<rect x="384" y="128" width="150" height="52" rx="6" class="box"/>' +
          '<text x="459" y="149" text-anchor="middle" font-size="11.5" font-weight="600">Synthesis</text>' +
          '<text x="459" y="165" text-anchor="middle" font-size="9.5" class="dim">verify_fact only</text>' +

          '<rect x="556" y="128" width="120" height="52" rx="6" class="box"/>' +
          '<text x="616" y="149" text-anchor="middle" font-size="11.5" font-weight="600">Report</text>' +
          '<text x="616" y="165" text-anchor="middle" font-size="9.5" class="dim">render</text>' +

          '<path class="arrow dashed" style="stroke:var(--bad)" d="M190 168 L212 168"/>' +
          '<path class="arrow dashed" style="stroke:var(--bad)" d="M362 168 L384 168"/>' +
          '<text x="287" y="200" text-anchor="middle" font-size="10.5" style="fill:var(--bad)">✗ direct subagent-to-subagent traffic</text>' +

          '<rect x="40" y="222" width="636" height="60" rx="6" class="box"/>' +
          '<text x="56" y="242" font-size="11" font-weight="600">What routing through the hub buys you</text>' +
          '<text x="56" y="259" font-size="10.5">Observability — every hand-off is loggable · Consistent error handling — one recovery policy</text>' +
          '<text x="56" y="275" font-size="10.5">Controlled information flow — the coordinator decides exactly what each subagent sees</text>'
      }) +

      '<h3>Why hub-and-spoke, and not a mesh</h3>' +
      '<p>Letting the synthesis agent call the search agent directly looks like an optimisation — it saves ' +
      'a hop. It costs you three things the guide names explicitly:</p>' +
      '<ul>' +
      '<li><b>Observability.</b> If every hand-off passes through the coordinator, one log gives you the ' +
      'complete information flow. In a mesh, tracing why a claim appeared in the report means ' +
      'reconstructing conversations you never recorded.</li>' +
      '<li><b>Consistent error handling.</b> One place decides what a timeout means. In a mesh, each ' +
      'subagent invents its own policy, and they disagree.</li>' +
      '<li><b>Controlled information flow.</b> The coordinator decides what each subagent sees. That is ' +
      'both a context-budget lever (<a href="#/unit/5.1">5.1</a>) and a correctness lever — a subagent ' +
      'that cannot see another\'s speculative reasoning cannot launder it into a finding.</li>' +
      '</ul>' +

      '<h3>The coordinator\'s four jobs</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Job</th><th>What good looks like</th><th>Failure signature</th></tr></thead><tbody>' +
      '<tr><td><b>Decompose</b></td><td>Subtasks that jointly cover the request, partitioned to minimise ' +
      'overlap.</td><td>Whole facets of the topic missing from the final report.</td></tr>' +
      '<tr><td><b>Delegate</b></td><td>Invoke only the subagents this query needs, with complete context ' +
      'in the prompt.</td><td>Every query dragged through the full pipeline; subagents asking for things ' +
      'they were never told.</td></tr>' +
      '<tr><td><b>Aggregate</b></td><td>Collect structured results, preserving attribution.</td>' +
      '<td>Claims in the report that nobody can trace to a source.</td></tr>' +
      '<tr><td><b>Judge</b></td><td>Evaluate the synthesis for gaps, re-delegate with targeted queries, ' +
      'iterate until coverage is sufficient.</td><td>One-shot pipelines that ship the first draft, gaps ' +
      'and all.</td></tr>' +
      '</tbody></table></div>' +

      '<h3>Dynamic selection beats a fixed pipeline</h3>' +
      '<p>A naive coordinator routes every request through search → analysis → synthesis → report. A good ' +
      'one analyses the request first. "What is the current version of the MCP spec?" needs search and ' +
      'nothing else; dragging it through document analysis and a full synthesis pass costs latency and ' +
      'tokens for no gain. The guide asks for coordinators that <b>dynamically select which subagents to ' +
      'invoke based on query complexity</b>.</p>' +

      '<h3>Iterative refinement: the loop above the loop</h3>' +
      '<p>The coordinator should not accept the first synthesis. The pattern the guide describes is: ' +
      'evaluate the synthesis output for gaps → re-delegate to search and analysis with <b>targeted</b> ' +
      'queries aimed at those gaps → re-invoke synthesis → repeat until coverage is sufficient. Note that ' +
      'the re-delegation is targeted; re-running the original broad query would return the same material ' +
      'and the same gap.</p>' +

      '<div class="callout rule"><span class="co-t">The diagnostic rule that wins items</span>' +
      '<p>When a multi-agent system produces incomplete output and the logs show each subagent completing ' +
      'successfully, <b>the fault is upstream in decomposition</b>. Subagents perform correctly <em>within ' +
      'the scope they were given</em>. Blaming the synthesis agent for not noticing a gap, or the search ' +
      'agent for narrow queries, mistakes the symptom for the cause when the coordinator\'s own subtask ' +
      'list is visibly narrow.</p></div>' +

      '<h3>Partitioning to avoid duplication</h3>' +
      '<p>Three subagents each told to "research AI in creative industries" will return substantially the ' +
      'same articles: you pay three times for one result set. Partition instead — by subtopic (music / ' +
      'film / writing / visual art), by source type (peer-reviewed / trade press / primary interviews), or ' +
      'by time window. Each subagent then has a distinct, non-overlapping brief.</p>',

      example:
      '<h3>Scenario 3 — diagnosing the missing three-quarters of a report</h3>' +
      '<p>You ask the system to research <em>"the impact of AI on creative industries."</em> The report ' +
      'comes back articulate, well-cited, and entirely about visual art. Music, writing and film are ' +
      'absent. Every subagent logged success.</p>' +
      '<p>The coordinator\'s trace shows the decomposition:</p>' +
      '<pre><code>coordinator: subtasks created\n' +
      '  1. "AI in digital art creation"      → web_search agent   ✓ 14 sources\n' +
      '  2. "AI in graphic design"            → web_search agent   ✓ 11 sources\n' +
      '  3. "AI in photography"               → web_search agent   ✓  9 sources\n' +
      'doc_analysis  ✓ 34 documents summarised\n' +
      'synthesis     ✓ report generated, 34/34 sources represented\n' +
      'report        ✓ rendered</code></pre>' +
      '<p>Read those three subtask titles. Digital art, graphic design, photography — all visual. The ' +
      'coordinator decomposed "creative industries" into three flavours of one industry. Everything ' +
      'downstream then worked perfectly on the wrong scope: the synthesis agent faithfully represented ' +
      '34 of 34 sources, and all 34 were about visual art.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Fixes that miss</span>' +
      '<p>Telling the synthesis agent to spot coverage gaps — it can only see what it was handed. ' +
      'Broadening the search agent\'s queries — it queried exactly what it was asked. Loosening the ' +
      'document agent\'s relevance filter — it filtered nothing out.</p></div>' +
      '<div class="good"><span class="vs-h">The fix that lands</span>' +
      '<p>Change the coordinator. Give its prompt explicit coverage requirements — "creative industries ' +
      'includes at minimum music, writing, film/TV, visual art, design and performance; create at least ' +
      'one subtask per sector and state which sectors you have covered" — and add the refinement loop so ' +
      'it checks the synthesis against that list before accepting it.</p></div></div>' +
      '<p>The general lesson: in a hub-and-spoke system the coordinator\'s prompt is the specification for ' +
      'the entire output. Quality criteria belong there, not in the workers.</p>',

      mistakes: [
        { t: 'Allowing direct subagent-to-subagent communication',
          d: 'Sacrifices observability, consistent error handling and controlled information flow at once. ' +
             'On this exam it is essentially always the wrong option — the correct move is a scoped tool ' +
             'for the common case (see <a href="#/unit/2.3">2.3</a>) with complex cases still routed ' +
             'through the coordinator.' },
        { t: 'Blaming downstream agents for coverage gaps',
          d: 'If the logs show subagents succeeding and the coordinator\'s subtasks are visibly narrow, ' +
             'the decomposition is the bug. Subagents cannot report on material they were never asked to ' +
             'find.' },
        { t: 'Running every query through the full pipeline',
          d: 'A simple factual lookup does not need document analysis and multi-source synthesis. Have ' +
             'the coordinator select subagents by query complexity.' },
        { t: 'Giving several subagents the same brief',
          d: 'Pays N times for one result set. Partition by subtopic, source type or time window so each ' +
             'brief is distinct.' },
        { t: 'Assuming subagents inherit the coordinator\'s context',
          d: 'They do not — this is <a href="#/unit/1.3">1.3</a> in detail. Every fact a subagent needs ' +
             'must be in the prompt you send it.' },
        { t: 'Accepting the first synthesis',
          d: 'Without an evaluate-and-re-delegate loop the coordinator has no mechanism for catching its ' +
             'own decomposition errors, which is exactly the failure mode above.' },
        { t: 'Writing procedural coordinator prompts',
          d: 'Step-by-step instructions make the coordinator brittle. Specify goals and quality criteria ' +
             '— what coverage means, what counts as sufficient evidence — and let it adapt.' }
      ],

      exam:
      '<p>Two very high-frequency shapes. <b>(a)</b> The coverage-gap diagnosis: you are shown subagents ' +
      'succeeding plus a narrow coordinator subtask list, and asked for the root cause. Answer: ' +
      'coordinator decomposition. Options blaming the synthesis, search or document agent are all there to ' +
      'catch people who did not read the trace. <b>(b)</b> A latency-reduction question where the tempting ' +
      'option is to let one subagent call another directly. The right answer keeps the coordinator in the ' +
      'loop for complex cases while giving the subagent a narrowly-scoped tool for the frequent simple ' +
      'case. Also expect one item on dynamic subagent selection versus a fixed pipeline.</p>',

      questions: [
        {
          id: 'q1.2.1', scn: 3, official: true,
          stem: '<p>After running the system on the topic "impact of AI on creative industries," you ' +
            'observe that each subagent completes successfully: the web search agent finds relevant ' +
            'articles, the document analysis agent summarises papers correctly, and the synthesis agent ' +
            'produces coherent output. However, the final reports cover only visual arts, completely ' +
            'missing music, writing, and film production. When you examine the coordinator\'s logs, you ' +
            'see it decomposed the topic into three subtasks: "AI in digital art creation," "AI in graphic ' +
            'design," and "AI in photography." What is the most likely root cause?</p>',
          opts: [
            'The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents.',
            'The coordinator agent\'s task decomposition is too narrow, resulting in subagent assignments that don\'t cover all relevant domains of the topic.',
            'The web search agent\'s queries are not comprehensive enough and need to be expanded to cover more creative industry sectors.',
            'The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria.'
          ],
          ans: [1],
          why: 'The coordinator\'s logs give the answer directly: it decomposed "creative industries" into ' +
            'three visual-arts subtasks — digital art, graphic design, photography — omitting music, ' +
            'writing and film entirely. The subagents executed their assigned tasks correctly. The problem ' +
            'is <em>what they were assigned</em>.',
          wrong: [
            'The synthesis agent can only work with the findings it receives. Asking it to detect gaps in ' +
            'material that was never gathered pushes the fix downstream of the actual fault — and it has ' +
            'no way of knowing what a complete picture of "creative industries" should contain.',
            '',
            'The search agent queried exactly what the coordinator asked for, and found relevant articles ' +
            'for each. Expanding its queries would mean overriding its brief, which is the coordinator\'s ' +
            'job to set correctly.',
            'Nothing in the trace suggests filtering. The document agent summarised the papers it was ' +
            'given, and those papers were about visual art because that is what the search subtasks ' +
            'requested.'
          ]
        },
        {
          id: 'q1.2.2', scn: 3, official: true,
          stem: '<p>During testing, you observe that the synthesis agent frequently needs to verify ' +
            'specific claims while combining findings. Currently, when verification is needed, the ' +
            'synthesis agent returns control to the coordinator, which invokes the web search agent, then ' +
            're-invokes synthesis with results. This adds 2–3 round trips per task and increases latency ' +
            'by 40%. Your evaluation shows that 85% of these verifications are simple fact-checks (dates, ' +
            'names, statistics) while 15% require deeper investigation. What\'s the most effective ' +
            'approach to reduce overhead while maintaining system reliability?</p>',
          opts: [
            'Give the synthesis agent a scoped <code>verify_fact</code> tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.',
            'Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once.',
            'Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator.',
            'Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify.'
          ],
          ans: [0],
          why: 'This applies least privilege precisely: the synthesis agent gets exactly what it needs for ' +
            'the 85% common case — a narrow fact-verification tool — while the 15% that genuinely needs ' +
            'investigation keeps the existing coordinator-mediated path. You remove most of the round ' +
            'trips without dissolving role separation.',
          wrong: [
            '',
            'Batching creates blocking dependencies: synthesis steps often depend on facts verified ' +
            'earlier, so deferring all verification to the end of the pass means the synthesis cannot ' +
            'proceed correctly in the meantime.',
            'Over-provisioning. Hand the synthesis agent the full search toolset and it will start doing ' +
            'open-ended research instead of synthesising — the exact cross-specialisation misuse that ' +
            '<a href="#/unit/2.3">task statement 2.3</a> warns about.',
            'Speculative caching cannot reliably predict which claims synthesis will want to check, so you ' +
            'pay to fetch and carry context that mostly goes unused while still missing the cases that ' +
            'matter.'
          ]
        },
        {
          id: 'q1.2.3', scn: 3,
          stem: '<p>Your coordinator currently routes every incoming request through the full pipeline: ' +
            'web search → document analysis → synthesis → report generation. Analysis of production ' +
            'traffic shows that roughly 30% of requests are single-fact lookups ("what version of the MCP ' +
            'spec is current?") that the web search agent alone could answer. What change best addresses ' +
            'this?</p>',
          opts: [
            'Have the coordinator assess the request\'s complexity and dynamically select only the subagents required, rather than always invoking the full pipeline.',
            'Add a keyword-based pre-classifier in front of the coordinator that routes short queries directly to the web search agent, bypassing the coordinator.',
            'Keep the pipeline intact but allow the document analysis and synthesis agents to return immediately when they receive fewer than three sources.',
            'Run the four pipeline stages in parallel rather than sequentially so that simple requests complete as fast as complex ones.'
          ],
          ans: [0],
          why: 'The guide asks explicitly for coordinators that analyse query requirements and dynamically ' +
            'select which subagents to invoke rather than always routing through the full pipeline. The ' +
            'coordinator already has the request and the judgment to make that call.',
          wrong: [
            '',
            'Bypassing the coordinator sacrifices the observability and consistent error handling that ' +
            'make hub-and-spoke worth having, and a keyword classifier is a crude proxy for complexity — ' +
            'short queries are not reliably simple.',
            'This wastes the invocation anyway: you still pay to spawn both agents and load their ' +
            'context, and "fewer than three sources" is a poor proxy for "this request did not need ' +
            'synthesis."',
            'The stages are genuinely dependent — synthesis needs analysis output, which needs search ' +
            'output. Running them in parallel is not merely inefficient, it is incorrect.'
          ]
        },
        {
          id: 'q1.2.4', scn: 3,
          stem: '<p>Your coordinator spawns three web search subagents for a broad research topic. Review ' +
            'of their outputs shows roughly 70% of the sources returned are duplicates across the three ' +
            'agents, and your search API costs are three times what you projected. Each agent received the ' +
            'prompt "research the topic thoroughly and return the most relevant sources." What is the ' +
            'appropriate fix?</p>',
          opts: [
            'Partition the research scope across the three subagents — by distinct subtopic, source type, or time window — so each has a non-overlapping brief.',
            'Reduce to a single web search subagent, since three agents given the same task cannot outperform one.',
            'Keep the three agents but add a deduplication step in the coordinator that discards repeated sources before analysis.',
            'Instruct each subagent to check what the other two have already found before issuing its own queries.'
          ],
          ans: [0],
          why: 'Identical briefs produce identical results — the duplication is designed in. Partitioning ' +
            'by subtopic, source type or time window gives each agent a distinct brief, which both ' +
            'eliminates the waste and broadens coverage, since three narrow searches reach further than ' +
            'three copies of one broad search.',
          wrong: [
            '',
            'Too far in the other direction. Parallel subagents are genuinely valuable for breadth and ' +
            'latency — the problem is that they were not given different work to do.',
            'This treats the symptom. You still pay for all three searches and get the coverage of one; ' +
            'deduplication after the fact recovers none of the wasted spend and none of the missing ' +
            'breadth.',
            'This requires direct subagent-to-subagent communication, which breaks hub-and-spoke, and it ' +
            'serialises work that was supposed to run in parallel.'
          ]
        },
        {
          id: 'q1.2.5', scn: 3,
          stem: '<p>Your coordinator accepts whatever the synthesis agent returns and renders it as the ' +
            'final report. Reviewers regularly find that reports address most of the question but leave ' +
            'one facet thin or unaddressed. Which coordinator-level change most directly addresses ' +
            'this?</p>',
          opts: [
            'Have the coordinator evaluate the synthesis output against the coverage requirements, re-delegate targeted queries to the search and analysis subagents for identified gaps, and re-invoke synthesis until coverage is sufficient.',
            'Have the coordinator run the entire pipeline three times and render the report that scores highest on a length-and-citation heuristic.',
            'Move gap detection into the synthesis agent, since it is the agent that assembles the final narrative and is best placed to notice what is missing.',
            'Increase the number of sources each search subagent must return, so that thin facets are less likely to occur in the first place.'
          ],
          ans: [0],
          why: 'This is the iterative refinement loop the guide describes: evaluate for gaps, re-delegate ' +
            'with <em>targeted</em> queries aimed at those gaps, re-invoke synthesis, and repeat until ' +
            'coverage is sufficient. Only the coordinator holds both the original requirements and the ' +
            'finished draft, so only it can perform that comparison.',
          wrong: [
            '',
            'Running the pipeline three times triples cost and, because each run starts from the same ' +
            'decomposition, is likely to reproduce the same gap three times. Length and citation count ' +
            'are not measures of coverage.',
            'The synthesis agent sees only the findings passed to it. It cannot detect the absence of ' +
            'material that was never gathered, and it does not hold the original coverage requirements.',
            'More sources per subtopic deepens the facets already being searched; it does nothing for a ' +
            'facet that no subtask covers. This is decomposition breadth, not source depth.'
          ]
        }
      ]
    },

    /* ================================================================== 1.3 */
    {
      id: '1.3',
      short: 'Subagent invocation & context passing',
      title: 'Configure subagent invocation, context passing, and spawning',
      scn: [3, 4],
      tldr: 'Subagents are spawned with the <b>Task</b> tool, which means <code>"Task"</code> must be in ' +
        'the coordinator\'s <code>allowedTools</code> or it physically cannot delegate. Subagents start ' +
        'with <b>no inherited context</b> — every finding they need goes in their prompt, in a structured ' +
        'form that keeps content separate from metadata. To run them in parallel, emit several Task calls ' +
        'in a <b>single</b> coordinator response.',

      concept:
      '<h3>The mechanism: the Task tool and <code>allowedTools</code></h3>' +
      '<p>Delegation is not a special capability a coordinator has by virtue of being called a ' +
      'coordinator. It is a tool call. The <b>Task</b> tool spawns a subagent, and like any other tool it ' +
      'must be granted. If <code>"Task"</code> is missing from the coordinator\'s ' +
      '<code>allowedTools</code>, the coordinator cannot delegate — and because models are ' +
      'accommodating, it will not fail loudly. It will quietly attempt the entire job itself, and you will ' +
      'be left wondering why the subagents never ran.</p>' +
      '<pre><code>coordinator = AgentDefinition(\n' +
      '    description   = "Research coordinator: decomposes topics, delegates, synthesises",\n' +
      '    system_prompt = COORDINATOR_PROMPT,\n' +
      '    allowedTools  = ["Task", "Read", "Write"],   # ← "Task" or no delegation\n' +
      ')\n' +
      '\n' +
      'web_search_agent = AgentDefinition(\n' +
      '    description   = "Finds and returns sources for one assigned subtopic",\n' +
      '    system_prompt = SEARCH_PROMPT,\n' +
      '    allowedTools  = ["web_search"],              # no Task: cannot re-delegate\n' +
      ')</code></pre>' +
      '<p>Note the second definition. The search agent has no <code>Task</code> tool, so it cannot spawn ' +
      'agents of its own. That is deliberate: it keeps the topology flat and the hub in control.</p>' +

      '<div class="callout trap"><span class="co-t">The item you will almost certainly see</span>' +
      '<p>"Your coordinator is not spawning subagents — it attempts everything itself. What is wrong?" The ' +
      'answer is <code>"Task"</code> missing from <code>allowedTools</code>. Not a weak prompt, not the ' +
      'wrong model, not a missing subagent definition. Options offering to strengthen the prompt ' +
      '("emphasise that it must delegate") are there because that is what people try first.</p></div>' +

      '<h3>Subagents inherit nothing</h3>' +
      '<p>This is the concept that generates the most bugs in real systems. A subagent is a fresh context. ' +
      'It does not see the coordinator\'s conversation, it does not see what a sibling subagent returned, ' +
      'and it does not remember its own previous invocation. Whatever it needs, you put in its prompt.</p>' +

      fig({
        vb: '0 0 700 260',
        caption: 'Context does not flow implicitly. The synthesis subagent knows only what the ' +
          'coordinator writes into its prompt.',
        body:
          '<rect x="30" y="20" width="180" height="66" rx="6" class="boxA"/>' +
          '<text x="120" y="42" text-anchor="middle" font-size="12" font-weight="600">Coordinator context</text>' +
          '<text x="120" y="59" text-anchor="middle" font-size="10" class="dim">original request, plan,</text>' +
          '<text x="120" y="73" text-anchor="middle" font-size="10" class="dim">search + analysis results</text>' +

          '<path class="arrow" d="M210 53 L300 53" marker-end="url(#ah)"/>' +
          '<text x="255" y="44" text-anchor="middle" font-size="10" class="dim">explicit</text>' +
          '<text x="255" y="70" text-anchor="middle" font-size="10" class="dim">prompt</text>' +

          '<rect x="300" y="20" width="180" height="66" rx="6" class="box"/>' +
          '<text x="390" y="42" text-anchor="middle" font-size="12" font-weight="600">Synthesis subagent</text>' +
          '<text x="390" y="59" text-anchor="middle" font-size="10" class="dim">sees ONLY what the</text>' +
          '<text x="390" y="73" text-anchor="middle" font-size="10" class="dim">prompt contains</text>' +

          '<path class="arrow dashed" style="stroke:var(--bad)" d="M480 100 L480 130"/>' +
          '<text x="560" y="118" font-size="10.5" style="fill:var(--bad)">✗ no implicit inheritance</text>' +

          '<rect x="30" y="130" width="450" height="34" rx="5" class="boxBad"/>' +
          '<text x="46" y="152" font-size="10.5">"summarise the findings" — which findings? the subagent has none</text>' +

          '<rect x="30" y="176" width="640" height="70" rx="6" class="boxOk"/>' +
          '<text x="46" y="196" font-size="11" font-weight="600">What a usable subagent prompt carries</text>' +
          '<text x="46" y="213" font-size="10.5">· the specific task, narrowly stated   · the upstream findings, in full</text>' +
          '<text x="46" y="229" font-size="10.5">· metadata kept separate from content: source URL, document name, page, date</text>' +
          '<text x="46" y="243" font-size="10.5">· the output contract: exactly what structure to return</text>'
      }) +

      '<h3>Structured context passing: keep metadata out of the prose</h3>' +
      '<p>How you pass findings determines whether attribution survives. Hand the synthesis agent a ' +
      'paragraph of narrative summary and the citations are already gone — there is nothing left to ' +
      'attach a source to. Hand it structured records and provenance survives all the way to the ' +
      'report.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Attribution already lost</span>' +
      '<pre><code>"Search found that adoption is\nrising sharply, with one study\nreporting 67% growth, though\nother sources are less bullish."</code></pre>' +
      '<p>Which study? Which sources? The synthesis agent cannot recover what the search agent dissolved.</p></div>' +
      '<div class="good"><span class="vs-h">Attribution preserved</span>' +
      '<pre><code>{ "claims": [{\n  "claim": "Adoption grew 67% YoY",\n  "source_name": "Okonkwo 2026",\n  "source_url": "https://…",\n  "evidence_excerpt": "…67% …",\n  "publication_date": "2026-03"\n}]}</code></pre>' +
      '<p>Content in one field, metadata in others. Synthesis can merge, compare and cite.</p></div></div>' +
      '<p>This is the same principle that <a href="#/unit/5.6">task statement 5.6</a> approaches from the ' +
      'provenance side. Structure your inter-agent payloads and both problems disappear at once.</p>' +

      '<h3>Parallel spawning: one response, several Task calls</h3>' +
      '<p>To run subagents concurrently, the coordinator emits <b>multiple Task tool calls in a single ' +
      'response</b>. The runtime executes them in parallel and returns all results together. Emitting one ' +
      'Task call per turn serialises the work: with four independent subagents you wait for the sum of ' +
      'their durations instead of the longest one.</p>' +
      '<p>The qualifier is <b>independence</b>. Parallelism is correct when subagents work on independent ' +
      'data. If the synthesis agent needs search output, it cannot run in the same batch as the search ' +
      'agent — that is a genuine dependency, and the barrier is real.</p>' +

      '<h3>Prompt the coordinator with goals, not procedures</h3>' +
      '<p>The guide asks for coordinator prompts that <b>specify research goals and quality criteria ' +
      'rather than step-by-step procedural instructions</b>. A procedural prompt ("first call search, then ' +
      'call analysis, then call synthesis") produces a coordinator that cannot adapt when a search returns ' +
      'nothing useful. A goal-oriented prompt ("cover every named sector; each claim needs an attributable ' +
      'source with a date; re-delegate until coverage is complete") produces one that can.</p>' +

      '<h3>Fork-based exploration from a shared baseline</h3>' +
      '<p>The guide lists fork-based session management here as well as in ' +
      '<a href="#/unit/1.7">1.7</a>: when you want to explore <b>divergent approaches from a shared ' +
      'analysis baseline</b> — compare two refactoring strategies against the same codebase ' +
      'understanding — you fork the session rather than starting two independent ones. Forking preserves ' +
      'the expensive shared prefix; two fresh sessions would pay for that analysis twice and might not ' +
      'even reach the same understanding, making the comparison unsound.</p>',

      example:
      '<h3>Scenario 3 — a coordinator turn that spawns two agents and then synthesises</h3>' +
      '<p>The coordinator has a plan and needs search and document analysis to run concurrently, then ' +
      'synthesis to run on both results. Here is the shape of the two turns.</p>' +
      '<pre><code>── coordinator response, turn 1 ──────────────────────────\n' +
      'ONE response containing TWO Task calls → they run in parallel\n' +
      '\n' +
      '  Task { subagent: "web_search",\n' +
      '         prompt: "Subtopic: AI in music production.\n' +
      '                  Return 8-12 sources. For each, output a record with\n' +
      '                  claim, source_name, source_url, evidence_excerpt,\n' +
      '                  publication_date. Do not summarise across sources." }\n' +
      '\n' +
      '  Task { subagent: "doc_analysis",\n' +
      '         prompt: "Analyse the 3 attached industry reports (names +\n' +
      '                  page refs below). Same record structure. Flag any\n' +
      '                  figure that conflicts with another report, with both\n' +
      '                  values and both dates." }\n' +
      '\n' +
      '── coordinator response, turn 2 ──────────────────────────\n' +
      'Now there IS a dependency, so synthesis runs alone.\n' +
      '\n' +
      '  Task { subagent: "synthesis",\n' +
      '         prompt: "Synthesise the findings below into a music section.\n' +
      '\n' +
      '                  FINDINGS FROM WEB SEARCH (14 records):\n' +
      '                  [ …the full structured records, verbatim… ]\n' +
      '\n' +
      '                  FINDINGS FROM DOCUMENT ANALYSIS (9 records):\n' +
      '                  [ …the full structured records, verbatim… ]\n' +
      '\n' +
      '                  Every claim in your output must carry its\n' +
      '                  source_name and publication_date. Where two records\n' +
      '                  conflict, present both and annotate the conflict.\n' +
      '                  Do not resolve conflicts yourself." }</code></pre>' +

      '<p>The synthesis prompt is long, and that is the point — it contains the actual findings, pasted ' +
      'in, because the synthesis agent has no other way to see them. A prompt saying "synthesise the ' +
      'search and document findings" would produce confident, sourceless invention.</p>' +

      '<div class="callout tip"><span class="co-t">Turn structure is the tell</span>' +
      '<p>If a question describes a coordinator that "invokes each subagent in sequence, one per turn" for ' +
      'work on <b>independent</b> data, the fix is to emit those Task calls in one response. If the data ' +
      'is <b>dependent</b>, sequential turns are correct and the question is testing whether you can tell ' +
      'the difference.</p></div>',

      mistakes: [
        { t: 'Omitting <code>"Task"</code> from the coordinator\'s <code>allowedTools</code>',
          d: 'The coordinator silently does everything itself. This is a configuration bug, not a ' +
             'prompting one — no amount of "you must delegate" in the system prompt grants a tool.' },
        { t: 'Assuming subagents inherit parent context',
          d: 'They begin with nothing. Prompts like "summarise the findings" reference data the subagent ' +
             'cannot see, and the model will fill the gap with plausible invention.' },
        { t: 'Passing upstream results as prose summaries',
          d: 'Destroys attribution before synthesis even begins. Pass structured records with content and ' +
             'metadata in separate fields.' },
        { t: 'Emitting one Task call per turn for independent work',
          d: 'Serialises what should be parallel. Put multiple Task calls in a single response.' },
        { t: 'Parallelising genuinely dependent stages',
          d: 'The mirror-image error. Synthesis cannot run concurrently with the search whose output it ' +
             'consumes.' },
        { t: 'Giving subagents the Task tool by default',
          d: 'Lets them re-delegate, producing uncontrolled depth and undermining hub-and-spoke. Grant ' +
             '<code>Task</code> only to agents that must orchestrate.' },
        { t: 'Writing procedural coordinator prompts',
          d: 'Specify goals and quality criteria instead, so the coordinator can adapt when a subagent ' +
             'comes back empty.' },
        { t: 'Starting two fresh sessions to compare approaches',
          d: 'Pays twice for the shared analysis and gives the two branches different baselines. Fork ' +
             'from one analysed session instead.' }
      ],

      exam:
      '<p>The <code>allowedTools</code> item is close to guaranteed — memorise that <code>"Task"</code> is ' +
      'the delegation mechanism and that its absence is a configuration fault. Expect a second item on ' +
      'context passing where the correct option includes the upstream findings <em>in the subagent ' +
      'prompt</em> and the distractors rely on implicit inheritance or a shared memory that does not ' +
      'exist. A third common shape asks how to parallelise: the answer is multiple Task calls in one ' +
      'response, and the trap is an option that parallelises a dependent stage.</p>',

      questions: [
        {
          id: 'q1.3.1', scn: 3,
          stem: '<p>You have defined a coordinator agent and four subagent types. In production, the ' +
            'coordinator never spawns any subagent — it attempts the entire research task itself, ' +
            'producing shallow results. Its system prompt states clearly: "Delegate research subtasks to ' +
            'your specialised subagents." Its configuration reads:</p>' +
            '<pre><code>AgentDefinition(\n' +
            '  description   = "Research coordinator",\n' +
            '  system_prompt = COORDINATOR_PROMPT,\n' +
            '  allowedTools  = ["Read", "Write", "web_search"],\n' +
            ')</code></pre><p>What is the fault?</p>',
          opts: [
            '<code>"Task"</code> is absent from <code>allowedTools</code>, so the coordinator has no mechanism for spawning subagents regardless of what its prompt instructs.',
            'The system prompt is not emphatic enough; delegation instructions need to be repeated and stated as a hard requirement.',
            'The four subagent definitions must be passed to the coordinator in a <code>subagents</code> parameter, which is missing.',
            'The coordinator has <code>web_search</code>, so it can satisfy research requests directly and never has reason to delegate.'
          ],
          ans: [0],
          why: 'Spawning a subagent is a tool call against the <b>Task</b> tool. If <code>"Task"</code> is ' +
            'not in <code>allowedTools</code>, the capability does not exist for that agent, and no ' +
            'instruction can conjure it. The agent does what it can with the tools it has.',
          wrong: [
            '',
            'A prompt cannot grant a tool. This is the distractor that catches people who reach for ' +
            'prompt engineering before checking configuration — and it maps onto the broader lesson that ' +
            'capability problems are not prompting problems.',
            'Subagent types are declared with their own <code>AgentDefinition</code> objects; the ' +
            'coordinator invokes them through <code>Task</code>. There is no such coupling parameter, and ' +
            'inventing one would not fix a missing tool.',
            'Tempting, and it does describe a real over-provisioning smell worth fixing separately — but ' +
            'it cannot explain the observed behaviour. Even a coordinator with every reason to delegate ' +
            'cannot do so without <code>Task</code>.'
          ]
        },
        {
          id: 'q1.3.2', scn: 3,
          stem: '<p>Your coordinator invokes the synthesis subagent with the prompt: "Synthesise the ' +
            'findings from the web search and document analysis agents into a coherent report section." ' +
            'The synthesis agent returns fluent, well-structured prose containing statistics and source ' +
            'names that appear nowhere in the actual search results. What is the root cause?</p>',
          opts: [
            'The subagent received no findings — subagents do not inherit the coordinator\'s context, so with nothing to synthesise the model generated plausible-looking content instead.',
            'The synthesis subagent\'s temperature is set too high, causing it to embellish the findings it received.',
            'The upstream agents returned their findings in a format the synthesis agent could not parse, so it fell back on its training data.',
            'The synthesis agent needs a <code>verify_fact</code> tool so it can check statistics before including them in the output.'
          ],
          ans: [0],
          why: 'A subagent starts with a clean context. "The findings from the web search and document ' +
            'analysis agents" is a reference to data the synthesis agent has never seen. Asked to ' +
            'synthesise nothing, a capable model produces something that looks exactly like a synthesis ' +
            '— which is why this bug reaches production. Findings must be pasted into the prompt.',
          wrong: [
            '',
            'Temperature affects variation in wording, not whether the agent has data. At any temperature ' +
            'an agent given no findings has nothing to embellish.',
            'This presumes findings were transmitted and merely mis-formatted. They were not transmitted ' +
            'at all — the prompt only <em>refers</em> to them. Formatting matters (see the structured ' +
            'record pattern) but it is not what happened here.',
            'A verification tool would let it check claims it invented, which does not address why it is ' +
            'inventing them. Fix the missing input before adding machinery to police the output.'
          ]
        },
        {
          id: 'q1.3.3', scn: 3,
          stem: '<p>Your coordinator needs to run a web search subagent and a document analysis subagent. ' +
            'They work on completely independent inputs. Currently the coordinator emits one Task call, ' +
            'waits for the result, then emits the second in the following turn — total latency is the sum ' +
            'of both. How do you make them run concurrently?</p>',
          opts: [
            'Emit both Task tool calls in a single coordinator response; the runtime executes them in parallel and returns both results together.',
            'Configure both subagent definitions with a <code>parallel: true</code> flag so the runtime knows they may overlap.',
            'Spawn the two subagents from two separate coordinator sessions and merge their outputs afterwards.',
            'Have the first subagent spawn the second as soon as it starts, so the two overlap without the coordinator waiting.'
          ],
          ans: [0],
          why: 'Parallelism is expressed in the shape of the response: several <code>Task</code> calls ' +
            'emitted together are dispatched together. Spreading them across turns is precisely what ' +
            'serialises them.',
          wrong: [
            '',
            'Concurrency is a property of how the calls are emitted, not a flag on the agent definition. ' +
            'Inventing configuration is a recurring distractor style on this exam.',
            'Two coordinator sessions means two separate orchestration contexts, with no shared plan and a ' +
            'manual merge — enormous complexity to achieve what one response already does.',
            'This requires the search subagent to hold the <code>Task</code> tool and to know about its ' +
            'sibling, breaking hub-and-spoke and putting orchestration logic in a worker.'
          ]
        },
        {
          id: 'q1.3.4', scn: 3,
          stem: '<p>You are designing how the document analysis subagent returns findings to the ' +
            'coordinator, which will later pass them to synthesis. Which output design best preserves ' +
            'attribution through to the final report?</p>',
          opts: [
            'Structured records that separate content from metadata — claim, evidence excerpt, source name, document location and publication date as distinct fields.',
            'A well-written narrative summary with source names woven into the prose, so the synthesis agent reads it the way a human analyst would.',
            'The full text of every analysed document, so the synthesis agent has complete information and can attribute claims itself.',
            'A ranked list of the most important conclusions, with the underlying sources recorded in a separate log the coordinator can consult if challenged.'
          ],
          ans: [0],
          why: 'Separating content from metadata means every claim arrives already bound to its source, ' +
            'excerpt and date. Downstream agents can merge, compare and cite without reconstructing ' +
            'anything, and provenance survives each hand-off — the exact requirement in ' +
            '<a href="#/unit/5.6">task statement 5.6</a>.',
          wrong: [
            '',
            'Prose merges claims and attribution into one undifferentiated string. The synthesis agent ' +
            'must then re-extract which source supports which claim, and any error there is invisible ' +
            'downstream. This is the standard mechanism by which citations get lost.',
            'Full text blows the synthesis agent\'s context budget and pushes the analysis work downstream ' +
            'to an agent specialised for something else. The point of a document analysis agent is to ' +
            'reduce documents to findings.',
            'A side log the report does not carry means the report itself has unattributable claims. When ' +
            'a reviewer asks which source supports a figure, "check the log" is a process, not ' +
            'provenance.'
          ]
        },
        {
          id: 'q1.3.5', scn: 2,
          stem: '<p>You have spent twenty minutes of agent time analysing a large codebase and now want to ' +
            'compare two refactoring strategies — extracting a service layer versus introducing a ' +
            'repository pattern — starting from that same understanding. Which approach is correct?</p>',
          opts: [
            'Fork the session twice from the completed analysis, so both branches start from an identical baseline and diverge only in the strategy explored.',
            'Start two fresh sessions, each instructed to analyse the codebase and then evaluate one strategy.',
            'Continue in the single existing session, evaluating the first strategy and then the second after it.',
            'Resume the analysis session twice by name, evaluating a different strategy on each resumption.'
          ],
          ans: [0],
          why: 'Forking creates independent branches from a shared baseline — exactly the stated use case ' +
            'for <code>fork_session</code>. Both branches inherit the same twenty minutes of analysis, so ' +
            'the comparison is controlled, and neither branch\'s exploration contaminates the other.',
          wrong: [
            '',
            'Pays for the expensive analysis twice and, worse, the two runs may reach subtly different ' +
            'understandings — so any difference in the recommendations could come from the baseline ' +
            'rather than the strategies. The comparison becomes unsound.',
            'Sequential evaluation in one context lets the first strategy\'s reasoning anchor the second. ' +
            'You want independent branches, not a conversation that has already argued itself into a ' +
            'position.',
            'Resuming the same named session twice continues one linear conversation rather than creating ' +
            'branches — the second resumption inherits everything the first one did. Resume is for ' +
            'continuing valid prior context; fork is for divergence.'
          ]
        }
      ]
    },

    /* ================================================================== 1.4 */
    {
      id: '1.4',
      short: 'Enforcement & handoff patterns',
      title: 'Implement multi-step workflows with enforcement and handoff patterns',
      scn: [1],
      tldr: 'The single most load-bearing idea in the domain: <b>prompt instructions have a non-zero ' +
        'failure rate</b>. When a workflow ordering requirement is genuinely mandatory — verify identity ' +
        'before moving money — you enforce it in code with a prerequisite gate, not in the system prompt. ' +
        'Also here: decomposing multi-concern requests using one shared identity lookup, and compiling ' +
        'structured handoff summaries when you escalate.',

      concept:
      '<h3>Probabilistic instruction versus deterministic enforcement</h3>' +
      '<p>You can tell a model to always do something. It will comply the overwhelming majority of the ' +
      'time. It will not comply every time. That is not a defect to be prompted away — it is the nature of ' +
      'the mechanism. The architect\'s job is to notice when "almost always" is not good enough and reach ' +
      'for a different tool.</p>' +

      fig({
        vb: '0 0 700 250',
        caption: 'Two enforcement mechanisms. The prompt path advises; the gate path decides. Match the ' +
          'mechanism to the consequence of failure.',
        body:
          '<text x="30" y="20" font-size="11" font-weight="600">Probabilistic — the model decides</text>' +
          '<rect x="30" y="30" width="150" height="40" rx="6" class="box"/>' +
          '<text x="105" y="47" text-anchor="middle" font-size="10.5">system prompt:</text>' +
          '<text x="105" y="61" text-anchor="middle" font-size="10" class="mono">"always verify first"</text>' +
          '<path class="arrow" d="M180 50 L245 50" marker-end="url(#ah)"/>' +
          '<rect x="245" y="30" width="130" height="40" rx="6" class="box"/>' +
          '<text x="310" y="55" text-anchor="middle" font-size="11">model complies</text>' +
          '<path class="arrow" d="M375 50 L440 50" marker-end="url(#ah)"/>' +
          '<rect x="440" y="30" width="110" height="40" rx="6" class="boxOk"/>' +
          '<text x="495" y="55" text-anchor="middle" font-size="11">88% of the time</text>' +
          '<rect x="565" y="30" width="110" height="40" rx="6" class="boxBad"/>' +
          '<text x="620" y="49" text-anchor="middle" font-size="11">12%: wrong</text>' +
          '<text x="620" y="63" text-anchor="middle" font-size="11">customer refunded</text>' +

          '<line x1="30" y1="98" x2="670" y2="98" class="stroke dashed"/>' +

          '<text x="30" y="124" font-size="11" font-weight="600">Deterministic — your code decides</text>' +
          '<rect x="30" y="134" width="150" height="46" rx="6" class="box"/>' +
          '<text x="105" y="152" text-anchor="middle" font-size="10.5">model requests</text>' +
          '<text x="105" y="167" text-anchor="middle" font-size="10" class="mono">process_refund</text>' +

          '<path class="arrow" d="M180 157 L235 157" marker-end="url(#ah)"/>' +

          '<polygon points="320,128 400,157 320,186 240,157" class="boxA"/>' +
          '<text x="320" y="153" text-anchor="middle" font-size="10">verified id</text>' +
          '<text x="320" y="166" text-anchor="middle" font-size="10">this session?</text>' +

          '<path class="arrow" d="M400 145 L470 133" marker-end="url(#ah)"/>' +
          '<text x="432" y="128" font-size="9.5" class="dim">yes</text>' +
          '<rect x="470" y="114" width="200" height="34" rx="6" class="boxOk"/>' +
          '<text x="570" y="136" text-anchor="middle" font-size="11">tool executes — 100% of the time</text>' +

          '<path class="arrow" d="M400 170 L470 184" marker-end="url(#ah)"/>' +
          '<text x="432" y="192" font-size="9.5" class="dim">no</text>' +
          '<rect x="470" y="166" width="200" height="34" rx="6" class="boxBad"/>' +
          '<text x="570" y="188" text-anchor="middle" font-size="11">blocked — 100% of the time</text>' +

          '<rect x="30" y="212" width="640" height="30" rx="5" class="boxA"/>' +
          '<text x="350" y="232" text-anchor="middle" font-size="11" font-weight="600">Trigger words that mean "use a gate": guaranteed · must never · compliance · financial · irreversible</text>'
      }) +

      '<h3>Where the line falls</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Requirement</th><th>Mechanism</th><th>Why</th></tr></thead><tbody>' +
      '<tr><td>The agent should be warm and concise</td><td>System prompt</td><td>A miss is a slightly ' +
      'off-tone reply. Probabilistic is fine.</td></tr>' +
      '<tr><td>Prefer <code>lookup_order</code> for order questions</td><td>Tool descriptions</td>' +
      '<td>Selection quality, not a hard constraint. A miss is a wasted call.</td></tr>' +
      '<tr><td>Verify identity before any order operation</td><td><b>Prerequisite gate</b></td>' +
      '<td>A miss refunds the wrong person\'s money. Irreversible and financial.</td></tr>' +
      '<tr><td>Never refund more than $500 without a human</td><td><b>Tool-call interception hook</b></td>' +
      '<td>A policy ceiling. "Usually respected" is not a ceiling.</td></tr>' +
      '<tr><td>Never push directly to <code>main</code></td><td><b>PreToolUse hook</b></td>' +
      '<td>Compliance requirement with an audit trail.</td></tr>' +
      '</tbody></table></div>' +

      '<h3>What a prerequisite gate actually is</h3>' +
      '<p>Not a prompt, not a tool description, not a few-shot example. It is code in your orchestration ' +
      'layer that inspects session state before a tool executes, and refuses if a precondition is unmet. ' +
      'It lives outside the model, so the model\'s compliance rate is irrelevant.</p>' +
      '<pre><code>VERIFIED = {}          # session_id -> customer_id\nGATED   = {"lookup_order", "process_refund", "update_address"}\n\n' +
      'def before_tool(session_id, tool_name, tool_input):\n' +
      '    """Runs before every tool call. Returns None to allow, or a\n' +
      '    tool_result to return to the model instead of executing."""\n' +
      '\n' +
      '    if tool_name == "get_customer":\n' +
      '        return None                                  # always allowed\n' +
      '\n' +
      '    if tool_name in GATED and session_id not in VERIFIED:\n' +
      '        return blocked(\n' +
      '            "Identity not yet verified in this session. Call "\n' +
      '            "get_customer and obtain a verified customer_id before "\n' +
      '            "any order or payment operation."\n' +
      '        )\n' +
      '\n' +
      '    if tool_name == "process_refund" and tool_input["amount"] > 500:\n' +
      '        return blocked(\n' +
      '            "Refunds above $500 require manager approval. Route to "\n' +
      '            "escalate_to_human with a structured handoff summary.",\n' +
      '            redirect="escalate_to_human",\n' +
      '        )\n' +
      '\n' +
      '    return None</code></pre>' +
      '<p>Two design details worth copying. First, the block <b>explains itself to the model</b> — a bare ' +
      'refusal leaves the agent guessing and often retrying; a reason lets it do the right thing next. ' +
      'Second, the $500 block <b>redirects</b> rather than merely denying: it names the alternative ' +
      'workflow, which is what turns a wall into a path.</p>' +

      '<div class="callout rule"><span class="co-t">How to spot these items instantly</span>' +
      '<p>Scan the question stem for <b>guaranteed</b>, <b>must never</b>, <b>100%</b>, ' +
      '<b>compliance</b>, <b>regulatory</b>, <b>financial</b>, <b>irreversible</b> — or a stated failure ' +
      'rate ("in 12% of cases…"). Any of those, and the answer is a gate, a hook, or a programmatic ' +
      'check. Options that begin "add to the system prompt that it must always…" are wrong <em>because ' +
      'of the requirement</em>, not because prompts are bad.</p>' +
      '<p><b>The counter-case, which the exam also tests:</b> when the problem is a <em>judgment</em> ' +
      'boundary rather than a hard rule — an agent escalating the wrong <em>kinds</em> of case — the ' +
      'proportionate fix really is explicit criteria plus few-shot examples. See ' +
      '<a href="#/unit/5.2">5.2</a>. Gates enforce rules; they cannot teach judgment.</p></div>' +

      '<h3>Multi-concern requests: decompose, share context, synthesise</h3>' +
      '<p>Real customers do not send one problem at a time. "My order 4471 arrived broken and I also need ' +
      'to change the card on file before my subscription renews" is two concerns in one message. The ' +
      'guide\'s pattern is explicit: <b>decompose into distinct items, investigate each in parallel using ' +
      'shared context, then synthesise a unified resolution</b>.</p>' +
      '<p>"Shared context" is the operative phrase. You verify identity <b>once</b> and reuse that ' +
      'verified customer id for both concerns. Calling <code>get_customer</code> twice with the same input ' +
      'wastes a round trip and fills context with a duplicate 40-field payload.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Wrong responses</span><p>Answer only the first concern and ' +
      'hope they re-ask. Tell the customer to submit separate tickets. Escalate because the message is ' +
      '"complex" — two ordinary concerns are not a policy gap. Handle them in isolation, verifying ' +
      'identity twice.</p></div>' +
      '<div class="good"><span class="vs-h">Right response</span><p>Verify once. Look up order 4471 and ' +
      'the subscription in parallel. Resolve the refund and the card update. Reply once, addressing both, ' +
      'so the customer does not have to check whether you forgot half their message.</p></div></div>' +

      '<h3>Structured handoff when you escalate</h3>' +
      '<p>Escalation is a hand-off to a human who <b>cannot see the conversation transcript</b>. Dumping ' +
      'the raw thread on them, or handing over a one-line "customer wants refund," both waste the ' +
      'expensive resource you just escalated to. Compile a summary:</p>' +
      '<pre><code>{\n' +
      '  "customer_id":        "C-88213",\n' +
      '  "verified":           true,\n' +
      '  "order_id":           "4471",\n' +
      '  "root_cause":         "Item delivered damaged; carrier photo evidence on file",\n' +
      '  "requested_action":   "Full refund, $812.40",\n' +
      '  "why_escalated":      "Amount exceeds $500 autonomous limit",\n' +
      '  "recommended_action": "Approve full refund; damage documented, first claim on account",\n' +
      '  "customer_sentiment": "Frustrated but cooperative; two prior contacts today",\n' +
      '  "already_told_customer": "That a manager will review within one business day"\n' +
      '}</code></pre>' +
      '<p>The last field matters more than it looks: a human who repeats a promise the agent already made, ' +
      'or contradicts it, undoes the hand-off.</p>',

      example:
      '<h3>Scenario 1 — the 12% problem</h3>' +
      '<p>Production telemetry shows that in <b>12% of cases</b> the agent skips ' +
      '<code>get_customer</code> and calls <code>lookup_order</code> using only the name the customer ' +
      'typed. Occasionally it lands on the wrong account and refunds the wrong person. The system prompt ' +
      'already says, in bold, that verification is mandatory.</p>' +
      '<p>Walk the candidate fixes:</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Fix</th><th>Effect on the 12%</th></tr></thead><tbody>' +
      '<tr><td>Strengthen the prompt: "You MUST ALWAYS call <code>get_customer</code> first"</td>' +
      '<td>Might move 12% to 4%. Never to 0%. The failure mode — refunding a stranger — is unchanged in ' +
      'kind.</td></tr>' +
      '<tr><td>Add few-shot examples of verifying first</td><td>Same category of improvement. Still ' +
      'probabilistic, and now costing tokens on every request.</td></tr>' +
      '<tr><td>Add a routing classifier that enables tool subsets per request type</td><td>Addresses which ' +
      'tools are <em>available</em>, not the <em>order</em> they are called in. Wrong axis entirely.</td></tr>' +
      '<tr><td><b>Prerequisite gate blocking <code>lookup_order</code> and <code>process_refund</code> ' +
      'until <code>get_customer</code> has returned a verified id</b></td><td><b>12% → 0%.</b> The unsafe ' +
      'call cannot execute, whatever the model attempts.</td></tr>' +
      '</tbody></table></div>' +
      '<p>The gate does not make the model better. It makes the model\'s mistake harmless — and that is ' +
      'the architectural move the exam is testing. Notice also that the gate <em>improves</em> the model\'s ' +
      'behaviour indirectly: when the block returns "call <code>get_customer</code> first," the agent ' +
      'reads that and does so, so the customer sees a verification question rather than a failure.</p>' +

      '<div class="callout note"><span class="co-t">Where to put the gate</span>' +
      '<p>Two places are correct and the exam accepts either framing: a <b>PreToolUse hook</b> in the ' +
      'Agent SDK (see <a href="#/unit/1.5">1.5</a>), or a <b>prerequisite check in your orchestration ' +
      'layer</b> before dispatching the tool. Both are code outside the model. What is <em>not</em> ' +
      'correct is putting it inside the tool implementation only — that works for one tool, but the rule ' +
      'spans several, and a per-tool check duplicates the policy in every backend.</p></div>',

      mistakes: [
        { t: 'Answering a guarantee requirement with a prompt instruction',
          d: 'The defining error of this task statement. If the stem says "guaranteed," "must never," or ' +
             'quotes a failure percentage, no prompt-level option can be right.' },
        { t: 'Assuming a gate is always the answer',
          d: 'The mirror-image error, and the exam punishes it too. Official sample question 3 is an ' +
             'escalation-calibration problem whose correct answer is explicit criteria plus few-shot ' +
             'examples. Gates enforce hard rules; they cannot teach a judgment boundary.' },
        { t: 'Blocking without explaining',
          d: 'A bare denial leaves the agent guessing and often retrying the same call. Return a reason ' +
             'and, where one exists, name the alternative workflow.' },
        { t: 'Splitting a blocked action to get under a limit',
          d: 'Two $400 refunds to dodge a $500 ceiling is control circumvention. The gate should be ' +
             'cumulative per session and the correct response to a business limit is escalation.' },
        { t: 'Verifying identity twice for a two-concern message',
          d: 'Call <code>get_customer</code> once, store the verified id, and reuse it for both concerns.' },
        { t: 'Escalating because a request is multi-concern',
          d: 'Two ordinary concerns are not a policy gap. Decompose and handle them; escalate on policy ' +
             'gaps, explicit human requests, or genuine inability to progress.' },
        { t: 'Handing over a raw transcript on escalation',
          d: 'The human cannot see the conversation and should not have to reconstruct it. Compile ' +
             'customer id, root cause, amount, why you escalated, your recommendation, and anything you ' +
             'already promised the customer.' },
        { t: 'Putting the ordering rule inside each tool',
          d: 'Duplicates policy across backends and misses tools added later. Enforce once, in the ' +
             'orchestration layer or a hook.' }
      ],

      exam:
      '<p>Expect at least two items from this task statement, and expect one of them to quote a failure ' +
      'rate. Official sample question 1 is the canonical form: 12% of cases skip verification, four ' +
      'options, and only the programmatic prerequisite is deterministic. The distractors are deliberately ' +
      'reasonable — a stronger prompt, few-shot examples, a routing classifier — which is why the ' +
      'trigger-word habit is worth building. A second item usually covers multi-concern decomposition ' +
      '(answer: decompose, parallel, shared context, unified reply) or structured handoff content.</p>',

      questions: [
        {
          id: 'q1.4.1', scn: 1, official: true,
          stem: '<p>Production data shows that in 12% of cases, your agent skips <code>get_customer</code> ' +
            'entirely and calls <code>lookup_order</code> using only the customer\'s stated name, ' +
            'occasionally leading to misidentified accounts and incorrect refunds. What change would most ' +
            'effectively address this reliability issue?</p>',
          opts: [
            'Add a programmatic prerequisite that blocks <code>lookup_order</code> and <code>process_refund</code> calls until <code>get_customer</code> has returned a verified customer ID.',
            'Enhance the system prompt to state that customer verification via <code>get_customer</code> is mandatory before any order operations.',
            'Add few-shot examples showing the agent always calling <code>get_customer</code> first, even when customers volunteer order details.',
            'Implement a routing classifier that analyses each request and enables only the subset of tools appropriate for that request type.'
          ],
          ans: [0],
          why: 'When a specific tool sequence is required for critical business logic — verifying identity ' +
            'before processing refunds — programmatic enforcement provides a deterministic guarantee that ' +
            'prompt-based approaches cannot. The gate is code outside the model, so the model\'s ' +
            'compliance rate stops mattering.',
          wrong: [
            '',
            'Relies on probabilistic LLM compliance. It will reduce the 12% and will not eliminate it, ' +
            'and the residual failures still refund the wrong person\'s money — insufficient when errors ' +
            'have financial consequences.',
            'Also probabilistic, with the same ceiling, and it adds token overhead to every single ' +
            'request. Few-shot examples are the right tool for teaching a judgment boundary, not for ' +
            'enforcing a mandatory sequence.',
            'Addresses tool <em>availability</em> rather than tool <em>ordering</em>, which is the actual ' +
            'problem. Even with a perfectly scoped tool subset, nothing forces <code>get_customer</code> ' +
            'to be called before <code>lookup_order</code>.'
          ]
        },
        {
          id: 'q1.4.2', scn: 1,
          stem: '<p>Company policy: refunds above $500 require manager approval and must never be issued ' +
            'autonomously. Which implementations satisfy this requirement deterministically?</p>' +
            '',
          opts: [
            'A tool-call interception hook that inspects <code>process_refund</code> arguments before execution and blocks any amount above $500, redirecting to the escalation workflow.',
            'A prerequisite check in the orchestration layer that refuses to dispatch <code>process_refund</code> when the cumulative session refund total would exceed $500.',
            'A system prompt rule stating that refunds above $500 must always be escalated to a human, reinforced with three few-shot examples of correct escalation.',
            'A <code>process_refund</code> tool description that documents the $500 ceiling and instructs the model to call <code>escalate_to_human</code> instead when the amount is higher.'
          ],
          ans: [0, 1],
          why: 'Both correct options are code executing outside the model, so neither depends on the ' +
            'model choosing to comply. The hook intercepts the outgoing call; the orchestration-layer ' +
            'check refuses to dispatch it. Option B additionally closes the split-refund loophole by ' +
            'tracking a cumulative session total — two $400 refunds cannot slip past a per-call check.',
          wrong: [
            '', '',
            'A prompt rule with examples is probabilistic. "Must never" is a guarantee requirement, and no ' +
            'quantity of instruction or examples converts a strong tendency into a guarantee.',
            'A tool description influences how the model selects and uses a tool. It is documentation the ' +
            'model reads, not a control that stops execution — the model can still emit the call with a ' +
            '$900 amount, and nothing prevents it running.'
          ]
        },
        {
          id: 'q1.4.3', scn: 1,
          stem: '<p>A customer writes: "Order 4471 turned up with a cracked screen so I want a refund, and ' +
            'separately please change the card on my account before the subscription renews on Friday." ' +
            'What is the correct handling pattern?</p>',
          opts: [
            'Decompose into two concerns, verify identity once, investigate both in parallel using that shared verified context, then reply once with a unified resolution covering both.',
            'Handle the refund first since it was mentioned first, then ask the customer to confirm they still want the card change before proceeding to it.',
            'Escalate to a human, because a message containing two unrelated concerns exceeds the reliable scope of autonomous handling.',
            'Handle each concern as an independent workflow, calling <code>get_customer</code> at the start of each so both are correctly verified.'
          ],
          ans: [0],
          why: 'The guide\'s pattern is decomposition into distinct items, parallel investigation using ' +
            '<em>shared</em> context, then a synthesised unified resolution. One identity verification ' +
            'serves both concerns, and the customer gets one reply that addresses everything they ' +
            'raised.',
          wrong: [
            '',
            'Making the customer re-confirm something they already asked for adds a round trip and reads ' +
            'as though you were not listening. Their request was unambiguous.',
            'Multi-concern is not a reason to escalate. Escalation triggers are explicit requests for a ' +
            'human, policy gaps, and inability to make progress — none of which apply to two ordinary ' +
            'requests.',
            'Correct on verification but wasteful in execution: it calls <code>get_customer</code> twice ' +
            'with identical input, burning a round trip and duplicating a large payload in context. ' +
            'Verify once and share the result.'
          ]
        },
        {
          id: 'q1.4.4', scn: 1,
          stem: '<p>Your gate blocks a $812 refund because it exceeds the $500 autonomous limit, and the ' +
            'agent must escalate. The human agent who picks up the case has no access to the conversation ' +
            'transcript. Which handoff payload is most appropriate?</p>',
          opts: [
            'A structured summary: verified customer ID, order ID, root cause, requested amount, why it was escalated, a recommended action, and what the agent has already told the customer.',
            'The complete conversation transcript, so the human has the full context and can form their own judgment without the agent\'s interpretation biasing them.',
            'A short ticket titled "Refund request over limit" with the customer\'s email address, so the human can look the account up themselves.',
            'The structured summary plus a confidence score from the agent indicating how strongly it believes the refund should be approved.'
          ],
          ans: [0],
          why: 'The guide asks for compiled handoff summaries containing customer ID, root cause, amount ' +
            'and recommended action, precisely because the receiving human lacks the transcript. Including ' +
            'what the agent already promised the customer prevents the human from contradicting it — the ' +
            'detail that most often breaks a hand-off in practice.',
          wrong: [
            '',
            'A raw transcript makes the human do the summarising work, which defeats the point of ' +
            'escalating to a scarce resource. A recommendation is not bias; it is the agent reporting its ' +
            'analysis, which the human is free to override.',
            'This hands over almost nothing. The human must re-verify the customer, re-diagnose the ' +
            'problem and re-derive the amount — repeating everything the agent already did.',
            'The summary part is right, but a self-reported confidence score is not a reliable signal ' +
            '(see <a href="#/unit/5.5">5.5</a>). Attaching an uncalibrated number to a financial approval ' +
            'invites the human to lean on it as though it meant something.'
          ]
        },
        {
          id: 'q1.4.5', scn: 1,
          stem: '<p>Your agent achieves 55% first-contact resolution against an 80% target. Logs show it ' +
            'escalates straightforward cases — standard damage replacements with photo evidence — while ' +
            'attempting to handle complex situations requiring policy exceptions autonomously. A colleague ' +
            'proposes adding a programmatic gate that blocks <code>escalate_to_human</code> unless the ' +
            'case matches a whitelist of escalation-eligible conditions. Evaluate this proposal.</p>',
          opts: [
            'Reject it: the problem is a miscalibrated judgment boundary, which explicit escalation criteria with few-shot examples address directly, whereas a gate would block legitimate escalations it failed to anticipate.',
            'Accept it: a programmatic gate is the only deterministic way to control escalation behaviour, and determinism is always preferable for a metric tied to a business target.',
            'Accept it, but only after adding a sentiment classifier so that genuinely distressed customers can bypass the whitelist.',
            'Reject it, and instead have the agent self-report a confidence score before each response, routing to a human whenever confidence falls below a calibrated threshold.'
          ],
          ans: [0],
          why: 'This is the counter-case to the enforcement heuristic, and the exam tests it deliberately. ' +
            'Nothing here is a hard rule being violated — the agent is drawing the escalate/resolve line ' +
            'in the wrong place. That is a judgment problem, and the proportionate fix is explicit ' +
            'criteria plus few-shot examples showing why one action was chosen over the plausible ' +
            'alternative. A whitelist gate would hard-block escalations for cases nobody thought of, ' +
            'turning a calibration problem into a coverage problem.',
          wrong: [
            '',
            'Determinism is not universally preferable — it is preferable where a hard rule exists. Here ' +
            'there is no rule to enforce, so a gate can only encode today\'s guesses about which cases ' +
            'deserve a human and refuse everything else.',
            'Sentiment does not correlate with case complexity: a calm customer with a policy gap needs a ' +
            'human, a frustrated one with a simple shipping delay does not. The guide names sentiment-based ' +
            'escalation as an anti-pattern outright.',
            'Correct to reject the gate, wrong on the remedy. Self-reported confidence is poorly ' +
            'calibrated precisely where it matters — the agent is already confidently wrong on the hard ' +
            'cases, which is the behaviour being diagnosed.'
          ]
        }
      ]
    },

    /* ================================================================== 1.5 */
    {
      id: '1.5',
      short: 'Hooks: interception & normalisation',
      title: 'Apply Agent SDK hooks for tool call interception and data normalisation',
      scn: [1, 3],
      tldr: 'Hooks are your code running at fixed points in the agent lifecycle. Two matter for this exam: ' +
        '<b>PreToolUse</b> fires before a tool runs and <b>can block it</b> — the deterministic ' +
        'enforcement mechanism. <b>PostToolUse</b> fires after a tool has run and cannot block, but can ' +
        'transform the result before the model sees it — the right place to normalise heterogeneous data ' +
        'formats from different MCP servers.',

      concept:
      '<h3>The two hooks the exam cares about</h3>' +
      '<p>The Agent SDK exposes a long list of lifecycle hooks. Two of them carry essentially all the exam ' +
      'weight, and the distinction between them is the whole point: <b>one runs before the tool and can ' +
      'stop it; the other runs after and cannot</b>.</p>' +

      fig({
        vb: '0 0 700 230',
        caption: 'PreToolUse is preventive — it can deny. PostToolUse is reactive — the tool has already ' +
          'run, but the result can be reshaped before it reaches the model.',
        body:
          '<rect x="24" y="60" width="112" height="46" rx="6" class="box"/>' +
          '<text x="80" y="80" text-anchor="middle" font-size="11" font-weight="600">Model emits</text>' +
          '<text x="80" y="95" text-anchor="middle" font-size="10" class="mono dim">tool_use</text>' +

          '<path class="arrow" d="M136 83 L182 83" marker-end="url(#ah)"/>' +

          '<rect x="182" y="52" width="118" height="62" rx="6" class="boxA"/>' +
          '<text x="241" y="72" text-anchor="middle" font-size="11" font-weight="600">PreToolUse</text>' +
          '<text x="241" y="88" text-anchor="middle" font-size="9.5" class="dim">can DENY</text>' +
          '<text x="241" y="102" text-anchor="middle" font-size="9.5" class="dim">exit 2 / "deny"</text>' +

          '<path class="arrow" d="M241 114 L241 156" marker-end="url(#ah)"/>' +
          '<rect x="164" y="156" width="154" height="40" rx="6" class="boxBad"/>' +
          '<text x="241" y="172" text-anchor="middle" font-size="10.5">blocked — never runs</text>' +
          '<text x="241" y="187" text-anchor="middle" font-size="9.5" class="dim">reason returned to model</text>' +

          '<path class="arrow" d="M300 83 L346 83" marker-end="url(#ah)"/>' +
          '<text x="323" y="74" text-anchor="middle" font-size="9" class="dim">allow</text>' +

          '<rect x="346" y="60" width="104" height="46" rx="6" class="box"/>' +
          '<text x="398" y="80" text-anchor="middle" font-size="11" font-weight="600">Tool runs</text>' +
          '<text x="398" y="95" text-anchor="middle" font-size="9.5" class="dim">MCP server</text>' +

          '<path class="arrow" d="M450 83 L496 83" marker-end="url(#ah)"/>' +

          '<rect x="496" y="52" width="118" height="62" rx="6" class="boxA"/>' +
          '<text x="555" y="72" text-anchor="middle" font-size="11" font-weight="600">PostToolUse</text>' +
          '<text x="555" y="88" text-anchor="middle" font-size="9.5" class="dim">cannot block</text>' +
          '<text x="555" y="102" text-anchor="middle" font-size="9.5" class="dim">transforms result</text>' +

          '<path class="arrow" d="M614 83 L660 83" marker-end="url(#ah)"/>' +
          '<text x="640" y="104" font-size="9.5" class="dim">to model</text>' +

          '<rect x="24" y="16" width="590" height="26" rx="5" class="box"/>' +
          '<text x="34" y="34" font-size="10.5">Normalise here, and the model never sees a Unix timestamp or a numeric status code.</text>'
      }) +

      '<h3>PreToolUse — the enforcement hook</h3>' +
      '<p>Fires after the model has decided to call a tool and before the call executes. It sees the tool ' +
      'name and arguments, and it can allow or deny. Denial is expressed either by exiting with status ' +
      '<b>2</b> (stderr becomes the reason) or by returning JSON with ' +
      '<code>permissionDecision: "deny"</code> and a <code>permissionDecisionReason</code>.</p>' +
      '<p>This is the mechanism behind every "must never" requirement: block refunds above a threshold, ' +
      'block <code>git push</code> to <code>main</code>, block deletion of production resources. Because ' +
      'it runs in your process and returns a verdict, its guarantee does not depend on the model.</p>' +
      '<pre><code># PreToolUse — enforce the refund ceiling\ndef pre_tool_use(event):\n' +
      '    if event["tool_name"] != "process_refund":\n' +
      '        return {}                              # allow, silently\n' +
      '\n' +
      '    if event["tool_input"]["amount"] > 500:\n' +
      '        return {"hookSpecificOutput": {\n' +
      '            "hookEventName": "PreToolUse",\n' +
      '            "permissionDecision": "deny",\n' +
      '            "permissionDecisionReason":\n' +
      '                "Refunds above $500 require manager approval. "\n' +
      '                "Call escalate_to_human with a handoff summary.",\n' +
      '        }}\n' +
      '    return {}</code></pre>' +
      '<p>Note again that the denial <b>names the alternative</b>. A hook that only says "no" produces an ' +
      'agent that retries or apologises; a hook that says "no, do this instead" produces an agent that ' +
      'escalates correctly.</p>' +

      '<h3>PostToolUse — the normalisation hook</h3>' +
      '<p>Fires after a tool has returned. It cannot un-run the tool, but it can rewrite what the model ' +
      'sees. That makes it the correct place to solve a very common integration problem: <b>several MCP ' +
      'servers, each with its own conventions</b>.</p>' +
      '<p>Your order service returns <code>created: 1771459200</code>. Your billing service returns ' +
      '<code>created_at: "2026-02-19T00:00:00Z"</code>. Your legacy CRM returns ' +
      '<code>status: 3</code> where 3 means "shipped". Hand all three to the model raw and you are asking ' +
      'it to do format archaeology on every turn — it will mostly get it right, and "mostly" on a date ' +
      'comparison means occasionally telling a customer their order shipped next month.</p>' +
      '<pre><code># PostToolUse — one normalisation policy for every tool result\nSTATUS = {0: "pending", 1: "paid", 2: "packed", 3: "shipped", 4: "delivered"}\n\n' +
      'def post_tool_use(event):\n' +
      '    r = event["tool_response"]\n' +
      '\n' +
      '    for key in ("created", "created_at", "ts", "order_date"):\n' +
      '        if key in r:\n' +
      '            r["created_at"] = to_iso8601(r.pop(key))     # one date format\n' +
      '\n' +
      '    if isinstance(r.get("status"), int):\n' +
      '        r["status"] = STATUS.get(r["status"], "unknown") # one status vocabulary\n' +
      '\n' +
      '    if event["tool_name"] == "lookup_order":\n' +
      '        r = {k: r[k] for k in RETURN_RELEVANT_FIELDS if k in r}  # 40 fields -> 6\n' +
      '\n' +
      '    return {"tool_response": r}</code></pre>' +
      '<p>That last line is doing double duty. Trimming a 40-field payload to the six fields a return ' +
      'workflow needs is also the context-budget technique from ' +
      '<a href="#/unit/5.1">task statement 5.1</a> — verbose tool output accumulates in the conversation ' +
      'and consumes tokens out of all proportion to its relevance.</p>' +

      '<h3>Why not fix it somewhere else?</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Alternative</th><th>Why it is the wrong place</th></tr></thead><tbody>' +
      '<tr><td>Inside the tool implementation</td><td>Fine when you own the tool. You frequently do not — ' +
      'third-party MCP servers are outside your control, and you would need the same conversion in every ' +
      'server you integrate.</td></tr>' +
      '<tr><td>In the system prompt ("timestamps may be Unix or ISO; convert them")</td><td>Probabilistic, ' +
      'and it spends model attention on clerical work every single turn. The model may forget; it will ' +
      'certainly cost you tokens.</td></tr>' +
      '<tr><td>After the agentic loop finishes</td><td>Far too late. The model already reasoned over the ' +
      'raw values and may have already acted on a misread date.</td></tr>' +
      '<tr><td>A wrapper MCP server that proxies and normalises</td><td>Legitimate architecture, but ' +
      'heavier: new service, new deployment, new failure mode. A hook achieves it in-process.</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout rule"><span class="co-t">The one-line discriminator</span>' +
      '<p><b>Need to stop something happening → PreToolUse.</b> <b>Need to change what the model sees ' +
      'after it happened → PostToolUse.</b> If an option offers PostToolUse for blocking a refund, it is ' +
      'wrong on mechanism: by the time PostToolUse runs, the money has moved.</p></div>',

      example:
      '<h3>Scenario 1 — three MCP servers, three date formats, one hook</h3>' +
      '<p>The support agent integrates three backends. A customer asks "when did my order ship, and has ' +
      'my refund gone through?" The agent calls two tools and receives:</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Raw — what the model would see</span>' +
      '<pre><code>lookup_order →\n{ "order_id": "4471",\n  "created": 1771459200,\n  "status": 3,\n  "ship_ts": 1771632000,\n  … 36 more fields … }\n\nget_refund →\n{ "refund_id": "R-5512",\n  "created_at": "2026-02-21T09:14:00Z",\n  "state": "SETTLED" }</code></pre>' +
      '<p>The model must now infer that <code>3</code> means shipped, that two epoch integers are dates, ' +
      'and that <code>SETTLED</code> and a status integer live in different vocabularies — while ignoring ' +
      '36 irrelevant fields.</p></div>' +
      '<div class="good"><span class="vs-h">After PostToolUse normalisation</span>' +
      '<pre><code>lookup_order →\n{ "order_id": "4471",\n  "created_at": "2026-02-19T00:00:00Z",\n  "status": "shipped",\n  "shipped_at": "2026-02-21T00:00:00Z",\n  "total": 128.40,\n  "refundable": true }\n\nget_refund →\n{ "refund_id": "R-5512",\n  "created_at": "2026-02-21T09:14:00Z",\n  "status": "settled" }</code></pre>' +
      '<p>One date format, one status vocabulary, six relevant fields. The model can compare dates ' +
      'directly and answer in one step.</p></div></div>' +
      '<p>And critically, the normalisation is written <b>once</b>. Adding a fourth MCP server with its own ' +
      'conventions means extending one hook, not editing a system prompt and hoping, or forking a ' +
      'third-party server.</p>' +

      '<div class="callout note"><span class="co-t">Beyond the two</span>' +
      '<p>Claude Code and the Agent SDK also expose <code>UserPromptSubmit</code>, <code>Stop</code>, ' +
      '<code>SubagentStart</code>/<code>SubagentStop</code>, <code>PreCompact</code>, ' +
      '<code>SessionStart</code>/<code>SessionEnd</code> and others, and <code>PostToolUseFailure</code> ' +
      'for calls that error. Worth knowing they exist; the exam guide\'s objectives name only PostToolUse ' +
      'and generic tool-call interception, so items will turn on the Pre/Post distinction.</p></div>',

      mistakes: [
        { t: 'Using PostToolUse to block an action',
          d: 'It runs after execution. Blocking requires PreToolUse. If a question asks you to prevent ' +
             'something, PostToolUse is wrong on mechanism, not merely suboptimal.' },
        { t: 'Normalising formats in the system prompt',
          d: 'Probabilistic and it burns model attention on clerical conversion every turn. A hook does ' +
             'it deterministically and invisibly.' },
        { t: 'Normalising inside third-party MCP servers',
          d: 'You usually cannot, and even where you can you would repeat the logic per server. One hook ' +
             'covers every tool result.' },
        { t: 'Post-processing after the loop completes',
          d: 'The model has already reasoned — and possibly acted — on the raw values. Too late by ' +
             'construction.' },
        { t: 'Denying without a reason',
          d: 'Return a <code>permissionDecisionReason</code>. An agent told only "no" tends to retry; one ' +
             'told "no, escalate instead" does the right thing.' },
        { t: 'Forgetting that hooks are also a trimming point',
          d: 'PostToolUse is where you cut a 40-field payload down to the fields that matter, which is ' +
             'one of the highest-leverage context savings available.' }
      ],

      exam:
      '<p>The reliable item is the format-normalisation question: tools return Unix timestamps and ISO ' +
      '8601 and numeric status codes, and you are asked where to fix it. Answer: a PostToolUse hook. The ' +
      'three distractors are almost always the system prompt, inside the tool, and after the loop. A ' +
      'second shape gives you a hard business rule and asks for the mechanism — that is PreToolUse or an ' +
      'equivalent orchestration gate, shared with <a href="#/unit/1.4">1.4</a>. Watch for an option that ' +
      'names the wrong hook for the right idea.</p>',

      questions: [
        {
          id: 'q1.5.1', scn: 1,
          stem: '<p>Your agent integrates three MCP servers. The order service returns timestamps as Unix ' +
            'epoch integers, the billing service returns ISO 8601 strings, and a legacy CRM returns ' +
            'numeric status codes (<code>3</code> = shipped). The agent occasionally misreports shipment ' +
            'dates and order states to customers. Where should the normalisation happen?</p>',
          opts: [
            'In a PostToolUse hook that transforms every tool result into a single date format and status vocabulary before the model processes it.',
            'In the system prompt, documenting each server\'s conventions and instructing the model to convert values before reasoning about them.',
            'Inside each MCP server, so that every tool returns already-normalised values at the source.',
            'In a post-processing step applied to the agent\'s final response, correcting any dates or statuses before they reach the customer.'
          ],
          ans: [0],
          why: 'PostToolUse intercepts results after execution and before the model sees them, which is ' +
            'exactly the window where heterogeneous formats can be reconciled. One hook covers every tool ' +
            'from every server, deterministically, and adding a fourth server means extending one ' +
            'function.',
          wrong: [
            '',
            'Probabilistic: the model may forget or misapply the conversion, and you pay attention and ' +
            'tokens for clerical work on every turn. Prompt instruction is the wrong mechanism for a ' +
            'mechanical transformation.',
            'Often impossible — third-party MCP servers are not yours to modify — and even where possible ' +
            'it duplicates the same logic in every server you ever integrate.',
            'Far too late. The model has already reasoned over the raw values and may have decided to ' +
            'refuse a return based on a misread ship date. Correcting the final text does not correct the ' +
            'reasoning that produced it.'
          ]
        },
        {
          id: 'q1.5.2', scn: 1,
          stem: '<p>You must guarantee that <code>process_refund</code> can never execute with an amount ' +
            'above $500. Which hook configuration achieves this?</p>',
          opts: [
            'A PreToolUse hook that inspects the tool arguments and returns a deny decision when the amount exceeds $500, naming <code>escalate_to_human</code> as the alternative.',
            'A PostToolUse hook that inspects the refund result and reverses the transaction when the amount exceeded $500.',
            'A PostToolUse hook that returns an error to the model whenever a refund above $500 has been processed, so the model learns not to repeat it.',
            'A SessionStart hook that injects the $500 policy into context at the beginning of every session.'
          ],
          ans: [0],
          why: 'PreToolUse is the only one of these that runs <em>before</em> execution, which is what ' +
            '"can never execute" requires. Returning a reason that names the escalation path also gives ' +
            'the agent a correct next action rather than leaving it to guess.',
          wrong: [
            '',
            'The refund has already been issued by the time PostToolUse fires. A compensating reversal is ' +
            'a different, worse guarantee: the money moved, the customer may have been notified, and the ' +
            'reversal itself can fail.',
            'Worse still. It permits the violation and relies on the model generalising from an error ' +
            'message — teaching, not enforcing. The policy said never.',
            'Injecting policy text is prompt-level guidance with extra steps. It informs the model; it ' +
            'does not constrain it.'
          ]
        },
        {
          id: 'q1.5.3', scn: 1,
          stem: '<p>Your <code>lookup_order</code> tool returns 40+ fields per order — warehouse routing ' +
            'codes, internal audit flags, carrier metadata — of which about six matter for return and ' +
            'refund decisions. Across a long multi-issue conversation this fills context and degrades the ' +
            'agent\'s recall of earlier details. What is the most appropriate fix?</p>',
          opts: [
            'Trim the tool result to the return-relevant fields in a PostToolUse hook, before it accumulates in the conversation.',
            'Instruct the agent in the system prompt to ignore fields that are not relevant to the current task.',
            'Enable context compaction so that older tool results are summarised once the context approaches its limit.',
            'Move to a model with a larger context window so that the full payloads fit comfortably.'
          ],
          ans: [0],
          why: 'The tokens are spent the moment the result enters the conversation, so the fix belongs at ' +
            'the point of entry. A PostToolUse hook trims the payload before the model ever sees it, which ' +
            'both saves context and removes the distraction of 34 irrelevant fields.',
          wrong: [
            '',
            'Telling the model to ignore fields does not remove them from context — the tokens are already ' +
            'consumed. It addresses attention, not the actual resource problem.',
            'Compaction is a reasonable safety net for long sessions, but it is a reaction to bloat rather ' +
            'than a way of avoiding it. Compacting summaries of data you never needed is strictly worse ' +
            'than not ingesting it.',
            'The classic capacity-instead-of-architecture distractor. A larger window postpones the ' +
            'symptom and pays for irrelevant tokens on every single turn.'
          ]
        },
        {
          id: 'q1.5.4', scn: 3,
          stem: '<p>Which statement correctly characterises the difference between PreToolUse and ' +
            'PostToolUse hooks?</p>',
          opts: [
            'PreToolUse runs before execution and can deny the call; PostToolUse runs after execution and cannot prevent it, but can transform the result the model receives.',
            'PreToolUse validates the tool\'s input schema while PostToolUse validates its output schema; neither can block execution.',
            'Both can block a tool call, but PreToolUse blocks silently while PostToolUse returns an explanatory error to the model.',
            'PreToolUse applies only to built-in tools and PostToolUse applies only to MCP tools.'
          ],
          ans: [0],
          why: 'This is the whole distinction, and it determines which hook answers which question. ' +
            'Prevention requires the pre-execution hook; reshaping what the model perceives requires the ' +
            'post-execution one.',
          wrong: [
            '',
            'Schema validation is not the dividing line, and the claim that neither can block is simply ' +
            'wrong — PreToolUse denial is its primary purpose.',
            'PostToolUse cannot block: the tool has already run. It can report and reshape, but the side ' +
            'effects have occurred.',
            'Both hooks fire for tool calls regardless of whether the tool is built-in or comes from an ' +
            'MCP server. There is no such split.'
          ]
        },
        {
          id: 'q1.5.5', scn: 1,
          stem: '<p>A PreToolUse hook blocks a $900 refund. Your agent then issues two ' +
            '<code>process_refund</code> calls of $450 each, both of which pass the hook, and the customer ' +
            'receives $900. What is the correct remediation?</p>',
          opts: [
            'Make the gate stateful — evaluate the cumulative refund total for the session or order against the $500 ceiling, not just each call in isolation.',
            'Add a system prompt instruction forbidding the agent from splitting refunds to stay under the threshold.',
            'Lower the per-call threshold to $250 so that splitting becomes impractical for most refund amounts.',
            'Move the ceiling check into the <code>process_refund</code> tool implementation, where it can see the true transaction record.'
          ],
          ans: [0],
          why: 'A per-call check enforces a per-call limit, which was never the policy. The policy is a ' +
            'ceiling on what the agent may refund autonomously, so the gate must track cumulative totals ' +
            'per session or per order. Splitting then hits the same wall as a single large refund.',
          wrong: [
            '',
            'Returns a deterministic requirement to probabilistic enforcement — the exact inversion this ' +
            'domain warns against. It also treats a design gap in the gate as a behavioural problem in ' +
            'the model.',
            'Arbitrary, and it does not close the loophole: four $250 refunds still reach $1,000. It also ' +
            'blocks legitimate mid-size refunds that policy permits, hurting first-contact resolution.',
            'Plausible, but the tool sees one transaction at a time too, so a naive check there has the ' +
            'same flaw. It also scatters policy across backends instead of enforcing it once, and misses ' +
            'any future refund path that does not go through this tool.'
          ]
        }
      ]
    },

    /* ================================================================== 1.6 */
    {
      id: '1.6',
      short: 'Task decomposition strategies',
      title: 'Design task decomposition strategies for complex workflows',
      scn: [4, 5],
      tldr: 'Two decomposition families, and the exam wants you to pick between them. <b>Prompt chaining</b> ' +
        '— a fixed sequence of focused passes — suits predictable multi-aspect work like reviewing a PR ' +
        'file by file and then checking cross-file consistency. <b>Dynamic decomposition</b> — subtasks ' +
        'generated from what each step discovers — suits open-ended investigation. The recurring worked ' +
        'case is the large code review, where the fix for inconsistent results is per-file passes plus a ' +
        'separate integration pass.',

      concept:
      '<h3>Attention dilution: the problem decomposition solves</h3>' +
      '<p>Give a model fourteen files and ask for a thorough review and something predictable happens. ' +
      'Some files get detailed scrutiny, others a sentence. Obvious bugs are missed. Worse, the review ' +
      'contradicts itself — flagging a pattern as dangerous in file 3 and approving identical code in ' +
      'file 11. Nothing is broken; the attention available for the task was spread across too much ' +
      'material to be uniformly deep.</p>' +
      '<p>The instinct is to reach for capacity: a bigger context window, a stronger model. That ' +
      'misdiagnoses it. The material already fit. The problem is that one pass over fourteen files cannot ' +
      'give each file dedicated attention — and no amount of window solves that, because window is not ' +
      'attention.</p>' +

      fig({
        vb: '0 0 700 300',
        caption: 'Single-pass review dilutes attention and produces contradictions. Per-file passes plus ' +
          'a dedicated integration pass give each concern its own budget.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Single pass over 14 files</text>' +
          '<rect x="24" y="28" width="300" height="44" rx="6" class="boxBad"/>' +
          (function () {
            var s = '';
            for (var i = 0; i < 14; i++) {
              s += '<rect x="' + (32 + i * 21) + '" y="36" width="16" height="12" rx="2" class="box"/>';
            }
            return s;
          })() +
          '<text x="174" y="64" text-anchor="middle" font-size="10">uneven depth · missed bugs · contradictory verdicts</text>' +

          '<line x1="24" y1="90" x2="676" y2="90" class="stroke dashed"/>' +

          '<text x="24" y="112" font-size="11" font-weight="600">Pass 1 — per file, local issues</text>' +
          (function () {
            var s = '';
            for (var i = 0; i < 5; i++) {
              var x = 24 + i * 96;
              s += '<rect x="' + x + '" y="122" width="84" height="40" rx="5" class="boxOk"/>';
              s += '<text x="' + (x + 42) + '" y="139" text-anchor="middle" font-size="10" font-weight="600">file ' + (i + 1) + '</text>';
              s += '<text x="' + (x + 42) + '" y="153" text-anchor="middle" font-size="9" class="dim">full attention</text>';
            }
            s += '<text x="516" y="147" font-size="11" class="dim">… ×14</text>';
            return s;
          })() +

          '<path class="arrow" d="M350 168 L350 200" marker-end="url(#ah)"/>' +

          '<text x="24" y="196" font-size="11" font-weight="600">Pass 2 — cross-file integration</text>' +
          '<rect x="24" y="206" width="500" height="44" rx="6" class="boxA"/>' +
          '<text x="274" y="224" text-anchor="middle" font-size="10.5">interface consistency · data flow across modules · duplicated logic</text>' +
          '<text x="274" y="240" text-anchor="middle" font-size="10" class="dim">one consistent standard applied to the whole change set</text>' +

          '<rect x="24" y="262" width="652" height="30" rx="5" class="box"/>' +
          '<text x="34" y="281" font-size="10.5">Not the fix: a bigger context window · three full reviews intersected · forcing developers to split the PR</text>'
      }) +

      '<h3>Prompt chaining — fixed, predictable passes</h3>' +
      '<p>When you know in advance what aspects need examining, chain them. Each step gets a focused ' +
      'prompt and its own budget; each output feeds the next. The code review case is the canonical ' +
      'example, and it is exactly two steps:</p>' +
      '<ol><li><b>Per-file pass.</b> Analyse each file individually for local issues — logic errors, ' +
      'error handling, unsafe conversions. One file, full attention, consistent standard.</li>' +
      '<li><b>Integration pass.</b> Examine the change set as a whole for cross-file concerns — interface ' +
      'consistency, data flow across module boundaries, a helper duplicated in two places.</li></ol>' +
      '<p>Note what the split buys beyond depth: <b>consistency</b>. Contradictory verdicts arise because ' +
      'a single pass applies a drifting standard as it goes. A per-file pass applies the same prompt to ' +
      'every file, so the standard cannot drift.</p>' +

      '<h3>Dynamic decomposition — subtasks discovered as you go</h3>' +
      '<p>Some work cannot be planned upfront because the plan depends on what you find. "Add ' +
      'comprehensive tests to this legacy codebase" is the guide\'s example. You cannot enumerate the test ' +
      'files before you know what the modules are, what is already covered, and what depends on what.</p>' +
      '<p>The pattern is: <b>map the structure → identify high-impact areas → build a prioritised plan → ' +
      'adapt as dependencies surface</b>. Each step\'s findings generate the next step\'s subtasks.</p>' +

      '<div class="tablewrap"><table><thead><tr><th></th><th>Prompt chaining</th><th>Dynamic decomposition</th></tr></thead><tbody>' +
      '<tr><th>Use when</th><td>The aspects to examine are known in advance</td><td>The shape of the work ' +
      'emerges from investigation</td></tr>' +
      '<tr><th>Example</th><td>Review 14 files: per-file pass, then integration pass</td><td>Add tests to ' +
      'a legacy codebase; trace an unfamiliar bug</td></tr>' +
      '<tr><th>Plan</th><td>Fixed before you start</td><td>Regenerated at each step</td></tr>' +
      '<tr><th>Failure mode</th><td>Rigid — misses what the fixed steps do not look for</td><td>Can ' +
      'wander; needs coverage criteria and a stopping condition</td></tr>' +
      '</tbody></table></div>' +

      '<h3>Rejected alternatives, and why they are rejected</h3>' +
      '<p>The exam presents the same three wrong answers to the code-review question repeatedly. Learn ' +
      'why each fails, not just that it does:</p>' +
      '<ul>' +
      '<li><b>"Use a higher-tier model with a bigger context window."</b> The files already fit. A larger ' +
      'window changes capacity, not the uniformity of attention across fourteen items. This treats the ' +
      'symptom and costs more per run.</li>' +
      '<li><b>"Run three full reviews and report only issues found in at least two."</b> Actively harmful. ' +
      'Real bugs are often caught intermittently — that is the whole problem — so consensus filtering ' +
      'suppresses exactly the findings you were missing. You would trade false positives for false ' +
      'negatives, which in a code review is the worse trade.</li>' +
      '<li><b>"Require developers to submit PRs of 3–4 files."</b> An organisational workaround for an ' +
      'architectural defect. Some changes are legitimately fourteen files; a renamed interface touches ' +
      'everything that implements it. You would be degrading engineering practice to accommodate a review ' +
      'system you could have fixed.</li>' +
      '</ul>',

      example:
      '<h3>Scenario 5 — restructuring the review of a 14-file PR</h3>' +
      '<p>A PR touches 14 files in a stock-tracking module. The current single-pass review produces: ' +
      'detailed feedback on four files, one-liners on the rest, two missed null-dereferences, and — most ' +
      'damaging to trust — a comment flagging a bare <code>except:</code> in ' +
      '<code>inventory/sync.py</code> while approving an identical construct in ' +
      '<code>inventory/reconcile.py</code>.</p>' +
      '<pre><code># Pass 1 — one invocation per file, identical prompt each time\nfor path in changed_files:                      # 14 invocations\n' +
      '    findings[path] = claude(\n' +
      '        prompt = PER_FILE_PROMPT,               # same criteria every file\n' +
      '        context = [diff_of(path), file_contents(path)],\n' +
      '    )\n' +
      '    # local concerns only: logic, error handling, null safety,\n' +
      '    # resource cleanup, unsafe conversions\n' +
      '\n' +
      '# Pass 2 — one invocation over the whole change set\nintegration = claude(\n' +
      '    prompt  = INTEGRATION_PROMPT,\n' +
      '    context = [full_diff, summarise(findings)],\n' +
      '    # cross-file only: interface consistency, data flow across\n' +
      '    # module boundaries, duplicated logic, call-site mismatches\n' +
      ')</code></pre>' +
      '<p>Both problems dissolve. Every file gets an equal share of attention in pass 1, so depth is ' +
      'uniform and the null-dereferences surface. And because all fourteen invocations use the same ' +
      'prompt, the bare-<code>except:</code> judgment is necessarily the same in both files — the ' +
      'contradiction was an artefact of a drifting single pass, not a disagreement about the rule.</p>' +
      '<p>Pass 2 then catches what no per-file pass can see: <code>sync.py</code> now returns a dict where ' +
      '<code>reconcile.py</code> still expects a list.</p>' +
      '<div class="callout tip"><span class="co-t">Same shape, other domains</span>' +
      '<p>This decomposition reappears as <a href="#/unit/4.6">task statement 4.6</a> (multi-pass review ' +
      'architectures) and connects to <a href="#/unit/3.6">3.6</a> (running it in CI). One pattern, three ' +
      'places it can be examined — which is a good reason to know it cold.</p></div>',

      mistakes: [
        { t: 'Answering attention dilution with a bigger context window',
          d: 'The content already fits. Window is capacity; the problem is uniformity of attention across ' +
             'many items. This is the most common distractor in the domain.' },
        { t: 'Intersecting multiple full reviews',
          d: 'Suppresses intermittently-detected real bugs. Consensus filtering optimises precision at ' +
             'the cost of recall — the wrong trade for a bug hunt.' },
        { t: 'Pushing the problem onto developers',
          d: 'Mandating small PRs is a process workaround for an architectural defect, and some changes ' +
             'legitimately span many files.' },
        { t: 'Per-file passes with no integration pass',
          d: 'Half the fix. Cross-file issues — interface drift, duplicated logic, changed return shapes ' +
             '— are invisible from inside a single file.' },
        { t: 'Using different prompts for different files',
          d: 'Reintroduces the inconsistency you decomposed to remove. The per-file prompt must be ' +
             'identical for every file.' },
        { t: 'Forcing a fixed chain onto open-ended investigation',
          d: '"Add comprehensive tests to a legacy codebase" cannot be planned before you have mapped the ' +
             'code. Use dynamic decomposition and let each step generate the next subtasks.' },
        { t: 'Dynamic decomposition with no stopping condition',
          d: 'Adaptive plans wander without explicit coverage criteria. Define what "done" means before ' +
             'you start exploring.' }
      ],

      exam:
      '<p>The 14-file review question is one of the twelve official samples and is close to a certainty in ' +
      'some form. Answer: split into per-file local passes plus a separate cross-file integration pass. ' +
      'Memorise the three wrong answers too — bigger model, three-review intersection, smaller PRs — ' +
      'because recognising them instantly saves you the two minutes you will need elsewhere. A second, ' +
      'less common item asks you to choose between a fixed chain and dynamic decomposition; the ' +
      'discriminator is whether the aspects to examine are knowable before you start.</p>',

      questions: [
        {
          id: 'q1.6.1', scn: 5, official: true,
          stem: '<p>A pull request modifies 14 files across the stock tracking module. Your single-pass ' +
            'review analysing all files together produces inconsistent results: detailed feedback for some ' +
            'files but superficial comments for others, obvious bugs missed, and contradictory feedback — ' +
            'flagging a pattern as problematic in one file while approving identical code elsewhere in the ' +
            'same PR. How should you restructure the review?</p>',
          opts: [
            'Split into focused passes: analyse each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow.',
            'Require developers to split large PRs into smaller submissions of 3–4 files before the automated review runs.',
            'Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass.',
            'Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs.'
          ],
          ans: [0],
          why: 'Splitting into focused passes addresses the root cause: attention dilution when processing ' +
            'many files at once. File-by-file analysis ensures consistent depth — and because every file ' +
            'gets the same prompt, the contradictory verdicts cannot occur. A separate integration pass ' +
            'then catches the cross-file issues no per-file pass can see.',
          wrong: [
            '',
            'Shifts the burden to developers without improving the system, and some changes legitimately ' +
            'span fourteen files. The review architecture is what failed.',
            'Misunderstands the failure. The files already fit in context; a larger window does not make ' +
            'attention uniform across fourteen items, and you pay more per run for no structural change.',
            'This would actively suppress detection of real bugs, by requiring consensus on issues that ' +
            'may only be caught intermittently — which is precisely the behaviour being complained about.'
          ]
        },
        {
          id: 'q1.6.2', scn: 4,
          stem: '<p>You are asked to add comprehensive test coverage to a legacy service with no tests, ' +
            'roughly 60 source files, and undocumented internal dependencies. Which decomposition ' +
            'strategy fits?</p>',
          opts: [
            'Dynamic decomposition: map the structure, identify high-impact areas, produce a prioritised plan, and adapt it as dependencies are discovered.',
            'Prompt chaining with a fixed four-step sequence: enumerate files, generate unit tests, generate integration tests, then verify coverage.',
            'A single comprehensive prompt containing all 60 files and the instruction to produce a full test suite.',
            'One independent invocation per source file, each asked to generate tests for that file in isolation.'
          ],
          ans: [0],
          why: 'The work cannot be planned before it is understood: which areas are high-impact and what ' +
            'depends on what are discoveries, not inputs. Dynamic decomposition generates subtasks from ' +
            'what each step reveals, which is the guide\'s stated approach for exactly this example.',
          wrong: [
            '',
            'A fixed chain presumes you already know the plan. Enumerating files tells you nothing about ' +
            'which modules carry risk, and the chain has no way to react when a dependency turns out to ' +
            'make a module untestable without refactoring first.',
            'Sixty files in one prompt is the attention-dilution failure at scale, and it produces a ' +
            'shallow, uneven suite with no prioritisation.',
            'Per-file isolation is right for reviewing local issues but wrong for test <em>strategy</em>: ' +
            'it cannot prioritise by impact, will duplicate setup across files, and misses integration ' +
            'behaviour entirely.'
          ]
        },
        {
          id: 'q1.6.3', scn: 5,
          stem: '<p>You have implemented per-file review passes for large PRs. Reviewers report that ' +
            'per-file feedback is now consistently good, but a regression shipped in which one module ' +
            'began returning a dictionary while its two callers still expected a list. Neither per-file ' +
            'review flagged it. What is missing?</p>',
          opts: [
            'A cross-file integration pass that examines interface consistency and data flow across the whole change set.',
            'A stricter per-file prompt that requires the model to check every function\'s return type against its documented contract.',
            'A larger context window on the per-file passes so each one can also see the files that call into it.',
            'A final consensus pass that re-runs all per-file reviews and reports only findings that recur.'
          ],
          ans: [0],
          why: 'A per-file pass sees one file. The mismatch exists only in the relationship between three ' +
            'files, so no amount of per-file rigour can surface it. That is the specific job of the second ' +
            'pass in the two-pass architecture.',
          wrong: [
            '',
            'The changed module\'s return type may be perfectly consistent with its own documentation — ' +
            'the defect is that the <em>callers</em> were not updated. Per-file checking cannot see the ' +
            'call sites.',
            'This quietly abandons the decomposition: as you widen each per-file pass to include callers, ' +
            'you drift back toward the single diluted pass you started from.',
            'Consensus filtering reduces recall and does not create the cross-file view that is missing. ' +
            'Re-running a pass that structurally cannot see the problem produces the same blind spot ' +
            'repeatedly.'
          ]
        },
        {
          id: 'q1.6.4', scn: 5,
          stem: '<p>Which factors correctly indicate that a fixed prompt chain, rather than dynamic ' +
            'decomposition, is the appropriate strategy?</p>',
          opts: [
            'The aspects that must be examined are known before work begins.',
            'Each step\'s output feeds a predictable next step, and the sequence does not need to change based on findings.',
            'The scope of the work can only be established by first exploring the material.',
            'The task is large enough that a single pass would dilute attention across too many items.'
          ],
          ans: [0, 1],
          why: 'A fixed chain is appropriate exactly when the plan is knowable upfront and the sequence is ' +
            'stable — the multi-aspect code review being the standard case. Both correct options describe ' +
            'that predictability.',
          wrong: [
            '', '',
            'This is the signature of <em>dynamic</em> decomposition. If scope emerges from exploration, a ' +
            'fixed chain will look in the wrong places.',
            'True of the code review, but it argues for <em>decomposing at all</em> rather than for which ' +
            'kind. Dynamic decomposition also relieves attention dilution, so this does not discriminate ' +
            'between the two strategies.'
          ]
        },
        {
          id: 'q1.6.5', scn: 4,
          stem: '<p>A team lead proposes: "Our review quality problem is really a PR size problem. Let us ' +
            'add a CI check that fails any PR touching more than five files, forcing engineers to split ' +
            'their work." Evaluate this from an architectural standpoint.</p>',
          opts: [
            'Reject it: it is an organisational workaround for a review architecture that should be decomposed into per-file and integration passes, and it blocks changes that legitimately span many files.',
            'Accept it: smaller PRs are a recognised engineering good practice, so the constraint improves both review quality and code quality simultaneously.',
            'Accept it as a temporary measure while the review prompts are improved, then remove the check once false positives fall.',
            'Reject it, and instead raise the review model\'s context window so that large PRs are handled adequately in a single pass.'
          ],
          ans: [0],
          why: 'The review system is what failed, and the two-pass decomposition fixes it directly. A ' +
            'hard file-count gate degrades engineering practice to accommodate a tool limitation, and ' +
            'breaks legitimate wide changes — renaming an interface necessarily touches every ' +
            'implementer.',
          wrong: [
            '',
            'Small PRs are often good practice, but mandating them by CI gate conflates a review-tool ' +
            'limitation with a code-quality standard, and mechanically splitting one coherent change into ' +
            'four incoherent ones makes review harder, not easier.',
            'Framing it as temporary does not make it sound, and false positives are not the reported ' +
            'problem — inconsistent depth, missed bugs and contradictions are. The measure does not ' +
            'address any of them.',
            'Correct to reject the gate, wrong on the alternative. A bigger window does not make attention ' +
            'uniform across many files, which is the actual failure.'
          ]
        }
      ]
    },

    /* ================================================================== 1.7 */
    {
      id: '1.7',
      short: 'Sessions: resume vs fork vs fresh',
      title: 'Manage session state, resumption, and forking',
      scn: [2, 4],
      tldr: 'Three options, three distinct jobs. <code>--resume &lt;name&gt;</code> continues a specific ' +
        'prior conversation — use it when the prior context is <b>still valid</b>. ' +
        '<code>fork_session</code> creates independent branches from a shared baseline — use it to ' +
        '<b>compare divergent approaches</b>. A <b>fresh session with an injected summary</b> is right ' +
        'when prior tool results have gone <b>stale</b>, because resuming would reason over file contents ' +
        'that no longer exist.',

      concept:
      '<h3>Why session choice is an architecture question</h3>' +
      '<p>A long agent session accumulates something valuable — a map of the codebase, decisions made, ' +
      'facts established — and something dangerous: <b>tool results that were true when they were ' +
      'fetched</b>. When you come back to the work an hour or a day later, the question is not "how do I ' +
      'keep going" but "how much of what this session believes is still true".</p>' +

      fig({
        vb: '0 0 700 300',
        caption: 'Choosing between resume, fork and fresh-with-summary. The deciding question is whether ' +
          'prior tool results still describe reality.',
        body:
          '<rect x="248" y="14" width="200" height="40" rx="6" class="boxA"/>' +
          '<text x="348" y="32" text-anchor="middle" font-size="11.5" font-weight="600">You have prior session state</text>' +
          '<text x="348" y="46" text-anchor="middle" font-size="10" class="dim">what do you want from it?</text>' +

          '<path class="arrow" d="M300 54 L150 96" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M348 54 L348 96" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M396 54 L552 96" marker-end="url(#ah)"/>' +

          '<rect x="30" y="96" width="212" height="58" rx="6" class="box"/>' +
          '<text x="136" y="115" text-anchor="middle" font-size="10.5" font-weight="600">Continue the same line</text>' +
          '<text x="136" y="130" text-anchor="middle" font-size="9.5" class="dim">and prior results are still valid</text>' +
          '<text x="136" y="146" text-anchor="middle" font-size="10" class="mono">--resume &lt;name&gt;</text>' +

          '<rect x="252" y="96" width="192" height="58" rx="6" class="box"/>' +
          '<text x="348" y="115" text-anchor="middle" font-size="10.5" font-weight="600">Compare two approaches</text>' +
          '<text x="348" y="130" text-anchor="middle" font-size="9.5" class="dim">from one shared baseline</text>' +
          '<text x="348" y="146" text-anchor="middle" font-size="10" class="mono">fork_session</text>' +

          '<rect x="454" y="96" width="216" height="58" rx="6" class="box"/>' +
          '<text x="562" y="115" text-anchor="middle" font-size="10.5" font-weight="600">Files changed underneath</text>' +
          '<text x="562" y="130" text-anchor="middle" font-size="9.5" class="dim">prior tool results are stale</text>' +
          '<text x="562" y="146" text-anchor="middle" font-size="10" class="mono">fresh + injected summary</text>' +

          '<line x1="30" y1="174" x2="670" y2="174" class="stroke dashed"/>' +

          '<text x="30" y="196" font-size="11" font-weight="600">Fork, concretely</text>' +
          '<rect x="30" y="206" width="170" height="36" rx="5" class="boxA"/>' +
          '<text x="115" y="228" text-anchor="middle" font-size="10.5">20 min codebase analysis</text>' +
          '<path class="arrow" d="M200 218 L250 200" marker-end="url(#ah)"/>' +
          '<path class="arrow" d="M200 226 L250 252" marker-end="url(#ah)"/>' +
          '<rect x="250" y="182" width="200" height="34" rx="5" class="boxOk"/>' +
          '<text x="350" y="203" text-anchor="middle" font-size="10.5">branch A — service layer</text>' +
          '<rect x="250" y="236" width="200" height="34" rx="5" class="boxOk"/>' +
          '<text x="350" y="257" text-anchor="middle" font-size="10.5">branch B — repository pattern</text>' +
          '<text x="466" y="212" font-size="10" class="dim">identical baseline →</text>' +
          '<text x="466" y="228" font-size="10" class="dim">a controlled comparison</text>'
      }) +

      '<h3><code>--resume</code> — continue a named conversation</h3>' +
      '<p>Sessions can be named, and <code>--resume &lt;session-name&gt;</code> picks a specific one back ' +
      'up with its full history. This is the right choice when you are continuing the same line of work ' +
      'and the context still describes reality: you were half-way through tracing a bug, nothing has been ' +
      'edited, and you want to keep going.</p>' +
      '<p>The important discipline: if files <em>have</em> changed since the session last ran, and you ' +
      'still resume, <b>tell the agent what changed</b>. A resumed session confidently reasons over the ' +
      'file contents in its history, which are now fiction. Naming the specific files that moved lets it ' +
      're-read those and only those — targeted re-analysis instead of either full re-exploration or ' +
      'confident wrongness.</p>' +

      '<h3><code>fork_session</code> — branch from a shared baseline</h3>' +
      '<p>Forking creates <b>independent branches from a common ancestor</b>. The canonical use is ' +
      'comparison: you have spent real time building an understanding, and you want to explore two ' +
      'divergent approaches <em>from the same starting point</em>.</p>' +
      '<p>Two properties make this the correct tool rather than a convenience. First, the expensive ' +
      'baseline is paid for once. Second — and this is the part people miss — the comparison is ' +
      '<b>controlled</b>. Two independent sessions might each analyse the codebase slightly differently, ' +
      'so any difference in their recommendations could come from the baseline rather than the strategy. ' +
      'Forking eliminates that confound.</p>' +
      '<p>It also isolates the branches: reasoning in branch A cannot anchor branch B, which is exactly ' +
      'the risk if you evaluate both strategies sequentially in one conversation.</p>' +

      '<h3>Fresh session with an injected summary — when context is stale</h3>' +
      '<p>Here is the case that separates people who have memorised three commands from people who ' +
      'understand the problem. You analysed a module yesterday. Overnight, a colleague refactored it ' +
      'substantially. You want to continue.</p>' +
      '<p>Resuming is <b>worse than starting over</b>. The session\'s history contains file contents, ' +
      'function signatures and call graphs that no longer exist, and the agent has no way to know they are ' +
      'obsolete — so it reasons fluently about code that is gone. The guide is explicit: <b>starting a new ' +
      'session with a structured summary is more reliable than resuming with stale tool results</b>.</p>' +
      '<p>What goes in the summary is the same shape as the context-refresh pattern in ' +
      '<a href="#/unit/5.4">task statement 5.4</a>:</p>' +
      '<ul>' +
      '<li>The original task, restated</li>' +
      '<li>What has been completed, and what was concluded</li>' +
      '<li>Decisions made, with their reasons — so they are not silently relitigated</li>' +
      '<li>What remains</li>' +
      '<li>Critical facts verbatim: identifiers, file paths, numbers, names</li>' +
      '</ul>' +
      '<p>Notice what is <em>not</em> in the summary: the raw tool results. That is the point. You carry ' +
      'forward conclusions and decisions, and you let the fresh session re-read the code as it currently ' +
      'is.</p>' +

      '<div class="callout rule"><span class="co-t">The discriminating question</span>' +
      '<p>Ask: <b>"are the prior tool results still true?"</b> Yes, and you want to continue → resume. ' +
      'Yes, and you want two comparable branches → fork. No → fresh session, inject a summary of ' +
      'conclusions rather than observations. Almost every item on this task statement turns on that one ' +
      'question.</p></div>',

      example:
      '<h3>Scenario 2 — three Monday mornings, three different answers</h3>' +
      '<p>Same starting position each time: on Friday you ran a long session that mapped the payments ' +
      'module, identified four refactoring candidates, and agreed a naming convention with the team.</p>' +

      '<h4>Case A — nothing changed over the weekend</h4>' +
      '<pre><code>claude --resume payments-refactor\n' +
      '\n' +
      '# The history is accurate: file contents, call graph and the agreed\n' +
      '# convention are all still true. Continue where you stopped.</code></pre>' +

      '<h4>Case B — you want to compare two refactoring strategies</h4>' +
      '<pre><code>fork_session("payments-refactor") -> branch "service-layer"\n' +
      'fork_session("payments-refactor") -> branch "repository"\n' +
      '\n' +
      '# Both branches inherit the same Friday analysis, so the only\n' +
      '# difference between their conclusions is the strategy itself.\n' +
      '# Neither branch can anchor the other.</code></pre>' +

      '<h4>Case C — a colleague merged a large refactor of the same module</h4>' +
      '<pre><code># DO NOT resume. The session "knows" functions that no longer exist.\n' +
      '\n' +
      'claude "Continue the payments refactoring work.\n' +
      '\n' +
      'CONTEXT FROM PRIOR SESSION (conclusions, not observations):\n' +
      '  Task: reduce coupling between payments and billing.\n' +
      '  Completed: mapped module; identified 4 refactor candidates.\n' +
      '  Decisions:\n' +
      '    - Adopt repository pattern for persistence (team agreed Fri).\n' +
      '    - Keep PaymentIntent as the boundary type; do not rename.\n' +
      '    - Naming convention: <verb><Noun>Repository.\n' +
      '  Critical facts: ticket PAY-3391; candidates were\n' +
      '    payments/charge.py, payments/refund.py, billing/sync.py,\n' +
      '    billing/invoice.py.\n' +
      '  NOTE: billing/ was substantially refactored after that session.\n' +
      '        Re-read those files before relying on any prior structure.\n' +
      '\n' +
      'Remaining: apply the repository pattern to the two payments files."</code></pre>' +

      '<p>Case C carries forward everything durable — the goal, the decisions and why they were made, the ' +
      'ticket, the file list — and deliberately carries forward <b>no file contents</b>. It also flags the ' +
      'staleness explicitly, so the agent re-reads rather than assumes.</p>' +

      '<div class="callout tip"><span class="co-t">If you must resume a session over changed files</span>' +
      '<p>Sometimes resuming is worth it because most of the context is still good. Then name the damage: ' +
      '"Since this session last ran, <code>billing/sync.py</code> and <code>billing/invoice.py</code> were ' +
      'refactored — re-read both before using anything you previously learned about them." Targeted ' +
      're-analysis is much cheaper than full re-exploration, and far safer than silence.</p></div>',

      mistakes: [
        { t: 'Resuming a session whose tool results are stale',
          d: 'The agent reasons confidently over file contents that no longer exist. Start fresh with a ' +
             'summary of conclusions instead.' },
        { t: 'Starting two fresh sessions to compare approaches',
          d: 'Pays for the shared analysis twice and, worse, gives the branches different baselines — so ' +
             'the comparison is confounded. Fork instead.' },
        { t: 'Comparing two approaches sequentially in one session',
          d: 'The first approach\'s reasoning anchors the second. Forking keeps the branches independent.' },
        { t: 'Treating resume and fork as interchangeable',
          d: 'Resume continues one line; fork creates divergent branches. Resuming a session twice ' +
             'continues one conversation — the second resumption inherits whatever the first did.' },
        { t: 'Putting raw tool results in the injected summary',
          d: 'Defeats the purpose: you are re-importing the stale observations you started fresh to ' +
             'escape. Carry conclusions and decisions; let the new session re-read the code.' },
        { t: 'Omitting the reasons behind decisions',
          d: 'A summary that records <em>what</em> was decided but not <em>why</em> invites the fresh ' +
             'session to relitigate settled questions.' },
        { t: 'Resuming over changed files without saying so',
          d: 'If you do resume, name the files that moved so the agent re-reads them. Silence produces ' +
             'fluent, confident nonsense.' }
      ],

      exam:
      '<p>Expect a fork-versus-alternatives item: "compare two approaches starting from the same codebase ' +
      'analysis" → <code>fork_session</code>, with distractors offering two fresh sessions or two ' +
      'resumptions. And expect the staleness item: "prior tool results no longer reflect the files" → ' +
      'fresh session with an injected summary, with <code>--resume</code> as the tempting wrong answer. ' +
      'The guide states that preference explicitly, so it is fair game. If a stem mentions that files ' +
      'changed since the session ran, staleness is what is being tested.</p>',

      questions: [
        {
          id: 'q1.7.1', scn: 2,
          stem: '<p>Yesterday an agent session performed a lengthy analysis of your billing module, ' +
            'reading dozens of files. Overnight a teammate merged a substantial refactor of that same ' +
            'module. You want to continue the original task this morning. What is the most reliable ' +
            'approach?</p>',
          opts: [
            'Start a new session and inject a structured summary of the task, completed work, decisions and critical facts, letting the agent re-read the current code.',
            'Resume the prior session by name so that the accumulated analysis is preserved and no work is repeated.',
            'Resume the prior session and immediately run <code>/compact</code> to reduce the stale content before continuing.',
            'Fork the prior session so the original analysis is preserved as a baseline while you work on the refactored code.'
          ],
          ans: [0],
          why: 'The prior session\'s history contains file contents and structures that no longer exist, ' +
            'and the agent cannot tell that they are obsolete — so it will reason fluently about code that ' +
            'is gone. The guide states directly that starting a new session with a structured summary is ' +
            'more reliable than resuming with stale tool results.',
          wrong: [
            '',
            'This is the trap. Resume is for context that is <em>still valid</em>. Preserving analysis ' +
            'that has been invalidated preserves a liability, and "no work is repeated" is a false economy ' +
            'when the work describes a version of the code that no longer exists.',
            'Compaction summarises the history; it does not know which parts are stale. You end up with a ' +
            'condensed, still-wrong picture — and now the errors are harder to spot because the detail ' +
            'that would reveal them has been compressed away.',
            'Forking copies the stale baseline into a new branch. Both branches then carry the same ' +
            'obsolete file contents, so the problem is duplicated rather than solved.'
          ]
        },
        {
          id: 'q1.7.2', scn: 2,
          stem: '<p>You want to evaluate two competing testing strategies — heavy integration testing ' +
            'versus extensive unit testing with mocks — against the same detailed codebase analysis you ' +
            'have just completed. Which session mechanism fits?</p>',
          opts: [
            '<code>fork_session</code>, creating two independent branches from the completed analysis so each strategy is explored from an identical baseline.',
            '<code>--resume</code> on the analysis session, evaluating the first strategy and then the second within the same conversation.',
            'Two new sessions, each instructed to analyse the codebase and then evaluate one of the strategies.',
            '<code>--resume</code> on the analysis session twice, once per strategy, so each resumption explores one option.'
          ],
          ans: [0],
          why: 'Forking is designed for divergent exploration from a shared baseline. Both branches ' +
            'inherit the identical analysis, so any difference in their conclusions is attributable to the ' +
            'strategy rather than to the starting understanding — and neither branch can influence the ' +
            'other.',
          wrong: [
            '',
            'Sequential evaluation in one conversation lets the first strategy\'s reasoning anchor the ' +
            'assessment of the second. You want independence, not a discussion that has already taken a ' +
            'position.',
            'Duplicates the expensive analysis and risks the two sessions reaching different ' +
            'understandings — which confounds the comparison, because a difference in recommendations ' +
            'might come from the baseline rather than the strategy.',
            'Resuming the same session twice continues one linear conversation; the second resumption ' +
            'inherits everything the first one did. That is the opposite of two independent branches.'
          ]
        },
        {
          id: 'q1.7.3', scn: 4,
          stem: '<p>You resumed a named investigation session. Three of the twenty files it previously ' +
            'analysed have since been modified, but the rest of its context remains accurate and valuable. ' +
            'What is the appropriate way to proceed?</p>',
          opts: [
            'Tell the resumed session exactly which three files changed and instruct it to re-read those before relying on prior knowledge of them.',
            'Instruct the session to discard all prior file analysis and re-explore the codebase from scratch to be safe.',
            'Proceed without comment; the agent will re-read files as needed when it encounters inconsistencies.',
            'Abandon the resumed session and start fresh with an injected summary, since any staleness makes the context unreliable.'
          ],
          ans: [0],
          why: 'Naming the changed files enables targeted re-analysis: the agent refreshes exactly what is ' +
            'stale and keeps the seventeen files\' worth of accurate context. The guide calls out ' +
            'informing a resumed session about specific file changes as the efficient middle path.',
          wrong: [
            '',
            'Throws away accurate, expensive context to address a three-file problem. Full re-exploration ' +
            'is the costly option you resume specifically to avoid.',
            'The agent has no way to detect that its history is out of date — the stale content reads as ' +
            'authoritative. It will not encounter an inconsistency; it will produce one.',
            'Over-correction. Starting fresh is right when the context is broadly stale; here the great ' +
            'majority is valid and the staleness is precisely localised.'
          ]
        },
        {
          id: 'q1.7.4', scn: 2,
          stem: '<p>You are writing the structured summary to inject into a fresh session after ' +
            'abandoning a stale one. Which items belong in it?</p>',
          opts: [
            'The decisions already made, together with the reasoning behind them.',
            'Critical facts verbatim — ticket identifiers, file paths, agreed naming conventions, numeric values.',
            'The remaining work, stated as concretely as the completed work.',
            'The raw tool results from the prior session, so no observation is lost.'
          ],
          ans: [0, 1, 2],
          why: 'A useful summary carries forward what remains true regardless of code changes: the task, ' +
            'the decisions and their reasons (so they are not relitigated), the durable facts stated ' +
            'exactly, and what is left to do. That is the context-refresh pattern shared with ' +
            '<a href="#/unit/5.4">task statement 5.4</a>.',
          wrong: [
            '', '', '',
            'This re-imports the exact liability you started fresh to escape. Raw tool results are the ' +
            'stale part — file contents, signatures, call graphs. Carry conclusions; let the new session ' +
            're-read the code as it currently is.'
          ]
        },
        {
          id: 'q1.7.5', scn: 4,
          stem: '<p>Which statement best captures when <code>--resume</code> is the correct choice over ' +
            'starting a fresh session?</p>',
          opts: [
            'When the prior context — including its tool results — is still substantially valid, so continuing preserves genuine value rather than propagating obsolete observations.',
            'Whenever a prior session exists, since resuming is always cheaper than rebuilding context from scratch.',
            'When the prior session ended cleanly rather than being interrupted, indicating its state is consistent.',
            'When the prior session is recent, because staleness is a function of elapsed time rather than of intervening changes.'
          ],
          ans: [0],
          why: 'Validity of the prior context is the deciding criterion. Resume is for continuing work ' +
            'whose accumulated observations still describe reality; where they do not, the accumulated ' +
            'context is a liability rather than an asset.',
          wrong: [
            '',
            'Cheapness is not the criterion — resuming stale context is cheap and wrong. Token cost is ' +
            'irrelevant if the agent is reasoning about code that no longer exists.',
            'How a session ended says nothing about whether the files it read have since changed. A ' +
            'cleanly-ended session can be thoroughly stale.',
            'Recency correlates with staleness but does not determine it. A session from an hour ago is ' +
            'stale if a refactor landed in that hour; one from last week is fine if nothing was touched. ' +
            'Intervening change is what matters.'
          ]
        }
      ]
    }

    ]
  });
})(window.CCA);
