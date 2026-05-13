<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { saveUserDataExchange } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockOrgTree, mockUserPage } from "../mock";
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

const orgTree = ref<TreeNode[]>([]);
const targetUsers = ref<UserRow[]>([]);
const form = reactive({
  targetOrgId: "",
  targetUserId: "",
  remark: ""
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const treeProps = {
  label: (data: TreeNode) =>
    data.name || data.label || data.text || data.code || data.id,
  children: "children"
};

function loadTargetUsers() {
  if (!form.targetOrgId) {
    targetUsers.value = [];
    return;
  }
  targetUsers.value = mockUserPage({
    pageNo: 1,
    pageSize: 9999,
    ids: form.targetOrgId
  }).list.filter(row => row.id !== props.row?.id);
}

function onOrgSelect(node: TreeNode) {
  form.targetOrgId = node.id;
  form.targetUserId = "";
  loadTargetUsers();
}

async function save() {
  if (!props.row?.id) return;
  if (!form.targetOrgId || !form.targetUserId) {
    message("请选择目标组织和目标人员", { type: "warning" });
    return;
  }

  const success = await runMutation(
    () => saveUserDataExchange(props.row!.id, { ...form }),
    {
      successMessage: "数据交接成功",
      errorMessage: "数据交接失败",
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
    Object.assign(form, {
      targetOrgId: "",
      targetUserId: "",
      remark: ""
    });
    targetUsers.value = [];
  }
);
</script>

<template>
  <el-dialog v-model="visible" title="数据交接" width="760px">
    <el-descriptions border :column="2" size="small">
      <el-descriptions-item label="来源账号">
        {{ row?.uid || row?.userNo || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="来源姓名">
        {{ row?.name || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="来源机构" :span="2">
        {{ row?.companyName || "-" }}
      </el-descriptions-item>
    </el-descriptions>
    <el-row :gutter="16" class="mt-4">
      <el-col :span="10">
        <el-scrollbar height="300px">
          <el-tree
            node-key="id"
            default-expand-all
            highlight-current
            :data="orgTree"
            :props="treeProps"
            @node-click="onOrgSelect"
          />
        </el-scrollbar>
      </el-col>
      <el-col :span="14">
        <el-form label-width="90px" :model="form">
          <el-form-item label="目标人员" required>
            <el-select v-model="form.targetUserId" class="w-full" filterable>
              <el-option
                v-for="item in targetUsers"
                :key="item.id"
                :label="`${item.name}（${item.userNo}）`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="5" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
