const Layout = () => import("@/layout/index.vue");

export default {
  path: "/project-workbench",
  name: "ProjectWorkbench",
  component: Layout,
  redirect: "/project-workbench/index",
  meta: {
    icon: "ep:data-board",
    title: "在线造价",
    rank: 1
  },
  children: [
    {
      path: "/project-workbench/index",
      name: "ProjectWorkbenchIndex",
      component: () => import("@/views/cost/project-management/index.vue"),
      meta: {
        title: "项目管理工作台",
        hideFooter: true
      }
    },
    {
      path: "/project-workbench/budget-book",
      name: "ProjectWorkbenchBudgetBook",
      component: () =>
        import("@/views/cost/project-management/budget-book.vue"),
      meta: {
        title: "预算书工作区",
        showLink: false,
        hiddenTag: true,
        activePath: "/project-workbench/index",
        hideFooter: true
      }
    }
  ]
} satisfies RouteConfigsTable;
