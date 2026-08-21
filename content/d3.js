/* Domain 3 — Claude Code Configuration & Workflows (20%, ≈12 items) */
(function (CCA) {
  var fig = function (o) { return CCA.fig(o); };

  CCA.domains.push({
    n: 3,
    orient: '<div class="callout rule"><span class="co-t">Orientation</span>' +
      '<p>The most <em>learnable</em> domain on the exam. Where Domain 1 asks for architectural judgment, ' +
      'much of Domain 3 asks whether you know which file a thing goes in — and there is a right answer. ' +
      'The organising question throughout is <b>scope</b>: does this reach my teammates through version ' +
      'control, or does it stop at my machine? Get the hierarchy automatic, learn the four skill/command ' +
      'decisions, memorise the three CI flags, and you have banked most of 20% of the exam.</p></div>',

    units: [

    /* ================================================================== 3.1 */
    {
      id: '3.1',
      short: 'CLAUDE.md hierarchy & scoping',
      title: 'Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization',
      scn: [2, 4],
      tldr: 'Three levels: <b>user</b> (<code>~/.claude/CLAUDE.md</code> — yours alone, never shared), ' +
        '<b>project</b> (<code>.claude/CLAUDE.md</code> or root <code>CLAUDE.md</code> — committed, ' +
        'reaches the whole team), and <b>directory</b> (a <code>CLAUDE.md</code> in a subdirectory, ' +
        'applying to that subtree). Keep it modular with <code>@import</code> or by splitting into ' +
        '<code>.claude/rules/</code>. When behaviour differs between teammates, <b><code>/memory</code></b> ' +
        'shows which files are actually loaded — that is the diagnostic.',

      concept:
      '<h3>The three levels</h3>' +
      fig({
        vb: '0 0 700 250',
        caption: 'The CLAUDE.md hierarchy. Only the project level travels through version control — which ' +
          'is the fact behind the most common configuration bug.',
        body:
          '<rect x="24" y="20" width="300" height="62" rx="6" class="box"/>' +
          '<text x="40" y="40" font-size="11" font-weight="600">1 · User level</text>' +
          '<text x="40" y="57" font-size="10" class="mono">~/.claude/CLAUDE.md</text>' +
          '<text x="40" y="73" font-size="10" class="dim">your machine only · never shared</text>' +
          '<rect x="336" y="20" width="340" height="62" rx="6" class="boxBad"/>' +
          '<text x="352" y="40" font-size="11" font-weight="600">Not in version control</text>' +
          '<text x="352" y="57" font-size="10">A teammate pulling the repo receives nothing from here.</text>' +
          '<text x="352" y="73" font-size="10">This is the cause of "works for everyone but the new joiner".</text>' +

          '<rect x="24" y="94" width="300" height="62" rx="6" class="boxA"/>' +
          '<text x="40" y="114" font-size="11" font-weight="600">2 · Project level</text>' +
          '<text x="40" y="131" font-size="10" class="mono">.claude/CLAUDE.md  or  ./CLAUDE.md</text>' +
          '<text x="40" y="147" font-size="10" class="dim">committed · the whole team gets it</text>' +
          '<rect x="336" y="94" width="340" height="62" rx="6" class="boxOk"/>' +
          '<text x="352" y="114" font-size="11" font-weight="600">Shared through git</text>' +
          '<text x="352" y="131" font-size="10">Team standards, conventions, review criteria, test rules.</text>' +
          '<text x="352" y="147" font-size="10">If everyone must follow it, it belongs here.</text>' +

          '<rect x="24" y="168" width="300" height="62" rx="6" class="box"/>' +
          '<text x="40" y="188" font-size="11" font-weight="600">3 · Directory level</text>' +
          '<text x="40" y="205" font-size="10" class="mono">packages/api/CLAUDE.md</text>' +
          '<text x="40" y="221" font-size="10" class="dim">bound to that directory and below</text>' +
          '<rect x="336" y="168" width="340" height="62" rx="6" class="box"/>' +
          '<text x="352" y="188" font-size="11" font-weight="600">Committed, but subtree-scoped</text>' +
          '<text x="352" y="205" font-size="10">Right for one package with genuinely local conventions.</text>' +
          '<text x="352" y="221" font-size="10">Wrong when the convention spans directories — use rules/.</text>'
      }) +

      '<h3>The scoping bug you will be asked about</h3>' +
      '<p>Three developers report that Claude follows a coding convention reliably. A fourth, who joined ' +
      'last week and has the same commit checked out, reports that it does not. Nothing is broken. The ' +
      'convention lives in the three original developers\' <code>~/.claude/CLAUDE.md</code> — added ' +
      'individually, months ago, and never moved into the repository.</p>' +
      '<p>User-level configuration is <b>not distributed by version control</b>. The fix is to move the ' +
      'instruction to project scope, where a <code>git pull</code> delivers it. The diagnostic that ' +
      'confirms it is <code>/memory</code>, which lists the memory files actually loaded in the current ' +
      'session — run it on both machines and the difference is immediately visible.</p>' +

      '<div class="callout note"><span class="co-t">Three commands, three different jobs</span>' +
      '<p><code>/memory</code> shows and lets you edit which CLAUDE.md files are loaded — the ' +
      '<b>configuration diagnostic</b>. <code>/compact</code> compresses the current conversation to ' +
      'reclaim context — a <b>context tool</b>, unrelated to configuration. <code>--resume</code> ' +
      'continues a prior session — <b>session management</b> (<a href="#/unit/1.7">1.7</a>). Items ' +
      'sometimes offer <code>/compact</code> where <code>/memory</code> is the answer.</p></div>' +

      '<h3>Choosing the level</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>The convention…</th><th>Goes in</th></tr></thead><tbody>' +
      '<tr><td>applies across the whole repository</td><td>Root project <code>CLAUDE.md</code></td></tr>' +
      '<tr><td>applies to one package or subtree, and only that subtree</td><td>A <code>CLAUDE.md</code> ' +
      'in that directory</td></tr>' +
      '<tr><td>applies to files matched by a <b>pattern</b>, scattered across many directories</td>' +
      '<td><code>.claude/rules/</code> with glob frontmatter — see <a href="#/unit/3.3">3.3</a></td></tr>' +
      '<tr><td>is a personal preference nobody else should inherit</td><td>' +
      '<code>~/.claude/CLAUDE.md</code></td></tr>' +
      '</tbody></table></div>' +
      '<p>The third row is the one people get wrong, and it is worth being precise about why. Test files ' +
      'commonly sit beside the code they test — <code>Button.test.tsx</code> next to ' +
      '<code>Button.tsx</code> — so they are spread through the whole tree. A directory-level ' +
      '<code>CLAUDE.md</code> cannot express "all test files everywhere", because it is bound to one ' +
      'directory. A glob can.</p>' +

      '<h3>Keeping it modular: <code>@import</code></h3>' +
      '<p>A 500-line CLAUDE.md is loaded in full, every session, whether or not any of it is relevant. It ' +
      'is also unmaintainable — nobody reviews a change to line 340. Two remedies, and they compose.</p>' +
      '<p><b><code>@import</code></b> references another file from inside CLAUDE.md, so you can compose a ' +
      'file from focused parts:</p>' +
      '<pre><code># CLAUDE.md — packages/api\n\n' +
      'This package owns the public REST surface.\n\n' +
      '@../../standards/error-handling.md\n' +
      '@../../standards/api-conventions.md\n' +
      '@./local-notes.md\n</code></pre>' +
      '<p>Mechanics worth knowing: <b>no space</b> between <code>@</code> and the path; relative and ' +
      'absolute paths both work; relative paths resolve against <b>the file containing the import</b>, not ' +
      'the working directory; and imports may nest to a maximum depth of <b>5</b>.</p>' +
      '<p>The guide\'s intended use is selective: each package\'s maintainer imports the standards files ' +
      'relevant to that package, rather than every package inheriting one monolith. The API package needs ' +
      'the API conventions; the CLI package does not.</p>' +

      '<p><b><code>.claude/rules/</code></b> is the other remedy — split the monolith into topic files:</p>' +
      '<pre><code>.claude/\n  CLAUDE.md              # short: what this repo is, how to build and test\n' +
      '  rules/\n    testing.md           # test conventions\n' +
      '    api-conventions.md   # request/response shapes, error envelopes\n' +
      '    deployment.md        # release process\n' +
      '    terraform.md         # infra conventions</code></pre>' +
      '<p>Each rule file can carry YAML frontmatter that scopes it by path glob, so it loads only when ' +
      'relevant — which is <a href="#/unit/3.3">3.3</a>, and the reason splitting beats importing when the ' +
      'topics map onto file patterns.</p>' +

      '<div class="callout rule"><span class="co-t">CLAUDE.md versus skills</span>' +
      '<p>A distinction the exam draws explicitly. <b>CLAUDE.md is always loaded</b> — put universal ' +
      'standards there, the things that should apply without anyone asking. <b>Skills are invoked on ' +
      'demand</b> — put task-specific workflows there. Writing a workflow into CLAUDE.md means paying for ' +
      'it in every session that has nothing to do with it; writing a universal standard into a skill means ' +
      'it applies only when somebody remembers to type the command.</p></div>',

      example:
      '<h3>Scenario 2 — diagnosing the new joiner</h3>' +
      '<p>Four developers, one monorepo. Three get correct behaviour; the newest does not. The ' +
      'investigation takes one command each:</p>' +
      '<pre><code># On an established developer\'s machine\n$ /memory\nLoaded memory files:\n' +
      '  ~/.claude/CLAUDE.md                    (user)      ← the convention is here\n' +
      '  /repo/.claude/CLAUDE.md                (project)\n' +
      '  /repo/packages/api/CLAUDE.md           (directory)\n\n' +
      '# On the new joiner\'s machine\n$ /memory\nLoaded memory files:\n' +
      '  /repo/.claude/CLAUDE.md                (project)\n' +
      '  /repo/packages/api/CLAUDE.md           (directory)\n' +
      '  — no user-level file —</code></pre>' +
      '<p>The convention was never in the repository. Move it:</p>' +
      '<pre><code># .claude/rules/api-conventions.md\n---\npaths: ["packages/api/**/*.ts"]\n---\n\n' +
      '# API conventions\n\n- Every handler returns the standard error envelope:\n' +
      '  { error: { code, message, details? } }\n' +
      '- Never throw raw exceptions across the HTTP boundary.\n' +
      '- Validate request bodies with the shared zod schemas in src/schemas/.</code></pre>' +
      '<p>Committed, it reaches all four developers on the next pull — and because it is path-scoped, it ' +
      'loads only when someone is editing API TypeScript, rather than occupying context during CLI ' +
      'work.</p>' +

      '<h3>Scenario 4 — breaking up a 500-line monolith</h3>' +
      '<p>One CLAUDE.md had accumulated build instructions, test conventions, API rules, Terraform rules, ' +
      'release process, and a section on a deprecated service. Every session loaded all of it.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Before</span>' +
      '<pre><code>CLAUDE.md   ~500 lines\n  build\n  testing\n  api\n  terraform\n  release\n  legacy-billing (dead)</code></pre>' +
      '<p>All loaded always. Nobody can review a change in context. Terraform rules occupy context while ' +
      'someone edits React.</p></div>' +
      '<div class="good"><span class="vs-h">After</span>' +
      '<pre><code>CLAUDE.md   ~40 lines\n  what this repo is\n  how to build and test\n\n.claude/rules/\n' +
      '  testing.md      paths: **/*.test.*\n  api.md          paths: packages/api/**\n' +
      '  terraform.md    paths: terraform/**\n  release.md      (unscoped)</code></pre>' +
      '<p>Each topic is reviewable on its own, and path-scoped rules load only when they apply.</p></div></div>' +
      '<p>The dead section was simply deleted — worth saying, because stale instructions are worse than ' +
      'absent ones. An agent following a rule about a decommissioned service produces confidently wrong ' +
      'work.</p>',

      mistakes: [
        { t: 'Putting a team convention in user-level CLAUDE.md',
          d: 'It is never distributed by version control, producing the classic "works for everyone but ' +
             'the newest developer" bug. Team standards belong in project scope.' },
        { t: 'Reaching for <code>/compact</code> to diagnose inconsistent behaviour',
          d: '<code>/compact</code> compresses conversation context. <code>/memory</code> is the ' +
             'configuration diagnostic — it shows which memory files are actually loaded.' },
        { t: 'Using a directory-level CLAUDE.md for a cross-cutting convention',
          d: 'Directory files are bound to their subtree. Test files scattered across the repository need ' +
             '<code>.claude/rules/</code> with a glob.' },
        { t: 'Letting CLAUDE.md grow into a monolith',
          d: 'It loads in full every session and becomes unreviewable. Split into ' +
             '<code>.claude/rules/</code> topic files, or compose with <code>@import</code>.' },
        { t: 'Writing <code>@ ./path.md</code> with a space',
          d: 'The <code>@</code> must sit immediately before the path.' },
        { t: 'Assuming import paths resolve from the working directory',
          d: 'They resolve relative to the file containing the import.' },
        { t: 'Nesting imports more than five deep',
          d: 'Five is the maximum depth.' },
        { t: 'Putting a task-specific workflow in CLAUDE.md',
          d: 'CLAUDE.md is always loaded; a workflow you need occasionally belongs in a skill ' +
             '(<a href="#/unit/3.2">3.2</a>).' },
        { t: 'Leaving stale instructions in place',
          d: 'A rule about a decommissioned service is worse than no rule — the agent will follow it ' +
             'confidently.' }
      ],

      exam:
      '<p>Expect the new-joiner item: identical checkout, divergent behaviour, and the answer is that the ' +
      'rule sits in user scope and must move to project scope. Often paired with a second item naming ' +
      '<code>/memory</code> as the diagnostic. Expect an organisation item — how to handle a 500-line ' +
      'CLAUDE.md — answered by splitting into <code>.claude/rules/</code> with path scoping. And know the ' +
      '<code>@import</code> mechanics as recall: no space, relative to the importing file, max depth ' +
      '5.</p>',

      questions: [
        {
          id: 'q3.1.1', scn: 2,
          stem: '<p>Three developers on your team observe Claude consistently applying a particular error ' +
            'handling convention. A developer who joined last week, working from the same commit, reports ' +
            'that Claude ignores it. All four have pulled the latest code. What is the most likely ' +
            'explanation?</p>',
          opts: [
            'The convention is in the three original developers\' user-level <code>~/.claude/CLAUDE.md</code>, which is not distributed by version control.',
            'The new developer\'s Claude Code installation is a version behind and does not yet support the configuration format.',
            'The convention is in a directory-level CLAUDE.md that the new developer has not yet opened a file inside.',
            'The three original developers have longer sessions, so the convention has been reinforced in context whereas the new developer starts fresh.'
          ],
          ans: [0],
          why: 'User-level configuration applies only to that user on that machine and is never shared ' +
            'through git. Instructions added individually months ago produce exactly this signature: ' +
            'everyone who set them up sees correct behaviour, and anyone new does not. The fix is to move ' +
            'the convention to project scope so a pull delivers it.',
          wrong: [
            '',
            'A version difference would typically surface as broader breakage, not as one convention ' +
            'silently missing for one person. The stem also emphasises that all four have the same code, ' +
            'pointing at configuration scope rather than tooling.',
            'This has the mechanism backwards: a directory-level file loads when working within that ' +
            'subtree and would apply equally to all four developers, since it is committed.',
            'Session length does not create or destroy configuration. Loaded memory files apply from the ' +
            'start of a session; there is no reinforcement effect to accumulate.'
          ]
        },
        {
          id: 'q3.1.2', scn: 2,
          stem: '<p>Team members report inconsistent Claude behaviour across their machines and you need ' +
            'to determine which configuration files are actually in effect for a given session. Which ' +
            'command gives you that?</p>',
          opts: [
            '<code>/memory</code>, which shows the memory files loaded in the current session.',
            '<code>/compact</code>, which reports and compresses what is currently occupying context.',
            '<code>/config</code>, which prints the resolved configuration hierarchy including all CLAUDE.md files.',
            '<code>--resume</code> with the session name, which replays the session showing which files were loaded.'
          ],
          ans: [0],
          why: '<code>/memory</code> is the configuration diagnostic: it shows which CLAUDE.md files are ' +
            'loaded and lets you edit them. Running it on two machines makes a user-level-versus-project ' +
            'scope difference immediately visible.',
          wrong: [
            '',
            '<code>/compact</code> is a context tool — it compresses conversation history. It has nothing ' +
            'to do with which configuration files loaded, and it is the standing distractor for this ' +
            'item.',
            'Settings-oriented commands do not answer the memory-file question, which is what ' +
            '<code>/memory</code> exists for.',
            '<code>--resume</code> continues a prior session. It is session management ' +
            '(<a href="#/unit/1.7">1.7</a>), not a configuration diagnostic.'
          ]
        },
        {
          id: 'q3.1.3', scn: 4,
          stem: '<p>Your repository\'s root CLAUDE.md has grown to roughly 500 lines covering build steps, ' +
            'testing conventions, API rules, Terraform conventions and the release process. It is loaded ' +
            'in full every session and changes to it are rarely reviewed carefully. What is the best ' +
            'reorganisation?</p>',
          opts: [
            'Split it into topic-specific files under <code>.claude/rules/</code>, using YAML frontmatter path globs so each rule loads only when relevant files are being edited.',
            'Move the whole file to user-level <code>~/.claude/CLAUDE.md</code> so it no longer bloats the repository.',
            'Keep the single file but reorganise it under clear headings so Claude can find the relevant section.',
            'Split it into separate skills in <code>.claude/skills/</code>, one per topic, invoked when needed.'
          ],
          ans: [0],
          why: 'Topic files under <code>.claude/rules/</code> are individually reviewable, and glob ' +
            'frontmatter means Terraform conventions do not occupy context while somebody edits React. ' +
            'This is the guide\'s stated approach for a monolithic CLAUDE.md.',
          wrong: [
            '',
            'Moving it to user scope removes it from every teammate — turning an organisation problem into ' +
            'the distribution bug from the previous question.',
            'Headings help a human reader but change nothing about loading: all 500 lines still enter ' +
            'context every session, and the file remains one unreviewable blob.',
            'Skills are invoked on demand. Coding standards must apply whether or not someone remembers to ' +
            'invoke them — that is the CLAUDE.md-versus-skills distinction.'
          ]
        },
        {
          id: 'q3.1.4', scn: 4,
          stem: '<p>Which statements about the <code>@import</code> syntax in CLAUDE.md are correct?</p>' +
            '',
          opts: [
            'A relative import path resolves relative to the file containing the import, not to the current working directory.',
            'Imports may nest to a maximum depth of five levels.',
            'There must be a space between <code>@</code> and the path for the import to be recognised.',
            'Imports may only reference files inside the <code>.claude/</code> directory.'
          ],
          ans: [0, 1],
          why: 'Relative resolution against the importing file is what makes per-package CLAUDE.md files ' +
            'able to reach shared standards with stable paths, and five levels is the documented maximum ' +
            'nesting depth.',
          wrong: [
            '', '',
            'Inverted: the <code>@</code> sits immediately before the path with no space.',
            'There is no such restriction — both relative and absolute paths work, which is precisely how ' +
            'a package file imports from a shared <code>standards/</code> directory elsewhere in the ' +
            'repository.'
          ]
        },
        {
          id: 'q3.1.5', scn: 2,
          stem: '<p>Your monorepo has a <code>packages/api</code> directory with conventions that apply ' +
            'only to that package, and a set of shared standards documents kept in ' +
            '<code>standards/</code> at the repository root. What is the cleanest configuration?</p>',
          opts: [
            'A <code>CLAUDE.md</code> inside <code>packages/api</code> that states the package-local conventions and uses <code>@import</code> to pull in the relevant shared standards.',
            'A single root CLAUDE.md containing the API conventions under a heading, relying on Claude to apply them only when working in that package.',
            'A user-level CLAUDE.md for each API maintainer containing the package conventions, since they are the only ones who need them.',
            'Copy the relevant shared standards into <code>packages/api/CLAUDE.md</code> so the package is self-contained and has no external dependencies.'
          ],
          ans: [0],
          why: 'A directory-level CLAUDE.md is exactly right for conventions bound to one subtree, and ' +
            '<code>@import</code> lets the maintainer selectively include the shared standards that apply ' +
            'to that package without duplicating them — the guide\'s stated use for selective imports.',
          wrong: [
            '',
            'Puts package-specific rules into always-loaded global context and relies on the model ' +
            'inferring applicability. Directory scoping expresses that boundary explicitly.',
            'User scope means the conventions vanish for anyone new to the package, and they are not ' +
            'reviewable as part of the codebase.',
            'Duplication guarantees drift: the copies stop matching the originals and nobody notices ' +
            'which version is authoritative. That is the problem <code>@import</code> solves.'
          ]
        }
      ]
    },

    /* ================================================================== 3.2 */
    {
      id: '3.2',
      short: 'Commands & skills',
      title: 'Create and configure custom slash commands and skills',
      scn: [2, 4],
      tldr: 'Same scope rule as CLAUDE.md: <code>.claude/commands/</code> and <code>.claude/skills/</code> ' +
        'are project-scoped and shared through version control; <code>~/.claude/commands/</code> and ' +
        '<code>~/.claude/skills/</code> are personal. Skills are defined by a <code>SKILL.md</code> whose ' +
        'frontmatter offers three options worth memorising: <b><code>context: fork</code></b> runs the ' +
        'skill in an isolated subagent so verbose output stays out of the main conversation, ' +
        '<b><code>allowed-tools</code></b> restricts what it can do, and <b><code>argument-hint</code></b> ' +
        'prompts for parameters when invoked bare.',

      concept:
      '<h3>Scope, again</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Location</th><th>Shared?</th><th>Use for</th></tr></thead><tbody>' +
      '<tr><td><code>.claude/commands/</code></td><td>Yes — committed</td><td>Team slash commands ' +
      'everyone should have on clone</td></tr>' +
      '<tr><td><code>.claude/skills/</code></td><td>Yes — committed</td><td>Team skills; the current ' +
      'format, with frontmatter</td></tr>' +
      '<tr><td><code>~/.claude/commands/</code></td><td>No</td><td>Your own commands</td></tr>' +
      '<tr><td><code>~/.claude/skills/</code></td><td>No</td><td>Personal variants — give them a ' +
      '<b>different name</b> so they do not collide with the team\'s</td></tr>' +
      '</tbody></table></div>' +
      '<p>Both directories produce <code>/name</code> invocations. <code>.claude/skills/</code> with a ' +
      '<code>SKILL.md</code> is the richer format, because only it takes frontmatter.</p>' +

      '<div class="callout rule"><span class="co-t">Customising a team command without disturbing anyone</span>' +
      '<p>You want your own variant of the team\'s <code>/commit</code>. Do <b>not</b> edit ' +
      '<code>.claude/commands/commit.md</code> — that is committed, and your preference lands on every ' +
      'teammate. Create a personal skill in <code>~/.claude/skills/</code> <b>under a different name</b>, ' +
      'say <code>/commit-mine</code>. You get your workflow, the team keeps theirs, and nothing ' +
      'collides.</p></div>' +

      '<h3>The three frontmatter options</h3>' +

      '<h4><code>context: fork</code> — isolate verbose output</h4>' +
      '<p>The problem: an <code>/analyze-codebase</code> skill explores broadly and emits 8,000 tokens of ' +
      'file listings, greps and intermediate reasoning. All of it lands in your main conversation, where it ' +
      'crowds out the work you were actually doing.</p>' +
      '<p><code>context: fork</code> runs the skill in an <b>isolated subagent context</b>. The exploration ' +
      'happens there, and only the summary returns to the main session.</p>' +

      fig({
        vb: '0 0 700 220',
        caption: '<code>context: fork</code> moves a verbose skill into an isolated subagent; only its ' +
          'summary returns to the main conversation.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Without context: fork</text>' +
          '<rect x="24" y="28" width="300" height="66" rx="6" class="boxBad"/>' +
          '<text x="174" y="50" text-anchor="middle" font-size="10.5">main conversation</text>' +
          '<text x="174" y="68" text-anchor="middle" font-size="10" class="dim">+ 8,000 tokens of file listings,</text>' +
          '<text x="174" y="83" text-anchor="middle" font-size="10" class="dim">greps and intermediate reasoning</text>' +

          '<text x="360" y="18" font-size="11" font-weight="600">With context: fork</text>' +
          '<rect x="360" y="28" width="140" height="66" rx="6" class="box"/>' +
          '<text x="430" y="50" text-anchor="middle" font-size="10.5" font-weight="600">forked subagent</text>' +
          '<text x="430" y="68" text-anchor="middle" font-size="10" class="dim">8,000 tokens of</text>' +
          '<text x="430" y="83" text-anchor="middle" font-size="10" class="dim">exploration live here</text>' +
          '<path class="arrow" d="M500 61 L546 61" marker-end="url(#ah)"/>' +
          '<text x="523" y="52" text-anchor="middle" font-size="9" class="dim">summary</text>' +
          '<rect x="546" y="28" width="130" height="66" rx="6" class="boxOk"/>' +
          '<text x="611" y="55" text-anchor="middle" font-size="10.5">main conversation</text>' +
          '<text x="611" y="73" text-anchor="middle" font-size="10" class="dim">stays clean</text>' +

          '<line x1="24" y1="112" x2="676" y2="112" class="stroke dashed"/>' +
          '<text x="24" y="136" font-size="11" font-weight="600">Fork when the skill produces…</text>' +
          '<rect x="24" y="146" width="212" height="34" rx="5" class="boxA"/>' +
          '<text x="130" y="167" text-anchor="middle" font-size="10.5">verbose output (codebase analysis)</text>' +
          '<rect x="248" y="146" width="212" height="34" rx="5" class="boxA"/>' +
          '<text x="354" y="167" text-anchor="middle" font-size="10.5">exploratory context (brainstorming)</text>' +
          '<rect x="472" y="146" width="204" height="34" rx="5" class="box"/>' +
          '<text x="574" y="167" text-anchor="middle" font-size="10.5">but not: short, targeted skills</text>' +
          '<text x="24" y="200" font-size="10.5" class="dim">The point is that the detail is not needed downstream — only the conclusion is.</text>'
      }) +

      '<h4><code>allowed-tools</code> — restrict what the skill can do</h4>' +
      '<p>A skill inherits tool access, and a skill with <code>Bash</code> can run anything. If a ' +
      '<code>/scaffold-component</code> skill only ever needs to write files, granting it Bash is ' +
      'unnecessary risk — and the guide\'s example is exactly this: developers occasionally triggering ' +
      'destructive commands by accident. Restrict it:</p>' +
      '<pre><code>---\nname: scaffold-component\ndescription: Create a new React component with tests and stories\n' +
      'allowed-tools: Read, Write, Glob\nargument-hint: <ComponentName>\n---\n\n' +
      'Create a component named $1 following the conventions in\n@../rules/react.md …</code></pre>' +
      '<p>This is the least-privilege principle from <a href="#/unit/2.3">2.3</a>, applied to skills — and ' +
      'note that it is a <b>structural</b> restriction, not an instruction asking the skill to be careful.</p>' +

      '<h4><code>argument-hint</code> — prompt for missing parameters</h4>' +
      '<p>If a skill needs a parameter and is invoked bare, <code>argument-hint</code> prompts the ' +
      'developer for it instead of the skill proceeding on a guess. Small feature, and the reason it ' +
      'matters: a skill that silently assumes a default does the wrong work convincingly.</p>' +

      '<h3>Skill or CLAUDE.md?</h3>' +
      '<div class="vs">' +
      '<div><span class="vs-h">CLAUDE.md — always loaded</span><p>Universal standards that must apply ' +
      'whether or not anyone thinks to ask: naming conventions, the error envelope, what the test ' +
      'suite is. Cost: context in every session.</p></div>' +
      '<div><span class="vs-h">Skill — invoked on demand</span><p>Task-specific workflows you run ' +
      'sometimes: <code>/release-notes</code>, <code>/analyze-codebase</code>, ' +
      '<code>/scaffold-component</code>. Cost: nothing until invoked.</p></div></div>' +
      '<p>Get this backwards and you either pay for a workflow in every unrelated session, or you have ' +
      'coding standards that only apply when somebody remembers a command.</p>',

      example:
      '<h3>Scenario 2 — a team review command, and a personal variant</h3>' +
      '<p>The team wants <code>/review</code> available to everyone on clone. One developer wants their ' +
      'own version that also checks for missing telemetry.</p>' +
      '<pre><code>.claude/commands/review.md        ← committed: everyone gets /review\n</code></pre>' +
      '<pre><code>~/.claude/skills/review-telemetry/SKILL.md\n---\nname: review-telemetry\n' +
      'description: Team review checklist plus telemetry coverage checks\nargument-hint: [path]\n---\n' +
      '…</code></pre>' +
      '<p>The personal version has a <b>different name</b>, so <code>/review</code> still means the team ' +
      'checklist for everyone, including its author. Editing the committed file instead would have imposed ' +
      'one person\'s telemetry preference on the whole team.</p>' +

      '<h3>Scenario 2 — taming a verbose analysis skill</h3>' +
      '<p><code>/analyze-codebase</code> is genuinely useful and unusable: every invocation dumps thousands ' +
      'of tokens into the conversation, and by the third call the session has lost track of the original ' +
      'task.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">Before</span>' +
      '<pre><code>---\nname: analyze-codebase\ndescription: Map module structure\n  and dependencies\n---</code></pre>' +
      '<p>8,000 tokens of Glob output, file listings and reasoning arrive in the main context. Three ' +
      'invocations and the session is degraded.</p></div>' +
      '<div class="good"><span class="vs-h">After</span>' +
      '<pre><code>---\nname: analyze-codebase\ndescription: Map module structure\n  and dependencies\n' +
      'context: fork\nallowed-tools: Read, Grep, Glob\nargument-hint: <directory>\n---</code></pre>' +
      '<p>Exploration runs in a forked subagent and returns a summary. <code>allowed-tools</code> also ' +
      'guarantees a read-only analysis — it cannot modify anything.</p></div></div>' +
      '<p>Notice the <code>allowed-tools</code> line doing a second job: an analysis skill should never ' +
      'write, and now it structurally cannot. Two frontmatter lines, two classes of problem.</p>',

      mistakes: [
        { t: 'Editing a committed team command to suit yourself',
          d: 'Your preference lands on every teammate at the next pull. Create a personal variant in ' +
             '<code>~/.claude/skills/</code> under a different name.' },
        { t: 'Giving a personal variant the same name as the team command',
          d: 'Creates a collision and ambiguity about which one runs. Use a distinct name.' },
        { t: 'Leaving a verbose skill unforked',
          d: 'Thousands of tokens of intermediate output crowd the main conversation. ' +
             '<code>context: fork</code> keeps the detail isolated and returns the summary.' },
        { t: 'Forking every skill by reflex',
          d: 'Fork is for skills whose <em>detail</em> is not needed downstream. A short targeted skill ' +
             'gains nothing and loses the shared context it may need.' },
        { t: 'Granting Bash to a skill that only writes files',
          d: 'Unnecessary blast radius. <code>allowed-tools</code> restricts it structurally, rather than ' +
             'asking the skill to be careful.' },
        { t: 'Putting team skills in user scope',
          d: 'They are not distributed. Project scope is what reaches teammates.' },
        { t: 'Putting always-on standards in a skill',
          d: 'Skills are invoked on demand, so the standard applies only when someone remembers. ' +
             'Universal standards belong in CLAUDE.md.' },
        { t: 'Omitting <code>argument-hint</code> on a skill that needs a parameter',
          d: 'The skill proceeds on a guess and does the wrong work convincingly.' }
      ],

      exam:
      '<p>Official sample question 4 is here: where does a team-wide <code>/review</code> command go? ' +
      'Answer: <code>.claude/commands/</code> in the project repository. Note the distractors — CLAUDE.md ' +
      '(project context, not command definitions) and a <code>.claude/config.json</code> commands array ' +
      '(a mechanism that does not exist; invented configuration is a recurring distractor style). Expect ' +
      'the <code>context: fork</code> item for a verbose skill polluting the conversation, and an ' +
      '<code>allowed-tools</code> item for a skill with Bash access that occasionally does damage.</p>',

      questions: [
        {
          id: 'q3.2.1', scn: 2, official: true,
          stem: '<p>You want to create a custom <code>/review</code> slash command that runs your team\'s ' +
            'standard code review checklist. This command should be available to every developer when ' +
            'they clone or pull the repository. Where should you create this command file?</p>',
          opts: [
            'In the <code>.claude/commands/</code> directory in the project repository',
            'In <code>~/.claude/commands/</code> in each developer\'s home directory',
            'In the <code>CLAUDE.md</code> file at the project root',
            'In a <code>.claude/config.json</code> file with a <code>commands</code> array'
          ],
          ans: [0],
          why: 'Project-scoped custom slash commands live in <code>.claude/commands/</code> within the ' +
            'repository. These are version-controlled and automatically available to every developer who ' +
            'clones or pulls, which is exactly the stated requirement.',
          wrong: [
            '',
            '<code>~/.claude/commands/</code> is for personal commands that are not shared through ' +
            'version control — each developer would have to create the file themselves, and a new joiner ' +
            'would get nothing.',
            'CLAUDE.md carries project instructions and context, not command definitions. It is the right ' +
            'place for standards that should always apply, not for an invokable workflow.',
            'This describes a configuration mechanism that does not exist in Claude Code. Plausible-looking ' +
            'invented configuration is a recurring distractor pattern — commands are files in a ' +
            'directory.'
          ]
        },
        {
          id: 'q3.2.2', scn: 2,
          stem: '<p>Your <code>/analyze-codebase</code> skill produces roughly 8,000 tokens of file ' +
            'listings, grep results and intermediate reasoning. Developers report that after two or three ' +
            'invocations the main conversation has lost track of the original task. What frontmatter ' +
            'change addresses this?</p>',
          opts: [
            'Add <code>context: fork</code>, so the skill runs in an isolated subagent context and only its summary returns to the main conversation.',
            'Add <code>allowed-tools: Read, Grep, Glob</code>, restricting the skill so it produces less output.',
            'Add an instruction to the skill body telling it to summarise its findings concisely before responding.',
            'Add <code>context: compact</code>, so the skill compresses the conversation after it completes.'
          ],
          ans: [0],
          why: '<code>context: fork</code> runs the skill in an isolated subagent, so the verbose ' +
            'exploration lives there and only the summary comes back. That is precisely its stated ' +
            'purpose: preventing skill output from polluting the main conversation.',
          wrong: [
            '',
            'Restricting tools limits what the skill can <em>do</em>, not how much output it generates. A ' +
            'read-only analysis can still emit 8,000 tokens of listings — and would, since analysis is ' +
            'what it is for.',
            'A probabilistic remedy for a structural problem, and it does not help: the intermediate ' +
            'exploration still enters the main context before any summary is written.',
            'Not a real frontmatter option. <code>/compact</code> is a separate context command, and ' +
            'compacting after the fact still means the tokens were spent and the detail passed through.'
          ]
        },
        {
          id: 'q3.2.3', scn: 2,
          stem: '<p>A skill in <code>.claude/skills/</code> has full tool access including Bash. On two ' +
            'occasions developers invoking it have accidentally triggered destructive shell commands. The ' +
            'skill\'s actual job is to generate boilerplate files. What is the correct fix?</p>',
          opts: [
            'Add an <code>allowed-tools</code> frontmatter entry restricting the skill to file read and write operations.',
            'Add a warning to the skill body instructing it never to run destructive commands.',
            'Move the skill to <code>~/.claude/skills/</code> so only developers who deliberately install it can invoke it.',
            'Add <code>context: fork</code> so that any damage is contained within the isolated subagent context.'
          ],
          ans: [0],
          why: '<code>allowed-tools</code> restricts tool access during skill execution. A boilerplate ' +
            'generator needs file writes, not shell access, so removing Bash makes the failure mode ' +
            'structurally impossible — least privilege applied to skills, and the guide\'s stated use for ' +
            'this option.',
          wrong: [
            '',
            'Probabilistic where a structural constraint exists. The capability remains, so the failure ' +
            'mode remains live.',
            'This restricts <em>who</em> has the skill, not what it can do — and it removes a useful team ' +
            'skill to work around a permissions problem.',
            'A dangerous misunderstanding: a forked context isolates the <em>conversation</em>, not the ' +
            'filesystem. A destructive Bash command in a forked subagent still deletes real files.'
          ]
        },
        {
          id: 'q3.2.4', scn: 2,
          stem: '<p>A developer wants to customise the team\'s shared <code>/commit</code> skill for their ' +
            'own workflow — adding an issue-key prefix and a different message template — without ' +
            'affecting teammates. What should they do?</p>',
          opts: [
            'Create a personal skill in <code>~/.claude/skills/</code> under a different name, leaving the team\'s <code>/commit</code> untouched.',
            'Edit <code>.claude/skills/commit/SKILL.md</code> locally and add it to <code>.gitignore</code> so the change is not committed.',
            'Create a personal skill in <code>~/.claude/skills/</code> using the same name <code>commit</code>, so it takes precedence over the team version for them only.',
            'Add their variant to <code>.claude/skills/</code> as <code>commit-personal</code> and ask teammates not to use it.'
          ],
          ans: [0],
          why: 'User-scoped skills are personal by construction, and using a different name avoids any ' +
            'collision — so <code>/commit</code> continues to mean the team checklist for everybody, ' +
            'including this developer when they want it. This is the guide\'s stated approach.',
          wrong: [
            '',
            'Gitignoring a tracked file does not stop it being tracked, and modifying a committed shared ' +
            'file locally leaves a permanently dirty tree where real changes get lost — the same ' +
            'anti-pattern as the placeholder token in <a href="#/unit/2.4">2.4</a>.',
            'Same-name shadowing creates ambiguity about which skill runs and makes the developer\'s ' +
            'environment quietly different from everyone else\'s, which is exactly the class of bug ' +
            'that <code>/memory</code> exists to diagnose.',
            'Committing a personal preference to the shared repository imposes clutter on the team and ' +
            'relies on a social agreement to ignore it.'
          ]
        },
        {
          id: 'q3.2.5', scn: 4,
          stem: '<p>Your team has two things to configure: (i) a naming convention that must apply to all ' +
            'generated code without anyone asking for it, and (ii) a release-notes workflow run roughly ' +
            'once a fortnight. Where does each belong?</p>',
          opts: [
            '(i) project CLAUDE.md, because it is always loaded; (ii) a project skill, because it is invoked on demand.',
            '(i) a project skill, so it can be versioned and reviewed independently; (ii) project CLAUDE.md, so the workflow is always available.',
            'Both in project CLAUDE.md, so that the team\'s configuration lives in one reviewable place.',
            'Both as project skills, so that neither consumes context unless it is actually needed.'
          ],
          ans: [0],
          why: 'The distinction is always-loaded versus on-demand. A convention that must apply ' +
            'unprompted belongs in CLAUDE.md; an occasional workflow belongs in a skill, where it costs ' +
            'nothing until invoked.',
          wrong: [
            '',
            'Exactly inverted. A naming convention in a skill applies only when someone remembers to run ' +
            'it, and a fortnightly workflow in CLAUDE.md occupies context in every unrelated session.',
            'Putting the release workflow in CLAUDE.md pays for it in every session — the monolith problem ' +
            'from <a href="#/unit/3.1">3.1</a>.',
            'Putting the naming convention in a skill means generated code follows it only by accident. ' +
            'Standards must not depend on invocation.'
          ]
        }
      ]
    },

    /* ================================================================== 3.3 */
    {
      id: '3.3',
      short: 'Path-scoped rules',
      title: 'Apply path-specific rules for conditional convention loading',
      scn: [2, 4],
      tldr: 'Files in <code>.claude/rules/</code> can carry YAML frontmatter with a <code>paths</code> ' +
        'field of glob patterns. The rule then loads <b>only when a matching file is being edited</b>, ' +
        'which cuts irrelevant context and token cost. The decisive advantage over a directory-level ' +
        'CLAUDE.md: a glob such as <code>**/*.test.tsx</code> reaches files <b>scattered across the whole ' +
        'tree</b>, whereas a directory file is bound to its own subtree.',

      concept:
      '<h3>The mechanism</h3>' +
      '<pre><code># .claude/rules/testing.md\n---\npaths: ["**/*.test.tsx", "**/*.test.ts", "**/*.spec.ts"]\n---\n\n' +
      '# Testing conventions\n\n- One behaviour per test; no multi-assert grab bags.\n' +
      '- Use the shared fixtures in test/fixtures/ — do not hand-roll factories.\n' +
      '- Mock at the module boundary, never deeper.\n' +
      '- Name tests "it(\'returns X when Y\')", not "it(\'works\')".</code></pre>' +
      '<p>Editing <code>src/components/Button.test.tsx</code> loads this rule. Editing ' +
      '<code>src/components/Button.tsx</code> does not. Two benefits: the model gets the conventions ' +
      'exactly when they are relevant, and everything else in the repository stops paying for them.</p>' +

      '<h3>Why a glob beats a directory file</h3>' +
      '<p>This is the whole point of the task statement, and the exam tests it directly.</p>' +
      fig({
        vb: '0 0 700 260',
        caption: 'Test files sit beside the code they test, so they are spread across the tree. A ' +
          'directory-level CLAUDE.md cannot express "all test files"; a glob can.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">The repository shape</text>' +
          '<text x="30" y="40" font-size="10" class="mono">src/components/Button.tsx</text>' +
          '<text x="30" y="57" font-size="10" class="mono">src/components/Button.test.tsx</text>' +
          '<rect x="24" y="46" width="230" height="15" rx="3" style="fill:var(--accent-soft);stroke:none" opacity="0.55"/>' +
          '<text x="30" y="74" font-size="10" class="mono">src/api/handlers/orders.ts</text>' +
          '<text x="30" y="91" font-size="10" class="mono">src/api/handlers/orders.test.ts</text>' +
          '<rect x="24" y="80" width="230" height="15" rx="3" style="fill:var(--accent-soft);stroke:none" opacity="0.55"/>' +
          '<text x="30" y="108" font-size="10" class="mono">src/lib/tax/calculate.ts</text>' +
          '<text x="30" y="125" font-size="10" class="mono">src/lib/tax/calculate.test.ts</text>' +
          '<rect x="24" y="114" width="230" height="15" rx="3" style="fill:var(--accent-soft);stroke:none" opacity="0.55"/>' +
          '<text x="30" y="148" font-size="10" class="dim">…test files live in every directory</text>' +

          '<rect x="300" y="30" width="376" height="76" rx="6" class="boxBad"/>' +
          '<text x="316" y="52" font-size="11" font-weight="600">Directory-level CLAUDE.md</text>' +
          '<text x="316" y="70" font-size="10">Bound to one directory and its descendants. To cover</text>' +
          '<text x="316" y="85" font-size="10">every test file you would need a CLAUDE.md in every</text>' +
          '<text x="316" y="99" font-size="10">directory — duplicated, and drifting within a month.</text>' +

          '<rect x="300" y="118" width="376" height="76" rx="6" class="boxOk"/>' +
          '<text x="316" y="140" font-size="11" font-weight="600">.claude/rules/ with a glob</text>' +
          '<text x="316" y="158" font-size="10" class="mono">paths: ["**/*.test.tsx", "**/*.test.ts"]</text>' +
          '<text x="316" y="176" font-size="10">One file. Matches by pattern regardless of location,</text>' +
          '<text x="316" y="190" font-size="10">and loads only when a test file is being edited.</text>' +

          '<rect x="24" y="214" width="652" height="36" rx="5" class="boxA"/>' +
          '<text x="40" y="237" font-size="10.5" font-weight="600">Decision rule: convention follows a file <tspan font-style="italic">pattern</tspan> → rules/ with globs.  Convention follows a <tspan font-style="italic">location</tspan> → directory CLAUDE.md.</text>'
      }) +

      '<h3>The full decision table</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Situation</th><th>Mechanism</th></tr></thead><tbody>' +
      '<tr><td>Applies to every file in the repository</td><td>Root project <code>CLAUDE.md</code></td></tr>' +
      '<tr><td>Applies to one package or subtree</td><td><code>CLAUDE.md</code> in that directory</td></tr>' +
      '<tr><td>Applies to files matched by a pattern, wherever they live</td><td><code>.claude/rules/</code> ' +
      'with <code>paths</code> globs</td></tr>' +
      '<tr><td>Applies to one infrastructure tree</td><td>Either — a glob such as ' +
      '<code>terraform/**/*</code> reads well and keeps rules together</td></tr>' +
      '<tr><td>Applies only to you</td><td><code>~/.claude/CLAUDE.md</code></td></tr>' +
      '</tbody></table></div>' +

      '<h3>Why not a monolith with headings?</h3>' +
      '<p>A frequent distractor: consolidate everything into the root CLAUDE.md under clear headings — ' +
      '"React components", "API handlers", "Tests" — and let the model work out which section applies.</p>' +
      '<p>Two problems. It relies on <b>inference</b> rather than explicit matching, so the model may apply ' +
      'React conventions while editing an API handler, or miss the test conventions entirely because the ' +
      'heading did not seem to match. And it loads everything always, so a React edit pays for the ' +
      'Terraform rules. Path scoping is deterministic and free when it does not apply.</p>' +

      '<div class="callout trap"><span class="co-t">Skills are not the answer here either</span>' +
      '<p>Another distractor: put each code type\'s conventions into a skill. Skills require ' +
      '<b>invocation</b>. The requirement in these questions is almost always that conventions apply ' +
      '<em>automatically</em> based on which file is being edited — and that is exactly what path-scoped ' +
      'rules do and skills do not.</p></div>' +

      '<h3>Writing useful globs</h3>' +
      '<pre><code>paths: ["**/*.test.tsx", "**/*.test.ts"]   # by file type, anywhere\n' +
      'paths: ["terraform/**/*"]                  # one infrastructure tree\n' +
      'paths: ["packages/*/src/api/**/*.ts"]      # API code in any package\n' +
      'paths: ["**/migrations/*.sql"]             # a directory name at any depth\n' +
      'paths: ["**/*.stories.tsx"]                # Storybook files wherever they are</code></pre>' +
      '<p><code>**</code> crosses directory boundaries, <code>*</code> matches within a single segment. ' +
      'The pattern most worth remembering is <code>**/*.test.tsx</code>, because it is the one the exam ' +
      'uses.</p>',

      example:
      '<h3>Scenario 2 — three conventions, three mechanisms</h3>' +
      '<p>A codebase has React components in functional style with hooks, API handlers using async/await ' +
      'with a specific error envelope, and database models following a repository pattern. Test files sit ' +
      'beside the code they test throughout the tree, and all tests must follow the same conventions ' +
      'regardless of location.</p>' +
      '<pre><code>.claude/\n  CLAUDE.md                  # short: repo overview, build, test commands\n' +
      '  rules/\n    react.md       paths: ["**/*.tsx", "!**/*.test.tsx"]\n' +
      '    api.md         paths: ["src/api/**/*.ts"]\n' +
      '    models.md      paths: ["src/models/**/*.ts"]\n' +
      '    testing.md     paths: ["**/*.test.ts", "**/*.test.tsx"]   ← the key one</code></pre>' +
      '<p>The testing rule is the one that could not be done any other way. Because test files are ' +
      'scattered, no single directory-level CLAUDE.md reaches them, and putting a CLAUDE.md in every ' +
      'directory would mean maintaining a dozen copies of the same conventions — which would drift.</p>' +
      '<p>Editing <code>src/api/handlers/orders.ts</code> loads <code>api.md</code> only. Editing ' +
      '<code>src/api/handlers/orders.test.ts</code> loads <code>testing.md</code>. Editing ' +
      '<code>src/components/Button.tsx</code> loads <code>react.md</code>. Nothing loads what it does not ' +
      'need.</p>' +

      '<h3>Scenario 4 — scoping infrastructure rules</h3>' +
      '<pre><code># .claude/rules/terraform.md\n---\npaths: ["terraform/**/*", "**/*.tf", "**/*.tfvars"]\n---\n\n' +
      '# Terraform conventions\n\n- Every resource carries the standard tag block (see modules/tags).\n' +
      '- No inline credentials — reference the secrets module.\n' +
      '- Always target a workspace explicitly; never rely on the default.\n' +
      '- Modules are versioned by git tag, never by branch.</code></pre>' +
      '<p>Here a directory-level <code>terraform/CLAUDE.md</code> would also work, since the code is ' +
      'genuinely in one tree. The glob is still preferable for a mundane reason: it keeps every convention ' +
      'in one reviewable place, and it also catches stray <code>.tf</code> files outside the main ' +
      'directory.</p>',

      mistakes: [
        { t: 'Using a directory CLAUDE.md for a cross-cutting file type',
          d: 'Directory files are bound to their subtree. Test files spread across the repository need a ' +
             'glob.' },
        { t: 'Consolidating into one CLAUDE.md with headings',
          d: 'Relies on the model inferring which section applies, and loads everything always. Path ' +
             'scoping matches explicitly and costs nothing when it does not apply.' },
        { t: 'Using skills for automatic conventions',
          d: 'Skills require invocation. "Automatically applies based on the file being edited" is the ' +
             'definition of a path-scoped rule.' },
        { t: 'Writing globs that are too broad',
          d: '<code>paths: ["**/*"]</code> is just an unscoped rule with extra steps. Scope to the files ' +
             'the convention genuinely governs.' },
        { t: 'Forgetting that a component glob also matches its tests',
          d: '<code>**/*.tsx</code> matches <code>Button.test.tsx</code> too. Exclude test files if the ' +
             'component rules should not apply to them.' },
        { t: 'Duplicating the same conventions in many directory files',
          d: 'Guaranteed drift. One glob-scoped rule replaces a dozen copies.' },
        { t: 'Putting path-scoped rules in user scope',
          d: 'They stop reaching teammates. <code>.claude/rules/</code> is project-scoped and ' +
             'committed.' }
      ],

      exam:
      '<p>Official sample question 6 is here, and it is a good one: distinct conventions per code area, ' +
      '<b>test files spread throughout the codebase</b>, and the requirement that conventions apply ' +
      '<b>automatically</b> based on path. Answer: <code>.claude/rules/</code> with YAML frontmatter glob ' +
      'patterns. The three distractors each fail for a nameable reason — a consolidated CLAUDE.md relies ' +
      'on inference, skills need invoking, and per-directory CLAUDE.md files cannot cover files spread ' +
      'across many directories. If a stem stresses "scattered", "regardless of location" or ' +
      '"automatically", this is the answer.</p>',

      questions: [
        {
          id: 'q3.3.1', scn: 2, official: true,
          stem: '<p>Your codebase has distinct areas with different coding conventions: React components ' +
            'use functional style with hooks, API handlers use async/await with specific error handling, ' +
            'and database models follow a repository pattern. Test files are spread throughout the ' +
            'codebase alongside the code they test (e.g. <code>Button.test.tsx</code> next to ' +
            '<code>Button.tsx</code>), and you want all tests to follow the same conventions regardless of ' +
            'location. What\'s the most maintainable way to ensure Claude automatically applies the ' +
            'correct conventions when generating code?</p>',
          opts: [
            'Create rule files in <code>.claude/rules/</code> with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths',
            'Consolidate all conventions in the root <code>CLAUDE.md</code> file under headers for each area, relying on Claude to infer which section applies',
            'Create skills in <code>.claude/skills/</code> for each code type that include the relevant conventions in their <code>SKILL.md</code> files',
            'Place a separate <code>CLAUDE.md</code> file in each subdirectory containing that area\'s specific conventions'
          ],
          ans: [0],
          why: '<code>.claude/rules/</code> with glob patterns such as <code>**/*.test.tsx</code> applies ' +
            'conventions automatically based on file path regardless of directory location — essential ' +
            'for test files spread throughout the codebase. It is also the only option that is both ' +
            'automatic and non-duplicative.',
          wrong: [
            '',
            'Relies on inference rather than explicit matching, making it unreliable — Claude may apply ' +
            'the wrong section or miss one. It also loads every convention in every session.',
            'Skills require manual invocation, or rely on Claude choosing to load them. That contradicts ' +
            'the requirement for deterministic, automatic application based on file paths.',
            'CLAUDE.md files are directory-bound, so this cannot easily handle files spread across many ' +
            'directories. Covering every test file would mean duplicating the conventions in a dozen ' +
            'places, which then drift apart.'
          ]
        },
        {
          id: 'q3.3.2', scn: 4,
          stem: '<p>Your repository keeps all infrastructure code under a single <code>terraform/</code> ' +
            'directory. You want Terraform conventions to load when that code is edited but not otherwise. ' +
            'Which is a correct and appropriate implementation?</p>',
          opts: [
            'A file in <code>.claude/rules/</code> with frontmatter <code>paths: ["terraform/**/*"]</code>.',
            'A section in the root CLAUDE.md headed "Terraform", which Claude will consult when it recognises Terraform code.',
            'A skill named <code>/terraform-conventions</code> that developers invoke before editing infrastructure code.',
            'A rule in <code>.claude/rules/</code> with no frontmatter, since a filename of <code>terraform.md</code> is sufficient for Claude to scope it.'
          ],
          ans: [0],
          why: 'Glob frontmatter scopes the rule to the infrastructure tree, so it loads when Terraform ' +
            'files are edited and stays out of context otherwise. A directory-level CLAUDE.md inside ' +
            '<code>terraform/</code> would also work here, but the glob keeps all conventions in one ' +
            'reviewable place and catches stray <code>.tf</code> files elsewhere.',
          wrong: [
            '',
            'A root-level section loads in every session regardless of what is being edited, and relies ' +
            'on the model deciding the section applies.',
            'Requires someone to remember to invoke it before every infrastructure edit. Conventions ' +
            'should not depend on invocation.',
            'The filename is not a scoping mechanism. Without a <code>paths</code> field the rule is ' +
            'simply unscoped, so it loads for all work.'
          ]
        },
        {
          id: 'q3.3.3', scn: 2,
          stem: '<p>You add a rule with <code>paths: ["**/*.tsx"]</code> containing React component ' +
            'conventions, including a requirement that every component be wrapped in ' +
            '<code>React.memo</code>. Developers report Claude now applies that requirement to component ' +
            '<em>test</em> files as well. What is happening and how do you fix it?</p>',
          opts: [
            'The glob <code>**/*.tsx</code> also matches <code>Button.test.tsx</code>; exclude test files from the pattern or narrow it so component rules do not load for tests.',
            'Rule frontmatter globs match directories rather than filenames, so the whole component directory including its tests is in scope; move the rule to a directory-level CLAUDE.md.',
            'Two rules are matching simultaneously and the component rule takes precedence; set an explicit priority field on each rule.',
            'The model is generalising from the component rule to nearby files; restate the rule to say that it applies only to non-test files.'
          ],
          ans: [0],
          why: 'A test file for a component genuinely ends in <code>.tsx</code>, so ' +
            '<code>**/*.tsx</code> matches it. Narrowing the pattern, or excluding the test suffix, scopes ' +
            'the component rules to actual components — a plain glob-precision issue.',
          wrong: [
            '',
            'The globs match file paths, and this diagnosis would not explain the behaviour anyway. Moving ' +
            'to a directory CLAUDE.md would still cover the tests in that directory.',
            'Inventing a precedence field to arbitrate a match that should not be occurring treats the ' +
            'symptom. Fix the pattern.',
            'The rule is loading legitimately because the file matches — nothing is being generalised. ' +
            'Restating it in prose is a probabilistic patch on a precise mechanism.'
          ]
        },
        {
          id: 'q3.3.4', scn: 4,
          stem: '<p>Which conditions indicate that <code>.claude/rules/</code> with glob frontmatter is a ' +
            'better fit than a directory-level CLAUDE.md?</p>',
          opts: [
            'The convention applies to files identified by a naming pattern that appear in many directories.',
            'You want the convention to stay out of context entirely when unrelated files are being edited.',
            'The convention applies to every file in one self-contained package and nowhere else.',
            'The convention is a personal preference that should not affect teammates.'
          ],
          ans: [0, 1],
          why: 'Glob-scoped rules exist for conventions that follow a file <em>pattern</em> rather than a ' +
            'location, and conditional loading is their other benefit — the rule costs nothing when no ' +
            'matching file is in play.',
          wrong: [
            '', '',
            'A self-contained package with conventions that apply nowhere else is the textbook case ' +
            '<em>for</em> a directory-level CLAUDE.md.',
            'Personal preferences belong in user scope (<code>~/.claude/CLAUDE.md</code>). Both ' +
            '<code>.claude/rules/</code> and directory CLAUDE.md files are committed and shared.'
          ]
        },
        {
          id: 'q3.3.5', scn: 2,
          stem: '<p>A colleague argues that path-scoped rules are unnecessary complexity: "Just put ' +
            'everything in the root CLAUDE.md — Claude is smart enough to work out which conventions apply ' +
            'to the file it is editing." What is the strongest technical objection?</p>',
          opts: [
            'It substitutes model inference for explicit matching, so conventions can be misapplied or missed, and every convention consumes context in every session regardless of relevance.',
            'The root CLAUDE.md has a maximum length, beyond which additional conventions are silently truncated.',
            'Root CLAUDE.md is not distributed by version control, so teammates would not receive the conventions.',
            'Conventions in the root CLAUDE.md apply only to files in the repository root, not to files in subdirectories.'
          ],
          ans: [0],
          why: 'Two concrete costs. Correctness: inference can apply React rules to an API handler or skip ' +
            'test conventions altogether, whereas a glob either matches or does not. Efficiency: a ' +
            'monolith loads in full every session, so a React edit pays for the Terraform rules.',
          wrong: [
            '',
            'The objection is not a hard length limit — it is that everything loads always and ' +
            'applicability is inferred. Asserting silent truncation invents a mechanism.',
            'Factually wrong: the root CLAUDE.md is committed and shared. That is the distribution ' +
            'property of <em>user</em>-level configuration (<a href="#/unit/3.1">3.1</a>).',
            'Also wrong: root-level project instructions apply across the repository. That is why the ' +
            'monolith problem is one of relevance and cost, not reach.'
          ]
        }
      ]
    },

    /* ================================================================== 3.4 */
    {
      id: '3.4',
      short: 'Plan mode vs direct execution',
      title: 'Determine when to use plan mode vs direct execution',
      scn: [2, 4],
      tldr: '<b>Plan mode</b> for large-scale change, several valid approaches, architectural decisions, ' +
        'multi-file modification — microservice restructuring, a library migration touching 45+ files, ' +
        'choosing between integration approaches with different infrastructure. <b>Direct execution</b> for ' +
        'well-scoped, well-understood change — a single-file bug fix with a clear stack trace, adding one ' +
        'validation conditional. The mature pattern combines them: plan the investigation, then execute ' +
        'directly. Related: the <b>Explore subagent</b> isolates verbose discovery so it does not consume ' +
        'the main context.',

      concept:
      '<h3>What plan mode is for</h3>' +
      '<p>Plan mode lets Claude explore a codebase and design an approach <b>before committing to ' +
      'changes</b>. Its value is entirely about the cost of being wrong. If you start editing and discover ' +
      'at file thirty that your chosen service boundary was wrong, you unwind thirty files. If you explore ' +
      'first, you discover it before writing anything.</p>' +
      '<p>The four triggers the guide names:</p>' +
      '<ul>' +
      '<li><b>Large-scale changes</b> — a library migration affecting 45+ files</li>' +
      '<li><b>Multiple valid approaches</b> — webhooks versus bot tokens versus a full app integration, ' +
      'each with different infrastructure implications</li>' +
      '<li><b>Architectural decisions</b> — where do the service boundaries fall in a monolith split</li>' +
      '<li><b>Multi-file modifications</b> — where the change set is interdependent</li>' +
      '</ul>' +

      fig({
        vb: '0 0 700 250',
        caption: 'Plan mode pays for itself when the cost of a wrong start is high. For a well-scoped ' +
          'change it is pure overhead.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Plan mode</text>' +
          '<rect x="24" y="28" width="130" height="42" rx="6" class="boxA"/>' +
          '<text x="89" y="45" text-anchor="middle" font-size="10.5">explore codebase</text>' +
          '<text x="89" y="60" text-anchor="middle" font-size="9.5" class="dim">no edits yet</text>' +
          '<path class="arrow" d="M154 49 L192 49" marker-end="url(#ah)"/>' +
          '<rect x="192" y="28" width="130" height="42" rx="6" class="boxA"/>' +
          '<text x="257" y="45" text-anchor="middle" font-size="10.5">design approach</text>' +
          '<text x="257" y="60" text-anchor="middle" font-size="9.5" class="dim">weigh options</text>' +
          '<path class="arrow" d="M322 49 L360 49" marker-end="url(#ah)"/>' +
          '<rect x="360" y="28" width="130" height="42" rx="6" class="boxOk"/>' +
          '<text x="425" y="45" text-anchor="middle" font-size="10.5">then execute</text>' +
          '<text x="425" y="60" text-anchor="middle" font-size="9.5" class="dim">direct, informed</text>' +
          '<text x="510" y="45" font-size="10" class="dim">cost of a wrong start:</text>' +
          '<text x="510" y="60" font-size="10" class="dim">45 files unwound</text>' +

          '<line x1="24" y1="88" x2="676" y2="88" class="stroke dashed"/>' +

          '<text x="24" y="112" font-size="11" font-weight="600">Direct execution</text>' +
          '<rect x="24" y="122" width="180" height="42" rx="6" class="boxOk"/>' +
          '<text x="114" y="139" text-anchor="middle" font-size="10.5">clear stack trace → fix it</text>' +
          '<text x="114" y="154" text-anchor="middle" font-size="9.5" class="dim">one file, known cause</text>' +
          '<text x="220" y="139" font-size="10" class="dim">cost of a wrong start: revert one file.</text>' +
          '<text x="220" y="155" font-size="10" class="dim">Planning here is overhead, not insurance.</text>' +

          '<rect x="24" y="182" width="652" height="60" rx="6" class="box"/>' +
          '<text x="40" y="202" font-size="11" font-weight="600">Explore subagent — for the discovery phase itself</text>' +
          '<text x="40" y="220" font-size="10.5">Verbose exploration runs in an isolated context and returns a summary, so a multi-phase</text>' +
          '<text x="40" y="235" font-size="10.5">task does not exhaust its main window on file listings. Same idea as context: fork.</text>'
      }) +

      '<h3>What direct execution is for</h3>' +
      '<p>When the change is <b>well-scoped and well-understood</b>, planning is overhead. The guide\'s ' +
      'examples are deliberately mundane: a single-file bug fix with a clear stack trace, adding a date ' +
      'validation conditional. You know what to do; do it.</p>' +
      '<p>The discriminating question is not "is this task big?" but <b>"do I already know the right ' +
      'approach?"</b> A change touching six files can be direct if the approach is obvious. A change ' +
      'touching one file needs planning if you genuinely do not know which of three designs to use.</p>' +

      '<div class="callout rule"><span class="co-t">Reading the stem</span>' +
      '<p>Signals for <b>plan mode</b>: "multiple valid approaches", "different tradeoffs", "requires ' +
      'decisions about", "dozens of files", "45+ files", "service boundaries", "restructure", "migrate", ' +
      '"choose between". Signals for <b>direct execution</b>: "clear stack trace", "single file", "add a ' +
      'validation check", "well-understood", "the fix is known".</p></div>' +

      '<h3>The distractors, and why they fail</h3>' +
      '<p>The official item on this task statement offers three wrong answers, each of which is a real ' +
      'thing people do:</p>' +
      '<ul>' +
      '<li><b>"Start direct and let the implementation reveal the natural boundaries."</b> Discovery-driven ' +
      'design sounds agile and risks costly rework: dependencies surface late, after you have committed to ' +
      'a structure that cannot accommodate them.</li>' +
      '<li><b>"Direct execution with comprehensive upfront instructions detailing exactly how each service ' +
      'should be structured."</b> This assumes you already know the right structure without having ' +
      'explored the code. If you knew that, there would be no architectural decision to make.</li>' +
      '<li><b>"Begin direct and switch to plan mode only if unexpected complexity appears."</b> The ' +
      'complexity is stated in the requirements — dozens of files, decisions about boundaries and ' +
      'dependencies. It is not something that <em>might</em> emerge; it is the premise.</li>' +
      '</ul>' +

      '<h3>The Explore subagent</h3>' +
      '<p>The guide lists this under plan mode, and it addresses a specific failure: a multi-phase task ' +
      'where the discovery phase alone generates enough output to exhaust the context window before ' +
      'implementation begins.</p>' +
      '<p>The Explore subagent runs verbose discovery in an <b>isolated context</b> and returns a summary. ' +
      'Same principle as <code>context: fork</code> in <a href="#/unit/3.2">3.2</a> and subagent ' +
      'delegation in <a href="#/unit/5.4">5.4</a>: keep the detail where it is generated, and pass forward ' +
      'only what the next phase needs.</p>' +

      '<h3>The combined pattern</h3>' +
      '<p>Plan mode and direct execution are phases, not camps. The guide describes the mature workflow as ' +
      '<b>plan mode for investigation and design, then direct execution for implementation</b> — plan the ' +
      'library migration, agree the approach, then execute it directly. Once the approach is settled, ' +
      'continuing to deliberate is its own kind of waste.</p>',

      example:
      '<h3>Scenario 2 — four tasks, sorted</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Task</th><th>Mode</th><th>Why</th></tr></thead><tbody>' +
      '<tr><td>"Users report a crash on the checkout page. Here is the stack trace pointing at ' +
      '<code>cart.js:214</code>, a null dereference."</td><td><b>Direct</b></td><td>Cause is known, scope ' +
      'is one file, no design decision exists.</td></tr>' +
      '<tr><td>"Add validation rejecting delivery dates in the past."</td><td><b>Direct</b></td>' +
      '<td>One conditional. The guide names this case explicitly.</td></tr>' +
      '<tr><td>"Restructure the monolith into microservices — dozens of files, decisions about service ' +
      'boundaries and module dependencies."</td><td><b>Plan</b></td><td>All four triggers at once: scale, ' +
      'multiple valid approaches, architecture, interdependent multi-file change.</td></tr>' +
      '<tr><td>"Add Slack support. Slack offers incoming webhooks, bot tokens, or a full Slack App, with ' +
      'different infrastructure needs."</td><td><b>Plan</b></td><td>Multiple valid approaches with ' +
      'different tradeoffs — the decision is the work.</td></tr>' +
      '</tbody></table></div>' +

      '<h3>Scenario 4 — a 45-file migration, end to end</h3>' +
      '<p>Migrating from a deprecated HTTP client library, touching 45+ files. This is the combined ' +
      'pattern in practice:</p>' +
      '<pre><code>Phase 1 — plan mode\n' +
      '  · Which of the 45 call sites use which parts of the old API?\n' +
      '  · Where is behaviour subtly different (retries, timeout defaults,\n' +
      '    error types) rather than merely renamed?\n' +
      '  · Is a compatibility shim worth it, or do we migrate call sites directly?\n' +
      '  · What order minimises the time the tree is half-migrated?\n' +
      '  → produces an approach, and finds the 6 files that are genuinely hard\n' +
      '\n' +
      '  (discovery ran under the Explore subagent, so 45 files of listings\n' +
      '   did not land in the main context)\n' +
      '\n' +
      'Phase 2 — direct execution\n' +
      '  · Work the agreed plan file by file. No further deliberation:\n' +
      '    the decisions were made in phase 1.</code></pre>' +
      '<p>Doing phase 2 in plan mode would mean re-litigating settled questions 45 times. Doing phase 1 ' +
      'directly would mean discovering the timeout-default change at file 30 and reworking the first ' +
      'twenty-nine.</p>',

      mistakes: [
        { t: 'Starting direct on an architectural change to "let the design emerge"',
          d: 'Dependencies surface late, after you have committed to a structure that cannot accommodate ' +
             'them. That is the rework plan mode prevents.' },
        { t: 'Writing comprehensive upfront instructions instead of planning',
          d: 'Assumes you already know the right structure without exploring. If you did, there would be ' +
             'no architectural decision to make.' },
        { t: 'Deferring plan mode until complexity "appears"',
          d: 'When the requirements already state dozens of files and boundary decisions, the complexity ' +
             'is the premise, not a possibility.' },
        { t: 'Using plan mode for a known one-file fix',
          d: 'Overhead with no upside. A clear stack trace and a single-file change is direct execution.' },
        { t: 'Judging by task size instead of by uncertainty',
          d: 'The question is whether the right approach is already known. Six obvious files are direct; ' +
             'one file with three plausible designs needs planning.' },
        { t: 'Staying in plan mode through implementation',
          d: 'Once the approach is agreed, deliberating again per file is waste. Plan, then execute.' },
        { t: 'Running verbose discovery in the main context',
          d: 'File listings and greps can exhaust the window before implementation starts. Use the ' +
             'Explore subagent to isolate discovery and return a summary.' }
      ],

      exam:
      '<p>Official sample question 5 is the monolith-to-microservices item, and its answer is plan mode. ' +
      'Learn the three distractors as a set, because they recur: "let the implementation reveal the ' +
      'boundaries", "direct with comprehensive upfront instructions", and "switch to plan mode only if ' +
      'complexity emerges". Expect a paired item where the answer is direct execution — a single-file fix ' +
      'with a clear stack trace, or adding one validation conditional. The numbers to recognise are 45+ ' +
      'files for a migration and "dozens of files" for a restructure.</p>',

      questions: [
        {
          id: 'q3.4.1', scn: 2, official: true,
          stem: '<p>You\'ve been assigned to restructure the team\'s monolithic application into ' +
            'microservices. This will involve changes across dozens of files and requires decisions about ' +
            'service boundaries and module dependencies. Which approach should you take?</p>',
          opts: [
            'Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.',
            'Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries.',
            'Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured.',
            'Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation.'
          ],
          ans: [0],
          why: 'Plan mode is designed for complex tasks involving large-scale changes, multiple valid ' +
            'approaches, and architectural decisions — exactly what monolith-to-microservices ' +
            'restructuring requires. It enables safe codebase exploration and design before committing to ' +
            'changes.',
          wrong: [
            '',
            'Risks costly rework when dependencies are discovered late. By the time the "natural ' +
            'boundaries" emerge you may have committed to a structure that cannot accommodate them.',
            'Assumes you already know the right structure without exploring the code. If the structure ' +
            'were already known there would be no architectural decision to make.',
            'Ignores that the complexity is already stated in the requirements — dozens of files, ' +
            'boundary and dependency decisions — rather than being something that might emerge later.'
          ]
        },
        {
          id: 'q3.4.2', scn: 2,
          stem: '<p>A bug report includes a clear stack trace: a null dereference at ' +
            '<code>src/cart.js:214</code> when a promotion code is applied to an empty cart. The fix is a ' +
            'guard clause in that function. Which approach is appropriate?</p>',
          opts: [
            'Direct execution — the scope is one file, the cause is known, and there is no design decision to make.',
            'Plan mode, to check whether the same null-dereference pattern exists elsewhere before making any change.',
            'Plan mode, because any change to cart logic touches revenue-critical code and warrants deliberation.',
            'Direct execution, but only after the Explore subagent has mapped every caller of the affected function.'
          ],
          ans: [0],
          why: 'A single-file bug fix with a clear stack trace is the guide\'s own example of direct ' +
            'execution. The cause is identified, the scope is contained, and no approach needs choosing — ' +
            'planning would be pure overhead.',
          wrong: [
            '',
            'A broader audit may be worthwhile as separate work, but it is not what plan mode is for and ' +
            'it does not change how this fix is made. Do not expand a bounded task to justify a heavier ' +
            'mode.',
            'Criticality argues for careful review and tests, not for architectural exploration. Plan mode ' +
            'addresses uncertainty about approach, and there is none here.',
            'The Explore subagent exists to keep verbose discovery out of the main context during ' +
            'multi-phase work. Mapping every caller for a local guard clause is unnecessary discovery.'
          ]
        },
        {
          id: 'q3.4.3', scn: 4,
          stem: '<p>Your task is "add Slack support so the team gets deployment notifications". Slack ' +
            'offers incoming webhooks, bot tokens with the Web API, and a full Slack App with OAuth — each ' +
            'with different infrastructure and permission implications. Which approach fits?</p>',
          opts: [
            'Plan mode — there are several valid approaches with materially different tradeoffs, so the integration decision is the substance of the task.',
            'Direct execution with incoming webhooks, since it is the simplest option and can be replaced later if requirements grow.',
            'Direct execution, implementing all three approaches behind a configuration flag so the team can choose at deploy time.',
            'Plan mode, but only to enumerate the three options; the choice itself should be escalated to the team lead rather than explored.'
          ],
          ans: [0],
          why: 'Multiple valid approaches with different infrastructure requirements is one of plan ' +
            'mode\'s stated triggers. The engineering work here is largely the decision, and exploring the ' +
            'existing deployment pipeline and permission model is what informs it.',
          wrong: [
            '',
            'Picking the simplest option without exploring the requirements is how you discover in a month ' +
            'that notifications need to be interactive, or scoped per channel, and rebuild. "Replace it ' +
            'later" is the rework plan mode is meant to avoid.',
            'Implementing three integrations to avoid making a decision triples the work and the ' +
            'maintenance surface, and leaves the decision unmade.',
            'Plan mode is for exploring the codebase and designing an approach, which includes weighing ' +
            'the options against what the code and infrastructure actually support. Artificially stopping ' +
            'at enumeration discards most of its value.'
          ]
        },
        {
          id: 'q3.4.4', scn: 4,
          stem: '<p>You are migrating off a deprecated HTTP client library across 45+ files. Which ' +
            'workflow best reflects the guide\'s recommended combination of modes?</p>',
          opts: [
            'Plan mode to explore the call sites, identify behavioural differences and design the migration order, then direct execution to work through the agreed plan.',
            'Plan mode throughout, so that each file\'s migration is deliberated against the overall design as it is reached.',
            'Direct execution throughout, migrating file by file and adjusting the approach as differences between the libraries surface.',
            'Direct execution for the 39 straightforward files, then plan mode for the 6 files that turn out to be difficult.'
          ],
          ans: [0],
          why: 'The guide describes combining plan mode for investigation and design with direct execution ' +
            'for implementation. Planning surfaces the behavioural differences — timeout defaults, retry ' +
            'semantics, error types — and settles the migration order; execution then applies decisions ' +
            'already made.',
          wrong: [
            '',
            'Once the approach is agreed, re-deliberating per file re-litigates settled questions 45 ' +
            'times. Planning is for the decisions, not for their application.',
            'This is the discovery-driven approach that produces rework: finding a semantic difference at ' +
            'file 30 means revisiting the first twenty-nine.',
            'Inverted. The hard files are precisely what planning should surface <em>before</em> you ' +
            'commit to an approach; discovering them after 39 migrations means the approach was chosen ' +
            'without knowing the constraints.'
          ]
        },
        {
          id: 'q3.4.5', scn: 4,
          stem: '<p>During a multi-phase task, the discovery phase generates so much file-listing and grep ' +
            'output that the context window is largely consumed before implementation begins. What ' +
            'addresses this?</p>',
          opts: [
            'Use the Explore subagent for the discovery phase, so verbose output stays in an isolated context and only a summary returns to the main session.',
            'Run <code>/compact</code> after discovery completes to compress the exploration output before implementation starts.',
            'Move to a model with a larger context window so that discovery and implementation both fit comfortably.',
            'Split the work into two separate sessions, discarding the discovery session once its findings are written down.'
          ],
          ans: [0],
          why: 'The Explore subagent exists for exactly this: isolating verbose discovery output and ' +
            'returning a summary, so a multi-phase task does not exhaust its window before the work ' +
            'begins. It is the same isolation principle as <code>context: fork</code> ' +
            '(<a href="#/unit/3.2">3.2</a>).',
          wrong: [
            '',
            'Compaction is a reaction after the tokens have been spent, and it compresses indiscriminately ' +
            '— you may lose discovery detail you needed. Isolating the output is better than compressing ' +
            'it afterwards.',
            'The capacity-instead-of-architecture answer. A bigger window postpones the problem and pays ' +
            'for irrelevant listings on every subsequent turn.',
            'Workable but manual and lossy — you must decide in advance what to write down, and you lose ' +
            'the ability to ask a follow-up question about the exploration. The Explore subagent automates ' +
            'the same idea within one session.'
          ]
        }
      ]
    },

    /* ================================================================== 3.5 */
    {
      id: '3.5',
      short: 'Iterative refinement',
      title: 'Apply iterative refinement techniques for progressive improvement',
      scn: [2, 4],
      tldr: 'Four techniques. <b>Concrete I/O examples</b> beat more prose when a description is being ' +
        'interpreted inconsistently — 2–3 examples, not another paragraph. <b>Test-driven iteration</b>: ' +
        'write the suite first, then iterate by sharing failures, because a failing test is unambiguous ' +
        'feedback where prose is not. The <b>interview pattern</b>: have Claude ask you questions before ' +
        'implementing, to surface considerations you had not thought of. And <b>batch interacting issues ' +
        'in one message; fix independent ones sequentially</b>.',

      concept:
      '<h3>Examples beat prose</h3>' +
      '<p>You describe a transformation carefully. The output is inconsistent. Your instinct is to describe ' +
      'it more carefully. That instinct is wrong, and the guide is explicit: <b>concrete input/output ' +
      'examples are the most effective way to communicate an expected transformation when prose is being ' +
      'interpreted inconsistently</b>.</p>' +
      '<div class="vs">' +
      '<div class="poor"><span class="vs-h">More prose</span>' +
      '<pre><code>"Extract the contact\'s name and\nemail. Handle cases where the\nname appears after the email, or\nis in parentheses, or where a\ntitle is present. Normalise\ncapitalisation appropriately."</code></pre>' +
      '<p>Every clause invites interpretation. What is "appropriately"? Is "Dr." part of the name?</p></div>' +
      '<div class="good"><span class="vs-h">2–3 examples</span>' +
      '<pre><code>In:  "John\'s email is john@x.com"\nOut: {"name":"John","email":"john@x.com"}\n\n' +
      'In:  "Contact: jane@y.com (Jane)"\nOut: {"name":"Jane","email":"jane@y.com"}\n\n' +
      'In:  "Dr. A. Okonkwo — a.ok@z.org"\nOut: {"name":"A. Okonkwo",\n      "email":"a.ok@z.org"}</code></pre>' +
      '<p>The third example settles the title question without a sentence about titles.</p></div></div>' +
      '<p>The count matters: the guide says <b>2–3</b>. This is not the same recommendation as few-shot ' +
      'prompting for ambiguous judgment (<a href="#/unit/4.2">4.2</a>, 2–4 targeted examples) but the ' +
      'principle is shared — demonstrate the behaviour rather than describing it.</p>' +

      '<h3>Test-driven iteration</h3>' +
      '<p>You tell Claude the implementation mishandles empty arrays. It fixes something. You tell it there ' +
      'is still an edge case with nulls. It fixes something else and reintroduces the first bug. This loop ' +
      'is familiar and its cause is that <b>prose feedback is interpreted inconsistently</b>.</p>' +
      '<p>The guide\'s pattern: <b>write a test suite first</b> — expected behaviour, edge cases, ' +
      'performance requirements — <b>then iterate by sharing the failures</b>.</p>' +
      '<pre><code># Instead of: "it still breaks on some inputs"\n\n' +
      'FAILED test_migrate_null_middle_name\n' +
      '  input:    {"first":"Ada","middle":null,"last":"Lovelace"}\n' +
      '  expected: {"full_name":"Ada Lovelace"}\n' +
      '  actual:   {"full_name":"Ada None Lovelace"}\n\n' +
      'FAILED test_migrate_empty_batch\n' +
      '  input:    []\n' +
      '  expected: {"migrated":0,"errors":[]}\n' +
      '  actual:   ZeroDivisionError at migrate.py:88</code></pre>' +
      '<p>Why this works: a test failure is <b>concrete and machine-verifiable</b>. There is no ' +
      'interpretation gap between what you meant and what was understood, and — crucially — the suite ' +
      'guards the earlier fixes, so the regression loop stops.</p>' +

      fig({
        vb: '0 0 700 190',
        caption: 'Prose feedback leaves an interpretation gap and lets old bugs return. A test suite ' +
          'closes both.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Prose iteration</text>' +
          '<rect x="24" y="28" width="120" height="36" rx="5" class="box"/>' +
          '<text x="84" y="51" text-anchor="middle" font-size="10">"still not right"</text>' +
          '<path class="arrow" d="M144 46 L182 46" marker-end="url(#ah)"/>' +
          '<rect x="182" y="28" width="120" height="36" rx="5" class="box"/>' +
          '<text x="242" y="51" text-anchor="middle" font-size="10">fixes something</text>' +
          '<path class="arrow" d="M302 46 L340 46" marker-end="url(#ah)"/>' +
          '<rect x="340" y="28" width="150" height="36" rx="5" class="boxBad"/>' +
          '<text x="415" y="51" text-anchor="middle" font-size="10">old bug returns</text>' +
          '<path class="arrow dashed" d="M415 64 L415 76 L84 76 L84 64" marker-end="url(#ah)"/>' +
          '<text x="516" y="51" font-size="10" class="dim">loop does not converge</text>' +

          '<line x1="24" y1="98" x2="676" y2="98" class="stroke dashed"/>' +

          '<text x="24" y="122" font-size="11" font-weight="600">Test-driven iteration</text>' +
          '<rect x="24" y="132" width="130" height="36" rx="5" class="boxA"/>' +
          '<text x="89" y="155" text-anchor="middle" font-size="10">write suite first</text>' +
          '<path class="arrow" d="M154 150 L192 150" marker-end="url(#ah)"/>' +
          '<rect x="192" y="132" width="150" height="36" rx="5" class="box"/>' +
          '<text x="267" y="155" text-anchor="middle" font-size="10">share exact failures</text>' +
          '<path class="arrow" d="M342 150 L380 150" marker-end="url(#ah)"/>' +
          '<rect x="380" y="132" width="160" height="36" rx="5" class="boxOk"/>' +
          '<text x="460" y="155" text-anchor="middle" font-size="10">fix, suite guards it</text>' +
          '<text x="556" y="155" font-size="10" class="dim">converges</text>'
      }) +

      '<h3>The interview pattern</h3>' +
      '<p>When you are working in an unfamiliar domain, the most reliable move is to <b>have Claude ask ' +
      'you questions before it implements anything</b>. It surfaces design considerations you had not ' +
      'anticipated — cache invalidation strategy, what happens on partial failure, whether the operation ' +
      'must be idempotent.</p>' +
      '<p>Distinguish it from plan mode carefully, because they sound similar: <b>plan mode explores the ' +
      'codebase</b>; the <b>interview pattern explores the requirements</b>, through dialogue with you. ' +
      'Plan mode reads files. The interview pattern asks you questions that no file can answer.</p>' +
      '<p>Use it when the domain is unfamiliar, the requirements are ambiguous, or there are several ' +
      'defensible designs and the choice depends on facts only you hold.</p>' +

      '<h3>Sequential or batched?</h3>' +
      '<p>Claude produced three problems. Do you report them together or one at a time? The guide\'s answer ' +
      'depends on <b>whether the issues interact</b>.</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Issues</th><th>Approach</th><th>Why</th></tr></thead><tbody>' +
      '<tr><td><b>Interact</b> — they share state, or fixing one changes the right fix for another</td>' +
      '<td>All in one detailed message</td><td>Fixing them in isolation produces a fix for #1 that breaks ' +
      '#2, then a fix for #2 that reverts #1.</td></tr>' +
      '<tr><td><b>Independent</b> — separate functions, no shared state</td><td>Sequentially, one per ' +
      'turn</td><td>Each fix gets full attention, and it is unambiguous which change addressed which ' +
      'problem.</td></tr>' +
      '</tbody></table></div>' +
      '<p>The diagnostic question: <b>would fixing one of these change how I would fix another?</b> Yes → ' +
      'one message. No → sequentially.</p>',

      example:
      '<h3>Scenario 2 — a migration script that keeps missing edge cases</h3>' +
      '<p>You describe the null-handling requirement three times in increasingly careful prose. Each ' +
      'iteration fixes the case you just described and breaks one you described earlier.</p>' +
      '<pre><code># Step 1 — write the suite first, covering behaviour, edges, performance\n' +
      'def test_null_middle_name():      assert full_name({...}) == "Ada Lovelace"\n' +
      'def test_empty_batch():           assert migrate([]) == {"migrated": 0, "errors": []}\n' +
      'def test_unicode_surname():       assert full_name({...}) == "Zoë Çelik"\n' +
      'def test_10k_rows_under_2s():     ...\n' +
      '\n' +
      '# Step 2 — run it and share the actual failures, verbatim\n' +
      '$ pytest -q\n' +
      'FAILED test_null_middle_name  — got "Ada None Lovelace"\n' +
      'FAILED test_empty_batch       — ZeroDivisionError at migrate.py:88\n' +
      '2 failed, 2 passed\n' +
      '\n' +
      '# Step 3 — iterate on the failures. The passing tests now protect the\n' +
      '#          earlier fixes, so the regression loop cannot recur.</code></pre>' +
      '<p>The loop converges because the feedback is unambiguous and cumulative. Prose feedback is neither: ' +
      'each message replaces the last in the model\'s attention, whereas a suite accumulates.</p>' +

      '<h3>Scenario 4 — the interview pattern on an unfamiliar domain</h3>' +
      '<p>You are asked to add a caching layer to a service you do not know well. Instead of specifying it, ' +
      'you ask Claude to interview you first.</p>' +
      '<pre><code>Before implementing, ask me the questions you need answered.\n\n' +
      '→ 1. What invalidates a cached entry — TTL, explicit purge on write,\n' +
      '     or both? If both, which wins on conflict?\n' +
      '  2. Is stale data ever acceptable? For how long?\n' +
      '  3. Should a cache miss and a backend failure be distinguishable to\n' +
      '     the caller, or both just return "unavailable"?\n' +
      '  4. Is this cache per-instance or shared? If shared, do we need\n' +
      '     stampede protection on a cold key?\n' +
      '  5. Do any entries contain personal data with a retention limit?</code></pre>' +
      '<p>Questions 3 and 5 are the payoff — the ones you had not considered. Neither is answerable by ' +
      'reading the codebase, which is precisely why plan mode would not have surfaced them.</p>' +

      '<h3>Batching, decided correctly</h3>' +
      '<div class="vs">' +
      '<div><span class="vs-h">Independent → sequential</span><p>A typo in a log message, a missing null ' +
      'check in an unrelated validator, and a wrong default in a config parser. Three separate functions, ' +
      'no shared state. Fix one per turn; each gets full attention.</p></div>' +
      '<div><span class="vs-h">Interacting → one message</span><p>The retry wrapper swallows the error the ' +
      'new error handler is supposed to classify, and the timeout constant the wrapper reads is the one ' +
      'you are also changing. Fixing any one alone produces a wrong fix for the others. Report all ' +
      'three together with the interaction spelled out.</p></div></div>',

      mistakes: [
        { t: 'Rewriting prose when examples are needed',
          d: 'If a description is being interpreted inconsistently, more careful description rarely helps. ' +
             '2–3 concrete input/output examples do.' },
        { t: 'Iterating on prose feedback for edge cases',
          d: '"Still not quite right" is interpreted inconsistently and lets earlier bugs return. Write ' +
             'the tests and share the failures.' },
        { t: 'Writing tests after the implementation',
          d: 'Test-driven iteration means the suite comes first, so it defines the target rather than ' +
             'ratifying whatever was built.' },
        { t: 'Confusing the interview pattern with plan mode',
          d: 'Plan mode explores the codebase; the interview pattern explores the requirements by asking ' +
             'you. Only one of them can surface facts that exist nowhere in the code.' },
        { t: 'Batching independent issues into one message',
          d: 'Dilutes attention across unrelated fixes and blurs which change addressed which problem. ' +
             'Fix independent issues sequentially.' },
        { t: 'Fixing interacting issues one at a time',
          d: 'The fix for the first becomes wrong once the second is addressed, producing an oscillating ' +
             'loop. Report interacting issues together.' },
        { t: 'Reaching for a stronger model when feedback is the problem',
          d: 'Inconsistent interpretation of vague prose is a specification problem. Examples and tests ' +
             'fix it; capacity does not.' }
      ],

      exam:
      '<p>Expect an item where prose descriptions produce inconsistent results and the answer is <b>2–3 ' +
      'concrete input/output examples</b> — with "rewrite the description more precisely" and "use a more ' +
      'capable model" as distractors. Expect a second where edge cases keep being missed and the answer is ' +
      '<b>write a test suite and iterate on the failures</b>. The batching item turns entirely on whether ' +
      'the issues interact, so read the stem for shared state. And know that the interview pattern is ' +
      'about <em>requirements</em>, not code exploration.</p>',

      questions: [
        {
          id: 'q3.5.1', scn: 4,
          stem: '<p>You have described a data transformation in three paragraphs of careful prose, twice ' +
            'revised, and Claude still produces inconsistent output shapes across similar inputs. What is ' +
            'the most effective next step?</p>',
          opts: [
            'Provide 2–3 concrete input/output examples demonstrating the exact transformation, including one that resolves the ambiguity you keep hitting.',
            'Rewrite the description a third time, being more precise about the edge cases that are being handled inconsistently.',
            'Switch to a more capable model, since the transformation is evidently at the limit of what the current one can follow.',
            'Split the transformation into three smaller transformations, each described in a single sentence.'
          ],
          ans: [0],
          why: 'Concrete input/output examples are the guide\'s stated remedy for prose being interpreted ' +
            'inconsistently. An example settles an ambiguity that a sentence about the ambiguity cannot, ' +
            'because it shows the decision rather than describing it.',
          wrong: [
            '',
            'Two revisions have already failed. More prose adds more clauses to interpret, which is the ' +
            'mechanism producing the inconsistency in the first place.',
            'The capacity distractor. The specification is ambiguous, and a stronger model resolves the ' +
            'ambiguity differently rather than correctly — you would trade one inconsistency for ' +
            'another.',
            'May help incidentally, but it is a restructuring of the prose rather than a change of ' +
            'medium. Three ambiguous sentences are still ambiguous.'
          ]
        },
        {
          id: 'q3.5.2', scn: 2,
          stem: '<p>Claude\'s implementation of a data migration script keeps missing edge cases. Each ' +
            'time you describe a new failing case in prose it fixes that case and reintroduces one you ' +
            'reported earlier. What approach breaks the cycle?</p>',
          opts: [
            'Write a test suite covering expected behaviour, edge cases and performance requirements, then iterate by sharing the actual test failures.',
            'Describe all the known edge cases in a single comprehensive message so that none can be forgotten.',
            'Ask Claude to add defensive null and empty checks throughout the script to cover edge cases generically.',
            'Use extended reasoning so the model considers edge cases more thoroughly before writing each version.'
          ],
          ans: [0],
          why: 'Test failures are concrete, machine-verifiable feedback where prose is interpreted ' +
            'inconsistently — and the passing tests protect earlier fixes, which is what stops the ' +
            'regression cycle. This is test-driven iteration as the guide describes it.',
          wrong: [
            '',
            'A more comprehensive prose message is still prose: nothing verifies that each case is handled ' +
            'or stays handled, so regressions remain invisible until you happen to retest by hand.',
            'Blanket defensive checks paper over unclear requirements and often mask genuine bugs by ' +
            'turning them into silently wrong values.',
            'More reasoning does not supply the specification. The model does not know which edge cases ' +
            'matter until something states them, and a suite states them unambiguously and durably.'
          ]
        },
        {
          id: 'q3.5.3', scn: 4,
          stem: '<p>You must add a caching layer to a service in a domain you do not know well, and the ' +
            'requirements you were given are thin. Which technique is most likely to surface the design ' +
            'considerations you have not thought of?</p>',
          opts: [
            'The interview pattern — ask Claude to put its questions to you before implementing, surfacing considerations such as invalidation strategy and failure modes.',
            'Plan mode — let Claude explore the codebase and design an approach from what the existing code implies.',
            'Write a comprehensive specification first, then have Claude review it for gaps before implementation.',
            'Implement the simplest cache that works, then iterate on it once real usage reveals what the requirements should have been.'
          ],
          ans: [0],
          why: 'The interview pattern explores the <em>requirements</em> through dialogue, which is what ' +
            'thin requirements in an unfamiliar domain call for. Questions such as "is stale data ever ' +
            'acceptable" and "must a cache miss be distinguishable from a backend failure" cannot be ' +
            'answered by any file.',
          wrong: [
            '',
            'Plan mode explores the codebase. Valuable, but the missing information here is not in the ' +
            'code — it is in decisions nobody has made yet, which only a conversation can extract.',
            'Circular: you are being asked to specify a domain you do not know well, so your ' +
            'specification will omit the same considerations you are trying to surface. Reviewing it finds ' +
            'inconsistencies, not unknown unknowns.',
            'Learning invalidation requirements from production incidents is expensive, and a cache with ' +
            'the wrong invalidation model serves stale data to real users while you find out.'
          ]
        },
        {
          id: 'q3.5.4', scn: 2,
          stem: '<p>Reviewing a generated module you find three defects: the retry wrapper swallows the ' +
            'exception the new error classifier is meant to inspect, the classifier reads a timeout ' +
            'constant that the wrapper also mutates, and the wrapper\'s backoff calculation is wrong. How ' +
            'should you report them?</p>',
          opts: [
            'In a single detailed message, because the three issues interact — fixing any one in isolation would produce the wrong fix for the others.',
            'Sequentially, one per turn, so each fix receives full attention and it is clear which change addressed which defect.',
            'Sequentially, but in order of severity, so the most damaging defect is addressed while context is freshest.',
            'In a single message, but only listing the two defects in the wrapper, since fixing those may resolve the classifier issue as a side effect.'
          ],
          ans: [0],
          why: 'These share state: the swallowed exception, the mutated constant and the backoff all live ' +
            'in the interaction between wrapper and classifier. The guide\'s rule is that interacting ' +
            'issues go in one detailed message, because a fix made without knowledge of the others will be ' +
            'the wrong fix.',
          wrong: [
            '',
            'Correct approach for <em>independent</em> issues, wrong here. Fixing the swallowed exception ' +
            'alone changes what the classifier receives, so the next fix is made against a moving ' +
            'target.',
            'Ordering by severity does not remove the interaction. The oscillation comes from fixing ' +
            'coupled defects in isolation, whatever the order.',
            'Deliberately withholding a known defect and hoping it resolves itself leaves the model to ' +
            'guess at a constraint you already know. State all three.'
          ]
        },
        {
          id: 'q3.5.5', scn: 2,
          stem: '<p>Which statement correctly distinguishes the interview pattern from plan mode?</p>',
          opts: [
            'The interview pattern explores the requirements by having Claude question you; plan mode explores the codebase to design an approach before making changes.',
            'The interview pattern is used before plan mode is available in a session; plan mode replaces it once the codebase has been indexed.',
            'The interview pattern is for small tasks where planning would be overhead; plan mode is for tasks spanning many files.',
            'The interview pattern gathers information from documentation and issue trackers; plan mode gathers it from source code.'
          ],
          ans: [0],
          why: 'They address different unknowns. Plan mode reads the code to work out how to change it; ' +
            'the interview pattern asks you about intent, constraints and failure modes that are not ' +
            'recorded anywhere. In an unfamiliar domain with thin requirements, the second is what you ' +
            'need.',
          wrong: [
            '',
            'They are not sequenced or mutually exclusive in that way, and nothing about indexing gates ' +
            'either one. They can be combined — interview to settle requirements, then plan against the ' +
            'code.',
            'Task size is the plan-mode-versus-direct-execution axis (<a href="#/unit/3.4">3.4</a>). The ' +
            'interview pattern is about requirement ambiguity, which is independent of size.',
            'Plausible-sounding but wrong: plan mode is not restricted to source code, and the interview ' +
            'pattern is a dialogue with <em>you</em>, not a document-gathering exercise.'
          ]
        }
      ]
    },

    /* ================================================================== 3.6 */
    {
      id: '3.6',
      short: 'Claude Code in CI/CD',
      title: 'Integrate Claude Code into CI/CD pipelines',
      scn: [5, 2],
      tldr: 'Three flags to memorise: <b><code>-p</code></b> (or <code>--print</code>) runs ' +
        'non-interactively so a pipeline does not hang waiting for input; ' +
        '<b><code>--output-format json</code></b> makes the output machine-parseable; ' +
        '<b><code>--json-schema</code></b> enforces a specific shape. Plus three practices: put project ' +
        'context in CLAUDE.md so CI runs know your standards, <b>inject prior findings</b> on re-review so ' +
        'you stop posting duplicate comments, and <b>pass existing tests</b> into context so generated ' +
        'tests do not duplicate coverage. And know why an <b>independent</b> instance reviews better than ' +
        'the session that wrote the code.',

      concept:
      '<h3>The flags</h3>' +
      '<div class="tablewrap"><table><thead><tr><th>Flag</th><th>Does</th><th>Why CI needs it</th></tr></thead><tbody>' +
      '<tr><td><code>-p "…"</code> / <code>--print</code></td><td>Runs non-interactively: process the ' +
      'prompt, write to stdout, exit</td><td>Without it the process waits for interactive input and the ' +
      'job <b>hangs indefinitely</b></td></tr>' +
      '<tr><td><code>--output-format json</code></td><td>Emits structured JSON rather than prose ' +
      'markdown</td><td>So the pipeline can parse findings and post them as inline PR comments</td></tr>' +
      '<tr><td><code>--json-schema schema.json</code></td><td>Constrains the JSON to a schema you ' +
      'define</td><td>So every finding has the fields your posting script expects</td></tr>' +
      '</tbody></table></div>' +

      '<div class="callout trap"><span class="co-t">Memorise the non-existent options too</span>' +
      '<p>The official item on the hanging pipeline offers <code>CLAUDE_HEADLESS=true</code>, ' +
      '<code>--batch</code>, and redirecting stdin from <code>/dev/null</code>. The first two <b>do not ' +
      'exist</b>; the third is a Unix workaround that does not address the command\'s actual mode. ' +
      'Inventing plausible flags and environment variables is one of this exam\'s favourite distractor ' +
      'styles — if an option names configuration you have never seen documented, be suspicious.</p></div>' +

      '<pre><code># .github/workflows/review.yml\n- name: Automated review\n  run: |\n' +
      '      claude -p "Review the changed files in this PR for correctness and\n' +
      '                 security issues. Use the criteria in CLAUDE.md." \\\n' +
      '        --output-format json \\\n' +
      '        --json-schema .claude/schemas/review-findings.json \\\n' +
      '        > findings.json\n' +
      '\n' +
      '- name: Post findings as inline comments\n  run: node scripts/post-review.js findings.json</code></pre>' +

      '<h3>Fresh context per invocation — and why it matters</h3>' +
      '<p>Every <code>-p</code> invocation gets a <b>fresh, isolated context</b>. Two invocations do not ' +
      'share session state. That sounds like a limitation and is in fact the feature that makes ' +
      'independent review possible.</p>' +
      '<p>The guide\'s point: <b>the same session that generated code is less effective at reviewing its ' +
      'own changes than an independent review instance</b>. The generating session carries its own ' +
      'reasoning — the assumptions it made, the tradeoffs it accepted, the reason it thought that cast was ' +
      'safe. Asked to review, it re-derives the same conclusions, because it already believes them.</p>' +
      '<p>A separate <code>-p</code> invocation has none of that. It sees only the code, and it questions ' +
      'things the author would not. This is <a href="#/unit/4.6">task statement 4.6</a> from the CI ' +
      'side.</p>' +

      fig({
        vb: '0 0 700 200',
        caption: 'Self-review inherits the generator\'s reasoning. A separate <code>-p</code> invocation ' +
          'starts from the code alone.',
        body:
          '<text x="24" y="18" font-size="11" font-weight="600">Self-review — biased</text>' +
          '<rect x="24" y="28" width="300" height="60" rx="6" class="boxBad"/>' +
          '<text x="174" y="48" text-anchor="middle" font-size="10.5" font-weight="600">one session</text>' +
          '<text x="174" y="65" text-anchor="middle" font-size="10" class="dim">generated the code, then reviews it</text>' +
          '<text x="174" y="80" text-anchor="middle" font-size="10" class="dim">carries its own assumptions forward</text>' +

          '<text x="376" y="18" font-size="11" font-weight="600">Independent review</text>' +
          '<rect x="376" y="28" width="140" height="60" rx="6" class="box"/>' +
          '<text x="446" y="50" text-anchor="middle" font-size="10.5">claude -p (gen)</text>' +
          '<text x="446" y="70" text-anchor="middle" font-size="9.5" class="dim">writes the code</text>' +
          '<rect x="536" y="28" width="140" height="60" rx="6" class="boxOk"/>' +
          '<text x="606" y="50" text-anchor="middle" font-size="10.5">claude -p (review)</text>' +
          '<text x="606" y="70" text-anchor="middle" font-size="9.5" class="dim">fresh context</text>' +
          '<path class="arrow dashed" d="M516 58 L536 58"/>' +
          '<text x="526" y="100" text-anchor="middle" font-size="9" class="dim">code only,</text>' +
          '<text x="526" y="112" text-anchor="middle" font-size="9" class="dim">no reasoning</text>' +

          '<rect x="24" y="132" width="652" height="58" rx="6" class="box"/>' +
          '<text x="40" y="152" font-size="11" font-weight="600">Not fixes for self-review bias:</text>' +
          '<text x="40" y="170" font-size="10.5">· "review your own code critically" in the same session   · extended reasoning in the same session</text>' +
          '<text x="40" y="184" font-size="10.5">· adding the test files as extra context   — none of these remove the reasoning already present</text>'
      }) +

      '<h3>CLAUDE.md is how CI learns your standards</h3>' +
      '<p>A CI-invoked Claude Code run loads the project\'s CLAUDE.md like any other. That makes it the ' +
      'mechanism for giving automated runs the context they need:</p>' +
      '<ul>' +
      '<li><b>Review criteria</b> — what counts as a bug worth reporting versus a style preference to skip ' +
      '(<a href="#/unit/4.1">4.1</a>)</li>' +
      '<li><b>Testing standards</b> — what makes a test valuable rather than merely present</li>' +
      '<li><b>Available fixtures</b> — so generated tests use the shared factories instead of inventing ' +
      'their own</li>' +
      '<li><b>Naming conventions</b></li>' +
      '</ul>' +
      '<p>The guide is specific that documenting fixtures and "valuable test" criteria in CLAUDE.md ' +
      '<b>reduces low-value test output</b> substantially.</p>' +

      '<h3>Re-review: inject the prior findings</h3>' +
      '<p>A real and corrosive failure mode. The review runs on every push. Commit 1 gets eight comments. ' +
      'The developer addresses three and pushes. The review runs again with no memory of the first run — ' +
      'because each <code>-p</code> invocation is a fresh context — and posts the same eight comments, ' +
      'including the three now fixed.</p>' +
      '<p>By commit 4 the PR has thirty comments, most of them duplicates, and the developers have stopped ' +
      'reading them. That last part is the real cost: <b>duplicate noise erodes trust in the accurate ' +
      'findings too</b>.</p>' +
      '<p>The fix: <b>pass the prior review findings into context and instruct Claude to report only new or ' +
      'still-unaddressed issues</b>.</p>' +
      '<pre><code>claude -p "Review the changes in this PR.\n\n' +
      '  PREVIOUSLY REPORTED FINDINGS (from earlier commits on this PR):\n' +
      '  $(cat .ci/prior-findings.json)\n\n' +
      '  Report ONLY issues that are new, or that were previously reported\n' +
      '  and remain unaddressed in the current code. Do not repeat a finding\n' +
      '  that the current diff has resolved." \\\n' +
      '  --output-format json --json-schema .claude/schemas/review.json</code></pre>' +
      '<p>Note that this is genuinely better than deduplicating afterwards: a post-hoc filter cannot tell ' +
      'a resolved finding from an unresolved one, so it either re-posts fixed issues or suppresses live ' +
      'ones.</p>' +

      '<h3>Test generation: pass the existing tests</h3>' +
      '<p>Same shape of problem. Without the existing suite in context, generated tests duplicate coverage ' +
      'that already exists — reviewers wade through twelve suggestions to find the two that are new. Pass ' +
      'the existing test files in, and document in CLAUDE.md what a valuable test looks like and which ' +
      'fixtures exist.</p>',

      example:
      '<h3>Scenario 5 — a review pipeline that developers actually read</h3>' +
      '<pre><code>name: Claude review\non: pull_request\n\njobs:\n  review:\n    runs-on: ubuntu-latest\n' +
      '    steps:\n      - uses: actions/checkout@v4\n        with: { fetch-depth: 0 }\n' +
      '\n' +
      '      # Prior findings for this PR, if any, so we do not repeat ourselves\n' +
      '      - name: Fetch prior findings\n' +
      '        run: gh api ".../pulls/${{ github.event.number }}/comments" \\\n' +
      '               > .ci/prior-findings.json || echo "[]" > .ci/prior-findings.json\n' +
      '\n' +
      '      # Pass 1 — per file. -p keeps it non-interactive; JSON keeps it parseable.\n' +
      '      - name: Per-file review\n' +
      '        run: |\n' +
      '          for f in $(git diff --name-only origin/main...HEAD); do\n' +
      '            claude -p "Review $f for correctness and security. Apply the\n' +
      '                       criteria in CLAUDE.md. Prior findings:\n' +
      '                       $(cat .ci/prior-findings.json). Report only new or\n' +
      '                       still-unaddressed issues." \\\n' +
      '              --output-format json \\\n' +
      '              --json-schema .claude/schemas/review-findings.json \\\n' +
      '              >> findings.jsonl\n' +
      '          done\n' +
      '\n' +
      '      # Pass 2 — cross-file integration, one invocation over the whole diff\n' +
      '      - name: Integration review\n' +
      '        run: |\n' +
      '          claude -p "Examine the full diff for cross-file issues only:\n' +
      '                     interface consistency, data flow across module\n' +
      '                     boundaries, duplicated logic." \\\n' +
      '            --output-format json \\\n' +
      '            --json-schema .claude/schemas/review-findings.json \\\n' +
      '            >> findings.jsonl\n' +
      '\n' +
      '      - name: Post inline comments\n        run: node scripts/post-review.js findings.jsonl</code></pre>' +

      '<p>Every element earns its place. <code>-p</code> stops the job hanging. The JSON flags make the ' +
      'output postable. Prior findings prevent duplicate comments. The two passes are the multi-pass ' +
      'architecture from <a href="#/unit/1.6">1.6</a> and <a href="#/unit/4.6">4.6</a>. And because each ' +
      'invocation is a fresh context, none of these reviews is reviewing its own work.</p>' +

      '<div class="callout tip"><span class="co-t">Which API for which job</span>' +
      '<p>This pipeline runs on the synchronous path because developers are waiting on the PR. An ' +
      'overnight technical-debt report is the opposite case, and belongs on the Message Batches API for ' +
      'the 50% saving — see <a href="#/unit/4.5">task statement 4.5</a>. Matching the API to the latency ' +
      'tolerance, rather than switching everything to whichever is cheaper, is the point.</p></div>',

      mistakes: [
        { t: 'Omitting <code>-p</code> in CI',
          d: 'The command waits for interactive input and the job hangs indefinitely. This is the single ' +
             'most-tested fact in the task statement.' },
        { t: 'Believing <code>--batch</code> or <code>CLAUDE_HEADLESS=true</code> exist',
          d: 'They do not. Invented flags and environment variables are a standard distractor style.' },
        { t: 'Parsing prose output with regexes',
          d: 'Use <code>--output-format json</code>, and <code>--json-schema</code> to guarantee the ' +
             'fields your posting script expects.' },
        { t: 'Having the generating session review its own code',
          d: 'It carries its own reasoning and re-derives the same conclusions. A separate ' +
             '<code>-p</code> invocation reviews with fresh context.' },
        { t: 'Expecting "review your work critically" to fix self-review bias',
          d: 'The bias is the reasoning already in context. Neither a stern instruction nor extended ' +
             'reasoning removes it.' },
        { t: 'Re-reviewing without prior findings',
          d: 'Each invocation is a fresh context, so the same comments get posted after every commit. ' +
             'Inject prior findings and ask for only new or unaddressed issues.' },
        { t: 'Deduplicating comments after the fact',
          d: 'A post-hoc filter cannot distinguish a resolved finding from an unresolved one. Give the ' +
             'model the prior findings and let it judge.' },
        { t: 'Generating tests without the existing suite in context',
          d: 'Produces duplicates of existing coverage. Pass the test files, and document valuable-test ' +
             'criteria and fixtures in CLAUDE.md.' },
        { t: 'Putting a blocking pre-merge check on the Batch API',
          d: 'Up to 24 hours with no latency SLA. Keep blocking checks synchronous ' +
             '(<a href="#/unit/4.5">4.5</a>).' }
      ],

      exam:
      '<p>Official sample question 10 — the hanging pipeline — is near-certain in some form, and the ' +
      'answer is <code>-p</code>. Learn the three fake alternatives. Expect a machine-parseable-output ' +
      'item answered by <code>--output-format json</code> plus <code>--json-schema</code>. Expect the ' +
      'duplicate-comments item answered by injecting prior findings and asking for only new or unaddressed ' +
      'issues. And expect the self-review item, whose answer is an independent instance via a separate ' +
      '<code>-p</code> invocation — never a stronger instruction to the same session.</p>',

      questions: [
        {
          id: 'q3.6.1', scn: 5, official: true,
          stem: '<p>Your pipeline script runs <code>claude "Analyze this pull request for security ' +
            'issues"</code> but the job hangs indefinitely. Logs indicate Claude Code is waiting for ' +
            'interactive input. What\'s the correct approach to run Claude Code in an automated ' +
            'pipeline?</p>',
          opts: [
            'Add the <code>-p</code> flag: <code>claude -p "Analyze this pull request for security issues"</code>',
            'Set the environment variable <code>CLAUDE_HEADLESS=true</code> before running the command',
            'Redirect stdin from <code>/dev/null</code>: <code>claude "Analyze this pull request for security issues" &lt; /dev/null</code>',
            'Add the <code>--batch</code> flag: <code>claude --batch "Analyze this pull request for security issues"</code>'
          ],
          ans: [0],
          why: 'The <code>-p</code> (or <code>--print</code>) flag is the documented way to run Claude ' +
            'Code non-interactively. It processes the prompt, writes the result to stdout, and exits ' +
            'without waiting for user input — exactly what a CI/CD pipeline requires.',
          wrong: [
            '',
            'No such environment variable exists. Invented configuration is a recurring distractor style ' +
            'on this exam.',
            'A Unix workaround that does not properly address the command\'s interactive mode. Closing ' +
            'stdin is not the same as telling the tool to run in print mode, and the documented flag ' +
            'exists precisely for this.',
            'No such flag exists. The name is suggestive — batching is a real concept in the Message ' +
            'Batches API (<a href="#/unit/4.5">4.5</a>) — but it is not a Claude Code CLI option.'
          ]
        },
        {
          id: 'q3.6.2', scn: 5,
          stem: '<p>Your CI review job produces markdown prose, and a script scrapes it with regular ' +
            'expressions to post inline PR comments. The scraping breaks whenever the output phrasing ' +
            'shifts. What is the correct fix?</p>',
          opts: [
            'Use <code>--output-format json</code> together with <code>--json-schema</code> so the run emits structured findings with exactly the fields the posting script expects.',
            'Make the regular expressions more tolerant, matching on a wider variety of heading and bullet formats.',
            'Add instructions to the prompt specifying the exact markdown format the output must follow, including heading levels and bullet markers.',
            'Have the posting script send the markdown to a second Claude invocation that converts it into JSON.'
          ],
          ans: [0],
          why: '<code>--output-format json</code> produces machine-parseable output and ' +
            '<code>--json-schema</code> constrains it to a shape your script can rely on. That removes the ' +
            'parsing problem structurally rather than making the parser more forgiving.',
          wrong: [
            '',
            'More permissive regexes are a treadmill: each phrasing change needs another pattern, and ' +
            'silent mismatches drop findings without anyone noticing.',
            'Formatting instructions are probabilistic — the model will mostly comply. A schema is ' +
            'enforced. This is the same prompted-format-versus-schema distinction as ' +
            '<a href="#/unit/4.3">4.3</a>.',
            'Adds a second model call, its cost and its own failure modes, to convert output that could ' +
            'have been JSON in the first place.'
          ]
        },
        {
          id: 'q3.6.3', scn: 5,
          stem: '<p>Your PR review runs on every push. Developers complain that after each commit the bot ' +
            're-posts comments they have already addressed, and they have started ignoring the review ' +
            'entirely. What is the correct fix?</p>',
          opts: [
            'Include the prior review findings in the prompt context and instruct Claude to report only issues that are new or previously reported and still unaddressed.',
            'Deduplicate after the fact by comparing new comment text against comments already on the PR and suppressing near-matches.',
            'Run the review only on the first commit of a PR, so subsequent pushes cannot produce duplicates.',
            'Resolve all existing bot comments automatically before each new review run, so the PR only ever shows the latest set.'
          ],
          ans: [0],
          why: 'Each <code>-p</code> invocation starts with a fresh context, so the run has no knowledge ' +
            'of what was said before unless you tell it. Injecting prior findings and asking for only new ' +
            'or unaddressed issues is the guide\'s stated approach, and it is the only option that can ' +
            'distinguish a resolved finding from a live one.',
          wrong: [
            '',
            'Text similarity cannot tell whether the underlying issue was fixed. It either suppresses a ' +
            'still-valid finding because the wording matched, or re-posts a fixed one because it did ' +
            'not.',
            'Abandons review of exactly the code most likely to need it — the changes made in response to ' +
            'review. Later commits are where regressions get introduced.',
            'Destroys the review conversation, including replies where a developer explained why something ' +
            'was intentional, and still re-posts resolved findings in the new set.'
          ]
        },
        {
          id: 'q3.6.4', scn: 5,
          stem: '<p>A single Claude Code session generates a new module and is then asked, in the same ' +
            'session, to review it critically for defects. It reports very few issues. An independent ' +
            'review of the same code finds several real bugs. What explains this and what is the fix?</p>',
          opts: [
            'The generating session carries its own reasoning, making it unlikely to question decisions it already justified; run the review as a separate <code>-p</code> invocation with fresh context.',
            'The review instruction was not emphatic enough; strengthen it to require the session to assume its own code contains defects.',
            'The session lacked the test files as context; include them so the review has more information to work against.',
            'The session\'s context was too full after generation; run <code>/compact</code> before asking for the review.'
          ],
          ans: [0],
          why: 'A session that generated code retains the reasoning behind it — the assumptions made, the ' +
            'tradeoffs accepted — so asked to review, it re-derives the same conclusions. An independent ' +
            'instance sees only the code and questions what the author would not. A separate ' +
            '<code>-p</code> invocation gets a fresh, isolated context, which is what makes this ' +
            'practical in CI.',
          wrong: [
            '',
            'The bias is structural, not motivational. A sterner instruction does not remove reasoning ' +
            'that is already present and already believed.',
            'More context does not help an instance that is disinclined to doubt its own decisions, and ' +
            'the guide names including test files as one of the approaches that does not fix self-review ' +
            'bias.',
            'Compaction reduces context volume; it does not remove the generator\'s conclusions, which are ' +
            'exactly what a summary would preserve.'
          ]
        },
        {
          id: 'q3.6.5', scn: 5,
          stem: '<p>Your CI test-generation job produces many suggestions that duplicate coverage the ' +
            'suite already has, and reviewers must sift to find the few that are genuinely new. Which ' +
            'measures directly address this?</p>',
          opts: [
            'Pass the existing test files into context so the run can see what is already covered.',
            'Document the available fixtures and what counts as a valuable test in CLAUDE.md, so CI-invoked runs share the team\'s standards.',
            'Restrict the job to generating at most three tests per run, so reviewers have less to read.',
            'Run the job on the Message Batches API overnight, so duplicate suggestions do not block anyone.'
          ],
          ans: [0, 1],
          why: 'The run cannot avoid duplicating coverage it cannot see, so passing the existing tests is ' +
            'the direct fix. Documenting fixtures and valuable-test criteria in CLAUDE.md is the guide\'s ' +
            'stated way to raise quality and cut low-value output, and CLAUDE.md is how a CI-invoked run ' +
            'receives project context at all.',
          wrong: [
            '', '',
            'An arbitrary cap reduces volume without improving relevance — you may cut the two useful ' +
            'suggestions and keep three duplicates.',
            'Test generation is a good candidate for batch processing on cost grounds ' +
            '(<a href="#/unit/4.5">4.5</a>), but moving it overnight does nothing about duplication. The ' +
            'reviewers still sift, just later.'
          ]
        }
      ]
    }

    ]
  });
})(window.CCA);
