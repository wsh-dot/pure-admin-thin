<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { hasAuth } from "@/router/utils";
import {
  changeMenuLevel,
  deleteMenu,
  fetchMenuPage,
  fetchMenuTree,
  sortMenu
} from "@/api/cost/system";
import { mockMenuPage, mockMenuTree, mockRemoveMenu } from "./mock";
import { runMutation } from "./utils";
import {
  collectTreeIds,
  systemAuth,
  type MenuRow,
  type TreeNode
} from "./types";
import SystemTreePanel from "./components/SystemTreePanel.vue";
import MenuFormDialog from "./components/MenuFormDialog.vue";
import ResourceBindDialog from "./components/ResourceBindDialog.vue";
import Search from "~icons/ri/search-line";
import Refresh from "~icons/ri/refresh-line";
import Add from "~icons/ri/add-circle-line";
import Edit from "~icons/ri/edit-2-line";
import DeleteBin from "~icons/ri/delete-bin-6-line";
import ArrowUp from "~icons/ri/arrow-up-line";
import ArrowDown from "~icons/ri/arrow-down-line";
import IndentDecrease from "~icons/ri/indent-decrease";
import IndentIncrease from "~icons/ri/indent-increase";
import Link from "~icons/ri/links-line";

defineOptions({
  name: "CostSystemMenu"
});

const loading = ref(false);
const treeLoading = ref(false);
const treeRows = ref<TreeNode[]>([]);
const selectedTreeNode = ref<TreeNode | null>(null);
const selectedRow = ref<MenuRow | null>(null);
const rows = ref<MenuRow[]>([]);
const total = ref(0);
const currentRow = ref<MenuRow | null>(null);
const formMode = ref<"create" | "edit">("create");
const formVisible = ref(false);
const resourceVisible = ref(false);
const treeFormParentId = ref("");

const query = reactive({
  pageNo: 1,
  pageSize: 15,
  ids: "",
  name: "",
  code: ""
});

const canEditMenu = computed(() => hasAuth(systemAuth.menuEdit));
const hasSelection = computed(() => selectedRow.value !== null);
const canStructureAction = computed(
  () => canEditMenu.value && hasSelection.value
);
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

function menuTypeText(type?: string) {
  const map: Record<string, string> = {
    "0": "目录",
    "1": "菜单",
    "2": "按钮"
  };
  return map[type ?? ""] ?? type ?? "-";
}

function viewText(view?: string) {
  return view === "0" ? "否" : "是";
}

async function loadTree() {
  treeLoading.value = true;
  try {
    const tree = await fetchMenuTree();
    treeRows.value = tree.length > 0 ? tree : mockMenuTree();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchMenuTree", error);
    }
    treeRows.value = mockMenuTree();
  } finally {
    treeLoading.value = false;
  }
}

async function loadData() {
  loading.value = true;
  try {
    const page = await fetchMenuPage({
      ...query,
      ids: selectedTreeIds()
    });
    const fallbackPage = mockMenuPage({
      ...query,
      ids: selectedTreeIds()
    });
    rows.value = page.list.length > 0 ? page.list : fallbackPage.list;
    total.value = page.list.length > 0 ? page.total : fallbackPage.total;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchMenuPage", error);
    }
    const fallbackPage = mockMenuPage({
      ...query,
      ids: selectedTreeIds()
    });
    rows.value = fallbackPage.list;
    total.value = fallbackPage.total;
  } finally {
    selectedRow.value = null;
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
    code: ""
  });
  loadData();
}

function onTreeSelect(node: TreeNode) {
  selectedTreeNode.value = node;
  query.pageNo = 1;
  loadData();
}

function onCurrentChange(row?: MenuRow) {
  selectedRow.value = row ?? null;
}

function openForm(
  mode: "create" | "edit",
  row?: MenuRow,
  treeParentId?: string
) {
  formMode.value = mode;
  currentRow.value = row ?? null;
  treeFormParentId.value = treeParentId ?? "";
  formVisible.value = true;
}

function openResource(row?: MenuRow | null) {
  const target = row ?? selectedRow.value;
  if (!target) return;
  currentRow.value = target;
  resourceVisible.value = true;
}

function onTreeCreate(parent?: TreeNode) {
  openForm("create", undefined, parent?.id ?? "");
}

function onTreeEdit(node: TreeNode) {
  const row = {
    id: node.id,
    name: node.name || node.label || node.text || "",
    code: node.code || "",
    categoryId: node.parentId,
    type: node.type,
    url: (node as any).url,
    view: (node as any).view,
    remark: (node as any).remark
  } as MenuRow;
  openForm("edit", row);
}

function onTreeRemove(node: TreeNode) {
  const row = {
    id: node.id,
    name: node.name || node.label || node.text || "",
    code: node.code || ""
  } as MenuRow;
  removeRow(row);
}

async function confirmAction(content: string) {
  await ElMessageBox.confirm(content, "提示", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  });
}

async function removeRow(row?: MenuRow | null) {
  const target = row ?? selectedRow.value;
  if (!target) return;
  await confirmAction("确认要删除该菜单吗?");
  const success = await runMutation(() => deleteMenu(target.id), {
    successMessage: "删除成功",
    errorMessage: "删除菜单失败",
    mockFallback: () => mockRemoveMenu(target.id)
  });
  if (!success) return;
  if (selectedRow.value?.id === target.id) selectedRow.value = null;
  await loadTree();
  await loadData();
}

async function onMoveMenu(direction: "up" | "down") {
  if (!selectedRow.value) return;
  const success = await runMutation(
    () => sortMenu({ id: selectedRow.value!.id, direction }),
    {
      successMessage: direction === "up" ? "上移成功" : "下移成功",
      errorMessage: "菜单排序失败",
      mockFallback: () => undefined
    }
  );
  if (success) await loadData();
}

async function onChangeLevel(direction: "upgrade" | "downgrade") {
  if (!selectedRow.value) return;
  const success = await runMutation(
    () => changeMenuLevel({ id: selectedRow.value!.id, direction }),
    {
      successMessage: direction === "upgrade" ? "升级成功" : "降级成功",
      errorMessage: "菜单层级调整失败",
      mockFallback: () => undefined
    }
  );
  if (success) await loadData();
}

async function onSaved() {
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
        <p>菜单管理</p>
      </div>
    </div>

    <div class="cq-system-layout">
      <SystemTreePanel
        title="菜单树"
        :nodes="treeRows"
        :loading="treeLoading"
        :editable="canEditMenu"
        @select="onTreeSelect"
        @refresh="loadTree"
        @create="onTreeCreate"
        @edit="onTreeEdit"
        @remove="onTreeRemove"
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
          <el-form-item label="编号">
            <el-input
              v-model="query.code"
              clearable
              placeholder="请输入编号"
              style="width: 160px"
            />
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

        <div class="mb-2 flex flex-wrap items-center justify-end gap-2">
          <el-button
            v-if="canEditMenu"
            type="primary"
            @click="openForm('create')"
          >
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
            highlight-current-row
            @current-change="onCurrentChange"
          >
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column prop="code" label="编码" width="100" />
            <el-table-column
              prop="url"
              label="URL"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <span class="cq-row-actions">
                  <el-button
                    v-if="canEditMenu"
                    title="编辑"
                    circle
                    @click="openForm('edit', row)"
                  >
                    <IconifyIconOffline :icon="Edit" />
                  </el-button>
                  <el-button
                    v-if="canEditMenu"
                    title="删除"
                    circle
                    @click="removeRow(row)"
                  >
                    <IconifyIconOffline :icon="DeleteBin" />
                  </el-button>
                  <el-button
                    v-if="canEditMenu"
                    title="授权"
                    circle
                    @click="openResource(row)"
                  >
                    <IconifyIconOffline :icon="Link" />
                  </el-button>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="90">
              <template #default="{ row }">
                {{ menuTypeText(row.type) }}
              </template>
            </el-table-column>
            <el-table-column label="是否显示" width="90" align="center">
              <template #default="{ row }">
                {{ viewText(row.view) }}
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

    <MenuFormDialog
      v-model="formVisible"
      :mode="formMode"
      :row="currentRow"
      :category-id="selectedCategoryId"
      :parent-id="treeFormParentId"
      :category-name="selectedCategoryName"
      @saved="onSaved"
    />
    <ResourceBindDialog
      v-model="resourceVisible"
      master-type="menu"
      :row="currentRow"
      @saved="onSaved"
    />
  </section>
</template>
