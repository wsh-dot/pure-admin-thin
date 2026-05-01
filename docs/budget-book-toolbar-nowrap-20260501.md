# 预算书顶部工具按钮单行显示调整

## 修改内容

- 调整顶部工具按钮容器 `.budget-toolbar-groups` 的布局，禁止按钮组自动换行。
- 为 `.budget-toolbar-groups` 增加横向滚动兜底，避免按钮数量较多或页面宽度不足时挤压换行。
- 固定 `.budget-toolbar-group` 和 `.budget-toolbar-action` 的弹性收缩行为，保证按钮保持单行排列。

## 实现功能

- 顶部工具按钮在同一行横向排列。
- 按钮数量较多时不再换到第二行。
- 页面宽度不足时通过横向滚动查看被遮挡按钮。

## 对应文件

- `src/views/cost/project-management/budget-book.vue`
