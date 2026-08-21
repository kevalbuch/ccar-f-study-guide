/* ==========================================================================
   app.js — router, lesson renderer, quiz engine, mock exam.
   Plain script (no modules) so the site also works opened from disk.
   ========================================================================== */
(function () {
  'use strict';

  var CCA = window.CCA;
  var M = CCA.meta;

  /* ---------------------------------------------------------------- data prep */

  // Stitch the domain shells together with the unit arrays the d*.js files pushed.
  var DOMAINS = CCA.domainMeta.map(function (dm) {
    var d = CCA.domains.filter(function (x) { return x.n === dm.n; })[0] || { units: [] };
    var merged = {};
    Object.keys(dm).forEach(function (k) { merged[k] = dm[k]; });
    merged.units = d.units || [];
    return merged;
  });

  var UNITS = [];      // flat, in blueprint order
  var UNIT_BY_ID = {};
  var QUESTIONS = [];  // flat question bank

  DOMAINS.forEach(function (d) {
    d.units.forEach(function (u) {
      u.domain = d;
      UNITS.push(u);
      UNIT_BY_ID[u.id] = u;
      (u.questions || []).forEach(function (q) {
        q.d = d.n;
        q.ts = u.id;
        q.unit = u;
        QUESTIONS.push(q);
      });
    });
  });

  var SCN_BY_N = {};
  CCA.scenarios.forEach(function (s) { SCN_BY_N[s.n] = s; });

  /* ------------------------------------------------------------------- storage */

  var KEY = 'ccarf.v1';
  var store = load();

  function load() {
    var base = {
      done: {}, quiz: {}, exams: [], theme: null, fcKnown: {},
      examSaved: null,      // in-flight exam attempt, survives a reload
      fcReverse: false,     // flashcards: show the definition first
      seenIntro: false      // first-run keyboard hint
    };
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var p = JSON.parse(raw);
      Object.keys(base).forEach(function (k) { if (p[k] == null) p[k] = base[k]; });
      return p;
    } catch (e) { return base; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode */ }
  }

  /* ------------------------------------------------------- accessibility plumbing */

  /* One polite region for status ("Correct", "12 of 25 answered") and one
     assertive region for things the user must not miss (time running out).
     Without these, every quiz verdict and timer warning was silent to a
     screen reader. */
  var livePolite = document.createElement('div');
  var liveAlert = document.createElement('div');
  livePolite.className = liveAlert.className = 'sr-only';
  livePolite.setAttribute('aria-live', 'polite');
  livePolite.setAttribute('role', 'status');
  liveAlert.setAttribute('aria-live', 'assertive');
  liveAlert.setAttribute('role', 'alert');
  document.body.appendChild(livePolite);
  document.body.appendChild(liveAlert);

  function announce(msg, urgent) {
    var el = urgent ? liveAlert : livePolite;
    el.textContent = '';                  // force re-announcement of repeats
    window.setTimeout(function () { el.textContent = msg; }, 30);
  }

  /* --------------------------------------------------------------------- utils */

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var LETTERS = 'ABCDEFGH';

  function shuffle(a, rnd) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor((rnd ? rnd() : Math.random()) * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var s = a.slice().sort().join(','), t = b.slice().sort().join(',');
    return s === t;
  }
  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  var figure = function (f) { return CCA.fig(f); };

  /* ------------------------------------------------------------------ progress */

  function doneCount() { return UNITS.filter(function (u) { return store.done[u.id]; }).length; }

  function domainQuizStats(dn) {
    var qs = QUESTIONS.filter(function (q) { return q.d === dn; });
    var att = 0, ok = 0;
    qs.forEach(function (q) {
      var r = store.quiz[q.id];
      if (r) { att++; if (r.correct) ok++; }
    });
    return { total: qs.length, attempted: att, correct: ok };
  }

  function refreshTop() {
    var n = doneCount(), t = UNITS.length;
    document.getElementById('tpFill').style.width = pct(n, t) + '%';
    document.getElementById('tpLabel').textContent = n + '/' + t;
  }

  /* --------------------------------------------------------------------- theme */

  /* The stylesheet is dark-first: bare :root carries the dark palette and only
     :root[data-theme="light"] overrides it. So the attribute is authoritative
     and there is no prefers-color-scheme branch to consult — anything that is
     not explicitly "light" renders dark. */
  function applyTheme(v) {
    var theme = v === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    store.theme = theme; save();
  }
  applyTheme(store.theme);

  document.getElementById('themeToggle').addEventListener('click', function () {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
  });

  /* ------------------------------------------------------------------- sidebar */

  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  function closeNav() {
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
      scrim.hidden = true;
      document.getElementById('navToggle').setAttribute('aria-expanded', 'false');
    }
  }
  function navIsOpen() { return sidebar.classList.contains('open'); }
  var navReturnFocus = null;
  document.getElementById('navToggle').addEventListener('click', function () {
    var open = sidebar.classList.toggle('open');
    scrim.hidden = !open;
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      navReturnFocus = this;
      var first = sidebar.querySelector('a, summary, button');
      if (first) first.focus();
    } else if (navReturnFocus) {
      navReturnFocus.focus(); navReturnFocus = null;
    }
  });
  scrim.addEventListener('click', closeNav);

  /* Escape closes the drawer and hands focus back to the button that opened it,
     so keyboard and screen-reader users are not stranded inside the nav. */
  sidebar.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeNav();
    if (navReturnFocus) { navReturnFocus.focus(); navReturnFocus = null; }
    else document.getElementById('navToggle').focus();
  });

  function buildNav() {
    var openDomains = {};
    var existingDetails = document.querySelectorAll('details.nav-dom');
    Array.prototype.forEach.call(existingDetails, function (det) {
      var dn = det.getAttribute('data-dn');
      if (dn && det.open) openDomains[dn] = true;
    });

    var h = '';
    h += '<div class="nav-group">';
    h += navLink('#/', 'Overview');
    h += navLink('#/about', 'Exam blueprint');
    h += navLink('#/scenarios', 'The 6 scenarios');
    h += '</div>';

    DOMAINS.forEach(function (d) {
      var active = (location.hash || '').indexOf('/unit/' + d.n + '.') === 0 ||
                   (location.hash || '') === '#/domain/' + d.n;
      var open = active || openDomains[d.n];
      h += '<details class="nav-dom" data-dn="' + d.n + '"' + (open ? ' open' : '') + '>';
      var dDone = d.units.filter(function (u) { return store.done[u.id]; }).length;
      h += '<summary><span class="dom-dot" style="background:' + d.color + '"></span>' +
           '<span class="nav-dom-name">D' + d.n + ' · ' + esc(d.title.split(' & ')[0]) + '</span>' +
           '<span class="nav-dom-prog' + (dDone === d.units.length ? ' full' : '') + '">' +
           dDone + '/' + d.units.length + '</span></summary>';
      h += '<div class="nav-units">';
      h += navLink('#/domain/' + d.n, 'Domain overview', 'ov');
      d.units.forEach(function (u) {
        var tick = store.done[u.id] ? '✓' : '';
        h += '<a class="nav-link" href="#/unit/' + u.id + '">' +
             '<span class="u-tick">' + tick + '</span>' +
             '<span>' + u.id + ' ' + esc(u.short) + '</span></a>';
      });
      h += '</div></details>';
    });

    h += '<div class="nav-group"><div class="nav-title">Practice</div>';
    h += navLink('#/drill', 'Question drills');
    h += navLink('#/exam', 'Full mock exam');
    h += navLink('#/flashcards', 'Flashcards');
    h += navLink('#/glossary', 'Glossary');
    h += '</div>';

    h += '<div class="nav-group"><div class="nav-title">Reference</div>';
    h += navLink('#/patterns', 'Answer-pattern cheatsheet');
    h += navLink('#/sources', 'Sources & verification');
    h += '</div>';

    h += '<div class="nav-group"><div class="nav-title">Data &amp; Backup</div>';
    h += '<button class="nav-link-btn" id="exportNavBtn">↓ Export progress (JSON)</button>';
    h += '<button class="nav-link-btn" id="importNavBtn">↑ Import progress (JSON)</button>';
    h += '<input type="file" id="importFileInput" accept=".json" style="display:none">';
    h += '</div>';

    document.getElementById('sidebarInner').innerHTML = h;
    markCurrent();

    var expBtn = document.getElementById('exportNavBtn');
    if (expBtn) expBtn.addEventListener('click', exportProgress);
    var impBtn = document.getElementById('importNavBtn');
    var impFile = document.getElementById('importFileInput');
    if (impBtn && impFile) {
      impBtn.addEventListener('click', function () { impFile.click(); });
      impFile.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          importProgress(this.files[0]);
          this.value = '';
        }
      });
    }
  }

  function exportProgress() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    var dlAnchor = document.createElement('a');
    var dateStr = new Date().toISOString().slice(0, 10);
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "ccarf-progress-" + dateStr + ".json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    announce("Progress exported successfully.");
  }

  function importProgress(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var imported = JSON.parse(e.target.result);
        if (typeof imported !== 'object' || !imported) {
          alert('Invalid JSON file format.');
          return;
        }
        if (window.confirm('Importing this file will update your saved units, quiz answers, and exam history. Continue?')) {
          Object.keys(imported).forEach(function (k) {
            store[k] = imported[k];
          });
          save();
          applyTheme(store.theme);
          refreshTop();
          buildNav();
          route();
          announce("Progress imported successfully.");
          alert('Progress imported successfully!');
        }
      } catch (err) {
        alert('Error reading progress file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }
  function navLink(href, label, cls) {
    return '<a class="nav-link' + (cls ? ' ' + cls : '') + '" href="' + href + '">' + esc(label) + '</a>';
  }
  function markCurrent() {
    var hash = location.hash || '#/';
    Array.prototype.forEach.call(sidebar.querySelectorAll('.nav-link'), function (a) {
      if (a.getAttribute('href') === hash) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ==========================================================================
     QUIZ ENGINE
     ========================================================================== */

  /* Renders one question. `opts`:
       mode: 'study' (immediate feedback) | 'exam' (defer)
       n:    display number
       state: exam answer store (mode 'exam')            */
  function renderQuestion(q, opts) {
    opts = opts || {};
    var mode = opts.mode || 'study';
    var multi = q.ans.length > 1;
    var name = 'q_' + q.id.replace(/[^\w]/g, '_') + '_' + (opts.salt || '');

    var h = '<div class="q" data-qid="' + q.id + '" id="qc_' + name + '">';
    h += '<div class="q-head"><span class="q-n">' +
         (opts.n ? 'Q' + opts.n : 'Q') + ' · D' + q.d + ' · ' + q.ts + '</span>';
    if (q.scn && SCN_BY_N[q.scn]) {
      h += '<span class="q-scn">Scenario ' + q.scn + ' — ' + esc(SCN_BY_N[q.scn].title) + '</span>';
    }
    if (q.official) {
      h += '<span class="chip info" title="Published by Anthropic in Section 9 of the exam guide">' +
           'Official sample</span>';
    }
    h += '</div>';
    h += '<div class="q-stem">' + q.stem + '</div>';
    h += '<p class="q-instr">' + (multi
      ? 'Select ' + q.ans.length + ' responses.'
      : 'Select 1 response.') + '</p>';

    h += '<ul class="opts">';
    q.opts.forEach(function (o, i) {
      h += '<li class="opt" data-i="' + i + '"><label>' +
        '<input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + name + '" value="' + i + '">' +
        '<span class="ol">' + LETTERS[i] + '</span><span class="ot">' + o + '</span>' +
        '</label></li>';
    });
    h += '</ul>';

    if (mode === 'study') {
      h += '<div class="q-actions">' +
           '<button class="btn primary small js-check">Check answer</button>' +
           '<button class="btn ghost small js-reveal">Reveal</button>' +
           '<span class="js-verdict"></span></div>';
      h += '<div class="rationale hide js-rat"></div>';
    }
    h += '</div>';

    var node = el(h);

    if (mode === 'study') {
      var prev = store.quiz[q.id];
      node._onGraded = opts.onGraded || null;
      var chkBtn = node.querySelector('.js-check');
      if (chkBtn) {
        chkBtn.addEventListener('click', function () {
          var picked = picks(node);
          if (!picked.length) {
            announce('Select an answer first.');
            return;
          }
          grade(node, q, picked, true);
        });
      }
      var revBtn = node.querySelector('.js-reveal');
      if (revBtn) {
        revBtn.addEventListener('click', function () {
          grade(node, q, picks(node), false);
        });
      }
      if (prev) grade(node, q, prev.picked || [], false, true);
    } else {
      // exam mode — record selections into the shared state object
      node.addEventListener('change', function () {
        opts.state[q.id] = picks(node);
        if (opts.onChange) opts.onChange();
      });
      var cur = opts.state[q.id] || [];
      cur.forEach(function (i) {
        var inp = node.querySelector('.opt[data-i="' + i + '"] input');
        if (inp) inp.checked = true;
      });
    }
    return node;
  }

  function picks(node) {
    return Array.prototype.slice
      .call(node.querySelectorAll('.opt input:checked'))
      .map(function (i) { return +i.value; });
  }

  function grade(node, q, picked, record, silent) {
    var correct = sameSet(picked, q.ans);
    node.classList.add('answered');
    Array.prototype.forEach.call(node.querySelectorAll('.opt'), function (li) {
      var i = +li.getAttribute('data-i');
      li.querySelector('input').disabled = true;
      if (q.ans.indexOf(i) > -1) li.classList.add('is-correct');
      else if (picked.indexOf(i) > -1) li.classList.add('is-wrongpick');
      if (picked.indexOf(i) > -1) li.querySelector('input').checked = true;
    });

    var v = node.querySelector('.js-verdict');
    if (v && picked.length) {
      v.innerHTML = '<span class="verdict ' + (correct ? 'ok' : 'bad') + '">' +
        (correct ? 'Correct' : 'Not quite') + '</span>';
    }
    var btns = node.querySelectorAll('.js-check, .js-reveal');
    Array.prototype.forEach.call(btns, function (b) { b.disabled = true; });

    var rat = node.querySelector('.js-rat');
    if (rat) {
      var correctLetters = q.ans.map(function (i) { return LETTERS[i]; }).join(', ');
      var h = '<h5 class="rat-head ok"><span class="chip ok small">✓ Correct</span> Option ' + correctLetters + '</h5>';
      h += '<div class="why-ok">' + q.why + '</div>';
      var wrongs = [];
      q.opts.forEach(function (o, i) {
        if (q.ans.indexOf(i) > -1) return;
        if (q.wrong && q.wrong[i]) wrongs.push('<li><b>Option ' + LETTERS[i] + '</b> — ' + q.wrong[i] + '</li>');
      });
      if (wrongs.length) h += '<h5 class="rat-head bad"><span class="chip bad small">✕ Distractors</span> Why the other options fail</h5><ul class="rat-wrongs">' + wrongs.join('') + '</ul>';
      h += '<div class="tsref">Task statement ' + q.ts + ' · <a href="#/unit/' + q.ts + '">' +
           esc(UNIT_BY_ID[q.ts] ? UNIT_BY_ID[q.ts].short : q.ts) + '</a></div>';
      rat.innerHTML = h;
      rat.classList.remove('hide');
    }

    if (record) {
      store.quiz[q.id] = { correct: correct, picked: picked, at: Date.now() };
      save();
      if (node._onGraded) node._onGraded(correct);
      announce(correct ? 'Correct.' : 'Not quite. The correct answer is ' +
        q.ans.map(function (i) { return LETTERS[i]; }).join(' and ') + '.');
    }
    if (!silent && !correct) { /* keep focus for review */ }
  }
  function LETTERES(i) { return LETTERS[i]; }

  /* ==========================================================================
     VIEWS
     ========================================================================== */

  var view = document.getElementById('view');

  function setView(html) {
    if (view._tocCleanup) { view._tocCleanup(); view._tocCleanup = null; view._tocUpdate = null; }
    view.innerHTML = html;
    wireCodeCopyButtons(view);
    wireDiagramModals(view);
    return view;
  }

  function wireDiagramModals(container) {
    if (!container) return;
    var boxes = container.querySelectorAll('.figure .fig-box');
    Array.prototype.forEach.call(boxes, function (box) {
      box.addEventListener('click', function (e) {
        var svg = box.querySelector('svg');
        if (!svg) return;
        var figure = box.closest('.figure');
        var caption = figure ? figure.querySelector('figcaption') : null;
        var captionText = caption ? caption.innerHTML : 'Architecture Diagram';

        var modal = document.createElement('div');
        modal.id = 'diagramModal';
        modal.className = 'palette-scrim';
        modal.innerHTML = '<div class="diagram-modal-box" role="dialog" aria-modal="true">' +
          '<div class="shortcuts-header" style="margin-bottom:1rem;">' +
          '<h3>' + captionText + '</h3>' +
          '<button class="iconbtn closebtn" id="closeDiagModal" aria-label="Close diagram inspection">✕</button>' +
          '</div>' +
          '<div class="diagram-modal-body">' + svg.outerHTML + '</div>' +
          '</div>';

        document.body.appendChild(modal);
        var closeBtn = document.getElementById('closeDiagModal');
        if (closeBtn) closeBtn.addEventListener('click', function () { modal.remove(); });
        modal.addEventListener('click', function (ev) {
          if (ev.target === modal) modal.remove();
        });
      });
    });
  }

  function wireCodeCopyButtons(container) {
    if (!container) return;
    var pres = container.querySelectorAll('pre');
    Array.prototype.forEach.call(pres, function (pre) {
      if (pre.querySelector('.copy-code-btn')) return;
      var code = pre.querySelector('code') || pre;
      var btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>';
      
      btn.addEventListener('click', function () {
        var text = code.textContent || '';
        var origHtml = btn.innerHTML;
        function showSuccess() {
          btn.classList.add('copied');
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = origHtml;
          }, 2000);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(showSuccess).catch(function () {
            fallbackCopy(text);
            showSuccess();
          });
        } else {
          fallbackCopy(text);
          showSuccess();
        }
      });

      pre.appendChild(btn);
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }

  /* ------------------------------------------------------------------ overview */

  /* ---------------------------------------------------------------- readiness

     Raw counts ("3/30 units") do not answer the question a learner actually
     has, which is "am I ready?". Readiness per domain blends coverage (units
     marked complete) with demonstrated accuracy (practice answers), then
     weights the domains exactly as the exam does. Accuracy is deliberately
     discounted until a domain has a meaningful number of attempts, so three
     lucky answers cannot read as mastery. */
  var MIN_ATTEMPTS = 8;

  function domainReadiness(dn) {
    var d = DOMAINS[dn - 1];
    var units = d.units.length;
    var doneU = d.units.filter(function (u) { return store.done[u.id]; }).length;
    var st = domainQuizStats(dn);
    var coverage = units ? doneU / units : 0;
    var accuracy = st.attempted ? st.correct / st.attempted : 0;
    // confidence in the accuracy estimate, 0..1
    var conf = Math.min(1, st.attempted / MIN_ATTEMPTS);
    var score = (0.4 * coverage) + (0.6 * accuracy * conf);
    return {
      n: dn, domain: d, units: units, doneUnits: doneU,
      attempted: st.attempted, correct: st.correct, total: st.total,
      coverage: coverage, accuracy: accuracy, confident: conf >= 1,
      score: Math.max(0, Math.min(1, score))
    };
  }

  function overallReadiness() {
    var num = 0, den = 0;
    DOMAINS.forEach(function (d) {
      num += domainReadiness(d.n).score * d.weight;
      den += d.weight;
    });
    return den ? num / den : 0;
  }

  function readinessBand(v) {
    if (v >= 0.85) return { label: 'Exam ready', cls: 'rb-high' };
    if (v >= 0.6) return { label: 'Nearly there', cls: 'rb-mid' };
    if (v >= 0.3) return { label: 'In progress', cls: 'rb-low' };
    return { label: 'Just starting', cls: 'rb-none' };
  }

  /* Where should the learner go next? One concrete recommendation beats four
     equal-weight cards once they are past the first session. */
  function nextAction() {
    var wrong = QUESTIONS.filter(function (q) {
      var r = store.quiz[q.id]; return r && !r.correct;
    }).length;
    if (wrong >= 5) {
      return { href: '#/drill/wrong', label: 'Review your ' + wrong + ' wrong answers',
               why: 'Clearing mistakes lifts a mock score faster than new material.' };
    }
    var firstUnread = UNITS.filter(function (u) { return !store.done[u.id]; })[0];
    var weakest = DOMAINS.map(function (d) { return domainReadiness(d.n); })
      .filter(function (r) { return r.attempted >= MIN_ATTEMPTS; })
      .sort(function (a, b) { return a.score - b.score; })[0];
    if (weakest && weakest.score < 0.6) {
      return { href: '#/drill/' + weakest.n,
               label: 'Drill Domain ' + weakest.n + ' — ' + weakest.domain.title.split(' & ')[0],
               why: 'Your weakest domain by measured accuracy (' +
                    pct(weakest.correct, weakest.attempted) + '%).' };
    }
    if (firstUnread) {
      return { href: '#/unit/' + firstUnread.id,
               label: 'Continue at ' + firstUnread.id + ' · ' + firstUnread.short,
               why: 'Next unmarked unit in blueprint order.' };
    }
    return { href: '#/exam', label: 'Sit a full mock exam',
             why: 'Every unit is marked complete — time to test under the clock.' };
  }

  function readinessPanel() {
    var overall = overallReadiness();
    var band = readinessBand(overall);
    var act = nextAction();
    var started = doneCount() > 0 || Object.keys(store.quiz).length > 0;

    var h = '<section class="readiness">';
    h += '<div class="rd-head"><h2 id="readiness">Your readiness</h2>' +
      '<span class="rd-band ' + band.cls + '">' + band.label + '</span></div>';

    if (!started) {
      h += '<p class="muted">Nothing tracked yet. Mark units complete and answer practice ' +
        'questions, and this panel will show where you stand against the exam\'s own domain ' +
        'weighting.</p>';
    }

    h += '<div class="rd-overall">' +
      '<div class="rd-ring" style="--p:' + Math.round(overall * 100) + '">' +
        '<span class="rd-pct">' + Math.round(overall * 100) + '%</span></div>' +
      '<div class="rd-copy"><p><b>Weighted readiness across all five domains.</b> ' +
      'Coverage counts for 40%, demonstrated accuracy for 60%, and each domain contributes in ' +
      'proportion to its exam weight — so Domain 1 moves this number nearly twice as much as ' +
      'Domain 5.</p>' +
      '<p class="muted rd-caveat">This is a study signal, not a score prediction. The only ' +
      'number that behaves like the exam is a <a href="#/exam">full mock</a>.</p></div></div>';

    h += '<div class="rd-rows">';
    DOMAINS.forEach(function (d) {
      var r = domainReadiness(d.n);
      var p = Math.round(r.score * 100);
      h += '<div class="rd-row">' +
        '<a class="rd-name" href="#/domain/' + d.n + '"><i class="dom-dot" style="background:' +
          d.color + '"></i>D' + d.n + ' · ' + esc(d.title) + '</a>' +
        '<span class="rd-weight">' + d.weight + '%</span>' +
        '<span class="rd-track"><i style="width:' + p + '%;background:' + d.color + '"></i></span>' +
        '<span class="rd-nums">' + r.doneUnits + '/' + r.units + ' units · ' +
          (r.attempted ? pct(r.correct, r.attempted) + '%' + (r.confident ? '' : '*') : 'no practice') +
        '</span></div>';
    });
    h += '</div>';
    h += '<p class="rd-foot muted">* fewer than ' + MIN_ATTEMPTS +
      ' practice answers in that domain, so its accuracy is discounted here.</p>';

    h += '<a class="rd-next" href="' + act.href + '">' +
      '<span class="rn-kicker">Do this next</span>' +
      '<span class="rn-label">' + esc(act.label) + '</span>' +
      '<span class="rn-why">' + esc(act.why) + '</span></a>';

    h += '</section>';
    return h;
  }

  function vHome() {
    var n = doneCount(), t = UNITS.length;
    var qAtt = Object.keys(store.quiz).length;
    var qOk = Object.keys(store.quiz).filter(function (k) { return store.quiz[k].correct; }).length;
    var best = store.exams.reduce(function (a, e) { return Math.max(a, e.scaled); }, 0);

    var h = '';
    h += '<div class="hero-banner">';
    h += '<span class="crumb">' + M.code + ' · ' + M.guideVersion + ' · effective ' + M.guideEffective + '</span>';
    h += '<h1>Claude Certified Architect — Foundations</h1>';
    h += '<p class="lede">A complete study curriculum and exam simulator for Anthropic\'s ' + M.code +
         ' certification. Thirty learning units — one per official task statement — each with a concept ' +
         'explanation, a worked production example, the mistakes that cost marks, and scenario-based ' +
         'practice questions with full rationale.</p>';
    h += '</div>';

    var wrongN = QUESTIONS.filter(function (q) {
      var r = store.quiz[q.id]; return r && !r.correct;
    }).length;

    h += '<div class="stat-grid">';
    h += statLink('#/domain/1', n + '/' + t, 'Units completed');
    h += statLink('#/drill', qAtt ? pct(qOk, qAtt) + '%' : '—',
                  qAtt ? 'Practice accuracy · ' + qOk + ' of ' + qAtt : 'Practice accuracy');
    h += statLink('#/drill/wrong', wrongN, 'To review');
    h += statLink('#/exam', best ? best : '—', 'Best mock score');
    h += '</div>';

    h += readinessPanel();

    h += '<div class="callout note"><span class="co-t">Read this first</span>' +
      '<p>This site is built <b>from Anthropic\'s own published exam guide</b> (' + M.guideVersion +
      ', effective ' + M.guideEffective + '), not from guesswork. The five domains, their weightings, all ' +
      'thirty task statements, the six scenarios and the in/out-of-scope lists are quoted from that ' +
      'document. Where this site adds something the guide does not state — most importantly the ' +
      'raw-score-to-scaled-score conversion in the mock exam — it says so explicitly on the page.</p>' +
      '<p>It is still an <b>unofficial</b> resource and is not endorsed by Anthropic. ' +
      '<a href="#/sources">See sources &amp; verification →</a></p></div>';

    h += '<h2>Start here</h2>';
    h += '<div class="cards">';
    h += card('#/about', 'Step 1', 'Understand the exam', 'Format, weighting, scoring, and what is explicitly out of scope. Fifteen minutes that will save you hours.', true);
    h += card('#/scenarios', 'Step 2', 'Learn the six scenarios', 'Every question sits inside one of six production contexts. Four appear on your exam. Knowing them tells you what the question is really testing.');
    h += card('#/domain/1', 'Step 3', 'Work the domains', 'Thirty units in blueprint order. Domain 1 alone is 27% of the exam — nearly twice Domain 5.');
    h += card('#/exam', 'Step 4', 'Sit a mock exam', '60 questions, 120 minutes, weighted exactly like the real form. Scored against the 720 cut.');
    h += '</div>';

    h += '<h2>Domains and weighting</h2>';
    h += '<p>Weights are the proportion of the 60 scored items drawn from each domain. Study time should ' +
         'follow the weighting, not your comfort level.</p>';
    h += figure(FIG_WEIGHTS());
    h += '<div class="tablewrap"><table><thead><tr><th>Domain</th><th class="num">Weight</th>' +
         '<th class="num">Items</th><th class="num">Units</th><th class="num">Your progress</th></tr></thead><tbody>';
    DOMAINS.forEach(function (d) {
      var dn = d.units.filter(function (u) { return store.done[u.id]; }).length;
      h += '<tr><td><a href="#/domain/' + d.n + '">D' + d.n + ' · ' + esc(d.title) + '</a></td>' +
        '<td class="num">' + d.weight + '%</td><td class="num">' + d.items + '</td>' +
        '<td class="num">' + d.units.length + '</td>' +
        '<td class="num">' + dn + '/' + d.units.length + '</td></tr>';
    });
    h += '</tbody></table></div>';

    h += '<h2>How to use this site</h2>';
    h += '<ol>' +
      '<li><b>Read the unit, then answer before revealing.</b> The rationale explains why every wrong ' +
      'option is wrong — that is where most of the learning is, because the exam\'s distractors are ' +
      'plausible rather than silly.</li>' +
      '<li><b>Mark units complete</b> as you finish them. Progress is stored in this browser only.</li>' +
      '<li><b>Drill by domain</b> once you have read a domain, to check retention out of order.</li>' +
      '<li><b>Sit the mock exam cold</b>, under the clock, at least twice — once mid-way to find gaps, ' +
      'once near the end to confirm.</li>' +
      '</ol>';

    if (store.exams.length) {
      h += '<h2>Your mock exam history</h2>' + examHistory();
    }
    return h;
  }

  function statLink(href, v, l) {
    return '<a class="stat stat-link" href="' + href + '"><div class="st-v">' + v +
      '</div><div class="st-l">' + esc(l) + '</div></a>';
  }
  function stat(v, l) {
    return '<div class="stat"><div class="st-v">' + v + '</div><div class="st-l">' + esc(l) + '</div></div>';
  }
  function card(href, kicker, title, body, top) {
    return '<a class="card' + (top ? ' card-top' : '') + '" href="' + href + '">' +
      '<span class="kicker">' + esc(kicker) + '</span><h3>' + esc(title) + '</h3><p>' + esc(body) + '</p></a>';
  }

  function FIG_WEIGHTS() {
    var body = '', x = 60, total = 0;
    DOMAINS.forEach(function (d) { total += d.weight; });
    var W = 620;
    DOMAINS.forEach(function (d, i) {
      var w = (d.weight / total) * W;
      body += '<rect x="' + x.toFixed(1) + '" y="44" width="' + (w - 3).toFixed(1) +
        '" height="34" rx="4" fill="' + d.color + '" opacity="0.85"/>';
      body += '<text x="' + (x + w / 2 - 1.5).toFixed(1) + '" y="66" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">' +
        d.weight + '%</text>';
      body += '<text x="' + (x + w / 2 - 1.5).toFixed(1) + '" y="98" text-anchor="middle" font-size="12" font-weight="600">D' + d.n + '</text>';
      body += '<text x="' + (x + w / 2 - 1.5).toFixed(1) + '" y="114" text-anchor="middle" font-size="11" class="dim">' +
        d.items + ' items</text>';
      x += w;
    });
    body += '<text x="60" y="28" font-size="12" class="dim">60 scored items, distributed by domain weight</text>';
    return { vb: '0 0 700 130', body: body, caption: 'Domain weighting on the CCAR-F exam. Domain 1 carries 27% — plan study time accordingly.' };
  }

  function examHistory() {
    var h = '<div class="tablewrap"><table><thead><tr><th>Date</th><th class="num">Raw</th>' +
      '<th class="num">Scaled</th><th>Result</th><th>Review</th></tr></thead><tbody>';
    store.exams.slice().reverse().forEach(function (e, idx) {
      var realIdx = store.exams.length - 1 - idx;
      var revBtn = e.qIds
        ? '<a class="btn small ghost" href="#/exam/result?id=' + (e.id || realIdx) + '">Review items →</a>'
        : '<span class="muted">—</span>';
      h += '<tr><td>' + new Date(e.at).toLocaleString() + '</td>' +
        '<td class="num">' + e.raw + '/' + e.of + '</td>' +
        '<td class="num">' + e.scaled + '</td>' +
        '<td>' + (e.pass ? '<span class="chip ok">Pass</span>' : '<span class="chip bad">Below cut</span>') + '</td>' +
        '<td>' + revBtn + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* --------------------------------------------------------------------- about */

  function vAbout() {
    var h = '';
    h += '<span class="crumb">Exam blueprint</span><h1>What the exam actually is</h1>';
    h += '<p class="lede">Everything in this section is quoted or directly derived from Anthropic\'s ' +
      '<em>Claude Certified Architect – Foundations Exam Guide</em>, ' + M.guideVersion +
      ', effective ' + M.guideEffective + '.</p>';

    h += '<h2>Exam details at a glance</h2>';
    h += '<div class="tablewrap"><table><tbody>' +
      row('Credential', M.name) +
      row('Exam code', '<code>' + M.code + '</code>') +
      row('Number of items', M.items) +
      row('Item format', M.itemFormat) +
      row('Exam structure', M.scenariosShown + ' scenarios drawn from a bank of ' + M.scenariosPool) +
      row('Time limit', M.minutes + ' minutes') +
      row('Delivery', M.delivery) +
      row('Passing score', 'Scaled score of <b>' + M.passScaled + '</b> on a scale of ' + M.scaleMin + '–' + M.scaleMax) +
      row('Exam fee', M.fee) +
      row('Validity period', M.validity + ' from the date the credential is awarded') +
      row('Result reporting', 'Pass/fail with scaled score, plus percent-correct by domain') +
      '</tbody></table></div>';

    h += '<div class="callout rule"><span class="co-t">The arithmetic that matters</span>' +
      '<p>60 items in 120 minutes is <b>two minutes per item</b>. These are scenario questions with four ' +
      'long, plausible options — you cannot afford to re-read a scenario for every question attached to ' +
      'it. Read each scenario once, carefully, then answer its whole cluster.</p></div>';

    h += '<h2>Domains and task statements</h2>';
    h += '<p>Five domains, thirty task statements. Exam items are written directly against these ' +
      'objectives, so the task statement list <em>is</em> the syllabus.</p>';
    DOMAINS.forEach(function (d) {
      h += '<h3><span class="dom-dot" style="display:inline-block;background:' + d.color +
        ';margin-right:.5rem"></span>Domain ' + d.n + ' — ' + esc(d.title) +
        ' <span class="muted">(' + d.weight + '%, ≈' + d.items + ' items)</span></h3>';
      h += '<ul>';
      d.units.forEach(function (u) {
        h += '<li><a href="#/unit/' + u.id + '">' + u.id + '</a> — ' + esc(u.title) + '</li>';
      });
      h += '</ul>';
    });

    h += '<h2>How the exam is scored</h2>';
    h += '<p>It is a <b>criterion-referenced</b> assessment: you are measured against a fixed performance ' +
      'standard, not against other candidates. The 720 cut score was set by a formal standard-setting ' +
      'study in which subject-matter experts judged the performance expected of a minimally qualified ' +
      'candidate. Scaled scoring exists to equate forms of slightly different difficulty.</p>';
    h += '<p>Your score report shows percent-correct per domain, but <b>those per-domain percentages do ' +
      'not determine pass or fail</b> — only the total scaled score does. There is no per-domain minimum ' +
      'you must clear.</p>';

    h += '<div class="callout warn"><span class="co-t">Where this site stops being able to quote the guide</span>' +
      '<p>Because scaled scoring is derived from a standard-setting study and item-level statistics that ' +
      'Anthropic does not publish, <b>no third party can reproduce the real raw-to-scaled conversion</b>. ' +
      'The mock exam on this site uses a transparent linear mapping — ' +
      '<code>scaled = 100 + (raw / 60) × 900</code> — which puts the 720 cut at ' + M.approxRawToPass +
      ' of 60 correct (70%). Treat it as a study signal, not a prediction of your real score.</p></div>';

    h += '<h2>Intended audience and prerequisites</h2>';
    h += '<p>The guide describes the ideal candidate as a <b>solution architect who designs and implements ' +
      'production applications with Claude</b>, typically with <b>6+ months of hands-on experience</b> ' +
      'across the Claude API, Agent SDK, Claude Code and MCP.</p>';
    h += '<div class="callout note"><span class="co-t">An honest word about "beginner"</span>' +
      '<p>This site teaches every concept from first principles and assumes no prior Claude knowledge — ' +
      'so you can learn the material here from zero. But it cannot make the exam a beginner\'s exam. ' +
      'The items are judgment questions about production tradeoffs, and they assume you are comfortable ' +
      'reading JSON, a CLI invocation, and a code-review workflow. If you have never called an HTTP API ' +
      'or used a terminal, budget extra time for the hands-on exercises — reading alone will not get you ' +
      'there.</p></div>';

    h += '<h2>Explicitly in scope</h2>';
    h += '<ul>' + [
      'Agentic loop implementation: control flow based on <code>stop_reason</code>, tool result handling, loop termination',
      'Multi-agent orchestration: coordinator–subagent patterns, task decomposition, parallel execution, iterative refinement',
      'Subagent context management: explicit context passing, structured state persistence, crash recovery using manifests',
      'Tool interface design: writing effective descriptions, splitting vs consolidating, naming to reduce ambiguity',
      'MCP tool and resource design: resources for catalogs, tools for actions, description quality',
      'MCP server configuration: project vs user scope, environment variable expansion, multi-server access',
      'Error handling and propagation: structured errors, transient vs business vs permission, local recovery first',
      'Escalation decision-making: explicit criteria, honouring customer preferences, policy gap identification',
      'CLAUDE.md configuration: hierarchy, <code>@import</code>, <code>.claude/rules/</code> with globs',
      'Custom commands and skills: project vs user scope, <code>context: fork</code>, <code>allowed-tools</code>, <code>argument-hint</code>',
      'Plan mode vs direct execution: complexity assessment, architectural decisions, single-file changes',
      'Iterative refinement: I/O examples, test-driven iteration, interview pattern, sequential vs parallel fixes',
      'Structured output via <code>tool_use</code>: schema design, <code>tool_choice</code>, nullable fields',
      'Few-shot prompting: ambiguous scenario targeting, format consistency, false positive reduction',
      'Batch processing: appropriateness, latency tolerance, failure handling by <code>custom_id</code>',
      'Context window optimization: trimming verbose tool output, structured fact extraction, position-aware ordering',
      'Human review workflows: confidence calibration, stratified sampling, accuracy segmentation',
      'Information provenance: claim-source mappings, temporal data, conflict annotation, coverage gaps'
    ].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>';

    h += '<h2>Explicitly out of scope</h2>';
    h += '<p>The guide lists these as <b>not appearing</b> on the exam. Every hour spent here is wasted.</p>';
    h += '<ul>' + [
      'Fine-tuning Claude models or training custom models',
      'Claude API authentication, billing, or account management',
      'Detailed implementation of specific programming languages or frameworks, beyond tool and schema configuration',
      'Deploying or hosting MCP servers — infrastructure, networking, container orchestration',
      'Claude\'s internal architecture, training process, or model weights',
      'Constitutional AI, RLHF, or safety training methodologies',
      'Embedding models or vector database implementation details',
      'Computer use — browser automation, desktop interaction',
      'Vision / image analysis capabilities',
      'Streaming API implementation or server-sent events',
      'Rate limiting, quotas, or API pricing calculations',
      'OAuth, API key rotation, or authentication protocol details',
      'Specific cloud provider configurations (AWS, GCP, Azure)',
      'Performance benchmarking or model comparison metrics',
      'Prompt caching implementation details, beyond knowing it exists',
      'Token counting algorithms or tokenization specifics'
    ].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>';

    h += '<div class="callout tip"><span class="co-t">Read the out-of-scope list twice</span>' +
      '<p>Notice that RAG and vector databases are <b>out of scope</b>. If you came to this exam expecting ' +
      'a retrieval-heavy syllabus, recalibrate: this is an exam about agent architecture, tool interfaces, ' +
      'Claude Code configuration, structured output and context discipline. Embeddings do not appear.</p></div>';

    h += '<h2>Exam policies worth knowing before you book</h2>';
    h += '<ul>' +
      '<li><b>Retakes:</b> 14 days after a first failure, 30 after a second, 90 after a third; ' +
      'maximum four attempts per exam in a rolling twelve months. The fee applies each time.</li>' +
      '<li><b>Rescheduling:</b> free up to 24 hours before your appointment; inside 24 hours you forfeit the fee.</li>' +
      ' of 60 correct (70%).</p></div>';
    h += '</aside>';

    h += '</div>'; // end about-grid
    return h;
  }

  function row(k, v) {
    return '<tr><th>' + esc(k) + '</th><td>' + v + '</td></tr>';
  }

  /* ----------------------------------------------------------------- scenarios */

  function vScenarios() {
    var h = '<div class="hero-banner">';
    h += '<span class="crumb">Exam structure</span><h1>The six production scenarios</h1>';
    h += '<p class="lede">Every item on the exam sits inside a scenario. Your form presents <b>four of ' +
      'these six</b>, chosen at random. Each scenario names its primary domains — which tells you what ' +
      'kind of judgment its questions will test before you read a single option.</p>';
    h += '</div>';

    h += figure({
      vb: '0 0 700 150',
      body: (function () {
        var b = '<text x="20" y="20" font-size="12" class="dim">Bank of 6 scenarios</text>';
        for (var i = 0; i < 6; i++) {
          var x = 20 + i * 78;
          var on = i < 4;
          b += '<rect x="' + x + '" y="32" width="66" height="40" rx="5" class="' + (on ? 'boxA' : 'box') + '"/>';
          b += '<text x="' + (x + 33) + '" y="57" text-anchor="middle" font-size="12" font-weight="600">S' + (i + 1) + '</text>';
        }
        b += '<text x="510" y="58" font-size="12" class="dim">…</text>';
        b += '<path class="arrow dashed" d="M245 80 L245 100" marker-end="url(#ah)"/>';
        b += '<rect x="20" y="104" width="480" height="34" rx="5" class="boxOk"/>';
        b += '<text x="260" y="126" text-anchor="middle" font-size="12" font-weight="600">Your exam form: 4 scenarios · 60 items total</text>';
        b += '<text x="520" y="126" font-size="11" class="dim">2 scenarios unseen</text>';
        return b;
      })(),
      caption: 'Four of six scenarios appear on any given form — so you must prepare all six.'
    });

    h += '<div class="callout rule"><span class="co-t">Why this matters strategically</span>' +
      '<p>You cannot choose your scenarios, so you cannot skip one. But notice the domain coverage: ' +
      'Scenarios 1, 3 and 4 carry Domain 1 and Domain 2; Scenarios 2, 4 and 5 carry Domain 3; Scenarios 5 ' +
      'and 6 carry Domain 4. Domain 5 rides along with four of the six. <b>Every scenario touches at ' +
      'least one heavily-weighted domain</b> — there is no cheap one.</p></div>';

    h += '<div class="scenarios-grid">';
    CCA.scenarios.forEach(function (s) {
      h += '<div class="sec scenario-card-panel"><h2 class="sec-label">Scenario ' + s.n + '</h2>';
      h += '<h2 style="margin-top:0">' + esc(s.title) + '</h2>';
      h += '<p>' + s.body + '</p>';
      h += '<ul class="chips">';
      s.domains.forEach(function (dn) {
        var d = DOMAINS[dn - 1];
        h += '<li><a class="chip dom" href="#/domain/' + dn + '">D' + dn + ' · ' + esc(d.title) + '</a></li>';
      });
      h += '</ul>';
      h += '<h3>What its questions test</h3><ul>' +
        s.watchFor.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>';
      var qs = QUESTIONS.filter(function (q) { return q.scn === s.n; });
      if (qs.length) {
        h += '<p><a class="btn small primary" href="#/drill/s' + s.n + '">Drill ' + qs.length +
          ' questions set in this scenario →</a></p>';
      }
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  /* -------------------------------------------------------------------- domain */

  function vDomain(n) {
    var d = DOMAINS[n - 1];
    if (!d) return '<h1>Not found</h1><p><a href="#/">Back to overview</a></p>';
    var st = domainQuizStats(d.n);
    var dn = d.units.filter(function (u) { return store.done[u.id]; }).length;

    var h = '<div class="domain-hero-banner" style="border-left: 4px solid ' + d.color + '">';
    h += '<span class="crumb">Domain ' + d.n + ' of 5 · ' + d.weight + '% of the exam</span>';
    h += '<h1>' + esc(d.title) + '</h1>';
    h += '<p class="lede">' + d.blurb + '</p>';
    h += '</div>';

    h += '<div class="stat-grid">';
    h += stat(d.weight + '%', 'Exam weight');
    h += stat('≈' + d.items, 'Items on your form');
    h += stat(dn + '/' + d.units.length, 'Units completed');
    h += stat(st.attempted ? pct(st.correct, st.attempted) + '%' : '—', 'Practice accuracy');
    h += '</div>';

    if (d.orient) h += '<div class="callout note"><span class="co-t">Domain orientation</span>' + d.orient + '</div>';

    h += '<div class="domain-section-header"><h2>Task statements</h2>' +
      '<a class="btn primary small" href="#/drill/' + d.n + '">Drill all ' + st.total +
      ' Domain ' + d.n + ' questions →</a></div>';

    h += '<div class="cards domain-cards-grid">';
    d.units.forEach(function (u) {
      h += '<a class="card domain-unit-card" href="#/unit/' + u.id + '">' +
        '<div class="duc-top">' +
        '<span class="kicker">' + u.id + ' · ⏱ ' + calcReadingTime(u) + ' min</span>' +
        (store.done[u.id] ? '<span class="chip ok small">✓ done</span>' : '<span class="chip warn small">Pending</span>') +
        '</div>' +
        '<h3>' + esc(u.short) + '</h3><p>' + esc(u.title) + '</p></a>';
    });
    h += '</div>';

    return h;
  }

  function calcReadingTime(u) {
    if (!u) return 3;
    var text = (u.concept || '') + ' ' + (u.tldr || '') + ' ' + (u.example || '') + ' ' + (u.exam || '');
    var words = text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    var mins = Math.ceil(words / 200);
    return Math.max(2, mins || 3);
  }

  /* ---------------------------------------------------------------------- unit */

  function vUnit(id) {
    var u = UNIT_BY_ID[id];
    if (!u) return '<h1>Not found</h1><p><a href="#/">Back to overview</a></p>';
    var d = u.domain;
    var idx = UNITS.indexOf(u);
    var prev = UNITS[idx - 1], next = UNITS[idx + 1];

    var h = '';
    h += '<div class="unit-hero-card">';
    h += '<div class="uh-top">';
    h += '<span class="crumb"><a href="#/domain/' + d.n + '">Domain ' + d.n + ' · ' + esc(d.title) + '</a></span>';
    h += '<span class="chip dom">TS ' + u.id + '</span>';
    h += '</div>';
    h += '<h1>' + esc(u.title) + '</h1>';
    h += '<div class="unit-meta">' +
      '<span>Task statement <b>' + u.id + '</b></span>' +
      '<span>Domain weight <b>' + d.weight + '%</b></span>' +
      '<span>' + (u.questions || []).length + ' practice questions</span>' +
      '<span>⏱ ' + calcReadingTime(u) + ' min read</span>' +
      (u.scn ? '<span>Scenarios ' + u.scn.join(', ') + '</span>' : '') +
      '</div>';
    h += '</div>';

    h += '<div class="unit-layout-grid">';
    h += '<div class="unit-main-col">';

    if (u.tldr) {
      h += '<div class="callout rule" id="sec-tldr"><span class="co-t">In one paragraph</span><p>' + u.tldr + '</p></div>';
    }

    h += '<div class="sec" id="sec-concept"><h2 class="sec-label">01 · Concept & Architecture</h2>' + u.concept + '</div>';

    if (u.example) {
      h += '<div class="sec" id="sec-example"><h2 class="sec-label">02 · Worked Production Example</h2>' + u.example + '</div>';
    }

    if (u.mistakes && u.mistakes.length) {
      h += '<div class="sec" id="sec-mistakes"><h2 class="sec-label">03 · Common Mistakes & Edge Cases</h2>';
      h += '<div class="tablewrap"><table><thead><tr><th style="width:38%">Mistake</th>' +
        '<th>Why it fails, and what to do instead</th></tr></thead><tbody>';
      u.mistakes.forEach(function (m) {
        h += '<tr><td><b>' + m.t + '</b></td><td>' + m.d + '</td></tr>';
      });
      h += '</tbody></table></div></div>';
    }

    if (u.exam) {
      h += '<div class="callout trap" id="sec-trap"><span class="co-t">How this is tested on the exam</span>' + u.exam + '</div>';
    }

    if (u.questions && u.questions.length) {
      h += '<div class="sec" id="sec-practice"><h2 class="sec-label">04 · Practice Drill — ' +
        u.questions.length + ' questions</h2>' +
        '<p class="muted">Commit to an answer before checking rationale.</p>' +
        '<div class="quiz" id="quizHost"></div></div>';
    }

    h += '<div class="donebar">' +
      '<span class="db-t">' + (store.done[u.id]
        ? 'You have marked this unit complete.'
        : 'Finished with this unit? Mark it complete to track progress.') + '</span>' +
      '<button class="btn ' + (store.done[u.id] ? '' : 'primary') + '" id="doneBtn">' +
      (store.done[u.id] ? 'Mark as not complete' : 'Mark unit complete') + '</button></div>';

    h += '<div class="pager">';
    h += prev ? '<a class="prev" href="#/unit/' + prev.id + '"><span class="pg-dir">← ' + prev.id +
      '</span><span class="pg-t">' + esc(prev.short) + '</span></a>' : '<span></span>';
    h += next ? '<a class="next" href="#/unit/' + next.id + '"><span class="pg-dir">' + next.id +
      ' →</span><span class="pg-t">' + esc(next.short) + '</span></a>' : '<span></span>';
    h += '</div>';
    h += '</div>'; // end unit-main-col

    // Right Column TOC Sidebar
    h += '<aside class="unit-toc-sidebar">';
    h += '<div class="toc-card">';
    h += '<div class="toc-title">On this page</div>';
    h += '<nav class="toc-nav">';
    if (u.tldr) h += '<a class="toc-link" href="#sec-tldr">Overview</a>';
    h += '<a class="toc-link" href="#sec-concept">01 Concept</a>';
    if (u.example) h += '<a class="toc-link" href="#sec-example">02 Worked Example</a>';
    if (u.mistakes && u.mistakes.length) h += '<a class="toc-link" href="#sec-mistakes">03 Traps & Mistakes</a>';
    if (u.questions && u.questions.length) h += '<a class="toc-link" href="#sec-practice">04 Practice (' + u.questions.length + ')</a>';
    h += '</nav>';
    h += '<div class="toc-hr"></div>';
    h += '<div class="toc-meta-status">';
    h += '<div class="tm-label">Status</div>';
    h += '<div class="tm-val">' + (store.done[u.id] ? '<span class="chip ok">✓ Completed</span>' : '<span class="chip warn">In Progress</span>') + '</div>';
    h += '</div>';
    h += '</div>';
    h += '</aside>';

    h += '</div>'; // end unit-layout-grid
    return h;
  }

  /* The TOC was a static list: on a long unit you could not tell where you were.
     A throttled scroll listener marks the section you are currently reading.
     (IntersectionObserver would also work, but a plain scroll handler is
     deterministic and straightforward to test.) */
  function wireTocSpy() {
    var links = [].slice.call(document.querySelectorAll('.toc-link'));
    if (!links.length) return;

    var sections = links.map(function (a) {
      return document.getElementById((a.getAttribute('href') || '').replace(/^#/, ''));
    });

    var activeId = null;
    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    function update() {
      // The section you are reading is the last one whose heading has passed
      // a line ~30% down the viewport.
      var line = window.innerHeight * 0.3;
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i] && sections[i].getBoundingClientRect().top <= line) current = sections[i].id;
      }
      // Before the first section, highlight the first entry rather than nothing.
      if (!current) {
        current = sections[0] ? sections[0].id : null;
      }
      // At the very bottom, make sure the final section wins even if its top
      // never crosses the line on a short last block.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        for (var j = sections.length - 1; j >= 0; j--) {
          if (sections[j]) { current = sections[j].id; break; }
        }
      }
      if (current) setActive(current);
    }

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () { queued = false; update(); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    view._tocCleanup = function () {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    update();
    view._tocUpdate = update;      // exposed so tests can force a recompute
  }

  function wireUnit(u) {
    wireTocSpy();
    var host = document.getElementById('quizHost');
    if (host && u.questions) {
      u.questions.forEach(function (q, i) {
        host.appendChild(renderQuestion(q, { mode: 'study', n: i + 1, salt: 'u' }));
      });
    }
    var btn = document.getElementById('doneBtn');
    if (btn) {
      btn.addEventListener('click', function () {
        if (store.done[u.id]) delete store.done[u.id];
        else store.done[u.id] = true;
        save(); refreshTop(); buildNav(); route();
      });
    }
  }

  /* --------------------------------------------------------------------- drill */

  /* Review sets. "Wrong" is the single highest-value study surface on the site:
     the questions you actually missed, in one place. "Unseen" closes coverage. */
  function drillPool(sel) {
    if (!sel) return { pool: QUESTIONS, label: 'Every domain', note: null };

    if (sel === 'wrong') {
      return {
        pool: QUESTIONS.filter(function (q) {
          var r = store.quiz[q.id]; return r && !r.correct;
        }),
        label: 'Review — questions I got wrong',
        note: 'Drawn from every question you have answered incorrectly, newest mistakes included. ' +
              'Clearing this set is the most direct way to raise a mock score.'
      };
    }
    if (sel === 'unseen') {
      return {
        pool: QUESTIONS.filter(function (q) { return !store.quiz[q.id]; }),
        label: 'Coverage — questions I have not attempted',
        note: 'Everything in the bank you have not yet answered, in blueprint order.'
      };
    }
    if (sel === 'flagged') {
      return {
        pool: QUESTIONS.filter(function (q) { return store.quiz[q.id] && store.quiz[q.id].flag; }),
        label: 'Marked for another look',
        note: 'Questions you flagged while drilling.'
      };
    }
    if (String(sel).charAt(0) === 's') {
      var sn = +String(sel).slice(1);
      return {
        pool: QUESTIONS.filter(function (q) { return q.scn === sn; }),
        label: 'Scenario ' + sn + ' — ' + (SCN_BY_N[sn] ? SCN_BY_N[sn].title : ''),
        note: null
      };
    }
    var dn = +sel;
    return {
      pool: QUESTIONS.filter(function (q) { return q.d === dn; }),
      label: 'Domain ' + dn + ' — ' + DOMAINS[dn - 1].title, note: null
    };
  }

  function poolStats(pool) {
    var ok = 0, wrong = 0, unseen = 0;
    pool.forEach(function (q) {
      var r = store.quiz[q.id];
      if (!r) unseen++; else if (r.correct) ok++; else wrong++;
    });
    return { ok: ok, wrong: wrong, unseen: unseen, total: pool.length };
  }

  var DRILL_PAGE = 10;

  function vDrill(sel) {
    var d = drillPool(sel);
    var pool = d.pool;
    var wrongN = QUESTIONS.filter(function (q) { var r = store.quiz[q.id]; return r && !r.correct; }).length;
    var unseenN = QUESTIONS.filter(function (q) { return !store.quiz[q.id]; }).length;

    var h = '<span class="crumb">Question drill</span><h1>' + esc(d.label) + '</h1>';
    h += '<p class="lede">' + (d.note ||
      pool.length + ' questions with immediate feedback. Answer before revealing — the rationale for ' +
      'the wrong options is where most of the learning is.') + '</p>';

    /* set switcher, with review sets first because that is what people come back for */
    h += '<ul class="chips">';
    h += '<li><a class="chip' + (sel === 'wrong' ? ' dom' : '') + (wrongN ? ' bad' : '') +
      '" href="#/drill/wrong">✕ Wrong · ' + wrongN + '</a></li>';
    h += '<li><a class="chip' + (sel === 'unseen' ? ' dom' : '') + '" href="#/drill/unseen">' +
      'Unattempted · ' + unseenN + '</a></li>';
    h += '<li><span class="chip-sep" aria-hidden="true"></span></li>';
    h += '<li><a class="chip' + (!sel ? ' dom' : '') + '" href="#/drill">All ' + QUESTIONS.length + '</a></li>';
    DOMAINS.forEach(function (dm) {
      var st = poolStats(QUESTIONS.filter(function (q) { return q.d === dm.n; }));
      h += '<li><a class="chip' + (String(sel) === String(dm.n) ? ' dom' : '') +
        '" href="#/drill/' + dm.n + '" title="' + st.ok + ' correct, ' + st.wrong +
        ' wrong, ' + st.unseen + ' unattempted">D' + dm.n + ' · ' + st.total + '</a></li>';
    });
    h += '</ul>';

    if (!pool.length) {
      h += '<div class="callout tip"><span class="co-t">Nothing here</span><p>' +
        (sel === 'wrong'
          ? 'You have no outstanding wrong answers. Either you have not drilled yet, or you have cleared ' +
            'them all — try <a href="#/drill/unseen">the questions you have not attempted</a> or ' +
            '<a href="#/exam">a full mock exam</a>.'
          : sel === 'unseen'
          ? 'You have attempted every question in the bank. Review <a href="#/drill/wrong">the ones you ' +
            'missed</a>, or sit <a href="#/exam">another mock exam</a> — a fresh form draws different items.'
          : 'This set is empty.') + '</p></div>';
      view._drill = { pool: [], sel: sel };
      return h;
    }

    var st = poolStats(pool);
    h += '<div class="drill-bar">' +
      '<div class="db-stats" id="drillScore">' +
        '<span class="ds ds-ok"><b>' + st.ok + '</b> correct</span>' +
        '<span class="ds ds-bad"><b>' + st.wrong + '</b> wrong</span>' +
        '<span class="ds ds-todo"><b>' + st.unseen + '</b> to go</span>' +
      '</div>' +
      '<div class="db-actions">' +
        '<button class="btn small" id="shuffleBtn">Shuffle</button>' +
        '<button class="btn small" id="resetBtn">Clear my answers</button>' +
      '</div></div>';

    h += '<div class="quiz" id="drillHost"></div>';
    h += '<div class="drill-more" id="drillMore"></div>';
    view._drill = { pool: pool, sel: sel };
    return h;
  }

  function wireDrill(bundle) {
    var pool = bundle.pool || [];
    if (!pool.length) return;
    var host = document.getElementById('drillHost');
    var more = document.getElementById('drillMore');
    var order = pool.slice();
    var shown = 0;

    /* Rendering 150 question cards at once produced a ~290 KB page and invited
       scanning rather than answering. Ten at a time, on demand. */
    function renderPage() {
      var slice = order.slice(shown, shown + DRILL_PAGE);
      slice.forEach(function (q, k) {
        host.appendChild(renderQuestion(q, {
          mode: 'study', n: shown + k + 1, salt: 'dr' + (shown + k),
          onGraded: refreshScore
        }));
      });
      shown += slice.length;
      paintMore();
    }
    function paintMore() {
      if (shown >= order.length) {
        more.innerHTML = '<p class="muted center">That is all ' + order.length +
          ' questions in this set.</p>';
        return;
      }
      more.innerHTML = '<button class="btn primary" id="drillMoreBtn">Show ' +
        Math.min(DRILL_PAGE, order.length - shown) + ' more · ' + shown + ' of ' +
        order.length + ' shown</button>';
      document.getElementById('drillMoreBtn').addEventListener('click', function () {
        renderPage();
        announce(shown + ' of ' + order.length + ' questions shown.');
      });
    }
    function refreshScore() {
      var st = poolStats(pool);
      var box = document.getElementById('drillScore');
      if (!box) return;
      box.innerHTML =
        '<span class="ds ds-ok"><b>' + st.ok + '</b> correct</span>' +
        '<span class="ds ds-bad"><b>' + st.wrong + '</b> wrong</span>' +
        '<span class="ds ds-todo"><b>' + st.unseen + '</b> to go</span>';
    }
    function reset(list) {
      host.innerHTML = ''; shown = 0; order = list; renderPage(); refreshScore();
    }

    renderPage();
    document.getElementById('shuffleBtn').addEventListener('click', function () {
      reset(shuffle(pool));
      announce('Question order shuffled.');
    });
    document.getElementById('resetBtn').addEventListener('click', function () {
      if (!window.confirm('Clear your recorded answers for these ' + pool.length + ' questions?')) return;
      pool.forEach(function (q) { delete store.quiz[q.id]; });
      save(); reset(pool); buildNav();
      announce('Answers cleared for this set.');
    });
  }

  /* ---------------------------------------------------------------------- exam */

  var exam = null; // { qs, state, flags, i, endsAt, timer }

  /* An attempt is 60 items against a 120-minute clock. Holding it only in a
     closure meant a refresh, a crash or a closed tab silently destroyed it.
     We persist the answer state (ids only — questions are re-resolved from the
     bank) and the ABSOLUTE deadline, so the clock keeps honest time. */
  function persistExam() {
    if (!exam) { store.examSaved = null; save(); return; }
    store.examSaved = {
      ids: exam.qs.map(function (q) { return q.id; }),
      state: exam.state, flags: exam.flags, i: exam.i, endsAt: exam.endsAt
    };
    save();
  }
  function clearSavedExam() { store.examSaved = null; save(); }

  function restoreExam() {
    var sv = store.examSaved;
    if (!sv || !sv.ids || !sv.ids.length) return null;
    var byId = {};
    QUESTIONS.forEach(function (q) { byId[q.id] = q; });
    var qs = sv.ids.map(function (id) { return byId[id]; }).filter(Boolean);
    if (qs.length !== sv.ids.length) { clearSavedExam(); return null; }   // bank changed
    return {
      qs: qs, state: sv.state || {}, flags: sv.flags || {},
      i: Math.min(sv.i || 0, qs.length - 1), endsAt: sv.endsAt, restored: true
    };
  }
  function savedExamMinutesLeft() {
    var sv = store.examSaved;
    if (!sv) return 0;
    return Math.max(0, Math.round((sv.endsAt - Date.now()) / 60000));
  }

  function buildExamForm() {
    // Weighted draw matching the official blueprint: 16/11/12/12/9 = 60.
    var picked = [];
    DOMAINS.forEach(function (d) {
      var pool = shuffle(QUESTIONS.filter(function (q) { return q.d === d.n; }));
      picked = picked.concat(pool.slice(0, Math.min(d.items, pool.length)));
    });
    return shuffle(picked);
  }

  function vExamIntro() {
    var h = '<span class="crumb">Assessment</span><h1>Full mock exam</h1>';
    h += '<p class="lede">60 items in 120 minutes, drawn to the official domain weighting — ' +
      DOMAINS.map(function (d) { return d.items + ' from D' + d.n; }).join(', ') +
      '. Scored against the real 720 cut.</p>';

    h += '<div class="tablewrap"><table><tbody>' +
      row('Items', '60, drawn from a bank of ' + QUESTIONS.length) +
      row('Time', '120 minutes, counted down on screen') +
      row('Weighting', DOMAINS.map(function (d) { return 'D' + d.n + ' ' + d.weight + '%'; }).join(' · ')) +
      row('Passing standard', 'Scaled 720 of 1000') +
      row('Feedback', 'Withheld until you submit — like the real thing') +
      '</tbody></table></div>';

    h += '<div class="callout warn"><span class="co-t">How this score is calculated — and why it is an approximation</span>' +
      '<p>Anthropic derives the real scaled score from a standard-setting study and item statistics that ' +
      'are not published, so <b>no third party can reproduce it</b>. This mock uses a deliberately simple, ' +
      'stated mapping:</p><pre><code>scaled = 100 + (raw_correct / 60) × 900</code></pre>' +
      '<p>Under that mapping the 720 cut lands at <b>' + M.approxRawToPass + ' of 60 correct (70%)</b>. ' +
      'A real form could sit either side of that. Use the result to find weak domains, and aim ' +
      'comfortably above the line rather than at it.</p></div>';

    h += '<div class="callout note"><span class="co-t">On multiple-response items</span>' +
      '<p>The real exam mixes multiple-choice and multiple-response items and always tells you how many ' +
      'responses to select. This mock does the same, and marks multiple-response items <b>all-or-nothing</b> ' +
      '— partial credit is not assumed, because the guide does not state that partial credit exists.</p></div>';

    if (store.exams.length) h += '<h2>Your history</h2>' + examHistory();

    var mins = savedExamMinutesLeft();
    if (store.examSaved && mins > 0) {
      var sv = store.examSaved;
      var done = Object.keys(sv.state || {}).filter(function (k) {
        return (sv.state[k] || []).length; }).length;
      h += '<div class="callout tip" id="resumeBox"><span class="co-t">You have an attempt in progress</span>' +
        '<p>' + done + ' of ' + sv.ids.length + ' answered, <b>' + mins +
        ' minute' + (mins === 1 ? '' : 's') + '</b> left on the clock. The countdown runs in real time, ' +
        'so it kept going while you were away.</p>' +
        '<p><button class="btn primary" id="resumeExam">Resume the attempt</button> ' +
        '<button class="btn" id="discardExam">Discard it and start fresh</button></p></div>';
    } else {
      if (store.examSaved) h += '<div class="callout warn"><span class="co-t">Previous attempt expired</span>' +
        '<p>An unfinished attempt ran out of time while you were away. Starting a new one will clear it.</p></div>';
      h += '<p style="margin-top:1.5rem"><button class="btn primary" id="startExam">' +
        'Start the 120-minute mock exam</button></p>';
    }
    return h;
  }

  function vExamRun() {
    var h = '<div class="exam-hud">' +
      '<span class="hud-timer" id="hudTimer">120:00</span>' +
      '<span class="hud-meta" id="hudMeta"></span><span class="hud-spacer"></span>' +
      '<button class="btn small ghost" id="jumpBtn" title="Jump to the first unanswered or flagged item">' +
        'Next open item</button>' +
      '<button class="btn small" id="flagBtn">Flag for review</button>' +
      '<button class="btn small primary" id="submitBtn">Submit exam</button></div>';
    h += '<div class="exam-progress"><div class="ep-fill" id="epFill"></div></div>';
    h += '<div class="palette-legend"><span><i class="lg lg-done"></i>answered</span>' +
      '<span><i class="lg lg-flag"></i>flagged</span><span><i class="lg lg-todo"></i>not yet answered</span>' +
      '<span class="pl-keys"><kbd>←</kbd><kbd>→</kbd> move · <kbd>1</kbd>–<kbd>4</kbd> answer · ' +
      '<kbd>F</kbd> flag</span></div>';
    h += '<div class="palette" id="palette" role="group" aria-label="Jump to question"></div>';
    h += '<div id="examQ"></div>';
    h += '<div class="pager"><button class="btn" id="prevQ">← Previous</button>' +
      '<button class="btn" id="nextQ">Next →</button></div>';
    return h;
  }

  function wireExamRun() {
    var host = document.getElementById('examQ');
    var pal = document.getElementById('palette');

    function paintPalette() {
      var h = '';
      exam.qs.forEach(function (q, i) {
        var answered = (exam.state[q.id] || []).length > 0;
        h += '<button data-i="' + i + '" class="' + (answered ? 'done' : '') +
          (exam.flags[q.id] ? ' flag' : '') + '"' +
          (i === exam.i ? ' aria-current="true"' : '') +
          ' aria-label="Question ' + (i + 1) + (answered ? ', answered' : ', not answered') + '">' +
          (i + 1) + '</button>';
      });
      pal.innerHTML = h;
    }

    function paintQ() {
      var q = exam.qs[exam.i];
      host.innerHTML = '';
      host.appendChild(renderQuestion(q, {
        mode: 'exam', n: exam.i + 1, state: exam.state, salt: 'ex' + exam.i,
        onChange: function () { paintPalette(); paintMeta(); persistExam(); }
      }));
      document.getElementById('flagBtn').textContent =
        exam.flags[q.id] ? 'Unflag' : 'Flag for review';
      document.getElementById('prevQ').disabled = exam.i === 0;
      document.getElementById('nextQ').disabled = exam.i === exam.qs.length - 1;
      paintPalette(); paintMeta();
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function paintMeta() {
      var answered = exam.qs.filter(function (q) { return (exam.state[q.id] || []).length; }).length;
      var flagged = Object.keys(exam.flags).filter(function (k) { return exam.flags[k]; }).length;
      document.getElementById('hudMeta').textContent =
        'Question ' + (exam.i + 1) + ' of ' + exam.qs.length + ' · ' +
        answered + ' answered' + (flagged ? ' · ' + flagged + ' flagged' : '');
      var fill = document.getElementById('epFill');
      if (fill) fill.style.width = pct(answered, exam.qs.length) + '%';
      persistExam();
    }

    pal.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      exam.i = +b.getAttribute('data-i'); paintQ();
    });
    document.getElementById('prevQ').addEventListener('click', function () {
      if (exam.i > 0) { exam.i--; paintQ(); }
    });
    document.getElementById('nextQ').addEventListener('click', function () {
      if (exam.i < exam.qs.length - 1) { exam.i++; paintQ(); }
    });
    document.getElementById('flagBtn').addEventListener('click', function () {
      var q = exam.qs[exam.i];
      exam.flags[q.id] = !exam.flags[q.id];
      announce(exam.flags[q.id] ? 'Question ' + (exam.i + 1) + ' flagged for review.'
                                : 'Flag removed from question ' + (exam.i + 1) + '.');
      persistExam();
      paintQ();
    });
    document.getElementById('submitBtn').addEventListener('click', function () {
      var unanswered = exam.qs.filter(function (q) { return !(exam.state[q.id] || []).length; });
      var flagged = exam.qs.filter(function (q) { return exam.flags[q.id]; });
      var msg = 'Submit your exam for scoring?';
      if (unanswered.length || flagged.length) {
        msg = '';
        if (unanswered.length) msg += unanswered.length + ' unanswered (marked wrong). ';
        if (flagged.length) msg += flagged.length + ' still flagged for review. ';
        msg += '\n\nSubmit anyway?';
      }
      if (window.confirm(msg)) finishExam();
    });

    /* Jump to the first unanswered or flagged item rather than hunting the palette. */
    var jump = document.getElementById('jumpBtn');
    if (jump) jump.addEventListener('click', function () {
      var idx = -1;
      for (var k = 0; k < exam.qs.length; k++) {
        var q = exam.qs[k];
        if (!(exam.state[q.id] || []).length || exam.flags[q.id]) { idx = k; break; }
      }
      if (idx < 0) { announce('Nothing left unanswered or flagged.'); return; }
      exam.i = idx; paintQ();
    });

    // countdown
    function tick() {
      var left = Math.max(0, Math.round((exam.endsAt - Date.now()) / 1000));
      var m = Math.floor(left / 60), s = left % 60;
      var t = document.getElementById('hudTimer');
      if (!t) { clearInterval(exam.timer); return; }
      t.textContent = m + ':' + (s < 10 ? '0' : '') + s;
      t.classList.toggle('low', left < 600);
      t.classList.toggle('critical', left < 120);
      // Announce a few milestones only — an aria-live timer ticking every
      // second would make the page unusable with a screen reader.
      [1800, 600, 300, 60].forEach(function (mark) {
        if (left === mark) announce(Math.round(mark / 60) + ' minutes remaining.', true);
      });
      if (left === 0) { clearInterval(exam.timer); finishExam(true); }
    }
    exam.timer = setInterval(tick, 1000);
    tick();
    paintQ();
  }

  function finishExam(timedOut) {
    clearInterval(exam.timer);
    clearSavedExam();
    var byDomain = {};
    DOMAINS.forEach(function (d) { byDomain[d.n] = { n: 0, ok: 0 }; });
    var raw = 0;
    exam.qs.forEach(function (q) {
      var picked = exam.state[q.id] || [];
      var ok = sameSet(picked, q.ans);
      if (ok) raw++;
      byDomain[q.d].n++;
      if (ok) byDomain[q.d].ok++;
    });
    var of = exam.qs.length;
    var scaled = Math.round(M.scaleMin + (raw / of) * (M.scaleMax - M.scaleMin));
    var pass = scaled >= M.passScaled;

    var rec = {
      id: 'ex_' + Date.now(),
      at: Date.now(),
      raw: raw,
      of: of,
      scaled: scaled,
      pass: pass,
      byDomain: byDomain,
      timedOut: !!timedOut,
      qIds: exam.qs.map(function (q) { return q.id; }),
      state: JSON.parse(JSON.stringify(exam.state))
    };
    store.exams.push(rec); save();
    exam.result = rec;
    location.hash = '#/exam/result';
  }

  function vExamResult(targetId) {
    var r = null;
    if (targetId != null) {
      r = store.exams.filter(function (e, idx) {
        return e.id === targetId || String(e.at) === targetId || String(idx) === targetId;
      })[0];
    }
    if (!r) r = (exam && exam.result) || store.exams[store.exams.length - 1];
    if (!r) return '<h1>No exam result yet</h1><p><a href="#/exam">Sit a mock exam →</a></p>';

    if (r && r.qIds && (!exam || exam.result !== r)) {
      var byId = {};
      QUESTIONS.forEach(function (q) { byId[q.id] = q; });
      var qs = r.qIds.map(function (qid) { return byId[qid]; }).filter(Boolean);
      exam = { qs: qs, state: r.state || {}, result: r };
    }

    var h = '<span class="crumb">Mock exam result</span>';
    h += '<div class="score-hero">' +
      '<div class="sh-verdict ' + (r.pass ? 'pass' : 'fail') + '">' +
      (r.pass ? 'Above the cut' : 'Below the cut') + '</div>' +
      '<div class="sh-scaled">' + r.scaled + '</div>' +
      '<div class="sh-sub">' + r.raw + ' of ' + r.of + ' correct · cut score ' + M.passScaled +
      ' · approximated scale' + (r.timedOut ? ' · time expired' : '') + '</div></div>';

    h += '<div class="callout note"><span class="co-t">Reading this number honestly</span>' +
      '<p>' + r.scaled + ' comes from this site\'s stated linear mapping, not Anthropic\'s scoring model. ' +
      'The signal worth trusting is the <b>per-domain breakdown</b> below and the specific items you ' +
      'missed — not the headline figure.</p></div>';

    h += '<h2>By domain</h2>';
    h += '<p>The real score report also shows percent-correct per domain, and — as on the real exam — ' +
      'these do not gate your pass or fail. Use them to aim your revision.</p>';
    DOMAINS.forEach(function (d) {
      var b = r.byDomain[d.n] || { n: 0, ok: 0 };
      var p = pct(b.ok, b.n);
      h += '<div class="dash-row">' +
        '<span class="dr-name"><a href="#/domain/' + d.n + '">D' + d.n + ' · ' + esc(d.title) + '</a></span>' +
        '<span class="meter ' + (p >= 70 ? 'pass' : 'fail') + '"><i style="width:' + p + '%"></i></span>' +
        '<span class="dr-num">' + b.ok + '/' + b.n + ' · ' + p + '%</span></div>';
    });

    var weak = DOMAINS.filter(function (d) {
      var b = r.byDomain[d.n] || { n: 0, ok: 0 };
      return b.n && pct(b.ok, b.n) < 70;
    });
    if (weak.length) {
      h += '<div class="callout trap"><span class="co-t">Where to go next</span><p>Below 70% in ' +
        weak.map(function (d) { return '<b>D' + d.n + ' ' + esc(d.title) + '</b>'; }).join(', ') +
        '. Re-read those units, then drill them: ' +
        weak.map(function (d) { return '<a href="#/drill/' + d.n + '">D' + d.n + ' drill</a>'; }).join(' · ') +
        '.</p></div>';
    } else {
      h += '<div class="callout tip"><span class="co-t">Where to go next</span><p>No domain below 70%. ' +
        'Sit another form to confirm it holds — the bank is larger than one exam, so a second run draws ' +
        'different items.</p></div>';
    }

    if (exam && exam.qs) {
      h += '<h2>Review every item</h2>';
      h += '<p class="muted">Your answer, the correct answer, and the reasoning for each option.</p>';
      h += '<div class="quiz" id="reviewHost"></div>';
    }
    h += '<p style="margin-top:2rem"><a class="btn primary" href="#/exam">Sit another form</a> ' +
      '<a class="btn" href="#/">Back to overview</a></p>';
    return h;
  }

  function wireExamResult() {
    var host = document.getElementById('reviewHost');
    if (!host || !exam || !exam.qs) return;
    exam.qs.forEach(function (q, i) {
      var node = renderQuestion(q, { mode: 'study', n: i + 1, salt: 'rv' + i });
      host.appendChild(node);
      grade(node, q, exam.state[q.id] || [], false, true);
    });
  }

  /* ---------------------------------------------------------------- flashcards */

  function vFlash() {
    var known = Object.keys(store.fcKnown).length;
    var total = CCA.glossary.length;
    var remaining = total - known;

    var h = '<span class="crumb">Spaced review</span><h1>Flashcards</h1>';
    h += '<p class="lede">' + total + ' cards covering every term this site introduces. ' +
      'Cards you mark as known drop out of the rotation, so the deck narrows to what you ' +
      'still need.</p>';

    h += '<div class="fc-filter-bar">' +
      '<label for="fcDomainSelect" class="fc-filter-label">Filter deck:</label>' +
      '<select id="fcDomainSelect" class="fc-select">' +
      '<option value="0">All Domains (' + total + ' terms)</option>' +
      '<option value="1">Domain 1 · Agentic Architecture &amp; Orchestration</option>' +
      '<option value="2">Domain 2 · Claude API &amp; Technical Implementation</option>' +
      '<option value="3">Domain 3 · Prompt Engineering &amp; System Prompts</option>' +
      '<option value="4">Domain 4 · Safety, Compliance &amp; Alignment</option>' +
      '<option value="5">Domain 5 · Tool Use, MCP &amp; Multimodal</option>' +
      '</select></div>';

    h += '<div class="fc-top">' +
      '<div class="fc-progress" role="img" aria-label="' + known + ' of ' + total + ' cards known">' +
        '<div class="fcp-track"><i style="width:' + pct(known, total) + '%"></i></div>' +
        '<span class="fcp-label"><b>' + known + '</b> of ' + total + ' known</span>' +
      '</div>' +
      '<div class="fc-modes">' +
        '<button class="btn small' + (store.fcReverse ? '' : ' primary') + '" id="fcReverse" ' +
          'aria-pressed="' + (store.fcReverse ? 'false' : 'true') + '">' +
          (store.fcReverse ? 'Definition → term' : 'Term → definition') + '</button>' +
        '<button class="btn small" id="fcShuffle">Shuffle</button>' +
        '<button class="btn small" id="fcReset">Reset known</button>' +
      '</div></div>';

    if (!remaining) {
      h += '<div class="callout tip"><span class="co-t">Deck cleared</span>' +
        '<p>You have marked all ' + total + ' cards as known. The full deck is still available ' +
        'below — reset the deck to start a clean pass, or move on to ' +
        '<a href="#/drill/wrong">the questions you missed</a>.</p></div>';
    }

    h += '<div class="fc-stage"><div class="fc-card" id="fcCard" tabindex="0" role="button" ' +
      'aria-label="Flashcard — activate to flip"></div></div>';
    h += '<div class="fc-bar">' +
      '<button class="btn" id="fcPrev">← Previous</button>' +
      '<button class="btn primary" id="fcKnow">I know this</button>' +
      '<button class="btn" id="fcNext">Next →</button></div>';
    h += '<p class="fc-keys muted center"><kbd>Space</kbd> flip · <kbd>←</kbd><kbd>→</kbd> move · ' +
      '<kbd>K</kbd> know it · <kbd>R</kbd> reverse</p>';
    h += '<p class="center"><span class="chip" id="fcCount"></span></p>';
    return h;
  }

  function wireFlash() {
    var curDomain = 0;
    function buildDeck() {
      var pool = CCA.glossary;
      if (curDomain > 0) {
        pool = pool.filter(function (g) { return g.d === curDomain; });
      }
      var unk = pool.filter(function (g) { return !store.fcKnown[g.t]; });
      return unk.length ? shuffle(unk) : shuffle(pool.slice());
    }
    var deck = buildDeck();
    var i = 0, flipped = false;
    var card = document.getElementById('fcCard');

    var domSel = document.getElementById('fcDomainSelect');
    if (domSel) {
      domSel.addEventListener('change', function () {
        curDomain = +this.value;
        deck = buildDeck();
        i = 0;
        flipped = false;
        paint();
      });
    }

    function unitLink(ref) {
      // ref looks like "1.4" or "2.2 · 5.3" or "Exam blueprint"
      var ids = String(ref || '').match(/\d\.\d/g);
      if (!ids) return ref ? '<span class="fc-ref">' + esc(ref) + '</span>' : '';
      return '<span class="fc-ref">' + ids.map(function (id) {
        return UNIT_BY_ID[id]
          ? '<a href="#/unit/' + id + '">' + id + ' ' + esc(UNIT_BY_ID[id].short) + '</a>'
          : esc(id);
      }).join(' · ') + '</span>';
    }

    function paint() {
      var g = deck[i % deck.length];
      var showTermFirst = !store.fcReverse;
      var front = showTermFirst
        ? '<div class="fc-term">' + esc(g.t) + '</div>'
        : '<div class="fc-def">' + g.d + '</div>';
      var back = showTermFirst
        ? '<div class="fc-def">' + g.d + '</div>' + unitLink(g.ref)
        : '<div class="fc-term">' + esc(g.t) + '</div>' + unitLink(g.ref);

      card.innerHTML = '<div>' + (flipped ? back : front) +
        (flipped ? '' : '<div class="fc-hint">' +
          (showTermFirst ? 'what does this mean?' : 'which term is this?') + '</div>') + '</div>';
      card.classList.toggle('is-back', flipped);

      var counter = document.getElementById('fcCount');
      if (counter) counter.textContent =
        (i % deck.length + 1) + ' / ' + deck.length + ' in rotation · ' +
        Object.keys(store.fcKnown).length + ' marked known';
    }
    function go(step) {
      i = (i + step + deck.length) % deck.length;
      flipped = false; paint();
      announce('Card ' + (i + 1) + ' of ' + deck.length + '.');
    }

    card.addEventListener('click', function () {
      flipped = !flipped; paint();
      if (flipped) announce(card.textContent.trim().slice(0, 180));
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); card.click(); }
    });
    document.getElementById('fcNext').addEventListener('click', function () { go(1); });
    document.getElementById('fcPrev').addEventListener('click', function () { go(-1); });
    document.getElementById('fcKnow').addEventListener('click', function () {
      var g = deck[i % deck.length];
      store.fcKnown[g.t] = true; save();
      announce('“' + g.t + '” marked known.');
      deck.splice(i % deck.length, 1);
      if (!deck.length) { route(); return; }
      i = i % deck.length; flipped = false; paint();
    });
    document.getElementById('fcShuffle').addEventListener('click', function () {
      deck = shuffle(deck); i = 0; flipped = false; paint();
      announce('Deck shuffled.');
    });
    document.getElementById('fcReverse').addEventListener('click', function () {
      store.fcReverse = !store.fcReverse; save(); route();
    });
    document.getElementById('fcReset').addEventListener('click', function () {
      if (!window.confirm('Reset all ' + Object.keys(store.fcKnown).length +
          ' cards you have marked as known?')) return;
      store.fcKnown = {}; save(); route();
    });
    paint();
  }

  /* ------------------------------------------------------------------ glossary */

  function slugTerm(t) {
    return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function vGlossary() {
    var h = '<span class="crumb">Reference</span><h1>Glossary</h1>';
    h += '<p class="lede">' + CCA.glossary.length + ' terms, each linked to the task statement that ' +
      'teaches it. <a href="#/flashcards">Drill these as flashcards →</a></p>';

    h += '<div class="gl-tools">' +
      '<input class="gl-search" id="glSearch" type="search" placeholder="Filter terms and definitions…" ' +
        'aria-label="Filter glossary terms" aria-controls="glList">' +
      '<span class="gl-count" id="glCount"></span></div>';

    /* Letter index — 134 entries is too many to scroll blind. */
    var letters = {};
    CCA.glossary.forEach(function (g) {
      var c = g.t.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(c)) c = '#';
      letters[c] = true;
    });
    h += '<nav class="gl-alpha" aria-label="Jump to letter">';
    '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (c) {
      h += letters[c]
        ? '<button class="gla" data-letter="' + c + '">' + c + '</button>'
        : '<span class="gla off" aria-hidden="true">' + c + '</span>';
    });
    h += '</nav>';

    h += '<ul class="gl-list" id="glList"></ul>';
    return h;
  }

  function wireGlossary() {
    var list = document.getElementById('glList');
    var input = document.getElementById('glSearch');
    var countEl = document.getElementById('glCount');
    var sorted = CCA.glossary.slice().sort(function (a, b) { return a.t.localeCompare(b.t); });

    function refLinks(ref) {
      var ids = String(ref || '').match(/\d\.\d/g);
      if (!ids) return ref ? esc(ref) : '';
      return ids.map(function (id) {
        return UNIT_BY_ID[id]
          ? '<a href="#/unit/' + id + '">' + id + ' ' + esc(UNIT_BY_ID[id].short) + '</a>'
          : esc(id);
      }).join(' · ');
    }

    function paint(f) {
      f = (f || '').trim().toLowerCase();
      var items = sorted.filter(function (g) {
        return !f || g.t.toLowerCase().indexOf(f) > -1 || g.d.toLowerCase().indexOf(f) > -1;
      });
      countEl.textContent = f
        ? items.length + ' of ' + sorted.length + ' shown'
        : sorted.length + ' terms';

      if (!items.length) {
        list.innerHTML = '<li class="muted">No terms match “' + esc(f) + '”. ' +
          '<button class="btn small ghost" id="glClear">Clear the filter</button></li>';
        var c = document.getElementById('glClear');
        if (c) c.addEventListener('click', function () { input.value = ''; paint(''); input.focus(); });
        return;
      }

      var lastLetter = '';
      list.innerHTML = items.map(function (g) {
        var L = /[A-Za-z]/.test(g.t.charAt(0)) ? g.t.charAt(0).toUpperCase() : '#';
        var head = '';
        if (L !== lastLetter && !f) {
          head = '<li class="gl-letter" id="gl-letter-' + L + '" aria-hidden="true">' + L + '</li>';
          lastLetter = L;
        }
        return head + '<li id="gl-' + slugTerm(g.t) + '"><dl><dt>' + esc(g.t) + '</dt>' +
          '<dd>' + g.d + '</dd></dl>' +
          (g.ref ? '<span class="gl-ref">' + refLinks(g.ref) + '</span>' : '') + '</li>';
      }).join('');
    }

    if (input) input.addEventListener('input', function () { paint(this.value); });

    var alphaEl = document.querySelector('.gl-alpha');
    if (alphaEl) {
      alphaEl.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-letter]');
        if (!b) return;
        if (input) input.value = ''; paint('');
        var t = document.getElementById('gl-letter-' + b.getAttribute('data-letter'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    paint('');

    /* Deep link support: #/glossary?t=Batch%20SLA%20arithmetic (used by search). */
    var m = (location.hash || '').match(/[?&]t=([^&]+)/);
    if (m) {
      var want = decodeURIComponent(m[1]);
      var li = document.getElementById('gl-' + slugTerm(want));
      if (li) {
        li.classList.add('gl-hit');
        li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        announce(want + ' — ' + (li.querySelector('dd') || {}).textContent);
      } else {
        input.value = want; paint(want);
      }
    }
  }

  /* ------------------------------------------------------------------ patterns */

  function vPatterns() {
    var h = '<span class="crumb">Reference</span><h1>Answer-pattern cheatsheet</h1>';
    h += '<p class="lede">The CCAR-F rewards a small number of architectural instincts, applied over and ' +
      'over in different costumes. This page is the compressed version — but read it as a summary of the ' +
      'units, not a substitute for them. Pattern-matching without understanding fails on the items where ' +
      'the usual answer is the wrong one.</p>';

    h += '<div class="callout warn"><span class="co-t">The honest caveat</span>' +
      '<p>Heuristics like "hooks beat prompts" are strong on this exam because they reflect real ' +
      'engineering truth. But the exam also contains items where the proportionate answer is the ' +
      'prompt-level fix — official sample question 3 is exactly that: an escalation-calibration problem ' +
      'whose correct answer is <em>explicit criteria plus few-shot examples</em>, not a gate. Always ask ' +
      '<b>what is the root cause</b> and <b>what is proportionate</b>, then apply the heuristic.</p></div>';

    h += '<h2>The three load-bearing ideas</h2>';
    h += '<div class="cards">';
    h += '<div class="card card-top"><span class="kicker">Idea 1</span><h3>Match enforcement to the reliability requirement</h3>' +
      '<p>Prompts are probabilistic; code is deterministic. Money, compliance, irreversibility and ' +
      '"must never" all demand a gate or hook. Style, tone and preference are fine in a prompt.</p></div>';
    h += '<div class="card card-top"><span class="kicker">Idea 2</span><h3>Loop on <code>stop_reason</code>, never on text</h3>' +
      '<p><code>tool_use</code> means run the tool and iterate; <code>end_turn</code> means stop. Parsing ' +
      'prose for "I\'m done", or capping iterations as the primary control, are both anti-patterns.</p></div>';
    h += '<div class="card card-top"><span class="kicker">Idea 3</span><h3>Fix the root cause at its own layer</h3>' +
      '<p>Bad tool selection → descriptions. Bad coverage → coordinator decomposition. Lost citations → ' +
      'upstream output format. Do not answer a design problem with a bigger model.</p></div>';
    h += '</div>';

    h += '<h2>Signals that an option is probably right</h2>';
    h += '<div class="tablewrap"><table><thead><tr><th>Phrase in the option</th><th>Why it wins</th></tr></thead><tbody>' +
      [['programmatic prerequisite gate / tool-call interception hook', 'Deterministic guarantee where the stakes demand one'],
       ['rewrite tool descriptions with inputs, outputs, when to use and when not to', 'Addresses the actual selection mechanism'],
       ['structured error context: failure type, what was attempted, partial results', 'Lets the caller choose a recovery strategy'],
       ['2–4 few-shot examples targeting ambiguous cases, with reasoning', 'Teaches the decision boundary rather than the easy cases'],
       ['nullable field, plus an "other" + detail or "unclear" enum', 'Removes the pressure to fabricate a value'],
       ['<code>tool_use</code> with a JSON schema', 'Eliminates syntax errors structurally'],
       ['preserve both values with source attribution and an explicit conflict annotation', 'Keeps the data landscape intact for the reader'],
       ['independent review instance with no generation context', 'Removes self-review bias at its source'],
       ['per-file passes plus a separate cross-file integration pass', 'Fixes attention dilution instead of masking it'],
       ['key findings at the beginning, with explicit section headers', 'Works with position effects rather than against them'],
       ['<code>context: fork</code> in the skill frontmatter', 'Isolates verbose output from the main session'],
       ['restrict the subagent to the tools its role needs', 'Least privilege; stops cross-specialisation misuse'],
       ['route through the coordinator', 'Preserves observability and consistent error handling'],
       ['ask for an additional identifier', 'Never guess between ambiguous matches']
      ].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</tbody></table></div>';

    h += '<h2>Signals that an option is probably wrong</h2>';
    h += '<div class="tablewrap"><table><thead><tr><th>Phrase in the option</th><th>Why it loses</th></tr></thead><tbody>' +
      [['"Add to the system prompt: always / never …" <span class="muted">(when the requirement is guaranteed compliance)</span>', 'Probabilistic answer to a deterministic requirement'],
       ['"Switch to a more capable model" / "larger context window"', 'Buys capacity, not architecture. Almost always a distractor'],
       ['"Run it three times and take the majority"', 'Suppresses genuine findings that appear intermittently'],
       ['"Average the two conflicting figures"', 'Statistically invalid and destroys provenance'],
       ['"Route on the model\'s self-reported confidence"', 'Uncalibrated — the model is confident precisely where it is wrong'],
       ['"Escalate when sentiment turns negative"', 'Sentiment does not correlate with case complexity'],
       ['"Hardcode the token in <code>.mcp.json</code>"', 'Commits a secret. Use <code>${ENV_VAR}</code> expansion'],
       ['"Let subagents talk to each other directly"', 'Destroys observability, routing and error consistency'],
       ['"Make the field required so the model has to find it"', 'Guarantees fabrication when the value is absent'],
       ['"Consolidate the similar tools into one general tool"', 'Sometimes valid architecture, but rarely the <em>first</em> fix'],
       ['"Add a keyword routing classifier before the model"', 'Bypasses the language understanding you are paying for'],
       ['"Have developers submit smaller PRs"', 'An organisational workaround, not an architectural fix'],
       ['"Strip the markdown fences with a regex"', 'Treats the symptom; use <code>tool_use</code> instead'],
       ['"Return an empty result set marked successful"', 'Silently converts failure into false confidence']
      ].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</tbody></table></div>';

    h += '<h2>Numbers the guide actually states</h2>';
    h += '<div class="tablewrap"><table><thead><tr><th>Value</th><th>Where it comes from</th></tr></thead><tbody>' +
      [['60 items · 120 minutes · 720 of 100–1000 · $125 · 12 months', 'Exam details table'],
       ['27 / 18 / 20 / 20 / 15 %', 'Domain weights — D1 is the heaviest by a wide margin'],
       ['4 scenarios drawn from 6', 'Exam structure'],
       ['$500', 'The refund threshold in the hook example for task statement 1.5'],
       ['80%+', 'First-contact resolution target in Scenario 1'],
       ['12%', 'Rate at which the agent skips <code>get_customer</code> in sample question 1'],
       ['55% vs 80%', 'Escalation miscalibration in sample question 3'],
       ['14 files', 'The PR size that breaks single-pass review in sample question 12'],
       ['45+ files', 'Library migration scale that calls for plan mode (task statement 3.4)'],
       ['18 vs 4–5 tools', 'Tool overload threshold in task statement 2.3'],
       ['50% cheaper · up to 24 hours · no latency SLA', 'Message Batches API (task statement 4.5)'],
       ['4-hour submission windows for a 30-hour SLA', 'Batch scheduling arithmetic (task statement 4.5)'],
       ['2–4 few-shot examples', 'The count the guide actually recommends (task statement 4.2)'],
       ['2–3 concrete I/O examples', 'Iterative refinement (task statement 3.5)'],
       ['6+ months hands-on', 'Intended-audience experience level']
      ].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
      '</tbody></table></div>';

    h += '<div class="callout tip"><span class="co-t">Last-48-hours plan</span>' +
      '<p>Re-read this page and the six <a href="#/scenarios">scenarios</a>. Then sit a ' +
      '<a href="#/exam">mock exam</a> cold and re-read only the units behind the items you missed. ' +
      'Do not start new material.</p></div>';
    return h;
  }

  /* ------------------------------------------------------------------- sources */

  function vSources() {
    var h = '<span class="crumb">Provenance</span><h1>Sources &amp; verification</h1>';
    h += '<p class="lede">This site is built to be self-contained, but a certification about a ' +
      'fast-moving product goes stale. Here is exactly what it was built from, so you can re-check it.</p>';

    h += '<div class="callout rule"><span class="co-t">Verification status</span>' +
      '<p>Exam structure, all five domain names, all five weightings, all thirty task statements, the six ' +
      'scenarios, the scoring model and the in/out-of-scope lists are <b>confirmed against Anthropic\'s own ' +
      'exam guide</b> — not inferred. Verified on <b>' + new Date(M.verifiedOn).toDateString() + '</b> ' +
      'against ' + M.guideVersion + ', effective ' + M.guideEffective + '.</p></div>';

    h += '<h2>Primary sources</h2>';
    CCA.sources.primary.forEach(function (s) {
      h += '<div class="callout"><span class="co-t">Primary</span><p><b><a href="' + s.u +
        '" target="_blank" rel="noopener">' + esc(s.t) + '</a></b></p><p>' + s.note + '</p></div>';
    });

    h += '<h2>Technical references</h2>';
    h += '<p>Used to keep the engineering detail accurate — hook names and blocking semantics, ' +
      '<code>tool_choice</code> modes, batch behaviour, the tools-versus-resources distinction.</p>';
    CCA.sources.technical.forEach(function (s) {
      h += '<div class="callout note"><span class="co-t">Reference</span><p><b><a href="' + s.u +
        '" target="_blank" rel="noopener">' + esc(s.t) + '</a></b></p><p>' + s.note + '</p></div>';
    });

    h += '<h2>What is this site\'s own work, not the guide\'s</h2>';
    h += '<p>Stated plainly, so you never mistake one for the other:</p>';
    h += '<ul>' +
      '<li><b>All concept explanations, diagrams and worked examples.</b> Written for this site, grounded ' +
      'in the guide\'s knowledge-and-skills bullets and the technical references above.</li>' +
      '<li><b>All ' + QUESTIONS.length + ' practice questions except the 12 marked as official.</b> Written ' +
      'to match the style and difficulty of the guide\'s samples. Real exam items are confidential; ' +
      'nothing here is copied from a live form.</li>' +
      '<li><b>The raw-to-scaled score conversion in the mock exam.</b> A stated linear approximation. ' +
      'Anthropic\'s real conversion is not public.</li>' +
      '<li><b>The answer-pattern cheatsheet.</b> An inference from the guide\'s objectives and sample ' +
      'rationales, useful as revision, not authoritative.</li>' +
      '</ul>';

    h += '<div class="callout warn"><span class="co-t">Before you sit the exam</span>' +
      '<p>Download the current exam guide from the Anthropic Partner Academy and compare its ' +
      '<em>Exam Details at a Glance</em> table and blueprint against the ' +
      '<a href="#/about">blueprint page</a> here. If Anthropic has published a version later than ' +
      M.guideVersion + ' (' + M.guideEffective + '), <b>the official guide wins</b> and this site needs ' +
      'updating.</p></div>';

    h += '<h2>Disclaimer</h2>';
    h += '<p>Unofficial and independent. Not affiliated with, authorised by, or endorsed by Anthropic. ' +
      '"Claude" and "Anthropic" are trademarks of Anthropic PBC, used here nominatively to identify the ' +
      'certification being studied. No confidential exam content is reproduced.</p>';
    return h;
  }

  /* ==========================================================================
     ROUTER
     ========================================================================== */

  function startFreshExam() {
    exam = {
      qs: buildExamForm(), state: {}, flags: {}, i: 0,
      endsAt: Date.now() + M.minutes * 60000
    };
    persistExam();
    location.hash = '#/exam/run';
  }

  /* A running attempt is easy to destroy with a stray sidebar click. Ask first,
     and treat a decline as "stay where you are" by restoring the hash. */
  var lastHash = location.hash || '#/';
  var suppressNextRoute = false;

  function examIsLive() {
    return !!(exam && !exam.result && exam.endsAt > Date.now());
  }
  function guardExamExit(targetHash) {
    if (!examIsLive()) return true;
    if (targetHash.indexOf('#/exam/run') === 0 || targetHash.indexOf('#/exam/result') === 0) return true;
    var answered = exam.qs.filter(function (q) { return (exam.state[q.id] || []).length; }).length;
    return window.confirm(
      'You have a mock exam in progress (' + answered + ' of ' + exam.qs.length +
      ' answered). Leaving does not submit it \u2014 the clock keeps running and you can resume ' +
      'from the exam page.\n\nLeave the exam?');
  }

  window.addEventListener('beforeunload', function (e) {
    if (!examIsLive()) return;
    persistExam();
    e.preventDefault();
    e.returnValue = '';                      // browsers show their own wording
  });

  function route() {
    var rawHash = location.hash || '#/';

    /* Anchor links (#sec-concept) are in-page scrolls, not route changes, so
       they must bypass the exam guard entirely. */
    if (rawHash.length > 1 && rawHash.charAt(1) !== '/') {
      var targetId = rawHash.slice(1);
      var targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    if (!guardExamExit(rawHash)) {
      var restore = lastHash;                       // user chose to stay in the exam
      window.setTimeout(function () {
        if (location.hash !== restore) { suppressNextRoute = true; location.hash = restore; }
      }, 0);
      return;
    }
    lastHash = rawHash;

    var hash = rawHash.replace(/^#/, '');
    var query = '';
    var qAt = hash.indexOf('?');
    if (qAt > -1) { query = hash.slice(qAt + 1); hash = hash.slice(0, qAt); }
    var parts = hash.split('/').filter(Boolean);
    var head = parts[0] || '';
    var arg = parts[1];

    // Leaving a running exam? stop the clock.
    if (exam && exam.timer && !(head === 'exam' && !arg)) {
      if (!(head === 'exam' && arg === 'result')) clearInterval(exam.timer);
    }

    var wired = null;

    if (!head) {
      setView(vHome());
    } else if (head === 'about') {
      setView(vAbout());
    } else if (head === 'scenarios') {
      setView(vScenarios());
    } else if (head === 'domain') {
      setView(vDomain(+arg));
    } else if (head === 'unit') {
      var u = UNIT_BY_ID[arg];
      setView(vUnit(arg));
      if (u) wired = function () { wireUnit(u); };
    } else if (head === 'drill') {
      setView(vDrill(arg));
      var bundle = view._drill;
      wired = function () { wireDrill(bundle); };
    } else if (head === 'exam') {
      if (arg === 'run' && exam) {
        setView(vExamRun()); wired = wireExamRun;
      } else if (arg === 'result') {
        var queryId = null;
        var match = query.match(/(?:^|&)id=([^&]+)/);
        if (match) queryId = decodeURIComponent(match[1]);
        setView(vExamResult(queryId)); wired = wireExamResult;
      } else {
        setView(vExamIntro());
        wired = function () {
          var b = document.getElementById('startExam');
          if (b) b.addEventListener('click', startFreshExam);
          var r = document.getElementById('resumeExam');
          if (r) r.addEventListener('click', function () {
            exam = restoreExam();
            if (!exam) { clearSavedExam(); route(); return; }
            location.hash = '#/exam/run';
          });
          var d = document.getElementById('discardExam');
          if (d) d.addEventListener('click', function () {
            if (!window.confirm('Discard the attempt in progress? This cannot be undone.')) return;
            clearSavedExam(); exam = null; route();
          });
        };
      }
    } else if (head === 'flashcards') {
      setView(vFlash()); wired = wireFlash;
    } else if (head === 'glossary') {
      setView(vGlossary()); wired = wireGlossary;
    } else if (head === 'patterns') {
      setView(vPatterns());
    } else if (head === 'sources') {
      setView(vSources());
    } else {
      setView('<h1>Page not found</h1><p><a href="#/">Back to the overview →</a></p>');
    }

    if (wired) wired();
    markCurrent();
    closeNav();
    refreshTop();
    document.title = pageTitle(head, arg) + ' · CCAR-F Study Guide';
    if (!location.hash.match(/#\/exam\/run/)) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function pageTitle(head, arg) {
    if (!head) return 'Overview';
    if (head === 'unit' && UNIT_BY_ID[arg]) return arg + ' ' + UNIT_BY_ID[arg].short;
    if (head === 'domain' && DOMAINS[arg - 1]) return 'D' + arg + ' ' + DOMAINS[arg - 1].title;
    return head.charAt(0).toUpperCase() + head.slice(1);
  }

  // Intercept click on in-page section links (#sec-...) and force SPA re-route on hash clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href && href.length > 1 && href.charAt(1) !== '/') {
      e.preventDefault();
      var id = href.slice(1);
      var el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (href && href.indexOf('#/') === 0) {
      if (href === location.hash) {
        route();
      }
    }
  });

  /* ==========================================================================
     COMMAND PALETTE — global search over units, questions and glossary terms.
     Thirty units, 150 questions and 134 terms with no way to search them was
     the single biggest navigation gap on the site.
     ========================================================================== */

  var PALETTE_INDEX = null;

  function buildIndex() {
    if (PALETTE_INDEX) return PALETTE_INDEX;
    var ix = [];
    function strip(h) { return String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }

    DOMAINS.forEach(function (d) {
      ix.push({
        kind: 'Domain', label: 'D' + d.n + ' · ' + d.title,
        sub: d.weight + '% of the exam · ' + d.units.length + ' task statements',
        href: '#/domain/' + d.n, hay: (d.title + ' ' + strip(d.blurb)).toLowerCase()
      });
      d.units.forEach(function (u) {
        ix.push({
          kind: 'Unit', label: u.id + ' · ' + u.short,
          sub: u.title, href: '#/unit/' + u.id,
          hay: (u.id + ' ' + u.short + ' ' + u.title + ' ' + strip(u.tldr)).toLowerCase()
        });
      });
    });
    QUESTIONS.forEach(function (q) {
      var stem = strip(q.stem);
      ix.push({
        kind: 'Question', label: stem.slice(0, 96) + (stem.length > 96 ? '…' : ''),
        sub: 'D' + q.d + ' · task statement ' + q.ts + (q.official ? ' · official sample' : ''),
        href: '#/unit/' + q.ts, hay: (stem + ' ' + q.opts.map(strip).join(' ')).toLowerCase()
      });
    });
    CCA.glossary.forEach(function (g) {
      ix.push({
        kind: 'Term', label: g.t, sub: strip(g.d).slice(0, 110) + '…',
        href: '#/glossary?t=' + encodeURIComponent(g.t),
        hay: (g.t + ' ' + strip(g.d)).toLowerCase()
      });
    });
    [['Exam blueprint', '#/about'], ['The 6 scenarios', '#/scenarios'],
     ['Full mock exam', '#/exam'], ['Flashcards', '#/flashcards'],
     ['Answer-pattern cheatsheet', '#/patterns'], ['Sources & verification', '#/sources'],
     ['Review my wrong answers', '#/drill/wrong'], ['Questions not yet attempted', '#/drill/unseen']
    ].forEach(function (p) {
      ix.push({ kind: 'Page', label: p[0], sub: '', href: p[1], hay: p[0].toLowerCase() });
    });
    PALETTE_INDEX = ix;
    return ix;
  }

  var KIND_RANK = { Page: 0, Domain: 1, Unit: 2, Term: 3, Question: 4 };

  function searchIndex(qstr) {
    var terms = qstr.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return buildIndex().map(function (row) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var at = row.hay.indexOf(terms[i]);
        if (at < 0) return null;                       // every term must appear
        score += at < 40 ? 3 : 1;                      // early matches rank higher
        if (row.label.toLowerCase().indexOf(terms[i]) > -1) score += 4;
      }
      return { row: row, score: score - KIND_RANK[row.kind] * 0.5 };
    }).filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 40).map(function (x) { return x.row; });
  }

  var palette = null;

  function openPalette(seed) {
    if (palette) return;
    palette = el(
      '<div class="palette-overlay" id="cmdk">' +
       '<div class="palette-box" role="dialog" aria-modal="true" aria-label="Search the study guide">' +
        '<div class="palette-input"><span class="pi-icon" aria-hidden="true">⌕</span>' +
         '<input id="cmdkInput" type="text" autocomplete="off" spellcheck="false" ' +
                'placeholder="Search units, questions and terms…" aria-label="Search query" ' +
                'aria-controls="cmdkList" aria-autocomplete="list">' +
         '<kbd>Esc</kbd></div>' +
        '<div class="palette-results" id="cmdkList" role="listbox" aria-label="Search results"></div>' +
        '<div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span>' +
          '<span><kbd>↵</kbd> open</span><span id="cmdkCount"></span></div>' +
       '</div></div>');
    document.body.appendChild(palette);
    document.body.classList.add('palette-open');

    var input = palette.querySelector('#cmdkInput');
    var list = palette.querySelector('#cmdkList');
    var countEl = palette.querySelector('#cmdkCount');
    var rows = [], sel = 0;

    function paint() {
      if (!input.value.trim()) {
        list.innerHTML =
          '<div class="palette-hint">Try <b>batch</b>, <b>PreToolUse</b>, <b>escalate</b>, ' +
          '<b>tool_choice</b>, or a task statement number like <b>1.4</b>.</div>';
        countEl.textContent = ''; rows = []; return;
      }
      rows = searchIndex(input.value);
      if (!rows.length) {
        list.innerHTML = '<div class="palette-hint">No matches for “' + esc(input.value) + '”.</div>';
        countEl.textContent = '0 results'; return;
      }
      sel = Math.min(sel, rows.length - 1);
      list.innerHTML = rows.map(function (r, i) {
        return '<a class="palette-row' + (i === sel ? ' sel' : '') + '" role="option"' +
          ' aria-selected="' + (i === sel) + '" href="' + r.href + '" data-i="' + i + '">' +
          '<span class="pr-kind pr-' + r.kind.toLowerCase() + '">' + r.kind + '</span>' +
          '<span class="pr-main"><span class="pr-label">' + esc(r.label) + '</span>' +
          (r.sub ? '<span class="pr-sub">' + esc(r.sub) + '</span>' : '') + '</span></a>';
      }).join('');
      countEl.textContent = rows.length + (rows.length === 1 ? ' result' : ' results');
      var selEl = list.querySelector('.palette-row.sel');
      if (selEl) selEl.scrollIntoView({ block: 'nearest' });
    }

    function go(i) {
      var r = rows[i];
      if (!r) return;
      closePalette();
      location.hash = r.href;
    }

    input.addEventListener('input', function () { sel = 0; paint(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, rows.length - 1); paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(sel); }
      else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    });
    list.addEventListener('click', function (e) {
      var a = e.target.closest('.palette-row');
      if (a) { e.preventDefault(); go(+a.getAttribute('data-i')); }
    });
    palette.addEventListener('mousedown', function (e) {
      if (e.target === palette) closePalette();
    });

    input.value = seed || '';
    paint();
    input.focus();
  }

  function closePalette() {
    if (!palette) return;
    palette.remove(); palette = null;
    document.body.classList.remove('palette-open');
  }

  function toggleShortcutsModal() {
    var existing = document.getElementById('shortcutsModal');
    if (existing) { existing.remove(); return; }
    var modal = el(
      '<div class="diag-modal-backdrop" id="shortcutsModal" style="display:flex;">' +
        '<div class="diag-modal-content" style="max-width:540px;padding:2rem;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">' +
            '<h3 style="margin:0;font-size:1.25rem;">Keyboard Shortcuts</h3>' +
            '<button class="iconbtn" id="closeShortcutsModal" aria-label="Close modal">✕</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:auto 1fr;gap:0.75rem 1.5rem;align-items:center;font-size:0.925rem;">' +
            '<kbd class="sb-kbd">⌘K / /</kbd><span>Open Global Search</span>' +
            '<kbd class="sb-kbd">?</kbd><span>Toggle Shortcuts Help</span>' +
            '<kbd class="sb-kbd">J / K</kbd><span>Next / Previous Unit</span>' +
            '<kbd class="sb-kbd">M</kbd><span>Toggle Unit Complete</span>' +
            '<kbd class="sb-kbd">Space</kbd><span>Flip Flashcard</span>' +
            '<kbd class="sb-kbd">← / →</kbd><span>Prev / Next Flashcard or Question</span>' +
            '<kbd class="sb-kbd">1 - 9</kbd><span>Select Question Option</span>' +
            '<kbd class="sb-kbd">F</kbd><span>Flag Question for Review</span>' +
            '<kbd class="sb-kbd">Esc</kbd><span>Close Modals / Drawers</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.id === 'closeShortcutsModal' || e.target.closest('#closeShortcutsModal')) modal.remove();
    });
  }

  function isTyping(e) {
    var t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      if (!isTyping(e)) {
        e.preventDefault();
        toggleShortcutsModal();
        return;
      }
    }
    /* palette: Cmd/Ctrl-K anywhere, or "/" when not typing */
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault(); palette ? closePalette() : openPalette(); return;
    }
    if (e.key === '/' && !isTyping(e) && !palette) { e.preventDefault(); openPalette(); return; }
    if (e.key === 'Escape') {
      var dm = document.getElementById('diagramModal');
      if (dm) { dm.remove(); return; }
      var sm = document.getElementById('shortcutsModal');
      if (sm) { sm.remove(); return; }
      if (palette) { closePalette(); return; }
      if (navIsOpen()) { closeNav(); return; }
    }
    if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;

    var hash = location.hash || '';

    /* exam: arrows page, F flags, digits pick an option */
    if (/#\/exam\/run/.test(hash) && exam) {
      if (e.key === 'ArrowRight') { e.preventDefault(); clickIf('nextQ'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); clickIf('prevQ'); }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); clickIf('flagBtn'); }
      else if (/^[1-9]$/.test(e.key)) {
        var card = document.querySelector('#examQ .q');
        var opt = card && card.querySelector('.opt[data-i="' + (+e.key - 1) + '"] input');
        if (opt) { e.preventDefault(); opt.click(); }
      }
      return;
    }

    /* flashcards: space flips, arrows move, K marks known, R reverses */
    if (/#\/flashcards/.test(hash)) {
      if (e.key === ' ') { e.preventDefault(); var c = document.getElementById('fcCard'); if (c) c.click(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); clickIf('fcNext'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); clickIf('fcPrev'); }
      else if (e.key === 'k' || e.key === 'K') { e.preventDefault(); clickIf('fcKnow'); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); clickIf('fcReverse'); }
      return;
    }

    /* units: J/K walk the blueprint, M marks complete */
    if (/#\/unit\//.test(hash)) {
      if (e.key === 'j' || e.key === 'J') { var n = document.querySelector('.pager a.next'); if (n) location.hash = n.getAttribute('href'); }
      else if (e.key === 'k' || e.key === 'K') { var p = document.querySelector('.pager a.prev'); if (p) location.hash = p.getAttribute('href'); }
      else if (e.key === 'm' || e.key === 'M') { clickIf('doneBtn'); }
    }
  });

  function clickIf(id) {
    var b = document.getElementById(id);
    if (b && !b.disabled) b.click();
  }

  var searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function () { openPalette(); });
    if (!/Mac|iPhone|iPad/.test(navigator.platform || '')) {
      var k = searchBtn.querySelector('.sb-kbd');
      if (k) k.textContent = 'Ctrl K';
    }
  }

  var sBtn = document.getElementById('shortcutsBtn');
  if (sBtn) sBtn.addEventListener('click', toggleShortcutsModal);
  var fsBtn = document.getElementById('footerShortcutsBtn');
  if (fsBtn) fsBtn.addEventListener('click', toggleShortcutsModal);

  window.addEventListener('hashchange', function () {
    if (suppressNextRoute) { suppressNextRoute = false; return; }
    route();
  });
  /* A refresh on #/exam/run used to land on the intro with the attempt gone.
     Rehydrate only for that route — restoring globally would make the exam
     guard fire on ordinary browsing right after a page load. */
  if (/^#\/exam\/run/.test(location.hash || '') && savedExamMinutesLeft() > 0) {
    exam = restoreExam();
    if (exam) lastHash = location.hash;
  }

  buildNav();
  route();

  // Rebuild the nav ticks whenever completion changes via the unit button.
  window.addEventListener('hashchange', buildNav);
})();
