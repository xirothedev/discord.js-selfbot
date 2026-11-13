import { notFound } from 'next/navigation';

import { getPageImageUrl } from '@/lib/shared';
import { getPageSection, renderDocsOGImage } from '@/lib/og-image';
import { source } from '@/lib/source';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) {
    notFound();
  }

  return renderDocsOGImage({
    description: page.data.description,
    section: getPageSection(page.url),
    title: page.data.title,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
