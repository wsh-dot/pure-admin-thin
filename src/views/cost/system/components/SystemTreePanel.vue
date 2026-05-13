<script setup lang="ts">
import type { TreeNode } from "../types";
import Add from "~icons/ri/add-circle-line";
import Refresh from "~icons/ri/refresh-line";
import Edit from "~icons/ri/edit-2-line";
import DeleteBin from "~icons/ri/delete-bin-6-line";

defineProps<{
  title: string;
  nodes: TreeNode[];
  loading?: boolean;
  editable?: boolean;
}>();

const emit = defineEmits<{
  select: [node: TreeNode];
  refresh: [];
  create: [parent?: TreeNode];
  edit: [node: TreeNode];
  remove: [node: TreeNode];
}>();

function treeLabel(data: TreeNode) {
  return data.name || data.label || data.text || data.code || data.id;
}

const treeProps = {
  label: treeLabel,
  children: "children"
};
</script>

<template>
  <aside class="cq-system-tree">
    <div class="cq-system-tree__header">
      <strong>{{ title }}</strong>
      <div>
        <el-button text :icon="Refresh" @click="emit('refresh')" />
        <el-button
          v-if="editable"
          text
          type="primary"
          :icon="Add"
          @click="emit('create')"
        />
      </div>
    </div>
    <el-scrollbar class="cq-system-tree__body">
      <el-tree
        v-loading="loading"
        node-key="id"
        default-expand-all
        highlight-current
        :data="nodes"
        :props="treeProps"
        @node-click="node => emit('select', node)"
      >
        <template #default="{ data }">
          <span class="cq-system-tree__node">
            <span class="cq-system-tree__label">
              {{ treeLabel(data) }}
            </span>
            <span v-if="editable" class="cq-system-tree__actions">
              <el-button
                link
                type="primary"
                :icon="Add"
                @click.stop="emit('create', data)"
              />
              <el-button
                link
                type="primary"
                :icon="Edit"
                @click.stop="emit('edit', data)"
              />
              <el-button
                v-if="!data.children?.length"
                link
                type="danger"
                :icon="DeleteBin"
                @click.stop="emit('remove', data)"
              />
            </span>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </aside>
</template>
