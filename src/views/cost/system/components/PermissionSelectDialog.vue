<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  authorizeRolePermissions,
  authorizeUserPermissions,
  fetchRolePermissions,
  fetchUserPermissions
} from "@/api/cost/system";
import {
  mockAssignablePermissionTree,
  mockCheckedPermissionIds
} from "../mock";
import { runMutation } from "../utils";
import type { RoleRow, TreeNode, UserRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  mode?: "user" | "role";
  user?: UserRow | null;
  role?: RoleRow | null;
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
const checkedPermissionIds = ref<string[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const dialogTitle = computed(() => "权限列表");

const targetId = computed(() =>
  props.mode === "role" ? props.role?.id : props.user?.id
);

const treeProps = {
  label: (data: TreeNode) =>
    data.name || data.label || data.text || data.code || data.id,
  children: "children"
};

async function loadData() {
  if (!targetId.value) return;
  loading.value = true;
  try {
    treeRows.value = mockAssignablePermissionTree();
    const ids =
      props.mode === "role"
        ? await fetchRolePermissions(targetId.value)
        : await fetchUserPermissions(targetId.value);
    checkedPermissionIds.value = Array.isArray(ids)
      ? ids
      : mockCheckedPermissionIds();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetch permissions", error);
    }
    checkedPermissionIds.value = mockCheckedPermissionIds();
  } finally {
    await nextTick();
    const keys = Array.isArray(checkedPermissionIds.value)
      ? checkedPermissionIds.value
      : [];
    treeRef.value?.setCheckedKeys(keys);
    loading.value = false;
  }
}

async function save() {
  if (!targetId.value) return;
  const permissionIds =
    treeRef.value?.getCheckedKeys(true).map(key => String(key)) ?? [];
  const success = await runMutation(
    () =>
      props.mode === "role"
        ? authorizeRolePermissions(targetId.value!, permissionIds)
        : authorizeUserPermissions(targetId.value!, permissionIds),
    {
      successMessage: "保存成功",
      errorMessage: "保存权限失败",
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
  <el-dialog v-model="visible" :title="dialogTitle" width="560px">
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
