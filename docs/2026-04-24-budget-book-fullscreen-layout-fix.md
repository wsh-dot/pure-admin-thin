# 预算书工作区全屏布局修复

## 新增内容

- 新增预算书工作区布局修复说明文档，记录本次右侧滚动条和底部空白区域的处理方式。

## 实现功能

- 修复预算书页面最右侧出现外层纵向滚动条的问题。
- 修复内容全屏时预算书工作区底部留白未被填满的问题。
- 预算书页面高度现在会根据外层滚动容器底边动态计算，内容全屏或主布局高度变化后会自动重算。
- 预算书页面覆盖继承自 `.main-content` 的底部外边距，避免外层滚动容器被额外撑高。

## 对应文件

- `src/views/cost/project-management/budget-book.vue`
  - 调整 `updatePageViewportHeight`，按外层 `.el-scrollbar__wrap` 底边计算页面可用高度。
  - 新增 `ResizeObserver` 与下一帧调度，响应内容全屏等布局尺寸变化。
  - 为 `.budget-book-page.main-content` 设置 `margin-bottom: 0`，消除底部额外空白与外层滚动。

## 验证方式

- 使用本地 dev server 在 `1920x900` 视口验证预算书页面：
  - 普通状态：外层滚动容器 `scrollHeight - clientHeight = 0`，底部 gap 为 `0`。
  - 内容全屏状态：外层滚动容器 `scrollHeight - clientHeight = 0`，底部 gap 为 `0`。
- 未执行 `pnpm build`、`npm run build`、`vite build` 等前端构建命令。
