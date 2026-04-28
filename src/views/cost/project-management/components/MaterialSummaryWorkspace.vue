<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { message } from "@/utils/message";
import FolderOpen from "~icons/ri/folder-open-line";
import FileListLine from "~icons/ri/file-list-3-line";
import WorkbenchColumnNode from "./WorkbenchColumnNode.vue";
import {
  materialSummaryColumns,
  materialSummaryRows,
  materialSummaryTree
} from "../materialSummaryMock";
import type {
  MaterialSummaryCategoryKey,
  MaterialSummaryRow,
  MaterialSummaryTreeNode
} from "../types";

defineOptions({
  name: "MaterialSummaryWorkspace"
});

const props = defineProps<{
  activeMainTab: string;
  workTabs: readonly string[];
}>();

const emit = defineEmits<{
  (event: "tab-click", tab: string): void;
}>();

interface SummaryFilters {
  discipline: string;
  category: string;
  code: string;
  name: string;
  priceMode: string;
  searchInResults: boolean;
}

const defaultFilters: SummaryFilters = {
  discipline: "全部",
  category: "全部",
  code: "",
  name: "",
  priceMode: "全部",
  searchInResults: false
};

const activeCategory = ref<MaterialSummaryCategoryKey>("all");
const selectedRowId = ref(materialSummaryRows[0]?.id ?? "");

const filterDraft = reactive<SummaryFilters>({
  ...defaultFilters
});
const appliedFilters = reactive<SummaryFilters>({
  ...defaultFilters
});

const disciplineOptions = computed(() => [
  "全部",
  ...Array.from(new Set(materialSummaryRows.map(item => item.discipline)))
]);
const categoryOptions = computed(() => [
  "全部",
  ...Array.from(new Set(materialSummaryRows.map(item => item.categoryLabel)))
]);
const priceModeOptions = ["全部", "定额价", "市场价", "价差"];

const filteredRows = computed(() => {
  return materialSummaryRows.filter(row => {
    if (
      activeCategory.value !== "all" &&
      row.category !== activeCategory.value
    ) {
      return false;
    }

    if (
      appliedFilters.discipline !== "全部" &&
      row.discipline !== appliedFilters.discipline
    ) {
      return false;
    }

    if (
      appliedFilters.category !== "全部" &&
      row.categoryLabel !== appliedFilters.category
    ) {
      return false;
    }

    if (
      appliedFilters.code &&
      !row.code.toLowerCase().includes(appliedFilters.code.toLowerCase())
    ) {
      return false;
    }

    if (
      appliedFilters.name &&
      !row.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
    ) {
      return false;
    }

    if (appliedFilters.priceMode === "定额价") {
      return Number(row.quotaPrice) > 0;
    }

    if (appliedFilters.priceMode === "市场价") {
      return Number(row.marketPrice) > 0;
    }

    if (appliedFilters.priceMode === "价差") {
      return Number(row.varianceTotal) > 0;
    }

    return true;
  });
});

const summaryAmount = computed(() => {
  const total = filteredRows.value.reduce((sum, row) => {
    return sum + Number(row.varianceTotal || 0);
  }, 0);

  return total.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

watch(
  filteredRows,
  rows => {
    if (!rows.some(item => item.id === selectedRowId.value)) {
      selectedRowId.value = rows[0]?.id ?? "";
    }
  },
  { immediate: true }
);

function handleTabClick(tab: string) {
  emit("tab-click", tab);
}

function handleTreeSelect(node?: MaterialSummaryTreeNode) {
  activeCategory.value = node?.category ?? "all";
}

function applyFilters() {
  Object.assign(appliedFilters, filterDraft);
}

function resetFilters() {
  Object.assign(filterDraft, defaultFilters);
  Object.assign(appliedFilters, defaultFilters);
}

function showSummaryMessage() {
  message(
    `当前共 ${filteredRows.value.length} 条工料机数据，调价汇总金额 ${summaryAmount.value}`,
    {
      type: "info"
    }
  );
}

function showPlaceholderAction(label: string) {
  message(`${label}功能暂未接入，当前为原型实现`, { type: "info" });
}

function handleSummaryRowSelect({ row }: { row: MaterialSummaryRow }) {
  selectedRowId.value = row.id;
}

function summaryRowClassName({ row }: { row: MaterialSummaryRow }) {
  return row.id === selectedRowId.value ? "is-selected-row" : "";
}
</script>

<template>
  <div class="material-summary-workspace">
    <div class="main-tabs-bar">
      <button
        v-for="tab in props.workTabs"
        :key="tab"
        class="main-tab"
        :class="{ 'is-active': tab === props.activeMainTab }"
        type="button"
        @click="handleTabClick(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <div class="summary-filter-bar">
      <div class="summary-filter-item summary-filter-item--short">
        <span>专业</span>
        <el-select v-model="filterDraft.discipline" size="small">
          <el-option
            v-for="discipline in disciplineOptions"
            :key="discipline"
            :label="discipline"
            :value="discipline"
          />
        </el-select>
      </div>

      <div class="summary-filter-item summary-filter-item--short">
        <span>类别</span>
        <el-select v-model="filterDraft.category" size="small">
          <el-option
            v-for="category in categoryOptions"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </div>

      <div class="summary-filter-item summary-filter-item--short">
        <span>编号</span>
        <el-input v-model="filterDraft.code" size="small" clearable />
      </div>

      <div class="summary-filter-item summary-filter-item--medium">
        <span>名称</span>
        <el-input v-model="filterDraft.name" size="small" clearable />
      </div>

      <div class="summary-filter-item summary-filter-item--price">
        <span>价格</span>
        <el-select v-model="filterDraft.priceMode" size="small">
          <el-option
            v-for="priceMode in priceModeOptions"
            :key="priceMode"
            :label="priceMode"
            :value="priceMode"
          />
        </el-select>
      </div>

      <label class="summary-filter-checkbox">
        <el-checkbox v-model="filterDraft.searchInResults" />
        <span>在结果中查询</span>
      </label>

      <div class="summary-filter-actions">
        <button type="button" @click="applyFilters">查询</button>
        <button type="button" @click="resetFilters">取消查询</button>
        <button type="button" @click="showSummaryMessage">汇总</button>
        <button type="button" @click="showPlaceholderAction('保存')">
          保存
        </button>
      </div>

      <div class="summary-filter-total">
        调价汇总金额:<strong>{{ summaryAmount }}</strong>
      </div>
    </div>

    <div class="summary-content">
      <aside class="summary-tree-panel">
        <el-tree
          :data="materialSummaryTree"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          :highlight-current="true"
          :current-node-key="activeCategory"
          @current-change="handleTreeSelect"
        >
          <template #default="{ data }">
            <div
              class="summary-tree-node"
              :class="{ 'is-root': data.category === 'all' }"
            >
              <span class="summary-tree-icon">
                <component
                  :is="data.category === 'all' ? FolderOpen : FileListLine"
                />
              </span>
              <span>{{ data.label }}</span>
            </div>
          </template>
        </el-tree>
      </aside>

      <div class="summary-table-panel">
        <vxe-table
          border
          round
          size="small"
          stripe
          height="100%"
          show-header-overflow="title"
          show-overflow="title"
          :data="filteredRows"
          :column-config="{ resizable: true }"
          :row-config="{
            isHover: true,
            keyField: 'id'
          }"
          :row-class-name="summaryRowClassName"
          @cell-click="handleSummaryRowSelect"
        >
          <WorkbenchColumnNode
            v-for="column in materialSummaryColumns"
            :key="column.id"
            :column="column"
          />
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.material-summary-workspace {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
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

.summary-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: center;
  padding: 10px 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border-bottom: 1px solid #d9e6f4;
}

.summary-filter-item {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: #395470;

  span {
    flex: 0 0 auto;
  }
}

.summary-filter-item--short {
  width: 172px;
}

.summary-filter-item--medium {
  width: 250px;
}

.summary-filter-item--price {
  width: 166px;
}

.summary-filter-checkbox {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 13px;
  color: #4d6886;
}

.summary-filter-actions {
  display: inline-flex;
  gap: 10px;
  align-items: center;

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

.summary-filter-total {
  font-size: 13px;
  color: #49637e;

  strong {
    margin-left: 2px;
    font-weight: 700;
    color: #1f6dff;
  }
}

.summary-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.summary-tree-panel {
  width: 170px;
  padding: 10px 0;
  background: linear-gradient(180deg, #f8fbff 0%, #edf4fb 100%);
  border-right: 1px solid #d9e6f4;
}

.summary-tree-panel :deep(.el-tree) {
  color: #3c5674;
  background: transparent;
}

.summary-tree-panel :deep(.el-tree-node__content) {
  height: 36px;
  padding-right: 10px;
  border-bottom: 1px solid #edf3f9;
}

.summary-tree-panel
  :deep(
    .el-tree--highlight-current
      .el-tree-node.is-current
      > .el-tree-node__content
  ) {
  color: #234361;
  background: #9ae76f;
}

.summary-tree-node {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.summary-tree-icon {
  display: inline-flex;
  font-size: 18px;
  color: #5a7fa9;
}

.summary-table-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

:deep(.summary-table-panel .vxe-table--render-default) {
  --vxe-ui-table-header-background-color: #fbfdff;
  --vxe-ui-table-row-height-small: 36px;
  --vxe-ui-table-border-color: #dbe6f3;
}

:deep(.summary-table-panel .is-selected-row .vxe-body--column) {
  background: #9ae76f !important;
}

:deep(.summary-table-panel .vxe-header--column) {
  font-weight: 600;
  color: #294764;
}

@media (width <= 1440px) {
  .summary-filter-item--medium {
    width: 220px;
  }
}
</style>
