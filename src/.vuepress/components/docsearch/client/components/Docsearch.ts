/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import type { PropType } from 'vue';
import {
  computed, defineComponent, h, onMounted, ref, watch,
} from 'vue';
import { usePageLang, useRouteLocale, usePageData } from 'vuepress/client';
import type { DocsearchOptions } from '../../shared/index.js';
import {
  useDocsearchHotkeyListener,
  useDocsearchShim,
} from '../composables/index.js';
import { useDocSearchOptions } from '../helpers/index.js';
import {
  getFacetFilters,
  getSearchButtonTemplate,
  pollToOpenDocsearch,
  preconnectToAlgolia,
} from '../utils/index.js';

declare const __DOCSEARCH_INJECT_STYLES__: boolean;
const defaultBranch = 'latest';

if (__DOCSEARCH_INJECT_STYLES__) {
  import('@docsearch/css');
  import('../styles/docsearch.css');
}

export const Docsearch = defineComponent({
  name: 'Docsearch',

  props: {
    containerId: {
      type: String,
      default: 'docsearch-container',
    },
    options: {
      type: Object as PropType<DocsearchOptions>,
      default: () => ({}),
    },
  },

  setup(props) {
    const docSearchOptions = useDocSearchOptions();
    const docsearchShim = useDocsearchShim();
    const lang = usePageLang();
    const routeLocale = useRouteLocale();
    const pageData = usePageData();

    const hasInitialized = ref(false);
    const hasTriggered = ref(false);

    const getDocVersion = (branch = 'latest', path = '') => {
      if (path.indexOf('UserGuide/Master') > -1 || path.indexOf('UserGuide') === -1) {
        return branch;
      }
      const branchRex = /UserGuide\/V(\d+\.\d+\.x)/;
      if (branchRex.test(path)) {
        const tag = branchRex.exec(path)![1];
        return `rel/${tag.replace('.x', '')}`;
      }
      return branch;
    };

    const version = computed(() => getDocVersion(defaultBranch, pageData.value.path));

    // resolve docsearch options for current locale
    const docsearchOptions = computed(() => {
      const { locales = {}, ...options } = props.options;

      return {
        ...docSearchOptions.value,
        ...options,
        ...locales[routeLocale.value],
      };
    });

    /**
     * Import docsearch js and initialize
     */
    const initialize = async (): Promise<void> => {
      const { default: docsearch } = await import('@docsearch/js');
      debugger;
      docsearch({
        ...docsearchShim,
        ...docsearchOptions.value,
        container: `#${props.containerId}`,
        searchParameters: {
          ...docsearchOptions.value.searchParameters,
          facetFilters: getFacetFilters(
            docsearchOptions.value.searchParameters?.facetFilters,
            lang.value,
            version.value,
          ),
        },
      });
      // mark as initialized
      hasInitialized.value = true;
    };

    /**
     * Trigger docsearch initialization and open it
     */
    const trigger = (): void => {
      if (hasTriggered.value || hasInitialized.value) return;
      // mark as triggered
      hasTriggered.value = true;
      // initialize and open
      initialize();
      pollToOpenDocsearch();
      // re-initialize when route locale changes
      watch(routeLocale, initialize);
      watch(() => version.value, initialize);
    };

    // trigger when hotkey is pressed
    useDocsearchHotkeyListener(trigger);

    // preconnect to algolia
    onMounted(() => preconnectToAlgolia(docsearchOptions.value.appId));

    return () => [
      h('div', {
        id: props.containerId,
        style: { display: hasInitialized.value ? 'block' : 'none' },
      }),
      hasInitialized.value
        ? null
        : h('div', {
          onClick: trigger,
          innerHTML: getSearchButtonTemplate(
            docsearchOptions.value.translations?.button,
          ),
        }),
    ];
  },
});
