# ClientUser

Represents the logged in client's Discord user.

```ts

class ClientUser extends User

```

## Properties

### `accentColor`

The base 10 accent color of the user's banner
The user must be force fetched for this property to be present or be updated

**Type:** `number | null | undefined`

### `avatar`

The user avatar's hash

**Type:** `string | null`

### `avatarDecoration`

The user avatar decoration's hash

**Type:** `string | null` · **Modifiers:** readonly

### `avatarDecorationData`

The user avatar decoration's data

**Type:** `AvatarDecorationData | null`

### `banner`

The user banner's hash
The user must be force fetched for this property to be present or be updated

**Type:** `string | null | undefined`

### `bannerColor`

The user banner's hex
The user must be force fetched for this property to be present or be updated

**Type:** `string | null | undefined`

### `bio`

About me (User)
The user must be force fetched for this property to be present or be updated

**Type:** `string`

### `bot`

Whether or not the user is a bot

**Type:** `boolean`

### `clan`

The primary clan the user is in

**Type:** `UserPrimaryGuild | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `collectibles`

The user's collectibles

**Type:** `Collectibles | null`

### `createdAt`

The time the user was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the user was created at

**Type:** `number` · **Modifiers:** readonly

### `defaultAvatarURL`

A link to the user's default avatar

**Type:** `string` · **Modifiers:** readonly

### `discriminator`

The discriminator of this user
`'0'`, or a 4-digit stringified number if they're using the legacy username system

**Type:** `string`

### `displayName`

The global name of this user, or their username if they don't have one

**Type:** `string` · **Modifiers:** readonly

### `dmChannel`

The DM between the client's user and this user

**Type:** `DMChannel | null` · **Modifiers:** readonly

### `email`

Email address of the client user.

**Type:** `string | null`

### `flags`

The flags for this user

**Type:** `Readonly<UserFlags> | null`

### `friendNickname`

Get friend nickname

**Type:** `string | null | undefined` · **Modifiers:** readonly

### `globalName`

The global name of this user

**Type:** `string | null`

### `hexAccentColor`

The hexadecimal version of the user accent color, with a leading hash
The user must be force fetched for this property to be present

**Type:** ``${string}` | null | undefined` · **Modifiers:** readonly

### `id`

The user's id

**Type:** `string`

### `locale`

The current user's chosen locale, when the payload includes it.

**Type:** `string | null`

### `mfaEnabled`

If the bot's Application#owner Owner has MFA enabled on their account

**Type:** `boolean`

### `note`

The function returns the note associated with a specific client ID from a cache.

**Type:** `string | undefined` · **Modifiers:** readonly

### `nsfwAllowed`

Whether or not the client user is allowed to send NSFW messages [iOS device].

**Type:** `boolean`

### `partial`

Whether this User is a partial

**Type:** `boolean` · **Modifiers:** readonly

### `phone`

Phone number of the client user.

**Type:** `string | null`

### `premiumType`

Premium types denote the level of premium a user has.

**Type:** `0 | 1 | 2 | 3`

### `premiumUsageFlags`

Premium usage state of the client user.

**Type:** `Readonly<PremiumUsageFlags>`

### `presence`

Represents the client user's presence

**Type:** `ClientPresence` · **Modifiers:** readonly

### `primaryGuild`

The primary guild of the user

**Type:** `UserPrimaryGuild | null`

### `pronouns`

Pronouns (User)
The user must be force fetched for this property to be present or be updated

**Type:** `string`

### `purchasedFlags`

Purchased state of the client user.

**Type:** `Readonly<PurchasedFlags>`

### `relationship`

Check relationship status (Client -> User)

**Type:** `RelationshipTypes` · **Modifiers:** readonly

### `system`

Whether the user is an Official Discord System user (part of the urgent message system)

**Type:** `boolean`

### `tag`

The tag of this user
This user's username, or their legacy tag (e.g. `hydrabolt#0001`)
if they're using the legacy username system

**Type:** `string` · **Modifiers:** readonly

### `username`

The username of the user

**Type:** `string`

### `verified`

Whether or not this account has been verified

**Type:** `boolean`

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

A link to the user's avatar.

```ts

avatarURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `bannerURL`

A link to the user's banner.
This method will throw an error if called before the user is force fetched.
See User#banner for more info

```ts

bannerURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `clanBadgeURL`

A link to the user's guild tag badge.

> **Deprecated.** Use User.guildTagBadgeURL instead

```ts

clanBadgeURL(): string | null

```

**Returns:** `string | null`

### `createDM`

Creates a DM channel between the client and the user.

```ts

createDM(force?: boolean): Promise<DMChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<DMChannel>`

### `createFriendInvite`

Creates a friend invite. Discord fixes max age to 604800 seconds and max uses to 1.

```ts

createFriendInvite(): Promise<Invite>

```

**Returns:** `Promise<Invite>`

```ts
// Create a friend invite
client.user!.createFriendInvite()
  .then(console.log)
  .catch(console.error);
```

### `createHarvest`

```ts

createHarvest(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `deleteDM`

Deletes a DM channel (if one exists) between the client and the user. Resolves with the channel if successful.

```ts

deleteDM(): Promise<DMChannel>

```

**Returns:** `Promise<DMChannel>`

### `deleteMention`

```ts

deleteMention(messageId: string): Promise<unknown>

```

- `messageId: string`

**Returns:** `Promise<unknown>`

### `deleteRecentAvatar`

```ts

deleteRecentAvatar(avatarId: string): Promise<unknown>

```

- `avatarId: string`

**Returns:** `Promise<unknown>`

### `deleteRelationship`

Unblock / Unfriend / Cancels a friend request

```ts

deleteRelationship(): Promise<boolean>

```

**Returns:** `Promise<boolean>`

### `displayAvatarURL`

A link to the user's avatar if they have one.
Otherwise a link to their default avatar will be returned.

```ts

displayAvatarURL(options?: ImageURLOptions): string

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string`

### `edit`

Edits the logged in client.

```ts

edit(data: ClientUserEditData): Promise<ClientUser>

```

- `data: ClientUserEditData`

**Returns:** `Promise<ClientUser>`

### `editProfile`

```ts

editProfile(data?: Record<string, unknown>): Promise<Record<string, unknown>>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<Record<string, unknown>>`

### `equals`

Checks if the user is equal to another.
It compares id, username, discriminator, avatar, banner, accent color, and bot flags.
It is recommended to compare equality by using `user.id === user2.id` unless you want to compare all properties.

```ts

equals(user: User): boolean

```

- `user: User` — User to compare with

**Returns:** `boolean`

### `fetch`

Fetches this user.

```ts

fetch(force?: boolean): Promise<User>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<User>`

### `fetchApplicationIdentities`

Fetches this user's application identities.

```ts

fetchApplicationIdentities(options?: { withProfiles?: boolean }): Promise<RawUserApplicationIdentityData[]>

```

- `options?: { withProfiles?: boolean }` — Additional options for this fetch

**Returns:** `Promise<RawUserApplicationIdentityData[]>`

### `fetchBurstCredit`

Super Reactions

```ts

fetchBurstCredit(): Promise<number>

```

**Returns:** `Promise<number>`

### `fetchChannelAffinities`

```ts

fetchChannelAffinities(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `fetchConnections`

Fetches the current user's connected third-party accounts, keyed by connection id.

```ts

fetchConnections(): Promise<Collection<string, Connection>>

```

**Returns:** `Promise<Collection<string, Connection>>`

### `fetchGuildAffinities`

```ts

fetchGuildAffinities(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `fetchHarvest`

```ts

fetchHarvest(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `fetchMentions`

```ts

fetchMentions(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchProfile`

```ts

fetchProfile(userId?: string): Promise<Record<string, unknown>>

```

- `userId?: string`

**Returns:** `Promise<Record<string, unknown>>`

### `fetchRecentAvatars`

```ts

fetchRecentAvatars(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchSavedMessages`

```ts

fetchSavedMessages(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchUserAffinities`

```ts

fetchUserAffinities(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `getAllFriendInvites`

Fetches every active friend invite, keyed by invite code.

```ts

getAllFriendInvites(): Promise<Collection<string, Invite>>

```

**Returns:** `Promise<Collection<string, Invite>>`

### `getProfile`

Returns a user profile object for a given user ID.
This endpoint requires one of the following:
- The user is a bot
- The user shares a mutual guild with the current user
- The user is a friend of the current user
- The user is a friend suggestion of the current user
- The user has an outgoing friend request to the current user

```ts

getProfile(options?: string | UserProfileOptions): Promise<RawUserProfileData>

```

- `options?: string | UserProfileOptions`

**Returns:** `Promise<RawUserProfileData>`

### `guildTagBadgeURL`

A link to the user's guild tag badge.

```ts

guildTagBadgeURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions`

**Returns:** `string | null`

### `modifyAgreements`

```ts

modifyAgreements(data?: Record<string, unknown>): Promise<unknown>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `reportMeaningfullyOnline`

```ts

reportMeaningfullyOnline(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `revokeAllFriendInvites`

Revokes every active friend invite.

```ts

revokeAllFriendInvites(): Promise<void>

```

**Returns:** `Promise<void>`

### `saveMessage`

```ts

saveMessage(channelId: string, messageId: string): Promise<unknown>

```

- `channelId: string`
- `messageId: string`

**Returns:** `Promise<unknown>`

### `send`

Sends a message to this user.

```ts

send(options: string | MessageOptions | MessagePayload): Promise<Message<boolean>>

```

- `options: string | MessageOptions | MessagePayload` — The options to provide

**Returns:** `Promise<Message<boolean>>`

```ts
// Send a direct message
user.send('Hello!')
  .then(message => console.log(`Sent message: ${message.content} to ${user.tag}`))
  .catch(console.error);
```

### `sendFriendRequest`

Send Friend Request to the user

```ts

sendFriendRequest(): Promise<boolean>

```

**Returns:** `Promise<boolean>`

### `setAboutMe`

Set About me

```ts

setAboutMe(bio?: string | null): Promise<ClientUser>

```

- `bio?: string | null` — Bio to set

**Returns:** `Promise<ClientUser>`

### `setAccentColor`

Set Accent color

```ts

setAccentColor(color?: ColorResolvable | null): Promise<ClientUser>

```

- `color?: ColorResolvable | null` — Color to set

**Returns:** `Promise<ClientUser>`

### `setActivity`

Sets the activity the client user is playing.

```ts

setActivity(options?: RichPresence | ActivityOptions | SpotifyRPC | CustomStatus): ClientPresence

```

- `options?: RichPresence | ActivityOptions | SpotifyRPC | CustomStatus` — Options for setting the activity

**Returns:** `ClientPresence`

```ts
// Set the client user's activity
client.user!.setActivity('discord.js', { type: 'WATCHING' });
```

Sets the activity the client user is playing.

```ts

setActivity(name: string, options?: Omit<ActivityOptions, "name">): ClientPresence

```

- `name: string` — Activity being played, or options for setting the activity
- `options?: Omit<ActivityOptions, "name">` — Options for setting the activity

**Returns:** `ClientPresence`

```ts
// Set the client user's activity
client.user!.setActivity('discord.js', { type: 'WATCHING' });
```

### `setAFK`

Sets/removes the AFK flag for the client user.

```ts

setAFK(afk?: boolean, shardId?: number | number[]): ClientPresence

```

- `afk?: boolean` — Whether or not the user is AFK
- `shardId?: number | number[]` — Shard Id(s) to have the AFK flag set on

**Returns:** `ClientPresence`

### `setApplicationIdentityConfig`

Sets the visibility of an application identity profile for the current user.

```ts

setApplicationIdentityConfig(applicationId: string, externalUserId: string, options?: { connectionVisible?: string }): Promise<void>

```

- `applicationId: string`
- `externalUserId: string`
- `options?: { connectionVisible?: string }`

**Returns:** `Promise<void>`

### `setAvatar`

Sets the avatar of the logged in client.

```ts

setAvatar(avatar: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null): Promise<ClientUser>

```

- `avatar: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new avatar

**Returns:** `Promise<ClientUser>`

```ts
// Set avatar
client.user!.setAvatar('./avatar.png')
  .then(user => console.log(`New avatar set!`))
  .catch(console.error);
```

### `setBanner`

Sets the banner of the logged in client.

```ts

setBanner(banner: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null): Promise<ClientUser>

```

- `banner: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new banner

**Returns:** `Promise<ClientUser>`

```ts
// Set banner
client.user!.setBanner('./banner.png')
  .then(user => console.log(`New banner set!`))
  .catch(console.error);
```

### `setClan`

```ts

setClan(guildId: string | null): Promise<unknown>

```

- `guildId: string | null`

**Returns:** `Promise<unknown>`

### `setGlobalName`

Set global display name

```ts

setGlobalName(globalName?: string | null): Promise<ClientUser>

```

- `globalName?: string | null` — The new display name

**Returns:** `Promise<ClientUser>`

### `setHypeSquad`

Set HyperSquad House

```ts

setHypeSquad(hypesquad: 0 | 1 | 2 | 3 | "LEAVE" | "HOUSE_BRAVERY" | "HOUSE_BRILLIANCE" | "HOUSE_BALANCE"): Promise<void>

```

- `hypesquad: 0 | 1 | 2 | 3 | "LEAVE" | "HOUSE_BRAVERY" | "HOUSE_BRILLIANCE" | "HOUSE_BALANCE"`

**Returns:** `Promise<void>`

```ts
// Set HyperSquad HOUSE_BRAVERY
client.user!.setHypeSquad(1); || client.user!.setHypeSquad('HOUSE_BRAVERY');
// Leave
client.user!.setHypeSquad(0);
```

### `setNote`

The function updates the note of a user and returns the updated user.

```ts

setNote(note: string | null | undefined): Promise<ClientUser>

```

- `note: string | null | undefined` — The `note` parameter is the new value that you want to set for the note of the user. It is an optional parameter and its default value is `null`.

**Returns:** `Promise<ClientUser>`

### `setPresence`

Sets the full presence of the client user.

```ts

setPresence(data: PresenceData): ClientPresence

```

- `data: PresenceData` — Data for the presence

**Returns:** `ClientPresence`

```ts
// Set the client user's presence
client.user!.setPresence({ activities: [{ name: 'with discord.js' }], status: 'idle' });
```

### `setPronouns`

Set pronouns

```ts

setPronouns(pronouns?: string | null): Promise<ClientUser>

```

- `pronouns?: string | null` — Your pronouns

**Returns:** `Promise<ClientUser>`

### `setSamsungActivity`

Sets Discord Playing status to "Playing on Samsung Galaxy". Only selected gamss from discords database works

```ts

setSamsungActivity(packageName: string, type?: "START" | "UPDATE" | "STOP"): Promise<ClientUser>

```

- `packageName: string` — Android package name
- `type?: "START" | "UPDATE" | "STOP"` — Must be START, UPDATE, or STOP

**Returns:** `Promise<ClientUser>`

```ts
// Set the client user's status
client.user!.setSamsungActivity('com.YostarJP.BlueArchive', 'START');
// Update
client.user!.setSamsungActivity('com.miHoYo.bh3oversea', 'UPDATE');
// Stop
client.user!.setSamsungActivity('com.miHoYo.GenshinImpact', 'STOP');
```

### `setStatus`

Sets the status of the client user.

```ts

setStatus(status: PresenceStatusData, shardId?: number | number[]): ClientPresence

```

- `status: PresenceStatusData` — Status to change to
- `shardId?: number | number[]` — Shard id(s) to have the activity set on

**Returns:** `ClientPresence`

```ts
// Set the client user's status
client.user!.setStatus('idle');
```

### `setUsername`

Sets the username of the logged in client.
Changing usernames in Discord is heavily rate limited, with only 2 requests
every hour. Use this sparingly!

```ts

setUsername(username: string, password: string): Promise<ClientUser>

```

- `username: string` — The new username
- `password: string` — Current Password

**Returns:** `Promise<ClientUser>`

```ts
// Set username
client.user!.setUsername('discordjs', 'passw@rd')
  .then(user => console.log(`My new username is ${user.username}`))
  .catch(console.error);
```

### `stopRinging`

Stop ringing

```ts

stopRinging(channel: ChannelResolvable): Promise<void>

```

- `channel: ChannelResolvable` — DMChannel | GroupDMChannel

**Returns:** `Promise<void>`

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): `${string}`

```

**Returns:** ``${string}``

```ts
// Logs: Hello from <@123456789012345678>!
console.log(`Hello from ${user}!`);
```

### `unsaveMessage`

```ts

unsaveMessage(channelId: string, messageId: string): Promise<unknown>

```

- `channelId: string`
- `messageId: string`

**Returns:** `Promise<unknown>`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ClientUser.ts#L18
