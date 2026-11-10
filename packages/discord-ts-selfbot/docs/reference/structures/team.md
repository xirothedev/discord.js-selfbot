# Team

Represents a Client OAuth2 Application Team.

```ts

class Team extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the team was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the team was created at

**Type:** `number` · **Modifiers:** readonly

### `icon`

The Team's icon hash

**Type:** `string | null`

### `id`

**Type:** `string`

### `members`

The Team's members

**Type:** `Collection<string, TeamMember>`

### `name`

The name of the Team

**Type:** `string`

### `owner`

The owner of this team

**Type:** `TeamMember | null` · **Modifiers:** readonly

### `ownerId`

The Team's owner id

**Type:** `string | null`

## Methods

### `iconURL`

A link to the team's icon.

```ts

iconURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): string

```

**Returns:** `string`

```ts
// Logs: Team name: My Team
console.log(`Team name: ${team}`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Team.ts#L13
