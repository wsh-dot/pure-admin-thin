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

interface BudgetContextMenuItem {
  key: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  submenuPlacement?: "top" | "bottom";
  children?: BudgetContextMenuItem[];
}

type PricingLibraryTabKey = "quota" | "resource" | "indicator";

interface PricingLibraryTreeNode {
  id: string;
  label: string;
  active?: boolean;
  children?: PricingLibraryTreeNode[];
}

interface PricingLibraryTableRow {
  id: string;
  code: string;
  name: string;
  unit: string;
  basePrice?: string;
  laborCost?: string;
  spec?: string;
  price?: string;
  indexPrice?: string;
  equipmentCost?: string;
  buildingCost?: string;
  installCost?: string;
  mainMaterialCost?: string;
  laborCostNoTax?: string;
  materialAdjust?: string;
}

const pricingLibraryTabs: Array<{ key: PricingLibraryTabKey; label: string }> =
  [
    { key: "quota", label: "定额库" },
    { key: "resource", label: "工料机库" },
    { key: "indicator", label: "指标库" }
  ];

const pricingLibraryIndustries = [
  "石油",
  "陕西",
  "甘肃",
  "宁夏",
  "公路",
  "电力",
  "新能源",
  "通信",
  "其他"
];

const quotaTreeNodes: PricingLibraryTreeNode[] = [
  {
    id: "quota-root",
    label: "石油建设安装工程预算定额(2022版)",
    children: [
      { id: "quota-1", label: "第一册 设备安装工程" },
      {
        id: "quota-2",
        label: "第二册 金属罐、气柜及金属结构安装工程",
        active: true
      },
      { id: "quota-3", label: "第三册 工艺管道安装工程" },
      { id: "quota-4", label: "第四册 电气设备安装工程" },
      { id: "quota-5", label: "第五册 自动化控制仪表及通信安装工程" },
      { id: "quota-6", label: "第六册 刷油、防腐蚀、绝热安装工程" },
      { id: "quota-7", label: "第七册 给排水、消防、采暖及通风空调工程" },
      { id: "quota-8", label: "第八册 油(气)田集输管道安装工程" },
      { id: "quota-9", label: "第九册 长距离输送管道工程" }
    ]
  }
];

const resourceTreeNodes: PricingLibraryTreeNode[] = [
  {
    id: "resource-root",
    label: "石油建设安装工程预算定额(2022版)",
    active: true,
    children: [
      { id: "resource-labor", label: "人工" },
      { id: "resource-material", label: "材料" },
      { id: "resource-machine", label: "机械" },
      { id: "resource-main", label: "主材" },
      { id: "resource-equipment", label: "设备" }
    ]
  }
];

const indicatorTreeNodes: PricingLibraryTreeNode[] = [
  {
    id: "indicator-root",
    label: "2025年油气田地面建设工程造价指标",
    children: [
      { id: "indicator-1", label: "第一章 井口装置及工艺管线安装工程" },
      { id: "indicator-2", label: "第二章 井场建筑工程" },
      { id: "indicator-3", label: "第三章 井场数字化工程", active: true },
      { id: "indicator-4", label: "第四章 柱上变压器工程" },
      { id: "indicator-5", label: "第五章 油（水）井套管及油管防腐" },
      { id: "indicator-6", label: "第六章 输送管道工程" },
      { id: "indicator-7", label: "第七章 输电线路工程" },
      { id: "indicator-8", label: "第八章 通信线路工程" },
      { id: "indicator-9", label: "第九章 道路构筑物工程" },
      { id: "indicator-10", label: "第十章 站场及站场模块" },
      { id: "indicator-11", label: "第十一章 储罐制作安装" },
      { id: "indicator-12", label: "第十二章 站场防腐保温工程" },
      { id: "indicator-13", label: "第十三章 站场无损检测" },
      { id: "indicator-14", label: "第十四章 站场建筑工程" },
      { id: "indicator-15", label: "第十五章 站场数字化工程" },
      { id: "indicator-16", label: "第十六章 分布式光伏发电工程" }
    ]
  }
];

const quotaRows: PricingLibraryTableRow[] = [
  {
    id: "quota-row-1",
    code: "1-1",
    name: "单级离心泵,设备重量（t以内）0.5",
    unit: "台",
    basePrice: "569.10",
    laborCost: "378.04"
  },
  {
    id: "quota-row-2",
    code: "1-2",
    name: "单级离心泵,设备重量（t以内）1",
    unit: "台",
    basePrice: "691.74",
    laborCost: "493.20"
  },
  {
    id: "quota-row-3",
    code: "1-3",
    name: "单级离心泵,设备重量（t以内）2",
    unit: "台",
    basePrice: "1025.76",
    laborCost: "734.88"
  },
  {
    id: "quota-row-4",
    code: "1-4",
    name: "单级离心泵,设备重量（t以内）3",
    unit: "台",
    basePrice: "1520.10",
    laborCost: "1142.09"
  },
  {
    id: "quota-row-5",
    code: "1-5",
    name: "单级离心泵,设备重量（t以内）5",
    unit: "台",
    basePrice: "2029.55",
    laborCost: "1581.86"
  },
  {
    id: "quota-row-6",
    code: "1-6",
    name: "单级离心泵,设备重量（t以内）8",
    unit: "台",
    basePrice: "2657.54",
    laborCost: "1788.43"
  },
  {
    id: "quota-row-7",
    code: "1-7",
    name: "单级离心泵,设备重量（t以内）10",
    unit: "台",
    basePrice: "3793.97",
    laborCost: "2736.67"
  },
  {
    id: "quota-row-8",
    code: "1-8",
    name: "单级离心泵,设备重量（t以内）15",
    unit: "台",
    basePrice: "5021.19",
    laborCost: "3666.58"
  }
];

const resourceRows: PricingLibraryTableRow[] = [
  {
    id: "resource-row-1",
    code: "1",
    name: "综合工日",
    spec: "",
    unit: "工日",
    price: "169.6"
  },
  {
    id: "resource-row-2",
    code: "2",
    name: "土石方工程综合工日",
    spec: "",
    unit: "工日",
    price: "91.43"
  },
  {
    id: "resource-row-3",
    code: "RGFBC",
    name: "人工费补差",
    spec: "",
    unit: "元",
    price: "1"
  },
  {
    id: "resource-row-4",
    code: "G001",
    name: "新增人工",
    spec: "",
    unit: "元",
    price: "1"
  }
];

const indicatorRows: PricingLibraryTableRow[] = [
  {
    id: "indicator-row-1",
    code: "25s-1-1",
    name: "3型 一井式",
    unit: "井场",
    indexPrice: "91,879",
    equipmentCost: "57,889",
    buildingCost: "0",
    installCost: "33,990",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  },
  {
    id: "indicator-row-2",
    code: "25s-1-2",
    name: "3型 一井式抽油机安装",
    unit: "井场",
    indexPrice: "67,399",
    equipmentCost: "57,889",
    buildingCost: "0",
    installCost: "9,510",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  },
  {
    id: "indicator-row-3",
    code: "25s-1-3",
    name: "3型 一井式井场工艺管线",
    unit: "井场",
    indexPrice: "5,702",
    equipmentCost: "0",
    buildingCost: "0",
    installCost: "5,702",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  },
  {
    id: "indicator-row-4",
    code: "25s-1-4",
    name: "3型 一井式井场电气",
    unit: "井场",
    indexPrice: "17,452",
    equipmentCost: "0",
    buildingCost: "0",
    installCost: "17,452",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  },
  {
    id: "indicator-row-5",
    code: "25s-1-5",
    name: "3型 一井式防腐费",
    unit: "井场",
    indexPrice: "598",
    equipmentCost: "0",
    buildingCost: "0",
    installCost: "598",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  },
  {
    id: "indicator-row-6",
    code: "25s-1-6",
    name: "3型 一井式检测费",
    unit: "井场",
    indexPrice: "728",
    equipmentCost: "0",
    buildingCost: "0",
    installCost: "728",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  },
  {
    id: "indicator-row-7",
    code: "25s-1-7",
    name: "3型 二井式",
    unit: "井场",
    indexPrice: "163,425",
    equipmentCost: "115,778",
    buildingCost: "0",
    installCost: "47,647",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  },
  {
    id: "indicator-row-8",
    code: "25s-1-8",
    name: "3型 二井式抽油机安装",
    unit: "井场",
    indexPrice: "134,798",
    equipmentCost: "115,778",
    buildingCost: "0",
    installCost: "19,020",
    mainMaterialCost: "0",
    laborCostNoTax: "0",
    materialAdjust: "0"
  }
];

const pageRootRef = ref<HTMLElement | null>(null);
const contentSplitRef = ref<HTMLElement | null>(null);
const feeSplitRef = ref<HTMLElement | null>(null);
const feeMainRootRef = ref<HTMLElement | null>(null);
const feeMainLeftRef = ref<HTMLElement | null>(null);
const pageViewportHeight = ref(0);
const closeConfirmDialogVisible = ref(false);
const pricingLibraryDialogVisible = ref(false);
const activePricingLibraryTab = ref<PricingLibraryTabKey>("quota");
const budgetContextMenuRef = ref<HTMLElement | null>(null);
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
const budgetContextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  activeSubmenuKey: ""
});
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

const budgetContextMenuGroups: BudgetContextMenuItem[][] = [
  [
    {
      key: "select",
      label: "选择",
      children: [
        { key: "select-quota", label: "定额" },
        { key: "select-indicator", label: "指标" },
        { key: "select-resource", label: "工料机" }
      ]
    },
    {
      key: "add",
      label: "增加",
      children: [
        { key: "add-division", label: "分部", icon: "ri:node-tree" },
        { key: "add-quota", label: "定额", icon: "ri:calendar-check-line" },
        { key: "add-indicator", label: "指标", icon: "ri:price-tag-3-line" },
        { key: "add-calc", label: "计算项", icon: "ri:list-check-3" },
        { key: "add-other-fee", label: "其他费用项", icon: "ri:coin-line" },
        { key: "add-labor", label: "人工", icon: "ri:registered-line" },
        { key: "add-material", label: "材料", icon: "ri:copyright-line" },
        { key: "add-machine", label: "机械", icon: "ri:registered-line" },
        { key: "add-main-material", label: "主材", icon: "ri:alphabet-z" },
        { key: "add-equipment", label: "设备", icon: "ri:alphabet-s" }
      ]
    }
  ],
  [
    {
      key: "cut",
      label: "剪切",
      icon: "ri:scissors-cut-line",
      shortcut: "Ctrl+X"
    },
    {
      key: "copy",
      label: "复制",
      icon: "ri:file-copy-2-line",
      shortcut: "Ctrl+C"
    },
    {
      key: "paste",
      label: "粘贴",
      icon: "ri:clipboard-line",
      shortcut: "Ctrl+V"
    },
    {
      key: "delete",
      label: "删除",
      icon: "ri:delete-bin-line",
      shortcut: "Delete"
    },
    { key: "restore", label: "恢复", disabled: true },
    { key: "temp-delete", label: "临时删除" },
    { key: "cancel-temp-delete", label: "取消临时删除" },
    { key: "delete-all-temp", label: "删除所有临时删除项" }
  ],
  [
    {
      key: "swap-main-resource",
      label: "主材设备互换",
      shortcut: "Ctrl+E",
      disabled: true
    },
    {
      key: "relate-quota",
      label: "关联定额",
      children: [
        { key: "relate-current", label: "当前定额" },
        { key: "relate-all", label: "全部专业" }
      ]
    },
    { key: "child-review-info", label: "子目审核信息", disabled: true }
  ],
  [
    {
      key: "save-to",
      label: "保存到",
      submenuPlacement: "bottom",
      children: [
        { key: "save-quota-lib", label: "我的定额库", disabled: true },
        { key: "save-resource-lib", label: "我的工料机库", disabled: true },
        { key: "save-division-template", label: "我的分项模板" }
      ]
    },
    {
      key: "import-export",
      label: "导入/导出",
      submenuPlacement: "bottom",
      children: [
        { key: "block-import", label: "块导入", icon: "ri:login-box-line" },
        { key: "block-export", label: "块导出", icon: "ri:logout-box-line" },
        { key: "import-v3", label: "块导入3.0文件", icon: "ri:login-box-line" },
        { key: "import-calc-table", label: "导入工程量计算表" },
        { key: "import-quantity-list", label: "导入算量清单" }
      ]
    }
  ],
  [
    {
      key: "batch",
      label: "批量",
      submenuPlacement: "bottom",
      children: [
        { key: "batch-coeff", label: "工程量乘系数" },
        { key: "set-child-fee", label: "设置子目增加费" },
        { key: "cancel-child-fee", label: "取消子目增加费" },
        { key: "cancel-selected-quota-fee", label: "取消选中定额增加费" },
        { key: "restore-selected-quota-fee", label: "恢复选中定额增加费" }
      ]
    },
    {
      key: "quota",
      label: "定额",
      submenuPlacement: "bottom",
      children: [
        { key: "refresh-quota", label: "刷新定额" },
        { key: "cancel-selected-quota-adjust", label: "取消选中定额调整" },
        { key: "cancel-all-quota-adjust", label: "取消所有定额调整" },
        { key: "replace-quota", label: "定额替换" }
      ]
    },
    { key: "sort-selected-node", label: "选中节点下排序" },
    {
      key: "check",
      label: "检查",
      submenuPlacement: "bottom",
      children: [
        { key: "check-quantity-negative", label: "检查工程量为负" },
        { key: "check-labor-consume-negative", label: "检查人材机消耗为负" },
        { key: "check-labor-consume-zero", label: "检查人材机消耗为0" },
        { key: "check-quota-zero", label: "删除定额(数量*单价)工程量为0" },
        {
          key: "check-quota-resource-match",
          label: "定额工程量与主材设备工程量是否匹配"
        },
        { key: "check-fee-proportion", label: "定额取费合计占比总造价比例" }
      ]
    },
    {
      key: "display-settings",
      label: "显示设置",
      submenuPlacement: "bottom",
      children: [
        { key: "set-color", label: "设置颜色" },
        { key: "column-show-hide", label: "列显示/隐藏" },
        {
          key: "show-review-mark",
          label: "显示审核标记",
          icon: "ri:checkbox-line"
        }
      ]
    }
  ],
  [
    { key: "lock-column", label: "锁定在此列", icon: "ri:lock-line" },
    {
      key: "unlock-column",
      label: "撤销列锁定",
      icon: "ri:lock-unlock-line",
      disabled: true
    }
  ]
];

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
const currentPricingTreeNodes = computed(() => {
  if (activePricingLibraryTab.value === "resource") return resourceTreeNodes;
  if (activePricingLibraryTab.value === "indicator") return indicatorTreeNodes;
  return quotaTreeNodes;
});
const currentPricingRows = computed(() => {
  if (activePricingLibraryTab.value === "resource") return resourceRows;
  if (activePricingLibraryTab.value === "indicator") return indicatorRows;
  return quotaRows;
});
const pricingLibraryTitle = computed(() => {
  if (activePricingLibraryTab.value === "resource") {
    return "工料机 石油建设安装工程预算定额（2022版） 工料机库";
  }

  if (activePricingLibraryTab.value === "indicator") {
    return "指标 2025年油气田地面建设工程造价指标";
  }

  return "定额 石油建设安装工程预算定额（2022版）";
});
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

  if (label === "定额计价") {
    pricingLibraryDialogVisible.value = true;
    activePricingLibraryTab.value = "quota";
    return;
  }

  message(`${label}功能暂未接入，当前为原型实现`, { type: "info" });
}

function handlePricingTabClick(key: PricingLibraryTabKey) {
  activePricingLibraryTab.value = key;
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

function hideBudgetContextMenu() {
  budgetContextMenu.visible = false;
  budgetContextMenu.activeSubmenuKey = "";
}

async function handleBudgetContextMenu(event: MouseEvent) {
  if (activeMainTab.value !== "budget") return;

  budgetContextMenu.visible = true;
  budgetContextMenu.activeSubmenuKey = "";
  budgetContextMenu.x = event.clientX;
  budgetContextMenu.y = event.clientY;

  await nextTick();

  const menuRect = budgetContextMenuRef.value?.getBoundingClientRect();
  const menuWidth = menuRect?.width ?? 262;
  const menuHeight = menuRect?.height ?? 0;

  budgetContextMenu.x = Math.max(
    8,
    Math.min(event.clientX, window.innerWidth - menuWidth - 8)
  );
  budgetContextMenu.y = Math.max(
    8,
    Math.min(event.clientY, window.innerHeight - menuHeight - 8)
  );
}

function handleBudgetContextMenuAction(item: BudgetContextMenuItem) {
  if (item.disabled) return;

  if (item.children) {
    budgetContextMenu.activeSubmenuKey =
      budgetContextMenu.activeSubmenuKey === item.key ? "" : item.key;
    return;
  }

  hideBudgetContextMenu();
  message(`${item.label}功能暂未接入，当前为原型实现`, { type: "info" });
}

function handleBudgetContextMenuItemEnter(item: BudgetContextMenuItem) {
  if (item.children) {
    budgetContextMenu.activeSubmenuKey = item.key;
  }
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
  window.addEventListener("click", hideBudgetContextMenu);
  window.addEventListener("blur", hideBudgetContextMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", schedulePageViewportHeightUpdate);
  window.removeEventListener("click", hideBudgetContextMenu);
  window.removeEventListener("blur", hideBudgetContextMenu);
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
        @contextmenu.prevent="handleBudgetContextMenu"
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

    <Teleport to="body">
      <div
        v-if="budgetContextMenu.visible"
        ref="budgetContextMenuRef"
        class="budget-context-menu"
        :style="{
          left: `${budgetContextMenu.x}px`,
          top: `${budgetContextMenu.y}px`
        }"
        @click.stop
        @contextmenu.prevent.stop
      >
        <div
          v-for="(group, groupIndex) in budgetContextMenuGroups"
          :key="groupIndex"
          class="budget-context-menu__group"
        >
          <div
            v-for="item in group"
            :key="item.key"
            class="budget-context-menu__item"
            :class="{
              'is-disabled': item.disabled,
              'has-children': item.children,
              'is-open': budgetContextMenu.activeSubmenuKey === item.key
            }"
            role="menuitem"
            tabindex="-1"
            @click="handleBudgetContextMenuAction(item)"
            @mouseenter="handleBudgetContextMenuItemEnter(item)"
          >
            <span class="budget-context-menu__icon">
              <IconifyIconOnline v-if="item.icon" :icon="item.icon" />
            </span>
            <span class="budget-context-menu__label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="budget-context-menu__shortcut">
              {{ item.shortcut }}
            </span>
            <span v-else-if="item.children" class="budget-context-menu__arrow">
              <IconifyIconOnline icon="ri:arrow-right-s-line" />
            </span>

            <div
              v-if="item.children?.length"
              class="budget-context-menu budget-context-menu--submenu"
              :class="{
                'budget-context-menu--submenu-bottom':
                  item.submenuPlacement === 'bottom'
              }"
            >
              <div
                v-for="child in item.children"
                :key="child.key"
                class="budget-context-menu__item"
                :class="{ 'is-disabled': child.disabled }"
                role="menuitem"
                tabindex="-1"
                @click.stop="handleBudgetContextMenuAction(child)"
              >
                <span class="budget-context-menu__icon">
                  <IconifyIconOnline v-if="child.icon" :icon="child.icon" />
                </span>
                <span class="budget-context-menu__label">
                  {{ child.label }}
                </span>
                <span
                  v-if="child.shortcut"
                  class="budget-context-menu__shortcut"
                >
                  {{ child.shortcut }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <el-dialog
      v-model="pricingLibraryDialogVisible"
      width="min(1060px, calc(100vw - 40px))"
      class="pricing-library-dialog"
      :show-close="true"
      :close-on-click-modal="false"
      :destroy-on-close="false"
      align-center
    >
      <template #header>
        <div class="pricing-library-title">定额计价</div>
      </template>

      <section class="pricing-library-shell">
        <div class="pricing-library-tabs">
          <button
            v-for="tab in pricingLibraryTabs"
            :key="tab.key"
            class="pricing-library-tab"
            :class="{ 'is-active': tab.key === activePricingLibraryTab }"
            type="button"
            @click="handlePricingTabClick(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="pricing-library-filters">
          <template v-if="activePricingLibraryTab === 'indicator'">
            <span>年度:</span>
            <el-select
              size="small"
              model-value="全部"
              class="pricing-filter-year"
            >
              <el-option label="全部" value="全部" />
              <el-option label="2025" value="2025" />
            </el-select>
          </template>

          <template v-else>
            <el-radio-group model-value="石油" size="small">
              <el-radio
                v-for="industry in pricingLibraryIndustries"
                :key="industry"
                :label="industry"
              />
            </el-radio-group>
          </template>

          <span class="pricing-library-filter-title">
            {{ pricingLibraryTitle }}
          </span>
          <el-button class="pricing-library-select-arrow" size="small">
            <IconifyIconOnline icon="ep:arrow-down" />
          </el-button>
        </div>

        <div class="pricing-library-body">
          <aside class="pricing-library-left">
            <div class="pricing-library-search-tabs">
              <button class="is-active" type="button">章节查询</button>
              <button type="button">条件查询</button>
            </div>

            <div class="pricing-library-tree">
              <div
                v-for="node in currentPricingTreeNodes"
                :key="node.id"
                class="pricing-tree-node"
                :class="{ 'is-active': node.active }"
              >
                <IconifyIconOnline icon="ri:folder-open-line" />
                <span>{{ node.label }}</span>
              </div>

              <template
                v-for="node in currentPricingTreeNodes"
                :key="`${node.id}-children`"
              >
                <div
                  v-for="child in node.children"
                  :key="child.id"
                  class="pricing-tree-node pricing-tree-node--child"
                  :class="{ 'is-active': child.active }"
                >
                  <IconifyIconOnline
                    :icon="
                      activePricingLibraryTab === 'resource'
                        ? 'ri:file-line'
                        : 'ri:folder-2-line'
                    "
                  />
                  <span>{{ child.label }}</span>
                </div>
              </template>
            </div>
          </aside>

          <main
            class="pricing-library-right"
            :class="{
              'pricing-library-right--table-only':
                activePricingLibraryTab === 'resource'
            }"
          >
            <div class="pricing-table-shell">
              <vxe-table
                border
                size="small"
                height="100%"
                show-overflow="title"
                :data="currentPricingRows"
                :row-config="{ isHover: true, keyField: 'id' }"
              >
                <vxe-column type="seq" width="48" align="center" />
                <vxe-column field="code" title="编号" width="88" />
                <vxe-column field="name" title="名称" min-width="230" />

                <template v-if="activePricingLibraryTab === 'quota'">
                  <vxe-column field="unit" title="单位" width="64" />
                  <vxe-column
                    field="basePrice"
                    title="定额基价"
                    width="92"
                    align="right"
                  />
                  <vxe-column
                    field="laborCost"
                    title="人工费"
                    width="92"
                    align="right"
                  />
                </template>

                <template v-else-if="activePricingLibraryTab === 'resource'">
                  <vxe-column field="spec" title="规格" min-width="160" />
                  <vxe-column field="unit" title="单位" width="72" />
                  <vxe-column
                    field="price"
                    title="单价"
                    width="96"
                    align="right"
                  />
                </template>

                <template v-else>
                  <vxe-column field="unit" title="单位" width="58" />
                  <vxe-column
                    field="indexPrice"
                    title="指标价"
                    width="88"
                    align="right"
                  />
                  <vxe-column
                    field="equipmentCost"
                    title="设备费"
                    width="88"
                    align="right"
                  />
                  <vxe-column
                    field="buildingCost"
                    title="建筑费"
                    width="80"
                    align="right"
                  />
                  <vxe-column
                    field="installCost"
                    title="安装费"
                    width="88"
                    align="right"
                  />
                  <vxe-column
                    field="mainMaterialCost"
                    title="主材费"
                    width="80"
                    align="right"
                  />
                  <vxe-column
                    field="laborCostNoTax"
                    title="人工费下..."
                    width="86"
                    align="right"
                  />
                  <vxe-column
                    field="materialAdjust"
                    title="材机调整..."
                    width="86"
                    align="right"
                  />
                </template>
              </vxe-table>
            </div>

            <div
              v-if="activePricingLibraryTab !== 'resource'"
              class="pricing-library-desc"
            >
              <div class="pricing-library-desc-tabs">
                <button type="button">
                  {{
                    activePricingLibraryTab === "indicator"
                      ? "指标消耗"
                      : "定额消耗"
                  }}
                </button>
                <button class="is-active" type="button">
                  {{
                    activePricingLibraryTab === "indicator"
                      ? "指标说明"
                      : "定额说明"
                  }}
                </button>
              </div>

              <div class="pricing-library-desc-content">
                <template v-if="activePricingLibraryTab === 'quota'">
                  <p>第一册 设备安装工程</p>
                  <p class="pricing-desc-heading">册说明</p>
                  <p>
                    一、适用范围：《设备安装工程》适用于机械设备安装、静置设备制作及安装、工业炉窑砌筑安装、工业炉窑砌筑、燃气轮机安装等工程。
                  </p>
                  <p>
                    二、编制依据：石油建设安装工程预算定额、通用安装工程消耗量定额、化工建筑安装工程预算定额及相关行业检修定额。
                  </p>
                  <p>
                    三、本册定额按常规施工条件编制，除另有说明外，均包括施工准备、场内运输、安装及配合调试等工作内容。
                  </p>
                </template>

                <template v-else>
                  <p>
                    本章适用于采油、采气、注水、水源井等井口装置及井场工艺管线安装等工程内容。
                  </p>
                  <p class="pricing-desc-heading">一、指标内容</p>
                  <p>
                    油田井场及工艺管线安装综合指标主要包括抽油机及井场工艺安装、井场电气安装、防腐及检测等内容。
                  </p>
                  <p>
                    指标按井场井数及工艺类型划分，可用于快速测算设备费、安装费、建筑费、主材费等造价构成。
                  </p>
                  <p class="pricing-desc-heading">二、指标工序范围</p>
                  <p>
                    包括抽油机安装、管线安装、阀组安装、焊缝无损检测、防腐处理、井场电气及配套施工内容。
                  </p>
                </template>
              </div>
            </div>
          </main>
        </div>
      </section>
    </el-dialog>

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

.budget-context-menu {
  position: fixed;
  z-index: 50;
  width: 262px;
  padding: 4px 0;
  font-size: 15px;
  color: #111827;
  background: #fff;
  border: 1px solid #1e9cff;
  box-shadow: 0 8px 18px rgb(25 77 128 / 16%);
}

.budget-context-menu__group {
  padding: 4px 0;
  border-bottom: 1px solid #e4e7ed;

  &:last-child {
    border-bottom: 0;
  }
}

.budget-context-menu__item {
  position: relative;
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  gap: 6px;
  align-items: center;
  min-height: 30px;
  padding: 0 8px 0 10px;
  line-height: 30px;
  cursor: default;
  user-select: none;

  &:hover {
    background: #e7f3ff;
  }

  &.is-disabled {
    color: #9ca3af;

    &:hover {
      background: transparent;
    }
  }
}

.budget-context-menu__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: #2f75c8;
}

.budget-context-menu__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.budget-context-menu__shortcut {
  min-width: 58px;
  color: #9ca3af;
  text-align: right;
  white-space: nowrap;
}

.budget-context-menu__arrow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 18px;
  font-size: 16px;
  color: #6b7280;
}

.budget-context-menu--submenu {
  position: absolute;
  top: -5px;
  left: calc(100% - 1px);
  display: none;
  width: max-content;
  min-width: 128px;
  max-width: min(360px, calc(100vw - 24px));
}

.budget-context-menu--submenu-bottom {
  top: auto;
  bottom: -5px;
}

.budget-context-menu__item.has-children:hover > .budget-context-menu--submenu,
.budget-context-menu__item.has-children.is-open
  > .budget-context-menu--submenu {
  display: block;
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

:deep(.pricing-library-dialog .el-dialog) {
  overflow: hidden;
  background: #f7fbff;
  border: 2px solid #0c8fe8;
  border-radius: 0;
  box-shadow: 0 14px 38px rgb(32 70 110 / 22%);
}

:deep(.pricing-library-dialog .el-dialog__header) {
  padding: 10px 14px 4px;
  margin-right: 0;
  background: #f7fbff;
}

:deep(.pricing-library-dialog .el-dialog__headerbtn) {
  top: 8px;
  right: 10px;
  width: 28px;
  height: 28px;
}

:deep(.pricing-library-dialog .el-dialog__body) {
  padding: 0 14px 14px;
}

.pricing-library-title {
  font-size: 18px;
  font-weight: 500;
  color: #0080d7;
}

.pricing-library-shell {
  display: flex;
  flex-direction: column;
  height: min(790px, calc(100vh - 120px));
  min-height: 560px;
  overflow: hidden;
  color: #001b34;
  background: #e9f4fb;
}

.pricing-library-tabs {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  min-height: 30px;
  padding: 4px 8px 0;
  background: #dcebf4;
  border-bottom: 1px solid #c5d8e5;
}

.pricing-library-tab {
  min-width: 82px;
  height: 26px;
  padding: 0 16px;
  font-size: 14px;
  color: #31445a;
  cursor: pointer;
  background: #f8f8f8;
  border: 1px solid #d6dde4;
  border-bottom: 0;

  &.is-active {
    color: #fff;
    background: #2ba6df;
    border-color: #2ba6df;
  }
}

.pricing-library-filters {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 36px;
  padding: 0 8px;
  font-size: 14px;
  background: #e7f1f8;
  border-bottom: 1px solid #d6e2ec;

  :deep(.el-radio) {
    height: 24px;
    margin-right: 10px;
  }

  :deep(.el-radio__label) {
    padding-left: 4px;
    font-size: 14px;
  }
}

.pricing-filter-year {
  width: 100px;
}

.pricing-library-filter-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pricing-library-select-arrow {
  width: 28px;
  min-width: 28px;
  padding: 0;
}

.pricing-library-body {
  display: grid;
  flex: 1;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.pricing-library-left {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid #c9d8e2;
}

.pricing-library-search-tabs,
.pricing-library-desc-tabs {
  display: flex;
  align-items: flex-end;
  min-height: 30px;
  background: #e2eef6;
  border-bottom: 1px solid #c7d8e6;

  button {
    min-width: 98px;
    height: 29px;
    font-size: 14px;
    color: #415064;
    cursor: pointer;
    background: #f7f7f7;
    border: 1px solid #d1dbe4;
    border-bottom: 0;

    &.is-active {
      color: #0074d0;
      background: #fff;
    }
  }
}

.pricing-library-tree {
  flex: 1;
  min-height: 0;
  padding: 10px 8px;
  overflow: auto;
  background: #fff;
}

.pricing-tree-node {
  display: flex;
  gap: 6px;
  align-items: center;
  height: 32px;
  padding: 0 6px;
  overflow: hidden;
  font-size: 15px;
  line-height: 32px;
  white-space: nowrap;

  svg {
    flex: 0 0 auto;
    color: #f2a41a;
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.is-active {
    background: #eaf8e4;
  }
}

.pricing-tree-node--child {
  padding-left: 20px;
}

.pricing-library-right {
  display: grid;
  grid-template-rows: minmax(0, 1fr) 186px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #f7f7f7;
}

.pricing-library-right--table-only {
  grid-template-rows: minmax(0, 1fr);
}

.pricing-table-shell {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.pricing-library-desc {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-top: 1px solid #c7d8e6;
}

.pricing-library-desc-tabs {
  min-height: 30px;
}

.pricing-library-desc-content {
  flex: 1;
  min-height: 0;
  padding: 8px 4px;
  overflow: auto;
  font-size: 16px;
  line-height: 1.45;
  color: #000;
  white-space: normal;
  background: #f7f7ff;

  p {
    margin: 0 0 8px;
  }
}

.pricing-desc-heading {
  font-weight: 700;
}

:deep(.pricing-table-shell .vxe-table--render-default) {
  --vxe-ui-table-header-background-color: #f5f5f5;
  --vxe-ui-table-row-height-small: 35px;
  --vxe-ui-table-border-color: #d0d0d0;
}

:deep(.pricing-table-shell .vxe-body--row.row--hover .vxe-body--column) {
  background: #ecfae7;
}

@media (width <= 900px) {
  .pricing-library-body {
    grid-template-columns: minmax(210px, 34%) minmax(0, 1fr);
  }

  .pricing-library-shell {
    min-height: 520px;
  }
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
