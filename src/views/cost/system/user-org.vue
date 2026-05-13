<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import {
  deleteOrg,
  deleteUser,
  deleteUserCategoryRelation,
  exportUserPermissions,
  exportUsers,
  fetchOrgTree,
  fetchUserPage,
  fetchUserStats,
  resetUserPassword,
  switchUserStatus,
  unlockUser
} from "@/api/cost/system";
import {
  mockOrgTree,
  mockRemoveUser,
  mockUpsertUser,
  mockUserPage,
  mockUserStats
} from "./mock";
import { buildExportFilename, downloadBlob, runMutation } from "./utils";
import {
  collectTreeIds,
  systemAuth,
  type TreeNode,
  type UserQuery,
  type UserRow,
  type UserStats
} from "./types";
import SystemTreePanel from "./components/SystemTreePanel.vue";
import UserFormDialog from "./components/UserFormDialog.vue";
import OrgFormDialog from "./components/OrgFormDialog.vue";
import UserRelationDialog from "./components/UserRelationDialog.vue";
import UserTransferDialog from "./components/UserTransferDialog.vue";
import RoleSelectDialog from "./components/RoleSelectDialog.vue";
import PermissionSelectDialog from "./components/PermissionSelectDialog.vue";
import UserLicenseDialog from "./components/UserLicenseDialog.vue";
import UserDataExchangeDialog from "./components/UserDataExchangeDialog.vue";
import UserIndexOrgDialog from "./components/UserIndexOrgDialog.vue";
import Search from "~icons/ri/search-line";
import Refresh from "~icons/ri/refresh-line";
import Add from "~icons/ri/add-circle-line";
import Export from "~icons/ri/file-excel-2-line";
import UserAdd from "~icons/ri/user-add-line";
import Exchange from "~icons/ri/exchange-box-line";
import Edit from "~icons/ri/edit-2-line";
import DeleteBin from "~icons/ri/delete-bin-6-line";
import Key from "~icons/ri/key-2-line";
import Unlock from "~icons/ri/lock-unlock-line";
import Toggle from "~icons/ri/toggle-line";
import ShieldUser from "~icons/ri/shield-user-line";
import FileShield from "~icons/ri/file-shield-2-line";
import OrganizationChart from "~icons/ri/organization-chart";
import DownloadCloud from "~icons/ri/download-cloud-2-line";
import UserSettings from "~icons/ri/user-settings-line";
import More from "~icons/ri/more-2-fill";

defineOptions({
  name: "CostSystemUserOrg"
});

const loading = ref(false);
const treeLoading = ref(false);
const orgTree = ref<TreeNode[]>([]);
const rows = ref<UserRow[]>([]);
const total = ref(0);
const selectedOrg = ref<TreeNode | null>(null);
const selectedUserRows = ref<UserRow[]>([]);
const currentUser = ref<UserRow | null>(null);
const currentOrg = ref<TreeNode | null>(null);
const orgParent = ref<TreeNode | null>(null);
const userFormMode = ref<"create" | "edit" | "view">("create");
const orgFormMode = ref<"create" | "edit">("create");
const userFormVisible = ref(false);
const orgFormVisible = ref(false);
const relationVisible = ref(false);
const transferVisible = ref(false);
const roleVisible = ref(false);
const permissionVisible = ref(false);
const licenseVisible = ref(false);
const dataExchangeVisible = ref(false);
const indexOrgVisible = ref(false);

const stats = reactive<UserStats>({
  normalCount: 0,
  disabledCount: 0,
  retiredCount: 0
});

const query = reactive<UserQuery>({
  pageNo: 1,
  pageSize: 15,
  uid: "",
  name: "",
  userNo: "",
  timeOver: "",
  status: ""
});

const canEdit = computed(() => hasAuth(systemAuth.userOrgEdit));
const canDownloadLicense = computed(() => hasAuth(systemAuth.userDataDownload));
const canUnlock = computed(() => hasAuth(systemAuth.userUnlock));
const canDataExchange = computed(() => hasAuth(systemAuth.userOrgDataExchange));

const selectedCategoryId = computed(
  () => selectedOrg.value?.id ?? orgTree.value[0]?.id ?? ""
);
const selectedCategoryName = computed(
  () => treeLabel(selectedOrg.value) || treeLabel(orgTree.value[0])
);

function treeLabel(node?: TreeNode | null) {
  if (!node) return "";
  return node.name || node.label || node.text || node.code || node.id;
}

function selectedOrgIds() {
  return collectTreeIds(selectedOrg.value);
}

function userStatusText(row: UserRow) {
  if (row.status === "0") return "禁用";
  if (row.staffState === "2") return "启用-人员退休";
  if (row.staffState === "1") return "启用-正常使用";
  return "启用";
}

function userStatusClass(row: UserRow) {
  return row.status === "0" || row.staffState === "2"
    ? "cq-status-error"
    : "cq-status-success";
}

async function loadTree() {
  treeLoading.value = true;
  try {
    const tree = await fetchOrgTree();
    orgTree.value = tree.length > 0 ? tree : mockOrgTree();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchOrgTree", error);
    }
    orgTree.value = mockOrgTree();
  } finally {
    treeLoading.value = false;
  }
}

async function loadStats() {
  try {
    const data = await fetchUserStats({ ids: selectedOrgIds() });
    Object.assign(stats, data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchUserStats", error);
    }
    Object.assign(stats, mockUserStats({ ...query, ids: selectedOrgIds() }));
  }
}

async function loadData() {
  loading.value = true;
  try {
    const page = await fetchUserPage({
      ...query,
      ids: selectedOrgIds()
    });
    const fallbackPage = mockUserPage({ ...query, ids: selectedOrgIds() });
    rows.value = page.list.length > 0 ? page.list : fallbackPage.list;
    total.value = page.list.length > 0 ? page.total : fallbackPage.total;
    await loadStats();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchUserPage", error);
    }
    const fallbackPage = mockUserPage({ ...query, ids: selectedOrgIds() });
    rows.value = fallbackPage.list;
    total.value = fallbackPage.total;
    Object.assign(stats, mockUserStats({ ...query, ids: selectedOrgIds() }));
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
    uid: "",
    name: "",
    userNo: "",
    timeOver: "",
    status: ""
  });
  loadData();
}

function onTreeSelect(node: TreeNode) {
  selectedOrg.value = node;
  query.pageNo = 1;
  selectedUserRows.value = [];
  loadData();
}

function onUserSelectionChange(selection: UserRow[]) {
  selectedUserRows.value = selection;
}

function openUserForm(mode: "create" | "edit" | "view", row?: UserRow) {
  userFormMode.value = mode;
  currentUser.value = row ?? null;
  userFormVisible.value = true;
}

function openOrgCreate(parent?: TreeNode) {
  orgFormMode.value = "create";
  orgParent.value = parent ?? selectedOrg.value;
  currentOrg.value = null;
  orgFormVisible.value = true;
}

function openOrgEdit(node: TreeNode) {
  orgFormMode.value = "edit";
  orgParent.value = null;
  currentOrg.value = node;
  orgFormVisible.value = true;
}

async function confirmAction(content: string) {
  await ElMessageBox.confirm(content, "提示", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  });
}

async function removeOrg(node: TreeNode) {
  await confirmAction("确认要删除该机构吗?");
  const success = await runMutation(() => deleteOrg(node.id), {
    successMessage: "删除成功",
    errorMessage: "删除机构失败",
    mockFallback: () => undefined
  });
  if (!success) return;
  if (selectedOrg.value?.id === node.id) selectedOrg.value = null;
  await loadTree();
  await loadData();
}

async function removeUser(row: UserRow) {
  const isRelation = row.isRela === "1";
  await confirmAction(
    isRelation ? "确认要删除该引用关系吗?" : "确认要删除该记录吗?"
  );
  const success = await runMutation(
    () =>
      isRelation
        ? deleteUserCategoryRelation({
            userId: row.id,
            categoryId: selectedCategoryId.value
          })
        : deleteUser(row.id),
    {
      successMessage: "删除成功",
      errorMessage: "删除用户失败",
      mockFallback: () => {
        if (!isRelation) mockRemoveUser(row.id);
      }
    }
  );
  if (success) loadData();
}

async function resetPassword(row: UserRow) {
  await confirmAction("确认要重置该用户密码吗?");
  const success = await runMutation(() => resetUserPassword(row.id), {
    successMessage: "密码已重置，默认密码为 Cq123@cost#*",
    errorMessage: "重置密码失败",
    mockFallback: () => undefined
  });
  if (success) loadData();
}

async function switchStatus(row: UserRow) {
  const nextStatus = row.status === "1" ? "0" : "1";
  await confirmAction(`确认要${nextStatus === "1" ? "启用" : "禁用"}该账号吗?`);
  const success = await runMutation(
    () => switchUserStatus(row.id, nextStatus),
    {
      successMessage: nextStatus === "1" ? "启用成功" : "禁用成功",
      errorMessage: "切换状态失败",
      mockFallback: () => mockUpsertUser({ ...row, status: nextStatus })
    }
  );
  if (success) loadData();
}

async function unlock(row: UserRow) {
  await confirmAction("确认要解锁该账号吗?");
  const success = await runMutation(() => unlockUser(row.id), {
    successMessage: "解锁成功",
    errorMessage: "解锁失败",
    mockFallback: () => undefined
  });
  if (success) loadData();
}

function openRoleDialog(row: UserRow) {
  currentUser.value = row;
  roleVisible.value = true;
}

function openPermissionDialog(row: UserRow) {
  currentUser.value = row;
  permissionVisible.value = true;
}

function openLicenseDialog(row: UserRow) {
  currentUser.value = row;
  licenseVisible.value = true;
}

async function openDataExchangeDialog(row: UserRow) {
  await confirmAction("确认要进行数据交接吗?");
  currentUser.value = row;
  dataExchangeVisible.value = true;
}

function openIndexOrgDialog(row: UserRow) {
  currentUser.value = row;
  indexOrgVisible.value = true;
}

function openRelationDialog() {
  if (!selectedCategoryId.value) {
    message("请选择机构", { type: "warning" });
    return;
  }
  relationVisible.value = true;
}

function openTransferDialog() {
  if (selectedUserRows.value.length === 0) {
    message("请选择要调动的人员", { type: "warning" });
    return;
  }
  if (!selectedOrg.value) {
    message("请选择来源机构", { type: "warning" });
    return;
  }
  transferVisible.value = true;
}

async function exportCurrentUsers() {
  try {
    const blob = await exportUsers({ ...query, ids: selectedOrgIds() });
    downloadBlob(blob, buildExportFilename("用户机构管理"));
    message("导出成功", { type: "success" });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] exportUsers", error);
      const blob = new Blob([JSON.stringify(rows.value, null, 2)], {
        type: "application/json;charset=utf-8"
      });
      downloadBlob(blob, buildExportFilename("用户机构管理", "json"));
      message("导出成功（mock）", { type: "success" });
    } else {
      message("导出失败", { type: "error" });
    }
  }
}

async function exportPermission(row: UserRow) {
  try {
    const blob = await exportUserPermissions(row.id);
    downloadBlob(blob, buildExportFilename(`${row.name}-用户权限`));
    message("导出成功", { type: "success" });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] exportUserPermissions", error);
      const blob = new Blob([`${row.name} permissions`], {
        type: "text/plain;charset=utf-8"
      });
      downloadBlob(blob, buildExportFilename(`${row.name}-用户权限`, "txt"));
      message("导出成功（mock）", { type: "success" });
    } else {
      message("导出失败", { type: "error" });
    }
  }
}

function onMoreCommand(command: unknown, row: UserRow) {
  if (command === "exportPermission") exportPermission(row);
  if (command === "resetPassword") resetPassword(row);
  if (command === "indexOrg") openIndexOrgDialog(row);
  if (command === "license") openLicenseDialog(row);
  if (command === "unlock") unlock(row);
  if (command === "dataExchange") openDataExchangeDialog(row);
  if (command === "switchStatus") switchStatus(row);
}

async function onSaved() {
  await loadData();
}

async function onOrgSaved() {
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
        <p>用户机构管理</p>
      </div>
    </div>

    <div class="cq-system-layout">
      <SystemTreePanel
        title="组织机构"
        :nodes="orgTree"
        :loading="treeLoading"
        :editable="canEdit"
        @select="onTreeSelect"
        @refresh="loadTree"
        @create="openOrgCreate"
        @edit="openOrgEdit"
        @remove="removeOrg"
      />

      <main class="cq-system-main">
        <el-form :model="query" inline class="cq-search-form">
          <el-form-item label="账号">
            <el-input
              v-model="query.uid"
              clearable
              placeholder="请输入账号"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input
              v-model="query.name"
              clearable
              placeholder="请输入姓名"
              style="width: 140px"
            />
          </el-form-item>
          <el-form-item label="员工编号">
            <el-input
              v-model="query.userNo"
              clearable
              placeholder="请输入员工编号"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="未登录超过">
            <el-select
              v-model="query.timeOver"
              clearable
              placeholder="全部"
              style="width: 120px"
            >
              <el-option label="30天" value="30" />
              <el-option label="60天" value="60" />
              <el-option label="90天" value="90" />
              <el-option label="180天" value="180" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="query.status"
              clearable
              placeholder="全部"
              style="width: 110px"
            >
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
              <el-option label="退休" value="2" />
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

        <div class="cq-user-toolbar">
          <div class="cq-user-toolbar__stats">
            <span>正常账号：{{ stats.normalCount }} 个</span>
            <span>禁用账号：{{ stats.disabledCount }} 个</span>
            <span>退休账号：{{ stats.retiredCount }} 个</span>
          </div>

          <div class="cq-user-toolbar__actions">
            <el-button v-if="canEdit" @click="exportCurrentUsers">
              <IconifyIconOffline :icon="Export" />
              导出
            </el-button>
            <el-button
              v-if="canEdit"
              type="primary"
              @click="openUserForm('create')"
            >
              <IconifyIconOffline :icon="Add" />
              新增
            </el-button>
            <el-button v-if="canEdit" @click="openRelationDialog">
              <IconifyIconOffline :icon="UserAdd" />
              引用
            </el-button>
            <el-button
              v-if="canEdit"
              :disabled="selectedUserRows.length === 0"
              @click="openTransferDialog"
            >
              <IconifyIconOffline :icon="Exchange" />
              人员调动
            </el-button>
          </div>
        </div>

        <div class="cq-table-wrap" style=" flex: 1;height: auto; min-height: 0">
          <el-table
            v-loading="loading"
            class="cq-table"
            :data="rows"
            size="small"
            height="calc(100% - 42px)"
            border
            @selection-change="onUserSelectionChange"
          >
            <el-table-column type="selection" width="46" align="center" />
            <el-table-column
              prop="companyName"
              label="机构"
              min-width="160"
              show-overflow-tooltip
            />
            <el-table-column prop="uid" label="账号" width="110" />
            <el-table-column prop="name" label="姓名" width="90" />
            <el-table-column prop="userNo" label="员工编号" width="110" />
            <el-table-column label="邮箱" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.email || "-" }}
              </template>
            </el-table-column>
            <el-table-column label="手机" width="120" align="center">
              <template #default="{ row }">
                {{ row.mobile || "-" }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120" align="center">
              <template #default="{ row }">
                <span :class="userStatusClass(row)">
                  {{ userStatusText(row) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="210"
              fixed="right"
              align="center"
            >
              <template #default="{ row }">
                <span class="cq-row-actions">
                  <el-button
                    v-if="canEdit"
                    title="编辑"
                    circle
                    :disabled="row.isRela === '1'"
                    @click="openUserForm('edit', row)"
                  >
                    <IconifyIconOffline :icon="Edit" />
                  </el-button>
                  <el-button
                    v-if="canEdit"
                    title="删除"
                    circle
                    @click="removeUser(row)"
                  >
                    <IconifyIconOffline :icon="DeleteBin" />
                  </el-button>
                  <el-button
                    v-if="canEdit"
                    title="设置角色"
                    circle
                    @click="openRoleDialog(row)"
                  >
                    <IconifyIconOffline :icon="UserSettings" />
                  </el-button>
                  <el-button
                    v-if="canEdit"
                    title="设置权限"
                    circle
                    @click="openPermissionDialog(row)"
                  >
                    <IconifyIconOffline :icon="ShieldUser" />
                  </el-button>
                  <el-dropdown
                    trigger="click"
                    popper-class="cq-user-more-dropdown"
                    @command="command => onMoreCommand(command, row)"
                  >
                    <el-button title="更多" circle>
                      <IconifyIconOffline :icon="More" />
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-if="canEdit"
                          command="exportPermission"
                        >
                          <IconifyIconOffline :icon="FileShield" />
                          导出用户权限
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="canEdit"
                          command="resetPassword"
                        >
                          <IconifyIconOffline :icon="Key" />
                          重置密码
                        </el-dropdown-item>
                        <el-dropdown-item v-if="canEdit" command="indexOrg">
                          <IconifyIconOffline :icon="OrganizationChart" />
                          授权建设单位指标
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="canDownloadLicense"
                          command="license"
                        >
                          <IconifyIconOffline :icon="DownloadCloud" />
                          许可证下载
                        </el-dropdown-item>
                        <el-dropdown-item v-if="canUnlock" command="unlock">
                          <IconifyIconOffline :icon="Unlock" />
                          解锁用户
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="canDataExchange"
                          command="dataExchange"
                        >
                          <IconifyIconOffline :icon="Exchange" />
                          数据交接
                        </el-dropdown-item>
                        <el-dropdown-item v-if="canEdit" command="switchStatus">
                          <IconifyIconOffline :icon="Toggle" />
                          {{ row.status === "1" ? "禁用" : "启用" }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
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

    <UserFormDialog
      v-model="userFormVisible"
      :mode="userFormMode"
      :row="currentUser"
      :category-id="selectedCategoryId"
      :category-name="selectedCategoryName"
      @saved="onSaved"
    />
    <OrgFormDialog
      v-model="orgFormVisible"
      :mode="orgFormMode"
      :row="currentOrg"
      :parent="orgParent"
      @saved="onOrgSaved"
    />
    <UserRelationDialog
      v-model="relationVisible"
      :category-id="selectedCategoryId"
      @saved="onSaved"
    />
    <UserTransferDialog
      v-model="transferVisible"
      :source-org="selectedOrg"
      :users="selectedUserRows"
      @saved="onSaved"
    />
    <RoleSelectDialog
      v-model="roleVisible"
      :row="currentUser"
      @saved="onSaved"
    />
    <PermissionSelectDialog
      v-model="permissionVisible"
      mode="user"
      :user="currentUser"
      @saved="onSaved"
    />
    <UserLicenseDialog v-model="licenseVisible" :row="currentUser" />
    <UserDataExchangeDialog
      v-model="dataExchangeVisible"
      :row="currentUser"
      @saved="onSaved"
    />
    <UserIndexOrgDialog
      v-model="indexOrgVisible"
      :row="currentUser"
      @saved="onSaved"
    />
  </section>
</template>

<style scoped lang="scss">
.cq-user-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 32px;
  margin: 0 0 8px;
}

.cq-user-toolbar__stats {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  min-width: 0;
  font-size: 13px;
  color: var(--cq-red);
}

.cq-user-toolbar__actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.cq-user-toolbar__actions :deep(.el-button svg) {
  margin-right: 4px;
}

:deep(.cq-row-actions) {
  gap: 8px;
  justify-content: center;
  width: 100%;
  padding: 0 8px;
}

:deep(.cq-row-actions .el-button) {
  flex: 0 0 auto;
  margin-left: 0;
}

:deep(.cq-row-actions .el-dropdown) {
  display: inline-flex;
  flex: 0 0 auto;
}

:global(.cq-user-more-dropdown .el-dropdown-menu__item) {
  gap: 6px;
}

:global(.cq-user-more-dropdown .el-dropdown-menu__item svg) {
  flex: 0 0 auto;
}
</style>
