import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const basePath = process.env.NODE_ENV === 'production' ? '/discord.js-selfbot' : '';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'fumadocs-ui', 'fumadocs-core', 'shiki'],
    turbopackRustReactCompiler: true,
    turbopackFileSystemCacheForBuild: !process.env.CI,
  },
  typescript: {
    ignoreBuildErrors: Boolean(process.env.CI),
  },
};

export default withMDX(config);
