/* ==========================================================================
   motion.js — Fast, Clean Interaction Layer
   - Smooth mouse spotlight ambient background
   - Number counter rollups (composite-value safe)
   - View entrance fade

   Counter note: values on this site are rarely bare numbers — they look like
   "0/30", "≈16", "27%", "—". An earlier version stripped non-digits, tweened
   the remainder and re-appended the leftovers, which turned "0/30" into "30/"
   and "≈16" into "16≈". It now tweens only the FIRST numeric run and rebuilds
   the string around it in place, so prefix and suffix stay where the author
   put them. Ratios like "0/30" are left alone entirely — animating the first
   half of a fraction reads as a wrong number rather than as motion.
   ========================================================================== */

(function () {
  'use strict';

  var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------- 1. Mouse Ambient Spotlight */
  if (!isReduced) {
    var spotlight = document.createElement('div');
    spotlight.id = 'mouse-spotlight';
    spotlight.className = 'mouse-spotlight';
    document.body.appendChild(spotlight);

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var spotX = mouseX;
    var spotY = mouseY;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    (function updateSpotlight() {
      spotX += (mouseX - spotX) * 0.15;
      spotY += (mouseY - spotY) * 0.15;
      spotlight.style.transform =
        'translate3d(' + (spotX - 250) + 'px, ' + (spotY - 250) + 'px, 0px)';
      requestAnimationFrame(updateSpotlight);
    })();
  }

  /* -------------------------------------------------- 2. Tweening helper */
  /* Uses GSAP when it is available and falls back to requestAnimationFrame,
     so the site behaves identically offline or when the CDN is blocked. */
  function tween(duration, onStep, onDone) {
    if (typeof gsap !== 'undefined') {
      var o = { t: 0 };
      gsap.to(o, {
        t: 1, duration: duration, ease: 'power2.out',
        onUpdate: function () { onStep(o.t); },
        onComplete: function () { onStep(1); if (onDone) onDone(); }
      });
      return;
    }
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / (duration * 1000));
      onStep(1 - Math.pow(1 - p, 3));           // easeOutCubic
      if (p < 1) requestAnimationFrame(frame);
      else { onStep(1); if (onDone) onDone(); }
    }
    requestAnimationFrame(frame);
  }

  /* -------------------------------------------------- 3. Counters */
  var NUM = /-?\d+(?:\.\d+)?/;

  function animateCounters() {
    document.querySelectorAll('.st-v').forEach(function (el) {
      if (el._hasAnimated) return;
      var raw = el.textContent.trim();

      // A ratio is two facts, not one quantity. Leave it as authored.
      if (/\d\s*\/\s*\d/.test(raw)) { el._hasAnimated = true; return; }

      var m = raw.match(NUM);
      if (!m) { el._hasAnimated = true; return; }

      var target = parseFloat(m[0]);
      if (!isFinite(target) || target === 0) { el._hasAnimated = true; return; }

      var decimals = (m[0].split('.')[1] || '').length;
      var before = raw.slice(0, m.index);
      var after = raw.slice(m.index + m[0].length);
      el._hasAnimated = true;

      if (isReduced) { el.textContent = raw; return; }

      /* Safety net: the roll-up is driven by requestAnimationFrame, which is
         throttled or starved in a background tab (and in headless testing). A
         dashboard must never be left showing a partially-counted figure, so a
         timer forces the authored value regardless of how the tween fared. */
      var landed = false;
      function land() { if (!landed) { landed = true; el.textContent = raw; } }
      window.setTimeout(land, 900);

      tween(0.55, function (p) {
        if (landed) return;
        var v = target * p;
        el.textContent = before + (decimals ? v.toFixed(decimals) : Math.round(v)) + after;
      }, land);
    });
  }

  function animateScore() {
    var el = document.querySelector('.sh-scaled');
    if (!el || el._hasAnimated) return;
    var target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;
    el._hasAnimated = true;
    if (isReduced) return;
    var from = Math.round(target * 0.4);
    var landed = false;
    function land() { if (!landed) { landed = true; el.textContent = target; } }
    window.setTimeout(land, 1900);
    tween(1.4, function (p) {
      if (landed) return;
      el.textContent = Math.round(from + (target - from) * p);
    }, land);
  }

  /* -------------------------------------------------- 4. View entrance */
  function wireMotion() {
    var view = document.getElementById('view');
    if (view) {
      view.style.opacity = '1';
    }
    setTimeout(function () {
      animateCounters();
      animateScore();
    }, 50);
  }

  window.addEventListener('hashchange', wireMotion);
  setTimeout(wireMotion, 100);
  window.refreshMotion = wireMotion;
})();
