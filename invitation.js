// invitation.js — gated script with "Replay Invitation" on final slide
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  function getQueryParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  /* ---------- Reveal / Overlay handling ---------- */
  function revealOverlayAndInit() {
    const overlay = document.getElementById('coverOverlay');
    const invitationRoot = document.getElementById('invitationRoot');

    if (!overlay) {
      // nothing to reveal: init immediately
      window.initInvitation && window.initInvitation();
      return;
    }

    // Prevent repeated calls
    if (overlay.dataset.revealing === 'true') return;
    overlay.dataset.revealing = 'true';

    // mark invitation hidden to assistive tech until removed
    if (invitationRoot) invitationRoot.setAttribute('aria-hidden', 'true');

    // Trigger CSS opening animation (classes expected in HTML/CSS)
    overlay.classList.add('opening');
    requestAnimationFrame(() => overlay.classList.add('opened'));

    // At animation end remove the overlay and init invitation
    const onEnd = (e) => {
      if (e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;
      overlay.removeEventListener('transitionend', onEnd);

      // remove overlay from DOM for clean state
      try { overlay.parentElement && overlay.parentElement.removeChild(overlay); } catch (err) {}

      // unhide invitation for screen readers
      if (invitationRoot) invitationRoot.removeAttribute('aria-hidden');

      // run main init
      if (typeof window.initInvitation === 'function') {
        // small timeout to allow CSS paint to settle
        setTimeout(() => window.initInvitation(), 80);
      } else {
        // fallback safety
        setTimeout(() => { console.warn('initInvitation not found'); }, 80);
      }
    };

    overlay.addEventListener('transitionend', onEnd);
  }

  function bindOverlayControls() {
    const openBtn = document.getElementById('openInviteBtn');
    const overlay = document.getElementById('coverOverlay');

    if (!overlay) return;

    // Click on button or overlay card should reveal
    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        revealOverlayAndInit();
      });
      openBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); revealOverlayAndInit(); }
      });
    }

    // clicking anywhere on overlay also reveals
    overlay.addEventListener('click', function (e) {
      // if user clicked backdrop or the card, accept it
      if (e.target === overlay || e.target.closest('.cover-card')) revealOverlayAndInit();
    });

    // allow Escape / Enter to reveal (accessibility)
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Enter') && document.getElementById('coverOverlay')) {
        revealOverlayAndInit();
      }
    });
  }

  /* ---------- Core invitation logic (initializes only when called) ---------- */
  (function defineInit() {
    // keep internal timers so we can stop them if needed later
    let countdownTimer = null;
    let autoSlideInterval = null;
    let sparkleTimer = null;

    function formatPad(n) { return Math.max(0, n).toString().padStart(2, '0'); }

    function updateCountdown() {
      const weddingDate = new Date('November 7, 2025 18:00:00').getTime();
      if (countdownTimer) clearInterval(countdownTimer);
      countdownTimer = setInterval(() => {
        const now = Date.now();
        const distance = weddingDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dEl = document.getElementById('days');
        const hEl = document.getElementById('hours');
        const mEl = document.getElementById('minutes');
        const sEl = document.getElementById('seconds');

        if (dEl) dEl.textContent = formatPad(days);
        if (hEl) hEl.textContent = formatPad(hours);
        if (mEl) mEl.textContent = formatPad(minutes);
        if (sEl) sEl.textContent = formatPad(seconds);

        if (distance < 0) {
          clearInterval(countdownTimer);
          const titleEl = document.querySelector('.countdown-title');
          if (titleEl) titleEl.textContent = 'The Wedding Day is Here! 🎉';
        }
      }, 1000);
    }

    // Slide helpers (simple enough to control)
    let currentSlideIndex = 1;

    function getVisibleSlides() {
      const guestSide = getQueryParameter('side') || 'bride';
      const onlyWedding = getQueryParameter('onlyWedding') === 'true';
      const allSlides = Array.from(document.querySelectorAll('.slide'));
      if (onlyWedding) {
        const filtered = allSlides.filter(slide => {
          const showFor = slide.getAttribute('data-show-for');
          const excluded = slide.getAttribute('data-exclude-on-only-wedding') === 'true';
          const matchesSide = !showFor || showFor === guestSide;
          return matchesSide && !excluded;
        });
        return filtered.length ? filtered : allSlides.filter(s => s.getAttribute('data-wedding') === 'true');
      }
      return allSlides.filter(slide => {
        const showFor = slide.getAttribute('data-show-for');
        return !showFor || showFor === guestSide;
      });
    }

    function renderDots(visibleSlides) {
      const dotsContainer = document.querySelector('.slide-dots');
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      visibleSlides.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx + 1));
        dotsContainer.appendChild(dot);
      });
    }

    function showSlide(n) {
      const visible = getVisibleSlides();
      const allSlides = Array.from(document.querySelectorAll('.slide'));
      const dots = Array.from(document.querySelectorAll('.dot'));
      if (!visible.length) return;
      if (n > visible.length) currentSlideIndex = visible.length;
      if (n < 1) currentSlideIndex = 1;

      allSlides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      const active = visible[currentSlideIndex - 1];
      if (active) active.classList.add('active');
      if (dots[currentSlideIndex - 1]) dots[currentSlideIndex - 1].classList.add('active');

      const prevArrow = document.querySelector('.prev-slide');
      const nextArrow = document.querySelector('.next-slide');
      if (prevArrow && nextArrow) {
        prevArrow.style.opacity = (currentSlideIndex === 1) ? '0' : '1';
        prevArrow.style.pointerEvents = (currentSlideIndex === 1) ? 'none' : 'auto';
        // nextArrow disabled on last slide
        nextArrow.style.opacity = (currentSlideIndex === visible.length) ? '0' : '1';
        nextArrow.style.pointerEvents = (currentSlideIndex === visible.length) ? 'none' : 'auto';
      }

      // If we reached the last slide, stop auto sliding and show replay button
      if (currentSlideIndex === visible.length) {
        if (autoSlideInterval) { clearInterval(autoSlideInterval); autoSlideInterval = null; }
        showReplayButton();
      } else {
        hideReplayButton();
      }
    }

    function goToSlide(n) { currentSlideIndex = n; showSlide(currentSlideIndex); restartAutoSlide(); }
    function changeSlide(dir) {
      const visible = getVisibleSlides();
      const newIndex = currentSlideIndex + dir;
      // do not wrap on manual navigation either; clamp within bounds
      if (newIndex < 1) currentSlideIndex = 1;
      else if (newIndex > visible.length) currentSlideIndex = visible.length;
      else currentSlideIndex = newIndex;
      showSlide(currentSlideIndex);
      restartAutoSlide();
    }

    // Auto-step: progress only while not at final slide
    function autoStep() {
      const visible = getVisibleSlides();
      if (currentSlideIndex < visible.length) {
        currentSlideIndex += 1;
        showSlide(currentSlideIndex);
      } else {
        // reached last slide -> stop and show replay
        if (autoSlideInterval) { clearInterval(autoSlideInterval); autoSlideInterval = null; }
        showReplayButton();
      }
    }

    function restartAutoSlide() {
      // stop any existing interval
      if (autoSlideInterval) { clearInterval(autoSlideInterval); autoSlideInterval = null; }
      const visible = getVisibleSlides();
      // only start auto slide if there are >1 slides and we're not already on last
      if (visible.length > 1 && currentSlideIndex < visible.length) {
        autoSlideInterval = setInterval(autoStep, 7000);
      }
    }

    // Sparkles & confetti (lightweight)
    function createSparkle() {
      const container = document.querySelector('.invitation-card');
      if (!container) return;
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.cssText = `position:absolute;width:4px;height:4px;background:#d4af37;border-radius:50%;pointer-events:none;animation:sparkleFloat 2s ease-out forwards;left:${Math.random()*100}%;top:${Math.random()*100}%;box-shadow:0 0 10px #d4af37;`;
      container.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 2000);
    }
    function startSparkles() { if (sparkleTimer) clearInterval(sparkleTimer); sparkleTimer = setInterval(createSparkle, 500); }
    function stopSparkles() { if (sparkleTimer) clearInterval(sparkleTimer); sparkleTimer = null; }

    function createConfettiBurst() {
      const colors = ['#d4af37', '#ffc0cb', '#ffb6c1', '#fff', '#e6d5b8'];
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          const c = document.createElement('div');
          c.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}vw;top:-10px;opacity:0.9;border-radius:${Math.random()>0.5?'50%':'0'};animation:confettiFall ${3+Math.random()*3}s linear forwards;z-index:9999;pointer-events:none;`;
          document.body.appendChild(c);
          setTimeout(() => c.remove(), 7000);
        }, i * 40);
      }
    }

    // small UI bindings
    function bindDetailHover() {
      document.querySelectorAll('.detail-item').forEach(item => {
        item.addEventListener('mouseenter', function () {
          this.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
          this.style.borderRadius = '15px';
        });
        item.addEventListener('mouseleave', function () {
          this.style.backgroundColor = 'transparent';
        });
      });
    }
    function bindKeyboardNav() {
      document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') changeSlide(-1);
        if (e.key === 'ArrowRight') changeSlide(1);
      });
    }

    function tryPlayMusic() {
      const music = document.getElementById('bgMusic');
      if (!music) return;
      music.play().catch(() => {
        document.body.addEventListener('click', function playOnce() {
          music.play();
          document.body.removeEventListener('click', playOnce);
        }, { once: true });
      });
    }

    /* ---------- Replay button logic ---------- */
    function createReplayButtonElement() {
      // Only create once
      if (document.getElementById('replayBtn')) return document.getElementById('replayBtn');

      const btn = document.createElement('button');
      btn.id = 'replayBtn';
      btn.type = 'button';
      btn.textContent = 'Replay Invitation';
      btn.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:9998;padding:12px 18px;border-radius:999px;border:none;background:linear-gradient(90deg,#d4af37,#ffd88a);color:#221;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.18);cursor:pointer;';
      btn.addEventListener('click', function() {
        // go to first slide and restart auto
        currentSlideIndex = 1;
        showSlide(1);
        hideReplayButton();
        restartAutoSlide();
      });
      // keyboard accessible
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });

      document.body.appendChild(btn);
      return btn;
    }

    function showReplayButton() {
      const visible = getVisibleSlides();
      if (!visible.length) return;
      // create if needed
      const btn = createReplayButtonElement();
      if (btn) btn.style.display = 'inline-block';
    }

    function hideReplayButton() {
      const btn = document.getElementById('replayBtn');
      if (btn) btn.style.display = 'none';
    }

    // public init (exposed on window)
    window.initInvitation = function initInvitation() {
      try {
        // display guest name
        const guestName = getQueryParameter('name');
        const guestSide = getQueryParameter('side') || 'bride';
        const onlyWedding = getQueryParameter('onlyWedding') === 'true';
        const guestNameElement = document.getElementById('guestName');
        if (guestNameElement) guestNameElement.textContent = guestName ? decodeURIComponent(guestName) : 'Guest';

        // slides/dots
        const visible = getVisibleSlides();
        renderDots(visible);

        // start countdown
        updateCountdown();

        // initial slide
        currentSlideIndex = 1;
        showSlide(1);
        restartAutoSlide();

        // sparkles and confetti (if not onlyWedding)
        if (!onlyWedding) {
          startSparkles();
          setTimeout(createConfettiBurst, 500);
        }

        // bind interactions & keyboard
        bindDetailHover();
        bindKeyboardNav();

        // try play music now that user has revealed
        tryPlayMusic();

        // ensure replay button is hidden initially
        hideReplayButton();

      } catch (err) {
        console.warn('initInvitation error:', err);
      }
    };

    // Attach small navigation helpers to window so HTML buttons can call them
    window.changeSlide = function (d) { changeSlide(d); };
    window.currentSlide = function (n) { goToSlide(n); };

    // Expose a stop/cleanup if needed
    window._invitationCleanup = function () {
      clearInterval(countdownTimer); clearInterval(autoSlideInterval); stopSparkles();
      hideReplayButton();
    };
  })();

  /* ---------- Start-up wiring ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    bindOverlayControls();

    // If there is no overlay in DOM, init immediately
    if (!document.getElementById('coverOverlay')) {
      // small defer so other DOM paints finish
      setTimeout(() => { window.initInvitation && window.initInvitation(); }, 50);
    }
  });

})();
