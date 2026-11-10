# ThreadMemberFlagsBitField

Data structure that makes it easy to interact with a ThreadMember#flags bitfield.

```ts

class ThreadMemberFlagsBitField extends BitField<ThreadMemberFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<"", number>): ThreadMemberFlags

```

- `bits?: BitFieldResolvable<"", number>` — Bit(s) to read from

**Returns:** `ThreadMemberFlags`

## Properties

### `bitfield`

Bitfield of the packed bits

**Type:** `number`

### `FLAGS`

Numeric thread member flags. There are currently no bitflags relevant to bots for this.

**Type:** `Record<ThreadMemberFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<"">

```

**Returns:** `IterableIterator<"">`

### `add`

```ts

add(bits: BitFieldResolvable<"", number>[]): BitField<"", number>

```

- `bits: BitFieldResolvable<"", number>[]`

**Returns:** `BitField<"", number>`

### `any`

```ts

any(bit: BitFieldResolvable<"", number>): boolean

```

- `bit: BitFieldResolvable<"", number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<"", number>): boolean

```

- `bit: BitFieldResolvable<"", number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<"", number>): boolean

```

- `bit: BitFieldResolvable<"", number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<"", number>, hasParams: readonly unknown[]): ""[]

```

- `bits: BitFieldResolvable<"", number>`
- `hasParams: readonly unknown[]`

**Returns:** `""[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<"", number>[]): BitField<"", number>

```

- `bits: BitFieldResolvable<"", number>[]`

**Returns:** `BitField<"", number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<"", number>): number

```

- `bit?: BitFieldResolvable<"", number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): ""[]

```

- `hasParams: readonly unknown[]`

**Returns:** `""[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/ThreadMemberFlags.ts#L10
