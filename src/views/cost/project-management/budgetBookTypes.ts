import type { WorkbenchColumn } from "./types";
import type { BudgetBookRoutePayload } from "./workspaceState";

export type BudgetBookNodeType = "project" | "quota" | "leaf";
export type BudgetBookLeafType = "mainMaterial" | "equipment" | "formula";

export type BudgetBookDetailTabKey =
  | "labor"
  | "mainMaterial"
  | "formula"
  | "feeProgram"
  | "extraFee"
  | "quotaContent";

export interface BudgetBookTabOption {
  key: BudgetBookDetailTabKey;
  label: string;
}

export interface BudgetBookMainTabOption {
  key: string;
  label: string;
}

export interface BudgetBookToolbarAction {
  key: string;
  label: string;
  icon: string;
}

export interface BudgetBookFeeMainCategoryRow {
  id: string;
  name: string;
  totalAmount: string;
}

export interface BudgetBookFeeMainSettingRow {
  id: string;
  item: string;
  value: string;
}

export interface BudgetBookFeeMainCategoryState {
  settingRows: BudgetBookFeeMainSettingRow[];
  feeProgramRows: BudgetBookFeeProgramRow[];
}

export interface BudgetBookFeeMainWorkspaceContext {
  defaultCategoryId: string;
  defaultTemplate: string;
  templateOptions: string[];
  categoryRows: BudgetBookFeeMainCategoryRow[];
  categoryStateMap: Record<string, BudgetBookFeeMainCategoryState>;
}

export interface BudgetBookTreeRow {
  id: string;
  parentId: string | null;
  nodeType: BudgetBookNodeType;
  leafType?: BudgetBookLeafType;
  code: string;
  marker: string;
  name: string;
  unit: string;
  formula: string;
  quantity: string;
  price: string;
  laborUnitPrice: string;
  materialUnitPrice: string;
  machineUnitPrice: string;
  mainMaterialUnitPrice: string;
  equipmentUnitPrice: string;
  quotaInclusivePrice: string;
  feeCategory: string;
  feeTotal: string;
  laborTotal: string;
  materialTotal: string;
  machineTotal: string;
  mainMaterialTotal: string;
  equipmentTotal: string;
  remark: string;
}

export interface BudgetBookLaborRow {
  id: string;
  code: string;
  name: string;
  type: string;
  spec: string;
  unit: string;
  quotaPrice: string;
  marketPrice: string;
  quotaConsumption: string;
  actualConsumption: string;
  quantity: string;
  amount: string;
  remark: string;
}

export interface BudgetBookMainMaterialRow {
  id: string;
  code: string;
  name: string;
  type: string;
  spec: string;
  unit: string;
  amountQty: string;
  taxIncludedPrice: string;
  taxExcludedPrice: string;
  actualContent: string;
  actualUsage: string;
  importedEquipment: string;
  exchangeRate: string;
  amount: string;
  quotaContent: string;
  remark: string;
}

export interface BudgetBookFormulaRow {
  id: string;
  param: string;
  description: string;
  expression: string;
  quantity: string;
  accumulate: boolean;
}

export interface BudgetBookFeeProgramRow {
  id: string;
  parentId: string | null;
  feeCode: string;
  feeItem: string;
  base: string;
  rate: string;
  amount: string;
  excluded: boolean;
  description: string;
  printable: boolean;
}

export interface BudgetBookFeeRateRow {
  id: string;
  tag: string;
  feeRateCode: string;
  name: string;
  rate: string;
  fixed: boolean;
}

export interface BudgetBookExtraFeeRow {
  id: string;
  code: string;
  name: string;
  factor: string;
  laborShare: string;
  materialShare: string;
  machineShare: string;
  otherShare: string;
  laborFee: string;
  materialFee: string;
  machineFee: string;
  otherFee: string;
  total: string;
}

export interface BudgetBookQuotaContent {
  heading: string;
  description: string;
}

export interface BudgetBookNodeDetailState {
  mode: "parent-only" | "tabbed";
  defaultTab: BudgetBookDetailTabKey;
  visibleTabs: BudgetBookDetailTabKey[];
  laborRows: BudgetBookLaborRow[];
  mainMaterialRows: BudgetBookMainMaterialRow[];
  formulaRows: BudgetBookFormulaRow[];
  formulaUnit: string;
  feeProgramRows: BudgetBookFeeProgramRow[];
  feeRateRows: BudgetBookFeeRateRow[];
  extraFeeRows: BudgetBookExtraFeeRow[];
  quotaContent: BudgetBookQuotaContent;
}

export interface BudgetBookWorkspaceContext {
  routeInfo: BudgetBookRoutePayload;
  defaultNodeId: string;
  mainTabs: BudgetBookMainTabOption[];
  detailTabs: BudgetBookTabOption[];
  toolbarGroups: BudgetBookToolbarAction[][];
  feeToolbarGroups: BudgetBookToolbarAction[][];
  shortcutBadges: string[];
  shortcutLinks: string[];
  mainColumns: WorkbenchColumn[];
  laborColumns: WorkbenchColumn[];
  mainMaterialColumns: WorkbenchColumn[];
  formulaColumns: WorkbenchColumn[];
  extraFeeColumns: WorkbenchColumn[];
  rows: BudgetBookTreeRow[];
  detailStateMap: Record<string, BudgetBookNodeDetailState>;
  feeMainWorkspace: BudgetBookFeeMainWorkspaceContext;
}
