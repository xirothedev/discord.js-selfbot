import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const basePath =
  process.env.NODE_ENV === 'production' ? '/discord.js-selfbot' : '';

/** @type {import('next').NextConfig} */
const config = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'fumadocs-ui',
      'fumadocs-core',
      'shiki',
    ],
    turbopackFileSystemCacheForBuild: !process.env.CI,
    turbopackRustReactCompiler: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  reactCompiler: true,
  reactStrictMode: true,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: Boolean(process.env.CI),
  },
};

export default withMDX(config);
