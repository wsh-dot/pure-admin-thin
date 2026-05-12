# 长庆三段式布局改造代码说明

生成日期：2026-05-09

## 本次新增内容

- 新增长庆油田工程造价系统三段式主外壳：品牌头部、顶部一级业务菜单、左侧二三级菜单、右侧业务内容区。
- 新增长庆菜单数据模型和菜单联动 Hook，支持通过路由 `meta.topMenuCode`、`meta.sideMenuCode` 激活顶部和左侧菜单。
- 新增顶部日期时间显示 Hook，顶部导航按秒级定时刷新当前时间。
- 新增“基础工作 / 党建工作”Vue 页面，使用 Element Plus 表单、表格、分页和弹窗实现旧系统业务列表交互。
- 新增党建工作 mock 数据、类型定义、接口封装、表单弹窗和附件弹窗。
- 新增长庆主题样式，覆盖主布局坐标、顶部蓝色品牌区、左侧菜单、紧凑查询区和表格视觉。

## 已实现功能

- 固定为长庆油田公司工程造价管理信息系统外壳，不再展示默认 PureAdmin 顶部工具区。
- 点击顶部“基础工作”后，左侧展示“党建工作、信息维护、部门概况、工作总结、部门荣誉、制度汇编”。
- 访问 `/cost/foundation/party-work` 可进入“党建工作”列表页，并自动高亮顶部“基础工作”和左侧“党建工作”。
- 左侧菜单宽度支持拖拽调整，默认宽度为 180px。
- 党建工作列表支持标题、置顶状态、发布状态、信息类型、有效时间查询条件。
- 列表展示序号、标题、信息类型、有效时间、创建人、状态、附件、操作。
- 标题点击打开查看弹窗。
- 新建、编辑、删除、发布/撤回、置顶/还原基于 `hasAuth("work_edit")` 控制。
- 已发布行隐藏编辑、删除入口；附件入口在已发布状态下只读。
- 删除、发布/撤回、置顶/还原都有二次确认。
- 1366px 及 1920px 桌面视口下完成浏览器截图检查。

## 对应文件

- 主布局：`src/layout/index.vue`
- 顶部品牌栏：`src/layout/components/lay-navbar/index.vue`
- 顶部一级菜单：`src/layout/components/lay-sidebar/NavHorizontal.vue`
- 左侧二三级菜单：`src/layout/components/lay-sidebar/NavVertical.vue`
- 菜单模型：`src/layout/cost-menu.ts`
- 菜单联动 Hook：`src/layout/hooks/useCostMenu.ts`
- 顶部时间 Hook：`src/layout/hooks/useCostClock.ts`
- 长庆主题样式：`src/style/changqing.scss`
- 全局样式入口：`src/style/index.scss`
- 党建工作路由：`src/router/modules/cost.ts`
- 路由类型扩展：`types/router.d.ts`
- 党建工作页面：`src/views/cost/foundation/party-work.vue`
- 党建工作类型：`src/views/cost/foundation/types.ts`
- 党建工作 mock：`src/views/cost/foundation/mock.ts`
- 表单弹窗：`src/views/cost/foundation/components/PartyWorkFormDialog.vue`
- 附件弹窗：`src/views/cost/foundation/components/AttachmentDialog.vue`
- API 封装：`src/api/cost/foundation.ts`

## 验证记录

- 已执行：`pnpm typecheck`
- 已通过：`tsc --noEmit && vue-tsc --noEmit --skipLibCheck`
- 已打开本地页面：`http://localhost:8850/#/cost/foundation/party-work`
- 未执行：`pnpm build`、`npm run build`、`vite build`
