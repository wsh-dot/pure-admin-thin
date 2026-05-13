<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  bindMenuResources,
  bindPermissionResources,
  fetchMenuResources,
  fetchPermissionResources,
  fetchResourceTree
} from "@/api/cost/system";
import { mockAssignableResourceTree, mockCheckedResourceIds } from "../mock";
import { runMutation } from "../utils";
import type { MenuRow, PermissionRow, TreeNode } from "../types";

const props = defineProps<{
  modelValue: boolean;
  masterType?: "permission" | "menu";
  row?: PermissionRow | MenuRow | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const treeRef = ref<{
  getCheckedKeys: (leafOnly?: boolean) => Array<string | number>;
  setCheckedKeys: (keys: string[]) => void;
}>();
const loading = ref(false);
const treeRows = ref<TreeNode[]>([]);
const checkedResourceIds = ref<string[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const targetType = computed(() => props.masterType ?? "permission");

const treeProps = {
  label: (data: TreeNode) =>
    data.name || data.label || data.text || data.code || data.id,
  children: "children"
};

function hasSelectableLeaf(nodes: TreeNode[]) {
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.shift();
    if (!node) continue;
    if (node.leaf || node.id.startsWith("res-")) return true;
    stack.push(...(node.children ?? []));
  }
  return false;
}

async function loadData() {
  if (!props.row?.id) return;
  loading.value = true;
  try {
    const tree = await fetchResourceTree();
    treeRows.value =
      Array.isArray(tree) && hasSelectableLeaf(tree)
        ? tree
        : mockAssignableResourceTree();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchResourceTree", error);
    }
    treeRows.value = mockAssignableResourceTree();
  }

  try {
    const ids =
      targetType.value === "menu"
        ? await fetchMenuResources(props.row.id)
        : await fetchPermissionResources(props.row.id);
    checkedResourceIds.value = Array.isArray(ids)
      ? ids
      : mockCheckedResourceIds();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetch bound resources", error);
    }
    checkedResourceIds.value = mockCheckedResourceIds();
  } finally {
    await nextTick();
    const keys = Array.isArray(checkedResourceIds.value)
      ? checkedResourceIds.value
      : [];
    treeRef.value?.setCheckedKeys(keys);
    loading.value = false;
  }
}

async function save() {
  if (!props.row?.id) return;
  const resourceIds =
    treeRef.value?.getCheckedKeys(true).map(key => String(key)) ?? [];
  const success = await runMutation(
    () =>
      targetType.value === "menu"
        ? bindMenuResources(props.row!.id, resourceIds)
        : bindPermissionResources(props.row!.id, resourceIds),
    {
      successMessage: "保存成功",
      errorMessage: "保存资源绑定失败",
      mockFallback: () => undefined
    }
  );

  if (!success) return;
  emit("saved");
  visible.value = false;
}

watch(
  () => props.modelValue,
  value => {
    if (value) loadData();
  }
);
</script>

<template>
  <el-dialog v-model="visible" title="资源列表" width="620px">
    <el-scrollbar v-loading="loading" height="380px">
      <el-tree
        ref="treeRef"
        node-key="id"
        show-checkbox
        default-expand-all
        :data="treeRows"
        :props="treeProps"
      />
    </el-scrollbar>
    <template #footer>
      <el-button type="primary" @click="save">授权</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
