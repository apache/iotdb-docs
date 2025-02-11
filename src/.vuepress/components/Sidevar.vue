<template>
  <Sidebar>
    <template #top>
      <div class="sidebar-top-wrapper">
        <ul class="switch-list" v-if="currentDialect">
          <li
            :class="['switch-type', { 'switch-active': currentDialect === 'Tree' }]"
            @click="handleChangeDialect('Tree')">Tree
          </li>
          <li
            :class="['switch-type', { 'switch-active': currentDialect === 'Table' }]"
            @click="handleChangeDialect('Table')">Table
          </li>
        </ul>
      </div>
    </template>
  </Sidebar>
</template>

<script setup lang="ts">
import Sidebar from 'vuepress-theme-hope/modules/sidebar/components/Sidebar.js';
import { ref, watch } from 'vue';
import { useRoute } from 'vuepress/client';
import { getDialect, getDocVersion } from '../utils/index.js';

const route = useRoute();
const currentLang = ref('zh');
const currentVersion = ref('');
const currentDialect = ref('');

function handleChangeDialect(val: string) {
  const oldPath = 'latest';
  const newPath = 'latest-Table';
  if(currentDialect.value ==='Table'){
    window.location.href = window.location.href.replace(newPath, oldPath);
  } else {
    window.location.href = window.location.href.replace(oldPath, newPath);
  }
  // window.location.href = `${window.location.origin}/docs${currentLang.value === 'zh' ? currentVersion.value.link : currentVersion.value.enLink}`.replace(currentDialect.value, val);
}


watch(
  () => route.path,
  (newVal) => {
    const allPath: string[] = newVal?.split('/');
    if (allPath && allPath.length > 2) {
      if (allPath[1] === 'zh') {
        currentLang.value = 'zh';
      } else {
        currentLang.value = 'en';
      }
      currentVersion.value = getDocVersion(newVal,'latest');
      currentDialect.value = getDialect(newVal,'');
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.vp-sidebar > .vp-sidebar-links {
  padding: 1rem 0;
}
.switch-list {
  display: flex;
  width: 100px;
  margin-right: 12px;
  border-radius: 14px;
  background-color: #f0f1fa;
  list-style-type: none;
  padding: 4px;
  margin: 0;
  margin-top: 1rem;

  .switch-type {
    padding: 3px 9px;
    cursor: pointer;
    border-radius: 14px;
    background-color: transparent;
    font-size: 14px;
    line-height: 18px;
    color: #656a85;
  }

  .switch-active {
    background-color: #495ad4;
    color: #fff;
  }
}
</style>