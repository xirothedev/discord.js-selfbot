import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { PackageSelector } from '@/components/package-selector';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

const Layout = ({ children }: LayoutProps<'/docs'>) => (
  <DocsLayout
    tree={source.getPageTree()}
    {...baseOptions()}
    sidebar={{
      banner: <PackageSelector />,
    }}
  >
    {children}
  </DocsLayout>
);

export default Layout;
