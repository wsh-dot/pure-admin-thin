<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { createOrg, updateOrg } from "@/api/cost/system";
import { runMutation } from "../utils";
import type { TreeNode } from "../types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
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
  orgCode: "",
  wbsElement: "",
  shortName: "",
  name: "",
  fullName: "",
  sort: 11,
  code: "",
  orgType: "",
  leader: "",
  buildType: "",
  flowType: "",
  evaluationType: "",
  evaluationScore: ""
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const title = computed(() =>
  props.mode === "edit" ? "编辑用户机构" : "新增用户机构"
);

watch(
  () => [props.modelValue, props.row, props.parent, props.mode] as const,
  () => {
    if (!props.modelValue) return;
    Object.assign(form, {
      id: props.row?.id ?? `org-${Date.now()}`,
      parentId: props.row?.parentId ?? props.parent?.id ?? "",
      orgCode: props.row?.code ?? "",
      wbsElement: "",
      shortName: props.row?.label ?? props.row?.name ?? "",
      name: props.row?.name ?? props.row?.label ?? "",
      fullName: props.row?.text ?? props.row?.name ?? props.row?.label ?? "",
      sort: 11,
      code: props.row?.code ?? "",
      orgType: props.row?.type ?? "",
      leader: "",
      buildType: "",
      flowType: "",
      evaluationType: "",
      evaluationScore: ""
    });
  },
  { immediate: true }
);

async function save() {
  const payload = { ...form };
  const success = await runMutation(
    () =>
      props.mode === "edit"
        ? updateOrg(payload.id, payload)
        : createOrg(payload),
    {
      successMessage: "保存成功",
      errorMessage: "保存机构失败",
      mockFallback: () => undefined
    }
  );

  if (!success) return;
  emit("saved");
  visible.value = false;
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="552px"
    top="14vh"
    :show-close="false"
    class="cq-org-dialog"
  >
    <template #header>
      <div class="cq-org-dialog__header">
        <span>{{ title }}</span>
        <el-button
          text
          class="cq-org-dialog__close"
          aria-label="关闭此对话框"
          @click="visible = false"
        >
          ×
        </el-button>
      </div>
    </template>

    <el-form label-width="110px" :model="form" class="cq-org-form">
      <el-form-item label="机构编码">
        <el-input v-model="form.orgCode" placeholder="请输入机构编码">
          <template #append>
            <el-button>选择</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="WBS元素">
        <el-input v-model="form.wbsElement" placeholder="请输入WBS元素" />
      </el-form-item>
      <el-form-item label="机构简称">
        <el-input v-model="form.shortName" placeholder="请输入机构简称" />
      </el-form-item>
      <el-form-item label="机构名称" required>
        <el-input v-model="form.name" placeholder="请输入机构名称" />
      </el-form-item>
      <el-form-item label="机构类型">
        <el-select v-model="form.orgType" clearable placeholder="请选择">
          <el-option label="建设单位" value="建设单位" />
          <el-option label="设计单位" value="设计单位" />
          <el-option label="施工单位" value="施工单位" />
          <el-option label="监理单位" value="监理单位" />
          <el-option label="咨询公司" value="咨询公司" />
          <el-option label="管理部门" value="管理部门" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序号">
        <el-input v-model.number="form.sort" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
:global(.cq-org-dialog .el-dialog__header) {
  padding: 0;
  margin-right: 0;
  border-bottom: 1px solid #ebeef5;
}

.cq-org-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 16px 0 20px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.cq-org-dialog__close {
  width: 32px;
  height: 32px;
  padding: 0;
  margin-right: -4px;
  font-size: 22px;
  line-height: 1;
  color: #606266;
}

.cq-org-form {
  width: 426px;
  margin: 22px auto 0;
}

.cq-org-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.cq-org-form :deep(.el-select) {
  width: 100%;
}

.cq-org-form :deep(.el-input-group__append) {
  padding: 0 14px;
  color: #333;
  background: #fff;
}

:global(.cq-org-dialog .el-dialog__body) {
  min-height: 0;
  padding: 0 0 18px;
}
</style>
