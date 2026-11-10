# Client and events

## Create a client

```ts
import { Client, Events, Partials } from 'discord-ts-selfbot';
import type { PartialTypes } from 'discord-ts-selfbot';

const partials = [Partials.Channel, Partials.Message, Partials.Reaction] as unknown as PartialTypes[];

const client = new Client({
  partials,
  presence: {
    status: 'online',
    activities: [{ name: 'discord-ts-selfbot', type: 'WATCHING' }],
  },
});
```

`ClientOptions` also accepts REST, WebSocket, and HTTP overrides. Most selfbots only need `partials` and `presence`.

## Event names

`Events` is a plain object of string names. Both the v14 alias and the legacy constant point at the same event:

```ts
client.once(Events.CLIENT_READY, onReady);
client.once(Events.ClientReady, onReady); // v14 alias
```

Register one handler unless you need to support a runtime that emits only one name.

## Common events

| Event | When it fires |
| --- | --- |
| `Events.CLIENT_READY` | The gateway session is ready and caches are populated. |
| `Events.MessageCreate` | A message is created in a cached channel. |
| `Events.MessageUpdate` | A message is edited or its embeds change. |
| `Events.MessageDelete` | A message is deleted. |
| `Events.PresenceUpdate` | A guild member changes presence. |
| `Events.TypingStart` | A user starts typing. |
| `Events.RelationshipAdd` | A relationship is added. |
| `Events.RelationshipRemove` | A relationship is removed. |
| `Events.CALL_CREATE` | A DM or group call is created. |
| `Events.Error` | The client emits an error. |
| `Events.Debug` | Gateway and voice debug output. |
| `Events.Warn` | A recoverable warning. |
| `Events.RateLimit` | A REST request hits a rate limit. |

The full list is in the [Events reference](../reference/utilities/events.md).

## Partials

Partials let the client receive events for uncached structures. Enable only the ones you need; partial objects may have incomplete data until you fetch them.

```ts
client.on(Events.MessageCreate, async (message) => {
  if (message.partial) await message.fetch();

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});
```

## Gateway status

`client.ws.status` is a numeric `Status` value:

```ts
import { Status } from 'discord-ts-selfbot';

const label = Status[client.ws.status] ?? 'unknown';
console.log(`Gateway: ${label}`);
```

Listen for `Events.ShardDisconnect` and `Events.ShardReconnecting` if you need to react to reconnects.

## Error handling

```ts
client.on(Events.Error, (error) => {
  console.error('Client error:', error);
});

client.on(Events.Warn, (warning) => {
  console.warn('Client warning:', warning);
});
```

Do not let a rejected event handler become an unhandled rejection. Wrap async handlers in `try/catch`, or add a process-level handler that logs and shuts down.

## Shut down

```ts
process.once('SIGINT', () => {
  client.destroy();
  process.exit(0);
});
```

`Client#destroy` closes the gateway and clears timers. It does not log the account out of Discord.

## Next

- [Messages](messages.md)
- [API: Client](../reference/client/client.md)
- [API: Events](../reference/utilities/events.md)
