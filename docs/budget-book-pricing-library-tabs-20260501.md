# 预算书计价库标签页显示调整

## 修改内容

- 新增 `visiblePricingLibraryTabs` 计算属性，用于控制计价库弹窗顶部标签页显示范围。
- 将计价库弹窗标签页循环数据源由 `pricingLibraryTabs` 调整为 `visiblePricingLibraryTabs`。
- 在 `handlePricingTabClick` 中增加保护逻辑，避免非清单计价分部分项场景切换到 `清单模板`。

## 实现功能

- 定额计价预算书页面点击 `定额计价` 时，不再显示 `清单模板` 标签页。
- 只有在清单计价模式下，并且当前处于 `分部分项` 标签页时，点击 `清单计价` 才显示 `清单模板` 标签页。
- 非允许场景下误触发 `template` 标签时，会自动回退到 `定额库`。

## 对应文件

- `src/views/cost/project-management/budget-book.vue`
