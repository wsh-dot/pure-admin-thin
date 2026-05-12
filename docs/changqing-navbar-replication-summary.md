# 长庆顶部导航栏复刻调整说明

生成日期：2026-05-09

## 本次新增内容

- 新增旧系统真实 logo 图片资源：`src/assets/cost/changqing-logo.png`
- 按旧系统顶部区域重构 `lay-navbar` 左侧品牌区和右侧用户入口。
- 调整顶部一级菜单整体位置，使菜单从左侧留白后开始，更接近旧系统。
- 调整顶部菜单日期区域，只保留旧系统风格的日期文本。
- 调整长庆主题变量和顶部区域颜色，使 header 背景与旧系统 logo 图片底色一致。

## 已实现功能与样式

- 左侧品牌区使用旧系统图片资源 `http://10.1.39.201:8090/skin/base/css/img/logo.png` 下载后的本地文件。
- 标题保留文字渲染，字体、字号、粗细、阴影和位置按旧系统截图校准。
- 右上角用户区调整为旧系统文案与结构：
  - `系统管理员，欢迎您！`
  - `长庆油田分公司`
  - `切换 | 部门首页 | 个人信息 | 退出`
- 用户名、单位和主要入口使用黄色，分隔线和退出文字使用白色。
- 顶部一级菜单整体右移，并收紧菜单项间距，避免 1366px 宽度下挤压右侧日期。
- 顶部总高度改为 `121px`，与旧系统 `layout.jsp` 主体 `top:121px` 对齐。
- 日期区域只显示 `YYYY-M-D dddd`，例如 `2026-5-9 星期六`。

## 对应文件

- 图片资源：`src/assets/cost/changqing-logo.png`
- 顶部品牌栏：`src/layout/components/lay-navbar/index.vue`
- 顶部一级菜单：`src/layout/components/lay-sidebar/NavHorizontal.vue`
- 长庆主题样式：`src/style/changqing.scss`

## 验证记录

- 已执行：`pnpm typecheck`
- 已通过：`tsc --noEmit && vue-tsc --noEmit --skipLibCheck`
- 已用浏览器检查页面：`http://localhost:8850/#/cost/foundation/party-work`
- 已检查视口：
  - `1920x943`
  - `1366x768`
- 未执行：`pnpm build`、`npm run build`、`vite build`
