# StageInstanceManager

Manages API methods for StageInstance objects and holds their cache.

```ts

class StageInstanceManager extends CachedManager<Snowflake, StageInstance, StageInstanceResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, StageInstance>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<StageInstance>` · **Modifiers:** readonly

## Methods

### `create`

Creates a new stage instance.

```ts

create(channel: StageChannelResolvable, options: StageInstanceCreateOptions): Promise<StageInstance>

```

- `channel: StageChannelResolvable` — The stage channel to associate the created stage instance to
- `options: StageInstanceCreateOptions` — The options to create the stage instance

**Returns:** `Promise<StageInstance>`

```ts
// Create a stage instance
guild.stageInstances.create('1234567890123456789', {
 topic: 'A very creative topic',
 privacyLevel: 'GUILD_ONLY'
})
 .then(stageInstance => console.log(stageInstance))
 .catch(console.error);
```

### `delete`

Deletes an existing stage instance.

```ts

delete(channel: StageChannelResolvable): Promise<void>

```

- `channel: StageChannelResolvable` — The stage channel whose associated stage instance is to be deleted

**Returns:** `Promise<void>`

### `edit`

Edits an existing stage instance.

```ts

edit(channel: StageChannelResolvable, options: StageInstanceEditOptions): Promise<StageInstance>

```

- `channel: StageChannelResolvable` — The stage channel whose associated stage instance is to be edited
- `options: StageInstanceEditOptions` — The options to edit the stage instance

**Returns:** `Promise<StageInstance>`

```ts
// Edit a stage instance
guild.stageInstances.edit('1234567890123456789', { topic: 'new topic' })
 .then(stageInstance => console.log(stageInstance))
 .catch(console.error);
```

### `fetch`

Fetches the stage instance associated with a stage channel, if it exists.

```ts

fetch(channel: StageChannelResolvable, options?: BaseFetchOptions): Promise<StageInstance>

```

- `channel: StageChannelResolvable` — The stage channel whose associated stage instance is to be fetched
- `options?: BaseFetchOptions` — Additional options for this fetch

**Returns:** `Promise<StageInstance>`

```ts
// Fetch a stage instance
guild.stageInstances.fetch('1234567890123456789')
 .then(stageInstance => console.log(stageInstance))
 .catch(console.error);
```

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: StageInstance): StageInstance

```

- `resolvable: StageInstance`

**Returns:** `StageInstance`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: StageInstanceResolvable): StageInstance | null

```

- `resolvable: StageInstanceResolvable`

**Returns:** `StageInstance | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | StageInstance): string

```

- `resolvable: string | StageInstance`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: StageInstanceResolvable): string | null

```

- `resolvable: StageInstanceResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, StageInstance>

```

**Returns:** `Collection<string, StageInstance>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/StageInstanceManager.ts#L16
