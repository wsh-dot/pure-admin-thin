<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { createMenu, updateMenu } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockUpsertMenu } from "../mock";
import { runMutation } from "../utils";
import type { MenuRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  row?: MenuRow | null;
  categoryId?: string;
  categoryName?: string;
  parentId?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const form = reactive<MenuRow>({
  id: "",
  categoryId: "",
  name: "",
  code: "",
  url: "",
  type: "0",
  view: "1",
  remark: ""
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const title = computed(() => (props.mode === "edit" ? "修改" : "新增"));

watch(
  () => [props.modelValue, props.row, props.mode, props.categoryId] as const,
  () => {
    if (!props.modelValue) return;
    Object.assign(form, {
      id: props.row?.id ?? `menu-${Date.now()}`,
      categoryId:
        props.row?.categoryId ?? props.parentId ?? props.categoryId ?? "",
      name: props.row?.name ?? "",
      code: props.row?.code ?? "",
      url: props.row?.url ?? "",
      type: props.row?.type ?? "0",
      view: props.row?.view ?? "1",
      remark: props.row?.remark ?? ""
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
        ? updateMenu(payload.id, payload)
        : createMenu(payload),
    {
      successMessage: "保存成功",
      errorMessage: "保存菜单失败",
      mockFallback: () => mockUpsertMenu(payload)
    }
  );

  if (!success) return;
  emit("saved");
  visible.value = false;
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="760px">
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
        <el-col :span="24">
          <el-form-item label="URL">
            <el-input v-model="form.url" placeholder="请输入URL" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型">
            <el-select v-model="form.type" class="w-full">
              <el-option label="目录" value="0" />
              <el-option label="菜单" value="1" />
              <el-option label="按钮" value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否显示">
            <el-select v-model="form.view" class="w-full">
              <el-option label="是" value="1" />
              <el-option label="否" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="描述">
            <el-input
              v-model="form.remark"
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
