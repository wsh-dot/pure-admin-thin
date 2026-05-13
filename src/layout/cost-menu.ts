export interface CostMenuItem {
  code: string;
  title: string;
  path?: string;
  icon?: string;
  auths?: string[];
  children?: CostMenuItem[];
}

export const costMenus: CostMenuItem[] = [
  { code: "desktop", title: "我的桌面", path: "/welcome" },
  { code: "compile", title: "造价编制", path: "/project-workbench/index" },
  { code: "audit", title: "造价审核", children: [] },
  { code: "manage", title: "造价管理", children: [] },
  { code: "price", title: "价格管理", children: [] },
  { code: "qualification", title: "资质管理", children: [] },
  {
    code: "foundation",
    title: "基础工作",
    children: [
      {
        code: "party",
        title: "党建工作",
        children: [
          {
            code: "party-work",
            title: "党建工作",
            path: "/cost/foundation/party-work",
            auths: ["work_edit"]
          }
        ]
      },
      {
        code: "info-maintenance",
        title: "信息维护",
        path: "/cost/foundation/info"
      },
      {
        code: "department-profile",
        title: "部门概况",
        path: "/cost/foundation/department"
      },
      {
        code: "work-summary",
        title: "工作总结",
        path: "/cost/foundation/summary"
      },
      {
        code: "department-honor",
        title: "部门荣誉",
        path: "/cost/foundation/honor"
      },
      {
        code: "system-compile",
        title: "制度汇编",
        path: "/cost/foundation/institution"
      }
    ]
  },
  { code: "evaluation", title: "考评管理", children: [] },
  { code: "business", title: "业务交流", children: [] },
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
];

export function findFirstLeaf(menu?: CostMenuItem): CostMenuItem | undefined {
  if (!menu) return undefined;
  if (menu.path) return menu;

  for (const child of menu.children ?? []) {
    const leaf = findFirstLeaf(child);
    if (leaf) return leaf;
  }
}

export function findMenuByPath(
  menus: CostMenuItem[],
  path: string,
  parents: CostMenuItem[] = []
): { item: CostMenuItem; parents: CostMenuItem[] } | undefined {
  for (const menu of menus) {
    const nextParents = [...parents, menu];
    if (menu.path === path) return { item: menu, parents };

    const found = findMenuByPath(menu.children ?? [], path, nextParents);
    if (found) return found;
  }
}
