<script setup lang="ts">
import { ref } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import changqingLogo from "@/assets/cost/changqing-logo.png";
import UserLine from "~icons/ri/user-3-line";
import BuildingLine from "~icons/ri/building-2-line";
import SwapLine from "~icons/ri/swap-box-line";
import HomeLine from "~icons/ri/home-4-line";
import ProfileLine from "~icons/ri/profile-line";
import LogoutLine from "~icons/ri/logout-circle-r-line";

const { logout } = useNav();
const profileVisible = ref(false);
const orgVisible = ref(false);
const displayUsername = "系统管理员";
const displayOrg = "长庆油田分公司";
</script>

<template>
  <div class="cq-navbar">
    <div class="cq-brand">
      <img
        class="cq-brand-logo"
        :src="changqingLogo"
        alt="长庆油田公司工程造价管理信息系统"
      />
      <div class="cq-brand-title">
        <h1>长庆油田公司工程造价管理信息系统</h1>
      </div>
    </div>

    <nav class="cq-user-links" aria-label="用户入口">
      <span class="cq-user">
        <IconifyIconOffline :icon="UserLine" />
        <b>{{ displayUsername }}</b>
        <em>，欢迎您！</em>
      </span>
      <span class="cq-org">
        <IconifyIconOffline :icon="BuildingLine" />
        <b>{{ displayOrg }}</b>
      </span>
      <button type="button" @click="orgVisible = true">
        <IconifyIconOffline :icon="SwapLine" />
        切换
      </button>
      <span class="cq-separator">|</span>
      <button type="button">
        <IconifyIconOffline :icon="HomeLine" />
        部门首页
      </button>
      <span class="cq-separator">|</span>
      <button type="button" @click="profileVisible = true">
        <IconifyIconOffline :icon="ProfileLine" />
        个人信息
      </button>
      <span class="cq-separator">|</span>
      <button type="button" @click="logout">
        <IconifyIconOffline :icon="LogoutLine" />
        退出
      </button>
    </nav>

    <el-dialog v-model="orgVisible" title="单位切换" width="420px">
      <el-radio-group model-value="cost-center" class="cq-dialog-options">
        <el-radio value="cost-center">长庆油田分公司</el-radio>
        <el-radio value="project-office">项目管理办公室</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button type="primary" @click="orgVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="profileVisible" title="个人信息" width="420px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户">
          {{ displayUsername }}
        </el-descriptions-item>
        <el-descriptions-item label="单位">
          {{ displayOrg }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">系统管理员</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="profileVisible = false">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
