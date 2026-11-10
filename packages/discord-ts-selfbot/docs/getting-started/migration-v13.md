# Migrating from v13

This fork started as `discord.js-selfbot-v13`. The new package is `discord-ts-selfbot@14`, with a discord.js v14-compatible surface and a Bun-only runtime.

## 1. Rename the package

```diff
- "discord.js-selfbot-v13": "^3.7.0"
+ "discord-ts-selfbot": "^14.0.0"
```

```diff
- const { Client } = require('discord.js-selfbot-v13');
+ import { Client } from 'discord-ts-selfbot';
```

The old package remains on npm under its original owner. It is not replaced by this package.

## 2. Switch the runtime to Bun

`discord-ts-selfbot` declares `engines.bun >= 1.4.4` and uses Bun for install, tests, type checking, formatting, and build. Node.js is not supported.

```diff
- npm install discord.js-selfbot-v13
+ bun add discord-ts-selfbot
```

If your project still uses `require`, the package source still uses CommonJS internally, but new code should use `import`.

## 3. Update builders

The v14 builder names are the preferred API. The v13 names still exist, but they are deprecated aliases.

| v13 | v14 |
| --- | --- |
| `MessageActionRow` | `ActionRowBuilder` |
| `MessageButton` | `ButtonBuilder` |
| `MessageEmbed` | `EmbedBuilder` |
| `MessageAttachment` | `AttachmentBuilder` |
| `Modal` | `ModalBuilder` |
| `MessageSelectMenu` | `StringSelectMenuBuilder` |
| `MessageSelectMenuOption` | `StringSelectMenuOptionBuilder` |

```diff
- const row = new MessageActionRow().addComponents(
-   new MessageButton().setCustomId('ping').setLabel('Ping').setStyle('PRIMARY'),
+ const row = new ActionRowBuilder().addComponents(
+   new ButtonBuilder().setCustomId('ping').setLabel('Ping').setStyle(ButtonStyle.Primary),
 );
```

The deprecated shorthands `ActionRow`, `Button`, `SelectMenu`, `Embed`, `Attachment`, and `TextInput` are also exported. Prefer the `*Builder` names in new code.

## 4. Events and status

The `Events` object is still the source of event names. v14 adds `Events.ClientReady` as an alias of the legacy `Events.CLIENT_READY`.

```diff
- client.once('ready', () => {});
+ client.once(Events.CLIENT_READY, () => {});
```

```ts
import { Events, Status } from 'discord-ts-selfbot';

client.once(Events.CLIENT_READY, (readyClient) => {
  console.log(Status[readyClient.ws.status]);
});
```

## 5. Partials

The runtime `Partials` enum is numeric. The public `ClientOptions.partials` type uses the v14 string union. The events example casts the array until the two representations agree:

```ts
import { Partials } from 'discord-ts-selfbot';
import type { PartialTypes } from 'discord-ts-selfbot';

const partials = [Partials.Channel, Partials.Message, Partials.Reaction] as unknown as PartialTypes[];
const client = new Client({ partials });
```

## 6. New client and message methods

The v14 surface adds:

- `Client#generateInvite`
- `Client#fetchStickerPacks`
- `Client#deleteWebhook`
- `Message#awaitMessageComponent`
- `Message#createMessageComponentCollector`
- `Message#interactionMetadata`
- `Message#resolved`
- `Message#roleSubscriptionData`
- `Message#sharedClientTheme`

Collectors use the `INTERACTION_CREATE` gateway event. The handler is wired in this fork, so `awaitMessageComponent` works without a manual gateway patch.

## 7. Selfbot-only features

These have no discord.js v14 equivalent and keep selfbot-specific names:

- Account edits: `setBanner`, `setHypeSquad`, `setAccentColor`, `setAboutMe`, `setPronouns`, `setGlobalName`, `setSamsungActivity`, `fetchBurstCredit`.
- Messages: `markRead`, `markUnread`, `suppressEmbeds`, `removeAttachments`, `report`.
- Guilds: `topEmojis`, `setVanityCode`, `setCommunity`, `settings.edit`.
- Search: `MessageManager#search`, `GuildMemberManager#search`.
- Voice, DM/group calls, and recording.

## 8. Risky mutations remain stubbed

`RelationshipManager#addFriend`, `#deleteRelationship`, `#sendFriendRequest`, and `#addBlocked` are exported but reject without making a request. They are marked `@deprecated` and `@experimental`. See [Safety](https://xirothedev.github.io/discord.js-selfbot/docs/project/safety).

## 9. Known differences

- **Bun only.** Node.js consumers are out of scope.
- **Voice codecs.** The payload boundary is tested; full media-codec coverage is future work.
- **v14 star exports.** `discord.js@14` star-exports `discord-api-types`, `@discordjs/builders`, `@discordjs/formatters`, `@discordjs/rest`, `@discordjs/util`, and `@discordjs/ws`. This fork exports the builder classes it supports, but not every star-exported name.
- **Parity report.** The [v14 parity report](https://xirothedev.github.io/discord.js-selfbot/docs/project/v14-parity) records the audit that drove the work and the current shipped surface.

## Next

- [Client and events](../guides/client-events.md)
- [API reference](../reference/index.md)
- [Safety](https://xirothedev.github.io/discord.js-selfbot/docs/project/safety)
