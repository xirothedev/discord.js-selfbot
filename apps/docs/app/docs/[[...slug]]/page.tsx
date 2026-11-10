import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMDXComponents } from "@/components/mdx";
import {
  getGitHubUrl,
  getPageImageUrl,
  getPageMarkdownUrl,
} from "@/lib/shared";
import { source } from "@/lib/source";

const ANCHOR_TAG = "a";

const Page = async (props: PageProps<"/docs/[[...slug]]">) => {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const PageContent = page.data.body;
  const toc = page.url.startsWith("/docs/api")
    ? page.data.toc.filter((item) => item.depth <= 2)
    : page.data.toc;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl =
    page.data.sourceUrl ?? getGitHubUrl(`apps/docs/content/docs/${page.path}`);

  return (
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
  );
};

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  return {
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
    title: page.data.title,
  };
}

export default Page;
