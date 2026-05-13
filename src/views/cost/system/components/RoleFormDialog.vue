<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { createRole, updateRole } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockUpsertRole } from "../mock";
import { runMutation } from "../utils";
import type { RoleRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  row?: RoleRow | null;
  categoryId?: string;
  categoryName?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const form = reactive<RoleRow>({
  id: "",
  categoryId: "",
  code: "",
  name: "",
  status: "1",
  description: ""
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const title = computed(() => (props.mode === "edit" ? "编辑" : "新增"));

watch(
  () => [props.modelValue, props.row, props.mode, props.categoryId] as const,
  () => {
    if (!props.modelValue) return;
    Object.assign(form, {
      id: props.row?.id ?? `role-${Date.now()}`,
      categoryId: props.row?.categoryId ?? props.categoryId ?? "",
      code: props.row?.code ?? "",
      name: props.row?.name ?? "",
      status: props.row?.status ?? "1",
      description: props.row?.description ?? ""
    });
  },
  { immediate: true }
);

async function save() {
  if (!form.code || !form.name) {
    message("请填写编号和名称", { type: "warning" });
    return;
  }

  const payload = { ...form };
  const success = await runMutation(
    () =>
      props.mode === "edit"
        ? updateRole(payload.id, payload)
        : createRole(payload),
    {
      successMessage: "保存成功",
      errorMessage: "保存角色失败",
      mockFallback: () => mockUpsertRole(payload)
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
          <el-form-item label="编号" required>
            <el-input v-model="form.code" placeholder="请输入编号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="名称" required>
            <el-input v-model="form.name" placeholder="请输入名称" />
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
        <el-col :span="24">
          <el-form-item label="描述">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
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
