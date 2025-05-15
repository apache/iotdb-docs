<template>
  <Sidebar class="iotdb-sidebar">
    <template #top>
      <p class="vp-sidebar-header iotdb-sidebar-header">
        <span class="vp-sidebar-title">{{ (sidebarItems && sidebarItems.length > 0) ? sidebarItems[0]?.text : ''
          }}</span>
      </p>
      <div class="sidebar-top-wrapper">
        <ul class="switch-list" v-if="currentDialect">
          <li :class="['switch-type', { 'switch-active': currentDialect === 'Tree' }]"
            @click="handleChangeDialect('Tree')">{{ ModelName.Tree }}
          </li>
          <li :class="['switch-type', { 'switch-active': currentDialect === 'Table' }]"
            @click="handleChangeDialect('Table')">{{ ModelName.Table }}
          </li>
        </ul>
        <div class="help-icon-wrapper">
          <div class="help-icon" @click="handleHelpClick">
            <span>?</span>
          </div>
          <div class="tooltip">{{ ModelName.Tip }}</div>
        </div>
      </div>
    </template>
  </Sidebar>
</template>

<script setup lang="ts">
import { useSidebarItems } from "vuepress-theme-hope/modules/sidebar/composables/index.js";
import Sidebar from 'vuepress-theme-hope/modules/sidebar/components/Sidebar.js';
import { ref, watch, computed } from 'vue';
import { useRoute, withBase, useRouter } from 'vuepress/client';
import { getDialect, getDocVersion, URL_SUFFIX } from '../utils/index.js';

const route = useRoute();
const router = useRouter();
const currentLang = ref('zh');
const currentVersion = ref('');
const currentDialect = ref('');

const ModelName = computed(() => {
  return currentLang.value === 'zh' ? {
    'Tree': '树模型',
    'Table': '表模型',
    'Tip': '模型选择说明',
  } : {
    'Tree': 'Tree',
    'Table': 'Table',
    'Tip': 'Model Choice Description',
  };
});

const sidebarItems = useSidebarItems();

function handleChangeDialect(val: string) {
  const oldPath = 'latest';
  const newPath = 'latest-Table';
  if (currentDialect.value === 'Table') {
    window.location.href = window.location.href.replace(newPath, oldPath);
  } else {
    window.location.href = window.location.href.replace(oldPath, newPath);
  }
}

function handleHelpClick() {
  const modelLink = withBase((currentLang.value === 'zh' ? 'zh/' : '') + 'UserGuide/' + currentVersion.value + '/Background-knowledge/Data-Model-and-Terminology' + URL_SUFFIX + '.html');
  router.push(modelLink);
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
      currentVersion.value = getDocVersion(newVal, 'latest');
      currentDialect.value = getDialect(newVal, '');
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.vp-sidebar .vp-sidebar-links:first-child li:first-child {
  display: none;
}

.sidebar-top-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: visible;
  padding-right: 1.25rem;
}

.help-icon-wrapper {
  position: relative;
  margin-left: 8px;
  overflow: visible;

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
}

.help-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  color: #555;
  transition: background-color 0.3s;

  &:hover {
    background-color: #495ad4;
    color: white;
  }
}

.tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000; // 提高 z-index 确保不被遮挡
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s;

  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px 5px 0;
    border-style: solid;
    border-color: #333 transparent transparent;
  }
}

.iotdb-sidebar {
  overflow: visible !important;
}
</style>