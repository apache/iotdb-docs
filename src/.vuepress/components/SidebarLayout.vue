<template>
  <Layout>
    <template #sidebarTop>
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
    <template #contentAfter v-if="firstPublishedDate">
      <div style="text-align: right; font-size: 14px; color: #3c3c43; margin-bottom: -45px; margin-top: 32px;">{{ firstPublishedDatePlaceholder }}<span style="color: #3c3c43c7;">{{ firstPublishedDate }}</span></div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { useSidebarItems } from "@theme-hope/composables/sidebar/useSidebarItems";
import { Layout } from 'vuepress-theme-hope/client';
import { ref, watch, computed } from 'vue';
import { useRoute, withBase, useRouter } from 'vuepress/client';
import { getDialect, getDocVersion, URL_SUFFIX } from '../utils/index.js';
import { usePageData } from "vuepress/client";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const currentLang = ref('zh');
const currentVersion = ref('');
const currentDialect = ref('');
const page = usePageData();

const firstPublishedDate = computed(() => {
  const raw = page.value.frontmatter.publishedDate;
  return raw ? (currentLang.value === 'zh' ? dayjs(raw).format("YYYY/M/D HH:mm") : dayjs(raw).format("D/M/YY, h:mm A")) : null
})

const firstPublishedDatePlaceholder = computed(() => {
  return currentLang.value === 'zh' ? '首次发布: ' : 'First Published: ';
})

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