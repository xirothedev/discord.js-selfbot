# OAuth2RoleConnection

Reads and writes application role connections with an OAuth2 access token.

```ts

class OAuth2RoleConnection

```

## Constructor

### `constructor`

```ts

constructor(client: Client, token: string): OAuth2RoleConnection

```

- `client: Client` — The client that owns the REST manager
- `token: string` — An OAuth2 access token with the `role_connections.write` scope

**Returns:** `OAuth2RoleConnection`

## Methods

### `delete`

Deletes the role connection for an application.

```ts

delete(applicationId: string): Promise<void>

```

- `applicationId: string`

**Returns:** `Promise<void>`

### `fetch`

Fetches the role connection for an application.

```ts

fetch(applicationId: string): Promise<ApplicationRoleConnection>

```

- `applicationId: string`

**Returns:** `Promise<ApplicationRoleConnection>`

### `update`

Updates the role connection for an application.

```ts

update(applicationId: string, data: ApplicationRoleConnectionEditData): Promise<ApplicationRoleConnection>

```

- `applicationId: string`
- `data: ApplicationRoleConnectionEditData`

**Returns:** `Promise<ApplicationRoleConnection>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/rest/OAuth2RoleConnection.ts#L1
