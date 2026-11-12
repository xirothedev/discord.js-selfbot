import { createGetUrl } from 'fumadocs-core/source';

export const appName = '@discord-selfbot/core';
export const appVersion = '14.0.0';
export const siteUrl = 'https://xirothedev.github.io/discord.js-selfbot';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  branch: 'main',
  repo: 'discord.js-selfbot',
  user: 'xirothedev',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}

export function getGitHubUrl(path: string) {
  return `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${path}`;
}
