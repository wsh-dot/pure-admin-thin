<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "@/utils/message";
import { stageOptions } from "./mock";
import WorkbenchColumnNode from "./components/WorkbenchColumnNode.vue";
import { buildBudgetBookWorkspaceContext } from "./budgetBookMock";
import type {
  BudgetBookDetailTabKey,
  BudgetBookFeeMainCategoryRow,
  BudgetBookFeeMainSettingRow,
  BudgetBookFeeProgramRow,
  BudgetBookFeeRateRow,
  BudgetBookFormulaRow,
  BudgetBookLaborRow,
  BudgetBookMainMaterialRow,
  BudgetBookTreeRow,
  BudgetBookWorkspaceContext
} from "./budgetBookTypes";
import { type BudgetBookRoutePayload } from "./workspaceState";
import { useVerticalPanelResize } from "./hooks/useVerticalPanelResize";
import { useHorizontalPanelResize } from "./hooks/useHorizontalPanelResize";

defineOptions({
  name: "BudgetBookWorkspacePage"
});

const route = useRoute();
const router = useRouter();

const DEFAULT_DETAIL_HEIGHT = 360;
const DEFAULT_FEE_RATE_HEIGHT = 180;

const pageRootRef = ref<HTMLElement | null>(null);
const contentSplitRef = ref<HTMLElement | null>(null);
const feeSplitRef = ref<HTMLElement | null>(null);
const feeMainRootRef = ref<HTMLElement | null>(null);
const feeMainLeftRef = ref<HTMLElement | null>(null);
const pageViewportHeight = ref(0);
const closeConfirmDialogVisible = ref(false);
let pageResizeObserver: ResizeObserver | undefined;
let pageHeightFrame = 0;
const activeMainTab = ref("budget");
const selectedNodeId = ref("");
const activeDetailTab = ref<BudgetBookDetailTabKey>("labor");
const showFeeRate = ref(false);
const selectedFeeMainCategoryId = ref("");
const selectedFeeMainProgramRowId = ref("");
const selectedFeeMainSettingRowId = ref("");
const selectedFeeTemplate = ref("");
const workspaceContext = ref<BudgetBookWorkspaceContext>(
  buildBudgetBookWorkspaceContext(readBudgetBookRoutePayload(route.query))
);

const detailResize = useVerticalPanelResize({
  defaultHeight: DEFAULT_DETAIL_HEIGHT,
  minHeight: 0,
  minRemainingHeight: 56
});
const feeRateResize = useVerticalPanelResize({
  defaultHeight: DEFAULT_FEE_RATE_HEIGHT,
  minHeight: 0,
  minRemainingHeight: 56
});
const feeMainLeftResize = useHorizontalPanelResize({
  defaultWidth: 410,
  minWidth: 0,
  minRemainingWidth: 520
});
const feeMainLowerResize = useVerticalPanelResize({
  defaultHeight: 300,
  minHeight: 0,
  minRemainingHeight: 8
});

const selectedDetailRowIds = reactive({
  labor: "",
  mainMaterial: "",
  formula: "",
  feeProgram: "",
  feeRate: "",
  extraFee: ""
});

const stageLabel = computed(() => {
  return (
    stageOptions.find(
      item => item.key === workspaceContext.value.routeInfo.stageKey
    )?.label ?? "施工图预算"
  );
});
const headerTitle = computed(
  () => workspaceContext.value.routeInfo.projectName
);
const headerSubtitle = computed(() => {
  const { pricingLib, projectCode } = workspaceContext.value.routeInfo;
  return `${stageLabel.value} · ${projectCode}${pricingLib ? ` · ${pricingLib}` : ""}`;
});

const pageRootStyle = computed(() => {
  return pageViewportHeight.value
    ? { height: `${pageViewportHeight.value}px` }
    : undefined;
});
const activeToolbarGroups = computed(() => {
  return activeMainTab.value === "fee"
    ? workspaceContext.value.feeToolbarGroups
    : workspaceContext.value.toolbarGroups;
});
const showBudgetShortcuts = computed(() => activeMainTab.value === "budget");
const detailPanelStyle = computed(() => {
  return {
    gridTemplateRows: `minmax(0px, 1fr) 8px ${detailResize.panelHeight.value}px`
  };
});
const feeMainWorkspaceStyle = computed(() => {
  return {
    gridTemplateColumns: `${feeMainLeftResize.panelWidth.value}px 8px minmax(0px, 1fr)`
  };
});
const feeMainLeftStyle = computed(() => {
  return {
    gridTemplateRows: `minmax(0px, 1fr) 8px ${feeMainLowerResize.panelHeight.value}px`
  };
});

const selectedNode = computed<BudgetBookTreeRow | null>(() => {
  return (
    workspaceContext.value.rows.find(
      item => item.id === selectedNodeId.value
    ) ??
    workspaceContext.value.rows[0] ??
    null
  );
});
const currentDetailState = computed(() => {
  const defaultNodeId = workspaceContext.value.defaultNodeId;
  return (
    workspaceContext.value.detailStateMap[selectedNode.value?.id ?? ""] ??
    workspaceContext.value.detailStateMap[defaultNodeId]
  );
});
const isParentOnlyMode = computed(
  () => currentDetailState.value?.mode === "parent-only"
);
const visibleDetailTabs = computed(() => {
  const visibleKeys =
    currentDetailState.value?.visibleTabs ??
    workspaceContext.value.detailTabs.map(item => item.key);

  return workspaceContext.value.detailTabs.filter(item =>
    visibleKeys.includes(item.key)
  );
});
const currentDetailTab = computed<BudgetBookDetailTabKey>(() => {
  const fallbackTab = visibleDetailTabs.value[0]?.key ?? "labor";
  return visibleDetailTabs.value.some(
    item => item.key === activeDetailTab.value
  )
    ? activeDetailTab.value
    : fallbackTab;
});
const currentLaborRows = computed(
  () => currentDetailState.value?.laborRows ?? []
);
const currentMainMaterialRows = computed(
  () => currentDetailState.value?.mainMaterialRows ?? []
);
const currentFormulaRows = computed(
  () => currentDetailState.value?.formulaRows ?? []
);
const currentFeeProgramRows = computed(
  () => currentDetailState.value?.feeProgramRows ?? []
);
const currentFeeRateRows = computed(
  () => currentDetailState.value?.feeRateRows ?? []
);
const currentExtraFeeRows = computed(
  () => currentDetailState.value?.extraFeeRows ?? []
);
const currentQuotaContent = computed(
  () =>
    currentDetailState.value?.quotaContent ?? { heading: "", description: "" }
);
const currentFormulaUnit = computed(
  () => currentDetailState.value?.formulaUnit || selectedNode.value?.unit || ""
);
const showFeeRatePanel = computed(
  () => currentDetailTab.value === "feeProgram" && showFeeRate.value
);
const currentFeeMainCategoryState = computed(() => {
  const defaultCategoryId =
    workspaceContext.value.feeMainWorkspace.defaultCategoryId;
  return (
    workspaceContext.value.feeMainWorkspace.categoryStateMap[
      selectedFeeMainCategoryId.value
    ] ??
    workspaceContext.value.feeMainWorkspace.categoryStateMap[defaultCategoryId]
  );
});
const currentFeeMainSettingRows = computed(
  () => currentFeeMainCategoryState.value?.settingRows ?? []
);
const currentFeeMainProgramRows = computed(
  () => currentFeeMainCategoryState.value?.feeProgramRows ?? []
);
const feeProgramPanelStyle = computed(() => {
  if (!showFeeRatePanel.value) return undefined;

  return {
    gridTemplateRows: `minmax(0px, 1fr) 8px ${feeRateResize.panelHeight.value}px`
  };
});

watch(
  () => route.fullPath,
  () => {
    workspaceContext.value = buildBudgetBookWorkspaceContext(
      readBudgetBookRoutePayload(route.query)
    );
    selectedNodeId.value = workspaceContext.value.defaultNodeId;
    activeDetailTab.value =
      workspaceContext.value.detailStateMap[selectedNodeId.value]?.defaultTab ??
      "labor";
    selectedFeeMainCategoryId.value =
      workspaceContext.value.feeMainWorkspace.defaultCategoryId;
    selectedFeeTemplate.value =
      workspaceContext.value.feeMainWorkspace.defaultTemplate;
    showFeeRate.value = false;
    detailResize.panelHeight.value = DEFAULT_DETAIL_HEIGHT;
    feeRateResize.panelHeight.value = DEFAULT_FEE_RATE_HEIGHT;
    feeMainLeftResize.panelWidth.value = 410;
    feeMainLowerResize.panelHeight.value = 300;
    syncFeeMainSelectionRows();
  },
  { immediate: true }
);

watch(
  currentDetailState,
  state => {
    if (!state) return;

    activeDetailTab.value = state.defaultTab;
    if (state.defaultTab !== "feeProgram") {
      showFeeRate.value = false;
    }
    syncDetailSelectionRows();
  },
  { immediate: true }
);

watch(currentDetailTab, tab => {
  if (tab !== "feeProgram") {
    showFeeRate.value = false;
  }
});

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return typeof value === "string" ? value : "";
}

function readBudgetBookRoutePayload(
  query: Record<string, unknown>
): BudgetBookRoutePayload {
  const stageKey =
    readQueryValue(query.stageKey) === "tenderControl" ||
    readQueryValue(query.stageKey) === "settlement" ||
    readQueryValue(query.stageKey) === "indicator"
      ? (readQueryValue(query.stageKey) as BudgetBookRoutePayload["stageKey"])
      : "budget";

  return {
    stageKey,
    rowId: readQueryValue(query.rowId) || "budget-file",
    projectCode: readQueryValue(query.projectCode) || "测试",
    projectName: readQueryValue(query.projectName) || "测试11111",
    pricingLib: readQueryValue(query.pricingLib) || "[石油安装22]"
  };
}

function syncDetailSelectionRows() {
  selectedDetailRowIds.labor = currentLaborRows.value[0]?.id ?? "";
  selectedDetailRowIds.mainMaterial =
    currentMainMaterialRows.value[0]?.id ?? "";
  selectedDetailRowIds.formula = currentFormulaRows.value[0]?.id ?? "";
  selectedDetailRowIds.feeProgram = currentFeeProgramRows.value[0]?.id ?? "";
  selectedDetailRowIds.feeRate = currentFeeRateRows.value[0]?.id ?? "";
  selectedDetailRowIds.extraFee = currentExtraFeeRows.value[0]?.id ?? "";
}

function syncFeeMainSelectionRows() {
  selectedFeeMainProgramRowId.value =
    currentFeeMainProgramRows.value[0]?.id ?? "";
  selectedFeeMainSettingRowId.value =
    currentFeeMainSettingRows.value[0]?.id ?? "";
}

function updatePageViewportHeight() {
  const root = pageRootRef.value;

  if (!root) return;

  const rootRect = root.getBoundingClientRect();
  const scrollWrap = root.closest(".el-scrollbar__wrap") as HTMLElement | null;
  const containerBottom =
    scrollWrap?.getBoundingClientRect().bottom ?? window.innerHeight;
  pageViewportHeight.value = Math.max(containerBottom - rootRect.top, 620);
}

function schedulePageViewportHeightUpdate() {
  if (pageHeightFrame) {
    window.cancelAnimationFrame(pageHeightFrame);
  }

  pageHeightFrame = window.requestAnimationFrame(() => {
    pageHeightFrame = 0;
    updatePageViewportHeight();
  });
}

function handleToolbarAction(label: string) {
  if (label === "保存") {
    message("预算书已保存，当前为原型数据写回", { type: "success" });
    return;
  }

  message(`${label}功能暂未接入，当前为原型实现`, { type: "info" });
}

function handleMainTabClick(key: string) {
  if (key === "budget" || key === "fee") {
    activeMainTab.value = key;
    return;
  }

  message("当前阶段先实现预算书工作区，其他页签暂保留占位", {
    type: "info"
  });
}

function handleMainRowSelect({ row }: { row: BudgetBookTreeRow }) {
  selectedNodeId.value = row.id;
}

function handleDetailTabClick(tab: BudgetBookDetailTabKey) {
  activeDetailTab.value = tab;
}

function handleFeeMainCategorySelect({
  row
}: {
  row: BudgetBookFeeMainCategoryRow;
}) {
  selectedFeeMainCategoryId.value = row.id;
  syncFeeMainSelectionRows();
}

function handleFeeMainProgramRowSelect({
  row
}: {
  row: BudgetBookFeeProgramRow;
}) {
  selectedFeeMainProgramRowId.value = row.id;
}

function handleFeeMainSettingRowSelect({
  row
}: {
  row: BudgetBookFeeMainSettingRow;
}) {
  selectedFeeMainSettingRowId.value = row.id;
}

function handleDetailRowSelect(
  bucket: keyof typeof selectedDetailRowIds,
  row:
    | BudgetBookLaborRow
    | BudgetBookMainMaterialRow
    | BudgetBookFormulaRow
    | BudgetBookFeeProgramRow
    | BudgetBookFeeRateRow
    | { id: string }
) {
  selectedDetailRowIds[bucket] = row.id;
}

function handleAttemptClose() {
  closeConfirmDialogVisible.value = true;
}

async function navigateBackToProjectManagement(shouldSave: boolean) {
  if (shouldSave) {
    message("预算书已保存，正在返回项目管理工作台", { type: "success" });
  }

  await router.push({
    path: "/project-workbench/index",
    query: {
      restoreFrom: "budget-book",
      ts: `${Date.now()}`
    }
  });
}

function handleCloseDialogCancel() {
  closeConfirmDialogVisible.value = false;
}

async function handleConfirmClose(shouldSave: boolean) {
  closeConfirmDialogVisible.value = false;
  await navigateBackToProjectManagement(shouldSave);
}

function handleMainDividerMouseDown(event: MouseEvent) {
  detailResize.startResize(event, contentSplitRef.value);
}

function handleFeeRateDividerMouseDown(event: MouseEvent) {
  feeRateResize.startResize(event, feeSplitRef.value);
}

function handleFeeMainVerticalDividerMouseDown(event: MouseEvent) {
  feeMainLeftResize.startResize(event, feeMainRootRef.value);
}

function handleFeeMainHorizontalDividerMouseDown(event: MouseEvent) {
  feeMainLowerResize.startResize(event, feeMainLeftRef.value);
}

function mainRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedNodeId.value ? "is-selected-row" : "";
}

function laborRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedDetailRowIds.labor ? "is-detail-selected-row" : "";
}

function mainMaterialRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedDetailRowIds.mainMaterial
    ? "is-detail-selected-row"
    : "";
}

function formulaRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedDetailRowIds.formula
    ? "is-detail-selected-row"
    : "";
}

function feeProgramRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedDetailRowIds.feeProgram
    ? "is-detail-selected-row"
    : "";
}

function feeRateRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedDetailRowIds.feeRate
    ? "is-detail-selected-row"
    : "";
}

function extraFeeRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedDetailRowIds.extraFee
    ? "is-detail-selected-row"
    : "";
}

function feeMainCategoryRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedFeeMainCategoryId.value
    ? "is-detail-selected-row"
    : "";
}

function feeMainProgramRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedFeeMainProgramRowId.value
    ? "is-detail-selected-row"
    : "";
}

function feeMainSettingRowClassName({ row }: { row: { id: string } }) {
  return row.id === selectedFeeMainSettingRowId.value
    ? "is-detail-selected-row"
    : "";
}

onMounted(async () => {
  await nextTick();
  schedulePageViewportHeightUpdate();

  const root = pageRootRef.value;
  const scrollWrap = root?.closest(".el-scrollbar__wrap");
  const appMain = root?.closest(".app-main");

  if (typeof ResizeObserver !== "undefined") {
    pageResizeObserver = new ResizeObserver(schedulePageViewportHeightUpdate);

    if (scrollWrap) pageResizeObserver.observe(scrollWrap);
    if (appMain) pageResizeObserver.observe(appMain);
  }

  window.addEventListener("resize", schedulePageViewportHeightUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", schedulePageViewportHeightUpdate);
  pageResizeObserver?.disconnect();

  if (pageHeightFrame) {
    window.cancelAnimationFrame(pageHeightFrame);
  }
});
</script>

<template>
  <div ref="pageRootRef" class="budget-book-page" :style="pageRootStyle">
    <section class="budget-toolbar-panel">
      <div class="budget-toolbar-head">
        <div class="budget-toolbar-title">{{ headerTitle }}</div>
        <div class="budget-toolbar-subtitle">{{ headerSubtitle }}</div>
      </div>

      <div class="budget-toolbar-groups">
        <div
          v-for="(group, groupIndex) in activeToolbarGroups"
          :key="groupIndex"
          class="budget-toolbar-group"
        >
          <button
            v-for="action in group"
            :key="action.key"
            class="budget-toolbar-action"
            type="button"
            @click="handleToolbarAction(action.label)"
          >
            <span class="budget-toolbar-icon">
              <IconifyIconOnline :icon="action.icon" />
            </span>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="budget-workspace-panel">
      <div class="budget-main-tabs">
        <div class="budget-main-tab-list">
          <button
            v-for="tab in workspaceContext.mainTabs"
            :key="tab.key"
            class="budget-main-tab"
            :class="{ 'is-active': tab.key === activeMainTab }"
            type="button"
            @click="handleMainTabClick(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="showBudgetShortcuts" class="budget-shortcuts">
          <span
            v-for="badge in workspaceContext.shortcutBadges"
            :key="badge"
            class="budget-shortcut-badge"
          >
            {{ badge }}
          </span>
          <button
            v-for="link in workspaceContext.shortcutLinks"
            :key="link"
            class="budget-shortcut-link"
            type="button"
            @click="handleToolbarAction(link)"
          >
            {{ link }}
          </button>
        </div>

        <button
          v-if="activeMainTab !== 'fee'"
          class="budget-close-button"
          type="button"
          title="关闭预算书"
          @click="handleAttemptClose"
        >
          <IconifyIconOnline icon="ep:close-bold" />
        </button>
      </div>

      <div
        v-if="activeMainTab === 'fee'"
        ref="feeMainRootRef"
        class="fee-main-workspace"
        :style="feeMainWorkspaceStyle"
      >
        <div
          ref="feeMainLeftRef"
          class="fee-main-left"
          :style="feeMainLeftStyle"
        >
          <div class="detail-table-shell fee-main-left-pane">
            <vxe-table
              border
              round
              size="small"
              stripe
              height="100%"
              show-overflow="title"
              :data="workspaceContext.feeMainWorkspace.categoryRows"
              :row-config="{
                isHover: true,
                keyField: 'id'
              }"
              :row-class-name="feeMainCategoryRowClassName"
              @cell-click="handleFeeMainCategorySelect"
            >
              <vxe-column field="name" title="取费类别名称" min-width="180" />
              <vxe-column
                field="totalAmount"
                title="总造价金额（元）"
                min-width="168"
                align="right"
              />
            </vxe-table>
          </div>

          <div
            class="fee-main-horizontal-divider"
            @mousedown.prevent="handleFeeMainHorizontalDividerMouseDown"
          >
            <span />
          </div>

          <div class="detail-table-shell fee-main-left-pane">
            <vxe-table
              border
              round
              size="small"
              stripe
              height="100%"
              show-overflow="title"
              :data="currentFeeMainSettingRows"
              :row-config="{
                isHover: true,
                keyField: 'id'
              }"
              :row-class-name="feeMainSettingRowClassName"
              @cell-click="handleFeeMainSettingRowSelect"
            >
              <vxe-column field="item" title="设置项目" min-width="180" />
              <vxe-column field="value" title="设置值" min-width="180" />
            </vxe-table>
          </div>
        </div>

        <div
          class="fee-main-vertical-divider"
          @mousedown.prevent="handleFeeMainVerticalDividerMouseDown"
        >
          <span />
        </div>

        <div class="fee-main-right">
          <div class="fee-main-right-toolbar">
            <el-select
              v-model="selectedFeeTemplate"
              class="fee-main-template-select"
              size="small"
            >
              <el-option
                v-for="option in workspaceContext.feeMainWorkspace
                  .templateOptions"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>

            <button type="button" @click="handleToolbarAction('自定义模板')">
              自定义模板
            </button>
            <button type="button" @click="handleToolbarAction('模板对比')">
              模板对比
            </button>
            <button type="button" @click="handleToolbarAction('保存模板')">
              保存模板
            </button>
            <button type="button" @click="handleToolbarAction('删除模板')">
              删除模板
            </button>
            <button type="button" @click="handleToolbarAction('检查')">
              检查
            </button>
            <button type="button" @click="handleToolbarAction('获取取费模板')">
              获取取费模板
            </button>
            <button type="button" @click="handleToolbarAction('我的取费模板')">
              我的取费模板
            </button>

            <span class="fee-main-right-toolbar__spacer" />

            <button
              class="fee-main-close-button"
              type="button"
              title="关闭预算书"
              @click="handleAttemptClose"
            >
              <IconifyIconOnline icon="ep:close-bold" />
            </button>
          </div>

          <div class="detail-table-shell fee-main-right-table">
            <vxe-table
              border
              round
              size="small"
              stripe
              height="100%"
              show-overflow="title"
              :data="currentFeeMainProgramRows"
              :tree-config="{
                transform: true,
                rowField: 'id',
                parentField: 'parentId',
                expandAll: true
              }"
              :row-config="{
                isHover: true,
                keyField: 'id'
              }"
              :row-class-name="feeMainProgramRowClassName"
              @cell-click="handleFeeMainProgramRowSelect"
            >
              <vxe-column
                field="feeCode"
                title="费用代号"
                min-width="138"
                tree-node
              />
              <vxe-column field="feeItem" title="费用项目" min-width="148" />
              <vxe-column field="base" title="计算基础" min-width="188" />
              <vxe-column field="rate" title="费率%" width="96" align="right" />
              <vxe-column
                field="amount"
                title="金额（元）"
                width="108"
                align="right"
              />
              <vxe-column title="不计" width="82" align="center">
                <template #default="{ row }">
                  <el-checkbox v-model="row.excluded" />
                </template>
              </vxe-column>
              <vxe-column
                field="description"
                title="计算说明"
                min-width="180"
                show-overflow="title"
              />
              <vxe-column title="打印" width="82" align="center">
                <template #default="{ row }">
                  <el-checkbox v-model="row.printable" />
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </div>
      </div>

      <div
        v-else
        ref="contentSplitRef"
        class="budget-content-grid"
        :style="detailPanelStyle"
      >
        <div class="budget-main-table-shell">
          <vxe-table
            border
            round
            size="small"
            stripe
            height="100%"
            show-header-overflow="title"
            :data="workspaceContext.rows"
            :column-config="{ resizable: true }"
            :tree-config="{
              transform: true,
              rowField: 'id',
              parentField: 'parentId',
              expandAll: true
            }"
            :row-config="{
              isHover: true,
              keyField: 'id'
            }"
            :row-class-name="mainRowClassName"
            @cell-click="handleMainRowSelect"
          >
            <WorkbenchColumnNode
              v-for="column in workspaceContext.mainColumns"
              :key="column.id"
              :column="column"
            />
          </vxe-table>
        </div>

        <div
          class="budget-main-divider"
          @mousedown.prevent="handleMainDividerMouseDown"
        >
          <span />
        </div>

        <div class="budget-detail-panel">
          <div class="budget-detail-tabs">
            <button
              v-for="tab in visibleDetailTabs"
              :key="tab.key"
              class="budget-detail-tab"
              :class="{ 'is-active': tab.key === currentDetailTab }"
              type="button"
              @click="handleDetailTabClick(tab.key)"
            >
              {{ tab.label }}
            </button>

            <div class="budget-detail-ops">
              <label
                v-if="currentDetailTab === 'feeProgram'"
                class="budget-detail-checkbox"
              >
                <el-checkbox v-model="showFeeRate" />
                <span>显示费率</span>
              </label>

              <template v-if="!isParentOnlyMode">
                <button type="button" @click="handleToolbarAction('增加')">
                  增
                </button>
                <button type="button" @click="handleToolbarAction('刷新')">
                  R
                </button>
                <button type="button" @click="handleToolbarAction('校核')">
                  C
                </button>
                <button type="button" @click="handleToolbarAction('联查')">
                  J
                </button>
                <button
                  type="button"
                  @click="handleToolbarAction('选择工料机')"
                >
                  选择工料机
                </button>
              </template>

              <button
                class="budget-detail-collapse"
                type="button"
                title="收起区域"
                @click="handleToolbarAction('收起区域')"
              >
                <IconifyIconOnline icon="ep:arrow-down" />
              </button>
            </div>
          </div>

          <div class="budget-detail-body">
            <div v-if="currentDetailTab === 'labor'" class="detail-table-shell">
              <vxe-table
                border
                round
                size="small"
                stripe
                height="100%"
                show-overflow="title"
                :data="currentLaborRows"
                :row-config="{
                  isHover: true,
                  keyField: 'id'
                }"
                :row-class-name="laborRowClassName"
                @cell-click="({ row }) => handleDetailRowSelect('labor', row)"
              >
                <WorkbenchColumnNode
                  v-for="column in workspaceContext.laborColumns"
                  :key="column.id"
                  :column="column"
                />
              </vxe-table>
            </div>

            <div
              v-else-if="currentDetailTab === 'mainMaterial'"
              class="detail-table-shell"
            >
              <vxe-table
                border
                round
                size="small"
                stripe
                height="100%"
                show-overflow="title"
                :data="currentMainMaterialRows"
                :row-config="{
                  isHover: true,
                  keyField: 'id'
                }"
                :row-class-name="mainMaterialRowClassName"
                @cell-click="
                  ({ row }) => handleDetailRowSelect('mainMaterial', row)
                "
              >
                <WorkbenchColumnNode
                  v-for="column in workspaceContext.mainMaterialColumns"
                  :key="column.id"
                  :column="column"
                />
              </vxe-table>
            </div>

            <div
              v-else-if="currentDetailTab === 'formula'"
              class="detail-table-shell detail-table-shell--formula"
            >
              <div class="formula-toolbar">
                <div class="formula-toolbar__spacer" />
                <div class="formula-unit">
                  单位：{{ currentFormulaUnit || "--" }}
                </div>
              </div>

              <div class="formula-table-shell">
                <vxe-table
                  border
                  round
                  size="small"
                  stripe
                  height="100%"
                  show-overflow="title"
                  :data="currentFormulaRows"
                  :row-config="{
                    isHover: true,
                    keyField: 'id'
                  }"
                  :row-class-name="formulaRowClassName"
                  @cell-click="
                    ({ row }) => handleDetailRowSelect('formula', row)
                  "
                >
                  <WorkbenchColumnNode
                    v-for="column in workspaceContext.formulaColumns"
                    :key="column.id"
                    :column="column"
                  />
                  <vxe-column title="累加" width="92" align="center">
                    <template #default="{ row }">
                      <el-checkbox v-model="row.accumulate" />
                    </template>
                  </vxe-column>
                </vxe-table>
              </div>
            </div>

            <div
              v-else-if="currentDetailTab === 'feeProgram'"
              ref="feeSplitRef"
              class="fee-program-shell"
              :class="{ 'is-split': showFeeRatePanel }"
              :style="feeProgramPanelStyle"
            >
              <div class="detail-table-shell">
                <vxe-table
                  border
                  round
                  size="small"
                  stripe
                  height="100%"
                  show-overflow="title"
                  :data="currentFeeProgramRows"
                  :tree-config="{
                    transform: true,
                    rowField: 'id',
                    parentField: 'parentId',
                    expandAll: true
                  }"
                  :row-config="{
                    isHover: true,
                    keyField: 'id'
                  }"
                  :row-class-name="feeProgramRowClassName"
                  @cell-click="
                    ({ row }) => handleDetailRowSelect('feeProgram', row)
                  "
                >
                  <vxe-column
                    field="feeCode"
                    title="费用代号"
                    min-width="138"
                    tree-node
                  />
                  <vxe-column
                    field="feeItem"
                    title="费用项目"
                    min-width="148"
                  />
                  <vxe-column field="base" title="计算基础" min-width="188" />
                  <vxe-column
                    field="rate"
                    title="费率%"
                    width="96"
                    align="right"
                  />
                  <vxe-column
                    field="amount"
                    title="金额"
                    width="108"
                    align="right"
                  />
                  <vxe-column title="不计" width="82" align="center">
                    <template #default="{ row }">
                      <el-checkbox v-model="row.excluded" />
                    </template>
                  </vxe-column>
                  <vxe-column
                    field="description"
                    title="计算说明"
                    min-width="180"
                    show-overflow="title"
                  />
                  <vxe-column title="打印" width="82" align="center">
                    <template #default="{ row }">
                      <el-checkbox v-model="row.printable" />
                    </template>
                  </vxe-column>
                </vxe-table>
              </div>

              <template v-if="showFeeRatePanel">
                <div
                  class="fee-program-divider"
                  @mousedown.prevent="handleFeeRateDividerMouseDown"
                >
                  <span />
                </div>

                <div class="detail-table-shell detail-table-shell--rate">
                  <vxe-table
                    border
                    round
                    size="small"
                    stripe
                    height="100%"
                    show-overflow="title"
                    :data="currentFeeRateRows"
                    :row-config="{
                      isHover: true,
                      keyField: 'id'
                    }"
                    :row-class-name="feeRateRowClassName"
                    @cell-click="
                      ({ row }) => handleDetailRowSelect('feeRate', row)
                    "
                  >
                    <vxe-column field="tag" title="标识" min-width="110" />
                    <vxe-column
                      field="feeRateCode"
                      title="费率代码"
                      min-width="148"
                    />
                    <vxe-column field="name" title="名称" min-width="220" />
                    <vxe-column
                      field="rate"
                      title="费率（%）"
                      min-width="112"
                      align="right"
                    />
                    <vxe-column title="固定" width="92" align="center">
                      <template #default="{ row }">
                        <el-checkbox v-model="row.fixed" />
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </template>
            </div>

            <div
              v-else-if="currentDetailTab === 'extraFee'"
              class="detail-table-shell"
            >
              <vxe-table
                border
                round
                size="small"
                stripe
                height="100%"
                show-overflow="title"
                :data="currentExtraFeeRows"
                :row-config="{
                  isHover: true,
                  keyField: 'id'
                }"
                :row-class-name="extraFeeRowClassName"
                @cell-click="
                  ({ row }) => handleDetailRowSelect('extraFee', row)
                "
              >
                <WorkbenchColumnNode
                  v-for="column in workspaceContext.extraFeeColumns"
                  :key="column.id"
                  :column="column"
                />
              </vxe-table>
            </div>

            <div
              v-else-if="currentDetailTab === 'quotaContent'"
              class="quota-content-shell"
            >
              <article class="quota-content-card">
                <h3>{{ currentQuotaContent.heading }}</h3>
                <p>{{ currentQuotaContent.description }}</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <el-dialog
      v-model="closeConfirmDialogVisible"
      title="关闭预算书"
      width="460px"
      class="budget-close-dialog"
      :show-close="true"
      :close-on-click-modal="false"
      :destroy-on-close="false"
      align-center
    >
      <div class="budget-close-dialog__body">
        <div class="budget-close-dialog__icon">
          <IconifyIconOnline icon="ep:warning-filled" />
        </div>
        <div class="budget-close-dialog__copy">
          <p class="budget-close-dialog__title">是否保存当前文件？</p>
          <p class="budget-close-dialog__desc">
            关闭后将返回项目管理工作台，未保存的修改可能会丢失。
          </p>
        </div>
      </div>

      <template #footer>
        <div class="budget-close-dialog__footer">
          <el-button @click="handleCloseDialogCancel">取消</el-button>
          <el-button @click="handleConfirmClose(false)">直接关闭</el-button>
          <el-button type="primary" @click="handleConfirmClose(true)">
            保存并关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.budget-book-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  &.main-content {
    margin-bottom: 0;
  }
}

.budget-toolbar-panel,
.budget-workspace-panel {
  background: #fff;
  border: 1px solid #d8e3f1;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgb(28 52 84 / 8%);
}

.budget-toolbar-panel {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 18px;
  background:
    radial-gradient(
      circle at top right,
      rgb(95 177 255 / 18%),
      transparent 32%
    ),
    linear-gradient(180deg, #f9fbff 0%, #edf4fb 100%);
}

.budget-toolbar-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-top: 8px;
}

.budget-toolbar-title {
  font-size: 24px;
  font-weight: 700;
  color: #16416c;
  letter-spacing: 0.04em;
}

.budget-toolbar-subtitle {
  font-size: 13px;
  color: #5d7897;
}

.budget-toolbar-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}

.budget-toolbar-group {
  display: flex;
  gap: 8px;
  padding-right: 12px;
  border-right: 1px solid #d8e5f3;

  &:last-child {
    padding-right: 0;
    border-right: 0;
  }
}

.budget-toolbar-action {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 70px;
  padding: 8px 10px;
  font-size: 12px;
  color: #35506f;
  cursor: pointer;
  background: rgb(255 255 255 / 92%);
  border: 1px solid #dce8f4;
  border-radius: 14px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    border-color: #91bbe8;
    box-shadow: 0 10px 24px rgb(62 118 184 / 16%);
    transform: translateY(-1px);
  }
}

.budget-toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 20px;
  color: #2f6fd8;
  background: linear-gradient(180deg, #edf5ff 0%, #dbeaff 100%);
  border-radius: 10px;
}

.budget-workspace-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #fbfdff 0%, #f6faff 100%);
}

.budget-main-tabs {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  padding: 10px 14px 0;
  background: linear-gradient(180deg, #f6fbff 0%, #edf4fb 100%);
  border-bottom: 1px solid #d9e6f4;
}

.budget-main-tab-list {
  display: flex;
  gap: 2px;
  min-width: 0;
}

.budget-main-tab {
  min-width: 102px;
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

.budget-shortcuts {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.budget-shortcut-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(180deg, #3dbf61 0%, #258f43 100%);
  border-radius: 999px;
}

.budget-shortcut-link {
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: #214262;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: #1677ff;
  }
}

.budget-close-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-bottom: 8px;
  font-size: 18px;
  color: #7a8da4;
  cursor: pointer;
  background: linear-gradient(180deg, #fff 0%, #eef4fb 100%);
  border: 1px solid #d4deea;
  border-radius: 10px;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    color: #d54242;
    background: linear-gradient(180deg, #fff4f4 0%, #ffe8e8 100%);
    border-color: #efb1b1;
  }
}

.budget-content-grid {
  display: grid;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.fee-main-workspace {
  display: grid;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.fee-main-left {
  box-sizing: border-box;
  display: grid;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dbe6f3;
  border-radius: 12px;
}

.fee-main-left-pane,
.fee-main-right-table {
  background: #fff;
  border: 1px solid #dbe6f3;
  border-radius: 12px;
}

.fee-main-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding: 12px 14px 14px 0;
  overflow: hidden;
}

.fee-main-right-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 0 2px;

  button {
    padding: 0;
    font-size: 13px;
    color: #35506f;
    cursor: pointer;
    background: transparent;
    border: 0;

    &:hover {
      color: #1677ff;
    }
  }
}

.fee-main-right-toolbar__spacer {
  flex: 1 1 auto;
}

.fee-main-template-select {
  width: 260px;
}

.fee-main-close-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 18px;
  color: #7a8da4;
  cursor: pointer;
  background: linear-gradient(180deg, #fff 0%, #eef4fb 100%);
  border: 1px solid #d4deea;
  border-radius: 10px;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    color: #d54242;
    background: linear-gradient(180deg, #fff4f4 0%, #ffe8e8 100%);
    border-color: #efb1b1;
  }
}

.budget-main-table-shell,
.budget-detail-panel {
  min-height: 0;
  overflow: hidden;
}

.budget-main-table-shell {
  padding: 0 14px;
}

.budget-main-divider,
.fee-program-divider,
.fee-main-horizontal-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8px;
  cursor: row-resize;
  background: linear-gradient(180deg, #d8dee8 0%, #ccd4df 100%);

  span {
    width: min(220px, 60%);
    height: 3px;
    background: rgb(255 255 255 / 78%);
    border-radius: 999px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 6%);
  }
}

.fee-main-vertical-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 8px;
  cursor: col-resize;
  background: linear-gradient(90deg, #d8dee8 0%, #ccd4df 100%);

  span {
    width: 3px;
    height: min(220px, 60%);
    background: rgb(255 255 255 / 78%);
    border-radius: 999px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 6%);
  }
}

.budget-detail-panel {
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
  border-top: 1px solid #d6e3f1;
}

.budget-detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
  padding: 10px 14px 0;
  background: linear-gradient(180deg, #eff6fd 0%, #e8f1fb 100%);
  border-bottom: 1px solid #d9e6f4;
}

.budget-detail-tab {
  min-width: 96px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #4a6786;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;

  &.is-active {
    color: #fff;
    background: linear-gradient(180deg, #39a3ff 0%, #2d6fd8 100%);
    border-color: #2d6fd8;
  }
}

.budget-detail-ops {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;

  button {
    padding: 0;
    font-size: 13px;
    color: #35506f;
    cursor: pointer;
    background: transparent;
    border: 0;

    &:hover {
      color: #1677ff;
    }
  }
}

.budget-detail-checkbox {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #36506f;
}

.budget-detail-collapse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.budget-detail-body {
  flex: 1;
  min-height: 0;
  padding: 0 14px 14px;
}

.detail-table-shell,
.fee-program-shell,
.quota-content-shell {
  height: 100%;
  min-height: 0;
}

.detail-table-shell,
.fee-program-shell {
  overflow: hidden;
}

.detail-table-shell--formula {
  display: grid;
  grid-template-rows: 28px minmax(0, 1fr);
  gap: 6px;
}

.formula-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
}

.formula-toolbar__spacer {
  min-width: 1px;
}

.formula-table-shell {
  min-height: 0;
}

.formula-unit {
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: #2b4764;
}

.fee-program-shell {
  display: grid;
  grid-template-rows: 1fr;
  min-height: 0;
}

.quota-content-shell {
  overflow: auto;
}

.quota-content-card {
  min-height: 100%;
  padding: 18px 6px 22px;
  color: #163a5c;

  h3 {
    margin: 0 0 18px;
    font-size: 22px;
    font-weight: 700;
    white-space: pre-line;
  }

  p {
    margin: 0;
    font-size: 16px;
    line-height: 1.9;
    color: #385776;
    white-space: pre-line;
  }
}

:deep(.budget-main-table-shell .vxe-table--render-default),
:deep(.budget-detail-body .vxe-table--render-default) {
  --vxe-ui-table-header-background-color: #fbfdff;
  --vxe-ui-table-row-height-small: 36px;
  --vxe-ui-table-border-color: #dbe6f3;
}

:deep(.budget-main-table-shell .is-selected-row .vxe-body--column),
:deep(.budget-detail-body .is-detail-selected-row .vxe-body--column) {
  background: #9ae76f !important;
}

:deep(.budget-main-table-shell .vxe-header--column),
:deep(.budget-detail-body .vxe-header--column) {
  font-weight: 600;
  color: #294764;
}

:deep(.budget-close-dialog .el-dialog) {
  overflow: hidden;
  border: 1px solid #dbe7f4;
  border-radius: 18px;
  box-shadow: 0 18px 42px rgb(35 76 122 / 18%);
}

:deep(.budget-close-dialog .el-dialog__header) {
  padding: 18px 22px 6px;
  margin-right: 0;
  border-bottom: 1px solid #edf3fa;
}

:deep(.budget-close-dialog .el-dialog__body) {
  padding: 20px 22px 8px;
}

:deep(.budget-close-dialog .el-dialog__footer) {
  padding: 10px 22px 20px;
}

.budget-close-dialog__body {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.budget-close-dialog__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  font-size: 24px;
  color: #f59e0b;
  background: linear-gradient(180deg, #fff7e5 0%, #ffefbf 100%);
  border-radius: 14px;
}

.budget-close-dialog__copy {
  min-width: 0;
}

.budget-close-dialog__title {
  margin: 2px 0 8px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
  color: #173556;
}

.budget-close-dialog__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #5f7690;
}

.budget-close-dialog__footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (width <= 1440px) {
  .budget-toolbar-panel {
    flex-direction: column;
  }

  .budget-main-tabs {
    flex-wrap: wrap;
  }

  .budget-shortcuts {
    margin-left: 0;
  }
}
</style>
