import { generateOGImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';

import { appName, getPageImageUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

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

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) {
    notFound();
  }

  return generateOGImage({
    description: page.data.description,
    icon: <Icon />,
    primaryColor: '#5865f2',
    primaryTextColor: '#ffffff',
    site: appName,
    title: page.data.title,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
