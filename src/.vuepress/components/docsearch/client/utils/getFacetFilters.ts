import type { DocsearchOptions } from '../../shared/index.js';

type FacetFilters =
  Required<DocsearchOptions>['searchParameters']['facetFilters'];

/**
 * Get facet filters for current lang
 */
export const getFacetFilters = (
  rawFacetFilters: FacetFilters = [],
  lang: string,
  version: string,
): FacetFilters => [
  `lang:${lang}`,
  `version:${version}`,
  ...((Array.isArray(rawFacetFilters)
    ? rawFacetFilters
    : [rawFacetFilters]) as string[]),
];
