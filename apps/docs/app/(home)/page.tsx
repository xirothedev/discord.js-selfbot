import Link from "next/link";

import { Icon, ICON } from "@/components/icons";
import { appVersion } from "@/lib/shared";

const features = [
  {
    description:
      "Events, Partials, Status, builders, 20 interaction classes, and the v14 client surface.",
    icon: ICON.api,
    title: "discord.js v14 parity",
  },
  {
    description:
      "Every source module has a TypeScript counterpart, with handwritten public typings.",
    icon: ICON.examples,
    title: "TypeScript first",
  },
  {
    description:
      "Join channels, play audio, video, or streams, and clean up connections.",
    icon: ICON.voice,
    title: "Voice and video",
  },
  {
    description:
      "Ring, accept message requests, and follow CallState transitions.",
    icon: ICON.calls,
    title: "DM and group calls",
  },
  {
    description:
      "Build ffmpeg pipelines for audio and video without leaking processes.",
    icon: ICON.recording,
    title: "Recording",
  },
  {
    description:
      "Route-level HTTP and gateway tests without a real token or network.",
    icon: ICON.safety,
    title: "Fake Discord test server",
  },
];

const stats = [
  ["365", "TypeScript modules"],
  ["92", "tests"],
  ["474", "assertions"],
  ["0", "open parity issues"],
];

const HomePage = () => (
  <main className="flex-1">
    <section className="border-fd-border from-fd-background via-fd-background to-fd-muted/30 border-b bg-linear-to-b">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-28">
        <div>
          <span className="border-fd-border bg-fd-card inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="bg-discord-green size-1.5 rounded-full" />v
            {appVersion} · Bun-first · TypeScript
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A discord.js v14-compatible{" "}
            <span className="text-discord-blurple">selfbot</span>, built for
            Bun.
          </h1>
          <p className="text-fd-muted-foreground mt-5 max-w-xl text-lg leading-8">
            Voice, calls, recording, interactions, and the v14 API surface.
            Typed end to end and tested against a fake Discord server.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs/getting-started/installation"
              className="bg-discord-blurple inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get started
              <Icon icon={ICON.arrowRight} className="size-4" />
            </Link>
            <Link
              href="/docs/api"
              className="border-fd-border bg-fd-card hover:bg-fd-accent inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              API reference
            </Link>
            <Link
              href="https://github.com/xirothedev/discord.js-selfbot"
              className="text-fd-muted-foreground hover:text-fd-foreground inline-flex items-center gap-2 px-2 py-2.5 text-sm font-medium transition-colors"
            >
              <Icon icon={ICON.github} className="size-4" />
              GitHub
            </Link>
          </div>

          <div className="border-fd-border bg-fd-card mt-8 flex max-w-md items-center gap-3 rounded-lg border px-4 py-3 font-mono text-sm">
            <span className="text-discord-green">$</span>
            <code className="text-fd-foreground">
              bun add discord-ts-selfbot
            </code>
          </div>
        </div>

        <div className="border-fd-border bg-fd-card overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-fd-border flex items-center gap-2 border-b px-4 py-3">
            <span className="bg-discord-blurple size-2.5 rounded-full" />
            <span className="bg-discord-green size-2.5 rounded-full" />
            <span className="bg-fd-muted-foreground/40 size-2.5 rounded-full" />
            <span className="text-fd-muted-foreground ml-2 font-mono text-xs">
              basic-client.ts
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-5">
            <code>{`import { Client, Events } from 'discord-ts-selfbot';

const client = new Client();

client.once(Events.CLIENT_READY, (ready) => {
  console.log(\`Logged in as \${ready.user.tag}\`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

await client.login(process.env.DISCORD_TOKEN);`}</code>
          </pre>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="border-fd-border bg-fd-card rounded-xl border p-5"
          >
            <Icon icon={feature.icon} className="text-discord-blurple size-5" />
            <h2 className="mt-4 text-base font-semibold">{feature.title}</h2>
            <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>

    <section className="border-fd-border bg-fd-muted/20 border-y">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label}>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <div className="text-fd-muted-foreground mt-1 text-sm">{label}</div>
          </div>
        ))}
      </div>
    </section>

    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <div className="flex items-start gap-3">
          <Icon
            icon={ICON.safety}
            className="mt-0.5 size-5 shrink-0 text-amber-500"
          />
          <div>
            <h2 className="font-semibold">Selfbots carry account risk</h2>
            <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
              Using a user account with the Discord API is against
              Discord&apos;s Terms of Service. The library is provided for
              educational use. Do not run it on an account you cannot afford to
              lose.
            </p>
            <Link
              href="/docs/project/safety"
              className="text-discord-blurple mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Read the safety notes
              <Icon icon={ICON.arrowRight} className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div className="border-fd-border bg-fd-card rounded-2xl border p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Start with the quickstart
        </h2>
        <p className="text-fd-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-6">
          Install the package, create a client, and connect with a user token in
          four steps. Read the token safety page first.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/getting-started/installation"
            className="bg-discord-blurple inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Installation
            <Icon icon={ICON.arrowRight} className="size-4" />
          </Link>
          <Link
            href="/docs/guides/client-events"
            className="border-fd-border hover:bg-fd-accent inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Client and events
          </Link>
        </div>
      </div>
    </section>
  </main>
);

export default HomePage;
