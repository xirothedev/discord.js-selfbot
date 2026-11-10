# AutocompleteInteraction

Represents an autocomplete interaction.

```ts

class AutocompleteInteraction extends Interaction<Cached>

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

### `command`

The invoked application command, if it was fetched before

**Type:** `ApplicationCommand<object> | ApplicationCommand<{ guild: GuildResolvable }> | null` · **Modifiers:** readonly

### `commandId`

The invoked application command's id

**Type:** `string`

### `commandName`

The invoked application command's name

**Type:** `string`

### `createdAt`

The time the interaction was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the interaction was created at

**Type:** `number` · **Modifiers:** readonly

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

### `options`

The options passed to the command

**Type:** `Omit<CommandInteractionOptionResolver<Cached>, "getMessage">`

### `responded`

Whether this interaction has already received a response

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

## Methods

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

### `respond`

Sends results for the autocomplete of this interaction.

```ts

respond(options: ApplicationCommandOptionChoiceData[]): Promise<void>

```

- `options: ApplicationCommandOptionChoiceData[]` — The options for the autocomplete

**Returns:** `Promise<void>`

```ts
// respond to autocomplete interaction
interaction.respond([
 {
   name: 'Option 1',
   value: 'option1',
 },
])
 .then(console.log)
 .catch(console.error);
```

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/AutocompleteInteraction.ts#L15
