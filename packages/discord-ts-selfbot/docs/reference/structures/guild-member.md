# GuildMember

Represents a member of a guild on Discord.

```ts

class GuildMember extends Base<this> & PartialTextBasedChannelFields

```

## Properties

### `avatar`

The guild member's avatar hash

**Type:** `string | null`

### `avatarDecorationData`

The member avatar decoration's data

**Type:** `AvatarDecorationData | null`

### `bannable`

Whether this member is bannable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `banner`

The guild member's banner hash.

**Type:** `string | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `communicationDisabledUntil`

The time this member's timeout will be removed

**Type:** `Date | null` · **Modifiers:** readonly

### `communicationDisabledUntilTimestamp`

The timestamp this member's timeout will be removed

**Type:** `number | null`

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `displayColor`

The displayed color of this member in base 10

**Type:** `number` · **Modifiers:** readonly

### `displayHexColor`

The displayed color of this member in hexadecimal

**Type:** ``${string}`` · **Modifiers:** readonly

### `displayName`

The nickname of this member, or their user display name if they don't have one

**Type:** `string` · **Modifiers:** readonly

### `flags`

The flags of this member

**Type:** `Readonly<GuildMemberFlags>`

### `guild`

The guild that this member is part of

**Type:** `Guild`

### `id`

The member's id

**Type:** `string` · **Modifiers:** readonly

### `joinedAt`

The time this member joined the guild

**Type:** `Date | null` · **Modifiers:** readonly

### `joinedTimestamp`

The timestamp the member joined the guild at

**Type:** `number | null`

### `kickable`

Whether this member is kickable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `manageable`

Whether the client user is above this user in the hierarchy, according to role position and guild ownership.
This is a prerequisite for many moderative actions.

**Type:** `boolean` · **Modifiers:** readonly

### `moderatable`

Whether this member is moderatable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `nickname`

The nickname of this member, if they have one

**Type:** `string | null`

### `partial`

Whether this GuildMember is a partial

**Type:** `false` · **Modifiers:** readonly

### `pending`

Whether this member has yet to pass the guild's membership gate

**Type:** `boolean`

### `permissions`

The overall set of permissions for this member, taking only roles and owner status into account

**Type:** `Readonly<Permissions>` · **Modifiers:** readonly

### `premiumSince`

The last time this member started boosting the guild

**Type:** `Date | null` · **Modifiers:** readonly

### `premiumSinceTimestamp`

The last timestamp this member started boosting the guild

**Type:** `number | null`

### `presence`

The presence of this guild member

**Type:** `Presence | null` · **Modifiers:** readonly

### `roles`

A manager for the roles belonging to this member

**Type:** `GuildMemberRoleManager` · **Modifiers:** readonly

### `user`

The user that this guild member instance represents

**Type:** `User`

### `voice`

The voice state of this member

**Type:** `VoiceState` · **Modifiers:** readonly

## Methods

### `avatarDecorationURL`

A link to the user's avatar decoration.

```ts

avatarDecorationURL(): string | null

```

**Returns:** `string | null`

### `avatarURL`

A link to the member's guild avatar.

```ts

avatarURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `ban`

Bans this guild member.

```ts

ban(options?: BanOptions): Promise<GuildMember>

```

- `options?: BanOptions` — Options for the ban

**Returns:** `Promise<GuildMember>`

```ts
// Ban a guild member, deleting a week's worth of messages
guildMember.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: 'They deserved it' })
  .then(console.log)
  .catch(console.error);
```

### `bannerURL`

A link to the member's banner.

```ts

bannerURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the banner URL

**Returns:** `string | null`

### `createDM`

Creates a DM channel between the client and this member.

```ts

createDM(force?: boolean): Promise<DMChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<DMChannel>`

### `deleteDM`

Deletes any DMs with this member.

```ts

deleteDM(): Promise<DMChannel>

```

**Returns:** `Promise<DMChannel>`

### `disableCommunicationUntil`

Times this guild member out.

```ts

disableCommunicationUntil(timeout: DateResolvable | null, reason?: string): Promise<GuildMember>

```

- `timeout: DateResolvable | null`
- `reason?: string` — The reason for this timeout.

**Returns:** `Promise<GuildMember>`

```ts
// Time a guild member out for 5 minutes
guildMember.disableCommunicationUntil(Date.now() + (5 * 60 * 1000), 'They deserved it')
  .then(console.log)
  .catch(console.error);
```

```ts
// Remove the timeout of a guild member
guildMember.disableCommunicationUntil(null)
  .then(member => console.log(`Removed timeout for ${member.displayName}`))
  .catch(console.error);
```

### `displayAvatarDecorationURL`

A link to the member's guild avatar decoration if they have one.
Otherwise, a link to their User#avatarDecorationURL will be returned.

```ts

displayAvatarDecorationURL(): string | null

```

**Returns:** `string | null`

### `displayAvatarURL`

A link to the member's guild avatar if they have one.
Otherwise, a link to their User#displayAvatarURL will be returned.

```ts

displayAvatarURL(options?: ImageURLOptions): string

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string`

### `displayBannerURL`

A link to the member's guild banner if they have one.
Otherwise, a link to their User#bannerURL will be returned.

```ts

displayBannerURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the image URL

**Returns:** `string | null`

### `edit`

Edits this member.

```ts

edit(data: GuildMemberEditData, reason?: string): Promise<GuildMember>

```

- `data: GuildMemberEditData` — The data to edit the member with
- `reason?: string` — Reason for editing this user

**Returns:** `Promise<GuildMember>`

### `fetch`

Fetches this GuildMember.

```ts

fetch(force?: boolean): Promise<GuildMember>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<GuildMember>`

### `isCommunicationDisabled`

Whether this member is currently timed out

```ts

isCommunicationDisabled(): this

```

**Returns:** `this`

### `kick`

Kicks this member from the guild.

```ts

kick(reason?: string): Promise<GuildMember>

```

- `reason?: string` — Reason for kicking user

**Returns:** `Promise<GuildMember>`

### `permissionsIn`

Returns `channel.permissionsFor(guildMember)`. Returns permissions for a member in a guild channel,
taking into account roles and permission overwrites.

```ts

permissionsIn(channel: GuildChannelResolvable): Readonly<Permissions>

```

- `channel: GuildChannelResolvable` — The guild channel to use as context

**Returns:** `Readonly<Permissions>`

### `send`

```ts

send(options: string | MessageOptions | MessagePayload): Promise<Message<boolean>>

```

- `options: string | MessageOptions | MessagePayload`

**Returns:** `Promise<Message<boolean>>`

### `setAboutMe`

Set Guild About me

```ts

setAboutMe(bio: string | null): Promise<GuildMember>

```

- `bio: string | null` — Bio to set

**Returns:** `Promise<GuildMember>`

### `setAvatar`

Sets the guild avatar of the logged in client.

```ts

setAvatar(avatar: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null): Promise<GuildMember>

```

- `avatar: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new avatar

**Returns:** `Promise<GuildMember>`

### `setBanner`

Sets the guild banner of the logged in client.

```ts

setBanner(banner: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null): Promise<GuildMember>

```

- `banner: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new banner

**Returns:** `Promise<GuildMember>`

### `setFlags`

Sets the flags for this member.

```ts

setFlags(flags: GuildMemberFlagsResolvable): Promise<GuildMember>

```

- `flags: GuildMemberFlagsResolvable` — The flags to set

**Returns:** `Promise<GuildMember>`

### `setNickname`

Sets the nickname for this member.

```ts

setNickname(nickname: string | null, reason?: string): Promise<GuildMember>

```

- `nickname: string | null`
- `reason?: string` — Reason for setting the nickname

**Returns:** `Promise<GuildMember>`

```ts
// Set a nickname for a guild member
guildMember.setNickname('cool nickname', 'Needed a new nickname')
  .then(member => console.log(`Set nickname of ${member.user.username}`))
  .catch(console.error);
```

```ts
// Remove a nickname for a guild member
guildMember.setNickname(null, 'No nicknames allowed!')
  .then(member => console.log(`Removed nickname for ${member.user.username}`))
  .catch(console.error);
```

### `timeout`

Times this guild member out.

```ts

timeout(timeout: number | null, reason?: string): Promise<GuildMember>

```

- `timeout: number | null` — The time in milliseconds for the member's communication to be disabled until. Provide `null` to remove the timeout.
- `reason?: string` — The reason for this timeout.

**Returns:** `Promise<GuildMember>`

```ts
// Time a guild member out for 5 minutes
guildMember.timeout(5 * 60 * 1000, 'They deserved it')
  .then(console.log)
  .catch(console.error);
```

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): MemberMention

```

**Returns:** `MemberMention`

```ts
// Logs: Hello from <@123456789012345678>!
console.log(`Hello from ${member}!`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildMember.ts#L28
