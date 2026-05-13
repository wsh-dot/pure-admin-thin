<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { transferUserCategory } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockOrgTree } from "../mock";
import { runMutation } from "../utils";
import type { TreeNode, UserRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  sourceOrg?: TreeNode | null;
  users: UserRow[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const orgTree = ref<TreeNode[]>([]);
const targetOrg = ref<TreeNode | null>(null);

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const treeProps = {
  label: (data: TreeNode) =>
    data.name || data.label || data.text || data.code || data.id,
  children: "children"
};

function onTargetSelect(node: TreeNode) {
  targetOrg.value = node;
}

async function save() {
  if (!props.sourceOrg?.id) {
    message("请选择来源机构", { type: "warning" });
    return;
  }
  if (!targetOrg.value?.id) {
    message("请选择目标机构", { type: "warning" });
    return;
  }

  const success = await runMutation(
    () =>
      transferUserCategory({
        userIds: props.users.map(row => row.id),
        sourceCategoryId: props.sourceOrg!.id,
        targetCategoryId: targetOrg.value!.id
      }),
    {
      successMessage: "人员调动成功",
      errorMessage: "人员调动失败",
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
    if (!value) return;
    orgTree.value = mockOrgTree();
    targetOrg.value = null;
  }
);
</script>

<template>
  <el-dialog v-model="visible" title="人员调动" width="680px">
    <el-descriptions border :column="2" size="small">
      <el-descriptions-item label="来源机构">
        {{ sourceOrg?.name || sourceOrg?.label || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="调动人数">
        {{ users.length }} 人
      </el-descriptions-item>
      <el-descriptions-item label="人员" :span="2">
        {{ users.map(row => row.name).join("、") || "-" }}
      </el-descriptions-item>
    </el-descriptions>
    <div class="mt-4">
      <p class="mb-2 text-sm text-gray-500">请选择目标机构</p>
      <el-scrollbar height="300px">
        <el-tree
          node-key="id"
          default-expand-all
          highlight-current
          :data="orgTree"
          :props="treeProps"
          @node-click="onTargetSelect"
        />
      </el-scrollbar>
    </div>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
