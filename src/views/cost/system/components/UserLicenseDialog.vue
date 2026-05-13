<script setup lang="ts">
import { computed, ref } from "vue";
import { downloadUserLicense } from "@/api/cost/system";
import { message } from "@/utils/message";
import { buildExportFilename, downloadBlob } from "../utils";
import type { UserRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  row?: UserRow | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const downloading = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

async function download() {
  if (!props.row?.id) return;
  downloading.value = true;
  try {
    const blob = await downloadUserLicense(props.row.id);
    downloadBlob(blob, buildExportFilename(`${props.row.name}-许可证`, "lic"));
    message("下载成功", { type: "success" });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] downloadUserLicense", error);
      const blob = new Blob([`license for ${props.row.name}`], {
        type: "text/plain;charset=utf-8"
      });
      downloadBlob(
        blob,
        buildExportFilename(`${props.row.name}-许可证`, "txt")
      );
      message("下载成功（mock）", { type: "success" });
    } else {
      message("许可证下载失败", { type: "error" });
    }
  } finally {
    downloading.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="许可证下载" width="520px">
    <el-descriptions border :column="1" size="small">
      <el-descriptions-item label="账号">
        {{ row?.uid || row?.userNo || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="姓名">
        {{ row?.name || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="组织机构">
        {{ row?.companyName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="许可证状态">可下载</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" :loading="downloading" @click="download">
        下载
      </el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
