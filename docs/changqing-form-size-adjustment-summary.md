# 长庆查询区字号调整说明

生成日期：2026-05-09

## 本次新增内容

- 调整“党建工作”页面查询区和“新建”按钮的 Element Plus 尺寸配置。
- 新增长庆查询区局部字号覆盖，使其更接近旧系统 14px 字号。

## 已实现功能

- 移除 `party-work.vue` 中“新建”按钮的 `size="small"`。
- 移除查询表单 `el-form` 的 `size="small"`。
- 在 `changqing.scss` 中限定 `.cq-search-form` 范围覆盖字号，避免影响全站组件。
- 查询区 label、输入框、下拉框、日期区间输入框和按钮字体调整为 14px。

## 对应文件

- 页面文件：`src/views/cost/foundation/party-work.vue`
- 样式文件：`src/style/changqing.scss`

## 验证记录

- 未执行前端构建命令。
