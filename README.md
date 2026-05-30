# C语言二级官方考试刷题与全真模拟通关系统

这是一个面向全国计算机等级考试（C语言二级）的现代化高效刷题与智能分析辅导系统。本系统完全在浏览器端本地沙箱（`localStorage`）中安全运行，精心收录了 **251道官方高频核心原题**，搭配能力分析大屏、错题消灭核销和全真考场模拟。

---

## 🌟 核心特色功能描述

### 1. 乱序双重置乱练习模式 (双重打乱：打乱题目 + 打乱选项) - ✨ 重磅升级
系统在主刷题卡片左侧面板集成了 **【刷题模式控制】** 控制台，提供两种练习维度：
*   **顺序刷题**：按照官方传统大纲编排的题号（#1 - #251）依次练习，最适合在预备期对照经典教材进行同步基础训练。
*   **随机乱序**：
    *   **题目顺序打乱**：采用 **Fisher-Yates 经典随机置乱算法** 为 251 道题生成稳定的随机序列。
    *   **选项顺序打乱 (防止死记硬背选项字母)**：当切换到乱序模式时，系统还会**对该题的 A、B、C、D 四个选项的文字内容进行随机重组打乱**，同时通过先进的“双向索引映射算法(Bidirectional Mapping)”将选中值和标准值绑定：
        *   **安全防污**：用户提交的临时反馈符号会在写出前对接到原库的全局答案（如原本C选项被随机映射到B位置并选中，系统对接到原数据库时依然持久化为 C）。
        *   **保真过渡**：支持随时在“顺序模式”与“乱序模式”中来回切换，历史答题的对错标记绝对不会错乱！
    *   **洗牌锁定机制**：打乱产生的题目和选项配置会序列化为 JSON 字符串，牢牢保存在 `localStorage` 中。即使用户切换标签卡或者刷新浏览器重进，乱序刷题当前所在的位置、做题记录、选项的打乱排列绝对不会丢失，直到您主动“重新洗牌”为止。
    *   **一键重新洗牌**：在乱序模式下，点击 `【重新洗牌 (打乱顺序)】` 可以直接重新生成新一版全随机历程。

### 2. 窗口高密度视口缩放 (Window Scaling System) - ✨ 新增
*   为了完美适配不同的电脑显示器、高分屏/投影仪以及不同视力需求的考生，系统首创了**物理像素级视口动态缩放系统**。
*   用户可以直接在网站顶部的 “C语言二级考试通关大进阶” 标题右侧找到 **缩放控制器**，支持从 **70% 到 150%** 之间的 fine-grained 自由调节（支持一键恢复 100% 原始大小）。
*   缩放偏好会自动保存在浏览器的本地持久化存储中，每次打开系统都会记忆并呈现最舒适的比例。

### 3. 智能能力仪表盘 (Smart Dashboard)
*   **进度进度图**：实时盘点您的全部做题进展与全局百分比。
*   **掌握度动态评级**：根据答题正确率和覆盖深度，自动演算五种不同的代码功底级别（*完美掌控、基础扎实、仍需努力、漏洞较多、尚未开始*）。
*   **各章节能力深度洞察**：将 251 道题归纳为多个常考考点，支持直接点击雷达格子进行该专项分类题目快速定向攻坚。

### 4. 写实版全真模拟考场 (Mock Exam)
*   提供全仿真模拟卷面，包含多道高频组合。
*   支持实测倒计时报警和一键快捷智能交卷阅卷。
*   考生成绩直接登记到**历史战绩大看板**中，且考试中做错的题会自动存入“错题复习本”。

### 5. 错题核销复习笔记 (Mistake Ledger)
*   所有刷题和模拟考中作答错误的试题，均会被系统实时捕捉并归集到“错题本”。
*   考生可以通过在错题本中重新尝试作答来验证自己是否掌握。
*   支持单道错题核销擦除、全局错题库清空等硬核功能，辅助考生实现错题清零。

---

## 🔒 100% 离线运行保障 (不依赖外部API)

**本软件无需联网，100% 不依赖任何外部 API，无封号、网络欠缴或断网无法答题的顾虑！**
*   **内置全量题库**：251道官方真题的题目文本、代码高亮样本、正确选项、深度解析、学科分类全部编译打包在前端源代码中（`/src/data/` 目录）。
*   **零服务器后台**：不需要连接服务器、不需要注册账号、不需要数据库支持。利用浏览器的本地高速结构化内存和高级安全存储（`localStorage`）实现进度秒存。
*   **真正的绿色便携**：打包成单页应用后，甚至可以在彻底断网、防火墙严锁的安全局域网、机房内顺畅打开！

---

## ⚙️ 如何将本项目打包并转换为单机 `.exe` 桌面程序？

为了让不便使用网页的学生或考场可以直接双击安装或以单机版 `.exe` 格式运行，提供两种业内最稳定、最成熟的打包方案：

---

### 📦 推荐方案 A：使用 Electron (极速上手，高度兼容)

Electron 是最流行的网页变桌面技术（如 VS Code、Discord）。适合快速生成包，不需要额外编写复杂的底层驱动。

#### 第一步：安装 Electron 开发依赖
在你的项目根目录下，运行以下命令：
```bash
npm install electron electron-builder --save-dev
```

#### 第二步：创建 Electron 的主进程入口文件
在项目根目录下创建一个名为 `main.cjs` 的文件，写入以下内容：
```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "C语言二级考试通关全真模拟系统",
    icon: path.join(__dirname, 'dist', 'favicon.ico'), // 有图标的话可以配置
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 如果是在开发环境，可以加载本地开发者服务 localhost:3000
  // 如果是打包后，直接加载 dist/index.html 网页文件
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // 关闭默认的顶部多余菜单栏
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
```

#### 第三步：在 `package.json` 中配置打包指令
在 `package.json` 的顶层，添加以下必需属性：
```json
{
  "main": "main.cjs",
  "homepage": "./",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "node dist/server.cjs",
    "electron:dev": "cross-env NODE_ENV=development electron .",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.cquiz.exam",
    "productName": "C语言二级通关利器",
    "directories": {
      "output": "dist_desktop"
    },
    "files": [
      "dist/**/*",
      "main.cjs"
    ],
    "win": {
      "target": "portable",
      "icon": "dist/favicon.ico"
    }
  }
}
```
> *提示：安装 `cross-env` 可以执行命令行环境变量设置，`npm install cross-env --save-dev`。若没有，也可以直接执行 `electron .`。*

#### 第四步：修改 `vite.config.ts` 以支持相对路径（至关重要）
为了让打包后的 `index.html` 能够以电脑本地相对路径（如 `file:///C:/...`）加载静态 JS/CSS 资源，你需要确保 Vite 的 base 路径设置为 `./`：
```typescript
// vite.config.ts
export default defineConfig({
  base: './', // 确保这个属性是加上去的
  // 其它原有配置...
});
```

#### 第五步：一键打包生成 `.exe`
在控制台中分别运行：
1. **生成前端资源**：`npm run build`
2. **打包为 exe 桌面：**
   ```bash
   npx electron-builder --win
   ```
   打包完成后，在根目录下会出现 `dist_desktop/` 文件夹，里面那个带有应用程序图标的 `.exe` 或者是可以便携式运行的 exe 包（Portable 版）就是您可以双击发给任何同学运行的绿色便携安装包了！

---

### 📦 探索方案 B：使用 Tauri (高层级，体积超级小)

Tauri 采用 Rust 作为底层，不打包整个 Chromium 浏览器（它直接借用 Windows 的 Edge WebView2 内核），打包出来的 exe 只有惊人的 **4MB ~ 10MB** 大小，内存占用极微！

#### 第一步：集成 Tauri 支持
在项目目录中运行：
```bash
npm install @tauri-apps/api @tauri-apps/cli -D
```

#### 第二步：初始化 Tauri 桌面配置
利用 cli 工具一键构建：
```bash
npx tauri init
```
系统会向你提问，你可以输入：
*   App name: `CQuiz`
*   Window title: `C语言二级通关模拟系统`
*   Web assets directory: `../dist`
*   Url of dev server: `http://localhost:3000`

#### 第三步：一键打包
运行：
```bash
npx tauri build
```
打包成功后，Tauri 会自动调用 Rust 编译器在 `src-tauri/target/release/bundle/` 目录下生成一个体积极小、响应极快、极度精细完美的纯天然 `.exe`。

---

## 🎹 极速操作快捷键秘籍 (Keyboard Shortcuts)

为了最大化考生的刷题效率，本卡片练习界面全面植入了微秒级键盘监听机制。您双手无需离开主键盘即可完成通关训练：

| 键盘按键 | 对应动作 |
| :--- | :--- |
| <kbd>A</kbd> / <kbd>B</kbd> / <kbd>C</kbd> / <kbd>D</kbd> | 直接选择该选项作答（在未回答的题目中有效） |
| <kbd>← (Left Arrow)</kbd> | 极速切换到 **上一题** |
| <kbd>→ (Right Arrow)</kbd> | 极速切换到 **下一题** |

> *注：当您激活了上方的“关键字搜索文本框”时，键盘监听会自动智能避让，确保您的检索输入体验过渡自然。*

---

## ⚙️ 部署、运行与环境配置

项目基于 **Vite + React 18 + TypeScript + Tailwind CSS** 现代全栈前端架构构建，兼容各大主流移动端和 PC 端视口：

### 1. 基础环境
确保您的机器安装了 `Node.js` (推荐 `v18+` 或 `v20+`)。

### 2. 本地起步运行
```bash
# 安装开发所需的所有依赖项
npm install

# 启动本地实时热更新开发服务器 (默认占用本地 3000 端口)
npm run dev
```

### 3. 持久化清理
如果您希望能完全清空做题进度来开展二轮复习训练，可以直接在能力分析大屏（Dashboard）上点击“一键清空记录”，或者在浏览器开发者控制台中运行：
`localStorage.clear()`。
