# SystemChannelFlagsBitField

Data structure that makes it easy to interact with a Guild#systemChannelFlags bitfield.
Note that all event message types are enabled by default,
and by setting their corresponding flags you are disabling them

```ts

class SystemChannelFlagsBitField extends BitField<SystemChannelFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<SystemChannelFlagsString, number>): SystemChannelFlags

```

- `bits?: BitFieldResolvable<SystemChannelFlagsString, number>` — Bit(s) to read from

**Returns:** `SystemChannelFlags`

## Properties

### `bitfield`

Bitfield of the packed bits

**Type:** `number`

### `FLAGS`

Numeric system channel flags. All available properties:
* `SUPPRESS_JOIN_NOTIFICATIONS` (Suppress member join notifications)
* `SUPPRESS_PREMIUM_SUBSCRIPTIONS` (Suppress server boost notifications)
* `SUPPRESS_GUILD_REMINDER_NOTIFICATIONS` (Suppress server setup tips)
* `SUPPRESS_JOIN_NOTIFICATION_REPLIES` (Hide member join sticker reply buttons)
* `SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS` (Suppress role subscription purchase and renewal notifications)
* `SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES` (HHide role subscription sticker reply buttons)

**Type:** `Record<SystemChannelFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<SystemChannelFlagsString>

```

**Returns:** `IterableIterator<SystemChannelFlagsString>`

### `add`

```ts

add(bits: BitFieldResolvable<SystemChannelFlagsString, number>[]): BitField<SystemChannelFlagsString, number>

```

- `bits: BitFieldResolvable<SystemChannelFlagsString, number>[]`

**Returns:** `BitField<SystemChannelFlagsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<SystemChannelFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<SystemChannelFlagsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<SystemChannelFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<SystemChannelFlagsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<SystemChannelFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<SystemChannelFlagsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<SystemChannelFlagsString, number>, hasParams: readonly unknown[]): SystemChannelFlagsString[]

```

- `bits: BitFieldResolvable<SystemChannelFlagsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `SystemChannelFlagsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<SystemChannelFlagsString, number>[]): BitField<SystemChannelFlagsString, number>

```

- `bits: BitFieldResolvable<SystemChannelFlagsString, number>[]`

**Returns:** `BitField<SystemChannelFlagsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<SystemChannelFlagsString, number>): number

```

- `bit?: BitFieldResolvable<SystemChannelFlagsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): SystemChannelFlagsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `SystemChannelFlagsString[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/SystemChannelFlags.ts#L12
