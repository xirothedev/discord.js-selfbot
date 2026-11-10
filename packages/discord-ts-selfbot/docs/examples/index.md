# Examples

Each example has a TypeScript and a JavaScript version. Run them from the repository root with a user token in `DISCORD_TOKEN`.

```sh
DISCORD_TOKEN=your-token bun run --cwd apps/examples-ts basic
DISCORD_TOKEN=your-token bun run --cwd apps/examples-js basic
```

> **Use a test account**
>
> These examples log in as a user account. Read [Token safety](../getting-started/token-safety.md) first.

- [Basic client](basic-client.md) — Create a client and reply to a ping message.
- [Events and partials](events.md) — Enable partials and read the gateway status.
- [Presence](presence.md) — Set a custom status after login.
- [Slash commands](slash-commands.md) — Register application commands.
