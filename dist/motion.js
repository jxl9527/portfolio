(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // --------------------------------------------------------------------------
  // 1. Cinema Hero Slider (Homepage)
  // --------------------------------------------------------------------------
  const cinema = document.querySelector('.cinema');
  if (cinema) {
    const slides = [...cinema.querySelectorAll('.cinema-slide')];
    const progress = [...cinema.querySelectorAll('.cinema-progress span')];
    const counter = cinema.querySelector('.cinema-current');
    let active = 0;
    let timer = null;
    let paused = false;

    function clearTimer() {
      if (timer) window.clearTimeout(timer);
      timer = null;
    }

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const current = i === active;
        slide.classList.toggle('is-active', current);
        slide.inert = !current;
        if (current) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden', 'true');
      });
      if (counter) counter.textContent = String(active + 1).padStart(2, '0');
      progress.forEach((bar, i) => {
        bar.classList.remove('is-current', 'is-done');
        void bar.offsetWidth;
        bar.classList.toggle('is-done', i < active);
        bar.classList.toggle('is-current', i === active);
      });
      clearTimer();
      if (!reduceMotion.matches && !paused && !document.hidden) {
        timer = window.setTimeout(() => show(active + 1), 7000);
      }
    }

    function pause(value) {
      paused = value;
      cinema.classList.toggle('is-paused', value);
      if (value) clearTimer();
      else show(active);
    }

    const prevBtn = cinema.querySelector('.cinema-prev');
    const nextBtn = cinema.querySelector('.cinema-next');
    if (prevBtn) prevBtn.addEventListener('click', () => show(active - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(active + 1));

    cinema.addEventListener('mouseenter', () => pause(true));
    cinema.addEventListener('mouseleave', () => pause(false));
    cinema.addEventListener('focusin', () => pause(true));
    cinema.addEventListener('focusout', event => {
      if (!cinema.contains(event.relatedTarget)) pause(false);
    });
    cinema.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(active - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(active + 1); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimer(); else if (!paused) show(active);
    });
    reduceMotion.addEventListener('change', () => show(active));

    // Touch swipe navigation for cinema
    let touchStartX = 0;
    let touchStartY = 0;
    cinema.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        pause(true);
      }
    }, { passive: true });

    cinema.addEventListener('touchend', e => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx < 0) show(active + 1);
          else show(active - 1);
        }
      }
      pause(false);
    }, { passive: true });

    show(0);
  }

  // --------------------------------------------------------------------------
  // 2. Cinematic Staggered Reveal Animation
  // --------------------------------------------------------------------------
  const revealElements = [...document.querySelectorAll('[data-reveal]')];
  if (revealElements.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');

    // Group elements by parent container to calculate organic stagger delays
    const parentGroups = new Set(revealElements.map(el => el.parentElement));
    parentGroups.forEach(parent => {
      if (!parent) return;
      const children = revealElements.filter(el => el.parentElement === parent);
      children.forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${Math.min(index * 0.07, 0.45)}s`);
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.05 });

    revealElements.forEach(el => observer.observe(el));

    reduceMotion.addEventListener('change', event => {
      if (!event.matches) return;
      revealElements.forEach(el => el.classList.add('is-visible'));
      observer.disconnect();
    });
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // --------------------------------------------------------------------------
  // 3. Top Reading Progress Indicator Hairline
  // --------------------------------------------------------------------------
  let progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.prepend(progressBar);
  }

  // --------------------------------------------------------------------------
  // 4. Floating Back-to-Top Button
  // --------------------------------------------------------------------------
  let backToTop = document.querySelector('.back-to-top');
  if (!backToTop) {
    backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('type', 'button');
    backToTop.setAttribute('aria-label', '返回页面顶部');
    backToTop.innerHTML = '<span>↑</span>';
    document.body.appendChild(backToTop);
  }
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --------------------------------------------------------------------------
  // 5. Scroll Orchestration (Throttle via RequestAnimationFrame)
  // --------------------------------------------------------------------------
  const siteHeader = document.querySelector('.site-header');
  const isHomePage = document.body.classList.contains('home');
  const heroThreshold = cinema ? (cinema.offsetHeight - 80) : 120;
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar scale
    if (docHeight > 0) {
      const progress = Math.min(Math.max(scrollY / docHeight, 0), 1);
      progressBar.style.transform = `scaleX(${progress})`;
    }

    // Sticky morphing header
    if (siteHeader) {
      if (isHomePage) {
        if (scrollY > heroThreshold) {
          siteHeader.classList.add('is-sticky');
        } else {
          siteHeader.classList.remove('is-sticky');
        }
      } else {
        if (scrollY > 30) {
          siteHeader.classList.add('is-scrolled');
        } else {
          siteHeader.classList.remove('is-scrolled');
        }
      }
    }

    // Back to top visibility
    if (scrollY > 400) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // --------------------------------------------------------------------------
  // 6. Click-to-Copy Micro-Toast System
  // --------------------------------------------------------------------------
  let copyToast = document.querySelector('.copy-toast');
  if (!copyToast) {
    copyToast = document.createElement('div');
    copyToast.className = 'copy-toast';
    copyToast.setAttribute('role', 'status');
    copyToast.setAttribute('aria-live', 'polite');
    copyToast.innerHTML = '<span class="toast-icon">✓</span><span class="toast-text"></span>';
    document.body.appendChild(copyToast);
  }

  let toastTimer = null;
  function showToast(message) {
    if (!copyToast) return;
    const textEl = copyToast.querySelector('.toast-text');
    if (textEl) textEl.textContent = message;
    copyToast.classList.add('is-shown');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      copyToast.classList.remove('is-shown');
    }, 2400);
  }

  document.addEventListener('click', e => {
    const target = e.target.closest('[data-copy], .copy-chip');
    if (!target) return;
    const textToCopy = target.dataset.copy || target.textContent.trim().replace(/^[📞📧📍]\s*/, '');
    if (textToCopy && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`已复制到剪贴板：${textToCopy}`);
      }).catch(() => {
        showToast(`已复制：${textToCopy}`);
      });
    }
  });

})();
