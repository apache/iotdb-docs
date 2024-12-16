import { defineDocSearchConfig } from '@vuepress/plugin-docsearch/client';
import { ref, watchEffect } from 'vue';
import { defineClientConfig, usePageData } from 'vuepress/client';
import { getDocVersion } from './utils/index.js';

const docVersion = ref('latest');

defineDocSearchConfig(() => ({
  appId: 'JLT9R2YGAE',
  apiKey: 'f1f30c0df04d74534e066d07786bce05',
  maxResultsPerGroup: 10,
  disableUserPersonalization: true,
  searchParameters: {
    indexName: 'iotdb-apache',
    facetFilters: [`version:${docVersion.value}`],
  },
}));

defineClientConfig({
  setup() {
    const pageData = usePageData();

    watchEffect(() => {
      docVersion.value = getDocVersion(pageData.value.path);
    });
  },
});
