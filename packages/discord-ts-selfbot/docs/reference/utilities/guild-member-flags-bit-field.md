# GuildMemberFlagsBitField

Data structure that makes it easy to interact with an GuildMember#flags bitfield.

```ts

class GuildMemberFlagsBitField extends BitField<GuildMemberFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<GuildMemberFlagsString, number>): GuildMemberFlags

```

- `bits?: BitFieldResolvable<GuildMemberFlagsString, number>` — Bit(s) to read from

**Returns:** `GuildMemberFlags`

## Properties

### `bitfield`

**Type:** `number`

### `FLAGS`

Numeric guild member flags. All available properties:
* `DID_REJOIN`
* `COMPLETED_ONBOARDING`
* `BYPASSES_VERIFICATION`
* `STARTED_ONBOARDING`

**Type:** `Record<GuildMemberFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<GuildMemberFlagsString>

```

**Returns:** `IterableIterator<GuildMemberFlagsString>`

### `add`

```ts

add(bits: BitFieldResolvable<GuildMemberFlagsString, number>[]): BitField<GuildMemberFlagsString, number>

```

- `bits: BitFieldResolvable<GuildMemberFlagsString, number>[]`

**Returns:** `BitField<GuildMemberFlagsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<GuildMemberFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<GuildMemberFlagsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<GuildMemberFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<GuildMemberFlagsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<GuildMemberFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<GuildMemberFlagsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<GuildMemberFlagsString, number>, hasParams: readonly unknown[]): GuildMemberFlagsString[]

```

- `bits: BitFieldResolvable<GuildMemberFlagsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `GuildMemberFlagsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<GuildMemberFlagsString, number>[]): BitField<GuildMemberFlagsString, number>

```

- `bits: BitFieldResolvable<GuildMemberFlagsString, number>[]`

**Returns:** `BitField<GuildMemberFlagsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<GuildMemberFlagsString, number>): number

```

- `bit?: BitFieldResolvable<GuildMemberFlagsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): GuildMemberFlagsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `GuildMemberFlagsString[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/GuildMemberFlags.ts#L10
