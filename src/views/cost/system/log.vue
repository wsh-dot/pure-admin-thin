<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { hasAuth } from "@/router/utils";
import { exportOperationLogs, fetchOperationLogPage } from "@/api/cost/system";
import { message } from "@/utils/message";
import { mockOperationLogPage } from "./mock";
import { buildExportFilename, downloadBlob } from "./utils";
import { systemAuth, type OperationLogRow } from "./types";
import Search from "~icons/ri/search-line";
import Refresh from "~icons/ri/refresh-line";
import FileExcel from "~icons/ri/file-excel-2-line";

defineOptions({
  name: "CostSystemLog"
});

const loading = ref(false);
const rows = ref<OperationLogRow[]>([]);
const total = ref(0);
const dateRange = ref<[string, string] | [] | null>([]);

const query = reactive({
  pageNo: 1,
  pageSize: 15,
  account: "",
  name: "",
  status: "",
  module: "",
  startDate: "",
  endDate: ""
});

const canOperate = computed(() => hasAuth(systemAuth.logMenu));

watch(
  dateRange,
  value => {
    const [startDate, endDate] = value ?? [];
    query.startDate = startDate ?? "";
    query.endDate = endDate ?? "";
  },
  { deep: true }
);

function statusText(status: string) {
  return status === "1" ? "成功" : "异常";
}

function statusClass(status: string) {
  return status === "1" ? "cq-status-success" : "cq-status-error";
}

async function loadData() {
  loading.value = true;
  try {
    const page = await fetchOperationLogPage(query);
    const fallbackPage = mockOperationLogPage(query);
    rows.value = page.list.length > 0 ? page.list : fallbackPage.list;
    total.value = page.list.length > 0 ? page.total : fallbackPage.total;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] fetchOperationLogPage", error);
    }
    const fallbackPage = mockOperationLogPage(query);
    rows.value = fallbackPage.list;
    total.value = fallbackPage.total;
  } finally {
    loading.value = false;
  }
}

function searchData() {
  query.pageNo = 1;
  loadData();
}

function resetQuery() {
  Object.assign(query, {
    pageNo: 1,
    pageSize: 15,
    account: "",
    name: "",
    status: "",
    module: "",
    startDate: "",
    endDate: ""
  });
  dateRange.value = [];
  loadData();
}

async function exportLogs() {
  try {
    const blob = await exportOperationLogs(query);
    downloadBlob(blob, buildExportFilename("操作日志"));
    message("导出成功", { type: "success" });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[system mock fallback] exportOperationLogs", error);
      const blob = new Blob([JSON.stringify(rows.value, null, 2)], {
        type: "application/json;charset=utf-8"
      });
      downloadBlob(blob, buildExportFilename("操作日志", "json"));
      message("导出成功（mock）", { type: "success" });
    } else {
      message("导出失败", { type: "error" });
    }
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <section class="cq-page cq-system-page">
    <div class="cq-page-header">
      <div>
        <h2>系统管理</h2>
        <p>日志管理</p>
      </div>
    </div>

    <div class="cq-system-layout">
      <main class="cq-system-main">
        <el-form :model="query" inline class="cq-search-form">
          <el-form-item label="账号">
            <el-input
              v-model="query.account"
              clearable
              placeholder="请输入账号"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input
              v-model="query.name"
              clearable
              placeholder="请输入姓名"
              style="width: 140px"
            />
          </el-form-item>
          <el-form-item label="模块">
            <el-input
              v-model="query.module"
              clearable
              placeholder="请输入模块"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="query.status"
              clearable
              placeholder="全部"
              style="width: 120px"
            >
              <el-option label="成功" value="1" />
              <el-option label="异常" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchData">
              <IconifyIconOffline :icon="Search" />
              查询
            </el-button>
            <el-button @click="resetQuery">
              <IconifyIconOffline :icon="Refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <div class="mb-2 flex flex-wrap items-center gap-2">
          <el-button v-if="canOperate" type="primary" @click="exportLogs">
            <IconifyIconOffline :icon="FileExcel" />
            导出
          </el-button>
        </div>

        <div class="cq-table-wrap" style=" flex: 1;height: auto; min-height: 0">
          <el-table
            v-loading="loading"
            class="cq-table"
            :data="rows"
            size="small"
            height="calc(100% - 42px)"
            border
          >
            <el-table-column prop="account" label="账号" width="120" />
            <el-table-column prop="name" label="姓名" width="110" />
            <el-table-column
              prop="orgId"
              label="单位"
              min-width="160"
              show-overflow-tooltip
            />
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="action" label="操作" width="120" />
            <el-table-column prop="area" label="访问地址" width="120" />
            <el-table-column prop="time" label="操作时间" width="170" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tooltip
                  v-if="row.description"
                  :content="row.description"
                  placement="top"
                >
                  <span :class="statusClass(row.status)">
                    {{ statusText(row.status) }}
                  </span>
                </el-tooltip>
                <span v-else :class="statusClass(row.status)">
                  {{ statusText(row.status) }}
                </span>
              </template>
            </el-table-column>
          </el-table>

          <div class="cq-pagination">
            <el-pagination
              v-model:current-page="query.pageNo"
              v-model:page-size="query.pageSize"
              :total="total"
              :page-sizes="[15, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="searchData"
              @current-change="loadData"
            />
          </div>
        </div>
      </main>
    </div>
  </section>
</template>
