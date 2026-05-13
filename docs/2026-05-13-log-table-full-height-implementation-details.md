# 日志管理表格高度撑满实现细节

## 修改文件

### `src/views/cost/system/log.vue`

日志管理页当前已经使用：

```vue
<section class="cq-page cq-system-page">
  <div class="cq-page-header">...</div>
  <main class="cq-system-main">...</main>
</section>
```

菜单管理页使用的完整全高结构是：

```vue
<section class="cq-page cq-system-page">
  <div class="cq-page-header">...</div>
  <div class="cq-system-layout">
    <SystemTreePanel />
    <main class="cq-system-main">...</main>
  </div>
</section>
```

其中 `cq-system-layout` 提供主工作区高度：

```scss
.cq-system-layout {
  height: calc(100vh - var(--cq-header-height) - 84px);
}
```

公共样式 `src/style/changqing.scss` 中还对表格容器有统一高度规则：

```scss
.cq-system-main .cq-table-wrap {
  flex: 1 1 auto;
  height: 0 !important;
  min-height: 0 !important;
}
```

这套规则会让查询区、按钮区保持自然高度，让表格容器吃满剩余高度。

## 本次调整

### 1. 补齐 `cq-system-layout`

日志页没有左侧树，但仍需要菜单页同款的工作区高度容器。因此本次将原来的直接 `main.cq-system-main` 改成：

```vue
<div class="cq-system-layout">
  <main class="cq-system-main">
    ...
  </main>
</div>
```

这样日志页可以复用菜单管理的全高布局计算。

### 2. 调整 `cq-table-wrap` 内联样式

修改前：

```vue
<div class="cq-table-wrap" style="height: auto !important"></div>
```

`height: auto !important` 会覆盖公共样式中的 `height: 0 !important`，导致 `cq-table-wrap` 按内容自然高度渲染。日志数据较少时，表格边框只包住已有行和分页，下方留下大片空白。

修改后：

```vue
<div class="cq-table-wrap" style="height: auto; flex: 1; min-height: 0"></div>
```

该写法与菜单管理页面一致。由于 `height: auto` 不再携带 `!important`，公共样式中的 `height: 0 !important` 可以正常生效，`flex: 1` 负责把表格区域撑满 `cq-system-main` 的剩余高度。

## 效果

- 日志管理表格外框高度与菜单管理表格一致。
- `el-table` 继续使用 `height="calc(100% - 42px)"`，底部预留分页高度。
- 分页条固定在表格容器底部，表格主体占满中间剩余空间。

## 未执行事项

- 未执行 `pnpm build`
- 未执行 `npm run build`
- 未执行 `vite build`
