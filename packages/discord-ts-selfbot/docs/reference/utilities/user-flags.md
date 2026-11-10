# UserFlags

Data structure that makes it easy to interact with a User#flags bitfield.

```ts

class UserFlags extends BitField<UserFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<UserFlagsString, number>): UserFlags

```

- `bits?: BitFieldResolvable<UserFlagsString, number>` — Bit(s) to read from

**Returns:** `UserFlags`

## Properties

### `bitfield`

Bitfield of the packed bits

**Type:** `number`

### `FLAGS`

Numeric user flags. All available properties:
* `DISCORD_EMPLOYEE`
* `PARTNERED_SERVER_OWNER`
* `HYPESQUAD_EVENTS`
* `BUGHUNTER_LEVEL_1`
* `MFA_SMS`
* `PREMIUM_PROMO_DISMISSED`
* `HOUSE_BRAVERY`
* `HOUSE_BRILLIANCE`
* `HOUSE_BALANCE`
* `EARLY_SUPPORTER`
* `TEAM_USER`
* `INTERNAL_APPLICATION`
* `SYSTEM`
* `HAS_UNREAD_URGENT_MESSAGES`
* `BUGHUNTER_LEVEL_2`
* `UNDERAGE_DELETED`
* `VERIFIED_BOT`
* `EARLY_VERIFIED_BOT_DEVELOPER`
* `DISCORD_CERTIFIED_MODERATOR`
* `BOT_HTTP_INTERACTIONS`
* `SPAMMER`
* `DISABLE_PREMIUM`
* `ACTIVE_DEVELOPER`
* `HIGH_GLOBAL_RATE_LIMIT`
* `DELETED`
* `DISABLED_SUSPICIOUS_ACTIVITY`
* `SELF_DELETED`
* `PREMIUM_DISCRIMINATOR`
* `USED_DESKTOP_CLIENT`
* `USED_WEB_CLIENT`
* `USED_MOBILE_CLIENT`
* `DISABLED`
* `VERIFIED_EMAIL`
* `QUARANTINED`
* `COLLABORATOR`
* `RESTRICTED_COLLABORATOR`

**Type:** `Record<UserFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<UserFlagsString>

```

**Returns:** `IterableIterator<UserFlagsString>`

### `add`

```ts

add(bits: BitFieldResolvable<UserFlagsString, number>[]): BitField<UserFlagsString, number>

```

- `bits: BitFieldResolvable<UserFlagsString, number>[]`

**Returns:** `BitField<UserFlagsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<UserFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<UserFlagsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<UserFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<UserFlagsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<UserFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<UserFlagsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<UserFlagsString, number>, hasParams: readonly unknown[]): UserFlagsString[]

```

- `bits: BitFieldResolvable<UserFlagsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `UserFlagsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<UserFlagsString, number>[]): BitField<UserFlagsString, number>

```

- `bits: BitFieldResolvable<UserFlagsString, number>[]`

**Returns:** `BitField<UserFlagsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<UserFlagsString, number>): number

```

- `bit?: BitFieldResolvable<UserFlagsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): UserFlagsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `UserFlagsString[]`

### `toJSON`

```ts

toJSON(): number

```

**Returns:** `number`

### `valueOf`

```ts

valueOf(): number

```

**Returns:** `number`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/UserFlags.ts#L11
