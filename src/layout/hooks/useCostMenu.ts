import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  costMenus,
  findFirstLeaf,
  findMenuByPath,
  type CostMenuItem
} from "@/layout/cost-menu";

function hasChildren(menu?: CostMenuItem) {
  return Boolean(menu?.children?.length);
}

export function useCostMenu() {
  const route = useRoute();
  const router = useRouter();

  const activeTopCode = computed(() => {
    const metaTopCode = route.meta?.topMenuCode as string | undefined;
    if (metaTopCode) return metaTopCode;

    const found = findMenuByPath(costMenus, route.path);
    return found?.parents[0]?.code ?? found?.item.code ?? "desktop";
  });

  const activeSideCode = computed(() => {
    const metaSideCode = route.meta?.sideMenuCode as string | undefined;
    if (metaSideCode) return metaSideCode;

    return findMenuByPath(costMenus, route.path)?.item.code ?? "";
  });

  const activeTopMenu = computed(() => {
    return costMenus.find(menu => menu.code === activeTopCode.value);
  });

  const leftMenus = computed(() => activeTopMenu.value?.children ?? []);

  function pushMenu(menu?: CostMenuItem) {
    if (!menu) return;
    const target = menu.path ? menu : findFirstLeaf(menu);
    if (target?.path && target.path !== route.path) {
      router.push(target.path);
    }
  }

  function selectTopMenu(menu: CostMenuItem) {
    if (menu.path || hasChildren(menu)) {
      pushMenu(menu);
    }
  }

  return {
    costMenus,
    activeTopCode,
    activeSideCode,
    activeTopMenu,
    leftMenus,
    pushMenu,
    selectTopMenu
  };
}
