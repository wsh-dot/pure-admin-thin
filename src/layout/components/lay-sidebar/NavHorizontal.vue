<script setup lang="ts">
import { useCostClock } from "@/layout/hooks/useCostClock";
import { useCostMenu } from "@/layout/hooks/useCostMenu";
import TimeLine from "~icons/ri/time-line";

const { dateText } = useCostClock();
const { costMenus, activeTopCode, selectTopMenu } = useCostMenu();
</script>

<template>
  <div class="cq-top-menu">
    <div class="cq-top-menu-scroll" role="menubar" aria-label="一级业务菜单">
      <button
        v-for="menu in costMenus"
        :key="menu.code"
        type="button"
        role="menuitem"
        :class="{ active: activeTopCode === menu.code }"
        @click="selectTopMenu(menu)"
      >
        {{ menu.title }}
      </button>
    </div>

    <div class="cq-clock">
      <IconifyIconOffline :icon="TimeLine" />
      <span>{{ dateText }}</span>
    </div>
  </div>
</template>
