<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { fetchPermissionUsers, savePermissionUsers } from "@/api/cost/system";
import { mockPermissionUsers } from "../mock";
import { runMutation } from "../utils";
import type { PermissionRow, UserRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  row?: PermissionRow | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const loading = ref(false);
const rows = ref<UserRow[]>([]);
const selectedRows = ref<UserRow[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

async function loadData() {
  if (!props.row?.id) return;
  loading.value = true;
  try {
    const users = await fetchPermissionUsers(props.row.id);
    rows.value = users.length > 0 ? users : mockPermissionUsers();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchPermissionUsers", error);
    }
    rows.value = mockPermissionUsers();
  } finally {
    selectedRows.value = [];
    loading.value = false;
  }
}

async function save() {
  if (!props.row?.id) return;
  const userIds = selectedRows.value.map(row => row.id);
  const success = await runMutation(
    () => savePermissionUsers(props.row!.id, userIds),
    {
      successMessage: "保存成功",
      errorMessage: "保存权限用户失败",
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

function onSelectionChange(selection: UserRow[]) {
  selectedRows.value = selection;
}
</script>

<template>
  <el-dialog v-model="visible" title="权限用户" width="820px">
    <el-table
      v-loading="loading"
      :data="rows"
      height="360px"
      border
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="46" align="center" />
      <el-table-column prop="uid" label="账号" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="userNo" label="员工编号" width="120" />
      <el-table-column
        prop="companyName"
        label="所属机构"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column label="手机" width="120">
        <template #default="{ row }">
          {{ row.mobile || "-" }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <span
            :class="
              row.status === '1' ? 'cq-status-success' : 'cq-status-error'
            "
          >
            {{ row.status === "1" ? "启用" : "禁用" }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
