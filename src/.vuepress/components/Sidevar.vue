<template>
  <Sidebar>
    <template #top>
      <p class="vp-sidebar-header" style="margin-top: 1rem;">
        <span class="vp-sidebar-title">{{(sidebarItems && sidebarItems.length>0) ? sidebarItems[0]?.text: ''}}</span>
      </p>
      <div class="sidebar-top-wrapper">
        <ul class="switch-list" v-if="currentDialect">
          <li
            :class="['switch-type', { 'switch-active': currentDialect === 'Tree' }]"
            @click="handleChangeDialect('Tree')">{{ ModelName.Tree }}
          </li>
          <li
            :class="['switch-type', { 'switch-active': currentDialect === 'Table' }]"
            @click="handleChangeDialect('Table')">{{ ModelName.Table }}
          </li>
        </ul>
      </div>
    </template>
  </Sidebar>
</template>

<script setup lang="ts">
import { useSidebarItems } from "vuepress-theme-hope/modules/sidebar/composables/index.js";
import Sidebar from 'vuepress-theme-hope/modules/sidebar/components/Sidebar.js';
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vuepress/client';
import { getDialect, getDocVersion } from '../utils/index.js';

const route = useRoute();
const currentLang = ref('zh');
const currentVersion = ref('');
const currentDialect = ref('');

const ModelName = computed(() => {
  return currentLang.value === 'zh' ? {
    'Tree': '树模型',
    'Table': '表模型',
  } : {
    'Tree': 'Tree',
    'Table': 'Table',
  };
});

const sidebarItems = useSidebarItems();
Window.sidebarItems = sidebarItems;

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
.vp-sidebar-links li:first-child {
    display: none;
}
.vp-sidebar > .vp-sidebar-links {
  padding: 0.25rem 0;
}
.switch-list {
  display: flex;
  text-align: center;
  width: 150px;
  margin-right: 12px;
  border-radius: 16px;
  background-color: #f0f1fa;
  list-style-type: none;
  padding: 4px;
  margin: 0;
  margin-left: 16px;

  .switch-type {
    padding: 1px 9px;
    flex: 1;
    cursor: pointer;
    border-radius: 16px;
    background-color: transparent;
    font-size: 1.1em;
    line-height: 1.5;
    color: #656a85;
  }

  .switch-active {
    background-color: #495ad4;
    color: #fff;
  }
}
</style>