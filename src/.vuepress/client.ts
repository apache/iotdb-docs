/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineDocSearchConfig } from '@vuepress/plugin-docsearch/client';
import { computed } from 'vue';
import { onMounted, nextTick } from 'vue';
import {
  defineClientConfig,
  usePageData,
  useRouter,
  withBase,
} from 'vuepress/client';
import useLegacyRoute from './composables/useLegacyRoute.js';
import DocSearch from './components/DocSearch.vue';
import AIButton from './components/AIButton.vue';
import Layout from './components/SidebarLayout.vue';
import { getDocVersion } from './utils/index.js';

export default defineClientConfig({
  enhance: ({ app }) => {
    app.component('DocSearch', DocSearch);
    app.component('AIButton', AIButton);
  },
  setup() {
    useLegacyRoute();
    const pageData = usePageData();
    const router = useRouter();

    let lastTo = '';

    router.onError((error) => {
      console.warn(error);
      if (!lastTo) return;
      window.location.href = withBase(lastTo);
      lastTo = '';
    });
    router.beforeEach((to) => {
      lastTo = to.fullPath;
    });

    function addConvertSingleLineButton() {
      if (typeof document === 'undefined') return;

      const blocks = document.querySelectorAll<HTMLElement>('div[class*="language-sql"] pre');
      const copyIcon = `<svg t="1773227012571" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7157" width="18px" height="18px"><path d="M860.253405 512.000461a431.238022 431.238022 0 0 0-139.308875-316.862415A40.958141 40.958141 0 1 0 665.702238 255.448908a348.144194 348.144194 0 0 1-202.691598 603.108619l30.718605-30.718605a41.019578 41.019578 0 0 0-57.904571-58.109362l-81.301909 81.301909a56.317443 56.317443 0 0 0 0 79.663583l81.301909 81.301909a40.97862 40.97862 0 0 0 57.955769-57.955769l-14.847326-14.796128A430.674847 430.674847 0 0 0 860.253405 512.000461zM350.01737 254.271362a40.958141 40.958141 0 0 0 57.955768 0l81.301909-81.301909a56.317443 56.317443 0 0 0 0-79.663583L407.973138 12.003961a40.97862 40.97862 0 0 0-57.955768 57.955768l16.74164 16.690443a430.060475 430.060475 0 0 0-227.31768 742.366296A40.958141 40.958141 0 0 0 194.683622 768.552013 348.144194 348.144194 0 0 1 378.688068 167.696092l-28.670698 28.619501a40.958141 40.958141 0 0 0 0 57.955769z" fill="#ffffff" p-id="7158"></path></svg>`;
      const tipContent = pageData.value.lang === 'zh-CN' ? '已转换为单行' : 'Converted as single line';
      const hoverTipContent = pageData.value.lang === 'zh-CN' ? '转换为单行' : 'Convert as single line';
      const copyTipContent = pageData.value.lang === 'zh-CN' ? '复制内容' : 'Copy content';

      blocks.forEach((pre) => {
        if (pre.querySelector('.copy-one-line-btn')) return;

        const parentEl = pre.parentElement;
        if (!parentEl) return;
        const lineNumbers = parentEl.querySelector('div[class="line-numbers"]');
        if (!lineNumbers) return;
        const copyBtn = parentEl.querySelector<HTMLElement>('button[class*="vp-copy-code-button"]');
        if (!copyBtn) return;
        copyBtn.title = copyTipContent;

        const code = pre.querySelector('code');
        if (!code) return;

        const copiedTooltip = document.createElement('div');
        copiedTooltip.className = 'copy-one-line-tooltip';
        pre.appendChild(copiedTooltip);

        const btn = document.createElement('button');
        btn.innerHTML = copyIcon;
        btn.className = 'copy-one-line-btn';
        btn.title = hoverTipContent;

        btn.onclick = () => {
          const text = code.innerText;
          const lines = text.split('\n');
          
          const single = lines
            .map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed || trimmed === '') return '';
              console.log('line', trimmed);
              if (i === lines.length - 1) return trimmed;
              if (trimmed.endsWith(';')) {
                return trimmed + '\n';
              }
              if (trimmed.endsWith('\\')) {
                return trimmed.slice(0, -1) + ' ';
              }
              return trimmed + ' ';
            })
            .join('');

          const convertedSpan = single.split('\n').map((line) => `<span class="line"><span>${line}\n</span></span>`).join('');  
          const counter = single.split('\n').length;
          code.innerHTML = convertedSpan;
          if (lineNumbers) {
            const childCount = lineNumbers.children.length;
            for (let i = counter; i < childCount; i++) {
              const child = lineNumbers.children[0];
              lineNumbers.removeChild(child);
            }
          }

          btn.style.opacity = '80';
          btn.style.backgroundColor = 'rgb(47, 53, 66)';
          copiedTooltip.style.opacity = '100';
          copiedTooltip.innerText = tipContent;

          setTimeout(() => {
            btn.style.backgroundColor = '';
            copiedTooltip.innerText = '';
            btn.style.visibility = 'hidden';
            copiedTooltip.style.visibility = 'hidden';
          }, 1500);
        };
        pre.appendChild(btn);
      });
    }

    onMounted(() => {
      nextTick(() => addConvertSingleLineButton());
    });

    router.afterEach(() => {
      nextTick(() => addConvertSingleLineButton());
    });

    const docSearchConfig = computed(() => ({
      appId: 'JLT9R2YGAE',
      apiKey: 'f1f30c0df04d74534e066d07786bce05',
      indexName: 'iotdb-apache',
      maxResultsPerGroup: 10,
      disableUserPersonalization: true,
      searchParameters: {
        indexName: 'iotdb-apache',
        facetFilters: [`version:${getDocVersion(pageData.value.path)}`],
      },
    }));

    defineDocSearchConfig(docSearchConfig);
  },
  layouts: {
    Layout: Layout,
  },
});
