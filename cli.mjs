#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { parser } from './runtime.mjs';

const usage = '用法: motionmaid render <动作文件> -o <输出.html> [--code]\n      motionmaid example <squat|swim>';
const [command, input, flag, output, ...extra] = process.argv.slice(2);
const codeMode = extra.length === 1 && extra[0] === '--code';
const local = name => new URL(name, import.meta.url);

async function main() {
  if (!command || command === '--help') return console.log(usage);
  if (command === 'example' && ['squat', 'swim'].includes(input) && !flag) {
    process.stdout.write(await readFile(local('./examples/' + input + '.motion'), 'utf8'));
    return;
  }
  if (command !== 'render' || !input || flag !== '-o' || !output || (extra.length && !codeMode)) throw new Error(usage);

  const motion = await readFile(input, 'utf8');
  if (Buffer.byteLength(motion) > 256 * 1024) throw new Error('动作文件不能超过 256 KiB。');
  const result = runInNewContext(parser + '\nparseMove(motion)', { motion }, { timeout: 2000 });
  if (!result.fig || result.errs.length) {
    throw new Error(result.errs.map(e => [e.line && '第 ' + e.line + ' 行', e.msg].filter(Boolean).join('：')).join('\n') || '无可播放的动作。');
  }
  if (result.fig.mode !== 'pose') throw new Error('首版仅支持关节关键帧动作。请从深蹲或游泳示例开始。');
  for (const warning of result.warns) console.error(warning.msg);

  const [renderer, threeLicense] = await Promise.all(
    ['./renderer.txt', './THREE-LICENSE.txt'].map(file => readFile(local(file), 'utf8'))
  );
  const data = JSON.stringify(motion).replaceAll('<', '\\u003c');
  const html = `<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Motionmaid</title>
<!-- Three.js license
${threeLicense}
-->
<style>
*{box-sizing:border-box}body{margin:0;background:#151323;color:#f4efff;font:16px system-ui,sans-serif}
main{max-width:960px;margin:auto;padding:clamp(16px,4vw,40px)}small,p{color:#c4b9d9}
h1{margin:.35em 0}.stage{border:1px solid #655984;border-radius:16px;overflow:hidden}
canvas{display:block;width:100%;height:clamp(280px,58vh,600px);touch-action:none;cursor:grab}
.controls{display:flex;align-items:center;gap:16px;margin-top:16px}input{flex:1;min-width:0}
button{font:inherit;padding:.5em 1em;border:0;border-radius:8px;background:#e2ceff;color:#201631;cursor:pointer}
.viewer-layout{display:grid;gap:16px}.viewer-layout:has(.source:not([hidden])){grid-template-columns:minmax(0,1fr) minmax(0,1.5fr)}
.source{background:#211c32;border:1px solid #655984;border-radius:12px;padding:12px;min-width:0}.source pre{white-space:pre;overflow:auto;max-height:58vh;font-size:.85rem}
.toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:16px 0}.toolbar select{font:inherit}
@media(max-width:720px){.viewer-layout:has(.source:not([hidden])){grid-template-columns:minmax(0,1fr)}.source pre{max-height:250px}}
</style>
<main><small>MOTIONMAID · 用代码展示 3D 人体动作与肌群变化</small><h1 id="motion-title">动作预览</h1>
<p id="loading">正在加载播放器…</p><p id="failMsg" role="alert"></p><div id="fail" hidden></div>
<div class="toolbar">
<button id="source-toggle" type="button" aria-controls="source" aria-expanded="${codeMode}">源码对照</button>
<label>风格 <select id="style"><option value="aura">紫晶</option><option value="night">紫夜</option><option value="anat">写实</option><option value="holo">全息</option><option value="ink">霓虹</option><option value="bone">骨白</option></select></label>
<label><input id="muscles" type="checkbox" checked> 肌群示意</label></div>
<div class="viewer-layout"><section class="source" id="source" ${codeMode ? '' : 'hidden'} aria-label="动作源码"><strong>动作源码</strong><pre><code id="source-code"></code></pre></section>
<div><div class="stage"><canvas id="gl" aria-label="3D 人体动作"></canvas></div>
<div class="controls"><button id="play">播放</button><input type="range" id="seek" min="0" step=".01" value="0" aria-label="动作进度"></div>
<p>拖动旋转，滚轮缩放。肌群高亮用于动作示意。</p></div></div></main>
<script id="motion-data" type="application/json">${data}</script>
<script>${renderer.replace(/<\/script/gi, '<\\/script')}</script></html>`;
  await writeFile(output, html, { flag: 'wx' });
  console.log('已生成 ' + output);
}

main().catch(error => {
  console.error('Motionmaid: ' + error.message);
  process.exitCode = 1;
});
