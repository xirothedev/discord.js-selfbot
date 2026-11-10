# PermissionsBitField

Data structure that makes it easy to interact with a permission bitfield. All GuildMembers have a set of
permissions in their guild, and each channel in the guild may also have PermissionOverwrites for the member
that override their default permissions.

```ts

class PermissionsBitField extends BitField<PermissionString, bigint>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<PermissionString, bigint>): Permissions

```

- `bits?: BitFieldResolvable<PermissionString, bigint>`

**Returns:** `Permissions`

## Properties

### `ALL`

Bitfield representing every permission combined

**Type:** `bigint` · **Modifiers:** static

### `bitfield`

Bitfield of the packed bits

**Type:** `bigint`

### `DEFAULT`

Bitfield representing the default permissions for users

**Type:** `bigint` · **Modifiers:** static

### `FLAGS`

Numeric permission flags. All available properties:
* `CREATE_INSTANT_INVITE` (create invitations to the guild)
* `KICK_MEMBERS`
* `BAN_MEMBERS`
* `ADMINISTRATOR` (implicitly has *all* permissions, and bypasses all channel overwrites)
* `MANAGE_CHANNELS` (edit and reorder channels)
* `MANAGE_GUILD` (edit the guild information, region, etc.)
* `ADD_REACTIONS` (add new reactions to messages)
* `VIEW_AUDIT_LOG`
* `PRIORITY_SPEAKER`
* `STREAM`
* `VIEW_CHANNEL`
* `SEND_MESSAGES`
* `SEND_TTS_MESSAGES`
* `MANAGE_MESSAGES` (delete messages and reactions)
* `EMBED_LINKS` (links posted will have a preview embedded)
* `ATTACH_FILES`
* `READ_MESSAGE_HISTORY` (view messages that were posted prior to opening Discord)
* `MENTION_EVERYONE`
* `USE_EXTERNAL_EMOJIS` (use emojis from different guilds)
* `VIEW_GUILD_INSIGHTS`
* `CONNECT` (connect to a voice channel)
* `SPEAK` (speak in a voice channel)
* `MUTE_MEMBERS` (mute members across all voice channels)
* `DEAFEN_MEMBERS` (deafen members across all voice channels)
* `MOVE_MEMBERS` (move members between voice channels)
* `USE_VAD` (use voice activity detection)
* `CHANGE_NICKNAME`
* `MANAGE_NICKNAMES` (change other members' nicknames)
* `MANAGE_ROLES`
* `MANAGE_WEBHOOKS`
* `MANAGE_EMOJIS_AND_STICKERS`
* `USE_APPLICATION_COMMANDS`
* `REQUEST_TO_SPEAK`
* `MANAGE_EVENTS`
* `MANAGE_THREADS`
* `USE_PUBLIC_THREADS` (deprecated)
* `CREATE_PUBLIC_THREADS`
* `USE_PRIVATE_THREADS` (deprecated)
* `CREATE_PRIVATE_THREADS`
* `USE_EXTERNAL_STICKERS` (use stickers from different guilds)
* `SEND_MESSAGES_IN_THREADS`
* `START_EMBEDDED_ACTIVITIES`
* `MODERATE_MEMBERS`
* `VIEW_CREATOR_MONETIZATION_ANALYTICS`
* `USE_SOUNDBOARD`
* `CREATE_GUILD_EXPRESSIONS`
* `CREATE_EVENTS`
* `USE_EXTERNAL_SOUNDS`
* `SEND_VOICE_MESSAGES`
* `USE_CLYDE_AI`
* `SET_VOICE_CHANNEL_STATUS`
* `SEND_POLLS`
* `USE_EXTERNAL_APPS`

**Type:** `PermissionFlags` · **Modifiers:** static

### `STAGE_MODERATOR`

Bitfield representing the permissions required for moderators of stage channels

**Type:** `bigint` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<PermissionString>

```

**Returns:** `IterableIterator<PermissionString>`

### `add`

```ts

add(bits: BitFieldResolvable<PermissionString, bigint>[]): BitField<PermissionString, bigint>

```

- `bits: BitFieldResolvable<PermissionString, bigint>[]`

**Returns:** `BitField<PermissionString, bigint>`

### `any`

Checks whether the bitfield has a permission, or any of multiple permissions.

```ts

any(permission: PermissionResolvable, checkAdmin?: boolean): boolean

```

- `permission: PermissionResolvable` — Permission(s) to check for
- `checkAdmin?: boolean` — Whether to allow the administrator permission to override

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<PermissionString, bigint>): boolean

```

- `bit: BitFieldResolvable<PermissionString, bigint>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

Checks whether the bitfield has a permission, or multiple permissions.

```ts

has(permission: PermissionResolvable, checkAdmin?: boolean): boolean

```

- `permission: PermissionResolvable` — Permission(s) to check for
- `checkAdmin?: boolean` — Whether to allow the administrator permission to override

**Returns:** `boolean`

### `missing`

Gets all given bits that are missing from the bitfield.

```ts

missing(bits: BitFieldResolvable<PermissionString, bigint>, checkAdmin?: boolean): PermissionString[]

```

- `bits: BitFieldResolvable<PermissionString, bigint>` — Bit(s) to check for
- `checkAdmin?: boolean` — Whether to allow the administrator permission to override

**Returns:** `PermissionString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<PermissionString, bigint>[]): BitField<PermissionString, bigint>

```

- `bits: BitFieldResolvable<PermissionString, bigint>[]`

**Returns:** `BitField<PermissionString, bigint>`

### `resolve`

```ts

static resolve(permission?: PermissionResolvable): bigint

```

- `permission?: PermissionResolvable`

**Returns:** `bigint`

### `serialize`

```ts

serialize(checkAdmin?: boolean): Record<PermissionString, boolean>

```

- `checkAdmin?: boolean`

**Returns:** `Record<PermissionString, boolean>`

### `toArray`

Gets an Array of bitfield names based on the permissions available.

```ts

toArray(): PermissionString[]

```

**Returns:** `PermissionString[]`

### `toJSON`

```ts

toJSON(): string

```

**Returns:** `string`

### `valueOf`

```ts

valueOf(): bigint

```

**Returns:** `bigint`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/Permissions.ts#L12
