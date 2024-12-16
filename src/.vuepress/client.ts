import { defineDocSearchConfig } from '@vuepress/plugin-docsearch/client';
import { computed } from 'vue';
import { defineClientConfig, usePageData } from 'vuepress/client';
import { getDocVersion } from './utils/index.js';

defineClientConfig({
  setup() {
    const pageData = usePageData();

    const docSearchConfig = computed(() => ({
      appId: 'JLT9R2YGAE',
      apiKey: 'f1f30c0df04d74534e066d07786bce05',
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
