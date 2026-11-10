# BaseClient

The base class for all clients.

```ts

class BaseClient extends EventEmitter

```

## Constructor

### `constructor`

```ts

constructor(options?: ClientOptions | WebhookClientOptions): BaseClient

```

- `options?: ClientOptions | WebhookClientOptions`

**Returns:** `BaseClient`

## Properties

### `api`

**Type:** `unknown` · **Modifiers:** readonly

### `options`

The options the client was instantiated with

**Type:** `ClientOptions | WebhookClientOptions`

### `rest`

**Type:** `RESTManager`

## Methods

### `destroy`

Destroys all assets used by the base client.

```ts

destroy(): void

```

**Returns:** `void`

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

## Events

### `debug`

Emitted for general debugging information.

- `info` — The debug information

### `rateLimit`

Emitted when the client hits a rate limit while making a request

- `rateLimitData` — Object containing the rate limit info

### `apiRequest`

Emitted before every API request.
This event can emit several times for the same request, e.g. when hitting a rate limit.
This is an informational event that is emitted quite frequently,
it is highly recommended to check `request.path` to filter the data.

- `request` — The request that is about to be sent

### `apiResponse`

Emitted after every API request has received a response.
This event does not necessarily correlate to completion of the request, e.g. when hitting a rate limit.
This is an informational event that is emitted quite frequently,
it is highly recommended to check `request.path` to filter the data.

- `request` — The request that triggered this response
- `response` — The response received from the Discord API

### `invalidRequestWarning`

Emitted periodically when the process sends invalid requests to let users avoid the
10k invalid requests in 10 minutes threshold that causes a ban

- `invalidRequestWarningData` — Object containing the invalid request info

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/client/BaseClient.ts#L14
