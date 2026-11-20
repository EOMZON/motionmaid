const sourceCode = document.getElementById('source-code');
const sourcePanel = document.getElementById('source');
const codeMode = new URLSearchParams(location.search).get('showcase') === 'code';
if (codeMode && sourceCode && sourcePanel) {
  const raw = sourceCode.textContent;
  const position = document.getElementById('seek');
  const headers = /^(motion|title|group|tempo|length|ground|ease|view|note|counts|feet|camera|muscles)$/i;
  const joints = /^(root|spine|head|hip|knee|ankle|shoulder|elbow|wrist|hand|finger|toe|muscle|label)$/i;
  const tokens = /%%.*$|\/\/.*$|"(?:[^"\\]|\\.)*"|[+-]?(?:\d+(?:\.\d+)?|\.\d+)|[A-Za-z_][\w.]*|[:=/]/g;
  const beats = [];
  const lines = document.createDocumentFragment();

  raw.split('\n').forEach((line, index) => {
    const row = document.createElement('span');
    row.className = 'motion-code-line';
    row.dataset.line = index + 1;
    const number = document.createElement('span');
    number.className = 'motion-line-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = index + 1;
    const text = document.createElement('span');
    text.className = 'motion-line-text';
    const beat = line.match(/^\s*beat\s+(\d+(?:\.\d+)?)/i);
    if (beat) {
      const jump = document.createElement('button');
      jump.type = 'button';
      jump.className = 'motion-beat-jump';
      jump.textContent = index + 1;
      jump.setAttribute('aria-label', '跳到第 ' + beat[1] + ' 拍');
      jump.addEventListener('click', () => {
        const play = document.getElementById('play');
        if (play.textContent === '暂停') play.click();
        position.value = Number(beat[1]) - 1;
        position.dispatchEvent(new Event('input'));
        updateActiveBeat();
      });
      number.replaceChildren(jump);
      number.removeAttribute('aria-hidden');
      beats.push({ time: Number(beat[1]) - 1, row });
    }

    let cursor = 0;
    let first = true;
    let cue = false;
    for (const match of line.matchAll(tokens)) {
      const word = match[0];
      text.append(line.slice(cursor, match.index));
      const span = document.createElement('span');
      if (word.startsWith('%%') || word.startsWith('//')) span.className = 'tok-comment';
      else if (word.startsWith('"') || cue) span.className = 'tok-string';
      else if (/^[+-]?(?:\d|\.\d)/.test(word)) span.className = 'tok-number';
      else if (first && (headers.test(word) || word === 'beat')) span.className = 'tok-keyword';
      else if (first && joints.test(word)) span.className = 'tok-joint';
      else if (/^[:=/]$/.test(word)) span.className = 'tok-operator';
      else if (/^(?:L|R|both|on|off|flat|smooth|snap)$/.test(word)) span.className = 'tok-value';
      else if (line[match.index + word.length] === '=') span.className = 'tok-property';
      span.textContent = word;
      text.append(span);
      cursor = match.index + word.length;
      first = false;
      if (beat && word === ':') {
        const caption = document.createElement('span');
        caption.className = 'tok-string';
        caption.textContent = line.slice(cursor);
        text.append(caption);
        cue = true;
        cursor = line.length;
        break;
      }
    }
    if (!cue) text.append(line.slice(cursor));
    row.append(number, text);
    lines.append(row, '\n');
  });
  sourceCode.replaceChildren(lines);
  sourcePanel.classList.add('motion-code-panel');
  const toolbar = document.createElement('div');
  toolbar.className = 'motion-code-top';
  const info = document.createElement('div');
  info.innerHTML = '<strong>动作源码</strong><span>swim.motion · 只读</span>';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = '复制';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(raw);
      copy.textContent = '已复制';
    } catch {
      const selection = getSelection();
      const range = document.createRange();
      range.selectNodeContents(sourceCode);
      selection.removeAllRanges();
      selection.addRange(range);
      copy.textContent = '已选中';
    }
  });
  toolbar.append(info,copy);
  sourcePanel.querySelector(':scope > strong').replaceWith(toolbar);
  sourcePanel.querySelector('pre').tabIndex = 0;
  let current;
  function updateActiveBeat() {
    const time = Number(position.value) + .001;
    const next = beats.findLast(beat => beat.time <= time);
    if (next === current) return;
    current?.row.classList.remove('is-current');
    next?.row.classList.add('is-current');
    current = next;
  }
  position.addEventListener('input', updateActiveBeat);
  updateActiveBeat();
  setInterval(() => {
    if (!document.hidden && !sourcePanel.hidden && document.body.dataset.offscreen !== 'true') updateActiveBeat();
  }, 125);
}
