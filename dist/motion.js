(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
      counter.textContent = String(active + 1).padStart(2, '0');
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
    cinema.querySelector('.cinema-prev').addEventListener('click', () => show(active - 1));
    cinema.querySelector('.cinema-next').addEventListener('click', () => show(active + 1));
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

    // Mobile touch swipe for cinema hero
    let cinemaTouchX = 0;
    let cinemaTouchY = 0;
    cinema.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        cinemaTouchX = e.touches[0].clientX;
        cinemaTouchY = e.touches[0].clientY;
        pause(true);
      }
    }, { passive: true });
    cinema.addEventListener('touchend', e => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - cinemaTouchX;
        const dy = e.changedTouches[0].clientY - cinemaTouchY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.35) {
          if (dx < 0) show(active + 1);
          else show(active - 1);
        }
      }
      pause(false);
    }, { passive: true });

    show(0);
  }

  const reveal = [...document.querySelectorAll('[data-reveal]')];
  if (reveal.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
    reveal.forEach(element => observer.observe(element));
    reduceMotion.addEventListener('change', event => {
      if (!event.matches) return;
      reveal.forEach(element => element.classList.add('is-visible'));
      observer.disconnect();
    });
  }
})();
