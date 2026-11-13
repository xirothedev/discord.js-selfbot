import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';

import { siteUrl } from './shared';
import { source } from './source';

let cachedLogo: string | undefined;

async function getLogoDataUri(): Promise<string> {
  if (!cachedLogo) {
    const buffer = await readFile(
      path.join(process.cwd(), 'public', 'logo.png')
    );
    cachedLogo = `data:image/png;base64,${buffer.toString('base64')}`;
  }

  return cachedLogo;
}

function titleFontSize(title: string): number {
  if (title.length > 48) {
    return 52;
  }

  if (title.length > 28) {
    return 68;
  }

  return 88;
}

function truncate(text: string | undefined, max: number): string | undefined {
  if (!text) {
    return undefined;
  }

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max - 3)}...`;
}

export interface DocsOGProps {
  description?: string;
  section: string;
  title: string;
}

const FooterLeft = () => (
  <div
    style={{
      color: '#737373',
      fontSize: 24,
      fontWeight: 600,
    }}
  >
    @discord-selfbot/core
  </div>
);

const FooterRight = () => (
  <div
    style={{
      color: '#525252',
      fontSize: 24,
    }}
  >
    {siteUrl.replace('https://', '')}
  </div>
);

export async function renderDocsOGImage({
  description,
  section,
  title,
}: DocsOGProps): Promise<ImageResponse> {
  const logo = await getLogoDataUri();
  const shortDescription = truncate(description, 150);

  return new ImageResponse(
    <div
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '64px 80px',
        width: '100%',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="discord.ts"
          height={48}
          src={logo}
          style={{
            height: 48,
            width: 285,
          }}
          width={285}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: '#a1a1a1',
            fontSize: 30,
            fontWeight: 600,
          }}
        >
          {section}
        </div>
        <div
          style={{
            fontSize: titleFontSize(title),
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 16,
          }}
        >
          {title}
        </div>
        {shortDescription ? (
          <div
            style={{
              color: '#a1a1a1',
              fontSize: 30,
              lineHeight: 1.4,
              marginTop: 20,
            }}
          >
            {shortDescription}
          </div>
        ) : null}
      </div>
      <div
        style={{
          alignItems: 'center',
          borderTop: '1px solid #262626',
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 24,
        }}
      >
        <FooterLeft />
        <FooterRight />
      </div>
    </div>,
    {
      height: 630,
      width: 1200,
    }
  );
}

export function getPageSection(pageUrl: string): string {
  const items = getBreadcrumbItems(pageUrl, source.getPageTree(), {
    includePage: false,
  });
  const names = items
    .map((item) => (typeof item.name === 'string' ? item.name : ''))
    .filter((name) => name.length > 0);

  return names.at(-1) ?? 'Docs';
}
