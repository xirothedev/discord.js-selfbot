# TeamMember

Represents a Client OAuth2 Application Team Member.

```ts

class TeamMember extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `id`

The Team Member's id

**Type:** `string` · **Modifiers:** readonly

### `membershipState`

The permissions this Team Member has with regard to the team

**Type:** `"INVITED" | "ACCEPTED"`

### `permissions`

The permissions this Team Member has with regard to the team

**Type:** `string[]`

### `role`

The role of this Team Member

**Type:** `TeamMemberRole`

### `team`

The Team this member is part of

**Type:** `Team`

### `user`

The user for this Team Member

**Type:** `User`

## Methods

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): `${string}`

```

**Returns:** ``${string}``

```ts
// Logs: Team Member's mention: <@123456789012345678>
console.log(`Team Member's mention: ${teamMember}`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/TeamMember.ts#L12
