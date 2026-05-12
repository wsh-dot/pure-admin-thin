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
    }
  ]
} satisfies RouteConfigsTable;
