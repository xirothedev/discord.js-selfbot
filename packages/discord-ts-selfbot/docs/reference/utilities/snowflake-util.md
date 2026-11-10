# SnowflakeUtil

A container for useful snowflake-related methods.

```ts

class SnowflakeUtil extends any

```

## Properties

### `EPOCH`

Discord's epoch value (2015-01-01T00:00:00.000Z).

**Type:** `number` · **Modifiers:** readonly, static

## Methods

### `deconstruct`

Deconstructs a Discord snowflake.

```ts

static deconstruct(snowflake: string): DeconstructedSnowflake

```

- `snowflake: string` — Snowflake to deconstruct

**Returns:** `DeconstructedSnowflake`

### `generate`

Generates a Discord snowflake.
This hardcodes the worker's id as 1 and the process's id as 0.

```ts

static generate(timestamp?: number | Date): string

```

- `timestamp?: number | Date` — Timestamp or date of the snowflake to generate

**Returns:** `string`

### `timestampFrom`

Retrieves the timestamp field's value from a Discord snowflake.

```ts

static timestampFrom(snowflake: string): number

```

- `snowflake: string` — Snowflake to get the timestamp value from

**Returns:** `number`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/SnowflakeUtil.ts#L10
