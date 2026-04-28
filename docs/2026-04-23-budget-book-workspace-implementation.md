# 预算书工作区实现说明

## 本次新增内容

- 新增独立的预算书工作区页面，用于承接项目管理页双击 `计价库` 后进入的预算书界面。
- 新增预算书工作区路由，页面以独立工作区方式打开，不加入标签页，并保持项目管理菜单高亮。
- 新增项目管理页与预算书页之间的工作台快照能力，用于返回时恢复阶段、选中行、右侧面板页签和主表滚动位置。
- 新增通用纵向拖拽尺寸 hook，支持预算书下方明细区和 `取费程序 -> 显示费率` 场景中的双层高度调整。
- 新增预算书主树表、底部六个明细标签、取费程序双表区和关闭确认弹窗的 mock 数据与交互骨架。

## 本次实现功能

- 项目管理页仅在双击第二层 `造价文件` 节点的 `计价库` 单元格时进入预算书工作区。
- 父节点不会进入预算书，其他列双击也不会触发跳转。
- 预算书页提供独立工具栏、顶部页签、主树表、底部明细标签和内部关闭按钮。
- 预算书页关闭时弹出“是否保存当前文件”确认框，确认后返回项目管理工作台。
- 返回项目管理工作台后，会恢复：
  - 当前阶段
  - 当前主工作页签
  - 右侧信息面板页签
  - 原先选中的行
  - 主树表滚动位置
- `取费程序` 勾选 `显示费率` 后，会展示上下双表布局，并支持：
  - 上下区域拖拽调整高度
  - 费率明细表自身独立纵向滚动

## 相关文件

- `src/router/modules/projectWorkbench.ts`
  - 新增预算书工作区路由配置。
- `src/views/cost/project-management/index.vue`
  - 接入双击入口、工作台快照保存、返回恢复和主表 ref。
- `src/views/cost/project-management/budget-book.vue`
  - 实现预算书工作区页面结构、关闭确认、拖拽分隔条和底部明细联动骨架。
- `src/views/cost/project-management/workspaceState.ts`
  - 提供项目管理页快照保存与消费逻辑。
- `src/views/cost/project-management/hooks/useVerticalPanelResize.ts`
  - 提供上下拖拽调整区域高度的通用能力。
- `src/views/cost/project-management/budgetBookTypes.ts`
  - 定义预算书工作区节点、标签和明细数据结构。
- `src/views/cost/project-management/budgetBookMock.ts`
  - 提供预算书主树表、六类底部明细、取费程序与费率明细的 mock 数据。

## 校验情况

- 已执行 `pnpm typecheck`
- 结果：通过
