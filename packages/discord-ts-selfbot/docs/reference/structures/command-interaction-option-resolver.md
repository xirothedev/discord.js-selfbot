# CommandInteractionOptionResolver

A resolver for command interaction options.

```ts

class CommandInteractionOptionResolver

```

## Properties

### `client`

The client that instantiated this.

**Type:** `Client` · **Modifiers:** readonly

### `data`

The interaction options array.

**Type:** `readonly CommandInteractionOption<Cached>[]` · **Modifiers:** readonly

### `resolved`

The interaction resolved data

**Type:** `Readonly<CommandInteractionResolvedData<Cached>>` · **Modifiers:** readonly

## Methods

### `get`

```ts

get(name: string, required: true): CommandInteractionOption<Cached>

```

- `name: string`
- `required: true`

**Returns:** `CommandInteractionOption<Cached>`

```ts

get(name: string, required?: boolean): CommandInteractionOption<Cached> | null

```

- `name: string`
- `required?: boolean`

**Returns:** `CommandInteractionOption<Cached> | null`

### `getAttachment`

```ts

getAttachment(name: string, required: true): MessageAttachment

```

- `name: string`
- `required: true`

**Returns:** `MessageAttachment`

```ts

getAttachment(name: string, required?: boolean): MessageAttachment | null

```

- `name: string`
- `required?: boolean`

**Returns:** `MessageAttachment | null`

### `getBoolean`

```ts

getBoolean(name: string, required: true): boolean

```

- `name: string`
- `required: true`

**Returns:** `boolean`

```ts

getBoolean(name: string, required?: boolean): boolean | null

```

- `name: string`
- `required?: boolean`

**Returns:** `boolean | null`

### `getChannel`

```ts

getChannel(name: string, required: true): CacheTypeReducer<Cached, GuildBasedChannel, APIInteractionDataResolvedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel | null> & unknown

```

- `name: string`
- `required: true`

**Returns:** `CacheTypeReducer<Cached, GuildBasedChannel, APIInteractionDataResolvedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel | null> & unknown`

```ts

getChannel(name: string, required?: boolean): CacheTypeReducer<Cached, GuildBasedChannel, APIInteractionDataResolvedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel | null> & unknown | null

```

- `name: string`
- `required?: boolean`

**Returns:** `CacheTypeReducer<Cached, GuildBasedChannel, APIInteractionDataResolvedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel, APIInteractionDataResolvedChannel | GuildBasedChannel | null> & unknown | null`

### `getFocused`

```ts

getFocused(getFull: true): AutocompleteFocusedOption

```

- `getFull: true`

**Returns:** `AutocompleteFocusedOption`

```ts

getFocused(getFull?: boolean): string

```

- `getFull?: boolean`

**Returns:** `string`

### `getInteger`

```ts

getInteger(name: string, required: true): number

```

- `name: string`
- `required: true`

**Returns:** `number`

```ts

getInteger(name: string, required?: boolean): number | null

```

- `name: string`
- `required?: boolean`

**Returns:** `number | null`

### `getMember`

```ts

getMember(name: string, required: true): CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> & unknown

```

- `name: string`
- `required: true`

**Returns:** `CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> & unknown`

```ts

getMember(name: string, required?: boolean): CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> & unknown | null

```

- `name: string`
- `required?: boolean`

**Returns:** `CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> & unknown | null`

### `getMentionable`

```ts

getMentionable(name: string, required: true): NonNullable<User | CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> | CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> | undefined>

```

- `name: string`
- `required: true`

**Returns:** `NonNullable<User | CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> | CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> | undefined>`

```ts

getMentionable(name: string, required?: boolean): NonNullable<User | CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> | CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> | undefined> | null

```

- `name: string`
- `required?: boolean`

**Returns:** `NonNullable<User | CacheTypeReducer<Cached, GuildMember, APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember, GuildMember | APIInteractionDataResolvedGuildMember | null> | CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> | undefined> | null`

### `getMessage`

```ts

getMessage(name: string, required: true): CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>> & unknown

```

- `name: string`
- `required: true`

**Returns:** `CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>> & unknown`

```ts

getMessage(name: string, required?: boolean): CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>> & unknown | null

```

- `name: string`
- `required?: boolean`

**Returns:** `CacheTypeReducer<Cached, Message<true>, APIMessage, APIMessage | Message<boolean>, APIMessage | Message<boolean>> & unknown | null`

### `getNumber`

```ts

getNumber(name: string, required: true): number

```

- `name: string`
- `required: true`

**Returns:** `number`

```ts

getNumber(name: string, required?: boolean): number | null

```

- `name: string`
- `required?: boolean`

**Returns:** `number | null`

### `getRole`

```ts

getRole(name: string, required: true): CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> & unknown

```

- `name: string`
- `required: true`

**Returns:** `CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> & unknown`

```ts

getRole(name: string, required?: boolean): CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> & unknown | null

```

- `name: string`
- `required?: boolean`

**Returns:** `CacheTypeReducer<Cached, Role, APIRole, Role | APIRole, Role | APIRole | null> & unknown | null`

### `getString`

```ts

getString(name: string, required: true): string

```

- `name: string`
- `required: true`

**Returns:** `string`

```ts

getString(name: string, required?: boolean): string | null

```

- `name: string`
- `required?: boolean`

**Returns:** `string | null`

### `getSubcommand`

```ts

getSubcommand(required?: true): string

```

- `required?: true`

**Returns:** `string`

```ts

getSubcommand(required: boolean): string | null

```

- `required: boolean`

**Returns:** `string | null`

### `getSubcommandGroup`

```ts

getSubcommandGroup(required?: true): string

```

- `required?: true`

**Returns:** `string`

```ts

getSubcommandGroup(required: boolean): string | null

```

- `required: boolean`

**Returns:** `string | null`

### `getUser`

```ts

getUser(name: string, required: true): User

```

- `name: string`
- `required: true`

**Returns:** `User`

```ts

getUser(name: string, required?: boolean): User | null

```

- `name: string`
- `required?: boolean`

**Returns:** `User | null`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/CommandInteractionOptionResolver.ts#L13
