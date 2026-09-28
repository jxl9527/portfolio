(() => {
  const dialog = document.querySelector('.image-viewer');
  if (!dialog) return;
  const images = Array.from(document.querySelectorAll('.zoom-image'));
  const stage = dialog.querySelector('.viewer-stage');
  const large = stage.querySelector('img');
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + images.length) % images.length;
    const source = images[index].querySelector('img');
    const targetSrc = source.dataset.full || source.currentSrc || source.src;
    large.classList.add('is-loading');
    large.onload = () => large.classList.remove('is-loading');
    large.src = targetSrc;
    large.alt = source.alt;
    dialog.querySelector('.viewer-caption').textContent = images[index].dataset.caption;
    dialog.querySelector('.viewer-count').textContent = `${index + 1} / ${images.length}`;
    stage.classList.remove('is-zoomed');
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    dialog.querySelector('.viewer-prev').hidden = images.length < 2;
    dialog.querySelector('.viewer-next').hidden = images.length < 2;
  };

  images.forEach((button, i) => button.addEventListener('click', () => {
    opener = button;
    show(i);
    dialog.showModal();
    document.body.classList.add('viewer-open');
    dialog.querySelector('.viewer-close').focus();
  }));

  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.viewer-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.viewer-next').addEventListener('click', () => show(index + 1));
  large.addEventListener('click', () => stage.classList.toggle('is-zoomed'));

  // Mobile double-tap to zoom
  let lastTap = 0;
  large.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
      stage.classList.toggle('is-zoomed');
    }
    lastTap = now;
  });

  // Mobile touch swipe navigation
  let touchStartX = 0;
  let touchStartY = 0;
  stage.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    if (stage.classList.contains('is-zoomed')) return;
    if (e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        if (dx < 0) show(index + 1);
        else show(index - 1);
      }
    }
  }, { passive: true });

  // Click outside to close dialog
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    large.classList.remove('is-loading');
    if (opener) opener.focus();
  });
})();
