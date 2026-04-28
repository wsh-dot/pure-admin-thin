# 工程量计算式表格错位修复说明

## 本次修复内容

- 修复预算书工作区中 `工程量计算式` 标签页的表头错位问题。
- 将 `单位：m` 从原先覆盖在表格表头上的绝对定位层，改为公式区独立顶栏展示。
- 调整公式区布局为“上方单位栏 + 下方表格区”的两段式结构，避免压住 `工程量`、`累加` 等列头。

## 影响文件

- `src/views/cost/project-management/budget-book.vue`
  - 调整 `工程量计算式` 区域模板结构。
  - 新增 `formula-toolbar` 和 `formula-table-shell` 布局样式。
  - 移除 `formula-unit` 对表头的绝对定位覆盖。

## 校验情况

- 已执行 `pnpm typecheck`
- 结果：通过
