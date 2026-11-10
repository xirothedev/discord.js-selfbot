# RoleFlagsBitField

Data structure that makes it easy to interact with an GuildMember#flags bitfield.

```ts

class RoleFlagsBitField extends BitField<RoleFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<"IN_PROMPT", number>): RoleFlags

```

- `bits?: BitFieldResolvable<"IN_PROMPT", number>` — Bit(s) to read from

**Returns:** `RoleFlags`

## Properties

### `bitfield`

**Type:** `number`

### `FLAGS`

Numeric guild member flags. All available properties:
* `IN_PROMPT`

**Type:** `Record<RoleFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<"IN_PROMPT">

```

**Returns:** `IterableIterator<"IN_PROMPT">`

### `add`

```ts

add(bits: BitFieldResolvable<"IN_PROMPT", number>[]): BitField<"IN_PROMPT", number>

```

- `bits: BitFieldResolvable<"IN_PROMPT", number>[]`

**Returns:** `BitField<"IN_PROMPT", number>`

### `any`

```ts

any(bit: BitFieldResolvable<"IN_PROMPT", number>): boolean

```

- `bit: BitFieldResolvable<"IN_PROMPT", number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<"IN_PROMPT", number>): boolean

```

- `bit: BitFieldResolvable<"IN_PROMPT", number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<"IN_PROMPT", number>): boolean

```

- `bit: BitFieldResolvable<"IN_PROMPT", number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<"IN_PROMPT", number>, hasParams: readonly unknown[]): "IN_PROMPT"[]

```

- `bits: BitFieldResolvable<"IN_PROMPT", number>`
- `hasParams: readonly unknown[]`

**Returns:** `"IN_PROMPT"[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<"IN_PROMPT", number>[]): BitField<"IN_PROMPT", number>

```

- `bits: BitFieldResolvable<"IN_PROMPT", number>[]`

**Returns:** `BitField<"IN_PROMPT", number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<"IN_PROMPT", number>): number

```

- `bit?: BitFieldResolvable<"IN_PROMPT", number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): "IN_PROMPT"[]

```

- `hasParams: readonly unknown[]`

**Returns:** `"IN_PROMPT"[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/RoleFlags.ts#L10
