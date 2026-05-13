const Layout = () => import("@/layout/index.vue");

export default {
  path: "/cost",
  name: "Cost",
  component: Layout,
  redirect: "/cost/foundation/party-work",
  meta: {
    icon: "ep:data-board",
    title: "长庆油田造价",
    rank: 0
  },
  children: [
    {
      path: "/cost/foundation/party-work",
      name: "CostFoundationPartyWork",
      component: () => import("@/views/cost/foundation/party-work.vue"),
      meta: {
        title: "党建工作",
        topMenuCode: "foundation",
        sideMenuCode: "party-work",
        auths: ["work_edit"],
        hideFooter: true,
        hiddenTag: true
      }
    },
    {
      path: "/cost/system/user-org",
      name: "CostSystemUserOrg",
      component: () => import("@/views/cost/system/user-org.vue"),
      meta: {
        title: "用户机构管理",
        topMenuCode: "system",
        sideMenuCode: "user-org",
        // v2 fix: list ALL button-level permissions so hasAuth() works for row actions
        auths: [
          "system_userOrg_view_permission",
          "system_userOrg_edit_permission",
          "system_user_unlock_permission",
          "system_userdat_download_permission",
          "system_userOrg_dataExchage_edit_permission"
        ],
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
        auths: [
          "system_resource_view_permission",
          "system_resource_edit_permission"
        ],
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
        auths: ["system_role_view_permission", "system_role_edit_permission"],
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
        // note: "system_menu_edit_permisson" is misspelled in legacy SQL seed data
        auths: ["system_menu_view_permission", "system_menu_edit_permisson"],
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
  ]
} satisfies RouteConfigsTable;
