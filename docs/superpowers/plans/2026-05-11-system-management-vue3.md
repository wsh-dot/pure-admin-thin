# System Management Vue3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `pure-admin-thin` 中用 Vue3 + TypeScript + Element Plus 实现旧长庆造价系统“系统管理”模块的 6 个页面：用户机构管理、资源管理、权限管理、角色管理、菜单管理、日志管理。

**Architecture:** 保留旧系统的高密度后台管理体验：顶部模块导航选中“系统管理”，左侧为系统管理二级菜单或树，右侧为查询条件、工具栏、表格、分页和弹窗。前端新增一层 `src/api/cost/system.ts` 作为系统管理 API 适配层；Vue 页面只调用稳定方法名，不直接依赖旧 Spring MVC 的 `.json` URL，也不直接依赖未来 Spring Boot 微服务的网关路径。

**Tech Stack:** Vue 3, TypeScript, Vite, Element Plus, pure-admin-thin layout, `@/utils/http`, `qs`, `@iconify/vue`, existing Changqing styles in `src/style/changqing.scss`.

---

## Source Context

旧系统菜单来自 `E:/cost-cqcost/pdm/初始数据脚本/initdata.sql`：

- 用户机构管理：`/cost/admin/account/index.html`
- 资源管理：`/cost/admin/resource/index.html`
- 权限管理：`/cost/admin/permission/index.html`
- 角色管理：`/cost/admin/group/index.html`
- 菜单管理：`/cost/admin/menu/index.html`
- 日志管理：`/cost/admin/operationLog/index.html`

旧系统关键前端与后端文件：

- 用户机构：`E:/cost-cqcost/src/main/webapp/WEB-INF/jsp/admin/account/index.jsp`
- 用户机构 JS：`E:/cost-cqcost/src/main/webapp/js/admin/account/category/index.js`
- 用户 Controller：`E:/cost-cqcost/src/main/java/com/toone/cost/online/base/web/admin/AccountController.java`
- 机构 Controller：`E:/cost-cqcost/src/main/java/com/toone/cost/online/base/web/admin/AccountCategoryController.java`
- 用户机构关系：`E:/cost-cqcost/src/main/java/com/toone/cost/online/base/web/admin/UserCategoryRelaController.java`
- 资源：`E:/cost-cqcost/src/main/webapp/js/admin/resource/index.js`
- 权限：`E:/cost-cqcost/src/main/webapp/js/admin/permission/permissionIndex.js`
- 角色：`E:/cost-cqcost/src/main/webapp/js/admin/group/index.js`
- 菜单：`E:/cost-cqcost/src/main/webapp/js/admin/menu/index.js`
- 日志：`E:/cost-cqcost/src/main/webapp/js/admin/operationLog/index.js`

当前 Vue 工程可复用文件：

- 顶部菜单：`E:/pure-admin-thin/src/layout/cost-menu.ts`
- 路由：`E:/pure-admin-thin/src/router/modules/cost.ts`
- 长庆主题样式：`E:/pure-admin-thin/src/style/changqing.scss`
- 页面写法参考：`E:/pure-admin-thin/src/views/cost/foundation/party-work.vue`
- API 写法参考：`E:/pure-admin-thin/src/api/cost/foundation.ts`

---

## Target File Structure

Create:

- `E:/pure-admin-thin/src/api/cost/system.ts`：系统管理接口适配层。对 Vue 页面暴露稳定方法名；内部可按项目阶段对接旧 Spring MVC 接口或新 Spring Boot 微服务接口。
- `E:/pure-admin-thin/src/views/cost/system/types.ts`：系统管理页面共享类型、枚举、分页查询类型。
- `E:/pure-admin-thin/src/views/cost/system/mock.ts`：当前前后端未联调阶段使用的系统管理 mock 数据。只给 Vue 页面兜底使用，不在 `system.ts` 内部自动返回 mock。
- `E:/pure-admin-thin/src/views/cost/system/components/SystemTreePanel.vue`：左侧树面板，支持刷新、新增、编辑、删除、选中节点。
- `E:/pure-admin-thin/src/views/cost/system/components/UserFormDialog.vue`：用户新增、编辑、查看弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/OrgFormDialog.vue`：机构新增、编辑弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/UserRelationDialog.vue`：引用用户弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/UserTransferDialog.vue`：人员调动弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/UserLicenseDialog.vue`：许可证下载弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/UserDataExchangeDialog.vue`：数据交接弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/UserIndexOrgDialog.vue`：授权建设单位指标弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/SystemCategoryDialog.vue`：资源、权限、角色、菜单树分类新增和编辑弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/ResourceFormDialog.vue`：资源新增、编辑弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/PermissionFormDialog.vue`：权限新增、编辑弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/PermissionSelectDialog.vue`：用户或角色分配权限弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/PermissionUserDialog.vue`：权限用户勾选或查看弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/ResourceBindDialog.vue`：权限绑定资源弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/RoleFormDialog.vue`：角色新增、编辑弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/RoleSelectDialog.vue`：用户分配角色弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/MenuFormDialog.vue`：菜单新增、编辑弹窗。
- `E:/pure-admin-thin/src/views/cost/system/components/LogDeleteDialog.vue`：按月份删除旧日志弹窗。
- `E:/pure-admin-thin/src/views/cost/system/user-org.vue`
- `E:/pure-admin-thin/src/views/cost/system/resource.vue`
- `E:/pure-admin-thin/src/views/cost/system/permission.vue`
- `E:/pure-admin-thin/src/views/cost/system/role.vue`
- `E:/pure-admin-thin/src/views/cost/system/menu.vue`
- `E:/pure-admin-thin/src/views/cost/system/log.vue`

Modify:

- `E:/pure-admin-thin/src/layout/cost-menu.ts`：为 `system` 顶部菜单添加 6 个子菜单。
- `E:/pure-admin-thin/src/router/modules/cost.ts`：添加 6 个系统管理路由。
- `E:/pure-admin-thin/src/style/changqing.scss`：只在现有样式不能覆盖树表布局时追加 `.cq-system-layout`、`.cq-system-tree`、`.cq-system-main`。

Do not modify:

- `E:/cost-cqcost` 旧 Java/JSP 工程。
- `E:/pure-admin-thin/src/views/cost/foundation/*`，除非需要复制样式模式作为参考。

---

## API Contract

The frontend should treat `fetchUserPage`, `fetchResourcePage`, `fetchPermissionPage`, and the other exported functions in `src/api/cost/system.ts` as the stable contract. The URL table from the old system is source mapping only. If the backend is rebuilt with Spring Boot microservices, use the target REST-style contract below and keep the legacy `.json` URLs only as a reference for behavior, fields, and permissions.

### Backend refactor decision

- Current phase: frontend is not connected to backend yet. Implement `system.ts` with the target Spring Boot microservice API URLs now. Vue pages call those interfaces first; if the request fails or returns no records, the Vue page falls back to `mock.ts`.
- If Vue3 is delivered before backend refactor: implement `system.ts` with the legacy mapping table so the new UI can run against the existing backend.
- If Vue3 and Spring Boot microservices are delivered together: implement `system.ts` with the target microservice API table. Do not use `.json` suffixes, `page/rows`, or form-urlencoded mutations unless the new backend explicitly requires them.
- If both modes must coexist during migration: keep Vue pages unchanged and switch only `system.ts` by environment variable or API base URL. Do not scatter legacy URLs inside `.vue` files.

### Target Spring Boot microservice request rules

- Use JSON request and response bodies for create, update, authorize, transfer, and status operations.
- Use `GET` query parameters for list, tree, stats, and export operations.
- Use `pageNo` and `pageSize` in the frontend-facing DTO. If the gateway/backend uses different names, map them inside `system.ts`.
- Use a common response envelope:

```ts
interface ApiResult<T> {
  code: string | number;
  message: string;
  data: T;
}

interface PageResult<T> {
  records: T[];
  total: number;
  pageNo: number;
  pageSize: number;
}
```

- Use a consistent tree DTO across organization, resource category, permission category, role category, and menu tree:

```ts
interface SystemTreeNode {
  id: string;
  parentId?: string;
  label: string;
  code?: string;
  type?: string;
  children?: SystemTreeNode[];
}
```

- Keep permission identifiers compatible with old seed data until the auth service has a formal migration map. In particular, keep `system_menu_edit_permisson` if old data is reused.

### Target Spring Boot microservice API table

The exact gateway prefix can be adjusted by backend convention. This plan uses `/api/system` as the recommended bounded-context prefix.

| Module     | Frontend method              | Recommended API URL                         | Method |
| ---------- | ---------------------------- | ------------------------------------------- | ------ |
| User       | `fetchUserPage`              | `/api/system/users/page`                    | GET    |
| User       | `fetchUserStats`             | `/api/system/users/stats`                   | GET    |
| User       | `createUser`                 | `/api/system/users`                         | POST   |
| User       | `updateUser`                 | `/api/system/users/{id}`                    | PUT    |
| User       | `deleteUser`                 | `/api/system/users/{id}`                    | DELETE |
| User       | `resetUserPassword`          | `/api/system/users/{id}/password/reset`     | POST   |
| User       | `switchUserStatus`           | `/api/system/users/{id}/status`             | PATCH  |
| User       | `unlockUser`                 | `/api/system/users/{id}/unlock`             | POST   |
| User       | `exportUsers`                | `/api/system/users/export`                  | GET    |
| User       | `exportUserPermissions`      | `/api/system/users/{id}/permissions/export` | GET    |
| User       | `downloadUserLicense`        | `/api/system/users/{id}/license`            | GET    |
| User       | `saveUserCategoryRelation`   | `/api/system/users/category-relations`      | POST   |
| User       | `deleteUserCategoryRelation` | `/api/system/users/category-relations`      | DELETE |
| User       | `transferUserCategory`       | `/api/system/users/transfers`               | POST   |
| User       | `saveUserDataExchange`       | `/api/system/users/{id}/data-exchange`      | POST   |
| User       | `fetchUserRoles`             | `/api/system/users/{id}/roles`              | GET    |
| User       | `fetchUserPermissions`       | `/api/system/users/{id}/permissions`        | GET    |
| User       | `fetchUserIndexOrgs`         | `/api/system/users/{id}/index-orgs`         | GET    |
| User       | `saveUserIndexOrgs`          | `/api/system/users/{id}/index-orgs`         | PUT    |
| Org        | `fetchOrgTree`               | `/api/system/orgs/tree`                     | GET    |
| Org        | `createOrg`                  | `/api/system/orgs`                          | POST   |
| Org        | `updateOrg`                  | `/api/system/orgs/{id}`                     | PUT    |
| Org        | `deleteOrg`                  | `/api/system/orgs/{id}`                     | DELETE |
| Resource   | `fetchResourceTree`          | `/api/system/resource-categories/tree`      | GET    |
| Resource   | `createResourceCategory`     | `/api/system/resource-categories`           | POST   |
| Resource   | `updateResourceCategory`     | `/api/system/resource-categories/{id}`      | PUT    |
| Resource   | `deleteResourceCategory`     | `/api/system/resource-categories/{id}`      | DELETE |
| Resource   | `fetchResourcePage`          | `/api/system/resources/page`                | GET    |
| Resource   | `createResource`             | `/api/system/resources`                     | POST   |
| Resource   | `updateResource`             | `/api/system/resources/{id}`                | PUT    |
| Resource   | `deleteResource`             | `/api/system/resources/{id}`                | DELETE |
| Permission | `fetchPermissionTree`        | `/api/system/permission-categories/tree`    | GET    |
| Permission | `createPermissionCategory`   | `/api/system/permission-categories`         | POST   |
| Permission | `updatePermissionCategory`   | `/api/system/permission-categories/{id}`    | PUT    |
| Permission | `deletePermissionCategory`   | `/api/system/permission-categories/{id}`    | DELETE |
| Permission | `fetchPermissionPage`        | `/api/system/permissions/page`              | GET    |
| Permission | `createPermission`           | `/api/system/permissions`                   | POST   |
| Permission | `updatePermission`           | `/api/system/permissions/{id}`              | PUT    |
| Permission | `deletePermission`           | `/api/system/permissions/{id}`              | DELETE |
| Permission | `fetchPermissionResources`   | `/api/system/permissions/{id}/resources`    | GET    |
| Permission | `bindPermissionResources`    | `/api/system/permissions/{id}/resources`    | PUT    |
| Permission | `authorizeUserPermissions`   | `/api/system/users/{id}/permissions`        | PUT    |
| Permission | `fetchPermissionUsers`       | `/api/system/permissions/{id}/users`        | GET    |
| Permission | `savePermissionUsers`        | `/api/system/permissions/{id}/users`        | PUT    |
| Role       | `fetchRoleTree`              | `/api/system/role-categories/tree`          | GET    |
| Role       | `createRoleCategory`         | `/api/system/role-categories`               | POST   |
| Role       | `updateRoleCategory`         | `/api/system/role-categories/{id}`          | PUT    |
| Role       | `deleteRoleCategory`         | `/api/system/role-categories/{id}`          | DELETE |
| Role       | `fetchRolePage`              | `/api/system/roles/page`                    | GET    |
| Role       | `createRole`                 | `/api/system/roles`                         | POST   |
| Role       | `updateRole`                 | `/api/system/roles/{id}`                    | PUT    |
| Role       | `deleteRole`                 | `/api/system/roles/{id}`                    | DELETE |
| Role       | `fetchRolePermissions`       | `/api/system/roles/{id}/permissions`        | GET    |
| Role       | `authorizeRolePermissions`   | `/api/system/roles/{id}/permissions`        | PUT    |
| Role       | `saveUserGroups`             | `/api/system/users/{id}/roles`              | PUT    |
| Menu       | `fetchMenuTree`              | `/api/system/menus/tree`                    | GET    |
| Menu       | `fetchMenuPage`              | `/api/system/menus/page`                    | GET    |
| Menu       | `createMenu`                 | `/api/system/menus`                         | POST   |
| Menu       | `updateMenu`                 | `/api/system/menus/{id}`                    | PUT    |
| Menu       | `deleteMenu`                 | `/api/system/menus/{id}`                    | DELETE |
| Menu       | `sortMenu`                   | `/api/system/menus/sort`                    | PATCH  |
| Menu       | `changeMenuLevel`            | `/api/system/menus/{id}/level`              | PATCH  |
| Menu       | `fetchMenuResources`         | `/api/system/menus/{id}/resources`          | GET    |
| Menu       | `bindMenuResources`          | `/api/system/menus/{id}/resources`          | PUT    |
| Log        | `fetchOperationLogPage`      | `/api/system/operation-logs/page`           | GET    |
| Log        | `exportOperationLogs`        | `/api/system/operation-logs/export`         | GET    |
| Log        | `deleteOperationLogs`        | `/api/system/operation-logs`                | DELETE |

### Frontend mock fallback rules

During the current frontend-only phase:

- `src/api/cost/system.ts` still calls the target interface URLs. It should not silently return mock data by itself.
- Each Vue page imports the API method and the matching mock method.
- Each Vue page uses mock data only when the API request throws, or when the API succeeds but returns an empty list/tree.
- Keep the fallback branch small and obvious so it can be removed after backend integration.
- Add `console.warn("[system mock fallback]", error)` only in development mode if the API throws. Do not show a warning message to end users.

Use this page-level pattern:

```ts
async function loadData() {
  loading.value = true;
  try {
    const page = await fetchUserPage({ ...query, ids: selectedOrgIds() });
    const fallbackPage = mockUserPage({ ...query, ids: selectedOrgIds() });
    rows.value = page.list.length > 0 ? page.list : fallbackPage.list;
    total.value = page.list.length > 0 ? page.total : fallbackPage.total;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchUserPage", error);
    }
    const fallbackPage = mockUserPage({ ...query, ids: selectedOrgIds() });
    rows.value = fallbackPage.list;
    total.value = fallbackPage.total;
  } finally {
    loading.value = false;
  }
}
```

Use this tree fallback pattern:

```ts
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
```

After Spring Boot APIs are ready, remove:

- `E:/pure-admin-thin/src/views/cost/system/mock.ts`
- All `mock*` imports from system Vue files.
- The page-level fallback branches.

### Legacy Spring MVC request rules

Use these only when the new Vue3 UI needs to run against the existing Java/JSP backend.

- Table pagination sends `page` and `rows`.
- Tree selection sends `ids` or `categoryId` based on the old page.
- Mutating requests send `application/x-www-form-urlencoded`.
- Export requests use `responseType: "blob"`.
- Normalize old page responses with this order:

```ts
export function normalizeLegacyPage<T>(res: unknown): SystemPage<T> {
  const data = (res ?? {}) as Record<string, any>;
  const nested = data.jqGridResultForm ?? data.page ?? data.data ?? {};
  const list =
    data.rows ??
    data.result ??
    data.list ??
    nested.rows ??
    nested.result ??
    nested.list ??
    [];
  const total =
    data.total ??
    data.totalCount ??
    data.records ??
    nested.total ??
    nested.totalCount ??
    nested.records ??
    list.length;

  return {
    list: Array.isArray(list) ? list : [],
    total: Number(total) || 0
  };
}
```

### Legacy API URL mapping table

| Module     | Method name                | API URL                                                  |
| ---------- | -------------------------- | -------------------------------------------------------- |
| User       | `fetchUserPage`            | `/admin/account/listPage.json`                           |
| User       | `fetchUserStats`           | `/admin/account/toAccountStatusStat.json`                |
| User       | `deleteUser`               | `/admin/account/delete.json`                             |
| User       | `resetUserPassword`        | `/admin/account/resetPassword.json`                      |
| User       | `switchUserStatus`         | `/admin/account/statusSwitch.json`                       |
| User       | `exportUsers`              | `/admin/account/export.json`                             |
| User       | `saveUserCategoryRelation` | `/admin/account/userCategoryRela/saveRelaUser.json`      |
| User       | `transferUserCategory`     | `/admin/account/userCategoryRela/saveTransfersUser.json` |
| Org        | `fetchOrgTree`             | `/admin/account/category/getListByRoot.json`             |
| Org        | `fetchOrgSubTree`          | `/admin/account/category/getSubTreeListByRoot.json`      |
| Org        | `saveOrg`                  | `/admin/account/category/saveCategory.json`              |
| Resource   | `fetchResourceTree`        | `/admin/resource/category/getListByRoot.json`            |
| Resource   | `fetchResourcePage`        | `/admin/resource/listPage.json`                          |
| Resource   | `deleteResource`           | `/admin/resource/delete.json`                            |
| Permission | `fetchPermissionTree`      | `/admin/permission/category/getListByRoot.json`          |
| Permission | `fetchPermissionPage`      | `/admin/permission/listPage.json`                        |
| Permission | `bindPermissionResources`  | `/admin/permission/resource/authorize.json`              |
| Permission | `authorizeUserPermissions` | `/admin/userPermission/authorize.json`                   |
| Role       | `fetchRoleTree`            | `/admin/group/category/getListByRoot.json`               |
| Role       | `fetchRolePage`            | `/admin/group/list.json`                                 |
| Role       | `authorizeRolePermissions` | `/admin/group/permission/authorize.json`                 |
| Role       | `saveUserGroups`           | `/admin/user/group/saveUserGroup.json`                   |
| Menu       | `fetchMenuTree`            | `/admin/menu/getListByRoot.json`                         |
| Menu       | `fetchMenuPage`            | `/admin/menu/list.json`                                  |
| Menu       | `saveMenu`                 | `/admin/menu/saveMenu.json`                              |
| Menu       | `deleteMenu`               | `/admin/menu/delete.json`                                |
| Menu       | `sortMenu`                 | `/admin/menu/sortMenu.json`                              |
| Menu       | `changeMenuLevel`          | `/admin/menu/changeLevel.json`                           |
| Log        | `fetchOperationLogPage`    | `/admin/operationLog/listPage.json`                      |
| Log        | `exportOperationLogs`      | `/admin/operationLog/export.json`                        |
| Log        | `deleteOperationLogs`      | `/admin/operationLog/deleteLog.json`                     |

---

## Left Tree Implementation

The screenshots show two different left-side areas:

- The far-left system module menu is the pure-admin-thin side menu generated from `src/layout/cost-menu.ts`. It contains 用户机构管理、资源管理、权限管理、角色管理、菜单管理、日志管理.
- The inner business tree appears only on 用户机构管理、资源管理、权限管理、角色管理、菜单管理. This tree is rendered by the shared `SystemTreePanel.vue`, but each page passes a different tree API, root title, and filter field.
- 日志管理 does not render the inner business tree. It uses the full content area after the far-left system module menu.

### Page-specific business tree mapping

| Page         | Inner tree title/root from screenshot | Tree content                                                                                                                                                        | Legacy tree API                                 | Target microservice tree API             | Table filter after tree click                                                                     |
| ------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 用户机构管理 | 长庆油田分公司                        | Organization tree: 工程造价部、审计中心、设计单位、建设单位、施工单位、数字和智能化事业部、油田公司项目组、规划计划处、监理单位、咨询公司                           | `/admin/account/category/getListByRoot.json`    | `/api/system/orgs/tree`                  | Send selected organization id plus descendant ids as `orgIds` or adapter-mapped `ids`             |
| 资源管理     | 资源管理                              | Resource category tree by system module: 我的桌面、造价编制、造价审核、造价管理、价格管理、资格管理、基础工作、档案管理、考评管理、定额动态、业务交流、系统管理     | `/admin/resource/category/getListByRoot.json`   | `/api/system/resource-categories/tree`   | Send selected resource category id plus descendant ids as `categoryIds` or adapter-mapped `ids`   |
| 权限管理     | 权限管理                              | Permission category tree by system module: 我的桌面、造价编制、造价管理、造价审核、价格管理、资格管理、基础工作、档案管理旧、系统管理、定额动态、考评管理、业务交流 | `/admin/permission/category/getListByRoot.json` | `/api/system/permission-categories/tree` | Send selected permission category id plus descendant ids as `categoryIds` or adapter-mapped `ids` |
| 角色管理     | 角色管理                              | Role category tree, usually only 基础角色                                                                                                                           | `/admin/group/category/getListByRoot.json`      | `/api/system/role-categories/tree`       | Send selected role category id plus descendant ids as `categoryIds` or adapter-mapped `ids`       |
| 菜单管理     | 菜单管理                              | Menu tree matching top/business navigation: 我的桌面、造价编制、造价审核、造价管理、价格管理、资质管理、基础工作、档案管理、考评管理、定额动态、业务交流、系统管理  | `/admin/menu/getListByRoot.json`                | `/api/system/menus/tree`                 | Send selected menu id plus descendant ids as `menuIds` or adapter-mapped `ids`                    |
| 日志管理     | None                                  | No inner business tree                                                                                                                                              | None                                            | None                                     | No tree filter; only query form fields filter the operation-log page API                          |

Use one shared tree component, not one hard-coded tree component per page. The page decides which tree to load:

```ts
const treeConfig = {
  userOrg: {
    title: "长庆油田分公司",
    loader: fetchOrgTree,
    filterKey: "ids"
  },
  resource: {
    title: "资源管理",
    loader: fetchResourceTree,
    filterKey: "ids"
  },
  permission: {
    title: "权限管理",
    loader: fetchPermissionTree,
    filterKey: "ids"
  },
  role: {
    title: "角色管理",
    loader: fetchRoleTree,
    filterKey: "ids"
  },
  menu: {
    title: "菜单管理",
    loader: fetchMenuTree,
    filterKey: "ids"
  }
} as const;
```

When a tree node is selected, collect that node and all descendants. This matches the old table behavior where selecting a category filters by the selected branch, not only the single node.

```ts
export function collectTreeIds(node?: TreeNode | null): string {
  if (!node) return "";

  const ids: string[] = [];
  const walk = (item: TreeNode) => {
    ids.push(item.id);
    for (const child of item.children ?? []) {
      walk(child);
    }
  };

  walk(node);
  return ids.join(",");
}
```

Use it in each tree-backed page:

```ts
function selectedTreeIds() {
  return collectTreeIds(selectedTreeNode.value);
}

async function loadData() {
  const page = await fetchResourcePage({
    ...query,
    ids: selectedTreeIds()
  });

  rows.value = page.list;
  total.value = page.total;
}
```

For 日志管理, skip `SystemTreePanel.vue` and render only:

```vue
<section class="cq-page">
  <div class="cq-page-header">
    <div>
      <h2>系统管理</h2>
      <p>日志管理</p>
    </div>
  </div>
  <!-- query form + table + pagination -->
</section>
```

---

## Frontend Page Implementation Blueprint

Every system page follows the same high-level structure:

```vue
<script setup lang="ts">
// imports: Vue state, Element Plus confirmation, hasAuth, system API, page mock, shared types, icons
// state: query, rows, total, loading, optional tree state, selected row/dialog state
// functions: loadTree, loadData, searchData, resetQuery, page change, action handlers
// lifecycle: onMounted(() => { loadTree if needed; loadData(); })
</script>

<template>
  <section class="cq-page">
    <div class="cq-page-header">...</div>
    <div class="cq-system-layout">...</div>
  </section>
</template>
```

Pages with an inner tree use:

```vue
<div class="cq-system-layout">
  <SystemTreePanel
    title="..."
    :nodes="treeRows"
    :loading="treeLoading"
    :editable="canEdit"
    @select="onTreeSelect"
    @refresh="loadTree"
    @create="openCreateCategory"
  />
  <main class="cq-system-main">
    <!-- query form, toolbar, table, pagination, dialogs -->
  </main>
</div>
```

日志管理 does not use `cq-system-layout`; it renders query form, table, and pagination directly inside `cq-page`.

### Page-by-page implementation map

| Vue file                               | Uses inner tree             | API calls first                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Mock fallback                                                                                                               | Query fields                                                  | Table columns                                                            | Main actions                                                                               |
| -------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `src/views/cost/system/user-org.vue`   | Yes, title `长庆油田分公司` | `fetchOrgTree`, `createOrg`, `updateOrg`, `deleteOrg`, `fetchUserPage`, `fetchUserStats`, `createUser`, `updateUser`, `deleteUser`, `deleteUserCategoryRelation`, `exportUsers`, `exportUserPermissions`, `resetUserPassword`, `switchUserStatus`, `unlockUser`, `downloadUserLicense`, `saveUserCategoryRelation`, `transferUserCategory`, `fetchUserRoles`, `saveUserGroups`, `fetchUserPermissions`, `authorizeUserPermissions`, `saveUserDataExchange`, `fetchUserIndexOrgs`, `saveUserIndexOrgs` | `mockOrgTree`, `mockUserPage`, `mockUserStats`                                                                              | `uid`, `name`, `userNo`, `timeOver`, `status`                 | `companyName`, `uid`, `name`, `userNo`, `email`, `mobile`, `status`      | 新增、导出、引用、人员调动、编辑、删除、角色、权限、重置密码、解锁、数据交接、设置首页机构 |
| `src/views/cost/system/resource.vue`   | Yes, title `资源管理`       | `fetchResourceTree`, `createResourceCategory`, `updateResourceCategory`, `deleteResourceCategory`, `createResource`, `updateResource`, `deleteResource`, `fetchResourcePage`                                                                                                                                                                                                                                                                                                                          | `mockResourceTree`, `mockResourcePage`                                                                                      | `name`, `resource`, `status`                                  | `name`, `resource`, `type`, `status`                                     | 新增、编辑、删除                                                                           |
| `src/views/cost/system/permission.vue` | Yes, title `权限管理`       | `fetchPermissionTree`, `createPermissionCategory`, `updatePermissionCategory`, `deletePermissionCategory`, `createPermission`, `updatePermission`, `deletePermission`, `fetchPermissionPage`, `fetchPermissionUsers`, `savePermissionUsers`, `fetchPermissionResources`, `bindPermissionResources`                                                                                                                                                                                                    | `mockPermissionTree`, `mockPermissionPage`; resource binding dialog may use `mockResourceTree` if `fetchResourceTree` fails | `name`, `module`, `permission`                                | `name`, `module`, `type`, `permission`, `status`, `description`          | 新增、编辑、删除、权限用户、设置资源                                                       |
| `src/views/cost/system/role.vue`       | Yes, title `角色管理`       | `fetchRoleTree`, `createRoleCategory`, `updateRoleCategory`, `deleteRoleCategory`, `createRole`, `updateRole`, `deleteRole`, `fetchRolePage`, `fetchRolePermissions`, `authorizeRolePermissions`                                                                                                                                                                                                                                                                                                      | `mockRoleTree`, `mockRolePage`; permission dialog may use `mockPermissionTree` if `fetchPermissionTree` fails               | `name`, `code`, `status`                                      | `code`, `name`, `status`, `description`                                  | 新增、编辑、删除、授权                                                                     |
| `src/views/cost/system/menu.vue`       | Yes, title `菜单管理`       | `fetchMenuTree`, `createMenu`, `updateMenu`, `deleteMenu`, `fetchMenuPage`, `sortMenu`, `changeMenuLevel`, `fetchMenuResources`, `bindMenuResources`                                                                                                                                                                                                                                                                                                                                                  | `mockMenuTree`, `mockMenuPage`                                                                                              | `name`, `code`                                                | `name`, `code`, `url`, `type`, `view`, `remark`                          | 新增、编辑、删除、资源授权、上移、下移、升级、降级                                         |
| `src/views/cost/system/log.vue`        | No                          | `fetchOperationLogPage`, `exportOperationLogs`, `deleteOperationLogs`                                                                                                                                                                                                                                                                                                                                                                                                                                 | `mockOperationLogPage`                                                                                                      | `account`, `name`, `status`, `module`, `startDate`, `endDate` | `account`, `name`, `orgId`, `module`, `action`, `area`, `time`, `status` | 查询、重置、导出、删除旧日志                                                               |

### Required page functions

Each tree-backed page should define these functions with page-specific API and mock methods:

```ts
function selectedTreeIds() {
  return collectTreeIds(selectedTreeNode.value);
}

function onTreeSelect(node: TreeNode) {
  selectedTreeNode.value = node;
  query.page = 1;
  loadData();
}

function searchData() {
  query.page = 1;
  loadData();
}

function resetQuery() {
  Object.assign(query, initialQuery());
  loadData();
}

function onPageChange(page: number) {
  query.page = page;
  loadData();
}

function onPageSizeChange(rows: number) {
  query.rows = rows;
  query.page = 1;
  loadData();
}
```

Each page should use the same fallback decision:

```ts
const fallbackPage = mockPage({ ...query, ids: selectedTreeIds() });
rows.value = apiPage.list.length > 0 ? apiPage.list : fallbackPage.list;
total.value = apiPage.list.length > 0 ? apiPage.total : fallbackPage.total;
```

For pages where an empty backend response is a valid expected result during integration, remove this empty-list fallback and keep only the `catch` fallback.

### Query, reset, toolbar, and pagination requirements

Every page must include:

- 查询 button with `Search` icon (`~icons/ri/search-line`) calling `searchData()`.
- 重置 button with `Refresh` icon (`~icons/ri/refresh-line`) calling `resetQuery()`.
- `el-pagination` with total, page size selector, prev/pager/next, and jumper. Default page size is `15`.
- Query form uses `class="cq-search-form"` and inline Element Plus controls.
- Search and reset must reload from page 1.
- Table uses `class="cq-table-wrap"` or the existing Changqing table wrapper, `border`, `size="small"`, and a fixed right operation column when the page has row actions.

Toolbar icons:

| Action     | Icon import                   | Function                                                   |
| ---------- | ----------------------------- | ---------------------------------------------------------- |
| 新增       | `~icons/ri/add-circle-line`   | Open the page's create dialog                              |
| 导出       | `~icons/ri/file-excel-2-line` | Call export API with current filters and selected tree ids |
| 引用       | `~icons/ri/user-add-line`     | Open `UserRelationDialog.vue`                              |
| 人员调动   | `~icons/ri/exchange-box-line` | Open `UserTransferDialog.vue` after confirmation           |
| 删除旧日志 | `~icons/ri/delete-bin-2-line` | Open `LogDeleteDialog.vue`                                 |
| 上移       | `~icons/ri/arrow-up-line`     | Call `sortMenu({ direction: "up" })` for selected menu     |
| 下移       | `~icons/ri/arrow-down-line`   | Call `sortMenu({ direction: "down" })` for selected menu   |
| 升级       | `~icons/ri/indent-decrease`   | Call `changeMenuLevel({ direction: "upgrade" })`           |
| 降级       | `~icons/ri/indent-increase`   | Call `changeMenuLevel({ direction: "downgrade" })`         |

Tree node icons:

| Action     | Icon import                   | Function                                                                                   |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| 新增子节点 | `~icons/ri/add-circle-line`   | Open `SystemCategoryDialog.vue` or `OrgFormDialog.vue` with selected node as parent        |
| 编辑节点   | `~icons/ri/edit-2-line`       | Open category/org dialog in edit mode                                                      |
| 删除节点   | `~icons/ri/delete-bin-6-line` | Confirm and call the matching category delete API; hide or disable for nodes with children |

### Table operation icon requirements

Use icon-only `el-button` controls wrapped in `el-tooltip`. Put row actions inside `.cq-row-actions`. Do not render raw text links in the operation column.

```vue
<el-table-column label="操作" fixed="right" width="132">
  <template #default="{ row }">
    <div class="cq-row-actions">
      <el-tooltip content="编辑" placement="top">
        <el-button link type="primary" @click="openEdit(row)">
          <IconifyIconOffline :icon="Edit" />
        </el-button>
      </el-tooltip>
    </div>
  </template>
</el-table-column>
```

When one row has more than five actions, keep 编辑、删除、授权 or the highest-frequency actions visible and move the rest into an `el-dropdown` with a `More` icon (`~icons/ri/more-2-fill`).

| Page         | Operation        | Icon import                       | Tooltip          | Permission condition                                                | Function or dialog                                                                                            |
| ------------ | ---------------- | --------------------------------- | ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 用户机构管理 | 编辑             | `~icons/ri/edit-2-line`           | 编辑             | `system_userOrg_edit_permission`; disable when `row.isRela === "1"` | Open `UserFormDialog.vue` in edit mode                                                                        |
| 用户机构管理 | 删除             | `~icons/ri/delete-bin-6-line`     | 删除             | `system_userOrg_edit_permission`                                    | Confirm; call `deleteUser`; if `row.isRela === "1"` call `deleteUserCategoryRelation` and prompt 删除引用关系 |
| 用户机构管理 | 设置角色         | `~icons/ri/user-settings-line`    | 设置角色         | `system_userOrg_edit_permission`                                    | Open `RoleSelectDialog.vue`; save with `saveUserGroups`                                                       |
| 用户机构管理 | 设置权限         | `~icons/ri/shield-user-line`      | 设置权限         | `system_userOrg_edit_permission`                                    | Open `PermissionSelectDialog.vue`; save with `authorizeUserPermissions`                                       |
| 用户机构管理 | 导出用户权限     | `~icons/ri/file-shield-2-line`    | 导出用户权限     | `system_userOrg_edit_permission`                                    | Call `exportUserPermissions(row.id)`                                                                          |
| 用户机构管理 | 重置密码         | `~icons/ri/key-2-line`            | 重置密码         | `system_userOrg_edit_permission`                                    | Confirm; call `resetUserPassword`                                                                             |
| 用户机构管理 | 授权建设单位指标 | `~icons/ri/organization-chart`    | 授权建设单位指标 | `system_userOrg_edit_permission`                                    | Open `UserIndexOrgDialog.vue`                                                                                 |
| 用户机构管理 | 许可证下载       | `~icons/ri/download-cloud-2-line` | 许可证下载       | `system_userdat_download_permission`                                | Open `UserLicenseDialog.vue`                                                                                  |
| 用户机构管理 | 解锁用户         | `~icons/ri/lock-unlock-line`      | 解锁用户         | `system_user_unlock_permission`                                     | Confirm; call `unlockUser(row.id)`                                                                            |
| 用户机构管理 | 数据交接         | `~icons/ri/exchange-box-line`     | 数据交接         | `system_userOrg_dataExchage_edit_permission`                        | Confirm; open `UserDataExchangeDialog.vue`                                                                    |
| 用户机构管理 | 禁用/启用        | `~icons/ri/toggle-line`           | 禁用 or 启用     | `system_userOrg_edit_permission`                                    | Call `switchUserStatus(row.id, nextStatus)`                                                                   |
| 资源管理     | 编辑             | `~icons/ri/edit-2-line`           | 编辑             | `system_resource_edit_permission`                                   | Open `ResourceFormDialog.vue` in edit mode                                                                    |
| 资源管理     | 删除             | `~icons/ri/delete-bin-6-line`     | 删除             | `system_resource_edit_permission`                                   | Confirm; call `deleteResource`                                                                                |
| 权限管理     | 编辑             | `~icons/ri/edit-2-line`           | 编辑             | `system_permission_edit_permission`                                 | Open `PermissionFormDialog.vue` in edit mode                                                                  |
| 权限管理     | 删除             | `~icons/ri/delete-bin-6-line`     | 删除             | `system_permission_edit_permission`                                 | Confirm; call `deletePermission`                                                                              |
| 权限管理     | 权限用户         | `~icons/ri/user-follow-line`      | 权限用户         | `system_permission_edit_permission`                                 | Open `PermissionUserDialog.vue`                                                                               |
| 权限管理     | 设置资源         | `~icons/ri/shield-check-line`     | 设置资源         | `system_permission_edit_permission`                                 | Open `ResourceBindDialog.vue` with `masterType: "permission"`                                                 |
| 角色管理     | 编辑             | `~icons/ri/edit-2-line`           | 编辑             | `system_role_edit_permission`                                       | Open `RoleFormDialog.vue` in edit mode                                                                        |
| 角色管理     | 删除             | `~icons/ri/delete-bin-6-line`     | 删除             | `system_role_edit_permission`                                       | Confirm; call `deleteRole`                                                                                    |
| 角色管理     | 授权             | `~icons/ri/shield-keyhole-line`   | 授权             | `system_role_edit_permission`                                       | Open `PermissionSelectDialog.vue`; save with `authorizeRolePermissions`                                       |
| 菜单管理     | 编辑             | `~icons/ri/edit-2-line`           | 编辑             | `system_menu_edit_permisson`                                        | Open `MenuFormDialog.vue` in edit mode                                                                        |
| 菜单管理     | 删除             | `~icons/ri/delete-bin-6-line`     | 删除             | `system_menu_edit_permisson`                                        | Confirm; call `deleteMenu`                                                                                    |
| 菜单管理     | 资源授权         | `~icons/ri/shield-check-line`     | 资源授权         | `system_menu_edit_permisson`                                        | Open `ResourceBindDialog.vue` with `masterType: "menu"`                                                       |
| 日志管理     | None             | None                              | None             | None                                                                | No row operation column                                                                                       |

### Table cell render requirements

| Page         | Column            | Render rule                                                                                                                                                          |
| ------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 用户机构管理 | `status`          | If `status === "1"` render `启用-正常使用` when `staffState === "1"`, `启用-人员退休` when `staffState === "2"`, otherwise `启用`; if `status === "0"` render `禁用` |
| 用户机构管理 | `email`, `mobile` | Render `-` for empty values                                                                                                                                          |
| 用户机构管理 | operation column  | Width should allow two rows of icons or use dropdown; do not let icons wrap into table text cells                                                                    |
| 资源管理     | `status`          | `1` renders `启用`, `0` renders `禁用`                                                                                                                               |
| 权限管理     | `status`          | `1` renders `启用`, `0` renders `禁用`                                                                                                                               |
| 权限管理     | `description`     | Hide by default if matching old page; if shown, use `el-tooltip` for long text                                                                                       |
| 角色管理     | `status`          | `1` renders `启用`, `0` renders `禁用`                                                                                                                               |
| 菜单管理     | `type`            | `0` renders `普通菜单`, `1` renders `桌面`, `2` renders `新页面`                                                                                                     |
| 菜单管理     | `view`            | `1` renders `是`, `0` renders `否`                                                                                                                                   |
| 菜单管理     | `remark`          | Hide by default if matching old page; if shown, use `el-tooltip` for long text                                                                                       |
| 日志管理     | `orgId`           | Render organization display name if cache/dictionary is available; otherwise render raw value or `-`                                                                 |
| 日志管理     | `status`          | `1` renders green `成功` with tooltip from `description`; `0` renders red `异常`                                                                                     |
| 日志管理     | `time`            | Preserve full timestamp; allow wrapping like the old page if column width is constrained                                                                             |

### Dialog requirements

| Dialog                       | Opened from                          | Required fields and behavior                                                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserFormDialog.vue`         | 用户新增、用户编辑                   | Uses selected org id as `categoryId`; edit mode loads row data; save calls `createUser` or `updateUser`; readonly view mode can reuse the same form with disabled controls                                                                                                                               |
| `OrgFormDialog.vue`          | 用户机构树新增、编辑                 | Fields include organization name, parent, sort, long name, org type, org code, leader, build type, flow type, evaluation fields; save calls `createOrg` or `updateOrg`                                                                                                                                   |
| `UserRelationDialog.vue`     | 用户机构管理 toolbar 引用            | Shows selectable users outside current org; save calls `saveUserCategoryRelation({ userIds, categoryId })`; refreshes table and stats                                                                                                                                                                    |
| `UserTransferDialog.vue`     | 用户机构管理 toolbar 人员调动        | Shows selected/current org and target org tree; save calls `transferUserCategory`; refreshes source and target tree/table                                                                                                                                                                                |
| `RoleSelectDialog.vue`       | 用户行 设置角色                      | Shows role tree and role checklist; loads checked roles with `fetchUserRoles(row.id)`, falls back to `mockCheckedRoleIds`; saves with `saveUserGroups(row.id, checkedRoleIds)`                                                                                                                           |
| `PermissionSelectDialog.vue` | 用户行 设置权限, 角色行 授权         | Shows permission tree and checklist; user mode loads checked permissions with `fetchUserPermissions(row.id)`, role mode loads checked permissions with `fetchRolePermissions(row.id)`, both fall back to `mockCheckedPermissionIds`; saves with `authorizeUserPermissions` or `authorizeRolePermissions` |
| `UserLicenseDialog.vue`      | 用户行 许可证下载                    | Shows license info and download action; download calls `downloadUserLicense(row.id)`                                                                                                                                                                                                                     |
| `UserDataExchangeDialog.vue` | 用户行 数据交接                      | Shows pending work transfer target user and target organization/user fields; save calls `saveUserDataExchange(row.id, payload)`                                                                                                                                                                          |
| `UserIndexOrgDialog.vue`     | 用户行 授权建设单位指标              | Shows organization tree/checklist for index organization authorization; loads checked orgs with `fetchUserIndexOrgs(row.id)`, falls back to `mockCheckedOrgIds`; saves with `saveUserIndexOrgs(row.id, orgIds)`                                                                                          |
| `SystemCategoryDialog.vue`   | 资源、权限、角色、菜单 tree add/edit | Generic category form with name, parent, sort/code/module when applicable; refreshes the current tree after save                                                                                                                                                                                         |
| `ResourceFormDialog.vue`     | 资源新增、编辑                       | Fields: name, resource, type, status, category/module; save calls `createResource` or `updateResource`                                                                                                                                                                                                   |
| `PermissionFormDialog.vue`   | 权限新增、编辑                       | Fields: name, module, type, permission, status, description, category; save calls `createPermission` or `updatePermission`                                                                                                                                                                               |
| `PermissionUserDialog.vue`   | 权限行 权限用户                      | Shows user tree/list checklist for users owning the permission; loads with `fetchPermissionUsers(permissionId)`, falls back to `mockPermissionUsers`; saves with `savePermissionUsers(permissionId, userIds)`                                                                                            |
| `ResourceBindDialog.vue`     | 权限行 设置资源, 菜单行 资源授权     | Shows resource tree checklist; permission mode loads checked resources with `fetchPermissionResources`, menu mode loads checked resources with `fetchMenuResources`, both fall back to `mockCheckedResourceIds`; saves with `bindPermissionResources` or `bindMenuResources`                             |
| `RoleFormDialog.vue`         | 角色新增、编辑                       | Fields: code, name, status, description, category; save calls `createRole` or `updateRole`                                                                                                                                                                                                               |
| `MenuFormDialog.vue`         | 菜单新增、编辑                       | Fields: name, code, url, type, view, remark, parent; save calls `createMenu` or `updateMenu`                                                                                                                                                                                                             |
| `LogDeleteDialog.vue`        | 日志管理 删除旧日志                  | Field: `monthNum`; confirm and call `deleteOperationLogs({ monthNum })`; refresh log table                                                                                                                                                                                                               |

### Operation dialog content requirements

All operation dialogs use `el-dialog`, keep the close icon in the top-right corner, use the footer order `保存` then `关闭` for editable dialogs, and emit `saved` only after the API call succeeds. Dialog width should stay close to the legacy screen: form dialogs `720px` to `820px`, tree authorization dialogs `480px` to `620px`, and small confirmation dialogs use `ElMessageBox.confirm`.

| Operation entry         | Dialog or confirm title | Content that must be rendered                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Save or confirm behavior                                                                                                                                                                                                     |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 用户行 编辑             | `编辑用户`              | Two-column form. Required fields: `账号` maps to `uid` and is disabled in edit mode, `员工编号` maps to `userNo`, `姓名` maps to `name`. Optional fields: `手机`, `邮箱`, `资格证号` maps to `qualificationNo`. Select fields: `是否启用` maps to `status` with `是/否`, `员工状态` maps to `staffState` with `正常使用/退休`, `是否借调人员` maps to `isBorrowed` with `是/否`. Prefill all values from the clicked row; if mock data has no `uid`, display `userNo` in the account field. | Click `保存` validates required fields, calls `updateUser(row.id, form)`, closes the dialog, then refreshes current page and stats. Click `关闭` or top-right close discards local edits.                                    |
| 用户 toolbar 新增       | `新增用户`              | Same fields as `编辑用户`, but `账号` and `员工编号` are editable. The selected organization id is injected as `categoryId`; if no tree node is selected, use the root organization node.                                                                                                                                                                                                                                                                                                   | Click `保存` calls `createUser({ ...form, categoryId })`, closes the dialog, then refreshes current page and stats.                                                                                                          |
| 用户行 删除             | `提示`                  | `ElMessageBox.confirm` body text is `确认要删除该记录吗?`. If `row.isRela === "1"`, use `确认要删除该引用关系吗?` and delete only the user-category relation.                                                                                                                                                                                                                                                                                                                               | Confirm calls `deleteUser(row.id)` for normal users. For referenced users it calls `deleteUserCategoryRelation({ userId: row.id, categoryId: selectedOrg.id })`. Cancel does nothing. After success refresh table and stats. |
| 用户行 设置角色         | `设置角色`              | Checkbox tree/list. Root label is `角色管理`; children come from `fetchRoleTree()`. Checkboxes are shown on role leaf nodes and existing selections are checked from `fetchUserRoles(row.id)` or `mockCheckedRoleIds()`. The body must scroll vertically like the legacy dialog.                                                                                                                                                                                                            | Click `保存` calls `saveUserGroups(row.id, checkedRoleIds)`, closes the dialog, then refreshes the row if needed.                                                                                                            |
| 用户行 设置权限         | `权限列表`              | Checkbox tree. Root and categories come from `fetchPermissionTree()`. Leaf nodes show permission names such as `查看` and `编辑`; checked values come from `fetchUserPermissions(row.id)` or `mockCheckedPermissionIds()`. The tree supports expand/collapse and vertical scrolling.                                                                                                                                                                                                        | Click `保存` calls `authorizeUserPermissions(row.id, checkedPermissionIds)`, closes the dialog, then refreshes the row if needed.                                                                                            |
| 用户行 重置密码         | `提示`                  | `ElMessageBox.confirm` body text is `确认要重置该用户密码吗?`.                                                                                                                                                                                                                                                                                                                                                                                                                              | Confirm calls `resetUserPassword(row.id)` and shows backend message; if backend returns no message show `密码已重置，默认密码为 Cq123@cost#*`.                                                                               |
| 用户行 启用/禁用        | `提示`                  | `ElMessageBox.confirm` body text is `确认要启用该账号吗?` or `确认要禁用该账号吗?` based on current status.                                                                                                                                                                                                                                                                                                                                                                                 | Confirm calls `switchUserStatus(row.id, nextStatus)` and refreshes table and stats.                                                                                                                                          |
| 用户行 解锁             | `提示`                  | `ElMessageBox.confirm` body text is `确认要解锁该账号吗?`.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Confirm calls `unlockUser(row.id)` and refreshes table.                                                                                                                                                                      |
| 用户行 许可证下载       | `许可证下载`            | Read-only summary of account, name, organization, and license status if the API provides it. Primary action button is `下载`.                                                                                                                                                                                                                                                                                                                                                               | Click `下载` calls `downloadUserLicense(row.id)` and streams the file response.                                                                                                                                              |
| 用户行 数据交接         | `数据交接`              | Form with source user read-only fields, target organization tree selector, target user selector, and optional remark. The target user list should be loaded by selected target organization; when API has no data, use mock users from `mockUserPage`.                                                                                                                                                                                                                                      | Click `保存` calls `saveUserDataExchange(row.id, payload)`, closes the dialog, and refreshes table.                                                                                                                          |
| 用户行 授权建设单位指标 | `授权建设单位指标`      | Checkbox organization tree from `fetchOrgTree()`. Checked nodes come from `fetchUserIndexOrgs(row.id)` or `mockCheckedOrgIds()`.                                                                                                                                                                                                                                                                                                                                                            | Click `保存` calls `saveUserIndexOrgs(row.id, checkedOrgIds)` and closes the dialog.                                                                                                                                         |
| 用户 toolbar 引用       | `引用人员`              | Searchable table or transfer list of users outside the current organization. It has query fields for account/name and a multiple-selection table.                                                                                                                                                                                                                                                                                                                                           | Click `保存` calls `saveUserCategoryRelation({ categoryId, userIds })`, closes the dialog, refreshes table and stats.                                                                                                        |
| 用户 toolbar 人员调动   | `人员调动`              | Source organization and selected users are read-only. Target organization is selected from an organization tree.                                                                                                                                                                                                                                                                                                                                                                            | Click `保存` calls `transferUserCategory({ sourceCategoryId, targetCategoryId, userIds })`, closes the dialog, refreshes tree/table/stats.                                                                                   |
| 资源行 编辑             | `编辑资源`              | Form fields: `名称`, `资源`, `资源类型`, `状态`, `所属分类`. Values are prefilled from the row.                                                                                                                                                                                                                                                                                                                                                                                             | Click `保存` calls `updateResource(form)`, closes the dialog, and refreshes table.                                                                                                                                           |
| 资源行 删除             | `提示`                  | `ElMessageBox.confirm` body text is `确认要删除该记录吗?`.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Confirm calls `deleteResource(row.id)` and refreshes table.                                                                                                                                                                  |
| 权限行 编辑             | `编辑权限`              | Form fields: `名称`, `模块`, `权限类型`, `权限`, `状态`, `描述`, `所属分类`. Values are prefilled from the row.                                                                                                                                                                                                                                                                                                                                                                             | Click `保存` calls `updatePermission(form)`, closes the dialog, and refreshes table.                                                                                                                                         |
| 权限行 删除             | `提示`                  | `ElMessageBox.confirm` body text is `确认要删除该记录吗?`.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Confirm calls `deletePermission(row.id)` and refreshes table.                                                                                                                                                                |
| 权限行 权限用户         | `权限用户`              | User checklist/table with current authorized users from `fetchPermissionUsers(permissionId)` or `mockPermissionUsers()`. Include account, name, organization columns when table mode is used.                                                                                                                                                                                                                                                                                               | Click `保存` calls `savePermissionUsers(permissionId, checkedUserIds)` and closes the dialog.                                                                                                                                |
| 权限行 设置资源         | `设置资源`              | Checkbox resource tree from `fetchResourceTree()`. Checked nodes come from `fetchPermissionResources(permissionId)` or `mockCheckedResourceIds()`.                                                                                                                                                                                                                                                                                                                                          | Click `保存` calls `bindPermissionResources(permissionId, checkedResourceIds)` and closes the dialog.                                                                                                                        |
| 角色行 编辑             | `编辑角色`              | Form fields: `编号`, `名称`, `状态`, `描述`, `所属分类`. Values are prefilled from the row.                                                                                                                                                                                                                                                                                                                                                                                                 | Click `保存` calls `updateRole(form)`, closes the dialog, and refreshes table.                                                                                                                                               |
| 角色行 删除             | `提示`                  | `ElMessageBox.confirm` body text is `确认要删除该记录吗?`.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Confirm calls `deleteRole(row.id)` and refreshes table.                                                                                                                                                                      |
| 角色行 授权             | `设置权限`              | Same checkbox permission tree as 用户行 设置权限. Checked nodes come from `fetchRolePermissions(row.id)` or `mockCheckedPermissionIds()`.                                                                                                                                                                                                                                                                                                                                                   | Click `保存` calls `authorizeRolePermissions(row.id, checkedPermissionIds)` and closes the dialog.                                                                                                                           |
| 菜单行 编辑             | `编辑菜单`              | Form fields: `名称`, `编号`, `URL`, `类型`, `是否显示`, `父级菜单`, `备注`. Values are prefilled from the row.                                                                                                                                                                                                                                                                                                                                                                              | Click `保存` calls `updateMenu(form)`, closes the dialog, and refreshes tree/table.                                                                                                                                          |
| 菜单行 删除             | `提示`                  | `ElMessageBox.confirm` body text is `确认要删除该记录吗?`.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Confirm calls `deleteMenu(row.id)` and refreshes tree/table.                                                                                                                                                                 |
| 菜单行 资源授权         | `资源授权`              | Same checkbox resource tree as 权限行 设置资源. Checked nodes come from `fetchMenuResources(menuId)` or `mockCheckedResourceIds()`.                                                                                                                                                                                                                                                                                                                                                         | Click `保存` calls `bindMenuResources(menuId, checkedResourceIds)` and closes the dialog.                                                                                                                                    |
| 日志 toolbar 删除旧日志 | `删除旧日志`            | Numeric input `monthNum`, label `删除多少个月以前的日志`, min `1`, default `6`.                                                                                                                                                                                                                                                                                                                                                                                                             | Click `保存` calls `deleteOperationLogs({ monthNum })`, closes the dialog, and refreshes table.                                                                                                                              |

### Operation dialog component contracts

Each dialog component exposes one `open` method so the page code stays explicit and easy to wire to row icons:

```ts
// UserFormDialog.vue
function open(
  mode: "create" | "edit" | "view",
  row?: UserRow,
  categoryId?: string
): void;

// RoleSelectDialog.vue
function open(user: UserRow): Promise<void>;

// PermissionSelectDialog.vue
function open(payload: {
  mode: "user" | "role";
  id: string;
  name: string;
}): Promise<void>;

// ResourceBindDialog.vue
function open(payload: {
  masterType: "permission" | "menu";
  id: string;
  name: string;
}): Promise<void>;

// All dialog components
const emit = defineEmits<{
  saved: [];
}>();
```

Page components call these methods from the icon handlers:

```ts
function onEditUser(row: UserRow) {
  userFormRef.value?.open("edit", row, selectedOrg.value?.id);
}

function onDeleteUser(row: UserRow) {
  return ElMessageBox.confirm(
    row.isRela === "1" ? "确认要删除该引用关系吗?" : "确认要删除该记录吗?",
    "提示",
    { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
  ).then(async () => {
    await deleteUser(row.id);
    await loadData();
  });
}

function onSetUserRoles(row: UserRow) {
  roleSelectRef.value?.open(row);
}

function onSetUserPermissions(row: UserRow) {
  permissionSelectRef.value?.open({ mode: "user", id: row.id, name: row.name });
}
```

---

## Permission Keys

Use old permission strings. Do not rename misspelled legacy keys.

```ts
export const systemAuth = {
  userOrgView: "system_userOrg_view_permission",
  userOrgEdit: "system_userOrg_edit_permission",
  resourceView: "system_resource_view_permission",
  resourceEdit: "system_resource_edit_permission",
  permissionEdit: "system_permission_edit_permission",
  roleView: "system_role_view_permission",
  roleEdit: "system_role_edit_permission",
  menuView: "system_menu_view_permission",
  menuEdit: "system_menu_edit_permisson",
  logMenu: "system_operationLog_menu_permission",
  userDataDownload: "system_userdat_download_permission",
  userUnlock: "system_user_unlock_permission",
  userOrgDataExchange: "system_userOrg_dataExchage_edit_permission"
} as const;
```

---

## Implementation Tasks

### Task 1: Add routes and top menu entries

**Files:**

- Modify: `E:/pure-admin-thin/src/layout/cost-menu.ts`
- Modify: `E:/pure-admin-thin/src/router/modules/cost.ts`

- [ ] **Step 1: Add system menu children**

In `cost-menu.ts`, replace the current system item:

```ts
{ code: "system", title: "系统管理", children: [] }
```

with:

```ts
{
  code: "system",
  title: "系统管理",
  children: [
    {
      code: "user-org",
      title: "用户机构管理",
      path: "/cost/system/user-org",
      auths: ["system_userOrg_view_permission"]
    },
    {
      code: "resource",
      title: "资源管理",
      path: "/cost/system/resource",
      auths: ["system_resource_view_permission"]
    },
    {
      code: "permission",
      title: "权限管理",
      path: "/cost/system/permission",
      auths: ["system_permission_edit_permission"]
    },
    {
      code: "role",
      title: "角色管理",
      path: "/cost/system/role",
      auths: ["system_role_view_permission"]
    },
    {
      code: "menu",
      title: "菜单管理",
      path: "/cost/system/menu",
      auths: ["system_menu_view_permission"]
    },
    {
      code: "log",
      title: "日志管理",
      path: "/cost/system/log",
      auths: ["system_operationLog_menu_permission"]
    }
  ]
}
```

- [ ] **Step 2: Add route records**

Append these children to the existing `children` array in `cost.ts`:

```ts
{
  path: "/cost/system/user-org",
  name: "CostSystemUserOrg",
  component: () => import("@/views/cost/system/user-org.vue"),
  meta: {
    title: "用户机构管理",
    topMenuCode: "system",
    sideMenuCode: "user-org",
    auths: ["system_userOrg_view_permission"],
    hideFooter: true,
    hiddenTag: true
  }
},
{
  path: "/cost/system/resource",
  name: "CostSystemResource",
  component: () => import("@/views/cost/system/resource.vue"),
  meta: {
    title: "资源管理",
    topMenuCode: "system",
    sideMenuCode: "resource",
    auths: ["system_resource_view_permission"],
    hideFooter: true,
    hiddenTag: true
  }
},
{
  path: "/cost/system/permission",
  name: "CostSystemPermission",
  component: () => import("@/views/cost/system/permission.vue"),
  meta: {
    title: "权限管理",
    topMenuCode: "system",
    sideMenuCode: "permission",
    auths: ["system_permission_edit_permission"],
    hideFooter: true,
    hiddenTag: true
  }
},
{
  path: "/cost/system/role",
  name: "CostSystemRole",
  component: () => import("@/views/cost/system/role.vue"),
  meta: {
    title: "角色管理",
    topMenuCode: "system",
    sideMenuCode: "role",
    auths: ["system_role_view_permission"],
    hideFooter: true,
    hiddenTag: true
  }
},
{
  path: "/cost/system/menu",
  name: "CostSystemMenu",
  component: () => import("@/views/cost/system/menu.vue"),
  meta: {
    title: "菜单管理",
    topMenuCode: "system",
    sideMenuCode: "menu",
    auths: ["system_menu_view_permission"],
    hideFooter: true,
    hiddenTag: true
  }
},
{
  path: "/cost/system/log",
  name: "CostSystemLog",
  component: () => import("@/views/cost/system/log.vue"),
  meta: {
    title: "日志管理",
    topMenuCode: "system",
    sideMenuCode: "log",
    auths: ["system_operationLog_menu_permission"],
    hideFooter: true,
    hiddenTag: true
  }
}
```

- [ ] **Step 3: Create temporary route components**

Create the six `.vue` files with this temporary body, changing `name` and heading for each page:

```vue
<script setup lang="ts">
defineOptions({
  name: "CostSystemUserOrg"
});
</script>

<template>
  <section class="cq-page">
    <div class="cq-page-header">
      <div>
        <h2>系统管理</h2>
        <p>用户机构管理</p>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Verify routing**

Run:

```bash
pnpm typecheck
pnpm dev
```

Expected:

- Typecheck exits successfully.
- Opening `/cost/system/user-org` renders the Changqing layout and selected system menu.
- Switching the six system menu items changes pages without console route errors.

- [ ] **Step 5: Commit**

```bash
git add src/layout/cost-menu.ts src/router/modules/cost.ts src/views/cost/system
git commit -m "feat: add system management routes"
```

### Task 2: Implement shared API and types

**Files:**

- Create: `E:/pure-admin-thin/src/api/cost/system.ts`
- Create: `E:/pure-admin-thin/src/views/cost/system/types.ts`
- Create: `E:/pure-admin-thin/src/views/cost/system/mock.ts`

- [ ] **Step 1: Define shared types**

Create `types.ts`:

```ts
export interface SystemPage<T> {
  list: T[];
  total: number;
}

export interface PageQuery {
  page: number;
  rows: number;
}

export interface TreeNode {
  id: string;
  parentId?: string;
  name: string;
  text?: string;
  code?: string;
  type?: string;
  leaf?: boolean;
  children?: TreeNode[];
}

export function collectTreeIds(node?: TreeNode | null): string {
  if (!node) return "";

  const ids: string[] = [];
  const walk = (item: TreeNode) => {
    ids.push(item.id);
    for (const child of item.children ?? []) {
      walk(child);
    }
  };

  walk(node);
  return ids.join(",");
}

export interface UserQuery extends PageQuery {
  ids?: string;
  uid?: string;
  name?: string;
  userNo?: string;
  timeOver?: string;
  status?: string;
}

export interface UserRow {
  id: string;
  companyName: string;
  companyID?: string;
  categoryId?: string;
  uid?: string;
  userNo: string;
  name: string;
  email?: string;
  mobile?: string;
  qualificationNo?: string;
  status: string;
  staffState?: string;
  isBorrowed?: string;
  isRela?: string;
}

export interface UserStats {
  normalCount: number;
  disabledCount: number;
  retiredCount: number;
}

export interface ResourceRow {
  id: string;
  name: string;
  resource: string;
  type: string;
  status: string;
}

export interface PermissionRow {
  id: string;
  name: string;
  module: string;
  type: string;
  permission: string;
  status: string;
  description?: string;
}

export interface RoleRow {
  id: string;
  code: string;
  name: string;
  status: string;
  description?: string;
}

export interface MenuRow {
  id: string;
  name: string;
  code: string;
  url?: string;
  type?: string;
  view?: string;
  remark?: string;
}

export interface OperationLogRow {
  id: string;
  account: string;
  name: string;
  orgId?: string;
  module: string;
  action: string;
  area?: string;
  time: string;
  status: string;
  description?: string;
}

export const systemAuth = {
  userOrgView: "system_userOrg_view_permission",
  userOrgEdit: "system_userOrg_edit_permission",
  resourceView: "system_resource_view_permission",
  resourceEdit: "system_resource_edit_permission",
  permissionEdit: "system_permission_edit_permission",
  roleView: "system_role_view_permission",
  roleEdit: "system_role_edit_permission",
  menuView: "system_menu_view_permission",
  menuEdit: "system_menu_edit_permisson",
  logMenu: "system_operationLog_menu_permission",
  userDataDownload: "system_userdat_download_permission",
  userUnlock: "system_user_unlock_permission",
  userOrgDataExchange: "system_userOrg_dataExchage_edit_permission"
} as const;
```

- [ ] **Step 2: Create mock data for page-level fallback**

Create `mock.ts`. These functions are imported by Vue pages only. Do not import this file from `src/api/cost/system.ts`.

```ts
import type {
  SystemPage,
  MenuRow,
  OperationLogRow,
  PermissionRow,
  ResourceRow,
  RoleRow,
  TreeNode,
  UserQuery,
  UserRow,
  UserStats
} from "./types";

type AnyQuery = Record<string, any>;

const moduleTree: TreeNode[] = [
  { id: "desktop", name: "我的桌面" },
  { id: "compile", name: "造价编制" },
  { id: "audit", name: "造价审核" },
  { id: "manage", name: "造价管理" },
  { id: "price", name: "价格管理" },
  { id: "foundation", name: "基础工作" },
  { id: "archive", name: "档案管理" },
  { id: "evaluation", name: "考评管理" },
  { id: "business", name: "业务交流" },
  { id: "system", name: "系统管理" }
];

const userRows: UserRow[] = [
  {
    id: "u-1",
    companyName: "长庆工程设计有限公司",
    companyID: "org-design",
    categoryId: "org-design",
    uid: "80228400",
    userNo: "80228400",
    name: "张新政",
    email: "zxz1_cq",
    mobile: "-",
    qualificationNo: "",
    status: "1",
    staffState: "1",
    isBorrowed: "0",
    isRela: "0"
  },
  {
    id: "u-2",
    companyName: "第三采油厂",
    companyID: "org-work",
    categoryId: "org-work",
    uid: "00008326",
    userNo: "00008326",
    name: "刘长军",
    email: "-",
    mobile: "-",
    qualificationNo: "",
    status: "1",
    staffState: "1",
    isBorrowed: "0",
    isRela: "0"
  }
];

const resourceRows: ResourceRow[] = [
  {
    id: "res-1",
    name: "工程结算-查看",
    resource: "account_balance_view_resource",
    type: "TAG",
    status: "1"
  }
];

const permissionRows: PermissionRow[] = [
  {
    id: "perm-1",
    name: "编制包组组长",
    module: "costbs",
    type: "TAG",
    permission: "costbs_bdys_zjb_bzbzzz_permission",
    status: "1"
  }
];

const roleRows: RoleRow[] = [
  {
    id: "role-1",
    code: "000",
    name: "系统初始化角色",
    status: "1",
    description: "默认所有人都具有的权限"
  },
  {
    id: "role-2",
    code: "001",
    name: "系统管理员",
    status: "1",
    description: "-"
  }
];

const menuRows: MenuRow[] = [
  {
    id: "menu-1",
    name: "我的桌面",
    code: "01",
    url: "/cost/desktop/index.html",
    type: "普通菜单",
    view: "是"
  },
  {
    id: "menu-2",
    name: "造价编制",
    code: "02",
    url: "#",
    type: "普通菜单",
    view: "是"
  }
];

const logRows: OperationLogRow[] = [
  {
    id: "log-1",
    account: "admin",
    name: "系统管理员",
    orgId: "长庆油田分公司",
    module: "用户管理",
    action: "登录",
    area: "IANA",
    time: "2026-05-11 10:05:00",
    status: "1",
    description: "登录成功"
  }
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function paginate<T>(rows: T[], query: AnyQuery): SystemPage<T> {
  const page = Number(query.page || 1);
  const size = Number(query.rows || 15);
  const start = (page - 1) * size;
  return {
    list: clone(rows).slice(start, start + size),
    total: rows.length
  };
}

export function mockOrgTree(): TreeNode[] {
  return [
    {
      id: "org-root",
      name: "长庆油田分公司",
      children: [
        { id: "org-cost", name: "工程造价部" },
        { id: "org-audit", name: "审计中心" },
        { id: "org-design", name: "设计单位" },
        { id: "org-build", name: "建设单位" },
        { id: "org-work", name: "施工单位" },
        { id: "org-consult", name: "咨询公司" }
      ]
    }
  ];
}

export function mockResourceTree(): TreeNode[] {
  return clone(moduleTree);
}

export function mockPermissionTree(): TreeNode[] {
  return clone(moduleTree);
}

export function mockRoleTree(): TreeNode[] {
  return [{ id: "role-basic", name: "基础角色" }];
}

export function mockMenuTree(): TreeNode[] {
  return clone(moduleTree);
}

export function mockUserPage(query: UserQuery): SystemPage<UserRow> {
  return paginate(userRows, query);
}

export function mockUserStats(): UserStats {
  return {
    normalCount: 3119,
    disabledCount: 441,
    retiredCount: 3
  };
}

export function mockResourcePage(query: AnyQuery): SystemPage<ResourceRow> {
  return paginate(resourceRows, query);
}

export function mockPermissionPage(query: AnyQuery): SystemPage<PermissionRow> {
  return paginate(permissionRows, query);
}

export function mockRolePage(query: AnyQuery): SystemPage<RoleRow> {
  return paginate(roleRows, query);
}

export function mockMenuPage(query: AnyQuery): SystemPage<MenuRow> {
  return paginate(menuRows, query);
}

export function mockOperationLogPage(
  query: AnyQuery
): SystemPage<OperationLogRow> {
  return paginate(logRows, query);
}

export function mockCheckedRoleIds(): string[] {
  return ["role-1"];
}

export function mockCheckedPermissionIds(): string[] {
  return ["perm-1"];
}

export function mockCheckedResourceIds(): string[] {
  return ["res-1"];
}

export function mockCheckedOrgIds(): string[] {
  return ["org-build"];
}

export function mockPermissionUsers(): UserRow[] {
  return clone(userRows);
}
```

- [ ] **Step 3: Implement the target API adapter**

Create `system.ts`. Current phase uses target Spring Boot microservice URLs. The functions may fail while backend is unavailable; Vue pages handle fallback with `mock.ts`.

```ts
import { http } from "@/utils/http";
import type {
  SystemPage,
  MenuRow,
  OperationLogRow,
  PermissionRow,
  ResourceRow,
  RoleRow,
  TreeNode,
  UserQuery,
  UserRow,
  UserStats
} from "@/views/cost/system/types";

type QueryRecord = Record<string, any>;

interface ApiResult<T> {
  code: string | number;
  message: string;
  data: T;
}

interface ApiPage<T> {
  records?: T[];
  list?: T[];
  total?: number;
  pageNo?: number;
  pageSize?: number;
}

const SYSTEM_API_BASE = "/api/system";

function unwrap<T>(res: T | ApiResult<T>): T {
  return (res as ApiResult<T>).data ?? (res as T);
}

function normalizePage<T>(
  res: ApiResult<ApiPage<T>> | ApiPage<T>
): SystemPage<T> {
  const page = unwrap(res);
  return {
    list: page.records ?? page.list ?? [],
    total: Number(page.total) || 0
  };
}

function normalizeTree(res: ApiResult<TreeNode[]> | TreeNode[]): TreeNode[] {
  return unwrap(res) ?? [];
}

function toPageParams(params: QueryRecord) {
  const { page, rows, ...rest } = params;
  return {
    ...rest,
    pageNo: page,
    pageSize: rows
  };
}

export async function fetchUserPage(params: UserQuery) {
  const res = await http.request<ApiResult<ApiPage<UserRow>>>(
    "get",
    `${SYSTEM_API_BASE}/users/page`,
    { params: toPageParams(params) }
  );
  return normalizePage<UserRow>(res);
}

export async function fetchUserStats(params: Pick<UserQuery, "ids">) {
  const res = await http.request<ApiResult<UserStats>>(
    "get",
    `${SYSTEM_API_BASE}/users/stats`,
    { params }
  );
  return unwrap(res);
}

export async function fetchOrgTree(params?: QueryRecord) {
  const res = await http.request<ApiResult<TreeNode[]>>(
    "get",
    `${SYSTEM_API_BASE}/orgs/tree`,
    { params }
  );
  return normalizeTree(res);
}

export async function fetchResourceTree(params?: QueryRecord) {
  const res = await http.request<ApiResult<TreeNode[]>>(
    "get",
    `${SYSTEM_API_BASE}/resource-categories/tree`,
    { params }
  );
  return normalizeTree(res);
}

export async function fetchResourcePage(params: QueryRecord) {
  const res = await http.request<ApiResult<ApiPage<ResourceRow>>>(
    "get",
    `${SYSTEM_API_BASE}/resources/page`,
    { params: toPageParams(params) }
  );
  return normalizePage<ResourceRow>(res);
}

export async function fetchPermissionTree(params?: QueryRecord) {
  const res = await http.request<ApiResult<TreeNode[]>>(
    "get",
    `${SYSTEM_API_BASE}/permission-categories/tree`,
    { params }
  );
  return normalizeTree(res);
}

export async function fetchPermissionPage(params: QueryRecord) {
  const res = await http.request<ApiResult<ApiPage<PermissionRow>>>(
    "get",
    `${SYSTEM_API_BASE}/permissions/page`,
    { params: toPageParams(params) }
  );
  return normalizePage<PermissionRow>(res);
}

export async function fetchRoleTree(params?: QueryRecord) {
  const res = await http.request<ApiResult<TreeNode[]>>(
    "get",
    `${SYSTEM_API_BASE}/role-categories/tree`,
    { params }
  );
  return normalizeTree(res);
}

export async function fetchRolePage(params: QueryRecord) {
  const res = await http.request<ApiResult<ApiPage<RoleRow>>>(
    "get",
    `${SYSTEM_API_BASE}/roles/page`,
    { params: toPageParams(params) }
  );
  return normalizePage<RoleRow>(res);
}

export async function fetchMenuTree(params?: QueryRecord) {
  const res = await http.request<ApiResult<TreeNode[]>>(
    "get",
    `${SYSTEM_API_BASE}/menus/tree`,
    { params }
  );
  return normalizeTree(res);
}

export async function fetchMenuPage(params: QueryRecord) {
  const res = await http.request<ApiResult<ApiPage<MenuRow>>>(
    "get",
    `${SYSTEM_API_BASE}/menus/page`,
    { params: toPageParams(params) }
  );
  return normalizePage<MenuRow>(res);
}

export async function fetchOperationLogPage(params: QueryRecord) {
  const res = await http.request<ApiResult<ApiPage<OperationLogRow>>>(
    "get",
    `${SYSTEM_API_BASE}/operation-logs/page`,
    { params: toPageParams(params) }
  );
  return normalizePage<OperationLogRow>(res);
}

export function createUser(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/users`, { data });
}

export function updateUser(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/users/${id}`, { data });
}

export function deleteUser(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/users/${id}`);
}

export function resetUserPassword(id: string) {
  return http.request("post", `${SYSTEM_API_BASE}/users/${id}/password/reset`);
}

export function switchUserStatus(id: string, status: string) {
  return http.request("patch", `${SYSTEM_API_BASE}/users/${id}/status`, {
    data: { status }
  });
}

export function unlockUser(id: string) {
  return http.request("post", `${SYSTEM_API_BASE}/users/${id}/unlock`);
}

export function saveUserCategoryRelation(data: {
  userIds: string[];
  categoryId: string;
}) {
  return http.request("post", `${SYSTEM_API_BASE}/users/category-relations`, {
    data
  });
}

export function deleteUserCategoryRelation(data: {
  userId: string;
  categoryId: string;
}) {
  return http.request("delete", `${SYSTEM_API_BASE}/users/category-relations`, {
    data
  });
}

export function transferUserCategory(data: {
  userIds: string[];
  sourceCategoryId: string;
  targetCategoryId: string;
  reason?: string;
}) {
  return http.request("post", `${SYSTEM_API_BASE}/users/transfers`, { data });
}

export function saveUserDataExchange(id: string, data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/users/${id}/data-exchange`, {
    data
  });
}

export async function fetchUserRoles(id: string) {
  const res = await http.request<ApiResult<string[]>>(
    "get",
    `${SYSTEM_API_BASE}/users/${id}/roles`
  );
  return unwrap(res);
}

export async function fetchUserPermissions(id: string) {
  const res = await http.request<ApiResult<string[]>>(
    "get",
    `${SYSTEM_API_BASE}/users/${id}/permissions`
  );
  return unwrap(res);
}

export async function fetchUserIndexOrgs(id: string) {
  const res = await http.request<ApiResult<string[]>>(
    "get",
    `${SYSTEM_API_BASE}/users/${id}/index-orgs`
  );
  return unwrap(res);
}

export function saveUserIndexOrgs(id: string, orgIds: string[]) {
  return http.request("put", `${SYSTEM_API_BASE}/users/${id}/index-orgs`, {
    data: { orgIds }
  });
}

export function createOrg(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/orgs`, { data });
}

export function updateOrg(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/orgs/${id}`, { data });
}

export function deleteOrg(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/orgs/${id}`);
}

export function createResourceCategory(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/resource-categories`, {
    data
  });
}

export function updateResourceCategory(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/resource-categories/${id}`, {
    data
  });
}

export function deleteResourceCategory(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/resource-categories/${id}`);
}

export function createResource(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/resources`, { data });
}

export function updateResource(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/resources/${id}`, { data });
}

export function deleteResource(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/resources/${id}`);
}

export function createPermissionCategory(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/permission-categories`, {
    data
  });
}

export function updatePermissionCategory(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/permission-categories/${id}`, {
    data
  });
}

export function deletePermissionCategory(id: string) {
  return http.request(
    "delete",
    `${SYSTEM_API_BASE}/permission-categories/${id}`
  );
}

export function createPermission(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/permissions`, { data });
}

export function updatePermission(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/permissions/${id}`, { data });
}

export function deletePermission(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/permissions/${id}`);
}

export async function fetchPermissionResources(id: string) {
  const res = await http.request<ApiResult<string[]>>(
    "get",
    `${SYSTEM_API_BASE}/permissions/${id}/resources`
  );
  return unwrap(res);
}

export function authorizeUserPermissions(id: string, permissionIds: string[]) {
  return http.request("put", `${SYSTEM_API_BASE}/users/${id}/permissions`, {
    data: { permissionIds }
  });
}

export async function fetchPermissionUsers(id: string) {
  const res = await http.request<ApiResult<UserRow[]>>(
    "get",
    `${SYSTEM_API_BASE}/permissions/${id}/users`
  );
  return unwrap(res);
}

export function savePermissionUsers(id: string, userIds: string[]) {
  return http.request("put", `${SYSTEM_API_BASE}/permissions/${id}/users`, {
    data: { userIds }
  });
}

export function bindPermissionResources(id: string, resourceIds: string[]) {
  return http.request("put", `${SYSTEM_API_BASE}/permissions/${id}/resources`, {
    data: { resourceIds }
  });
}

export function createRoleCategory(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/role-categories`, { data });
}

export function updateRoleCategory(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/role-categories/${id}`, {
    data
  });
}

export function deleteRoleCategory(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/role-categories/${id}`);
}

export function createRole(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/roles`, { data });
}

export function updateRole(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/roles/${id}`, { data });
}

export function deleteRole(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/roles/${id}`);
}

export async function fetchRolePermissions(id: string) {
  const res = await http.request<ApiResult<string[]>>(
    "get",
    `${SYSTEM_API_BASE}/roles/${id}/permissions`
  );
  return unwrap(res);
}

export function authorizeRolePermissions(id: string, permissionIds: string[]) {
  return http.request("put", `${SYSTEM_API_BASE}/roles/${id}/permissions`, {
    data: { permissionIds }
  });
}

export function saveUserGroups(id: string, roleIds: string[]) {
  return http.request("put", `${SYSTEM_API_BASE}/users/${id}/roles`, {
    data: { roleIds }
  });
}

export function createMenu(data: QueryRecord) {
  return http.request("post", `${SYSTEM_API_BASE}/menus`, { data });
}

export function updateMenu(id: string, data: QueryRecord) {
  return http.request("put", `${SYSTEM_API_BASE}/menus/${id}`, { data });
}

export function deleteMenu(id: string) {
  return http.request("delete", `${SYSTEM_API_BASE}/menus/${id}`);
}

export function sortMenu(data: { id: string; direction: "up" | "down" }) {
  return http.request("patch", `${SYSTEM_API_BASE}/menus/sort`, { data });
}

export function changeMenuLevel(data: {
  id: string;
  direction: "upgrade" | "downgrade";
}) {
  return http.request("patch", `${SYSTEM_API_BASE}/menus/${data.id}/level`, {
    data
  });
}

export async function fetchMenuResources(id: string) {
  const res = await http.request<ApiResult<string[]>>(
    "get",
    `${SYSTEM_API_BASE}/menus/${id}/resources`
  );
  return unwrap(res);
}

export function bindMenuResources(id: string, resourceIds: string[]) {
  return http.request("put", `${SYSTEM_API_BASE}/menus/${id}/resources`, {
    data: { resourceIds }
  });
}

export function deleteOperationLogs(data: { monthNum: number }) {
  return http.request("delete", `${SYSTEM_API_BASE}/operation-logs`, { data });
}

export function exportUsers(params: QueryRecord) {
  return http.request<Blob>("get", `${SYSTEM_API_BASE}/users/export`, {
    params,
    responseType: "blob"
  });
}

export function exportUserPermissions(id: string) {
  return http.request<Blob>(
    "get",
    `${SYSTEM_API_BASE}/users/${id}/permissions/export`,
    { responseType: "blob" }
  );
}

export function downloadUserLicense(id: string) {
  return http.request<Blob>("get", `${SYSTEM_API_BASE}/users/${id}/license`, {
    responseType: "blob"
  });
}

export function exportOperationLogs(params: QueryRecord) {
  return http.request<Blob>("get", `${SYSTEM_API_BASE}/operation-logs/export`, {
    params,
    responseType: "blob"
  });
}
```

- [ ] **Step 4: Verify imports and types**

Run:

```bash
pnpm typecheck
```

Expected: TypeScript reports no missing imports from the new files.

- [ ] **Step 5: Commit**

```bash
git add src/api/cost/system.ts src/views/cost/system/types.ts src/views/cost/system/mock.ts
git commit -m "feat: add system management api adapter"
```

### Task 3: Add shared system tree layout

**Files:**

- Create: `E:/pure-admin-thin/src/views/cost/system/components/SystemTreePanel.vue`
- Modify: `E:/pure-admin-thin/src/style/changqing.scss`

- [ ] **Step 1: Add reusable tree component**

Create `SystemTreePanel.vue`:

```vue
<script setup lang="ts">
import type { TreeNode } from "../types";
import Add from "~icons/ri/add-circle-line";
import Refresh from "~icons/ri/refresh-line";
import Edit from "~icons/ri/edit-2-line";
import DeleteBin from "~icons/ri/delete-bin-6-line";

defineProps<{
  title: string;
  nodes: TreeNode[];
  loading?: boolean;
  editable?: boolean;
}>();

const emit = defineEmits<{
  select: [node: TreeNode];
  refresh: [];
  create: [parent?: TreeNode];
  edit: [node: TreeNode];
  remove: [node: TreeNode];
}>();

const treeProps = {
  label: (data: TreeNode) => data.name || data.text || data.code || data.id,
  children: "children"
};
</script>

<template>
  <aside class="cq-system-tree">
    <div class="cq-system-tree__header">
      <strong>{{ title }}</strong>
      <div>
        <el-button text :icon="Refresh" @click="emit('refresh')" />
        <el-button
          v-if="editable"
          text
          type="primary"
          :icon="Add"
          @click="emit('create')"
        />
      </div>
    </div>
    <el-scrollbar class="cq-system-tree__body">
      <el-tree
        v-loading="loading"
        node-key="id"
        default-expand-all
        highlight-current
        :data="nodes"
        :props="treeProps"
        @node-click="node => emit('select', node)"
      >
        <template #default="{ data }">
          <span class="cq-system-tree__node">
            <span class="cq-system-tree__label">
              {{ data.name || data.text || data.code || data.id }}
            </span>
            <span v-if="editable" class="cq-system-tree__actions">
              <el-button
                link
                type="primary"
                :icon="Add"
                @click.stop="emit('create', data)"
              />
              <el-button
                link
                type="primary"
                :icon="Edit"
                @click.stop="emit('edit', data)"
              />
              <el-button
                link
                type="danger"
                :icon="DeleteBin"
                @click.stop="emit('remove', data)"
              />
            </span>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </aside>
</template>
```

- [ ] **Step 2: Add layout CSS**

Append to `changqing.scss`:

```scss
.cq-system-layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: 12px;
  min-height: calc(100vh - 156px);
}

.cq-system-tree {
  min-width: 0;
  border: 1px solid var(--cq-border-color);
  background: #fff;
}

.cq-system-tree__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 10px 0 12px;
  border-bottom: 1px solid var(--cq-border-color);
  color: var(--cq-primary-color);
}

.cq-system-tree__body {
  height: calc(100vh - 198px);
  padding: 8px;
}

.cq-system-tree__node {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
}

.cq-system-tree__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cq-system-tree__actions {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  opacity: 0;
}

.cq-system-tree__node:hover .cq-system-tree__actions {
  opacity: 1;
}

.cq-system-main {
  min-width: 0;
}

@media (width <= 960px) {
  .cq-system-layout {
    grid-template-columns: 1fr;
  }

  .cq-system-tree__body {
    height: 260px;
  }
}
```

- [ ] **Step 3: Verify CSS compiles**

Run:

```bash
pnpm typecheck
pnpm lint:stylelint
```

Expected: no Vue prop type errors and no SCSS ordering errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/cost/system/components/SystemTreePanel.vue src/style/changqing.scss
git commit -m "feat: add system management tree layout"
```

### Task 4: Implement 用户机构管理

**Files:**

- Modify: `E:/pure-admin-thin/src/views/cost/system/user-org.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/UserFormDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/OrgFormDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/UserRelationDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/UserTransferDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/RoleSelectDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/PermissionSelectDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/UserLicenseDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/UserDataExchangeDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/UserIndexOrgDialog.vue`

- [ ] **Step 1: Build page state**

Use this state shape in `user-org.vue`:

```ts
const loading = ref(false);
const treeLoading = ref(false);
const orgTree = ref<TreeNode[]>([]);
const rows = ref<UserRow[]>([]);
const total = ref(0);
const selectedOrg = ref<TreeNode | null>(null);
const stats = reactive<UserStats>({
  normalCount: 0,
  disabledCount: 0,
  retiredCount: 0
});

const query = reactive<UserQuery>({
  page: 1,
  rows: 15,
  uid: "",
  name: "",
  userNo: "",
  timeOver: "",
  status: ""
});
```

- [ ] **Step 2: Load tree, stats, and table with mock fallback**

Import `collectTreeIds` from `types.ts`, import `fetchUserPage`, `fetchUserStats`, `fetchOrgTree` from `@/api/cost/system`, and import `mockUserPage`, `mockUserStats`, `mockOrgTree` from `./mock`. Use this behavior:

```ts
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

function selectedOrgIds() {
  return collectTreeIds(selectedOrg.value);
}

async function loadStats() {
  try {
    const data = await fetchUserStats({ ids: selectedOrgIds() });
    Object.assign(stats, data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchUserStats", error);
    }
    Object.assign(stats, mockUserStats());
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
    Object.assign(stats, mockUserStats());
  } finally {
    loading.value = false;
  }
}

function onTreeSelect(node: TreeNode) {
  selectedOrg.value = node;
  query.page = 1;
  loadData();
}
```

- [ ] **Step 3: Recreate query area**

Template must include these fields:

- 账号：`query.uid`
- 姓名：`query.name`
- 员工编号：`query.userNo`
- 账号未登录时间超过：`query.timeOver`
- 状态：`query.status`

Use:

```vue
<el-form :model="query" inline class="cq-search-form">
  <el-form-item label="账号">
    <el-input v-model="query.uid" clearable placeholder="请输入账号" />
  </el-form-item>
  <el-form-item label="姓名">
    <el-input v-model="query.name" clearable placeholder="请输入姓名" />
  </el-form-item>
  <el-form-item label="员工编号">
    <el-input v-model="query.userNo" clearable placeholder="请输入员工编号" />
  </el-form-item>
  <el-form-item label="未登录超过">
    <el-select v-model="query.timeOver" clearable placeholder="全部">
      <el-option label="30天" value="30" />
      <el-option label="60天" value="60" />
      <el-option label="90天" value="90" />
      <el-option label="180天" value="180" />
    </el-select>
  </el-form-item>
  <el-form-item label="状态">
    <el-select v-model="query.status" clearable placeholder="全部">
      <el-option label="启用" value="1" />
      <el-option label="禁用" value="0" />
      <el-option label="退休" value="2" />
    </el-select>
  </el-form-item>
</el-form>
```

- [ ] **Step 4: Recreate toolbar and stats**

Toolbar commands:

- 导出：calls `exportUsers({ ...query, ids: selectedOrgIds() })`. The `ids` value includes the selected organization and all descendant organizations.
- 新增：opens `UserFormDialog`
- 引用：opens relation dialog and later calls `saveUserCategoryRelation`
- 人员调动：opens transfer dialog and later calls `transferUserCategory`

Stats text:

```vue
<div class="cq-system-stats">
  <span>正常账号：{{ stats.normalCount }} 个</span>
  <span>禁用账号：{{ stats.disabledCount }} 个</span>
  <span>退休账号：{{ stats.retiredCount }} 个</span>
</div>
```

- [ ] **Step 5: Recreate table columns**

Use columns:

- 机构：`companyName`
- 账号：`userNo`
- 姓名：`name`
- 员工编号：`userNo`
- 邮箱：`email`
- 手机：`mobile`
- 状态：render `启用-正常使用`、`禁用`、`退休`
- 操作：edit/delete/role/permission/export-permission/reset/index-org/download/unlock/data-exchange/status-switch

Move low-frequency row actions into an `el-dropdown` once there are more than 5 visible icons.

- [ ] **Step 6: Add confirmations for destructive actions**

Use `ElMessageBox.confirm` for delete, reset password, status switch, unlock, and data exchange. Reset password success text should mention the old default password rule only if backend returns no custom message:

```ts
message("密码已重置，默认密码为 Cq123@cost#*", { type: "success" });
```

- [ ] **Step 7: Verify**

Run:

```bash
pnpm typecheck
pnpm lint:eslint
pnpm dev
```

Manual checks:

- `/cost/system/user-org` loads with left organization tree.
- Selecting an organization reloads table and stats.
- Search, reset, page size, page number work.
- Permission-gated buttons hide when `hasAuth` returns false.
- Export sends current query and selected organization id.

- [ ] **Step 8: Commit**

```bash
git add src/views/cost/system/user-org.vue src/views/cost/system/components/UserFormDialog.vue src/views/cost/system/components/OrgFormDialog.vue src/views/cost/system/components/UserRelationDialog.vue src/views/cost/system/components/UserTransferDialog.vue src/views/cost/system/components/RoleSelectDialog.vue src/views/cost/system/components/PermissionSelectDialog.vue src/views/cost/system/components/UserLicenseDialog.vue src/views/cost/system/components/UserDataExchangeDialog.vue src/views/cost/system/components/UserIndexOrgDialog.vue
git commit -m "feat: implement system user organization page"
```

### Task 5: Implement 资源管理

**Files:**

- Modify: `E:/pure-admin-thin/src/views/cost/system/resource.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/ResourceFormDialog.vue`
- Create if it does not already exist: `E:/pure-admin-thin/src/views/cost/system/components/SystemCategoryDialog.vue`

- [ ] **Step 1: Add query state**

```ts
const query = reactive({
  page: 1,
  rows: 15,
  ids: "",
  name: "",
  resource: "",
  status: ""
});

const loading = ref(false);
const treeLoading = ref(false);
const treeRows = ref<TreeNode[]>([]);
const selectedTreeNode = ref<TreeNode | null>(null);
const rows = ref<ResourceRow[]>([]);
const total = ref(0);
```

- [ ] **Step 2: Use `SystemTreePanel` with mock fallback**

Load tree with `fetchResourceTree()` first. If it throws or returns an empty array, use `mockResourceTree()`. Pass the selected node plus descendant ids as `ids`.

```ts
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
    const fallbackPage = mockResourcePage({ ...query, ids: selectedTreeIds() });
    rows.value = page.list.length > 0 ? page.list : fallbackPage.list;
    total.value = page.list.length > 0 ? page.total : fallbackPage.total;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchResourcePage", error);
    }
    const fallbackPage = mockResourcePage({ ...query, ids: selectedTreeIds() });
    rows.value = fallbackPage.list;
    total.value = fallbackPage.total;
  } finally {
    loading.value = false;
  }
}
```

- [ ] **Step 3: Render filters**

Fields:

- 名称：`name`
- 资源：`resource`
- 状态：`status`

- [ ] **Step 4: Render table**

Columns:

- 名称：`name`
- 资源：`resource`
- 类型：`type`
- 状态：`status`
- 操作：edit/delete

- [ ] **Step 5: Verify**

Run:

```bash
pnpm typecheck
pnpm lint:eslint
```

Manual checks:

- Tree selection passes selected category and descendant ids.
- Page calls `fetchResourcePage`; if the interface is unavailable or returns no records, table shows `mockResourcePage`.
- Delete calls `deleteResource` after confirmation.

- [ ] **Step 6: Commit**

```bash
git add src/views/cost/system/resource.vue src/views/cost/system/components/ResourceFormDialog.vue src/views/cost/system/components/SystemCategoryDialog.vue
git commit -m "feat: implement system resource page"
```

### Task 6: Implement 权限管理

**Files:**

- Modify: `E:/pure-admin-thin/src/views/cost/system/permission.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/PermissionFormDialog.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/PermissionUserDialog.vue`
- Modify: `E:/pure-admin-thin/src/views/cost/system/components/ResourceBindDialog.vue`
- Create if it does not already exist: `E:/pure-admin-thin/src/views/cost/system/components/SystemCategoryDialog.vue`

- [ ] **Step 1: Add query state**

```ts
const query = reactive({
  page: 1,
  rows: 15,
  ids: "",
  name: "",
  module: "",
  permission: ""
});
```

- [ ] **Step 2: Render filters**

Before rendering filters, load the permission category tree with `fetchPermissionTree()`. If it throws or returns an empty array, use `mockPermissionTree()`. For table data, call `fetchPermissionPage({ ...query, ids: selectedTreeIds() })`; if it throws or returns no records, use `mockPermissionPage({ ...query, ids: selectedTreeIds() })`.

Fields:

- 权限名称：`name`
- 模块：`module`
- 权限标识：`permission`

- [ ] **Step 3: Render table**

Columns:

- 名称：`name`
- 模块：`module`
- 类型：`type`
- 权限：`permission`
- 状态：`status`
- 说明：`description`
- 操作：edit/delete/权限用户/设置资源

- [ ] **Step 4: Implement resource binding dialog**

`ResourceBindDialog.vue` uses `fetchResourceTree()` and saves with:

```ts
await bindPermissionResources(permissionId.value, checkedResourceIds.value);
```

- [ ] **Step 5: Verify**

Run:

```bash
pnpm typecheck
pnpm lint:eslint
```

Manual checks:

- Tree filters permission category.
- Empty or failed permission APIs fall back to `mockPermissionTree` and `mockPermissionPage`.
- 设置资源 dialog loads resource tree.
- Save calls `bindPermissionResources`.

- [ ] **Step 6: Commit**

```bash
git add src/views/cost/system/permission.vue src/views/cost/system/components/PermissionFormDialog.vue src/views/cost/system/components/PermissionUserDialog.vue src/views/cost/system/components/ResourceBindDialog.vue src/views/cost/system/components/SystemCategoryDialog.vue
git commit -m "feat: implement system permission page"
```

### Task 7: Implement 角色管理

**Files:**

- Modify: `E:/pure-admin-thin/src/views/cost/system/role.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/RoleFormDialog.vue`
- Modify: `E:/pure-admin-thin/src/views/cost/system/components/PermissionSelectDialog.vue`
- Create if it does not already exist: `E:/pure-admin-thin/src/views/cost/system/components/SystemCategoryDialog.vue`

- [ ] **Step 1: Add query state**

```ts
const query = reactive({
  page: 1,
  rows: 15,
  ids: "",
  name: "",
  code: "",
  status: ""
});
```

- [ ] **Step 2: Render filters**

Before rendering filters, load the role category tree with `fetchRoleTree()`. If it throws or returns an empty array, use `mockRoleTree()`. For table data, call `fetchRolePage({ ...query, ids: selectedTreeIds() })`; if it throws or returns no records, use `mockRolePage({ ...query, ids: selectedTreeIds() })`.

Fields:

- 角色名称：`name`
- 角色编码：`code`
- 状态：`status`

- [ ] **Step 3: Render table**

Columns:

- 编码：`code`
- 名称：`name`
- 状态：`status`
- 说明：`description`
- 操作：edit/delete/授权

- [ ] **Step 4: Implement permission authorization**

Open `PermissionSelectDialog.vue` from the 授权 action. Save with:

```ts
await authorizeRolePermissions(row.id, checkedPermissionIds.value);
```

- [ ] **Step 5: Verify**

Run:

```bash
pnpm typecheck
pnpm lint:eslint
```

Manual checks:

- Page calls `fetchRolePage`; if the interface is unavailable or returns no records, table shows `mockRolePage`.
- Authorization calls `authorizeRolePermissions`.
- Role edit buttons use `system_role_edit_permission`.

- [ ] **Step 6: Commit**

```bash
git add src/views/cost/system/role.vue src/views/cost/system/components/RoleFormDialog.vue src/views/cost/system/components/PermissionSelectDialog.vue src/views/cost/system/components/SystemCategoryDialog.vue
git commit -m "feat: implement system role page"
```

### Task 8: Implement 菜单管理

**Files:**

- Modify: `E:/pure-admin-thin/src/views/cost/system/menu.vue`
- Modify: `E:/pure-admin-thin/src/views/cost/system/components/MenuFormDialog.vue`
- Modify: `E:/pure-admin-thin/src/views/cost/system/components/ResourceBindDialog.vue`
- Create if it does not already exist: `E:/pure-admin-thin/src/views/cost/system/components/SystemCategoryDialog.vue`

- [ ] **Step 1: Add query state**

```ts
const query = reactive({
  page: 1,
  rows: 15,
  ids: "",
  name: "",
  code: ""
});
```

- [ ] **Step 2: Render filters**

Before rendering filters, load the menu tree with `fetchMenuTree()`. If it throws or returns an empty array, use `mockMenuTree()`. For table data, call `fetchMenuPage({ ...query, ids: selectedTreeIds() })`; if it throws or returns no records, use `mockMenuPage({ ...query, ids: selectedTreeIds() })`.

Fields:

- 菜单名称：`name`
- 菜单编码：`code`

- [ ] **Step 3: Render table**

Columns:

- 名称：`name`
- 编码：`code`
- 地址：`url`
- 类型：`type`
- 视图：`view`
- 备注：`remark`
- 操作：edit/delete/资源授权

- [ ] **Step 4: Implement menu structure actions**

Toolbar actions:

- 新增：opens `MenuFormDialog.vue`
- 删除：calls `deleteMenu`
- 上移、下移：calls `sortMenu`
- 升级、降级：calls `changeMenuLevel`

- [ ] **Step 5: Verify**

Run:

```bash
pnpm typecheck
pnpm lint:eslint
```

Manual checks:

- Page calls `fetchMenuPage`; if the interface is unavailable or returns no records, table shows `mockMenuPage`.
- Tree calls `fetchMenuTree`; if the interface is unavailable or returns an empty tree, tree shows `mockMenuTree`.
- Edit action is visible only with `system_menu_edit_permisson`.

- [ ] **Step 6: Commit**

```bash
git add src/views/cost/system/menu.vue src/views/cost/system/components/MenuFormDialog.vue src/views/cost/system/components/ResourceBindDialog.vue src/views/cost/system/components/SystemCategoryDialog.vue
git commit -m "feat: implement system menu page"
```

### Task 9: Implement 日志管理

**Files:**

- Modify: `E:/pure-admin-thin/src/views/cost/system/log.vue`
- Create: `E:/pure-admin-thin/src/views/cost/system/components/LogDeleteDialog.vue`

- [ ] **Step 1: Add query state**

```ts
const query = reactive({
  page: 1,
  rows: 15,
  account: "",
  name: "",
  status: "",
  module: "",
  startDate: "",
  endDate: ""
});
```

- [ ] **Step 2: Render filters**

For table data, call `fetchOperationLogPage(query)` first. If it throws or returns no records, use `mockOperationLogPage(query)`.

Fields:

- 账号：`account`
- 姓名：`name`
- 状态：`status`
- 模块：`module`
- 开始时间/结束时间：date range maps to `startDate` and `endDate`

- [ ] **Step 3: Render table**

Columns:

- 账号：`account`
- 姓名：`name`
- 机构：`orgId`
- 模块：`module`
- 操作：`action`
- 区域：`area`
- 时间：`time`
- 状态：render `成功` in green for `1`, `异常` in red for `0`

- [ ] **Step 4: Add export and delete-old-log operations**

Toolbar actions:

- 导出：calls `exportOperationLogs`
- 删除旧日志：opens month input dialog and calls `deleteOperationLogs` with `monthNum`

- [ ] **Step 5: Verify**

Run:

```bash
pnpm typecheck
pnpm lint:eslint
```

Manual checks:

- Page calls `fetchOperationLogPage`; if the interface is unavailable or returns no records, table shows `mockOperationLogPage`.
- Date range sends `startDate` and `endDate`.
- Export includes current filters.

- [ ] **Step 6: Commit**

```bash
git add src/views/cost/system/log.vue src/views/cost/system/components/LogDeleteDialog.vue
git commit -m "feat: implement system operation log page"
```

### Task 10: Final UI and integration verification

**Files:**

- Review all files under `E:/pure-admin-thin/src/views/cost/system`
- Review `E:/pure-admin-thin/src/api/cost/system.ts`
- Review `E:/pure-admin-thin/src/layout/cost-menu.ts`
- Review `E:/pure-admin-thin/src/router/modules/cost.ts`
- Review `E:/pure-admin-thin/src/style/changqing.scss`

- [ ] **Step 1: Static checks**

Run:

```bash
pnpm typecheck
pnpm lint:eslint
pnpm lint:stylelint
```

Expected: all checks pass.

- [ ] **Step 2: Build check**

Run:

```bash
pnpm build
```

Expected: Vite build succeeds and no route component import fails.

- [ ] **Step 3: Browser verification**

Run:

```bash
pnpm dev
```

Open these pages:

- `http://localhost:8848/cost/system/user-org`
- `http://localhost:8848/cost/system/resource`
- `http://localhost:8848/cost/system/permission`
- `http://localhost:8848/cost/system/role`
- `http://localhost:8848/cost/system/menu`
- `http://localhost:8848/cost/system/log`

Verify:

- Top navigation highlights 系统管理.
- Left menu highlights the current page.
- Tables keep a dense Changqing admin look.
- Query forms do not overflow at 1366px and 1920px widths.
- At mobile or narrow width, tree stacks above table and controls remain usable.
- No visible text overlaps buttons, table cells, or pagination.

- [ ] **Step 4: Network and mock fallback verification**

In browser network panel, confirm:

- Table APIs call the target `/api/system/*/page` endpoints.
- Tree APIs call the target `/api/system/*/tree` endpoints.
- Mutations use the target REST methods from the Spring Boot microservice table.
- Export responses are requested as blob.
- With backend unavailable, pages still render mock trees, mock tables, stats, and pagination.
- Development console shows `[system mock fallback]` warnings only when API calls fail.

- [ ] **Step 5: Final commit**

```bash
git add src/api/cost/system.ts src/views/cost/system src/layout/cost-menu.ts src/router/modules/cost.ts src/style/changqing.scss
git commit -m "feat: complete system management module"
```

---

## Known Risks and Decisions

- `system_menu_edit_permisson` is intentionally misspelled to match legacy data.
- `system_userOrg_dataExchage_edit_permission` is intentionally misspelled to match legacy data.
- `引用` and `人员调动` are different operations. 引用 adds user-category relation; 人员调动 changes the user's organization and writes transfer history.
- Current implementation phase targets Spring Boot microservice URLs and page-level mock fallback. The old Spring MVC `.json` URLs are source mapping only unless the team explicitly chooses a legacy compatibility phase.
- While mock fallback is enabled, a legitimately empty backend result will display mock data. Remove `mock.ts` imports and fallback branches as soon as backend integration begins.
- Large organization and permission trees should be measured after backend integration. If tree render exceeds 500 ms, switch `el-tree` usage to lazy loading before adding more UI features.
- The old system has many row actions. Keep the most frequent actions visible and move secondary actions into a dropdown to avoid a cramped action column.

---

## Acceptance Criteria

- The six system management pages are reachable from the 系统管理 top menu.
- Each page preserves the old system's core workflow and interface fields.
- Backend API URLs are isolated in `src/api/cost/system.ts`; Vue components call stable frontend methods and do not hard-code either legacy `.json` URLs or future microservice routes.
- During frontend-only development, each Vue page calls its API first and uses `mock.ts` only when the API fails or returns no records.
- Permission keys match old SQL seed data.
- `pnpm typecheck`, `pnpm lint:eslint`, `pnpm lint:stylelint`, and `pnpm build` pass.
- Manual browser checks confirm no overflow or overlapping UI at common desktop widths.

---

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-05-11-system-management-vue3.md`. Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh worker per task, review between tasks, and keep commits small.
2. **Inline Execution** - Execute tasks in this session using `superpowers:executing-plans`, with checkpoints after major pages.
