<script setup lang="ts">
import "animate.css";
import "@/components/ReIcon/src/offlineIcon";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useResizeObserver } from "@pureadmin/utils";
import { useAppStoreHook } from "@/store/modules/app";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { useGlobal } from "@pureadmin/utils";
import LayNavbar from "./components/lay-navbar/index.vue";
import LayContent from "./components/lay-content/index.vue";
import NavVertical from "./components/lay-sidebar/NavVertical.vue";
import NavHorizontal from "./components/lay-sidebar/NavHorizontal.vue";

const appWrapperRef = ref<HTMLDivElement>();
const leftWidth = ref(180);
const dragging = ref(false);
const { $storage } = useGlobal<GlobalPropertiesApi>();

const layoutStyle = computed(() => ({
  "--cq-side-width": `${leftWidth.value}px`
}));

function clampWidth(value: number) {
  return Math.max(0, Math.min(value, window.innerWidth));
}

function onResizeMove(event: MouseEvent) {
  if (!dragging.value) return;
  leftWidth.value = clampWidth(event.clientX);
}

function stopResize() {
  dragging.value = false;
  document.body.classList.remove("cq-resizing");
  window.removeEventListener("mousemove", onResizeMove);
  window.removeEventListener("mouseup", stopResize);
}

function startResize(event: MouseEvent) {
  event.preventDefault();
  dragging.value = true;
  document.body.classList.add("cq-resizing");
  window.addEventListener("mousemove", onResizeMove);
  window.addEventListener("mouseup", stopResize);
}

useResizeObserver(appWrapperRef, entries => {
  const entry = entries[0];
  const [{ inlineSize: width, blockSize: height }] = entry.borderBoxSize;
  useAppStoreHook().setViewportSize({ width, height });
  useAppStoreHook().toggleDevice(width <= 760 ? "mobile" : "desktop");
});

onMounted(() => {
  window.document.body.setAttribute("layout", "vertical");
});

onBeforeUnmount(() => {
  stopResize();
});

useDataThemeChange().dataThemeChange($storage.layout?.overallStyle);
</script>

<template>
  <div
    ref="appWrapperRef"
    class="app-wrapper cq-app"
    :class="{ 'is-resizing': dragging }"
    :style="layoutStyle"
  >
    <header class="cq-header">
      <LayNavbar />
      <NavHorizontal />
    </header>

    <NavVertical />
    <button
      class="cq-resize-handle"
      type="button"
      aria-label="调整左侧菜单宽度"
      @mousedown="startResize"
    />

    <main class="main-container cq-main">
      <LayContent :fixed-header="false" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}
</style>
