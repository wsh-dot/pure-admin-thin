import type { WorkbenchStageKey } from "./types";

export type ProjectManagementPanelTab = "basic" | "audit";

export interface ProjectManagementSnapshot {
  stageKey: WorkbenchStageKey;
  activeMainTab: string;
  currentPanelTab: ProjectManagementPanelTab;
  selectedRowId: string;
  mainScrollTop: number;
  savedAt: number;
}

export interface BudgetBookRoutePayload {
  stageKey: WorkbenchStageKey;
  rowId: string;
  projectCode: string;
  projectName: string;
  pricingLib: string;
}

const PROJECT_MANAGEMENT_SNAPSHOT_KEY =
  "cost-project-management-workbench-snapshot";

export function saveProjectManagementSnapshot(
  snapshot: Omit<ProjectManagementSnapshot, "savedAt">
) {
  sessionStorage.setItem(
    PROJECT_MANAGEMENT_SNAPSHOT_KEY,
    JSON.stringify({
      ...snapshot,
      savedAt: Date.now()
    })
  );
}

export function consumeProjectManagementSnapshot(): ProjectManagementSnapshot | null {
  const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_SNAPSHOT_KEY);

  if (!raw) return null;

  sessionStorage.removeItem(PROJECT_MANAGEMENT_SNAPSHOT_KEY);

  try {
    return JSON.parse(raw) as ProjectManagementSnapshot;
  } catch {
    return null;
  }
}
