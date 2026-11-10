import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { appName, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      { active: "nested-url", text: "Docs", url: "/docs" },
      { active: "nested-url", text: "API", url: "/docs/api" },
      { active: "nested-url", text: "Examples", url: "/docs/examples" },
    ],
    nav: {
      title: (
        <span className="flex items-center gap-2">
          <img src="/icon.svg" alt="" className="size-6" />
          <span className="font-semibold tracking-tight">{appName}</span>
        </span>
      ),
    },
  };
}
