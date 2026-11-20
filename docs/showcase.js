const params = new URLSearchParams(location.search || location.hash.slice(1));
const mode = params.get('showcase');
if (['hero', 'styles', 'code', 'tile'].includes(mode)) {
  document.body.classList.add('showcase', 'showcase-' + mode);
  const play = document.getElementById('play');
  const select = document.getElementById('style');
  const seek = document.getElementById('seek');
  const muscles = document.getElementById('muscles');
  const canvas = document.getElementById('gl');
  const still = params.get('still') === '1';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let automatic = mode !== 'code' && !still && !reducedMotion;

  function changeStyle(value) {
    select.value = value;
    select.dispatchEvent(new Event('change'));
    styleButtons?.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.value === value));
    });
  }

  let styleButtons;
  if (mode !== 'tile') {
    styleButtons = document.createElement('div');
    styleButtons.className = 'style-segments';
    styleButtons.setAttribute('role', 'group');
    styleButtons.setAttribute('aria-label', '视觉风格');
    for (const option of select.options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.value = option.value;
      button.textContent = option.textContent;
      button.addEventListener('click', () => changeStyle(option.value));
      styleButtons.append(button);
    }
    const nativeStyle = select.closest('label');
    nativeStyle.hidden = true;
    nativeStyle.after(styleButtons);
  }

  const initialStyle = params.get('style');
  changeStyle(Array.from(select.options).some(option => option.value === initialStyle) ? initialStyle : 'aura');
  if (params.get('muscles') === 'off') muscles.checked = false;
  if (still) {
    seek.value = '1.95';
    seek.dispatchEvent(new Event('input'));
  }

  const observer = new IntersectionObserver(([entry]) => {
    document.body.dataset.offscreen = String(!entry.isIntersecting);
    if (automatic && entry.isIntersecting === (play.textContent === '播放')) play.click();
  });
  observer.observe(canvas);

  for (const target of [play, seek, canvas, styleButtons].filter(Boolean)) {
    target.addEventListener('pointerdown', () => { if (mode === 'hero' || mode === 'styles') automatic = false; });
    target.addEventListener('keydown', () => { if (mode === 'hero' || mode === 'styles') automatic = false; });
  }

  if (mode === 'styles' && !reducedMotion) {
    setInterval(() => {
      if (automatic && !document.hidden && play.textContent === '暂停') {
        changeStyle(select.options[(select.selectedIndex + 1) % select.options.length].value);
      }
    }, 4800);
  }
}
