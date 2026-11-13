import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getMDXComponents } from '@/components/mdx';
import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';
import {
  appName,
  getGitHubUrl,
  getPageImageUrl,
  getPageMarkdownUrl,
  siteUrl,
} from '@/lib/shared';
import { source } from '@/lib/source';

const ANCHOR_TAG = 'a';
const BUILD_DATE = new Date().toISOString();

const Page = async (props: PageProps<'/docs/[[...slug]]'>) => {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const PageContent = page.data.body;
  const toc = page.url.startsWith('/docs/api')
    ? page.data.toc.filter((item) => item.depth <= 2)
    : page.data.toc;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl =
    page.data.sourceUrl ?? getGitHubUrl(`apps/docs/content/docs/${page.path}`);

  const pageUrl = `${siteUrl}${page.url}/`;
  const breadcrumbs = getBreadcrumbItems(page.url, source.getPageTree(), {
    includePage: true,
  });
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        author: {
          '@type': 'Organization',
          name: appName,
          url: 'https://github.com/xirothedev/discord.js-selfbot',
        },
        dateModified: BUILD_DATE,
        description: page.data.description,
        headline: page.data.title,
        inLanguage: 'en',
        isPartOf: {
          '@type': 'WebSite',
          name: appName,
          url: siteUrl,
        },
        url: pageUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          item: item.url ? `${siteUrl}${item.url}/` : pageUrl,
          name: typeof item.name === 'string' ? item.name : page.data.title,
          position: index + 1,
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <DocsPage toc={toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription className="mb-0">
          {page.data.description}
        </DocsDescription>
        <div className="flex flex-row items-center gap-2 border-b pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
        </div>
        <DocsBody>
          <PageContent
            components={getMDXComponents({
              [ANCHOR_TAG]: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
};

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const { description, title } = page.data;
  const pageUrl = `${page.url}/`;
  const ogImage = getPageImageUrl(page).url;

  return {
    alternates: {
      canonical: pageUrl,
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: `${title} — ${appName}`,
          height: 630,
          url: ogImage,
          width: 1200,
        },
      ],
      siteName: appName,
      title,
      type: 'article',
      url: pageUrl,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [ogImage],
      title,
    },
  };
}

export default Page;
