# Invite

Represents an invitation to a guild channel.

```ts

class Invite extends Base

```

## Properties

### `channel`

**Type:** `GroupDMChannel | NonThreadGuildBasedChannel`

### `channelId`

The channel's id this invite is for

**Type:** `string`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `code`

The code for this invite

**Type:** `string`

### `createdAt`

The time the invite was created at

**Type:** `Date | null` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp this invite was created at

**Type:** `number | null`

### `deletable`

Whether the invite is deletable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `expiresAt`

The time the invite will expire at

**Type:** `Date | null` · **Modifiers:** readonly

### `expiresTimestamp`

The timestamp the invite will expire at

**Type:** `number | null` · **Modifiers:** readonly

### `flags`

The flags that are applied to the invite.

**Type:** `Readonly<InviteFlags>`

### `guild`

**Type:** `Guild | InviteGuild | null`

### `guildScheduledEvent`

The guild scheduled event data if there is a GuildScheduledEvent in the channel this invite is for

**Type:** `GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED"> | null`

### `inviter`

**Type:** `User | null`

### `inviterId`

The user's id who created this invite

**Type:** `string | null`

### `INVITES_PATTERN`

Regular expression that globally matches Discord invite links

**Type:** `RegExp` · **Modifiers:** static

### `maxAge`

The maximum age of the invite, in seconds, 0 if never expires
This is only available when the invite was fetched through GuildInviteManager#fetch
or created through GuildInviteManager#create.

**Type:** `number | null`

### `maxUses`

The maximum uses of this invite
This is only available when the invite was fetched through GuildInviteManager#fetch
or created through GuildInviteManager#create.

**Type:** `number | null`

### `memberCount`

The approximate total number of members of the guild this invite is for
This is only available when the invite was fetched through Client#fetchInvite.

**Type:** `number | null`

### `presenceCount`

The approximate number of online members of the guild this invite is for
This is only available when the invite was fetched through Client#fetchInvite.

**Type:** `number | null`

### `stageInstance`

The stage instance data if there is a public StageInstance in the stage channel this invite is for

**Type:** `InviteStageInstance | null`

### `targetApplication`

The embedded application to open for this voice channel embedded application invite

**Type:** `IntegrationApplication | null`

### `targetType`

The target type

**Type:** `InviteTargetTypes | null`

### `targetUser`

The user whose stream to display for this voice channel stream invite

**Type:** `User | null`

### `temporary`

Whether or not this invite only grants temporary membership
This is only available when the invite was fetched through GuildInviteManager#fetch
or created through GuildInviteManager#create.

**Type:** `boolean | null`

### `type`

The type of invite

**Type:** `InviteTypes | null`

### `url`

The URL to the invite

**Type:** `string` · **Modifiers:** readonly

### `uses`

How many times this invite has been used
This is only available when the invite was fetched through GuildInviteManager#fetch
or created through GuildInviteManager#create.

**Type:** `number | null`

## Methods

### `delete`

Deletes this invite.

```ts

delete(reason?: string): Promise<Invite>

```

- `reason?: string` — Reason for deleting this invite

**Returns:** `Promise<Invite>`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): string

```

**Returns:** `string`

```ts
// Logs: Invite: https://discord.gg/A1b2C3
console.log(`Invite: ${invite}`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Invite.ts#L24
