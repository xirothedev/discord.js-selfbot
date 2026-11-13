import { appName, appVersion } from '@/lib/shared';
import { renderDocsOGImage } from '@/lib/og-image';

export const dynamic = 'force-static';
export const size = { height: 630, width: 1200 };
export const contentType = 'image/png';

export default function Image() {
  return renderDocsOGImage({
    description:
      'A Bun-first, TypeScript selfbot with a discord.js v14-compatible API.',
    section: 'Documentation',
    title: `${appName} ${appVersion}`,
  });
}
