export type WorkbenchStageKey =
  | "budget"
  | "tenderControl"
  | "settlement"
  | "indicator";

export interface WorkbenchStageOption {
  key: WorkbenchStageKey;
  label: string;
}

export interface WorkbenchColumn {
  id: string;
  title: string;
  field?: string;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  treeNode?: boolean;
  showOverflow?: boolean | "tooltip";
  children?: WorkbenchColumn[];
}

export interface WorkbenchRow {
  id: string;
  parentId: string | null;
  nodeType: "project" | "single" | "cost-file";
  projectCode: string;
  seq: string;
  status: string;
  pricingLib: string;
  projectName: string;
  subtotal?: string;
  equipmentFee?: string;
  materialFee?: string;
  installFee?: string;
  civilFee?: string;
  suppliedEquipmentFee?: string;
  suppliedMaterialFee?: string;
  otherFee?: string;
  totalCost?: string;
  vat?: string;
  infoValues?: Record<string, string>;
  auditNoteValues?: Record<string, string>;
}

export interface WorkbenchStageConfig {
  key: WorkbenchStageKey;
  label: string;
  columns: WorkbenchColumn[];
  rows: WorkbenchRow[];
  expandAll?: boolean;
}

export interface PropertySchemaRow {
  id: string;
  parentId: string | null;
  label: string;
  field?: string;
}

export interface PropertyTreeRow {
  id: string;
  parentId: string | null;
  label: string;
  value: string;
}

export interface AuditSection {
  id: string;
  title: string;
  content: string;
}

export type MaterialSummaryCategoryKey =
  | "all"
  | "labor"
  | "material"
  | "machine"
  | "mainMaterial"
  | "equipment"
  | "mainMaterialAndEquipment";

export interface MaterialSummaryTreeNode {
  id: string;
  label: string;
  category: MaterialSummaryCategoryKey;
  children?: MaterialSummaryTreeNode[];
}

export interface MaterialSummaryRow {
  id: string;
  discipline: string;
  category: Exclude<MaterialSummaryCategoryKey, "all">;
  categoryLabel: string;
  code: string;
  name: string;
  spec: string;
  unit: string;
  quantity: string;
  quotaPrice: string;
  marketPrice: string;
  quotaTotal: string;
  marketTotal: string;
  variance: string;
  varianceTotal: string;
  budgetBook: string;
  remark: string;
}

export type ReportTemplateType =
  | "cover"
  | "directory"
  | "narrative"
  | "table"
  | "approval";

export interface ReportLoadedItem {
  id: string;
  rowId: string;
  label: string;
  sourceType: "project" | "single" | "cost-file";
}

export interface ReportTreeNode {
  id: string;
  label: string;
  children?: ReportTreeNode[];
  documentId?: string;
}

export interface ReportPageMetaField {
  label: string;
  value: string;
}

export interface ReportDirectoryItem {
  label: string;
  page: number;
}

export interface ReportTableConfig {
  columns: string[];
  rows: string[][];
}

export interface ReportPageData {
  id: string;
  title: string;
  templateType: ReportTemplateType;
  subtitle?: string;
  pageNo: number;
  totalPages: number;
  description?: string;
  centerLines?: string[];
  directoryItems?: ReportDirectoryItem[];
  metaFields?: ReportPageMetaField[];
  noteLines?: string[];
  table?: ReportTableConfig;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
}

export interface ReportDocument {
  id: string;
  label: string;
  templateType: ReportTemplateType;
  pages: ReportPageData[];
}

export interface ReportBundle {
  loadedItem: ReportLoadedItem;
  tree: ReportTreeNode[];
  documents: ReportDocument[];
}

export interface ReportWorkspaceContext {
  entryMode: "parent" | "cost-file";
  sourceRowId: string;
  bundles: ReportBundle[];
  defaultLoadedItemId: string;
}
