import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";

import { baseOptions } from "@/lib/layout.shared";
import { appName } from "@/lib/shared";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout {...baseOptions()}>
      {children}
      <footer className="border-fd-border border-t">
        <div className="text-fd-muted-foreground mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            {appName} is an unofficial fork. Not affiliated with Discord Inc.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs/project/safety"
              className="hover:text-fd-foreground transition-colors"
            >
              Safety
            </Link>
            <Link
              href="/docs/project/license"
              className="hover:text-fd-foreground transition-colors"
            >
              License
            </Link>
            <Link
              href="https://github.com/xirothedev/discord.js-selfbot"
              className="hover:text-fd-foreground transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </HomeLayout>
  );
}
