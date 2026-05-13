<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  fetchOrgTree,
  fetchUserIndexOrgs,
  saveUserIndexOrgs
} from "@/api/cost/system";
import { mockCheckedOrgIds, mockOrgTree } from "../mock";
import { runMutation } from "../utils";
import type { TreeNode, UserRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  row?: UserRow | null;
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
const checkedOrgIds = ref<string[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const treeProps = {
  label: (data: TreeNode) =>
    data.name || data.label || data.text || data.code || data.id,
  children: "children"
};

async function loadData() {
  if (!props.row?.id) return;
  loading.value = true;
  try {
    const tree = await fetchOrgTree();
    treeRows.value = tree.length > 0 ? tree : mockOrgTree();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchOrgTree", error);
    }
    treeRows.value = mockOrgTree();
  }

  try {
    checkedOrgIds.value = await fetchUserIndexOrgs(props.row.id);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchUserIndexOrgs", error);
    }
    checkedOrgIds.value = mockCheckedOrgIds();
  } finally {
    await nextTick();
    treeRef.value?.setCheckedKeys(checkedOrgIds.value);
    loading.value = false;
  }
}

async function save() {
  if (!props.row?.id) return;
  const orgIds =
    treeRef.value?.getCheckedKeys(false).map(key => String(key)) ?? [];
  const success = await runMutation(
    () => saveUserIndexOrgs(props.row!.id, orgIds),
    {
      successMessage: "保存成功",
      errorMessage: "保存授权建设单位指标失败",
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
  <el-dialog v-model="visible" title="授权建设单位指标" width="560px">
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
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
