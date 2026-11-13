import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { basePath, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      { active: 'nested-url', text: 'Docs', url: '/docs' },
      { active: 'nested-url', text: 'API', url: '/docs/api' },
      { active: 'nested-url', text: 'Examples', url: '/docs/examples' },
    ],
    nav: {
      title: (
        <Image
          src={`${basePath}/logo.png`}
          alt="discord.ts"
          width={1288}
          height={217}
          className="h-6 w-auto"
          priority
        />
      ),
    },
  };
}
