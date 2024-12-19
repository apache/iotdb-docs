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
import { useRouter, withBase } from 'vuepress/client';
import { defineClientConfig, usePageData } from 'vuepress/client';
import DocSearch from './components/DocSearch.vue';
import { getDocVersion } from './utils/index.js';

export default defineClientConfig({
  enhance: ({ app }) => {
    app.component('DocSearch', DocSearch);
  },
  setup() {
    const pageData = usePageData();
    const router = useRouter();

    let lastTo  = '';
    
    router.onError((error) => {
      console.warn(error);
      if(!lastTo) return;
      window.location.href = withBase(lastTo);
      lastTo = '';
    });
    router.beforeEach((to) => {
      lastTo = to.fullPath;
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
});
