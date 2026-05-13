export interface SystemPage<T> {
  list: T[];
  total: number;
}

export interface PageQuery {
  pageNo: number;
  pageSize: number;
}

export interface TreeNode {
  id: string;
  parentId?: string;
  name?: string;
  label?: string;
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
  lastLoginDays?: number;
}

export interface UserStats {
  normalCount: number;
  disabledCount: number;
  retiredCount: number;
}

export interface ResourceRow {
  id: string;
  categoryId?: string;
  name: string;
  module?: string;
  resource: string;
  type: string;
  status: string;
  description?: string;
}

export interface PermissionRow {
  id: string;
  categoryId?: string;
  name: string;
  module: string;
  type: string;
  permission: string;
  status: string;
  description?: string;
}

export interface RoleRow {
  id: string;
  categoryId?: string;
  code: string;
  name: string;
  status: string;
  description?: string;
}

export interface MenuRow {
  id: string;
  categoryId?: string;
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
