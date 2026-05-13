<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { createResource, updateResource } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockUpsertResource } from "../mock";
import { runMutation } from "../utils";
import type { ResourceRow, TreeNode } from "../types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  row?: ResourceRow | null;
  categoryId?: string;
  categoryName?: string;
  treeNodes?: TreeNode[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const form = reactive<ResourceRow>({
  id: "",
  categoryId: "",
  name: "",
  module: "",
  resource: "",
  type: "TAG",
  status: "1",
  description: ""
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const title = computed(() => (props.mode === "edit" ? "编辑资源" : "新增资源"));

watch(
  () => [props.modelValue, props.row, props.mode, props.categoryId] as const,
  () => {
    if (!props.modelValue) return;
    Object.assign(form, {
      id: props.row?.id ?? `res-${Date.now()}`,
      categoryId: props.row?.categoryId ?? props.categoryId ?? "",
      name: props.row?.name ?? "",
      module: props.row?.module ?? "",
      resource: props.row?.resource ?? "",
      type: props.row?.type ?? "TAG",
      status: props.row?.status ?? "1",
      description: props.row?.description ?? ""
    });
  },
  { immediate: true }
);

async function save() {
  if (!form.name || !form.module || !form.resource) {
    message("请填写名称、模块和资源", { type: "warning" });
    return;
  }

  const payload = { ...form };
  const success = await runMutation(
    () =>
      props.mode === "edit"
        ? updateResource(payload.id, payload)
        : createResource(payload),
    {
      successMessage: "保存成功",
      errorMessage: "保存资源失败",
      mockFallback: () => mockUpsertResource(payload)
    }
  );

  if (!success) return;
  emit("saved");
  visible.value = false;
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="720px">
    <el-form label-width="90px" :model="form">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="名称" required>
            <el-input v-model="form.name" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模块" required>
            <el-input v-model="form.module" placeholder="请输入模块" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资源类型">
            <el-select v-model="form.type" class="w-full">
              <el-option label="TAG" value="TAG" />
              <el-option label="BTN" value="BTN" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资源" required>
            <el-input v-model="form.resource" placeholder="请输入资源" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否启用">
            <el-select v-model="form.status" class="w-full">
              <el-option label="是" value="1" />
              <el-option label="否" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="归属分类">
            <el-tree-select
              v-model="form.categoryId"
              :data="treeNodes ?? []"
              node-key="id"
              :props="{ label: 'name', children: 'children' }"
              :render-after-expand="false"
              placeholder="请选择归属分类"
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="描述">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请填写描述"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
