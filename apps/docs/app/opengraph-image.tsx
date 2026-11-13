import { generateOGImage } from 'fumadocs-ui/og';

import { appName, appVersion } from '@/lib/shared';

const Icon = () => (
  <svg
    height="56"
    viewBox="0 0 64 64"
    width="56"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect fill="#5865F2" height="64" rx="14" width="64" />
    <path
      d="M18 16h13c9 0 15 6 15 16s-6 16-15 16H18V16Zm8 7v18h5c5 0 8-3.2 8-9s-3-9-8-9h-5Z"
      fill="#fff"
    />
    <circle cx="48" cy="50" fill="#57F287" r="5" />
  </svg>
);

export const dynamic = 'force-static';
export const size = { height: 630, width: 1200 };
export const contentType = 'image/png';

export default function Image() {
  return generateOGImage({
    description:
      'A Bun-first, TypeScript selfbot with a discord.js v14-compatible API.',
    icon: <Icon />,
    primaryColor: '#5865f2',
    primaryTextColor: '#ffffff',
    site: appName,
    title: `${appName} ${appVersion}`,
  });
}
