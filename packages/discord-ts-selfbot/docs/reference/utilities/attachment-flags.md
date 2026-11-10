# AttachmentFlags

Data structure that makes it easy to interact with an GuildMember#flags bitfield.

```ts

class AttachmentFlags extends BitField<AttachmentFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<"IS_REMIX", number>): AttachmentFlags

```

- `bits?: BitFieldResolvable<"IS_REMIX", number>` — Bit(s) to read from

**Returns:** `AttachmentFlags`

## Properties

### `bitfield`

**Type:** `number`

### `FLAGS`

Numeric guild member flags. All available properties:
* `IS_REMIX`

**Type:** `Record<AttachmentFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<"IS_REMIX">

```

**Returns:** `IterableIterator<"IS_REMIX">`

### `add`

```ts

add(bits: BitFieldResolvable<"IS_REMIX", number>[]): BitField<"IS_REMIX", number>

```

- `bits: BitFieldResolvable<"IS_REMIX", number>[]`

**Returns:** `BitField<"IS_REMIX", number>`

### `any`

```ts

any(bit: BitFieldResolvable<"IS_REMIX", number>): boolean

```

- `bit: BitFieldResolvable<"IS_REMIX", number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<"IS_REMIX", number>): boolean

```

- `bit: BitFieldResolvable<"IS_REMIX", number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<"IS_REMIX", number>): boolean

```

- `bit: BitFieldResolvable<"IS_REMIX", number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<"IS_REMIX", number>, hasParams: readonly unknown[]): "IS_REMIX"[]

```

- `bits: BitFieldResolvable<"IS_REMIX", number>`
- `hasParams: readonly unknown[]`

**Returns:** `"IS_REMIX"[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<"IS_REMIX", number>[]): BitField<"IS_REMIX", number>

```

- `bits: BitFieldResolvable<"IS_REMIX", number>[]`

**Returns:** `BitField<"IS_REMIX", number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<"IS_REMIX", number>): number

```

- `bit?: BitFieldResolvable<"IS_REMIX", number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): "IS_REMIX"[]

```

- `hasParams: readonly unknown[]`

**Returns:** `"IS_REMIX"[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/AttachmentFlags.ts#L10
