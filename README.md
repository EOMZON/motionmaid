# Motionmaid

用代码展示 3D 人体动作与肌群变化。可交互预览、源码对照、六种视觉风格。

[在线演示](https://eomzon.github.io/motionmaid/) · [下载安装包](https://github.com/EOMZON/motionmaid/releases/latest)

## 安装和运行

需要 Node.js 20+。从 GitHub Release 下载安装包：

```sh
npm install -g ./motionmaid-0.2.0.tgz
motionmaid example squat > squat.motion
motionmaid render squat.motion -o squat.html
motionmaid example swim > swim.motion
motionmaid render swim.motion -o swim.html --code
```

在支持 WebGL 的浏览器打开导出的 HTML。默认打开纯预览，`--code` 默认打开源码对照。两种视图可以随时切换。肌群示意可独立于视觉风格开启或关闭。

HTML 内嵌运行时，可以离线阅读和分享。首版支持关节关键帧，肌群高亮用于示意，自由泳示例未经专业教练校对。

## 源码

`cli.mjs` 负责解析命令和生成 HTML，`runtime.mjs` 包含动作解析代码，`renderer.txt` 包含浏览器端播放器、人体网格和 Three.js 的固定版本。示例动作位于 `examples/`。

项目代码采用 MIT 许可。Three.js 的许可见 [THREE-LICENSE.txt](THREE-LICENSE.txt)。
