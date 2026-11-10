# PurchasedFlags

Data structure that makes it easy to interact with an PurchasedFlags#flags bitfield.

```ts

class PurchasedFlags extends BitField<PurchasedFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<PurchasedFlagsString, number>): PurchasedFlags

```

- `bits?: BitFieldResolvable<PurchasedFlagsString, number>` — Bit(s) to read from

**Returns:** `PurchasedFlags`

## Properties

### `bitfield`

**Type:** `number`

### `FLAGS`

Numeric the Discord purchased flags. All available properties:
* `NITRO_CLASSIC`
* `NITRO`
* `GUILD_BOOST`
* `NITRO_BASIC`

**Type:** `Record<PurchasedFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<PurchasedFlagsString>

```

**Returns:** `IterableIterator<PurchasedFlagsString>`

### `add`

```ts

add(bits: BitFieldResolvable<PurchasedFlagsString, number>[]): BitField<PurchasedFlagsString, number>

```

- `bits: BitFieldResolvable<PurchasedFlagsString, number>[]`

**Returns:** `BitField<PurchasedFlagsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<PurchasedFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<PurchasedFlagsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<PurchasedFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<PurchasedFlagsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<PurchasedFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<PurchasedFlagsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<PurchasedFlagsString, number>, hasParams: readonly unknown[]): PurchasedFlagsString[]

```

- `bits: BitFieldResolvable<PurchasedFlagsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `PurchasedFlagsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<PurchasedFlagsString, number>[]): BitField<PurchasedFlagsString, number>

```

- `bits: BitFieldResolvable<PurchasedFlagsString, number>[]`

**Returns:** `BitField<PurchasedFlagsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<PurchasedFlagsString, number>): number

```

- `bit?: BitFieldResolvable<PurchasedFlagsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): PurchasedFlagsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `PurchasedFlagsString[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/PurchasedFlags.ts#L10
