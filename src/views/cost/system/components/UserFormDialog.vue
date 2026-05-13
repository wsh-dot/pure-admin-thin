<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { createUser, updateUser } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockUpsertUser } from "../mock";
import { runMutation } from "../utils";
import type { UserRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit" | "view";
  row?: UserRow | null;
  categoryId?: string;
  categoryName?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const form = reactive<UserRow>({
  id: "",
  companyName: "",
  companyID: "",
  categoryId: "",
  uid: "",
  userNo: "",
  name: "",
  email: "",
  mobile: "",
  qualificationNo: "",
  status: "1",
  staffState: "1",
  isBorrowed: "0",
  isRela: "0"
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const title = computed(() => {
  if (props.mode === "view") return "查看用户";
  return props.mode === "edit" ? "编辑用户" : "新增用户";
});

const readonly = computed(() => props.mode === "view");
const isEdit = computed(() => props.mode === "edit");

watch(
  () => [props.modelValue, props.row, props.mode, props.categoryId] as const,
  () => {
    if (!props.modelValue) return;
    Object.assign(form, {
      id: props.row?.id ?? `u-${Date.now()}`,
      companyName: props.row?.companyName ?? props.categoryName ?? "",
      companyID: props.row?.companyID ?? props.categoryId ?? "",
      categoryId: props.row?.categoryId ?? props.categoryId ?? "",
      uid: props.row?.uid ?? props.row?.userNo ?? "",
      userNo: props.row?.userNo ?? "",
      name: props.row?.name ?? "",
      email: props.row?.email ?? "",
      mobile: props.row?.mobile ?? "",
      qualificationNo: props.row?.qualificationNo ?? "",
      status: props.row?.status ?? "1",
      staffState: props.row?.staffState ?? "1",
      isBorrowed: props.row?.isBorrowed ?? "0",
      isRela: props.row?.isRela ?? "0"
    });
  },
  { immediate: true }
);

async function save() {
  if (!form.uid || !form.userNo || !form.name) {
    message("请填写账号、员工编号和姓名", { type: "warning" });
    return;
  }

  const payload = { ...form };
  const success = await runMutation(
    () =>
      props.mode === "edit"
        ? updateUser(payload.id, payload)
        : createUser(payload),
    {
      successMessage: "保存成功",
      errorMessage: "保存用户失败",
      mockFallback: () => mockUpsertUser(payload)
    }
  );

  if (!success) return;
  emit("saved");
  visible.value = false;
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="780px">
    <el-form label-width="100px" :model="form" :disabled="readonly">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="账号" required>
            <el-input v-model="form.uid" :disabled="isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="员工编号" required>
            <el-input v-model="form.userNo" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" required>
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机">
            <el-input v-model="form.mobile" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱">
            <el-input v-model="form.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资格证号">
            <el-input v-model="form.qualificationNo" />
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
          <el-form-item label="员工状态">
            <el-select v-model="form.staffState" class="w-full">
              <el-option label="正常使用" value="1" />
              <el-option label="退休" value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否借调人员">
            <el-select v-model="form.isBorrowed" class="w-full">
              <el-option label="是" value="1" />
              <el-option label="否" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属机构">
            <el-input v-model="form.companyName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button v-if="!readonly" type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
