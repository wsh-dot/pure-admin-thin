<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { saveUserCategoryRelation } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockUserPage } from "../mock";
import { runMutation } from "../utils";
import type { UserRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  categoryId: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const loading = ref(false);
const rows = ref<UserRow[]>([]);
const selectedRows = ref<UserRow[]>([]);
const query = reactive({
  uid: "",
  name: ""
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

function loadUsers() {
  loading.value = true;
  try {
    const page = mockUserPage({
      pageNo: 1,
      pageSize: 9999,
      uid: query.uid,
      name: query.name
    });
    rows.value = page.list.filter(row => row.categoryId !== props.categoryId);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.uid = "";
  query.name = "";
  loadUsers();
}

function onSelectionChange(selection: UserRow[]) {
  selectedRows.value = selection;
}

async function save() {
  if (selectedRows.value.length === 0) {
    message("请选择要引用的人员", { type: "warning" });
    return;
  }

  const userIds = selectedRows.value.map(row => row.id);
  const success = await runMutation(
    () => saveUserCategoryRelation({ userIds, categoryId: props.categoryId }),
    {
      successMessage: "引用成功",
      errorMessage: "引用人员失败",
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
    selectedRows.value = [];
    loadUsers();
  }
);
</script>

<template>
  <el-dialog v-model="visible" title="引用人员" width="760px">
    <el-form :model="query" inline class="cq-search-form">
      <el-form-item label="账号">
        <el-input v-model="query.uid" clearable placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="query.name" clearable placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadUsers">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="rows"
      border
      height="360px"
      size="small"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="46" />
      <el-table-column prop="uid" label="账号" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="userNo" label="员工编号" width="120" />
      <el-table-column prop="companyName" label="所属机构" min-width="180" />
    </el-table>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
