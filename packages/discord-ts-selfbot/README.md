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

The package ships version-matched docs at `docs/llms.txt`. Read that file first, then open the page for the task. The reference is generated from the public typings; exact types stay in `typings/index.d.ts`.

To expose the docs path through MCP, install the gateway:

```json
{
  "mcpServers": {
    "discord-ts-selfbot": {
      "command": "npx",
      "args": ["-y", "discord-ts-selfbot-mcp@latest"]
    }
  }
}
```

Or add this line to the project `AGENTS.md`:

```md
Before you write discord-ts-selfbot code, read `node_modules/discord-ts-selfbot/docs/llms.txt` and the page for the task.
```

## Docs

- [Documentation](https://xirothedev.github.io/discord.js-selfbot/)
- [Agent docs index](https://xirothedev.github.io/discord.js-selfbot/docs/getting-started/agents)

## License

GNU General Public License v3.0.
