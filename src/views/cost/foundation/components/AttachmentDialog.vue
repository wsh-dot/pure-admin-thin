<script setup lang="ts">
import { computed } from "vue";
import type { PartyWorkRow } from "../types";
import Attachment from "~icons/ri/attachment-2";

const props = defineProps<{
  modelValue: boolean;
  row?: PartyWorkRow | null;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});
</script>

<template>
  <el-dialog v-model="visible" title="附件管理" width="560px">
    <div class="attachment-dialog">
      <IconifyIconOffline :icon="Attachment" />
      <div>
        <h3>{{ row?.topic || "党建工作附件" }}</h3>
        <p v-if="row?.fileId">已关联附件编号：{{ row.fileId }}</p>
        <p v-else>暂无附件</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button v-if="!readonly" type="primary">上传附件</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.attachment-dialog {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 18px;
  background: #f7fbff;
  border: 1px solid #dcdfe6;
}

.attachment-dialog svg {
  width: 28px;
  height: 28px;
  color: #075db3;
}

.attachment-dialog h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.attachment-dialog p {
  margin: 0;
  color: #667085;
}
</style>
