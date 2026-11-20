const mode = new URLSearchParams(location.search).get('showcase');
if (['hero', 'styles', 'code'].includes(mode)) {
  document.body.classList.add('showcase');
  const play = document.getElementById('play');
  const select = document.getElementById('style');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (mode !== 'code' && !reducedMotion) {
    let automatic = true;
    function cycle() {
      if (!automatic || document.hidden || play.textContent !== '暂停') return;
      select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
      select.dispatchEvent(new Event('change'));
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && automatic) {
        if (play.textContent === '播放') play.click();
      } else if (automatic && play.textContent === '暂停') play.click();
    });
    const start = () => {
      observer.observe(document.getElementById('gl'));
      if (mode === 'styles') setInterval(cycle, 4800);
    };
    window.addEventListener('load', start, { once: true });
    for (const target of [play, select, document.getElementById('seek'), document.getElementById('gl')]) {
      target.addEventListener('pointerdown', () => { automatic = false; });
      target.addEventListener('keydown', () => { automatic = false; });
    }
  }
}
