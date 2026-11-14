# REST-only use

Use this page when you only call the HTTP API and never open the gateway.
`login()` always opens a gateway connection. For REST-only work, set the
user token directly and skip `login()`.

## Create a REST client

```ts
import { createRestClient } from '@discord-selfbot/core';

const client = createRestClient({ token: process.env.DISCORD_TOKEN ?? '' });

const me = await client.api.users('@me').get<{ id: string }>();
console.log(me.id);

client.destroy();
```

`createRestClient()` sets `client.token` after it strips a `Bot ` or
`Bearer ` prefix. It never connects the gateway. Treat the token as a
password. Read [Token safety](../getting-started/token-safety.md) first.

Direct assignment works the same way:

```ts
import { Client } from '@discord-selfbot/core';

const client = new Client();
client.token = process.env.DISCORD_TOKEN ?? '';
```

## Typed requests

`client.rest.request()` takes a method, a path, and a `RequestOptions`
object. It returns a typed promise:

```ts
const guilds = await client.rest.request<{ id: string }[]>('get', '/users/@me/guilds');
```

`RequestOptions` fields:

| Field | Use |
| --- | --- |
| `route` | Rate-limit bucket. Derived from the path when empty. |
| `version` | API version for this request. Falls back to `http.version`. |
| `versioned` | Set `false` to skip the `/v9` prefix. |
| `auth` | Set `false` to send no `Authorization` header. |
| `query` | Query object. `null` and `undefined` values are dropped. |
| `data` | JSON body. |
| `files` | Attachments. Sent as multipart form data. |
| `headers` | Extra headers. They replace the defaults per key. |
| `reason` | Audit log reason. Sent as `X-Audit-Log-Reason`. |

The typed router (`client.api.users('@me').get<T>()`) calls the same
method. Prefer the router for Discord routes and `request()` for raw
paths.

## One API version per request

The default is `http.version: 9`. One client can read both v9 and v10.
Pass `version` per request:

```ts
const profile = await client.api.users('@me').profile.get({ version: 9 });
const voice = await client.rest.request('get', '/voice/regions', { version: 10 });
```

## Shut down

```ts
client.destroy();
```

`destroy()` closes the REST dispatcher, clears queued handlers, and stops
the sweep timer. It does not log the account out.

## Next

- [Proxies](proxies.md)
- [Rate limits](rate-limits.md)
- [Errors](errors.md)
