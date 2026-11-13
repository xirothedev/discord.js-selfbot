import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { basePath, gitConfig } from './shared';
import { PackageSelector } from '@/components/package-selector';

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
        <span className="flex items-center gap-3">
          <Image
            src={`${basePath}/logo.png`}
            alt="discord.ts"
            width={86}
            height={48}
            className="h-6 w-auto"
            priority
          />
          <PackageSelector />
        </span>
      ),
    },
  };
}
