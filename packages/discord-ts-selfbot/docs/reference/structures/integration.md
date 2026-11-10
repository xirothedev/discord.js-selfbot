# Integration

Represents a guild integration.

```ts

class Integration extends Base

```

## Properties

### `account`

The account integration information

**Type:** `IntegrationAccount`

### `application`

The application for this integration

**Type:** `IntegrationApplication | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `enabled`

Whether this integration is enabled

**Type:** `boolean`

### `enableEmoticons`

Whether emoticons should be synced for this integration (twitch only currently)

**Type:** `boolean | null`

### `expireBehavior`

The behavior of expiring subscribers

**Type:** `number | undefined`

### `expireGracePeriod`

The grace period before expiring subscribers

**Type:** `number | undefined`

### `guild`

The guild this integration belongs to

**Type:** `Guild`

### `id`

The integration id

**Type:** `string`

### `name`

The integration name

**Type:** `string`

### `revoked`

Whether this integration has been revoked

**Type:** `boolean | null`

### `role`

The role that this integration uses for subscribers

**Type:** `Role | undefined`

### `roles`

All roles that are managed by this integration

**Type:** `Collection<string, Role>` · **Modifiers:** readonly

### `subscriberCount`

How many subscribers this integration has

**Type:** `number | null`

### `syncedAt`

The last time this integration was last synced

**Type:** `number | undefined`

### `syncing`

Whether this integration is syncing

**Type:** `boolean | undefined`

### `type`

The integration type

**Type:** `IntegrationType`

### `user`

The user for this integration

**Type:** `User | null`

## Methods

### `delete`

Deletes this integration.

```ts

delete(reason?: string): Promise<Integration>

```

- `reason?: string` — Reason for deleting this integration

**Returns:** `Promise<Integration>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Integration.ts#L25
