# ApplicationCommandManager

Manages API methods for application commands and stores their cache.

```ts

class ApplicationCommandManager extends CachedManager<Snowflake, ApplicationCommandScope, ApplicationCommandResolvable>

```

## Properties

### `cache`

The cache of this manager

**Type:** `Collection<string, ApplicationCommandScope>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<ApplicationCommandScope>` · **Modifiers:** readonly

### `permissions`

The manager for permissions of arbitrary commands on arbitrary guilds

**Type:** `ApplicationCommandPermissionsManager<{ command?: ApplicationCommandResolvable } & PermissionsOptionsExtras, { command: ApplicationCommandResolvable } & PermissionsOptionsExtras, PermissionsOptionsExtras, PermissionsGuildType, null>`

## Methods

### `create`

Creates an application command.

```ts

create(command: ApplicationCommandDataResolvable, guildId?: string): Promise<ApplicationCommandScope>

```

- `command: ApplicationCommandDataResolvable` — The command
- `guildId?: string` — The guild's id to create this command in, ignored when using a GuildApplicationCommandManager

**Returns:** `Promise<ApplicationCommandScope>`

```ts
// Create a new command
client.application!.commands.create({
  name: 'test',
  description: 'A test command',
})
  .then(console.log)
  .catch(console.error);
```

### `delete`

Deletes an application command.

```ts

delete(command: ApplicationCommandResolvable, guildId?: string): Promise<ApplicationCommandScope | null>

```

- `command: ApplicationCommandResolvable` — The command to delete
- `guildId?: string` — The guild's id where the command is registered, ignored when using a GuildApplicationCommandManager

**Returns:** `Promise<ApplicationCommandScope | null>`

```ts
// Delete a command
guild.commands.delete('123456789012345678')
  .then(console.log)
  .catch(console.error);
```

### `edit`

Edits an application command.

```ts

edit(command: ApplicationCommandResolvable, data: Partial<ApplicationCommandDataResolvable>): Promise<ApplicationCommandScope>

```

- `command: ApplicationCommandResolvable` — The command to edit
- `data: Partial<ApplicationCommandDataResolvable>` — The data to update the command with

**Returns:** `Promise<ApplicationCommandScope>`

```ts
// Edit an existing command
client.application!.commands.edit('123456789012345678', {
  description: 'New description',
})
  .then(console.log)
  .catch(console.error);
```

Edits an application command.

```ts

edit(command: ApplicationCommandResolvable, data: Partial<ApplicationCommandDataResolvable>, guildId: string): Promise<ApplicationCommand<object>>

```

- `command: ApplicationCommandResolvable` — The command to edit
- `data: Partial<ApplicationCommandDataResolvable>` — The data to update the command with
- `guildId: string` — The guild's id where the command registered, ignored when using a GuildApplicationCommandManager

**Returns:** `Promise<ApplicationCommand<object>>`

```ts
// Edit an existing command
client.application!.commands.edit('123456789012345678', {
  description: 'New description',
})
  .then(console.log)
  .catch(console.error);
```

### `fetch`

```ts

fetch(id: string, options: FetchApplicationCommandOptions & { guildId: string }): Promise<ApplicationCommand<object>>

```

- `id: string`
- `options: FetchApplicationCommandOptions & { guildId: string }`

**Returns:** `Promise<ApplicationCommand<object>>`

```ts

fetch(options: FetchApplicationCommandOptions): Promise<Collection<string, ApplicationCommandScope>>

```

- `options: FetchApplicationCommandOptions`

**Returns:** `Promise<Collection<string, ApplicationCommandScope>>`

```ts

fetch(id: string, options?: FetchApplicationCommandOptions): Promise<ApplicationCommandScope>

```

- `id: string`
- `options?: FetchApplicationCommandOptions`

**Returns:** `Promise<ApplicationCommandScope>`

```ts

fetch(id?: string, options?: FetchApplicationCommandOptions): Promise<Collection<string, ApplicationCommandScope>>

```

- `id?: string`
- `options?: FetchApplicationCommandOptions`

**Returns:** `Promise<Collection<string, ApplicationCommandScope>>`

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: ApplicationCommandScope): ApplicationCommandScope

```

- `resolvable: ApplicationCommandScope`

**Returns:** `ApplicationCommandScope`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: ApplicationCommandResolvable): ApplicationCommandScope | null

```

- `resolvable: ApplicationCommandResolvable`

**Returns:** `ApplicationCommandScope | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | ApplicationCommandScope): string

```

- `resolvable: string | ApplicationCommandScope`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: ApplicationCommandResolvable): string | null

```

- `resolvable: ApplicationCommandResolvable`

**Returns:** `string | null`

### `set`

Sets all the commands for this application or guild.

```ts

set(commands: ApplicationCommandDataResolvable[]): Promise<Collection<string, ApplicationCommandScope>>

```

- `commands: ApplicationCommandDataResolvable[]` — The commands

**Returns:** `Promise<Collection<string, ApplicationCommandScope>>`

```ts
// Set all commands to just this one
client.application!.commands.set([
  {
    name: 'test',
    description: 'A test command',
  },
])
  .then(console.log)
  .catch(console.error);
```

```ts
// Remove all commands
guild.commands.set([])
  .then(console.log)
  .catch(console.error);
```

Sets all the commands for this application or guild.

```ts

set(commands: ApplicationCommandDataResolvable[], guildId: string): Promise<Collection<string, ApplicationCommand<object>>>

```

- `commands: ApplicationCommandDataResolvable[]` — The commands
- `guildId: string` — The guild's id to create the commands in, ignored when using a GuildApplicationCommandManager

**Returns:** `Promise<Collection<string, ApplicationCommand<object>>>`

```ts
// Set all commands to just this one
client.application!.commands.set([
  {
    name: 'test',
    description: 'A test command',
  },
])
  .then(console.log)
  .catch(console.error);
```

```ts
// Remove all commands
guild.commands.set([])
  .then(console.log)
  .catch(console.error);
```

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, ApplicationCommandScope>

```

**Returns:** `Collection<string, ApplicationCommandScope>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/ApplicationCommandManager.ts#L21
