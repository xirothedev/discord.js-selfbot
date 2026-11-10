import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '@/lib/source';

export const revalidate = false;

const searchSource = {
  ...source,
  getPages: () =>
    source.getPages().filter((page) => !page.url.startsWith('/docs/api')),
};

export const { staticGET: GET } = createFromSource(searchSource, {
  language: 'english',
});
