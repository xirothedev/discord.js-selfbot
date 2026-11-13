import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { appName, basePath, gitConfig } from './shared';

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
        <span className="flex items-center gap-2">
          <Image
            src={`${basePath}/icon.svg`}
            alt=""
            width={24}
            height={24}
            className="size-6"
          />
          <span className="font-semibold tracking-tight">{appName}</span>
        </span>
      ),
    },
  };
}
