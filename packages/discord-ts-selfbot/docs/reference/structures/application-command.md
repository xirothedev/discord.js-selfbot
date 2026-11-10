# ApplicationCommand

Represents an application command.

```ts

class ApplicationCommand extends Base

```

## Properties

### `applicationId`

The parent application's id

**Type:** `string`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the command was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the command was created at

**Type:** `number` · **Modifiers:** readonly

### `defaultMemberPermissions`

The default bitfield used to determine whether this command be used in a guild

**Type:** `Readonly<Permissions> | null`

### `defaultPermission`

Whether the command is enabled by default when the app is added to a guild

**Type:** `boolean`

### `description`

The description of this command

**Type:** `string`

### `descriptionLocalizations`

The description localizations for this command

**Type:** `Partial<Record<Locale, string | null>> | null`

### `descriptionLocalized`

The localized description for this command

**Type:** `string | null`

### `dmPermission`

Whether the command can be used in DMs
This property is always `null` on guild commands

**Type:** `boolean | null`

### `guild`

The guild this command is part of

**Type:** `Guild | null`

### `guildId`

The guild's id this command is part of, this may be non-null when `guild` is `null` if the command
was fetched from the `ApplicationCommandManager`

**Type:** `string | null`

### `id`

The command's id

**Type:** `string`

### `manager`

The manager that this command belongs to

**Type:** `ApplicationCommandManager` · **Modifiers:** readonly

### `name`

The name of this command

**Type:** `string`

### `nameLocalizations`

The name localizations for this command

**Type:** `Partial<Record<Locale, string | null>> | null`

### `nameLocalized`

The localized name for this command

**Type:** `string | null`

### `options`

The options of this command

**Type:** `(ApplicationCommandOption & { descriptionLocalized?: string; nameLocalized?: string })[]`

### `permissions`

The manager for permissions of this command on its guild or arbitrary guilds when the command is global

**Type:** `ApplicationCommandPermissionsManager<PermissionsFetchType, PermissionsFetchType, PermissionsFetchType, Guild | null, string>`

### `type`

The type of this application command

**Type:** `"USER" | "CHAT_INPUT" | "MESSAGE"`

### `version`

Autoincrementing version identifier updated during substantial record changes

**Type:** `string`

## Methods

### `delete`

Deletes this command.

```ts

delete(): Promise<ApplicationCommand<PermissionsFetchType>>

```

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

```ts
// Delete this command
command.delete()
  .then(console.log)
  .catch(console.error);
```

### `edit`

Edits this application command.

```ts

edit(data: Partial<ApplicationCommandData>): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `data: Partial<ApplicationCommandData>` — The data to update the command with

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

```ts
// Edit the description of this command
command.edit({
  description: 'New description',
})
  .then(console.log)
  .catch(console.error);
```

### `equals`

Whether this command equals another command. It compares all properties, so for most operations
it is advisable to just compare `command.id === command2.id` as it is much faster and is often
what most users need.

```ts

equals(command: ApplicationCommandData | APIApplicationCommand | ApplicationCommand<object>, enforceOptionorder?: boolean): boolean

```

- `command: ApplicationCommandData | APIApplicationCommand | ApplicationCommand<object>` — The command to compare with
- `enforceOptionorder?: boolean`

**Returns:** `boolean`

### `optionsEqual`

Recursively checks that all options for an ApplicationCommand are equal to the provided options.
In most cases it is better to compare using ApplicationCommand#equals

```ts

static optionsEqual(existing: ApplicationCommandOption[], options: ApplicationCommandOption[] | ApplicationCommandOptionData[] | APIApplicationCommandOption[], enforceOptionorder?: boolean): boolean

```

- `existing: ApplicationCommandOption[]` — The options on the existing command, should be ApplicationCommand#options
- `options: ApplicationCommandOption[] | ApplicationCommandOptionData[] | APIApplicationCommandOption[]` — The options to compare against
- `enforceOptionorder?: boolean`

**Returns:** `boolean`

### `setDefaultMemberPermissions`

Edits the default member permissions of this ApplicationCommand

```ts

setDefaultMemberPermissions(defaultMemberPermissions: PermissionResolvable | null): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `defaultMemberPermissions: PermissionResolvable | null` — The default member permissions required to run this command

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

### `setDefaultPermission`

Edits the default permission of this ApplicationCommand

> **Deprecated.** Use setDefaultMemberPermissions and setDMPermission instead.

```ts

setDefaultPermission(defaultPermission?: boolean): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `defaultPermission?: boolean` — The default permission for this command

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

### `setDescription`

Edits the description of this ApplicationCommand

```ts

setDescription(description: string): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `description: string` — The new description of the command

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

### `setDescriptionLocalizations`

Edits the localized descriptions of this ApplicationCommand

```ts

setDescriptionLocalizations(descriptionLocalizations: LocalizationMap): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `descriptionLocalizations: LocalizationMap` — The new localized descriptions for the command

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

```ts
// Edit the description localizations of this command
command.setLocalizedDescriptions({
  'en-GB': 'A test command',
  'pt-BR': 'Um comando de teste',
})
  .then(console.log)
  .catch(console.error)
```

### `setDMPermission`

Edits the DM permission of this ApplicationCommand

```ts

setDMPermission(dmPermission?: boolean): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `dmPermission?: boolean` — Whether the command can be used in DMs

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

### `setName`

Edits the name of this ApplicationCommand

```ts

setName(name: string): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `name: string` — The new name of the command

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

### `setNameLocalizations`

Edits the localized names of this ApplicationCommand

```ts

setNameLocalizations(nameLocalizations: LocalizationMap): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `nameLocalizations: LocalizationMap` — The new localized names for the command

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

```ts
// Edit the name localizations of this command
command.setLocalizedNames({
  'en-GB': 'test',
  'pt-BR': 'teste',
})
  .then(console.log)
  .catch(console.error)
```

### `setOptions`

Edits the options of this ApplicationCommand

```ts

setOptions(options: ApplicationCommandOptionData[]): Promise<ApplicationCommand<PermissionsFetchType>>

```

- `options: ApplicationCommandOptionData[]` — The options to set for this command

**Returns:** `Promise<ApplicationCommand<PermissionsFetchType>>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ApplicationCommand.ts#L15
