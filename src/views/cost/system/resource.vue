<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { hasAuth } from "@/router/utils";
import {
  deleteResource,
  deleteResourceCategory,
  fetchResourcePage,
  fetchResourceTree
} from "@/api/cost/system";
import { mockRemoveResource, mockResourcePage, mockResourceTree } from "./mock";
import { runMutation } from "./utils";
import {
  collectTreeIds,
  systemAuth,
  type ResourceRow,
  type TreeNode
} from "./types";
import SystemTreePanel from "./components/SystemTreePanel.vue";
import ResourceFormDialog from "./components/ResourceFormDialog.vue";
import SystemCategoryDialog from "./components/SystemCategoryDialog.vue";
import Search from "~icons/ri/search-line";
import Refresh from "~icons/ri/refresh-line";
import Add from "~icons/ri/add-circle-line";
import Edit from "~icons/ri/edit-2-line";
import DeleteBin from "~icons/ri/delete-bin-6-line";

defineOptions({
  name: "CostSystemResource"
});

const loading = ref(false);
const treeLoading = ref(false);
const treeRows = ref<TreeNode[]>([]);
const selectedTreeNode = ref<TreeNode | null>(null);
const rows = ref<ResourceRow[]>([]);
const total = ref(0);
const currentRow = ref<ResourceRow | null>(null);
const currentCategory = ref<TreeNode | null>(null);
const categoryParent = ref<TreeNode | null>(null);
const formMode = ref<"create" | "edit">("create");
const categoryMode = ref<"create" | "edit">("create");
const formVisible = ref(false);
const categoryVisible = ref(false);

const query = reactive({
  pageNo: 1,
  pageSize: 15,
  ids: "",
  name: "",
  resource: "",
  status: ""
});

const canEdit = computed(() => hasAuth(systemAuth.resourceEdit));
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
    const tree = await fetchResourceTree();
    treeRows.value = tree.length > 0 ? tree : mockResourceTree();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchResourceTree", error);
    }
    treeRows.value = mockResourceTree();
  } finally {
    treeLoading.value = false;
  }
}

async function loadData() {
  loading.value = true;
  try {
    const page = await fetchResourcePage({
      ...query,
      ids: selectedTreeIds()
    });
    const fallbackPage = mockResourcePage({
      ...query,
      ids: selectedTreeIds()
    });
    rows.value = page.list.length > 0 ? page.list : fallbackPage.list;
    total.value = page.list.length > 0 ? page.total : fallbackPage.total;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchResourcePage", error);
    }
    const fallbackPage = mockResourcePage({
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
    resource: "",
    status: ""
  });
  loadData();
}

function onTreeSelect(node: TreeNode) {
  selectedTreeNode.value = node;
  query.pageNo = 1;
  loadData();
}

function openForm(mode: "create" | "edit", row?: ResourceRow) {
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

async function confirmAction(content: string) {
  await ElMessageBox.confirm(content, "提示", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  });
}

async function removeCategory(node: TreeNode) {
  await confirmAction("确认要删除该分类吗?");
  const success = await runMutation(() => deleteResourceCategory(node.id), {
    successMessage: "删除成功",
    errorMessage: "删除分类失败",
    mockFallback: () => undefined
  });
  if (!success) return;
  if (selectedTreeNode.value?.id === node.id) selectedTreeNode.value = null;
  await loadTree();
  await loadData();
}

async function removeRow(row: ResourceRow) {
  await confirmAction("确认要删除该记录吗?");
  const success = await runMutation(() => deleteResource(row.id), {
    successMessage: "删除成功",
    errorMessage: "删除资源失败",
    mockFallback: () => mockRemoveResource(row.id)
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
        <p>资源管理</p>
      </div>
    </div>

    <div class="cq-system-layout">
      <SystemTreePanel
        title="资源分类"
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
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="资源">
            <el-input
              v-model="query.resource"
              clearable
              placeholder="请输入资源标识"
              style="width: 220px"
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
            <el-table-column prop="name" label="名称" min-width="180" />
            <el-table-column
              prop="resource"
              label="资源"
              min-width="220"
              show-overflow-tooltip
            />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span :class="statusClass(row.status)">
                  {{ statusText(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="110"
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

    <ResourceFormDialog
      v-model="formVisible"
      :mode="formMode"
      :row="currentRow"
      :category-id="selectedCategoryId"
      :category-name="selectedCategoryName"
      :tree-nodes="treeRows"
      @saved="onSaved"
    />
    <SystemCategoryDialog
      v-model="categoryVisible"
      kind="resource"
      :mode="categoryMode"
      :row="currentCategory"
      :parent="categoryParent"
      @saved="onCategorySaved"
    />
  </section>
</template>
