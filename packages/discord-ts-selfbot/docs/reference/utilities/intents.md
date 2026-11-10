# Intents

Data structure that makes it easy to calculate intents.

```ts

class Intents extends BitField<IntentsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<IntentsString, number>): Intents

```

- `bits?: BitFieldResolvable<IntentsString, number>` — Bit(s) to read from

**Returns:** `Intents`

## Properties

### `ALL`

**Type:** `number` · **Modifiers:** static

### `bitfield`

**Type:** `number`

### `FLAGS`

Numeric WebSocket intents. All available properties:
* `GUILDS`
* `GUILD_MEMBERS`
* `GUILD_BANS`
* `GUILD_EMOJIS_AND_STICKERS`
* `GUILD_INTEGRATIONS`
* `GUILD_WEBHOOKS`
* `GUILD_INVITES`
* `GUILD_VOICE_STATES`
* `GUILD_PRESENCES`
* `GUILD_MESSAGES`
* `GUILD_MESSAGE_REACTIONS`
* `GUILD_MESSAGE_TYPING`
* `DIRECT_MESSAGES`
* `DIRECT_MESSAGE_REACTIONS`
* `DIRECT_MESSAGE_TYPING`
* `MESSAGE_CONTENT`
* `GUILD_SCHEDULED_EVENTS`
* `AUTO_MODERATION_CONFIGURATION`
* `AUTO_MODERATION_EXECUTION`

**Type:** `Record<IntentsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<IntentsString>

```

**Returns:** `IterableIterator<IntentsString>`

### `add`

```ts

add(bits: BitFieldResolvable<IntentsString, number>[]): BitField<IntentsString, number>

```

- `bits: BitFieldResolvable<IntentsString, number>[]`

**Returns:** `BitField<IntentsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<IntentsString, number>): boolean

```

- `bit: BitFieldResolvable<IntentsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<IntentsString, number>): boolean

```

- `bit: BitFieldResolvable<IntentsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<IntentsString, number>): boolean

```

- `bit: BitFieldResolvable<IntentsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<IntentsString, number>, hasParams: readonly unknown[]): IntentsString[]

```

- `bits: BitFieldResolvable<IntentsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `IntentsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<IntentsString, number>[]): BitField<IntentsString, number>

```

- `bits: BitFieldResolvable<IntentsString, number>[]`

**Returns:** `BitField<IntentsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<IntentsString, number>): number

```

- `bit?: BitFieldResolvable<IntentsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): IntentsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `IntentsString[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/Intents.ts#L11
