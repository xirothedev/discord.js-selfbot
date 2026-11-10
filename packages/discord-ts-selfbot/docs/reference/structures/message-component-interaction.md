# MessageComponentInteraction

Represents a message component interaction.

```ts

class MessageComponentInteraction extends Interaction<Cached>

```

## Properties

### `applicationId`

The application's id

**Type:** `string`

### `appPermissions`

Set of permissions the application or bot has within the channel the interaction was sent from

**Type:** `Readonly<Permissions> | null`

### `channel`

The channel this interaction was sent in

**Type:** `CacheTypeReducer<Cached, GuildTextBasedChannel | null, GuildTextBasedChannel | null, GuildTextBasedChannel | null, TextBasedChannel | null>` · **Modifiers:** readonly

### `channelId`

The id of the channel this interaction was sent in

**Type:** `string`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `component`

The component which was interacted with

**Type:** `CacheTypeReducer<Cached, MessageActionRowComponent, APIButtonComponent | APIContainerComponent | APIFileComponent | APIMediaGalleryComponent | APISectionComponent | APISeparatorComponent | APITextDisplayComponent | APISelectMenuComponent | APIThumbnailComponent, MessageActionRowComponent | APIButtonComponent | APIContainerComponent | APIFileComponent | APIMediaGalleryComponent | APISectionComponent | APISeparatorComponent | APITextDisplayComponent | APISelectMenuComponent | APIThumbnailComponent, MessageActionRowComponent | APIButtonComponent | APIContainerComponent | APIFileComponent | APIMediaGalleryComponent | APISectionComponent | APISeparatorComponent | APITextDisplayComponent | APISelectMenuComponent | APIThumbnailComponent>` · **Modifiers:** readonly

### `componentType`

**Type:** `"BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER"`

### `createdAt`

The time the interaction was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the interaction was created at

**Type:** `number` · **Modifiers:** readonly

### `customId`

The custom id of the component which was interacted with

**Type:** `string`

### `deferred`

Whether the reply to this interaction has been deferred

**Type:** `boolean`

### `ephemeral`

Whether the reply to this interaction is ephemeral

**Type:** `boolean | null`

### `guild`

The guild this interaction was sent in

**Type:** `CacheTypeReducer<Cached, Guild, null>` · **Modifiers:** readonly

### `guildId`

The id of the guild this interaction was sent in

**Type:** `CacheTypeReducer<Cached, string>`

### `guildLocale`

The preferred locale from the guild this interaction was sent in

**Type:** `CacheTypeReducer<Cached, string, string, string>`

### `id`

The interaction's id

**Type:** `string`

### `locale`

The locale of the user who invoked this interaction

**Type:** `string`

### `member`

If this interaction was sent in a guild, the member which sent it

**Type:** `CacheTypeReducer<Cached, GuildMember, APIInteractionGuildMember>`

### `memberPermissions`

The permissions of the member, if one exists, in the channel this interaction was executed in

**Type:** `CacheTypeReducer<Cached, Readonly<Permissions>>`

### `message`

The message to which the component was attached

**Type:** `CacheTypeReducer<Cached>`

### `replied`

Whether this interaction has already been replied to

**Type:** `boolean`

### `type`

The interaction's type

**Type:** `"PING" | "APPLICATION_COMMAND" | "MESSAGE_COMPONENT" | "APPLICATION_COMMAND_AUTOCOMPLETE" | "MODAL_SUBMIT"`

### `user`

The user which sent this interaction

**Type:** `User`

### `version`

The version

**Type:** `number`

### `webhook`

An associated interaction webhook, can be used to further interact with this interaction

**Type:** `InteractionWebhook`

## Methods

### `awaitModalSubmit`

Collects a single modal submit interaction that passes the filter.
The Promise will reject if the time expires.

```ts

awaitModalSubmit(options: AwaitModalSubmitOptions<ModalSubmitInteraction<CacheType>>): Promise<ModalSubmitInteraction<Cached>>

```

- `options: AwaitModalSubmitOptions<ModalSubmitInteraction<CacheType>>` — Options to pass to the internal collector

**Returns:** `Promise<ModalSubmitInteraction<Cached>>`

```ts
// Collect a modal submit interaction
const filter = (interaction) => interaction.customId === 'modal';
interaction.awaitModalSubmit({ filter, time: 15_000 })
  .then(interaction => console.log(`${interaction.customId} was submitted!`))
  .catch(console.error);
```

### `deferReply`

Defers the reply to this interaction.

```ts

deferReply(options: InteractionDeferReplyOptions & { fetchReply: true }): Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>

```

- `options: InteractionDeferReplyOptions & { fetchReply: true }` — Options for deferring the reply to this interaction

**Returns:** `Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>`

```ts
// Defer the reply to this interaction
interaction.deferReply()
  .then(console.log)
  .catch(console.error)
```

```ts
// Defer to send an ephemeral reply later
interaction.deferReply({ ephemeral: true })
  .then(console.log)
  .catch(console.error);
```

Defers the reply to this interaction.

```ts

deferReply(options?: InteractionDeferReplyOptions): Promise<void>

```

- `options?: InteractionDeferReplyOptions` — Options for deferring the reply to this interaction

**Returns:** `Promise<void>`

```ts
// Defer the reply to this interaction
interaction.deferReply()
  .then(console.log)
  .catch(console.error)
```

```ts
// Defer to send an ephemeral reply later
interaction.deferReply({ ephemeral: true })
  .then(console.log)
  .catch(console.error);
```

### `deferUpdate`

Defers an update to the message to which the component was attached.

```ts

deferUpdate(options: InteractionDeferUpdateOptions & { fetchReply: true }): Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>

```

- `options: InteractionDeferUpdateOptions & { fetchReply: true }` — Options for deferring the update to this interaction

**Returns:** `Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>`

```ts
// Defer updating and reset the component's loading state
interaction.deferUpdate()
  .then(console.log)
  .catch(console.error);
```

Defers an update to the message to which the component was attached.

```ts

deferUpdate(options?: InteractionDeferUpdateOptions): Promise<void>

```

- `options?: InteractionDeferUpdateOptions` — Options for deferring the update to this interaction

**Returns:** `Promise<void>`

```ts
// Defer updating and reset the component's loading state
interaction.deferUpdate()
  .then(console.log)
  .catch(console.error);
```

### `deleteReply`

Deletes a reply to this interaction.

```ts

deleteReply(message?: MessageResolvable): Promise<void>

```

- `message?: MessageResolvable` — The response to delete

**Returns:** `Promise<void>`

```ts
// Delete the initial reply to this interaction
interaction.deleteReply()
  .then(console.log)
  .catch(console.error);
```

### `editReply`

Edits a reply to this interaction.

```ts

editReply(options: string | MessagePayload | InteractionEditReplyOptions): Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>

```

- `options: string | MessagePayload | InteractionEditReplyOptions` — The new options for the message

**Returns:** `Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>`

```ts
// Edit the initial reply to this interaction
interaction.editReply('New content')
  .then(console.log)
  .catch(console.error);
```

### `fetchReply`

Fetches a reply to this interaction.

```ts

fetchReply(message?: MessageResolvable): Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>

```

- `message?: MessageResolvable` — The response to fetch

**Returns:** `Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>`

```ts
// Fetch the initial reply to this interaction
interaction.fetchReply()
  .then(reply => console.log(`Replied with ${reply.content}`))
  .catch(console.error);
```

### `followUp`

Send a follow-up message to this interaction.

```ts

followUp(options: string | InteractionReplyOptions | MessagePayload): Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>

```

- `options: string | InteractionReplyOptions | MessagePayload` — The options for the reply

**Returns:** `Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>`

### `inCachedGuild`

Indicates whether or not this interaction is both cached and received from a guild.

```ts

inCachedGuild(): this

```

**Returns:** `this`

### `inGuild`

Indicates whether this interaction is received from a guild.

```ts

inGuild(): this

```

**Returns:** `this`

### `inRawGuild`

Indicates whether or not this interaction is received from an uncached guild.

```ts

inRawGuild(): this

```

**Returns:** `this`

### `isApplicationCommand`

Indicates whether this interaction is a BaseCommandInteraction.

```ts

isApplicationCommand(): this

```

**Returns:** `this`

### `isAutocomplete`

Indicates whether this interaction is an AutocompleteInteraction

```ts

isAutocomplete(): this

```

**Returns:** `this`

### `isButton`

Indicates whether this interaction is a ButtonInteraction.

```ts

isButton(): this

```

**Returns:** `this`

### `isCommand`

Indicates whether this interaction is a CommandInteraction.

```ts

isCommand(): this

```

**Returns:** `this`

### `isContextMenu`

Indicates whether this interaction is a ContextMenuInteraction

```ts

isContextMenu(): this

```

**Returns:** `this`

### `isMessageComponent`

Indicates whether this interaction is a MessageComponentInteraction.

```ts

isMessageComponent(): this

```

**Returns:** `this`

### `isMessageContextMenu`

Indicates whether this interaction is a MessageContextMenuInteraction

```ts

isMessageContextMenu(): this

```

**Returns:** `this`

### `isModalSubmit`

Indicates whether this interaction is a ModalSubmitInteraction

```ts

isModalSubmit(): this

```

**Returns:** `this`

### `isRepliable`

Indicates whether this interaction can be replied to.

```ts

isRepliable(): this

```

**Returns:** `this`

### `isSelectMenu`

Indicates whether this interaction is a SelectMenuInteraction.

```ts

isSelectMenu(): this

```

**Returns:** `this`

### `isUserContextMenu`

Indicates whether this interaction is a UserContextMenuInteraction

```ts

isUserContextMenu(): this

```

**Returns:** `this`

### `reply`

Creates a reply to this interaction.
Use the `fetchReply` option to get the bot's reply message.

```ts

reply(options: InteractionReplyOptions & { fetchReply: true }): Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>

```

- `options: InteractionReplyOptions & { fetchReply: true }` — The options for the reply

**Returns:** `Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>`

```ts
// Reply to the interaction and fetch the response
interaction.reply({ content: 'Pong!', fetchReply: true })
  .then((message) => console.log(`Reply sent with content ${message.content}`))
  .catch(console.error);
```

```ts
// Create an ephemeral reply with an embed
const embed = new MessageEmbed().setDescription('Pong!');

interaction.reply({ embeds: [embed], ephemeral: true })
  .then(() => console.log('Reply sent.'))
  .catch(console.error);
```

Creates a reply to this interaction.
Use the `fetchReply` option to get the bot's reply message.

```ts

reply(options: string | InteractionReplyOptions | MessagePayload): Promise<void>

```

- `options: string | InteractionReplyOptions | MessagePayload` — The options for the reply

**Returns:** `Promise<void>`

```ts
// Reply to the interaction and fetch the response
interaction.reply({ content: 'Pong!', fetchReply: true })
  .then((message) => console.log(`Reply sent with content ${message.content}`))
  .catch(console.error);
```

```ts
// Create an ephemeral reply with an embed
const embed = new MessageEmbed().setDescription('Pong!');

interaction.reply({ embeds: [embed], ephemeral: true })
  .then(() => console.log('Reply sent.'))
  .catch(console.error);
```

### `resolveType`

```ts

static resolveType(type: MessageComponentTypeResolvable): "ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER"

```

- `type: MessageComponentTypeResolvable`

**Returns:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER"`

### `showModal`

Shows a modal component

```ts

showModal(modal: Modal | ModalOptions): Promise<void>

```

- `modal: Modal | ModalOptions` — The modal to show

**Returns:** `Promise<void>`

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `update`

Updates the original message of the component on which the interaction was received on.

```ts

update(options: InteractionUpdateOptions & { fetchReply: true }): Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>

```

- `options: InteractionUpdateOptions & { fetchReply: true }` — The options for the updated message

**Returns:** `Promise<CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>>>`

```ts
// Remove the components from the message
interaction.update({
  content: "A component interaction was received",
  components: []
})
  .then(console.log)
  .catch(console.error);
```

Updates the original message of the component on which the interaction was received on.

```ts

update(options: string | MessagePayload | InteractionUpdateOptions): Promise<void>

```

- `options: string | MessagePayload | InteractionUpdateOptions` — The options for the updated message

**Returns:** `Promise<void>`

```ts
// Remove the components from the message
interaction.update({
  content: "A component interaction was received",
  components: []
})
  .then(console.log)
  .catch(console.error);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageComponentInteraction.ts#L18
