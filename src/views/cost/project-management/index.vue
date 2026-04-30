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
import {
  buildAuditSections,
  buildPropertyRows,
  stageConfigs,
  stageOptions,
  workTabs
} from "./mock";
import { buildReportWorkspaceContext } from "./projectReportMock";
import type {
  ReportWorkspaceContext,
  WorkbenchRow,
  WorkbenchStageConfig,
  WorkbenchStageKey
} from "./types";
import { useOverlayPanelResize } from "./hooks/useOverlayPanelResize";
import {
  consumeProjectManagementSnapshot,
  saveProjectManagementSnapshot
} from "./workspaceState";
import WorkbenchColumnNode from "./components/WorkbenchColumnNode.vue";
import MaterialSummaryWorkspace from "./components/MaterialSummaryWorkspace.vue";
import ProjectReportWorkspace from "./components/ProjectReportWorkspace.vue";

import Add from "~icons/ri/add-circle-line";
import FolderOpen from "~icons/ri/folder-open-line";
import Import from "~icons/ri/download-2-line";
import Export from "~icons/ri/upload-2-line";
import Save from "~icons/ri/save-line";
import ShieldCheck from "~icons/ri/shield-check-line";
import Search from "~icons/ri/search-line";
import Calculator from "~icons/ri/calculator-line";
import ArrowUp from "~icons/ri/arrow-up-line";
import ArrowDown from "~icons/ri/arrow-down-line";
import BarChart from "~icons/ri/bar-chart-grouped-line";
import Collapse from "~icons/ri/node-tree";
import Eraser from "~icons/ri/eraser-line";
import Repeat from "~icons/ri/repeat-line";
import Printer from "~icons/ri/printer-line";
import Refresh from "~icons/ri/refresh-line";
import Eye from "~icons/ri/eye-line";
import Pdf from "~icons/ri/file-pdf-2-line";
import Settings3 from "~icons/ri/settings-3-line";
import ArrowRightS from "~icons/ri/arrow-right-s-line";
import FileAdd from "~icons/ri/file-add-line";
import FileCopy from "~icons/ri/file-copy-2-line";
import Scissors from "~icons/ri/scissors-cut-line";
import Clipboard from "~icons/ri/clipboard-line";
import DeleteBin from "~icons/ri/delete-bin-line";
import UploadCloud from "~icons/ri/upload-cloud-line";
import Lock from "~icons/ri/lock-line";
import LockUnlock from "~icons/ri/lock-unlock-line";
import Palette from "~icons/ri/palette-line";

defineOptions({
  name: "ProjectManagementWorkbench"
});

const route = useRoute();
const router = useRouter();

const createActions = [
  { key: "project", label: "新建建设项目" },
  { key: "single", label: "新建单项工程" },
  { key: "cost-file", label: "新建造价文件" },
  { key: "rate-file", label: "新建费率文件" }
] as const;

interface CostFileProfile {
  label: string;
  pricingLib: string;
  showLocation: boolean;
  locationOptions: string[];
  basisOptions: string[];
  quotaOptions: string[];
  templateOptions: string[];
}

const costFileProfiles: Record<string, CostFileProfile> = {
  oil: {
    label: "石油",
    pricingLib: "[石油安装22]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["石油安装工程2022计价依据"],
    quotaOptions: ["石油建设安装工程预算定额（2022版）"],
    templateOptions: []
  },
  shaanxi: {
    label: "陕西",
    pricingLib: "[陕西建筑装饰25]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["陕西建筑与装饰工程2025计价依据"],
    quotaOptions: ["陕西省房屋建筑与装饰工程基价表2025"],
    templateOptions: []
  },
  gansu: {
    label: "甘肃",
    pricingLib: "[甘肃建筑装饰19]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["甘肃建筑装饰2019计价依据（庆阳地区）"],
    quotaOptions: ["甘肃省建筑与装饰工程预算定额（2019庆阳地区基价）"],
    templateOptions: []
  },
  ningxia: {
    label: "宁夏",
    pricingLib: "[宁夏建筑装饰19]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["宁夏建筑装饰2019计价依据"],
    quotaOptions: ["宁夏房屋建筑与装饰工程计价定额2019"],
    templateOptions: []
  },
  highway: {
    label: "公路",
    pricingLib: "[公路2018]",
    showLocation: true,
    locationOptions: ["陕西", "甘肃", "宁夏"],
    basisOptions: ["公路2018预算计价依据"],
    quotaOptions: ["公路工程预算定额（JTG / T 3832—2018）"],
    templateOptions: ["部颁2018概预算项目模板"]
  },
  power: {
    label: "电力",
    pricingLib: "[电力2018]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["变电工程2018概预算"],
    quotaOptions: ["电力建设工程预算定额（2018版）"],
    templateOptions: ["变电站工程项目划分表"]
  },
  newEnergy: {
    label: "新能源",
    pricingLib: "[新能源2016]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["光伏发电工程计价依据2016"],
    quotaOptions: ["光伏发电建筑工程概算定额2016"],
    templateOptions: ["光伏发电工程项目划分表"]
  },
  communication: {
    label: "通信",
    pricingLib: "[通信2017]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["通信建设工程2017计价依据"],
    quotaOptions: ["信息通信建设工程预算定额2017"],
    templateOptions: []
  },
  other: {
    label: "其他",
    pricingLib: "[电子2005]",
    showLocation: false,
    locationOptions: [],
    basisOptions: ["电子建设工程计价依据"],
    quotaOptions: ["电子工程预算定额2005"],
    templateOptions: []
  }
} as const;

const costFileCategoryOrder = [
  "oil",
  "shaanxi",
  "gansu",
  "ningxia",
  "highway",
  "power",
  "newEnergy",
  "communication",
  "other"
] as const;

type CostFileCategoryKey = (typeof costFileCategoryOrder)[number];

interface ContextMenuItem {
  key: string;
  label: string;
  icon?: any;
  disabled?: boolean;
  children?: ContextMenuItem[];
}

const toolbarGroups = [
  [
    { key: "new", label: "新建", icon: Add },
    { key: "open", label: "打开", icon: FolderOpen },
    { key: "import", label: "导入", icon: Import },
    { key: "export", label: "导出", icon: Export },
    { key: "save", label: "保存", icon: Save },
    { key: "review", label: "审核", icon: ShieldCheck },
    { key: "search", label: "查找", icon: Search },
    { key: "calculate", label: "计算", icon: Calculator }
  ],
  [
    { key: "move-up", label: "上移", icon: ArrowUp },
    { key: "move-down", label: "下移", icon: ArrowDown },
    { key: "upgrade", label: "升级", icon: BarChart },
    { key: "downgrade", label: "降级", icon: BarChart },
    { key: "expand", label: "展开层级", icon: Collapse }
  ],
  [
    { key: "clear", label: "清除颜色", icon: Eraser },
    { key: "switch", label: "切换计价模式", icon: Repeat }
  ]
];

const summaryToolbarGroups = [
  [
    { key: "save", label: "保存", icon: Save },
    { key: "export-excel", label: "导出excel", icon: Export },
    { key: "search", label: "查找", icon: Search },
    { key: "calculate", label: "计算", icon: Calculator },
    { key: "batch-price", label: "批量刷价", icon: BarChart }
  ],
  [
    { key: "excel-price", label: "excel刷价", icon: Import },
    { key: "summary", label: "汇总", icon: Collapse },
    { key: "sync-cost-file", label: "更新到造价文件", icon: Repeat },
    { key: "clear", label: "清除颜色", icon: Eraser }
  ]
] as const;

const reportToolbarGroups = [
  [
    { key: "save", label: "保存", icon: Save },
    { key: "import-template", label: "导入模板", icon: Import },
    { key: "export-template", label: "导出模板", icon: Export },
    { key: "calculate", label: "计算", icon: Calculator },
    { key: "refresh", label: "刷新", icon: Refresh },
    { key: "preview", label: "预览", icon: Eye },
    { key: "print", label: "打印", icon: Printer }
  ],
  [
    { key: "export-excel", label: "导出Excel", icon: Export },
    { key: "export-pdf", label: "导出PDF", icon: Pdf },
    { key: "report-settings", label: "设置报表", icon: Settings3 },
    { key: "clear", label: "清除颜色", icon: Eraser }
  ]
] as const;

const projectContextMenuGroups: ContextMenuItem[][] = [
  [
    {
      key: "new",
      label: "新建",
      children: [
        { key: "new-project", label: "建设项目", icon: FileAdd },
        {
          key: "new-single",
          label: "单项工程",
          icon: FileCopy,
          disabled: true
        },
        { key: "new-cost-file", label: "造价文件", icon: Save, disabled: true }
      ]
    }
  ],
  [
    { key: "cut", label: "剪切", icon: Scissors, disabled: true },
    { key: "copy", label: "复制", icon: FileCopy, disabled: true },
    { key: "paste", label: "粘贴", icon: Clipboard, disabled: true },
    { key: "delete", label: "删除", icon: DeleteBin, disabled: true },
    { key: "restore-delete", label: "还原删除", disabled: true },
    { key: "review-delete", label: "审核删除", disabled: true },
    { key: "restore-review-delete", label: "恢复审核删除", disabled: true }
  ],
  [
    { key: "renumber", label: "重新编号" },
    { key: "unify-status", label: "统一项目状态", disabled: true },
    {
      key: "batch-template",
      label: "批量取费模板",
      disabled: true,
      children: []
    },
    { key: "pricing-basis", label: "计价依据", disabled: true, children: [] },
    { key: "update", label: "更新", children: [] }
  ],
  [
    { key: "order", label: "顺序", disabled: true, children: [] },
    { key: "level", label: "层次", disabled: true, children: [] }
  ],
  [
    { key: "import-as-project", label: "导入为一级项目" },
    { key: "import", label: "导入", children: [] },
    { key: "export", label: "导出", disabled: true, children: [] },
    { key: "choose-template", label: "选择典型工程模板" }
  ],
  [
    { key: "upload", label: "上传", icon: UploadCloud, disabled: true },
    { key: "column-show-hide", label: "列显示/隐藏" }
  ],
  [
    { key: "view-save-path", label: "查看文件保存路径" },
    { key: "sync-review-data", label: "同步项目审核甲供数据" },
    { key: "get-review-data", label: "获取报审数据", disabled: true },
    {
      key: "display-settings",
      label: "显示设置",
      children: [
        { key: "set-color", label: "设置颜色", icon: Palette },
        { key: "lock-column", label: "锁定此列", icon: Lock },
        { key: "unlock-column", label: "撤销列锁定", icon: LockUnlock }
      ]
    }
  ]
];

const currentStage = ref<WorkbenchStageKey>("budget");
const currentPanelTab = ref<"basic" | "audit">("basic");
const activeMainTab = ref<(typeof workTabs)[number]>(workTabs[0]);
const selectedRowId = ref<string>("");
const workbenchRootRef = ref<HTMLElement | null>(null);
const boardRef = ref<HTMLElement | null>(null);
const mainTableRef = ref<any>(null);
const createProjectDialogVisible = ref(false);
const createCostFileDialogVisible = ref(false);
const reportConfirmDialogVisible = ref(false);
const reportWorkspaceContext = ref<ReportWorkspaceContext | null>(null);
const pendingReportTargetName = ref("");
const createProjectForm = reactive({
  projectCode: "",
  projectName: ""
});
const createCostFileForm = reactive({
  category: "oil" as CostFileCategoryKey,
  fileCode: "",
  fileName: "",
  basis: "",
  quota: "",
  template: "",
  location: ""
});
const projectContextMenuRef = ref<HTMLElement | null>(null);
const projectContextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  activeSubmenuKey: ""
});

const editableStageConfigs = ref(
  stageConfigs.map(config => ({
    ...config,
    rows: config.rows.map(row => ({
      ...row,
      infoValues: row.infoValues ? { ...row.infoValues } : undefined,
      auditNoteValues: row.auditNoteValues
        ? { ...row.auditNoteValues }
        : undefined
    }))
  }))
);

const overlayPanel = useOverlayPanelResize();
const panelCollapsed = overlayPanel.collapsed;
const overlayVisibleWidth = overlayPanel.visibleWidth;
const isMaterialSummaryTab = computed(
  () => activeMainTab.value === workTabs[2]
);
const isProjectReportTab = computed(() => activeMainTab.value === workTabs[3]);
const workbenchViewportHeight = ref(0);

const currentStageConfig = computed<WorkbenchStageConfig>(() => {
  return (
    editableStageConfigs.value.find(item => item.key === currentStage.value) ??
    editableStageConfigs.value[0]
  );
});
const currentCostFileProfile = computed(
  () => costFileProfiles[createCostFileForm.category]
);

const currentRow = computed<WorkbenchRow | null>(() => {
  return (
    currentStageConfig.value.rows.find(
      item => item.id === selectedRowId.value
    ) ??
    currentStageConfig.value.rows[0] ??
    null
  );
});

const propertyRows = computed(() => buildPropertyRows(currentRow.value));
const auditSections = computed(() => buildAuditSections(currentRow.value));
const workbenchRootStyle = computed(() => {
  return workbenchViewportHeight.value
    ? { height: `${workbenchViewportHeight.value}px` }
    : undefined;
});

watch(
  currentStageConfig,
  config => {
    selectedRowId.value = config.rows[0]?.id ?? "";
  },
  { immediate: true }
);

watch(activeMainTab, async () => {
  await nextTick();
  updateWorkbenchViewportHeight();
});

function updateWorkbenchViewportHeight() {
  const root = workbenchRootRef.value;

  if (!root) return;

  const top = root.getBoundingClientRect().top;
  workbenchViewportHeight.value = Math.max(window.innerHeight - top - 8, 480);
}

function handleToolbarAction(label: string) {
  message(`${label}功能暂未接入，当前为原型实现`, { type: "info" });
}

function handleCreateCommand(command: (typeof createActions)[number]["key"]) {
  if (command === "project") {
    createProjectForm.projectCode = "";
    createProjectForm.projectName = "";
    createProjectDialogVisible.value = true;
    return;
  }

  if (command === "cost-file") {
    if (!resolveParentRowForCreate()) {
      message("请先选中一个父级节点，再创建造价文件", {
        type: "warning"
      });
      return;
    }
    resetCostFileForm();
    createCostFileDialogVisible.value = true;
    return;
  }

  const targetLabel =
    createActions.find(item => item.key === command)?.label ?? "该新建项";
  message(`${targetLabel}暂未接入，当前先实现建设项目新增`, {
    type: "info"
  });
}

function handleStageChange(stage: WorkbenchStageKey) {
  currentStage.value = stage;
}

function handleRowSelect({ row }: { row: WorkbenchRow }) {
  selectedRowId.value = row.id;
}

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return typeof value === "string" ? value : "";
}

function isSecondLevelCostFile(row: WorkbenchRow) {
  if (row.nodeType !== "cost-file" || !row.parentId) return false;

  const parentRow = currentStageConfig.value.rows.find(
    item => item.id === row.parentId
  );

  return Boolean(parentRow && parentRow.parentId === null);
}

function readMainTableScrollTop() {
  const scrollState = mainTableRef.value?.getScroll?.();
  return typeof scrollState?.scrollTop === "number" ? scrollState.scrollTop : 0;
}

async function openBudgetBookWorkspace(row: WorkbenchRow) {
  saveProjectManagementSnapshot({
    stageKey: currentStage.value,
    activeMainTab: activeMainTab.value,
    currentPanelTab: currentPanelTab.value,
    selectedRowId: row.id,
    mainScrollTop: readMainTableScrollTop()
  });

  await router.push({
    path: "/project-workbench/budget-book",
    query: {
      stageKey: currentStage.value,
      rowId: row.id,
      projectCode: row.projectCode,
      projectName: row.projectName,
      pricingLib: row.pricingLib
    }
  });
}

async function handleMainTableCellDblclick({
  row,
  column
}: {
  row: WorkbenchRow;
  column: { field?: string };
}) {
  if (column?.field !== "pricingLib" || !isSecondLevelCostFile(row)) return;
  await openBudgetBookWorkspace(row);
}

function hideProjectContextMenu() {
  projectContextMenu.visible = false;
  projectContextMenu.activeSubmenuKey = "";
}

async function handleProjectContextMenu(event: MouseEvent) {
  if (activeMainTab.value !== workTabs[0]) return;

  projectContextMenu.visible = true;
  projectContextMenu.activeSubmenuKey = "";
  projectContextMenu.x = event.clientX;
  projectContextMenu.y = event.clientY;

  await nextTick();

  const menuRect = projectContextMenuRef.value?.getBoundingClientRect();
  const menuWidth = menuRect?.width ?? 226;
  const menuHeight = menuRect?.height ?? 0;

  projectContextMenu.x = Math.max(
    8,
    Math.min(event.clientX, window.innerWidth - menuWidth - 8)
  );
  projectContextMenu.y = Math.max(
    8,
    Math.min(event.clientY, window.innerHeight - menuHeight - 8)
  );
}

function handleContextMenuAction(item: ContextMenuItem) {
  if (item.disabled) return;

  if (item.children) {
    projectContextMenu.activeSubmenuKey =
      projectContextMenu.activeSubmenuKey === item.key ? "" : item.key;
    return;
  }

  hideProjectContextMenu();

  if (item.key === "new-project") {
    handleCreateCommand("project");
    return;
  }

  message(`${item.label}功能暂未接入，当前为原型实现`, { type: "info" });
}

function handleContextMenuItemEnter(item: ContextMenuItem) {
  if (item.children) {
    projectContextMenu.activeSubmenuKey = item.key;
  }
}

function handleMainTabClick(tab: (typeof workTabs)[number] | string) {
  if (tab === activeMainTab.value) return;

  if (tab === workTabs[0] || tab === workTabs[2]) {
    activeMainTab.value = tab;
    return;
  }
  if (tab === workTabs[3]) {
    const selected = currentRow.value;
    if (!selected) {
      message("当前没有可用于生成报表的节点", { type: "warning" });
      return;
    }

    if (selected.nodeType === "cost-file") {
      pendingReportTargetName.value = selected.projectName;
      reportConfirmDialogVisible.value = true;
      return;
    }

    enterProjectReport(selected);
    return;
  }
  message(`${tab}暂未实现，当前先完成项目管理界面`, { type: "info" });
}

function enterProjectReport(sourceRow: WorkbenchRow) {
  reportWorkspaceContext.value = buildReportWorkspaceContext(
    sourceRow,
    currentStageConfig.value.rows
  );
  activeMainTab.value = workTabs[3];
}

function handleReportConfirm() {
  const selected = currentRow.value;

  if (!selected || selected.nodeType !== "cost-file") {
    reportConfirmDialogVisible.value = false;
    return;
  }

  enterProjectReport(selected);
  reportConfirmDialogVisible.value = false;
}

function handleCollapsedOverlayMouseDown(event: MouseEvent) {
  if (!panelCollapsed.value) return;
  overlayPanel.startResize(event, boardRef.value);
}

function applyCostFileProfile(category: CostFileCategoryKey) {
  const profile = costFileProfiles[category];
  createCostFileForm.basis = profile.basisOptions[0] ?? "";
  createCostFileForm.quota = profile.quotaOptions[0] ?? "";
  createCostFileForm.template = profile.templateOptions[0] ?? "";
  createCostFileForm.location = profile.showLocation
    ? profile.locationOptions?.includes(createCostFileForm.location)
      ? createCostFileForm.location
      : ""
    : "";
}

function resetCostFileForm() {
  createCostFileForm.category = "oil";
  createCostFileForm.fileCode = "";
  createCostFileForm.fileName = "";
  createCostFileForm.location = "";
  applyCostFileProfile("oil");
}

watch(
  () => createCostFileForm.category,
  category => {
    applyCostFileProfile(category);
  },
  { immediate: true }
);

function buildProjectInfoValues(projectCode: string, projectName: string) {
  return {
    systemNo: `SY-${projectCode}`,
    projectNo: `XM-${projectCode}`,
    projectCode,
    projectName,
    compileType: "预算",
    budgetCategory: currentStageConfig.value.label
  };
}

function resolveParentRowForCreate() {
  const selected = currentRow.value;

  if (!selected) {
    return (
      currentStageConfig.value.rows.find(item => item.parentId === null) ?? null
    );
  }

  if (selected.nodeType === "cost-file" && selected.parentId) {
    return (
      currentStageConfig.value.rows.find(
        item => item.id === selected.parentId
      ) ?? null
    );
  }

  return selected;
}

function isDescendantRow(
  row: WorkbenchRow,
  ancestorId: string,
  rowLookup: Map<string, WorkbenchRow>
) {
  let currentParentId = row.parentId;

  while (currentParentId) {
    if (currentParentId === ancestorId) return true;
    currentParentId = rowLookup.get(currentParentId)?.parentId ?? null;
  }

  return false;
}

function getInsertIndexForChild(rows: WorkbenchRow[], parentId: string) {
  const rowLookup = new Map(rows.map(item => [item.id, item]));
  const parentIndex = rows.findIndex(item => item.id === parentId);

  if (parentIndex < 0) return rows.length;

  let insertIndex = parentIndex + 1;

  while (
    insertIndex < rows.length &&
    isDescendantRow(rows[insertIndex], parentId, rowLookup)
  ) {
    insertIndex += 1;
  }

  return insertIndex;
}

function buildCostFileInfoValues(
  parent: WorkbenchRow,
  fileCode: string,
  fileName: string
) {
  return {
    ...(parent.infoValues ?? {}),
    systemNo: `CF-${fileCode}`,
    projectNo: parent.infoValues?.projectNo ?? parent.projectCode,
    projectCode: fileCode,
    projectName: fileName,
    compileType: "编制",
    budgetCategory: currentStageConfig.value.label
  };
}

function handleCreateProjectConfirm() {
  const projectCode = createProjectForm.projectCode.trim();
  const projectName = createProjectForm.projectName.trim();

  if (!projectCode || !projectName) {
    message("请先填写编号和名称", { type: "warning" });
    return;
  }

  const newRow: WorkbenchRow = {
    id: `${currentStage.value}-project-${Date.now()}`,
    parentId: null,
    nodeType: "project",
    projectCode,
    seq: "1",
    status: "编制",
    pricingLib: "",
    projectName,
    infoValues: buildProjectInfoValues(projectCode, projectName),
    auditNoteValues: {
      summary: `${projectName} 为新建建设项目示例数据。`,
      basis: "当前为新增项目后的 mock 审核依据占位内容。",
      issue: "当前暂无审核问题记录。",
      extra: "后续可在此补充项目备注与审核说明。"
    }
  };

  currentStageConfig.value.rows.push(newRow);
  selectedRowId.value = newRow.id;
  currentPanelTab.value = "basic";
  createProjectDialogVisible.value = false;
  message("建设项目已新增到树表", { type: "success" });
}

function handleCreateCostFileConfirm() {
  const parentRow = resolveParentRowForCreate();
  const fileCode = createCostFileForm.fileCode.trim();
  const fileName = createCostFileForm.fileName.trim();

  if (!parentRow) {
    message("请先选中一个父级节点，再创建造价文件", {
      type: "warning"
    });
    return;
  }

  if (!fileCode || !fileName) {
    message("请先填写文件编号和文件名称", { type: "warning" });
    return;
  }

  if (
    currentCostFileProfile.value.showLocation &&
    !createCostFileForm.location
  ) {
    message("请选择工程所在地", { type: "warning" });
    return;
  }

  const directChildren = currentStageConfig.value.rows.filter(
    item => item.parentId === parentRow.id
  ).length;
  const childSeq = `${parentRow.seq}.${directChildren + 1}`;
  const rows = currentStageConfig.value.rows;
  const insertIndex = getInsertIndexForChild(rows, parentRow.id);

  const newRow: WorkbenchRow = {
    id: `${currentStage.value}-cost-file-${Date.now()}`,
    parentId: parentRow.id,
    nodeType: "cost-file",
    projectCode: fileCode,
    seq: childSeq,
    status: "编制",
    pricingLib: currentCostFileProfile.value.pricingLib,
    projectName: fileName,
    infoValues: buildCostFileInfoValues(parentRow, fileCode, fileName),
    auditNoteValues: {
      summary: `${fileName} 为新增造价文件示例数据。`,
      basis: createCostFileForm.basis || "当前暂无计价依据。",
      issue: "当前暂无审核问题记录。",
      extra: createCostFileForm.location
        ? `工程所在地：${createCostFileForm.location}`
        : "后续可在此补充造价文件说明。"
    }
  };

  rows.splice(insertIndex, 0, newRow);
  selectedRowId.value = newRow.id;
  currentPanelTab.value = "basic";
  createCostFileDialogVisible.value = false;
  message("造价文件已新增到当前父级节点下方", { type: "success" });
}

function mainRowClassName({
  row
}: {
  row: {
    id: string;
  };
}) {
  return row.id === selectedRowId.value ? "is-selected-row" : "";
}

function propertyRowClassName({
  row
}: {
  row: {
    parentId: string | null;
  };
}) {
  return row.parentId ? "" : "property-group-row";
}

async function restoreWorkbenchSnapshot() {
  if (readQueryValue(route.query.restoreFrom) !== "budget-book") return;

  const snapshot = consumeProjectManagementSnapshot();
  const nextQuery = { ...route.query };
  delete nextQuery.restoreFrom;
  delete nextQuery.ts;

  if (snapshot) {
    currentStage.value = snapshot.stageKey;
    activeMainTab.value = workTabs.includes(
      snapshot.activeMainTab as (typeof workTabs)[number]
    )
      ? (snapshot.activeMainTab as (typeof workTabs)[number])
      : workTabs[0];
    currentPanelTab.value =
      snapshot.currentPanelTab === "audit" ? "audit" : "basic";

    await nextTick();

    selectedRowId.value = currentStageConfig.value.rows.some(
      item => item.id === snapshot.selectedRowId
    )
      ? snapshot.selectedRowId
      : (currentStageConfig.value.rows[0]?.id ?? "");

    await nextTick();

    const scrollState = mainTableRef.value?.getScroll?.();
    await mainTableRef.value?.scrollTo?.(
      scrollState?.scrollLeft ?? 0,
      snapshot.mainScrollTop
    );
  }

  await router.replace({
    path: route.path,
    query: nextQuery
  });
}

onMounted(async () => {
  updateWorkbenchViewportHeight();
  window.addEventListener("resize", updateWorkbenchViewportHeight);
  window.addEventListener("click", hideProjectContextMenu);
  window.addEventListener("blur", hideProjectContextMenu);
  await nextTick();
  await restoreWorkbenchSnapshot();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateWorkbenchViewportHeight);
  window.removeEventListener("click", hideProjectContextMenu);
  window.removeEventListener("blur", hideProjectContextMenu);
});
</script>

<template>
  <div
    ref="workbenchRootRef"
    class="cost-workbench"
    :style="workbenchRootStyle"
  >
    <section class="toolbar-panel">
      <template v-if="!isMaterialSummaryTab && !isProjectReportTab">
        <div
          v-for="(group, groupIndex) in toolbarGroups"
          :key="groupIndex"
          class="toolbar-group"
        >
          <template v-for="action in group" :key="action.key">
            <el-dropdown
              v-if="action.key === 'new'"
              trigger="click"
              placement="bottom-start"
              @command="handleCreateCommand"
            >
              <button
                class="toolbar-action toolbar-action--dropdown"
                type="button"
              >
                <span class="toolbar-icon">
                  <component :is="action.icon" />
                </span>
                <span>{{ action.label }}</span>
              </button>

              <template #dropdown>
                <el-dropdown-menu class="create-dropdown-menu">
                  <el-dropdown-item
                    v-for="createAction in createActions"
                    :key="createAction.key"
                    :command="createAction.key"
                  >
                    {{ createAction.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <button
              v-else
              class="toolbar-action"
              type="button"
              @click="handleToolbarAction(action.label)"
            >
              <span class="toolbar-icon">
                <component :is="action.icon" />
              </span>
              <span>{{ action.label }}</span>
            </button>
          </template>
        </div>
      </template>

      <template v-else-if="isMaterialSummaryTab">
        <div
          v-for="(group, groupIndex) in summaryToolbarGroups"
          :key="groupIndex"
          class="toolbar-group"
        >
          <button
            v-for="action in group"
            :key="action.key"
            class="toolbar-action"
            type="button"
            @click="handleToolbarAction(action.label)"
          >
            <span class="toolbar-icon">
              <component :is="action.icon" />
            </span>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(group, groupIndex) in reportToolbarGroups"
          :key="groupIndex"
          class="toolbar-group"
        >
          <button
            v-for="action in group"
            :key="action.key"
            class="toolbar-action"
            type="button"
            @click="handleToolbarAction(action.label)"
          >
            <span class="toolbar-icon">
              <component :is="action.icon" />
            </span>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </template>
    </section>

    <section class="workspace-panel">
      <MaterialSummaryWorkspace
        v-if="isMaterialSummaryTab"
        :active-main-tab="activeMainTab"
        :work-tabs="workTabs"
        @tab-click="handleMainTabClick"
      />

      <ProjectReportWorkspace
        v-else-if="isProjectReportTab"
        :active-main-tab="activeMainTab"
        :work-tabs="workTabs"
        :context="reportWorkspaceContext"
        @tab-click="handleMainTabClick"
      />

      <template v-else>
        <aside class="stage-rail">
          <button
            v-for="stage in stageOptions"
            :key="stage.key"
            class="stage-button"
            :class="{ 'is-active': stage.key === currentStage }"
            type="button"
            @click="handleStageChange(stage.key)"
          >
            <span>{{ stage.label }}</span>
          </button>
        </aside>

        <div ref="boardRef" class="board-panel">
          <div class="main-tabs-bar">
            <button
              v-for="tab in workTabs"
              :key="tab"
              class="main-tab"
              :class="{ 'is-active': tab === activeMainTab }"
              type="button"
              @click="handleMainTabClick(tab)"
            >
              {{ tab }}
            </button>
          </div>

          <div
            class="table-surface"
            @contextmenu.prevent="handleProjectContextMenu"
          >
            <vxe-table
              ref="mainTableRef"
              border
              round
              size="small"
              stripe
              height="100%"
              show-header-overflow="title"
              :data="currentStageConfig.rows"
              :tree-config="{
                transform: true,
                rowField: 'id',
                parentField: 'parentId',
                expandAll: currentStageConfig.expandAll ?? false
              }"
              :row-config="{
                isHover: true,
                keyField: 'id'
              }"
              :row-class-name="mainRowClassName"
              @cell-click="handleRowSelect"
              @cell-dblclick="handleMainTableCellDblclick"
            >
              <WorkbenchColumnNode
                v-for="column in currentStageConfig.columns"
                :key="column.id"
                :column="column"
              />
            </vxe-table>
          </div>

          <aside
            class="overlay-panel"
            :class="{ 'is-collapsed': panelCollapsed }"
            :style="{ width: `${overlayVisibleWidth}px` }"
            @mousedown="handleCollapsedOverlayMouseDown"
          >
            <div v-if="panelCollapsed" class="overlay-collapsed-hotzone" />
            <template v-else>
              <div
                class="overlay-handle"
                @mousedown.prevent="overlayPanel.startResize($event, boardRef)"
              >
                <button
                  class="overlay-toggle"
                  type="button"
                  :title="panelCollapsed ? '展开面板' : '收起面板'"
                  @click.stop="overlayPanel.toggle()"
                >
                  <span />
                  <span />
                </button>
              </div>

              <div class="overlay-body">
                <div class="overlay-tabs">
                  <button
                    class="overlay-tab"
                    :class="{ 'is-active': currentPanelTab === 'basic' }"
                    type="button"
                    @click="currentPanelTab = 'basic'"
                  >
                    基本信息
                  </button>
                  <button
                    class="overlay-tab"
                    :class="{ 'is-active': currentPanelTab === 'audit' }"
                    type="button"
                    @click="currentPanelTab = 'audit'"
                  >
                    审核意见
                  </button>
                </div>

                <div class="overlay-content">
                  <div
                    v-show="currentPanelTab === 'basic'"
                    class="overlay-pane"
                  >
                    <vxe-table
                      border
                      round
                      size="small"
                      stripe
                      height="100%"
                      :data="propertyRows"
                      :tree-config="{
                        transform: true,
                        rowField: 'id',
                        parentField: 'parentId',
                        expandAll: true
                      }"
                      :row-class-name="propertyRowClassName"
                    >
                      <vxe-column
                        type="seq"
                        title="序"
                        width="52"
                        align="center"
                      />
                      <vxe-column
                        field="label"
                        title="属性"
                        min-width="146"
                        tree-node
                      />
                      <vxe-column
                        field="value"
                        title="值"
                        min-width="156"
                        show-overflow="title"
                      />
                    </vxe-table>
                  </div>

                  <el-scrollbar
                    v-show="currentPanelTab === 'audit'"
                    class="overlay-pane"
                  >
                    <article class="audit-sheet">
                      <section
                        v-for="section in auditSections"
                        :key="section.id"
                        class="audit-section"
                      >
                        <h3>{{ section.title }}</h3>
                        <p>{{ section.content }}</p>
                      </section>
                    </article>
                  </el-scrollbar>
                </div>
              </div>
            </template>
          </aside>
        </div>
      </template>
    </section>

    <Teleport to="body">
      <div
        v-if="projectContextMenu.visible"
        ref="projectContextMenuRef"
        class="project-context-menu"
        :style="{
          left: `${projectContextMenu.x}px`,
          top: `${projectContextMenu.y}px`
        }"
        @click.stop
        @contextmenu.prevent.stop
      >
        <div
          v-for="(group, groupIndex) in projectContextMenuGroups"
          :key="groupIndex"
          class="project-context-menu__group"
        >
          <div
            v-for="item in group"
            :key="item.key"
            class="project-context-menu__item"
            :class="{
              'is-disabled': item.disabled,
              'has-children': item.children,
              'is-open': projectContextMenu.activeSubmenuKey === item.key
            }"
            role="menuitem"
            tabindex="-1"
            @click="handleContextMenuAction(item)"
            @mouseenter="handleContextMenuItemEnter(item)"
          >
            <span class="project-context-menu__icon">
              <component :is="item.icon" v-if="item.icon" />
            </span>
            <span class="project-context-menu__label">{{ item.label }}</span>
            <span v-if="item.children" class="project-context-menu__arrow">
              <ArrowRightS />
            </span>

            <div
              v-if="item.children?.length"
              class="project-context-menu project-context-menu--submenu"
              :class="`project-context-menu--submenu-${item.key}`"
            >
              <div
                v-for="child in item.children"
                :key="child.key"
                class="project-context-menu__item"
                :class="{ 'is-disabled': child.disabled }"
                role="menuitem"
                tabindex="-1"
                @click.stop="handleContextMenuAction(child)"
              >
                <span class="project-context-menu__icon">
                  <component :is="child.icon" v-if="child.icon" />
                </span>
                <span class="project-context-menu__label">{{
                  child.label
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <el-dialog
      v-model="reportConfirmDialogVisible"
      width="620px"
      class="report-confirm-dialog"
      :show-close="true"
      :close-on-click-modal="false"
      :destroy-on-close="false"
    >
      <div class="report-confirm-dialog__content">
        是否加载造价文件[{{ pendingReportTargetName }}]报表？
      </div>

      <template #footer>
        <div class="report-confirm-dialog__footer">
          <el-button type="primary" @click="handleReportConfirm"
            >是(Y)</el-button
          >
          <el-button @click="reportConfirmDialogVisible = false"
            >否(N)</el-button
          >
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="createProjectDialogVisible"
      title="创建建设项目"
      width="520px"
      class="create-project-dialog"
      :close-on-click-modal="false"
      :destroy-on-close="false"
    >
      <el-form label-width="72px" @submit.prevent>
        <el-form-item label="编号">
          <el-input
            v-model="createProjectForm.projectCode"
            placeholder="请输入建设项目编号"
          />
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            v-model="createProjectForm.projectName"
            placeholder="请输入建设项目名称"
            @keyup.enter="handleCreateProjectConfirm"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="create-project-dialog__footer">
          <el-button @click="createProjectDialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="handleCreateProjectConfirm">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="createCostFileDialogVisible"
      title="创建造价文件"
      width="860px"
      class="create-cost-file-dialog"
      :close-on-click-modal="false"
      :destroy-on-close="false"
    >
      <div class="cost-file-dialog__category-row">
        <el-radio-group
          v-model="createCostFileForm.category"
          class="cost-file-dialog__radio-group"
        >
          <el-radio
            v-for="categoryKey in costFileCategoryOrder"
            :key="categoryKey"
            :value="categoryKey"
          >
            {{ costFileProfiles[categoryKey].label }}
          </el-radio>
        </el-radio-group>
      </div>

      <el-form
        label-width="96px"
        class="cost-file-dialog__form"
        @submit.prevent
      >
        <el-row :gutter="20">
          <el-col :span="currentCostFileProfile.showLocation ? 12 : 24">
            <el-form-item label="文件编号">
              <el-input
                v-model="createCostFileForm.fileCode"
                placeholder="请输入文件编号"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="currentCostFileProfile.showLocation" :span="12">
            <el-form-item label="工程所在地">
              <el-select
                v-model="createCostFileForm.location"
                placeholder="请选择工程所在地"
              >
                <el-option
                  v-for="location in currentCostFileProfile.locationOptions"
                  :key="location"
                  :label="location"
                  :value="location"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="文件名称">
          <el-input
            v-model="createCostFileForm.fileName"
            placeholder="请输入文件名称"
          />
        </el-form-item>

        <el-form-item label="计价依据">
          <el-select
            v-model="createCostFileForm.basis"
            placeholder="请选择计价依据"
          >
            <el-option
              v-for="basis in currentCostFileProfile.basisOptions"
              :key="basis"
              :label="basis"
              :value="basis"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="主定额">
          <el-select
            v-model="createCostFileForm.quota"
            placeholder="请选择主定额"
          >
            <el-option
              v-for="quota in currentCostFileProfile.quotaOptions"
              :key="quota"
              :label="quota"
              :value="quota"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目模板">
          <el-select
            v-model="createCostFileForm.template"
            placeholder="请选择项目模板"
          >
            <el-option
              v-for="template in currentCostFileProfile.templateOptions"
              :key="template"
              :label="template"
              :value="template"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="create-project-dialog__footer">
          <el-button @click="createCostFileDialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="handleCreateCostFileConfirm">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.cost-workbench {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  min-height: 0;
  margin: 0 !important;
  overflow: hidden;
}

.toolbar-panel,
.workspace-panel {
  background: #fff;
  border: 1px solid #d8e3f1;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgb(28 52 84 / 8%);
}

.toolbar-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #edf4fb 100%);
}

.toolbar-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
  padding-right: 12px;
  border-right: 1px solid #d6e4f2;

  &:last-child {
    padding-right: 0;
    border-right: 0;
  }
}

.toolbar-group :deep(.el-dropdown) {
  display: flex;
}

.toolbar-action {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  min-height: 68px;
  padding: 8px 10px;
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

.toolbar-action--dropdown::after {
  margin-top: 2px;
  margin-left: 2px;
  font-size: 12px;
  color: #6a84a4;
  content: "▾";
}

.toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 20px;
  color: #2f6fd8;
  background: linear-gradient(180deg, #edf5ff 0%, #dbeaff 100%);
  border-radius: 10px;
}

.workspace-panel {
  display: flex;
  flex: 1;
  gap: 0;
  min-height: 0;
  overflow: hidden;
}

.stage-rail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 74px;
  padding: 16px 12px;
  background: linear-gradient(180deg, #f4f9ff 0%, #edf5ff 100%);
  border-right: 1px solid #d9e6f4;
}

.stage-button {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  padding: 12px 6px;
  color: #436180;
  letter-spacing: 0.2em;
  cursor: pointer;
  background: linear-gradient(180deg, #fff 0%, #f2f8ff 100%);
  border: 1px solid #d9e6f4;
  border-radius: 18px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;

  span {
    font-size: 13px;
    line-height: 1;
    word-break: keep-all;
    white-space: nowrap;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  &.is-active {
    color: #fff;
    background: linear-gradient(180deg, #37a4ff 0%, #1062d0 100%);
    border-color: #1677ff;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 16%);
  }
}

.board-panel {
  position: relative;
  flex: 1;
  min-width: 0;
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
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px 12px 0 0;

  &.is-active {
    color: #fff;
    background: linear-gradient(180deg, #3aa5ff 0%, #2b6fd8 100%);
    border-color: #2b6fd8;
  }
}

.table-surface {
  height: calc(100% - 54px);
  padding: 0 14px 14px;
}

.project-context-menu {
  position: fixed;
  z-index: 40;
  width: 226px;
  padding: 4px 0;
  font-size: 15px;
  color: #111827;
  background: #fff;
  border: 1px solid #1e9cff;
  box-shadow: 0 8px 18px rgb(25 77 128 / 16%);
}

.project-context-menu__group {
  padding: 4px 0;
  border-bottom: 1px solid #e4e7ed;

  &:last-child {
    border-bottom: 0;
  }
}

.project-context-menu__item {
  position: relative;
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) 18px;
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

.project-context-menu__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: #7b8794;
}

.project-context-menu__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-context-menu__arrow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 16px;
  color: #6b7280;
}

.project-context-menu--submenu {
  position: absolute;
  top: -5px;
  left: calc(100% - 1px);
  display: none;
  width: max-content;
  min-width: 128px;
}

.project-context-menu--submenu-display-settings {
  top: auto;
  bottom: -5px;
}

.project-context-menu__item.has-children:hover > .project-context-menu--submenu,
.project-context-menu__item.has-children.is-open
  > .project-context-menu--submenu {
  display: block;
}

:deep(.table-surface .vxe-table--render-default) {
  --vxe-ui-table-header-background-color: #fbfdff;
  --vxe-ui-table-row-height-small: 36px;
  --vxe-ui-table-border-color: #dbe6f3;
}

:deep(.table-surface .is-selected-row .vxe-body--column) {
  background: #9ae76f !important;
}

:deep(
  .table-surface .vxe-table--render-default.border--full .vxe-body--column
) {
  border-color: #dbe6f3;
}

.overlay-panel {
  position: absolute;
  inset: 0 0 0 auto;
  z-index: 12;
  display: flex;
  flex-direction: row;
  height: 100%;
  background: transparent;
}

.overlay-collapsed-hotzone {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: col-resize;
  background: linear-gradient(180deg, #e6ebf1 0%, #d9dfe7 100%);
  border-left: 1px solid #ccd6e3;
  box-shadow: -6px 0 14px rgb(36 67 101 / 8%);
}

.overlay-collapsed-hotzone::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  content: "";
  background: #c4cfdb;
  transform: translateX(-50%);
}

.overlay-handle {
  position: relative;
  flex: 0 0 16px;
  cursor: col-resize;
  background: linear-gradient(180deg, #e6ebf1 0%, #d9dfe7 100%);
  border-left: 1px solid #ccd6e3;
}

.overlay-toggle {
  position: absolute;
  top: 18px;
  left: 2px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 12px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;

  span {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-right: 6px solid #151515;
    border-bottom: 5px solid transparent;
  }
}

.overlay-panel.is-collapsed .overlay-toggle span {
  border-right: 0;
  border-left: 6px solid #151515;
}

.overlay-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: rgb(255 255 255 / 98%);
  border-left: 1px solid #d5dfec;
  box-shadow: -12px 0 24px rgb(36 67 101 / 10%);
}

.overlay-tabs {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  min-height: 46px;
  padding: 8px 10px 0;
  background: linear-gradient(180deg, #f7fbff 0%, #edf4fb 100%);
  border-bottom: 1px solid #d9e6f4;
}

.overlay-tab {
  min-width: 84px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #4a6786;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;

  &.is-active {
    color: #fff;
    background: linear-gradient(180deg, #38a2ff 0%, #2d6fd8 100%);
    border-color: #2d6fd8;
  }
}

.overlay-content {
  flex: 1;
  min-height: 0;
}

.overlay-pane {
  height: 100%;
}

:deep(.overlay-pane .vxe-table--render-default) {
  --vxe-ui-table-header-background-color: #fbfdff;
  --vxe-ui-table-row-height-small: 36px;
  --vxe-ui-table-border-color: #dbe6f3;
}

:deep(.overlay-pane .property-group-row .vxe-body--column) {
  font-weight: 700;
  background: #fbfdff;
}

.audit-sheet {
  padding: 18px 18px 28px;
}

.audit-section {
  margin-bottom: 28px;

  h3 {
    margin: 0 0 10px;
    font-size: 16px;
    color: #234361;
  }

  p {
    margin: 0;
    line-height: 1.8;
    color: #526d89;
    white-space: pre-line;
  }
}

:deep(.create-dropdown-menu .el-dropdown-menu__item) {
  min-width: 164px;
}

:deep(.create-project-dialog .el-dialog) {
  border: 1px solid #6cb7ef;
  border-top: 3px solid #3aa5ff;
  box-shadow: 0 14px 38px rgb(18 78 145 / 16%);
}

:deep(.create-cost-file-dialog .el-dialog) {
  border: 1px solid #6cb7ef;
  border-top: 3px solid #3aa5ff;
  box-shadow: 0 14px 38px rgb(18 78 145 / 16%);
}

:deep(.report-confirm-dialog .el-dialog) {
  border: 1px solid #6cb7ef;
  border-top: 3px solid #3aa5ff;
  box-shadow: 0 14px 38px rgb(18 78 145 / 16%);
}

:deep(.create-project-dialog .el-dialog__header) {
  padding: 16px 18px;
  margin-right: 0;
}

:deep(.create-cost-file-dialog .el-dialog__header) {
  padding: 14px 18px 12px;
  margin-right: 0;
}

:deep(.report-confirm-dialog .el-dialog__header) {
  min-height: 22px;
  padding: 10px 18px 4px;
  margin-right: 0;
}

:deep(.create-project-dialog .el-dialog__title) {
  font-size: 26px;
  color: #1677ff;
}

:deep(.create-cost-file-dialog .el-dialog__title) {
  font-size: 18px;
  color: #1677ff;
}

:deep(.create-project-dialog .el-dialog__body) {
  padding: 24px 26px 10px;
}

:deep(.create-cost-file-dialog .el-dialog__body) {
  padding: 14px 26px 10px;
}

:deep(.report-confirm-dialog .el-dialog__body) {
  padding: 44px 26px 10px;
}

.create-project-dialog__footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.report-confirm-dialog__content {
  font-size: 18px;
  color: #1e1e1e;
  text-align: center;
}

.report-confirm-dialog__footer {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.cost-file-dialog__category-row {
  margin-bottom: 22px;
}

.cost-file-dialog__radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
}

:deep(.cost-file-dialog__radio-group .el-radio) {
  margin-right: 0;
}

:deep(.cost-file-dialog__form .el-select) {
  width: 100%;
}

@media (width <= 1280px) {
  .toolbar-group {
    flex-wrap: wrap;
  }

  .main-tab {
    min-width: 92px;
    padding-inline: 12px;
  }
}
</style>
