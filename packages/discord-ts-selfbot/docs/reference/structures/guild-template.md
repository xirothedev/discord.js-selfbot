# GuildTemplate

Represents the template for a guild.

```ts

class GuildTemplate extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `code`

The unique code of this template

**Type:** `string`

### `createdAt`

The time when this template was created at

**Type:** `Date`

### `createdTimestamp`

The timestamp of when this template was created at

**Type:** `number` · **Modifiers:** readonly

### `creator`

The user that created this template

**Type:** `User`

### `creatorId`

The id of the user that created this template

**Type:** `string`

### `description`

The description of this template

**Type:** `string | null`

### `guild`

The guild that this template belongs to

**Type:** `Guild | null`

### `GUILD_TEMPLATES_PATTERN`

Regular expression that globally matches guild template links

**Type:** `RegExp` · **Modifiers:** static

### `guildId`

The id of the guild that this template belongs to

**Type:** `string`

### `name`

The name of this template

**Type:** `string`

### `serializedGuild`

The data of the guild that this template would create

**Type:** `APITemplateSerializedSourceGuild`

### `unSynced`

Whether this template has unsynced changes

**Type:** `boolean | null`

### `updatedAt`

The time when this template was last synced to the guild

**Type:** `Date`

### `updatedTimestamp`

The timestamp of when this template was last synced to the guild

**Type:** `number` · **Modifiers:** readonly

### `url`

The URL of this template

**Type:** `string` · **Modifiers:** readonly

### `usageCount`

The amount of times this template has been used

**Type:** `number`

## Methods

### `createGuild`

Creates a guild based on this template.
This is only available to bots in fewer than 10 guilds.

```ts

createGuild(name: string, icon?: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>): Promise<Guild>

```

- `name: string` — The name of the guild
- `icon?: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>` — The icon for the guild

**Returns:** `Promise<Guild>`

### `delete`

Deletes this template.

```ts

delete(): Promise<GuildTemplate>

```

**Returns:** `Promise<GuildTemplate>`

### `edit`

Updates the metadata of this template.

```ts

edit(options?: EditGuildTemplateOptions): Promise<GuildTemplate>

```

- `options?: EditGuildTemplateOptions` — Options for editing the template

**Returns:** `Promise<GuildTemplate>`

### `sync`

Syncs this template to the current state of the guild.

```ts

sync(): Promise<GuildTemplate>

```

**Returns:** `Promise<GuildTemplate>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildTemplate.ts#L14
