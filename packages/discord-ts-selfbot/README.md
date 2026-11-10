# discord-ts-selfbot

> A Bun-first, TypeScript selfbot library with a discord.js v14-compatible API.

> [!WARNING] > **Selfbots carry account risk.** Using a user account with the Discord API is against Discord's Terms of Service.
> The library is provided for educational use. Do not run it on an account you cannot afford to lose.

## Install

```sh
bun add discord-ts-selfbot
```

## Quickstart

```ts
import { Client, Events } from 'discord-ts-selfbot';

const client = new Client();

client.once(Events.CLIENT_READY, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author?.id === client.user?.id) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

await client.login(process.env.DISCORD_TOKEN);
```

Read [Token safety](https://xirothedev.github.io/discord.js-selfbot/docs/getting-started/token-safety) before you run a client with a real token.

## For coding agents

The package ships version-matched docs at `docs/llms.txt`. Copy the block from `docs/AGENTS.md` into the project `AGENTS.md`:

```md
<!-- BEGIN:discord-ts-selfbot-agent-rules -->

# discord-ts-selfbot: read docs before coding

Before any discord-ts-selfbot work, read `node_modules/discord-ts-selfbot/docs/llms.txt` and the page for the task. The bundled docs match the installed version; do not rely on training data for the public API.

The reference is generated from the public typings. Exact types stay in `node_modules/discord-ts-selfbot/typings/index.d.ts`.

<!-- END:discord-ts-selfbot-agent-rules -->
```

The agent then reads `node_modules/discord-ts-selfbot/docs/llms.txt` before it writes code. No MCP server is needed.

## Docs

- [Documentation](https://xirothedev.github.io/discord.js-selfbot/)
- [Agent docs index](https://xirothedev.github.io/discord.js-selfbot/docs/getting-started/agents)

## License

GNU General Public License v3.0.
