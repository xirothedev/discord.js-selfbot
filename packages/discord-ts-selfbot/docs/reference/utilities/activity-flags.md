# ActivityFlags

Data structure that makes it easy to interact with an Activity#flags bitfield.

```ts

class ActivityFlags extends BitField<ActivityFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<ActivityFlagsString, number>): ActivityFlags

```

- `bits?: BitFieldResolvable<ActivityFlagsString, number>` — Bit(s) to read from

**Returns:** `ActivityFlags`

## Properties

### `bitfield`

**Type:** `number`

### `FLAGS`

Numeric activity flags. All available properties:
* `INSTANCE`
* `JOIN`
* `SPECTATE`
* `JOIN_REQUEST`
* `SYNC`
* `PLAY`
* `PARTY_PRIVACY_FRIENDS`
* `PARTY_PRIVACY_VOICE_CHANNEL`
* `EMBEDDED`

**Type:** `Record<ActivityFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<ActivityFlagsString>

```

**Returns:** `IterableIterator<ActivityFlagsString>`

### `add`

```ts

add(bits: BitFieldResolvable<ActivityFlagsString, number>[]): BitField<ActivityFlagsString, number>

```

- `bits: BitFieldResolvable<ActivityFlagsString, number>[]`

**Returns:** `BitField<ActivityFlagsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<ActivityFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<ActivityFlagsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<ActivityFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<ActivityFlagsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<ActivityFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<ActivityFlagsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<ActivityFlagsString, number>, hasParams: readonly unknown[]): ActivityFlagsString[]

```

- `bits: BitFieldResolvable<ActivityFlagsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `ActivityFlagsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<ActivityFlagsString, number>[]): BitField<ActivityFlagsString, number>

```

- `bits: BitFieldResolvable<ActivityFlagsString, number>[]`

**Returns:** `BitField<ActivityFlagsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<ActivityFlagsString, number>): number

```

- `bit?: BitFieldResolvable<ActivityFlagsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): ActivityFlagsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `ActivityFlagsString[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/ActivityFlags.ts#L10
