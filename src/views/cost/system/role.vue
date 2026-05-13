<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { hasAuth } from "@/router/utils";
import {
  deleteRole,
  deleteRoleCategory,
  fetchRolePage,
  fetchRoleTree
} from "@/api/cost/system";
import { mockRemoveRole, mockRolePage, mockRoleTree } from "./mock";
import { runMutation } from "./utils";
import {
  collectTreeIds,
  systemAuth,
  type RoleRow,
  type TreeNode
} from "./types";
import SystemTreePanel from "./components/SystemTreePanel.vue";
import RoleFormDialog from "./components/RoleFormDialog.vue";
import PermissionSelectDialog from "./components/PermissionSelectDialog.vue";
import SystemCategoryDialog from "./components/SystemCategoryDialog.vue";
import Search from "~icons/ri/search-line";
import Refresh from "~icons/ri/refresh-line";
import Add from "~icons/ri/add-circle-line";
import Edit from "~icons/ri/edit-2-line";
import DeleteBin from "~icons/ri/delete-bin-6-line";
import ShieldUser from "~icons/ri/shield-user-line";

defineOptions({
  name: "CostSystemRole"
});

const loading = ref(false);
const treeLoading = ref(false);
const treeRows = ref<TreeNode[]>([]);
const selectedTreeNode = ref<TreeNode | null>(null);
const rows = ref<RoleRow[]>([]);
const total = ref(0);
const currentRow = ref<RoleRow | null>(null);
const currentCategory = ref<TreeNode | null>(null);
const categoryParent = ref<TreeNode | null>(null);
const formMode = ref<"create" | "edit">("create");
const categoryMode = ref<"create" | "edit">("create");
const formVisible = ref(false);
const categoryVisible = ref(false);
const permissionVisible = ref(false);

const query = reactive({
  pageNo: 1,
  pageSize: 15,
  ids: "",
  name: "",
  code: "",
  status: ""
});

const canEdit = computed(() => hasAuth(systemAuth.roleEdit));
const selectedCategoryId = computed(
  () => selectedTreeNode.value?.id ?? treeRows.value[0]?.id ?? ""
);
const selectedCategoryName = computed(
  () => treeLabel(selectedTreeNode.value) || treeLabel(treeRows.value[0])
);

function treeLabel(node?: TreeNode | null) {
  if (!node) return "";
  return node.name || node.label || node.text || node.code || node.id;
}

function selectedTreeIds() {
  return collectTreeIds(selectedTreeNode.value);
}

function statusText(status: string) {
  return status === "1" ? "启用" : "禁用";
}

function statusClass(status: string) {
  return status === "1" ? "cq-status-success" : "cq-status-error";
}

async function loadTree() {
  treeLoading.value = true;
  try {
    const tree = await fetchRoleTree();
    treeRows.value = tree.length > 0 ? tree : mockRoleTree();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchRoleTree", error);
    }
    treeRows.value = mockRoleTree();
  } finally {
    treeLoading.value = false;
  }
}

async function loadData() {
  loading.value = true;
  try {
    const page = await fetchRolePage({
      ...query,
      ids: selectedTreeIds()
    });
    const fallbackPage = mockRolePage({
      ...query,
      ids: selectedTreeIds()
    });
    rows.value = page.list.length > 0 ? page.list : fallbackPage.list;
    total.value = page.list.length > 0 ? page.total : fallbackPage.total;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchRolePage", error);
    }
    const fallbackPage = mockRolePage({
      ...query,
      ids: selectedTreeIds()
    });
    rows.value = fallbackPage.list;
    total.value = fallbackPage.total;
  } finally {
    loading.value = false;
  }
}

function searchData() {
  query.pageNo = 1;
  loadData();
}

function resetQuery() {
  Object.assign(query, {
    pageNo: 1,
    name: "",
    code: "",
    status: ""
  });
  loadData();
}

function onTreeSelect(node: TreeNode) {
  selectedTreeNode.value = node;
  query.pageNo = 1;
  loadData();
}

function openForm(mode: "create" | "edit", row?: RoleRow) {
  formMode.value = mode;
  currentRow.value = row ?? null;
  formVisible.value = true;
}

function openCategoryCreate(parent?: TreeNode) {
  categoryMode.value = "create";
  categoryParent.value = parent ?? selectedTreeNode.value;
  currentCategory.value = null;
  categoryVisible.value = true;
}

function openCategoryEdit(node: TreeNode) {
  categoryMode.value = "edit";
  categoryParent.value = null;
  currentCategory.value = node;
  categoryVisible.value = true;
}

function openPermission(row: RoleRow) {
  currentRow.value = row;
  permissionVisible.value = true;
}

async function confirmAction(content: string) {
  await ElMessageBox.confirm(content, "提示", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  });
}

async function removeCategory(node: TreeNode) {
  await confirmAction("确认要删除该分类吗?");
  const success = await runMutation(() => deleteRoleCategory(node.id), {
    successMessage: "删除成功",
    errorMessage: "删除分类失败",
    mockFallback: () => undefined
  });
  if (!success) return;
  if (selectedTreeNode.value?.id === node.id) selectedTreeNode.value = null;
  await loadTree();
  await loadData();
}

async function removeRow(row: RoleRow) {
  await confirmAction("确认要删除该记录吗?");
  const success = await runMutation(() => deleteRole(row.id), {
    successMessage: "删除成功",
    errorMessage: "删除角色失败",
    mockFallback: () => mockRemoveRole(row.id)
  });
  if (success) loadData();
}

async function onSaved() {
  await loadData();
}

async function onCategorySaved() {
  await loadTree();
  await loadData();
}

onMounted(async () => {
  await loadTree();
  await loadData();
});
</script>

<template>
  <section class="cq-page cq-system-page">
    <div class="cq-page-header">
      <div>
        <h2>系统管理</h2>
        <p>角色管理</p>
      </div>
    </div>

    <div class="cq-system-layout">
      <SystemTreePanel
        title="角色分类"
        :nodes="treeRows"
        :loading="treeLoading"
        :editable="canEdit"
        @select="onTreeSelect"
        @refresh="loadTree"
        @create="openCategoryCreate"
        @edit="openCategoryEdit"
        @remove="removeCategory"
      />

      <main class="cq-system-main">
        <el-form :model="query" inline class="cq-search-form">
          <el-form-item label="名称">
            <el-input
              v-model="query.name"
              clearable
              placeholder="请输入名称"
              style="width: 170px"
            />
          </el-form-item>
          <el-form-item label="编号">
            <el-input
              v-model="query.code"
              clearable
              placeholder="请输入编号"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="query.status"
              clearable
              placeholder="全部"
              style="width: 120px"
            >
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchData">
              <IconifyIconOffline :icon="Search" />
              查询
            </el-button>
            <el-button @click="resetQuery">
              <IconifyIconOffline :icon="Refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <div class="mb-2 flex items-center justify-end gap-2">
          <el-button v-if="canEdit" type="primary" @click="openForm('create')">
            <IconifyIconOffline :icon="Add" />
            新增
          </el-button>
        </div>

        <div class="cq-table-wrap" style=" flex: 1;height: auto; min-height: 0">
          <el-table
            v-loading="loading"
            class="cq-table"
            :data="rows"
            size="small"
            height="calc(100% - 42px)"
            border
          >
            <el-table-column prop="code" label="编码" width="120" />
            <el-table-column prop="name" label="名称" min-width="160" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span :class="statusClass(row.status)">
                  {{ statusText(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.description || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="150"
              fixed="right"
              align="center"
            >
              <template #default="{ row }">
                <span class="cq-row-actions">
                  <el-button
                    v-if="canEdit"
                    title="编辑"
                    circle
                    @click="openForm('edit', row)"
                  >
                    <IconifyIconOffline :icon="Edit" />
                  </el-button>
                  <el-button
                    v-if="canEdit"
                    title="删除"
                    circle
                    @click="removeRow(row)"
                  >
                    <IconifyIconOffline :icon="DeleteBin" />
                  </el-button>
                  <el-button
                    v-if="canEdit"
                    title="授权"
                    circle
                    @click="openPermission(row)"
                  >
                    <IconifyIconOffline :icon="ShieldUser" />
                  </el-button>
                </span>
              </template>
            </el-table-column>
          </el-table>

          <div class="cq-pagination">
            <el-pagination
              v-model:current-page="query.pageNo"
              v-model:page-size="query.pageSize"
              :total="total"
              :page-sizes="[15, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="searchData"
              @current-change="loadData"
            />
          </div>
        </div>
      </main>
    </div>

    <RoleFormDialog
      v-model="formVisible"
      :mode="formMode"
      :row="currentRow"
      :category-id="selectedCategoryId"
      :category-name="selectedCategoryName"
      @saved="onSaved"
    />
    <PermissionSelectDialog
      v-model="permissionVisible"
      mode="role"
      :role="currentRow"
      @saved="onSaved"
    />
    <SystemCategoryDialog
      v-model="categoryVisible"
      kind="role"
      :mode="categoryMode"
      :row="currentCategory"
      :parent="categoryParent"
      @saved="onCategorySaved"
    />
  </section>
</template>
