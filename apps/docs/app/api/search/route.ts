import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

const searchSource = {
  ...source,
  getPages: () => source.getPages().filter(page => !page.url.startsWith('/docs/api')),
};

export const { staticGET: GET } = createFromSource(searchSource, {
  language: 'english',
});
