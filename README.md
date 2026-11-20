# Motionmaid

用代码展示 3D 人体动作与肌群变化。可交互预览、源码对照、六种视觉风格。

[GitHub Pages · 能力说明与交互演示](https://eomzon.github.io/motionmaid/) · [下载安装包](https://github.com/EOMZON/motionmaid/releases/latest)

## 具体能力

| 能力 | 公开 CLI 0.2.0 | Roya 原型补充 |
| --- | --- | --- |
| 动作编排 | 关键帧、节奏、关节角度与插值。提供深蹲和自由泳示例 | 脚步规则求解、逐帧骨骼数据导入与导出 |
| 3D 人体 | Three.js + WebGL，17 根骨骼驱动约 3.7 万顶点的连续皮肤 | 分段人偶、轨迹、部位标签及更多舞台细节 |
| 肌群高亮 | 25 组肌群，可在脚本指定强度与侧别，或使用动作规则估算。覆盖层可独立开关 | 部位标签、练习时聚焦一个部位 |
| 视觉风格 | 紫晶、紫夜、写实、全息、霓虹、骨白，改变材质、边缘光、背景和肌群配色 | 各预设还可包含地面、反射及舞台环境 |
| 预览与分享 | 纯预览、只读源码对照、独立离线 HTML，支持播放、进度定位、旋转和缩放 | 动作工坊提供编辑与实时预览 |

[深蹲 · 纯预览](https://eomzon.github.io/motionmaid/squat.html) · [自由泳 · 源码对照](https://eomzon.github.io/motionmaid/swim.html) · [实时切换六种渲染风格](https://eomzon.github.io/motionmaid/#styles)

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
