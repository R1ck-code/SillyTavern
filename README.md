# SillyTavern（个人魔改）

A personal UI fork of [SillyTavern](https://github.com/SillyTavern/SillyTavern). Not the official repository.

这是 Rick 的个人魔改 fork，基于上游 SillyTavern。仓库地址：<https://github.com/R1ck-code/SillyTavern>。功能与上游相同，默认界面做了简化和移动端适配。请不要把本仓当成官方发行。

## 已改内容

- **默认简体中文**：新用户 / 没有语言偏好时用 `zh-cn`。已有 `localStorage.language` 不覆盖。
- **iPhone / 移动端**：聊天页适配安全区、键盘和窄屏布局。
- **浅色 / 深色 / 跟随系统**：ChatGPT/Claude 风格。顶栏图标单击循环切换，用户设置里也可选。
- **默认字体**：苹果系统字体栈（`-apple-system`、SF Pro、PingFang SC 等），并带系统 CJK 回退。不再用 Noto Sans 当默认 webfont。
- **简洁首页**：欢迎句 +「最近聊天 / 临时聊天」，少堆按钮和装饰。
- **复制角色卡自动重命名**：`原名 副本`，再复制为 `原名 副本 (2)`。
- **角色卡显示世界书**：列表和卡片上能看到该角色绑定的主世界书和辅助世界书；超过 3 本显示 `+N`。

## 刻意没做

- 不删聊天、角色卡、世界书、API、扩展等主功能。
- 不换前端框架，也不做大规模重构。
- 不强制覆盖已有用户的语言或 UI 主题。

## 上游与许可证

- 上游仓库：<https://github.com/SillyTavern/SillyTavern>
- 官方文档：<https://docs.sillytavern.app/>
- 许可证：上游为 **AGPL-3.0**，本仓魔改同样遵守。完整条款见 [LICENSE](./LICENSE)。

问题和文档请优先看上游。本仓只维护上述界面改动。

## 怎么跑

安装、Docker、配置与上游相同，见官方文档：

- [Windows](https://docs.sillytavern.app/installation/windows/)
- [macOS / Linux](https://docs.sillytavern.app/installation/linuxmacos/)
- [Docker](https://docs.sillytavern.app/installation/docker/)

本地最短路径：

```bash
git clone https://github.com/R1ck-code/SillyTavern.git
cd SillyTavern
git checkout release
npm install
node server.js
```

自建 Docker 镜像时，用**本仓**的 `release` 分支作 build context（不要用上游镜像，否则没有这些 UI 改动）：

```bash
git clone https://github.com/R1ck-code/SillyTavern.git
cd SillyTavern
git checkout release
docker build -t sillytavern-fork .
```

默认分支是 `release`。
