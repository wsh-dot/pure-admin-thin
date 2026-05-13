<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import {
  createMenu,
  createPermissionCategory,
  createResourceCategory,
  createRoleCategory,
  updateMenu,
  updatePermissionCategory,
  updateResourceCategory,
  updateRoleCategory
} from "@/api/cost/system";
import { message } from "@/utils/message";
import { runMutation } from "../utils";
import type { TreeNode } from "../types";

type CategoryKind = "resource" | "permission" | "role" | "menu";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  kind: CategoryKind;
  row?: TreeNode | null;
  parent?: TreeNode | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const form = reactive({
  id: "",
  parentId: "",
  name: "",
  code: "",
  module: "",
  sort: 1,
  description: ""
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const title = computed(() => {
  const action = props.mode === "edit" ? "编辑" : "新增";
  if (props.kind === "resource" || props.kind === "role") {
    return action;
  }
  if (props.kind === "permission") {
    return `${action}权限`;
  }
  const labelMap: Record<CategoryKind, string> = {
    resource: "资源分类",
    permission: "权限分类",
    role: "角色分类",
    menu: "菜单"
  };
  return `${action}${labelMap[props.kind]}`;
});

watch(
  () =>
    [
      props.modelValue,
      props.row,
      props.parent,
      props.mode,
      props.kind
    ] as const,
  () => {
    if (!props.modelValue) return;
    const isResource = props.kind === "resource";
    const isPermission = props.kind === "permission";
    Object.assign(form, {
      id: props.row?.id ?? `${props.kind}-${Date.now()}`,
      parentId: props.row?.parentId ?? props.parent?.id ?? "",
      name: props.row?.name ?? props.row?.label ?? "",
      code: isResource || isPermission ? "" : (props.row?.code ?? ""),
      module: isResource || isPermission ? "" : (props.row?.type ?? ""),
      sort: isResource ? 13 : isPermission ? 34 : 1,
      description: ""
    });
  },
  { immediate: true }
);

function saveTask(payload: object) {
  if (props.kind === "resource") {
    return props.mode === "edit"
      ? updateResourceCategory(form.id, payload)
      : createResourceCategory(payload);
  }
  if (props.kind === "permission") {
    return props.mode === "edit"
      ? updatePermissionCategory(form.id, payload)
      : createPermissionCategory(payload);
  }
  if (props.kind === "role") {
    return props.mode === "edit"
      ? updateRoleCategory(form.id, payload)
      : createRoleCategory(payload);
  }
  return props.mode === "edit"
    ? updateMenu(form.id, payload)
    : createMenu(payload);
}

async function save() {
  if (props.kind === "resource") {
    if (!form.name || !form.module || !form.sort) {
      message("请填写名称、模块和排序号", { type: "warning" });
      return;
    }
  }
  if (props.kind === "permission") {
    if (!form.name || !form.sort) {
      message("请填写名称和排序号", { type: "warning" });
      return;
    }
  }
  if (props.kind === "role") {
    if (!form.name) {
      message("请填写名称", { type: "warning" });
      return;
    }
  }
  const payload = { ...form };
  const success = await runMutation(() => saveTask(payload), {
    successMessage: "保存成功",
    errorMessage: "保存分类失败",
    mockFallback: () => undefined
  });

  if (!success) return;
  emit("saved");
  visible.value = false;
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="560px">
    <el-form label-width="90px" :model="form">
      <el-form-item label="名称" required>
        <el-input v-model="form.name" placeholder="请输入名称" />
      </el-form-item>
      <template v-if="kind === 'resource'">
        <el-form-item label="模块" required>
          <el-input v-model="form.module" placeholder="请输入模块" />
        </el-form-item>
        <el-form-item label="排序号" required>
          <el-input v-model.number="form.sort" placeholder="请输入排序号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </template>
      <template v-else-if="kind === 'permission'">
        <el-form-item label="排序号" required>
          <el-input v-model.number="form.sort" placeholder="请输入排序号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </template>
      <template v-else-if="kind === 'menu'">
        <el-form-item label="父级">
          <el-input v-model="form.parentId" disabled />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="form.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" class="w-full" />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
