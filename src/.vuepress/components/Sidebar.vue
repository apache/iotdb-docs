<template>
  <Sidebar class="iotdb-sidebar">
    <template #top>
      <p class="vp-sidebar-header iotdb-sidebar-header">
        <span class="vp-sidebar-title">{{ (sidebarItems && sidebarItems.length > 0) ? sidebarItems[0]?.text : ''
        }}</span>
      </p>
      <div class="sidebar-top-wrapper" v-if="currentDialect">
        <ul class="switch-list">
          <li :class="['switch-type', { 'switch-active': currentDialect === 'Tree' }]"
            @click="handleChangeDialect('Tree')">{{ ModelName.Tree }}
          </li>
          <li :class="['switch-type', { 'switch-active': currentDialect === 'Table' }]"
            @click="handleChangeDialect('Table')">{{ ModelName.Table }}
          </li>
        </ul>
        <div class="help-icon-wrapper">
          <div class="help-icon" @click="handleHelpClick">
            <span>{{ ModelName.Tip }}</span>
          </div>
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
    'Tip': '模型说明',
  } : {
    'Tree': 'Tree',
    'Table': 'Table',
    'Tip': 'Description',
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
}

.help-icon {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 300;
  color: var(--vp-c-accent, #299764);
  transition: background-color 0.3s;

  &:hover {
    text-decoration: underline;
  }
}
</style>