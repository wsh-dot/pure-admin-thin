# pure-admin-thin 新手上手指南

本文综合参考以下资料，并以当前仓库代码为准做了校对和补充：

- Zread 安装指南: <https://zread.ai/pure-admin/pure-admin-thin/3-installation-guide>
- DeepWiki 总览: <https://deepwiki.com/pure-admin/pure-admin-thin>
- 当前仓库源码: `package.json`、`vite.config.ts`、`src/main.ts`、`src/router`、`src/store`、`src/utils/http` 等

当前仓库版本是 `6.2.0`。如果你是第一次接触 `pure-admin-thin`，建议先按本文把项目跑起来，再去看某一个模块的源码。这样理解速度会快很多。

## 1. 这个项目是什么

`pure-admin-thin` 是 `vue-pure-admin` 的精简版脚手架，保留了后台管理系统最常用的一套主干能力：

- Vue 3 + Vite + TypeScript 的现代前端基础设施
- 完整的后台布局系统
- 登录、权限、菜单、标签页、主题切换等常见能力
- 基于路由和角色的权限控制
- 内置请求封装、Mock、代码规范和构建优化

它适合做两类事情：

1. 直接作为中后台项目模板启动业务开发
2. 作为学习 Vue 3 后台项目工程化设计的参考仓库

## 2. 先确认环境

外部文档里对 Node 版本的描述有历史差异。DeepWiki 页面当前显示的最后索引时间是 `2025-04-20`，因此环境版本请以当前仓库 `package.json` 为准：

- Node.js: `^20.19.0 || >=22.13.0`
- pnpm: `>=9`
- Git: 建议安装最新版

额外说明：

- 仓库通过 `preinstall` 强制使用 `pnpm`
- `.npmrc` 里开启了 `shell-emulator=true`，所以在 Windows PowerShell 下也可以直接执行 `pnpm dev`、`pnpm build`

可以先本地检查一下：

```bash
node --version
pnpm --version
```

## 3. 5 分钟跑起来

如果你已经在当前仓库目录下，最小启动步骤就是：

```bash
pnpm install
pnpm dev
```

启动后默认访问地址：

```text
http://localhost:8848/#/login
```

说明：

- 开发端口来自 `.env.development` 中的 `VITE_PORT=8848`
- 当前仓库默认路由模式是 `hash`
- 登录页默认填充了演示账号 `admin / admin123`

如果只是想看构建效果，可以使用：

```bash
pnpm build
pnpm preview
```

其他常用命令：

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动本地开发环境 |
| `pnpm serve` | `pnpm dev` 的别名 |
| `pnpm build` | 生产环境打包 |
| `pnpm build:staging` | 预发环境打包 |
| `pnpm report` | 生成打包分析报告 |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm preview:build` | 先构建再预览 |
| `pnpm typecheck` | TypeScript + Vue 类型检查 |
| `pnpm lint` | 一次性跑 ESLint / Prettier / Stylelint |
| `pnpm clean:cache` | 清缓存并重装依赖 |

如果你习惯容器方式，Zread 文档里也给了 Docker 方式，这个仓库根目录已经自带 `Dockerfile`。

## 4. 新人第一次应该怎么看这个项目

推荐按下面顺序读，基本不会迷路：

1. `package.json`
   先看脚本、依赖和 Node / pnpm 版本要求。
2. `vite.config.ts`
   看开发端口、别名、插件、打包输出和环境变量入口。
3. `src/main.ts`
   看应用到底是怎么启动的。
4. `src/router/index.ts` 和 `src/router/utils.ts`
   看静态路由、动态路由、权限校验和 keep-alive。
5. `src/layout/`
   看后台框架外壳由哪些区域组成。
6. `src/store/modules/`
   看用户、权限、标签页、主题、布局状态分别放在哪。
7. `src/api/` 和 `src/utils/http/index.ts`
   看接口封装、token 刷新和错误处理。
8. `src/views/`
   看页面示例，建议先看 `welcome`、`login`、`permission`。

## 5. 应用启动主线

理解 `src/main.ts`，基本就理解了这个项目运行时的骨架。

应用启动顺序大致是：

1. 创建 Vue 应用实例
2. 注册自定义指令
3. 注册全局图标组件、权限组件、`vue-tippy`
4. 读取 `public/platform-config.json`
5. 初始化 Pinia
6. 挂载 Vue Router，并等待 `router.isReady()`
7. 注入响应式存储配置
8. 安装 `MotionPlugin`、Element Plus、`@pureadmin/table`
9. 最后执行 `app.mount("#app")`

这条链路说明了两件事：

- 配置不是只靠 `.env`，还会在运行时再读取一次 `platform-config.json`
- 路由、布局、主题、权限这些后台能力，是在应用挂载前就准备好的

## 6. 配置体系怎么分层

这个项目的配置有三层，建议分开理解：

### 6.1 构建期配置：`.env.*`

这部分决定构建和启动行为，当前仓库里最重要的几个变量是：

- `VITE_PORT`: 本地开发端口，当前是 `8848`
- `VITE_PUBLIC_PATH`: 部署基础路径
- `VITE_ROUTER_HISTORY`: 路由模式，当前默认 `hash`
- `VITE_CDN`: 是否使用 CDN 替换本地依赖
- `VITE_COMPRESSION`: 是否开启 gzip / brotli 压缩

### 6.2 运行期配置：`public/platform-config.json`

这部分决定后台界面的默认表现，例如：

- `Title`: 系统标题
- `Layout`: 布局模式
- `Theme` / `DarkMode`: 亮色、暗色主题
- `FixedHeader`: 是否固定头部
- `EpThemeColor`: Element Plus 主题色
- `ShowLogo`: 是否显示 logo
- `CachingAsyncRoutes`: 是否缓存动态路由

`src/config/index.ts` 会在启动时读取这个 JSON，并通过 `getConfig()` 暴露给全局使用。

### 6.3 浏览器本地持久化配置

一些用户交互后的布局和主题状态会进本地存储，这样刷新后不会丢。

所以如果你改了配置但页面表现没变化，别忘了两件事：

1. 重启开发服务
2. 必要时清一下浏览器本地存储

## 7. 路由、菜单、权限是怎么串起来的

这是新手最容易卡住的一块，但理解后会很顺。

### 7.1 静态路由

`src/router/index.ts` 会通过 Vite 的 glob 导入，自动加载 `src/router/modules/**/*.ts` 里的静态路由模块，但会显式排除 `remaining.ts`，所以你不需要手动一个个 import。

当前仓库里的静态路由主要分两部分：

- 自动扫描部分：`home.ts`、`error.ts`
- 单独拼接部分：`remaining.ts`，里面放登录、重定向等不参与菜单的页面

### 7.2 动态路由

项目也支持从后端返回路由。当前示例里是通过：

- `src/api/routes.ts`
- `mock/asyncRoutes.ts`

来模拟后端动态菜单。

核心逻辑在 `src/router/utils.ts`：

- `getAsyncRoutes()` 拉取后端路由
- `addAsyncRoutes()` 把后端返回的组件路径映射到 `src/views/**/*.{vue,tsx}`
- `handleAsyncRoutes()` 把动态路由真正注册到路由实例里

这意味着如果你走“后端返回菜单”模式，后端返回的 `component` 字段最好和 `src/views` 下的文件路径保持一致，例如：

```text
permission/button/index
```

### 7.3 为什么三级路由会被拍平成二级

这个项目专门做了一步 `formatTwoStageRoutes()` 处理，把多级路由整理成“两级结构”。原因很实际：

- Vue 的 `keep-alive` 在后台场景里更适合配合两级路由管理
- 标签页缓存、页面刷新、菜单展开等逻辑也会更稳定

所以你在设计页面层级时，最好不要把纯前端路由嵌套得太深。

### 7.4 权限控制靠什么字段

最常用的是路由 `meta` 里的这些字段：

- `title`: 菜单和标签页标题
- `icon`: 菜单图标
- `rank`: 菜单排序
- `showLink`: 是否在菜单里显示
- `roles`: 页面级权限
- `auths`: 按钮级权限
- `keepAlive`: 是否缓存页面

其中：

- 页面级权限主要看 `roles`
- 按钮级权限主要看 `auths`
- 页面组件里可以直接配合全局注册的 `Auth`、`Perms` 组件使用

## 8. Store 怎么分工

项目使用 `Pinia`，并且是按职责拆模块的。当前主要 store 有：

| 模块 | 作用 |
| --- | --- |
| `user.ts` | 登录、登出、用户信息、角色、权限、token 刷新 |
| `permission.ts` | 菜单生成、扁平路由、keep-alive 缓存页管理 |
| `app.ts` | 侧边栏开关、设备类型、布局状态 |
| `settings.ts` | 系统设置项，如头部、底部、布局偏好 |
| `multiTags.ts` | 多标签页状态 |
| `epTheme.ts` | Element Plus 主题色相关状态 |

你可以把它理解成三组：

- 用户和权限：`user`、`permission`
- 界面布局：`app`、`settings`、`multiTags`
- 主题能力：`epTheme`

如果你要新增业务状态，通常也是照这个风格在 `src/store/modules/` 下新建一个模块。

## 9. 请求层怎么工作

接口调用统一经过 `src/utils/http/index.ts` 的 `PureHttp` 类，它本质上是对 Axios 的二次封装。

它已经帮你做了这些事：

- 统一超时、请求头、参数序列化
- 自动带上 token
- token 过期后自动刷新
- 刷新 token 期间把其他请求排队，避免并发乱掉
- 支持请求前和响应后的自定义回调

当前示例接口文件很简单：

- `src/api/user.ts`: 登录、刷新 token
- `src/api/routes.ts`: 拉取动态路由

如果你要接真实后端，最常见的改法就是：

1. 在 `src/api/` 新建业务模块
2. 继续复用 `http.get()` / `http.post()`
3. 把原来 `mock/` 下的模拟接口逐步替换掉

## 10. Layout 和页面区域怎么拆

`src/layout/index.vue` 是后台外壳入口。它负责把整套后台壳子拼起来。

主要区域都在 `src/layout/components/`：

- `lay-navbar`: 顶栏
- `lay-sidebar`: 侧边栏
- `lay-tag`: 标签页
- `lay-content`: 主内容区
- `lay-setting`: 系统设置抽屉
- `lay-search`: 搜索
- `lay-notice`: 通知
- `lay-footer`: 页脚

布局模式来自 `platform-config.json` 和本地存储的组合控制，所以你看到的“垂直布局、横向布局、混合布局”，本质上都是这一层在切换。

## 11. 项目结构总览

建议把下面这张图当成“找文件地图”：

```text
pure-admin-thin/
├── build/                 # Vite 构建辅助逻辑、插件、压缩、优化
├── docs/                  # 项目文档（本文档所在目录）
├── mock/                  # Mock 接口与动态路由模拟
├── public/                # 静态资源与运行期配置
├── src/
│   ├── api/               # 接口定义
│   ├── assets/            # 图片、SVG、字体图标等静态资源
│   ├── components/        # 复用组件
│   ├── config/            # 运行期配置读取
│   ├── directives/        # 自定义指令
│   ├── layout/            # 后台框架布局
│   ├── plugins/           # 第三方插件注册
│   ├── router/            # 路由系统
│   ├── store/             # Pinia 状态管理
│   ├── style/             # 全局样式、主题、Tailwind 入口
│   ├── utils/             # 工具函数、请求封装、鉴权、缓存等
│   ├── views/             # 页面级组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── types/                 # 全局类型声明
├── .env*                  # 环境变量
├── package.json           # 依赖、脚本、版本要求
├── tsconfig.json          # TypeScript 配置
└── vite.config.ts         # Vite 主配置
```

再细一点看，和新人最相关的几个目录是：

### 11.1 `build/`

这里不是业务代码，而是构建层能力。当前你最值得关注的是：

- `plugins.ts`: Vite 插件列表
- `compress.ts`: gzip / brotli 压缩
- `cdn.ts`: CDN 替换能力
- `optimize.ts`: 依赖预构建优化
- `utils.ts`: 环境变量包装、别名等通用工具

### 11.2 `mock/`

本地演示和联调前期非常好用：

- `login.ts`: 登录接口 mock
- `refreshToken.ts`: token 刷新 mock
- `asyncRoutes.ts`: 动态路由 mock

### 11.3 `src/components/`

这里放项目级通用组件，比如：

- `ReAuth`: 权限组件
- `RePerms`: 按钮权限组件
- `ReIcon`: 图标体系封装
- `ReDialog`: 二次封装对话框
- `RePureTableBar`: 表格工具栏

### 11.4 `src/views/`

这是页面层。当前仓库里的示例很精炼：

- `login/`: 登录页
- `welcome/`: 首页
- `permission/`: 页面权限和按钮权限示例
- `error/`: 403 / 404 / 500

如果你刚接手项目，先从 `src/views/permission` 看权限流最划算。

## 12. 技术栈总表

下面这张表，把“你在这个仓库里会看到什么技术”和“它负责什么”串在一起：

| 层级 | 技术 | 在本项目里的作用 |
| --- | --- | --- |
| 核心框架 | Vue 3 | 页面与组件开发基础 |
| 语言 | TypeScript | 提供类型约束与工程可维护性 |
| 构建工具 | Vite 7 | 本地开发、HMR、打包构建 |
| 路由 | Vue Router 4 | 页面导航、菜单、权限路由 |
| 状态管理 | Pinia | 用户、权限、布局、标签页、主题状态 |
| UI 组件库 | Element Plus | 后台界面主组件库 |
| 原子样式 | Tailwind CSS 4 | 快速布局与样式补充 |
| 管理后台增强 | `@pureadmin/table`、`@pureadmin/utils` | 表格能力与工具函数 |
| 组合式工具 | `@vueuse/core`、`@vueuse/motion` | 组合式能力与动效 |
| HTTP | Axios | 请求封装与 token 管理 |
| 时间处理 | Day.js | 日期时间处理 |
| 图标方案 | Iconify、自定义 iconfont、SVG Loader | 在线图标、本地图标、SVG 组件化 |
| 提示增强 | Vue Tippy | Tooltip 能力补充 |
| Mock | `vite-plugin-fake-server` | 本地模拟后端接口 |
| 质量保障 | ESLint、Prettier、Stylelint | 代码规范与格式统一 |
| Git 流程 | Husky、lint-staged、commitlint | 提交前检查与提交信息规范 |

## 13. 这个项目的工程化亮点

如果你不是只想“会用”，而是想顺手学点工程化，这几个点值得重点看：

### 13.1 构建插件是集中管理的

`build/plugins.ts` 里把项目的 Vite 插件集中起来了，当前包括：

- Vue / Vue JSX
- `@tailwindcss/vite`
- 代码定位工具 `code-inspector-plugin`
- `vite-plugin-fake-server`
- `vite-svg-loader`
- `unplugin-icons`
- 可选 CDN
- 可选压缩
- 生产移除 `console`
- `report` 模式下的包体分析

这意味着项目后续扩展构建能力时，入口比较清晰，不会散落在各处。

另外，开发阶段还可以直接使用代码定位能力：

- Windows 默认组合键是 `Alt + Shift`
- 按住组合键再点页面元素，可以直接跳到对应源码位置

### 13.2 Mock 和真实接口切换成本低

因为请求都收敛在 `src/api`，Mock 又独立在 `mock/`，所以从演示项目过渡到真实业务接口时，不需要大改页面层。

### 13.3 权限体系是完整闭环

从登录接口到 `user` store，再到动态路由，再到菜单、标签页和按钮权限，这套链路是打通的。很多新项目最容易反复返工的，其实就是这一块。

## 14. 新人最常见的 5 个改造入口

### 14.1 改系统名称、布局和主题

先改：

- `public/platform-config.json`

如果还涉及浏览器标题或运行时读取逻辑，再看：

- `src/config/index.ts`
- `src/router/index.ts`

### 14.2 新增一个静态页面

最简单的做法：

1. 在 `src/views/` 下新建页面组件
2. 在 `src/router/modules/` 新建或追加路由模块
3. 给路由补上 `meta.title`、`meta.icon`、`meta.rank`

### 14.3 新增一个后端动态菜单页面

推荐顺序：

1. 在 `src/views/` 下建页面
2. 确认后端返回的 `component` 路径能映射到该页面
3. 本地调试阶段可以先改 `mock/asyncRoutes.ts`

### 14.4 接入真实后端登录

优先看这些文件：

- `src/views/login/index.vue`
- `src/api/user.ts`
- `src/store/modules/user.ts`
- `src/utils/auth.ts`
- `src/utils/http/index.ts`

### 14.5 新增全局状态

直接参考现有模块风格，在 `src/store/modules/` 下新增一个 store 即可。不要把跨页面共享状态塞进页面组件里临时凑。

## 15. 给新同学的学习路径建议

如果你准备正式接这个项目，建议按这个节奏推进：

### 第一天

- 跑通项目
- 看 `src/main.ts`
- 看 `src/router/index.ts`
- 看 `src/views/login` 和 `src/views/permission`

### 第二天

- 看 `src/store/modules`
- 看 `src/layout`
- 自己加一个菜单页

### 第三天

- 看 `src/utils/http/index.ts`
- 用 `mock/` 或真实接口加一个业务模块
- 跑一次 `pnpm typecheck` 和 `pnpm lint`

做到这里，基本就已经能接正常业务需求了。

## 16. 一些实战提醒

- 先区分“静态路由”和“后端动态路由”，不要两套写法混在一起。
- 改布局、主题、标题时，先看 `platform-config.json`，不要一上来就在组件里硬编码。
- 路由层级不要盲目加深，这个项目本身就是按后台场景做了二级化处理。
- 如果页面刷新后权限、菜单或主题不符合预期，优先检查本地存储和运行期配置。
- 如果你在 Windows 下开发，仓库已经处理了脚本兼容，不用额外改 `package.json` 里的启动脚本。

## 17. 参考资料

- 安装指南: <https://zread.ai/pure-admin/pure-admin-thin/3-installation-guide>
- DeepWiki 项目总览: <https://deepwiki.com/pure-admin/pure-admin-thin>
- DeepWiki Getting Started: <https://deepwiki.com/pure-admin/pure-admin-thin/1.1-getting-started>
- DeepWiki Build System: <https://deepwiki.com/pure-admin/pure-admin-thin/2.1-build-system>
- DeepWiki Configuration: <https://deepwiki.com/pure-admin/pure-admin-thin/2.2-configuration>
- DeepWiki Routing System: <https://deepwiki.com/pure-admin/pure-admin-thin/3-routing-system>
- DeepWiki State Management: <https://deepwiki.com/pure-admin/pure-admin-thin/4-state-management>
- DeepWiki HTTP and API Integration: <https://deepwiki.com/pure-admin/pure-admin-thin/7.1-http-and-api-integration>
