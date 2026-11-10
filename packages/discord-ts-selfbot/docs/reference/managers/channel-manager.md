# ChannelManager

A manager of channels belonging to a client

```ts

class ChannelManager extends CachedManager<Snowflake, AnyChannel, ChannelResolvable>

```

## Properties

### `cache`

The cache of Channels

**Type:** `Collection<string, AnyChannel>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<AnyChannel>` · **Modifiers:** readonly

## Methods

### `createGroupDM`

Create Group DM

```ts

createGroupDM(recipients?: UserResolvable[]): Promise<GroupDMChannel>

```

- `recipients?: UserResolvable[]` — Array of recipients

**Returns:** `Promise<GroupDMChannel>`

```ts
client.channels.createGroupDM();
```

### `fetch`

Obtains a channel from Discord, or the channel cache if it's already available.

```ts

fetch(id: string, options?: FetchChannelOptions): Promise<AnyChannel | null>

```

- `id: string` — The channel's id
- `options?: FetchChannelOptions` — Additional options for this fetch

**Returns:** `Promise<AnyChannel | null>`

```ts
// Fetch a channel by its id
client.channels.fetch('222109930545610754')
  .then(channel => console.log(channel.name))
  .catch(console.error);
```

### `resolve`

Resolves a ChannelResolvable to a Channel object.

```ts

resolve(resolvable: AnyChannel): AnyChannel

```

- `resolvable: AnyChannel`

**Returns:** `AnyChannel`

Resolves a ChannelResolvable to a Channel object.

```ts

resolve(resolvable: ChannelResolvable): AnyChannel | null

```

- `resolvable: ChannelResolvable`

**Returns:** `AnyChannel | null`

### `resolveId`

Resolves a ChannelResolvable to a channel id string.

```ts

resolveId(resolvable: string | AnyChannel): string

```

- `resolvable: string | AnyChannel`

**Returns:** `string`

Resolves a ChannelResolvable to a channel id string.

```ts

resolveId(resolvable: ChannelResolvable): string | null

```

- `resolvable: ChannelResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, AnyChannel>

```

**Returns:** `Collection<string, AnyChannel>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/ChannelManager.ts#L19
