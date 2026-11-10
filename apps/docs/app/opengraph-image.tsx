import { generateOGImage } from "fumadocs-ui/og";

import { appName, appVersion } from "@/lib/shared";

export const dynamic = "force-static";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    description:
      "A Bun-first, TypeScript selfbot with a discord.js v14-compatible API.",
    primaryColor: "#5865f2",
    primaryTextColor: "#ffffff",
    site: appName,
    title: `${appName} ${appVersion}`,
  });
}
