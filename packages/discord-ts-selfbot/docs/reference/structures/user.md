# User

Represents a user on Discord.

```ts

class User extends Base<this> & PartialTextBasedChannelFields

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

### `note`

The function returns the note associated with a specific client ID from a cache.

**Type:** `string | undefined` · **Modifiers:** readonly

### `partial`

Whether this User is a partial

**Type:** `boolean` · **Modifiers:** readonly

### `primaryGuild`

The primary guild of the user

**Type:** `UserPrimaryGuild | null`

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

### `deleteDM`

Deletes a DM channel (if one exists) between the client and the user. Resolves with the channel if successful.

```ts

deleteDM(): Promise<DMChannel>

```

**Returns:** `Promise<DMChannel>`

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

### `fetchMutualRelationships`

Fetches the mutual relationships (friends) between this user and the current user.

```ts

fetchMutualRelationships(): Promise<RawUserData[]>

```

**Returns:** `Promise<RawUserData[]>`

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

### `setNote`

The function updates the note of a user and returns the updated user.

```ts

setNote(note: string | null | undefined): Promise<User>

```

- `note: string | null | undefined` — The `note` parameter is the new value that you want to set for the note of the user. It is an optional parameter and its default value is `null`.

**Returns:** `Promise<User>`

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

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/User.ts#L20
