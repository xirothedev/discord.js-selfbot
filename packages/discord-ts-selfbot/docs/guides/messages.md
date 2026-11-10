# Messages

## Send and reply

```ts
await channel.send('Hello from Bun.');

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id === client.user?.id) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});
```

`Message#reply` creates a reply reference. Use `channel.send` when you do not want the reference.

## Edit and delete

```ts
const sent = await channel.send('Draft');
await sent.edit('Final text');
await sent.delete();
```

Deleting your own message is safe. Deleting another user's message requires the `MANAGE_MESSAGES` permission and may be logged in the audit log.

## Reactions

```ts
await message.react('✅');
await message.reactions.cache.get('✅')?.users.remove(client.user);
```

`MessageReaction#users` is a manager; fetch it before removing users if the reaction is uncached.

## Attachments

```ts
import { AttachmentBuilder } from 'discord-ts-selfbot';

const file = new AttachmentBuilder(Buffer.from('hello'), { name: 'hello.txt' });
await message.reply({ content: 'File attached.', files: [file] });
```

`AttachmentBuilder` accepts a `Buffer`, a stream, or a file path. The v13 `MessageAttachment` class still exists, but new code should use `AttachmentBuilder`.

## Message state

These selfbot-only methods change how the message appears for your account:

```ts
await message.markRead();
await message.markUnread();

await message.suppressEmbeds(true);
await message.removeAttachments();
```

`removeAttachments()` removes the attachments from the message. `suppressEmbeds(true)` hides link previews; pass `false` to restore them.

## Report a message

```ts
const result = await message.report([3, 28, 72]);
console.log(result.report_id);
```

The breadcrumb numbers are the report menu choices. The API returns a report id. Use this sparingly; false reports can affect the account.

## Search

```ts
const result = await channel.messages.search({
  content: 'hello',
  limit: 25,
  sortBy: 'timestamp',
  sortOrder: 'desc',
});

console.log(result.total, result.messages.size);
```

Search is capped at 25 results per request. The result contains a `messages` collection and a `total` count. In guild channels, you can also filter by `authors`, `mentions`, `channels`, `has`, `pinned`, and `nsfw`.

## Fetch a partial message

```ts
if (message.partial) {
  await message.fetch();
}
```

Fetching fills the missing fields. It makes a REST request, so handle rate limits and errors.

## Next

- [Interactions](interactions.md)
- [API: Message](../reference/structures/message.md)
- [API: MessageManager](../reference/managers/message-manager.md)
