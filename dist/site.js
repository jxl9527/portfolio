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
    large.src = source.currentSrc || source.src;
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
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    if (opener) opener.focus();
  });
})();
