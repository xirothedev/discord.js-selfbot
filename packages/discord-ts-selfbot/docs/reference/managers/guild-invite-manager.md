# GuildInviteManager

Manages API methods for GuildInvites and stores their cache.

```ts

class GuildInviteManager extends DataManager<string, Invite, InviteResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, Invite>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this Manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<Invite>` · **Modifiers:** readonly

## Methods

### `create`

Create an invite to the guild from the provided channel.

```ts

create(channel: GuildInvitableChannelResolvable, options?: CreateInviteOptions): Promise<Invite>

```

- `channel: GuildInvitableChannelResolvable` — The options for creating the invite from a channel.
- `options?: CreateInviteOptions` — The options for creating the invite from a channel.

**Returns:** `Promise<Invite>`

```ts
// Create an invite to a selected channel
guild.invites.create('599942732013764608')
  .then(console.log)
  .catch(console.error);
```

### `delete`

Deletes an invite.

```ts

delete(invite: string, reason?: string): Promise<Invite>

```

- `invite: string` — The invite to delete
- `reason?: string` — Reason for deleting the invite

**Returns:** `Promise<Invite>`

### `fetch`

```ts

fetch(options: string | FetchInviteOptions): Promise<Invite>

```

- `options: string | FetchInviteOptions`

**Returns:** `Promise<Invite>`

```ts

fetch(options?: FetchInvitesOptions): Promise<Collection<string, Invite>>

```

- `options?: FetchInvitesOptions`

**Returns:** `Promise<Collection<string, Invite>>`

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: Invite): Invite

```

- `resolvable: Invite`

**Returns:** `Invite`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: string): Invite | null

```

- `resolvable: string`

**Returns:** `Invite | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | Invite): string

```

- `resolvable: string | Invite`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string): string | null

```

- `resolvable: string`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Invite>

```

**Returns:** `Collection<string, Invite>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildInviteManager.ts#L15
