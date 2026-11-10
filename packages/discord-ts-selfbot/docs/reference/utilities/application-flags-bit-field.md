# ApplicationFlagsBitField

Data structure that makes it easy to interact with a Application#flags bitfield.

```ts

class ApplicationFlagsBitField extends BitField<ApplicationFlagsString>

```

## Constructor

### `constructor`

```ts

constructor(bits?: BitFieldResolvable<ApplicationFlagsString, number>): ApplicationFlags

```

- `bits?: BitFieldResolvable<ApplicationFlagsString, number>` — Bit(s) to read from

**Returns:** `ApplicationFlags`

## Properties

### `bitfield`

Bitfield of the packed bits

**Type:** `number`

### `FLAGS`

Numeric application flags. All available properties:
* `EMBEDDED_RELEASED`
* `MANAGED_EMOJI`
* `GROUP_DM_CREATE`
* `RPC_PRIVATE_BETA`
* `APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE`
* `ALLOW_ASSETS`
* `ALLOW_ACTIVITY_ACTION_SPECTATE`
* `ALLOW_ACTIVITY_ACTION_JOIN_REQUEST`
* `RPC_HAS_CONNECTED`
* `GATEWAY_PRESENCE`
* `GATEWAY_PRESENCE_LIMITED`
* `GATEWAY_GUILD_MEMBERS`
* `GATEWAY_GUILD_MEMBERS_LIMITED`
* `VERIFICATION_PENDING_GUILD_LIMIT`
* `EMBEDDED`
* `GATEWAY_MESSAGE_CONTENT`
* `GATEWAY_MESSAGE_CONTENT_LIMITED`
* `EMBEDDED_FIRST_PARTY`
* `APPLICATION_COMMAND_BADGE`
* `ACTIVE`
* `IFRAME_MODAL`

**Type:** `Record<ApplicationFlagsString, number>` · **Modifiers:** static

## Methods

### `[iterator]`

```ts

[iterator](): IterableIterator<ApplicationFlagsString>

```

**Returns:** `IterableIterator<ApplicationFlagsString>`

### `add`

```ts

add(bits: BitFieldResolvable<ApplicationFlagsString, number>[]): BitField<ApplicationFlagsString, number>

```

- `bits: BitFieldResolvable<ApplicationFlagsString, number>[]`

**Returns:** `BitField<ApplicationFlagsString, number>`

### `any`

```ts

any(bit: BitFieldResolvable<ApplicationFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<ApplicationFlagsString, number>`

**Returns:** `boolean`

### `equals`

```ts

equals(bit: BitFieldResolvable<ApplicationFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<ApplicationFlagsString, number>`

**Returns:** `boolean`

### `freeze`

```ts

freeze(): Readonly<BitField<S, N>>

```

**Returns:** `Readonly<BitField<S, N>>`

### `has`

```ts

has(bit: BitFieldResolvable<ApplicationFlagsString, number>): boolean

```

- `bit: BitFieldResolvable<ApplicationFlagsString, number>`

**Returns:** `boolean`

### `missing`

```ts

missing(bits: BitFieldResolvable<ApplicationFlagsString, number>, hasParams: readonly unknown[]): ApplicationFlagsString[]

```

- `bits: BitFieldResolvable<ApplicationFlagsString, number>`
- `hasParams: readonly unknown[]`

**Returns:** `ApplicationFlagsString[]`

### `remove`

```ts

remove(bits: BitFieldResolvable<ApplicationFlagsString, number>[]): BitField<ApplicationFlagsString, number>

```

- `bits: BitFieldResolvable<ApplicationFlagsString, number>[]`

**Returns:** `BitField<ApplicationFlagsString, number>`

### `resolve`

```ts

static resolve(bit?: BitFieldResolvable<ApplicationFlagsString, number>): number

```

- `bit?: BitFieldResolvable<ApplicationFlagsString, number>`

**Returns:** `number`

### `serialize`

```ts

serialize(hasParams: readonly unknown[]): Record<S, boolean>

```

- `hasParams: readonly unknown[]`

**Returns:** `Record<S, boolean>`

### `toArray`

```ts

toArray(hasParams: readonly unknown[]): ApplicationFlagsString[]

```

- `hasParams: readonly unknown[]`

**Returns:** `ApplicationFlagsString[]`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/ApplicationFlags.ts#L10
