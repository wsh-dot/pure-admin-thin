<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import {
  deletePartyWork,
  fetchPartyWorkPage,
  updatePartyWorkStatus
} from "@/api/cost/foundation";
import {
  getInfoTypeLabel,
  infoTypeOptions
} from "@/views/cost/foundation/mock";
import type { PartyWorkQuery, PartyWorkRow } from "./types";
import PartyWorkFormDialog from "./components/PartyWorkFormDialog.vue";
import AttachmentDialog from "./components/AttachmentDialog.vue";
import Add from "~icons/ri/add-circle-line";
import Search from "~icons/ri/search-line";
import Refresh from "~icons/ri/refresh-line";
import Eye from "~icons/ri/eye-line";
import Edit from "~icons/ri/edit-2-line";
import DeleteBin from "~icons/ri/delete-bin-6-line";
import Attachment from "~icons/ri/attachment-2";
import Upload from "~icons/ri/upload-cloud-2-line";
import Download from "~icons/ri/download-cloud-2-line";
import Pushpin from "~icons/ri/pushpin-2-line";
import PushpinOff from "~icons/ri/unpin-line";

defineOptions({
  name: "CostFoundationPartyWork"
});

const loading = ref(false);
const rows = ref<PartyWorkRow[]>([]);
const total = ref(0);
const selectedRow = ref<PartyWorkRow | null>(null);
const formMode = ref<"create" | "edit" | "view">("view");
const formVisible = ref(false);
const attachmentVisible = ref(false);

const query = reactive<PartyWorkQuery>({
  topic: "",
  topStatus: "",
  issuanceTag: "",
  infoType: "",
  dateRange: [],
  pageNo: 1,
  pageSize: 15
});

const canEdit = computed(() => hasAuth("work_edit"));

function rowEditable(row: PartyWorkRow) {
  return canEdit.value && row.issuanceTag !== "1";
}

async function loadData() {
  loading.value = true;
  try {
    const data = await fetchPartyWorkPage({ ...query });
    rows.value = data.list;
    total.value = data.total;
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
    topic: "",
    topStatus: "",
    issuanceTag: "",
    infoType: "",
    dateRange: [],
    pageNo: 1
  });
  loadData();
}

function openForm(mode: "create" | "edit" | "view", row?: PartyWorkRow) {
  formMode.value = mode;
  selectedRow.value = row ?? null;
  formVisible.value = true;
}

function openAttachment(row: PartyWorkRow) {
  selectedRow.value = row;
  attachmentVisible.value = true;
}

async function confirmAction(title: string, content: string) {
  await ElMessageBox.confirm(content, title, {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  });
}

async function removeRow(row: PartyWorkRow) {
  await confirmAction("删除确认", `确认删除“${row.topic}”？`);
  await deletePartyWork(row.id);
  message("删除成功", { type: "success" });
  loadData();
}

async function togglePublish(row: PartyWorkRow) {
  const next = row.issuanceTag === "1" ? "0" : "1";
  await confirmAction(
    next === "1" ? "发布确认" : "撤回确认",
    `确认${next === "1" ? "发布" : "撤回"}“${row.topic}”？`
  );
  await updatePartyWorkStatus(row.id, { issuanceTag: next });
  message(next === "1" ? "发布成功" : "撤回成功", { type: "success" });
  loadData();
}

async function toggleTop(row: PartyWorkRow) {
  const next = row.topStatus === "1" ? "0" : "1";
  await confirmAction(
    next === "1" ? "置顶确认" : "还原确认",
    `确认${next === "1" ? "置顶" : "还原"}“${row.topic}”？`
  );
  await updatePartyWorkStatus(row.id, { topStatus: next });
  message(next === "1" ? "置顶成功" : "还原成功", { type: "success" });
  loadData();
}

function onSaved() {
  message("保存成功", { type: "success" });
  loadData();
}

onMounted(loadData);
</script>

<template>
  <section class="cq-page party-work-page">
    <div class="cq-page-header">
      <div>
        <h2>基础工作</h2>
        <p>党建工作</p>
      </div>
      <el-button v-if="canEdit" type="primary" @click="openForm('create')">
        <IconifyIconOffline :icon="Add" />
        新建
      </el-button>
    </div>

    <el-form :model="query" inline class="cq-search-form">
      <el-form-item label="标题">
        <el-input
          v-model="query.topic"
          clearable
          placeholder="请输入标题"
          style="width: 190px"
        />
      </el-form-item>
      <el-form-item label="置顶状态">
        <el-select
          v-model="query.topStatus"
          clearable
          placeholder="全部"
          style="width: 116px"
        >
          <el-option label="已置顶" value="1" />
          <el-option label="未置顶" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布状态">
        <el-select
          v-model="query.issuanceTag"
          clearable
          placeholder="全部"
          style="width: 116px"
        >
          <el-option label="已发布" value="1" />
          <el-option label="未发布" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="信息类型">
        <el-select
          v-model="query.infoType"
          clearable
          placeholder="全部"
          style="width: 132px"
        >
          <el-option
            v-for="item in infoTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="有效时间">
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 250px"
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

    <div class="cq-table-wrap">
      <el-table
        v-loading="loading"
        class="cq-table"
        :data="rows"
        size="small"
        height="calc(100% - 42px)"
        border
      >
        <el-table-column type="index" label="序号" width="58" align="center" />
        <el-table-column label="标题" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button link class="cq-link" @click="openForm('view', row)">
              {{ row.topic }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="信息类型" width="110" align="center">
          <template #default="{ row }">
            {{ getInfoTypeLabel(row.infoType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="ableDate"
          label="有效时间"
          width="190"
          show-overflow-tooltip
        />
        <el-table-column prop="createUserName" label="创建人" width="92" />
        <el-table-column label="状态" width="82" align="center">
          <template #default="{ row }">
            <span
              :class="
                row.issuanceTag === '1'
                  ? 'cq-status-published'
                  : 'cq-status-draft'
              "
            >
              {{ row.issuanceTag === "1" ? "已发布" : "未发布" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="附件" width="76" align="center">
          <template #default="{ row }">
            <el-button
              link
              :title="rowEditable(row) ? '上传附件' : '查看附件'"
              @click="openAttachment(row)"
            >
              <IconifyIconOffline
                :icon="rowEditable(row) ? Attachment : Attachment"
              />
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="232" fixed="right" align="center">
          <template #default="{ row }">
            <span class="cq-row-actions">
              <el-button title="查看" circle @click="openForm('view', row)">
                <IconifyIconOffline :icon="Eye" />
              </el-button>
              <el-button
                v-if="rowEditable(row)"
                title="修改"
                circle
                @click="openForm('edit', row)"
              >
                <IconifyIconOffline :icon="Edit" />
              </el-button>
              <el-button
                v-if="rowEditable(row)"
                title="删除"
                circle
                @click="removeRow(row)"
              >
                <IconifyIconOffline :icon="DeleteBin" />
              </el-button>
              <el-button
                v-if="canEdit"
                :title="row.issuanceTag === '1' ? '撤回' : '发布'"
                circle
                @click="togglePublish(row)"
              >
                <IconifyIconOffline
                  :icon="row.issuanceTag === '1' ? Download : Upload"
                />
              </el-button>
              <el-button
                v-if="canEdit"
                :title="row.topStatus === '1' ? '还原' : '置顶'"
                circle
                @click="toggleTop(row)"
              >
                <IconifyIconOffline
                  :icon="row.topStatus === '1' ? PushpinOff : Pushpin"
                />
              </el-button>
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
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <PartyWorkFormDialog
      v-model="formVisible"
      :mode="formMode"
      :row="selectedRow"
      @saved="onSaved"
    />
    <AttachmentDialog
      v-model="attachmentVisible"
      :row="selectedRow"
      :readonly="selectedRow?.issuanceTag === '1' || !canEdit"
    />
  </section>
</template>
