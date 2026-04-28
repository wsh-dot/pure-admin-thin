<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";
import type {
  ReportBundle,
  ReportDocument,
  ReportPageData,
  ReportWorkspaceContext
} from "../types";

defineOptions({
  name: "ProjectReportWorkspace"
});

const props = defineProps<{
  activeMainTab: string;
  workTabs: readonly string[];
  context: ReportWorkspaceContext | null;
}>();

const emit = defineEmits<{
  (event: "tab-click", tab: string): void;
}>();

const PREVIEW_PADDING = 32;

const selectedLoadedItemId = ref("");
const selectedDocumentId = ref("");
const selectedTreeNodeId = ref("");
const currentPageIndex = ref(0);
const previewScale = ref(1);
const previewViewportRef = ref<HTMLElement | null>(null);

const currentBundle = computed<ReportBundle | null>(() => {
  if (!props.context) return null;
  return (
    props.context.bundles.find(
      bundle => bundle.loadedItem.id === selectedLoadedItemId.value
    ) ??
    props.context.bundles[0] ??
    null
  );
});

const currentDocument = computed<ReportDocument | null>(() => {
  if (!currentBundle.value || !selectedDocumentId.value) return null;
  return (
    currentBundle.value.documents.find(
      document => document.id === selectedDocumentId.value
    ) ?? null
  );
});

const currentPage = computed<ReportPageData | null>(() => {
  if (!currentDocument.value) return null;
  return currentDocument.value.pages[currentPageIndex.value] ?? null;
});

const currentPreviewMode = computed<"fit-page" | "fit-width">(() => {
  if (!currentPage.value) return "fit-page";

  switch (currentPage.value.templateType) {
    case "cover":
    case "directory":
    case "narrative":
    case "approval":
      return "fit-page";
    default:
      return "fit-width";
  }
});

const currentPaperSize = computed(() => {
  if (!currentPage.value) {
    return { width: 980, height: 1120 };
  }

  switch (currentPage.value.templateType) {
    case "cover":
      return { width: 980, height: 860 };
    case "directory":
    case "narrative":
      return { width: 1020, height: 860 };
    case "approval":
      return { width: 1280, height: 860 };
    default:
      return { width: 1320, height: 860 };
  }
});

const currentPreviewProfile = computed<
  "cover" | "directory" | "narrative" | "table" | "approval"
>(() => {
  if (!currentPage.value) return "table";
  return currentPage.value.templateType;
});

watch(
  () => props.context,
  context => {
    selectedLoadedItemId.value = context?.defaultLoadedItemId ?? "";
    selectedDocumentId.value = "";
    selectedTreeNodeId.value = "";
    currentPageIndex.value = 0;
  },
  { immediate: true }
);

watch(selectedLoadedItemId, () => {
  selectedDocumentId.value = "";
  selectedTreeNodeId.value = "";
  currentPageIndex.value = 0;
});

watch(
  currentPage,
  async () => {
    await nextTick();
    updatePreviewScale();
  },
  { immediate: true }
);

let resizeObserver: ResizeObserver | null = null;

function updatePreviewScale() {
  const viewport = previewViewportRef.value;

  if (!viewport || !currentPage.value) {
    previewScale.value = 1;
    return;
  }

  const availableWidth = Math.max(
    viewport.clientWidth - PREVIEW_PADDING * 2,
    0
  );
  const availableHeight = Math.max(
    viewport.clientHeight - PREVIEW_PADDING * 2,
    0
  );

  if (!availableWidth || !availableHeight) {
    previewScale.value = 1;
    return;
  }

  previewScale.value = Math.min(
    availableWidth / currentPaperSize.value.width,
    availableHeight / currentPaperSize.value.height,
    1
  );
}

function handleTabClick(tab: string) {
  emit("tab-click", tab);
}

function handleLoadedItemChange(itemId: string) {
  selectedLoadedItemId.value = itemId;
}

function handleTreeNodeClick(data: { documentId?: string; id: string }) {
  if (!data.documentId) return;
  selectedDocumentId.value = data.documentId;
  selectedTreeNodeId.value = data.id;
  currentPageIndex.value = 0;
}

function goFirstPage() {
  currentPageIndex.value = 0;
}

function goPrevPage() {
  currentPageIndex.value = Math.max(0, currentPageIndex.value - 1);
}

function goNextPage() {
  if (!currentDocument.value) return;
  currentPageIndex.value = Math.min(
    currentDocument.value.pages.length - 1,
    currentPageIndex.value + 1
  );
}

function goLastPage() {
  if (!currentDocument.value) return;
  currentPageIndex.value = currentDocument.value.pages.length - 1;
}

onMounted(() => {
  if (!previewViewportRef.value) return;

  resizeObserver = new ResizeObserver(() => {
    updatePreviewScale();
  });

  resizeObserver.observe(previewViewportRef.value);
  updatePreviewScale();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="project-report-workspace">
    <div class="main-tabs-bar">
      <button
        v-for="tab in props.workTabs"
        :key="tab"
        class="main-tab"
        :class="{ 'is-active': tab === props.activeMainTab }"
        type="button"
        @click="handleTabClick(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <div class="report-workspace-body">
      <aside class="report-sidebar">
        <div class="report-loaded-list">
          <button
            v-for="bundle in props.context?.bundles ?? []"
            :key="bundle.loadedItem.id"
            class="report-loaded-item"
            :class="{
              'is-active': bundle.loadedItem.id === selectedLoadedItemId
            }"
            type="button"
            @click="handleLoadedItemChange(bundle.loadedItem.id)"
          >
            {{ bundle.loadedItem.label }}
          </button>
        </div>

        <div class="report-tree-panel">
          <el-tree
            v-if="currentBundle"
            :data="currentBundle.tree"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            :highlight-current="true"
            :current-node-key="selectedTreeNodeId"
            @node-click="handleTreeNodeClick"
          />
        </div>
      </aside>

      <div class="report-divider" />

      <section class="report-preview-panel">
        <div class="report-preview-toolbar">
          <button
            class="preview-nav-button"
            type="button"
            :disabled="!currentDocument || currentPageIndex === 0"
            @click="goFirstPage"
          >
            |&lt;
          </button>
          <button
            class="preview-nav-button"
            type="button"
            :disabled="!currentDocument || currentPageIndex === 0"
            @click="goPrevPage"
          >
            &lt;
          </button>
          <span class="preview-page-indicator">
            {{ currentDocument ? currentPageIndex + 1 : 0 }}
          </span>
          <span class="preview-page-total">
            /{{ currentDocument?.pages.length ?? 0 }}
          </span>
          <button
            class="preview-nav-button"
            type="button"
            :disabled="
              !currentDocument ||
              currentPageIndex >= (currentDocument?.pages.length ?? 1) - 1
            "
            @click="goNextPage"
          >
            &gt;
          </button>
          <button
            class="preview-nav-button"
            type="button"
            :disabled="
              !currentDocument ||
              currentPageIndex >= (currentDocument?.pages.length ?? 1) - 1
            "
            @click="goLastPage"
          >
            &gt;|
          </button>
        </div>

        <div
          ref="previewViewportRef"
          class="report-preview-scroll"
          :class="`is-${currentPreviewMode}`"
        >
          <div class="report-preview-stage" :class="`is-${currentPreviewMode}`">
            <div v-if="!currentPage" class="report-empty-state" />

            <div
              v-else
              class="report-paper-shell"
              :style="{
                width: `${currentPaperSize.width * previewScale}px`,
                height: `${currentPaperSize.height * previewScale}px`
              }"
            >
              <article
                class="report-paper is-preview"
                :class="`is-${currentPreviewProfile}`"
                :style="{
                  width: `${currentPaperSize.width * previewScale}px`,
                  height: `${currentPaperSize.height * previewScale}px`,
                  '--report-scale-factor': previewScale
                }"
              >
                <template v-if="currentPage.templateType === 'cover'">
                  <div class="report-paper__cover">
                    <h1>{{ currentPage.centerLines?.[0] }}</h1>
                    <p>{{ currentPage.centerLines?.[1] }}</p>
                    <p>{{ currentPage.centerLines?.[2] }}</p>
                    <p>{{ currentPage.centerLines?.[3] }}</p>
                    <div class="report-paper__cover-volume">
                      {{ currentPage.centerLines?.[4] }}
                    </div>
                    <div class="report-paper__cover-date">
                      {{ currentPage.footerRight }}
                    </div>
                  </div>
                </template>

                <template v-else-if="currentPage.templateType === 'directory'">
                  <div class="report-paper__directory">
                    <h2>{{ currentPage.title }}</h2>
                    <ul>
                      <li
                        v-for="item in currentPage.directoryItems ?? []"
                        :key="item.label"
                      >
                        <span>{{ item.label }}</span>
                        <span>{{ item.page }}</span>
                      </li>
                    </ul>
                  </div>
                </template>

                <template v-else-if="currentPage.templateType === 'narrative'">
                  <div class="report-paper__narrative">
                    <h2>{{ currentPage.title }}</h2>
                    <p
                      v-for="line in currentPage.centerLines ?? []"
                      :key="line"
                      class="report-paper__narrative-line"
                    >
                      {{ line }}
                    </p>
                  </div>
                </template>

                <template v-else-if="currentPage.templateType === 'approval'">
                  <div class="report-paper__approval">
                    <h2>{{ currentPage.title }}</h2>
                    <div class="report-paper__subtitle">
                      {{ currentPage.subtitle }}
                    </div>

                    <table
                      v-if="currentPage.table"
                      class="report-paper__table report-paper__table--approval"
                    >
                      <thead>
                        <tr>
                          <th
                            v-for="column in currentPage.table.columns"
                            :key="column"
                          >
                            {{ column }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="row in currentPage.table.rows"
                          :key="row.join('-')"
                        >
                          <td v-for="cell in row" :key="cell">{{ cell }}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div class="report-paper__approval-notes">
                      <p
                        v-for="line in currentPage.centerLines ?? []"
                        :key="line"
                      >
                        {{ line }}
                      </p>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div class="report-paper__table-wrapper">
                    <div class="report-paper__meta-row">
                      <span>{{ currentPage.subtitle }}</span>
                      <span>{{ currentPage.footerRight }}</span>
                    </div>
                    <h2>{{ currentPage.title }}</h2>
                    <table v-if="currentPage.table" class="report-paper__table">
                      <thead>
                        <tr>
                          <th
                            v-for="column in currentPage.table.columns"
                            :key="column"
                          >
                            {{ column }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="row in currentPage.table.rows"
                          :key="row.join('-')"
                        >
                          <td v-for="cell in row" :key="cell">{{ cell }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>

                <footer
                  v-if="currentPage.templateType !== 'cover'"
                  class="report-paper__footer"
                >
                  <span>{{ currentPage.footerLeft }}</span>
                  <span>{{ currentPage.footerCenter }}</span>
                  <span>{{ currentPage.footerRight }}</span>
                </footer>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-report-workspace {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #fbfdff 0%, #f6faff 100%);
}

.main-tabs-bar {
  display: flex;
  gap: 2px;
  align-items: center;
  height: 54px;
  padding: 10px 14px 0;
  background: linear-gradient(180deg, #f6fbff 0%, #edf4fb 100%);
  border-bottom: 1px solid #d9e6f4;
}

.main-tab {
  min-width: 106px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #4a6786;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px 12px 0 0;

  &.is-active {
    color: #fff;
    background: linear-gradient(180deg, #3aa5ff 0%, #2b6fd8 100%);
    border-color: #2b6fd8;
  }
}

.report-workspace-body {
  display: flex;
  flex: 1;
  height: 0;
  min-height: 0;
  overflow: hidden;
}

.report-sidebar {
  display: flex;
  flex-direction: column;
  width: 482px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.report-loaded-list {
  display: flex;
  flex: 0 0 150px;
  flex-direction: column;
  gap: 1px;
  padding: 10px 10px 0;
  overflow: auto;
  border-bottom: 1px solid #d9e6f4;
}

.report-loaded-item {
  padding: 12px 10px;
  font-size: 14px;
  color: #304f6f;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 0;
  border-radius: 4px;

  &.is-active {
    background: #eefbe5;
  }
}

.report-tree-panel {
  flex: 1;
  min-height: 0;
  padding: 10px 10px 12px;
  overflow: auto;
}

.report-tree-panel :deep(.el-tree) {
  color: #304f6f;
  background: transparent;
}

.report-tree-panel :deep(.el-tree-node__content) {
  height: 34px;
}

.report-tree-panel
  :deep(
    .el-tree--highlight-current
      .el-tree-node.is-current
      > .el-tree-node__content
  ) {
  background: #9ae76f;
}

.report-divider {
  width: 5px;
  background: linear-gradient(180deg, #d2dae5 0%, #c6d1de 100%);
}

.report-preview-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: #f5f7fb;
}

.report-preview-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  height: 44px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border-bottom: 1px solid #d8e3f1;
}

.preview-nav-button {
  padding: 0;
  font-size: 16px;
  color: #5d7897;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:disabled {
    color: #c1ccd9;
    cursor: default;
  }
}

.preview-page-indicator {
  min-width: 26px;
  font-weight: 600;
  color: #1f6dff;
  text-align: center;
}

.preview-page-total {
  color: #35506f;
}

.report-preview-scroll {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.report-preview-stage {
  display: flex;
  width: 100%;
  min-height: 100%;
  padding: 16px;
  overflow: hidden;
  background: #f5f7fb;

  &.is-fit-page {
    align-items: center;
    justify-content: center;
  }

  &.is-fit-width {
    align-items: center;
    justify-content: center;
    min-height: 100%;
  }
}

.report-empty-state {
  width: 100%;
  height: 100%;
}

.report-paper-shell {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.report-paper {
  --report-scale-factor: 1;
  --report-padding-top-base: 56px;
  --report-padding-x-base: 74px;
  --report-padding-bottom-base: 84px;
  --report-meta-font-base: 16px;
  --report-meta-font-min: 10.5px;
  --report-title-font-base: 32px;
  --report-title-font-min: 18px;
  --report-table-cell-padding-y-base: 8px;
  --report-table-cell-padding-x-base: 10px;
  --report-table-font-base: 14px;
  --report-table-font-min: 10.5px;
  --report-table-line-height: 1.45;
  --report-table-border-color: #2d2d2d;
  --report-footer-font-base: 14px;
  --report-footer-font-min: 10px;

  position: relative;
  box-sizing: border-box;
  padding: calc(var(--report-padding-top-base) * var(--report-scale-factor))
    calc(var(--report-padding-x-base) * var(--report-scale-factor))
    calc(var(--report-padding-bottom-base) * var(--report-scale-factor));
  overflow: hidden;
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
  background: #fff;
  border: 1px solid #2f2f2f;
  box-shadow: 8px 8px 0 rgb(0 0 0 / 16%);
  text-rendering: optimizelegibility;
}

.report-paper.is-preview.is-cover {
  --report-padding-top-base: 54px;
  --report-padding-x-base: 64px;
  --report-padding-bottom-base: 78px;
  --report-footer-font-min: 11px;
}

.report-paper.is-preview.is-directory {
  --report-padding-top-base: 42px;
  --report-padding-x-base: 54px;
  --report-padding-bottom-base: 54px;
  --report-title-font-base: 38px;
  --report-title-font-min: 22px;
  --report-footer-font-min: 11px;
}

.report-paper.is-preview.is-narrative {
  --report-padding-top-base: 40px;
  --report-padding-x-base: 52px;
  --report-padding-bottom-base: 54px;
  --report-title-font-base: 38px;
  --report-title-font-min: 22px;
  --report-meta-font-min: 11.5px;
  --report-footer-font-min: 11px;
}

.report-paper.is-preview.is-table {
  --report-padding-top-base: 36px;
  --report-padding-x-base: 46px;
  --report-padding-bottom-base: 50px;
  --report-meta-font-base: 16px;
  --report-meta-font-min: 11.5px;
  --report-title-font-base: 36px;
  --report-title-font-min: 22px;
  --report-table-cell-padding-y-base: 9px;
  --report-table-cell-padding-x-base: 12px;
  --report-table-font-base: 15px;
  --report-table-font-min: 12px;
  --report-table-line-height: 1.52;
  --report-table-border-color: #242424;
  --report-footer-font-base: 14px;
  --report-footer-font-min: 11px;
}

.report-paper.is-preview.is-approval {
  --report-padding-top-base: 38px;
  --report-padding-x-base: 48px;
  --report-padding-bottom-base: 52px;
  --report-meta-font-min: 11.5px;
  --report-title-font-base: 34px;
  --report-title-font-min: 21px;
  --report-table-cell-padding-y-base: 9px;
  --report-table-cell-padding-x-base: 11px;
  --report-table-font-base: 15px;
  --report-table-font-min: 11.5px;
  --report-table-line-height: 1.5;
  --report-table-border-color: #252525;
  --report-footer-font-min: 11px;
}

.report-paper__cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  color: #141414;
  text-align: center;

  h1 {
    margin: 0 0 20px;
    font-size: max(calc(54px * var(--report-scale-factor)), 26px);
    font-weight: 700;
  }

  p {
    margin: 0 0 22px;
    font-size: max(calc(28px * var(--report-scale-factor)), 16px);
  }
}

.report-paper__cover-volume {
  margin-top: 42px;
  font-size: max(calc(26px * var(--report-scale-factor)), 15px);
  letter-spacing: 0.3em;
}

.report-paper__cover-date {
  margin-top: 120px;
  font-size: max(calc(18px * var(--report-scale-factor)), 12px);
}

.report-paper__directory {
  h2 {
    margin: 0 0 28px;
    font-size: max(calc(42px * var(--report-scale-factor)), 20px);
    text-align: center;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: max(calc(20px * var(--report-scale-factor)), 12px);
    border-bottom: 1px dashed #c9d1da;
  }
}

.report-paper__narrative {
  h2 {
    margin: 0 0 28px;
    font-size: max(calc(36px * var(--report-scale-factor)), 18px);
    text-align: center;
  }
}

.report-paper__narrative-line {
  margin: 0 0 18px;
  font-size: max(calc(18px * var(--report-scale-factor)), 11px);
  line-height: 1.9;
  color: #1e1e1e;
  white-space: pre-line;
}

.report-paper__subtitle,
.report-paper__meta-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: max(
    calc(var(--report-meta-font-base) * var(--report-scale-factor)),
    var(--report-meta-font-min)
  );
  color: #2d2d2d;
}

.report-paper h2 {
  margin: 0 0 18px;
  font-size: max(
    calc(var(--report-title-font-base) * var(--report-scale-factor)),
    var(--report-title-font-min)
  );
  font-weight: 700;
  color: #111;
  text-align: center;
}

.report-paper__table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;

  th,
  td {
    padding: calc(
        var(--report-table-cell-padding-y-base) * var(--report-scale-factor)
      )
      calc(var(--report-table-cell-padding-x-base) * var(--report-scale-factor));
    font-size: max(
      calc(var(--report-table-font-base) * var(--report-scale-factor)),
      var(--report-table-font-min)
    );
    font-variant-numeric: tabular-nums;
    line-height: var(--report-table-line-height);
    vertical-align: top;
    color: #1a1a1a;
    word-break: break-word;
    overflow-wrap: anywhere;
    border: 1px solid var(--report-table-border-color);
  }

  th {
    font-weight: 700;
    background: #fcfcfc;
  }
}

.report-paper__approval-notes {
  margin-top: 20px;

  p {
    margin: 0 0 18px;
    font-size: max(calc(18px * var(--report-scale-factor)), 11px);
    line-height: 1.9;
  }
}

.report-paper__footer {
  position: absolute;
  right: calc(var(--report-padding-x-base) * var(--report-scale-factor));
  bottom: calc(38px * var(--report-scale-factor));
  left: calc(var(--report-padding-x-base) * var(--report-scale-factor));
  display: flex;
  justify-content: space-between;
  font-size: max(
    calc(var(--report-footer-font-base) * var(--report-scale-factor)),
    var(--report-footer-font-min)
  );
  color: #2f2f2f;
}
</style>
