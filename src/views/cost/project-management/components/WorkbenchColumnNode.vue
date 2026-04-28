<script setup lang="ts">
import type { WorkbenchColumn } from "../types";

defineOptions({
  name: "WorkbenchColumnNode"
});

const props = defineProps<{
  column: WorkbenchColumn;
}>();
</script>

<template>
  <vxe-colgroup
    v-if="props.column.children?.length"
    :title="props.column.title"
    :width="props.column.width"
    :min-width="props.column.minWidth"
    :align="props.column.align"
    :header-align="props.column.headerAlign || 'center'"
  >
    <WorkbenchColumnNode
      v-for="child in props.column.children"
      :key="child.id"
      :column="child"
    />
  </vxe-colgroup>

  <vxe-column
    v-else
    :field="props.column.field"
    :title="props.column.title"
    :width="props.column.width"
    :min-width="props.column.minWidth"
    :align="props.column.align"
    :header-align="props.column.headerAlign || 'center'"
    :tree-node="props.column.treeNode"
    :show-overflow="props.column.showOverflow ?? true"
  />
</template>
