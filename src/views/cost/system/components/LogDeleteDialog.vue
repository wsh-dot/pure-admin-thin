<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { deleteOperationLogs } from "@/api/cost/system";
import { mockRemoveOperationLogs } from "../mock";
import { runMutation } from "../utils";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const monthNum = ref(6);

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

watch(
  () => props.modelValue,
  value => {
    if (value) monthNum.value = 6;
  }
);

async function save() {
  const success = await runMutation(
    () => deleteOperationLogs({ monthNum: monthNum.value }),
    {
      successMessage: "删除成功",
      errorMessage: "删除旧日志失败",
      mockFallback: () => {
        mockRemoveOperationLogs(monthNum.value);
      }
    }
  );

  if (!success) return;
  emit("saved");
  visible.value = false;
}
</script>

<template>
  <el-dialog v-model="visible" title="删除旧日志" width="520px">
    <el-form label-width="160px">
      <el-form-item label="删除多少个月以前的日志">
        <el-input-number v-model="monthNum" :min="1" :step="1" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
