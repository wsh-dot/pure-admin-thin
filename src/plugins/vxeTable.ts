import type { App } from "vue";
import VxeUITable from "vxe-table";

export function useVxeTable(app: App) {
  app.use(VxeUITable);
}
