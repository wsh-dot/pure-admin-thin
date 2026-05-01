# 预算书右键菜单按标签页区分说明

## 新增内容

- 将预算书右键菜单拆分为四套独立配置：
  - 定额计价 / 预算书
  - 清单计价 / 分部分项
  - 清单计价 / 措施项目
  - 清单计价 / 其他项目
- 清单计价的其他项目工作区新增右键菜单触发，菜单内容匹配截图中的简化菜单。
- 右键菜单渲染改为读取当前标签页对应的菜单配置，避免清单计价菜单覆盖定额计价预算书旧菜单。

## 实现功能

- 在定额计价预算书标签页右键时，展示原预算书菜单。
- 点击切换清单计价后，在分部分项标签页右键时展示分部分项清单计价菜单。
- 切换到措施项目标签页右键时，展示措施项目专属菜单，包含保存模板、套用模板等入口。
- 切换到其他项目标签页右键时，展示增加子项、增加后项、复制、剪切、粘贴、删除、恢复、保存模板、套用模板菜单。
- 菜单位置计算逻辑继续保留，展开详细面板时尽量保证内容可见。

## 对应文件

- `src/views/cost/project-management/budget-book.vue`
  - `quotaBudgetContextMenuGroups`：定额计价预算书菜单。
  - `listDivisionContextMenuGroups`：清单计价分部分项菜单。
  - `listMeasureContextMenuGroups`：清单计价措施项目菜单。
  - `listOtherContextMenuGroups`：清单计价其他项目菜单。
  - `currentBudgetContextMenuGroups`：根据当前计价模式和标签页选择菜单。
  - `handleBudgetContextMenu`：按当前菜单配置决定是否展示右键菜单。
