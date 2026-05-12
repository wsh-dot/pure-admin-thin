<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { infoTypeOptions, upsertPartyWorkMock } from "../mock";
import type { PartyWorkRow } from "../types";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit" | "view";
  row?: PartyWorkRow | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  saved: [];
}>();

const form = reactive<PartyWorkRow>({
  id: "",
  topic: "",
  infoType: "10",
  ableDate: "",
  createUserName: "系统管理员",
  fileId: "",
  issuanceTag: "0",
  topStatus: "0"
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const title = computed(() => {
  if (props.mode === "view") return "查看党建工作";
  return props.mode === "edit" ? "编辑党建工作" : "新建党建工作";
});

const readonly = computed(() => props.mode === "view");

watch(
  () => [props.modelValue, props.row, props.mode] as const,
  () => {
    if (!props.modelValue) return;
    Object.assign(form, {
      id: props.row?.id ?? `PW${Date.now()}`,
      topic: props.row?.topic ?? "",
      infoType: props.row?.infoType ?? "10",
      ableDate: props.row?.ableDate ?? "",
      createUserName: props.row?.createUserName ?? "系统管理员",
      fileId: props.row?.fileId ?? "",
      issuanceTag: props.row?.issuanceTag ?? "0",
      topStatus: props.row?.topStatus ?? "0"
    });
  },
  { immediate: true }
);

function save() {
  upsertPartyWorkMock({ ...form });
  emit("saved");
  visible.value = false;
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="680px">
    <el-form label-width="90px" :model="form" :disabled="readonly">
      <el-form-item label="标题">
        <el-input v-model="form.topic" maxlength="80" show-word-limit />
      </el-form-item>
      <el-form-item label="信息类型">
        <el-select v-model="form.infoType" class="w-full">
          <el-option
            v-for="item in infoTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="有效时间">
        <el-input
          v-model="form.ableDate"
          placeholder="例如：2026-05-01 至 2026-05-31"
        />
      </el-form-item>
      <el-form-item label="创建人">
        <el-input v-model="form.createUserName" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">
        {{ readonly ? "关闭" : "取消" }}
      </el-button>
      <el-button v-if="!readonly" type="primary" @click="save">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>
