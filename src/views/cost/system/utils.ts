import dayjs from "dayjs";
import { message } from "@/utils/message";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildExportFilename(prefix: string, ext = "xlsx") {
  return `${prefix}-${dayjs().format("YYYYMMDD-HHmmss")}.${ext}`;
}

export async function runMutation<T>(
  task: () => Promise<T>,
  options: {
    successMessage: string;
    errorMessage?: string;
    mockFallback?: () => void | Promise<void>;
  }
): Promise<boolean> {
  try {
    await task();
    message(options.successMessage, { type: "success" });
    return true;
  } catch (error) {
    if (import.meta.env.DEV && options.mockFallback) {
      await options.mockFallback();
      console.warn("[system mock fallback] mutation", error);
      message(options.successMessage + "（mock）", { type: "success" });
      return true;
    }

    message(options.errorMessage ?? "操作失败", { type: "error" });
    return false;
  }
}
