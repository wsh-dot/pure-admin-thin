import { http } from "@/utils/http";
import type {
  MenuRow,
  OperationLogRow,
  PermissionRow,
  ResourceRow,
  RoleRow,
  SystemPage,
  TreeNode,
  UserQuery,
  UserRow,
  UserStats
} from "@/views/cost/system/types";

type QueryRecord = object;

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

const SYSTEM_API_BASE =
  (import.meta.env.VITE_SYSTEM_API_BASE as string | undefined) ?? "/api/system";

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
  const tree = unwrap(res);
  return Array.isArray(tree) ? tree : [];
}

export async function fetchUserPage(params: UserQuery) {
  const res = await http.request<ApiResult<ApiPage<UserRow>>>(
    "get",
    `${SYSTEM_API_BASE}/users/page`,
    { params }
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
    { params }
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
    { params }
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
    { params }
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
    { params }
  );

  return normalizePage<MenuRow>(res);
}

export async function fetchOperationLogPage(params: QueryRecord) {
  const res = await http.request<ApiResult<ApiPage<OperationLogRow>>>(
    "get",
    `${SYSTEM_API_BASE}/operation-logs/page`,
    { params }
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
