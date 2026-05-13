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
} from "./types";

type QueryRecord = object;

const moduleTree: TreeNode[] = [
  { id: "desktop", name: "我的桌面" },
  { id: "compile", name: "造价编制" },
  { id: "audit", name: "造价审核" },
  { id: "manage", name: "造价管理" },
  { id: "price", name: "价格管理" },
  {
    id: "foundation",
    name: "基础工作",
    children: [
      { id: "foundation-party", name: "党建工作", parentId: "foundation" },
      { id: "foundation-info", name: "信息维护", parentId: "foundation" },
      { id: "foundation-dept", name: "部门概况", parentId: "foundation" },
      { id: "foundation-summary", name: "工作总结", parentId: "foundation" }
    ]
  },
  { id: "archive", name: "档案管理" },
  { id: "evaluation", name: "考评管理" },
  { id: "business", name: "业务交流" },
  {
    id: "system",
    name: "系统管理",
    children: [
      { id: "system-user-org", name: "用户机构管理", parentId: "system" },
      { id: "system-resource", name: "资源管理", parentId: "system" },
      { id: "system-permission", name: "权限管理", parentId: "system" },
      { id: "system-role", name: "角色管理", parentId: "system" },
      { id: "system-menu", name: "菜单管理", parentId: "system" },
      { id: "system-log", name: "日志管理", parentId: "system" }
    ]
  }
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
    email: "zxz@cq.com",
    mobile: "13800001001",
    qualificationNo: "QC-2021-0001",
    status: "1",
    staffState: "1",
    isBorrowed: "0",
    isRela: "0",
    lastLoginDays: 12
  },
  {
    id: "u-2",
    companyName: "第三采油厂",
    companyID: "org-build-3",
    categoryId: "org-build-3",
    uid: "00008326",
    userNo: "00008326",
    name: "刘长军",
    email: "-",
    mobile: "13800001002",
    qualificationNo: "",
    status: "1",
    staffState: "1",
    isBorrowed: "0",
    isRela: "0",
    lastLoginDays: 45
  },
  {
    id: "u-3",
    companyName: "工程造价部",
    companyID: "org-cost",
    categoryId: "org-cost",
    uid: "00008327",
    userNo: "00008327",
    name: "王海军",
    email: "whj@cq.com",
    mobile: "13800001003",
    status: "1",
    staffState: "2",
    isBorrowed: "0",
    isRela: "0",
    lastLoginDays: 186
  },
  {
    id: "u-4",
    companyName: "审计中心",
    companyID: "org-audit",
    categoryId: "org-audit",
    uid: "00008328",
    userNo: "00008328",
    name: "李敏",
    email: "lim@cq.com",
    mobile: "-",
    status: "0",
    staffState: "1",
    isBorrowed: "0",
    isRela: "0",
    lastLoginDays: 93
  },
  {
    id: "u-5",
    companyName: "咨询公司",
    companyID: "org-consult",
    categoryId: "org-consult",
    uid: "00008329",
    userNo: "00008329",
    name: "赵静",
    email: "zj@cq.com",
    mobile: "13800001005",
    status: "1",
    staffState: "1",
    isBorrowed: "1",
    isRela: "0",
    lastLoginDays: 61
  },
  {
    id: "u-6",
    companyName: "建设单位",
    companyID: "org-build",
    categoryId: "org-build",
    uid: "00008330",
    userNo: "00008330",
    name: "周宁",
    email: "zn@cq.com",
    mobile: "13800001006",
    status: "1",
    staffState: "1",
    isBorrowed: "0",
    isRela: "1",
    lastLoginDays: 8
  },
  {
    id: "u-7",
    companyName: "设计单位-勘查院",
    companyID: "org-design-survey",
    categoryId: "org-design-survey",
    uid: "00008331",
    userNo: "00008331",
    name: "孙洁",
    email: "sj@cq.com",
    mobile: "13800001007",
    status: "1",
    staffState: "1",
    isBorrowed: "0",
    isRela: "0",
    lastLoginDays: 31
  },
  {
    id: "u-8",
    companyName: "施工单位-中石油建安50号",
    companyID: "org-work-50",
    categoryId: "org-work-50",
    uid: "00008332",
    userNo: "00008332",
    name: "陈刚",
    email: "-",
    mobile: "-",
    status: "0",
    staffState: "1",
    isBorrowed: "0",
    isRela: "0",
    lastLoginDays: 220
  }
];

const resourceRows: ResourceRow[] = [
  {
    id: "res-1",
    categoryId: "manage",
    name: "工程结算-查看",
    module: "manage",
    resource: "account_balance_view_resource",
    type: "TAG",
    status: "1",
    description: "工程结算查看权限"
  },
  {
    id: "res-2",
    categoryId: "manage",
    name: "工程结算-编辑",
    module: "manage",
    resource: "account_balance_edit_resource",
    type: "TAG",
    status: "1",
    description: "工程结算编辑权限"
  },
  {
    id: "res-3",
    categoryId: "foundation",
    name: "项目预算-查看",
    module: "foundation",
    resource: "project_budget_view_resource",
    type: "BTN",
    status: "1",
    description: "项目预算查看权限"
  },
  {
    id: "res-4",
    categoryId: "foundation",
    name: "项目预算-导出",
    module: "foundation",
    resource: "project_budget_export_resource",
    type: "BTN",
    status: "0",
    description: "项目预算导出权限"
  }
];

const permissionRows: PermissionRow[] = [
  {
    id: "perm-1",
    categoryId: "compile",
    name: "编制包组组长",
    module: "costbs",
    type: "TAG",
    permission: "costbs_bdys_zjb_bzbzzz_permission",
    status: "1",
    description: "负责预算编制包组的组长权限"
  },
  {
    id: "perm-2",
    categoryId: "audit",
    name: "审核员",
    module: "costaudit",
    type: "TAG",
    permission: "costaudit_zsbg_shr_permission",
    status: "1",
    description: "负责项目审核"
  },
  {
    id: "perm-3",
    categoryId: "price",
    name: "价格库查看者",
    module: "costprice",
    type: "BTN",
    permission: "costprice_view_permission",
    status: "0",
    description: "-"
  }
];

const roleRows: RoleRow[] = [
  {
    id: "role-1",
    categoryId: "role-admin-super",
    code: "000",
    name: "系统初始化角色",
    status: "1",
    description: "默认所有人都具有的权限"
  },
  {
    id: "role-2",
    categoryId: "role-admin-ops",
    code: "001",
    name: "系统管理员",
    status: "1",
    description: "拥有全部后台管理权限"
  },
  {
    id: "role-3",
    categoryId: "role-business-editor",
    code: "010",
    name: "预算编制人",
    status: "1",
    description: "-"
  },
  {
    id: "role-4",
    categoryId: "role-business-auditor",
    code: "011",
    name: "审计审核人",
    status: "0",
    description: "已停用"
  }
];

const menuRows: MenuRow[] = [
  {
    id: "menu-1",
    categoryId: "desktop",
    name: "我的桌面",
    code: "01",
    url: "/cost/desktop/index.html",
    type: "0",
    view: "1"
  },
  {
    id: "menu-2",
    categoryId: "compile",
    name: "造价编制",
    code: "02",
    url: "/cost/compile/index",
    type: "0",
    view: "1"
  },
  {
    id: "menu-3",
    categoryId: "audit",
    name: "造价审核",
    code: "03",
    url: "/cost/audit/index",
    type: "0",
    view: "1"
  },
  {
    id: "menu-4",
    categoryId: "price",
    name: "价格管理",
    code: "04",
    url: "/cost/price/index",
    type: "0",
    view: "1",
    remark: "指导价、信息价、市场价集中管理"
  },
  {
    id: "menu-5",
    categoryId: "system",
    name: "系统管理",
    code: "99",
    url: "/cost/system/user-org",
    type: "0",
    view: "1"
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
  },
  {
    id: "log-2",
    account: "80228400",
    name: "张新政",
    orgId: "设计单位",
    module: "预算书",
    action: "保存",
    area: "西安",
    time: "2026-05-11 10:08:21",
    status: "1",
    description: "保存预算书 PROJ-2026-001"
  },
  {
    id: "log-3",
    account: "00008328",
    name: "李敏",
    orgId: "审计中心",
    module: "权限管理",
    action: "分配权限",
    area: "西安",
    time: "2026-05-11 10:30:00",
    status: "0",
    description: "权限不足，拒绝分配"
  },
  {
    id: "log-4",
    account: "admin",
    name: "系统管理员",
    orgId: "长庆油田分公司",
    module: "菜单管理",
    action: "修改菜单",
    area: "西安",
    time: "2026-05-11 11:00:00",
    status: "1",
    description: "修改菜单 menu-3 的排序"
  }
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function queryValue(query: QueryRecord, key: string) {
  return (query as Record<string, unknown>)[key];
}

function paginate<T>(rows: T[], query: QueryRecord): SystemPage<T> {
  const pageNo = Number(queryValue(query, "pageNo") || 1);
  const pageSize = Number(queryValue(query, "pageSize") || 15);
  const start = (pageNo - 1) * pageSize;

  return {
    list: clone(rows).slice(start, start + pageSize),
    total: rows.length
  };
}

function includesText(value: unknown, keyword?: unknown) {
  if (!keyword) return true;

  return String(value ?? "")
    .toLowerCase()
    .includes(String(keyword).trim().toLowerCase());
}

function idsFromQuery(query: QueryRecord) {
  return String(queryValue(query, "ids") ?? "")
    .split(",")
    .map(id => id.trim())
    .filter(Boolean);
}

function matchesTree(categoryId: string | undefined, query: QueryRecord) {
  const ids = idsFromQuery(query);
  return ids.length === 0 || (!!categoryId && ids.includes(categoryId));
}

function matchesUserStatus(row: UserRow, status?: string) {
  if (!status) return true;
  if (status === "2") return row.staffState === "2";
  return row.status === status;
}

function matchesTimeOver(row: UserRow, timeOver?: string) {
  if (!timeOver) return true;
  return Number(row.lastLoginDays ?? 0) >= Number(timeOver);
}

function matchesDateRange(
  time: string,
  startDate?: unknown,
  endDate?: unknown
) {
  const date = time.slice(0, 10);
  const start = String(startDate ?? "");
  const end = String(endDate ?? "");
  return (!start || date >= start) && (!end || date <= end);
}

export function mockOrgTree(): TreeNode[] {
  return [
    {
      id: "org-root",
      name: "长庆油田分公司",
      children: [
        { id: "org-cost", name: "工程造价部" },
        { id: "org-audit", name: "审计中心" },
        {
          id: "org-design",
          name: "设计单位",
          children: [
            { id: "org-design-cqdy", name: "长庆工程设计院" },
            { id: "org-design-survey", name: "勘查院" }
          ]
        },
        {
          id: "org-build",
          name: "建设单位",
          children: [
            { id: "org-build-1", name: "第一采油厂" },
            { id: "org-build-2", name: "第二采油厂" },
            { id: "org-build-3", name: "第三采油厂" }
          ]
        },
        {
          id: "org-work",
          name: "施工单位",
          children: [
            { id: "org-work-50", name: "中石油建安50号" },
            { id: "org-work-70", name: "中石油建安70号" }
          ]
        },
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
  return [
    {
      id: "role-admin",
      name: "系统管理员",
      children: [
        { id: "role-admin-super", name: "超级管理员", parentId: "role-admin" },
        { id: "role-admin-ops", name: "运维管理员", parentId: "role-admin" }
      ]
    },
    {
      id: "role-business",
      name: "业务角色",
      children: [
        {
          id: "role-business-editor",
          name: "编辑员",
          parentId: "role-business"
        },
        {
          id: "role-business-auditor",
          name: "审核员",
          parentId: "role-business"
        }
      ]
    },
    { id: "role-readonly", name: "只读角色" }
  ];
}

export function mockMenuTree(): TreeNode[] {
  return clone(moduleTree);
}

export function mockAssignableResourceTree(): TreeNode[] {
  return [
    {
      id: "resource-manage",
      name: "造价管理资源",
      children: resourceRows
        .filter(row => row.categoryId === "manage")
        .map(row => ({ id: row.id, name: row.name, leaf: true }))
    },
    {
      id: "resource-foundation",
      name: "基础工作资源",
      children: resourceRows
        .filter(row => row.categoryId === "foundation")
        .map(row => ({ id: row.id, name: row.name, leaf: true }))
    }
  ];
}

export function mockAssignablePermissionTree(): TreeNode[] {
  return [
    {
      id: "permission-compile",
      name: "造价编制权限",
      children: permissionRows
        .filter(row => row.categoryId === "compile")
        .map(row => ({ id: row.id, name: row.name, leaf: true }))
    },
    {
      id: "permission-audit",
      name: "审核权限",
      children: permissionRows
        .filter(row => row.categoryId === "audit")
        .map(row => ({ id: row.id, name: row.name, leaf: true }))
    },
    {
      id: "permission-price",
      name: "价格权限",
      children: permissionRows
        .filter(row => row.categoryId === "price")
        .map(row => ({ id: row.id, name: row.name, leaf: true }))
    }
  ];
}

export function mockAssignableRoleTree(): TreeNode[] {
  return [
    {
      id: "assignable-role-admin",
      name: "系统管理角色",
      children: roleRows
        .filter(row => row.categoryId?.startsWith("role-admin"))
        .map(row => ({ id: row.id, name: row.name, leaf: true }))
    },
    {
      id: "assignable-role-business",
      name: "业务角色",
      children: roleRows
        .filter(row => row.categoryId?.startsWith("role-business"))
        .map(row => ({ id: row.id, name: row.name, leaf: true }))
    }
  ];
}

export function mockUserPage(query: UserQuery): SystemPage<UserRow> {
  const filtered = userRows.filter(
    row =>
      matchesTree(row.categoryId, query) &&
      includesText(row.uid, query.uid) &&
      includesText(row.name, query.name) &&
      includesText(row.userNo, query.userNo) &&
      matchesUserStatus(row, query.status) &&
      matchesTimeOver(row, query.timeOver)
  );

  return paginate(filtered, query);
}

export function mockUserStats(
  query: UserQuery = { pageNo: 1, pageSize: 9999 }
): UserStats {
  const filtered = mockUserPage({ ...query, pageNo: 1, pageSize: 9999 }).list;

  return {
    normalCount: filtered.filter(
      row => row.status === "1" && row.staffState !== "2"
    ).length,
    disabledCount: filtered.filter(row => row.status === "0").length,
    retiredCount: filtered.filter(row => row.staffState === "2").length
  };
}

export function mockResourcePage(query: QueryRecord): SystemPage<ResourceRow> {
  const filtered = resourceRows.filter(
    row =>
      matchesTree(row.categoryId, query) &&
      includesText(row.name, queryValue(query, "name")) &&
      includesText(row.resource, queryValue(query, "resource")) &&
      (!queryValue(query, "status") ||
        row.status === queryValue(query, "status"))
  );

  return paginate(filtered, query);
}

export function mockPermissionPage(
  query: QueryRecord
): SystemPage<PermissionRow> {
  const filtered = permissionRows.filter(
    row =>
      matchesTree(row.categoryId, query) &&
      includesText(row.name, queryValue(query, "name")) &&
      includesText(row.module, queryValue(query, "module")) &&
      includesText(row.permission, queryValue(query, "permission"))
  );

  return paginate(filtered, query);
}

export function mockRolePage(query: QueryRecord): SystemPage<RoleRow> {
  const filtered = roleRows.filter(
    row =>
      matchesTree(row.categoryId, query) &&
      includesText(row.name, queryValue(query, "name")) &&
      includesText(row.code, queryValue(query, "code")) &&
      (!queryValue(query, "status") ||
        row.status === queryValue(query, "status"))
  );

  return paginate(filtered, query);
}

export function mockMenuPage(query: QueryRecord): SystemPage<MenuRow> {
  const filtered = menuRows.filter(
    row =>
      matchesTree(row.categoryId, query) &&
      includesText(row.name, queryValue(query, "name")) &&
      includesText(row.code, queryValue(query, "code"))
  );

  return paginate(filtered, query);
}

export function mockOperationLogPage(
  query: QueryRecord
): SystemPage<OperationLogRow> {
  const filtered = logRows.filter(
    row =>
      includesText(row.account, queryValue(query, "account")) &&
      includesText(row.name, queryValue(query, "name")) &&
      includesText(row.module, queryValue(query, "module")) &&
      (!queryValue(query, "status") ||
        row.status === queryValue(query, "status")) &&
      matchesDateRange(
        row.time,
        queryValue(query, "startDate"),
        queryValue(query, "endDate")
      )
  );

  return paginate(filtered, query);
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

export function mockUpsertUser(row: UserRow) {
  const index = userRows.findIndex(item => item.id === row.id);
  if (index > -1) userRows.splice(index, 1, row);
  else userRows.unshift({ ...row, id: row.id || `u-${Date.now()}` });
}

export function mockRemoveUser(id: string) {
  const index = userRows.findIndex(item => item.id === id);
  if (index > -1) userRows.splice(index, 1);
}

export function mockUpsertResource(row: ResourceRow) {
  const index = resourceRows.findIndex(item => item.id === row.id);
  if (index > -1) resourceRows.splice(index, 1, row);
  else resourceRows.unshift({ ...row, id: row.id || `res-${Date.now()}` });
}

export function mockRemoveResource(id: string) {
  const index = resourceRows.findIndex(item => item.id === id);
  if (index > -1) resourceRows.splice(index, 1);
}

export function mockUpsertPermission(row: PermissionRow) {
  const index = permissionRows.findIndex(item => item.id === row.id);
  if (index > -1) permissionRows.splice(index, 1, row);
  else permissionRows.unshift({ ...row, id: row.id || `perm-${Date.now()}` });
}

export function mockRemovePermission(id: string) {
  const index = permissionRows.findIndex(item => item.id === id);
  if (index > -1) permissionRows.splice(index, 1);
}

export function mockUpsertRole(row: RoleRow) {
  const index = roleRows.findIndex(item => item.id === row.id);
  if (index > -1) roleRows.splice(index, 1, row);
  else roleRows.unshift({ ...row, id: row.id || `role-${Date.now()}` });
}

export function mockRemoveRole(id: string) {
  const index = roleRows.findIndex(item => item.id === id);
  if (index > -1) roleRows.splice(index, 1);
}

export function mockUpsertMenu(row: MenuRow) {
  const index = menuRows.findIndex(item => item.id === row.id);
  if (index > -1) menuRows.splice(index, 1, row);
  else menuRows.unshift({ ...row, id: row.id || `menu-${Date.now()}` });
}

export function mockRemoveMenu(id: string) {
  const index = menuRows.findIndex(item => item.id === id);
  if (index > -1) menuRows.splice(index, 1);
}

export function mockRemoveOperationLogs(monthNum: number) {
  logRows.length = 0;
  return monthNum;
}
