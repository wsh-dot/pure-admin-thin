<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useCostMenu } from "@/layout/hooks/useCostMenu";
import type { CostMenuItem } from "@/layout/cost-menu";
import ArrowRight from "~icons/ri/arrow-right-s-line";
import FolderLine from "~icons/ri/folder-2-line";
import FileList from "~icons/ri/file-list-3-line";

const { activeTopMenu, activeSideCode, leftMenus, pushMenu } = useCostMenu();
const opened = ref<Record<string, boolean>>({});

const hasMenu = computed(() => leftMenus.value.length > 0);

function isActive(menu: CostMenuItem) {
  return activeSideCode.value === menu.code;
}

function toggle(menu: CostMenuItem) {
  if (menu.children?.length) {
    opened.value[menu.code] = !opened.value[menu.code];
    return;
  }
  pushMenu(menu);
}

function openParents(items: CostMenuItem[]) {
  for (const item of items) {
    if (item.children?.some(child => child.code === activeSideCode.value)) {
      opened.value[item.code] = true;
    }
    if (item.children) openParents(item.children);
  }
}

watch(
  () => [activeTopMenu.value?.code, activeSideCode.value],
  () => {
    opened.value = {};
    openParents(leftMenus.value);
  },
  { immediate: true }
);
</script>

<template>
  <aside class="sidebar-container cq-sidebar-nav">
    <div class="cq-side-title">{{ activeTopMenu?.title || "业务菜单" }}</div>

    <el-scrollbar class="cq-side-scroll">
      <div v-if="hasMenu" class="cq-side-tree">
        <div v-for="menu in leftMenus" :key="menu.code" class="cq-side-node">
          <button
            type="button"
            class="cq-side-item is-parent"
            :class="{ active: isActive(menu), open: opened[menu.code] }"
            @click="toggle(menu)"
          >
            <IconifyIconOffline :icon="FolderLine" />
            <span>{{ menu.title }}</span>
            <IconifyIconOffline
              v-if="menu.children?.length"
              class="cq-side-arrow"
              :icon="ArrowRight"
            />
          </button>

          <div v-if="menu.children?.length" v-show="opened[menu.code]">
            <button
              v-for="child in menu.children"
              :key="child.code"
              type="button"
              class="cq-side-item is-child"
              :class="{ active: isActive(child) }"
              @click="pushMenu(child)"
            >
              <IconifyIconOffline :icon="FileList" />
              <span>{{ child.title }}</span>
            </button>
          </div>
        </div>
      </div>

      <el-empty
        v-else
        description="该模块暂无菜单"
        :image-size="72"
        class="cq-side-empty"
      />
    </el-scrollbar>
  </aside>
</template>
