# Base

Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).

```ts

abstract class Base

```

## Constructor

### `constructor`

```ts

constructor(client: Client): Base

```

- `client: Client`

**Returns:** `Base`

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

## Methods

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Base.ts#L10
