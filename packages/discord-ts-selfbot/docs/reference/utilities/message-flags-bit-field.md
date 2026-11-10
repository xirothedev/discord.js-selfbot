# MessageFlagsBitField

Data structure that makes it easy to interact with a Message#flags bitfield.

```ts

class MessageFlagsBitField extends BitField<MessageFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<MessageFlagsString, number>): MessageFlags

```

- `bits?: BitFieldResolvable<MessageFlagsString, number>` — Bit(s) to read from

**Returns:** `MessageFlags`

## Properties

### `bitfield`

Bitfield of the packed bits

**Type:** `number`

### `FLAGS`

Numeric message flags. All available properties:
* `CROSSPOSTED`
* `IS_CROSSPOST`
* `SUPPRESS_EMBEDS`
* `SOURCE_MESSAGE_DELETED`
* `URGENT`
* `HAS_THREAD`
* `EPHEMERAL`
* `LOADING`
* `FAILED_TO_MENTION_SOME_ROLES_IN_THREAD`
* `GUILD_FEED_HIDDEN`
* `SHOULD_SHOW_LINK_NOT_DISCORD_WARNING`
* `SUPPRESS_NOTIFICATIONS`
* `IS_VOICE_MESSAGE`
* `HAS_SNAPSHOT`
* `IS_COMPONENTS_V2`

**Type:** `Record<MessageFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<MessageFlagsString>

```

**Returns:** `IterableIterator<MessageFlagsString>`

### `add`

```ts

add(bits: BitFieldResolvable<MessageFlagsString, number>[]): BitField<MessageFlagsString, number>

```

- `bits: BitFieldResolvable<MessageFlagsString, number>[]`

**Returns:** `BitField<MessageFlagsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<MessageFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<MessageFlagsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<MessageFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<MessageFlagsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<MessageFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<MessageFlagsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<MessageFlagsString, number>, hasParams: readonly unknown[]): MessageFlagsString[]

```

- `bits: BitFieldResolvable<MessageFlagsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `MessageFlagsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<MessageFlagsString, number>[]): BitField<MessageFlagsString, number>

```

- `bits: BitFieldResolvable<MessageFlagsString, number>[]`

**Returns:** `BitField<MessageFlagsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<MessageFlagsString, number>): number

```

- `bit?: BitFieldResolvable<MessageFlagsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): MessageFlagsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `MessageFlagsString[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/MessageFlags.ts#L10
