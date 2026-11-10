# BitField

```ts

class BitField

```

## Constructor

### `constructor`

```ts

constructor<S extends string, N extends number | bigint = number>(bits?: BitFieldResolvable<S, N>): BitField<S, N>

```

- `bits?: BitFieldResolvable<S, N>`

**Returns:** `BitField<S, N>`

## Properties

### `bitfield`

**Type:** `N`

### `FLAGS`

**Type:** `Record<string, number | bigint>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<S>

```

**Returns:** `IterableIterator<S>`

### `add`

```ts

add(bits: BitFieldResolvable<S, N>[]): BitField<S, N>

```

- `bits: BitFieldResolvable<S, N>[]`

**Returns:** `BitField<S, N>`

### `any`

```ts

any(bit: BitFieldResolvable<S, N>): boolean

```

- `bit: BitFieldResolvable<S, N>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<S, N>): boolean

```

- `bit: BitFieldResolvable<S, N>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<S, N>): boolean

```

- `bit: BitFieldResolvable<S, N>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<S, N>, hasParams: readonly unknown[]): S[]

```

- `bits: BitFieldResolvable<S, N>`
- `hasParams: readonly unknown[]`

**Returns:** `S[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<S, N>[]): BitField<S, N>

```

- `bits: BitFieldResolvable<S, N>[]`

**Returns:** `BitField<S, N>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<string, number | bigint>): number | bigint

```

- `bit?: BitFieldResolvable<string, number | bigint>`

**Returns:** `number | bigint`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): S[]

```

- `hasParams: readonly unknown[]`

**Returns:** `S[]`

### `toJSON`

```ts

toJSON(): N extends number ? number : string

```

**Returns:** `N extends number ? number : string`

### `valueOf`

```ts

valueOf(): N

```

**Returns:** `N`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/BitField.ts#L1
