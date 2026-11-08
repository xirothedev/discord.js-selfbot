import { generateOGImage } from 'fumadocs-ui/og';
import { appName, appVersion } from '@/lib/shared';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateOGImage({
    title: `${appName} ${appVersion}`,
    description: 'A Bun-first, TypeScript selfbot with a discord.js v14-compatible API.',
    site: appName,
    primaryColor: '#5865f2',
    primaryTextColor: '#ffffff',
  });
}
