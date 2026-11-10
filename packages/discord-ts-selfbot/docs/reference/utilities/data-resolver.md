# DataResolver

The DataResolver identifies different objects and tries to resolve a specific piece of information from them.

```ts

class DataResolver extends any

```

## Methods

### `resolveBase64`

Resolves a Base64Resolvable to a Base 64 image.

```ts

static resolveBase64(data: Base64Resolvable): string

```

- `data: Base64Resolvable` — The base 64 resolvable you want to resolve

**Returns:** `string`

### `resolveCode`

Resolves the string to a code based on the passed regex.

```ts

static resolveCode(data: string, regx: RegExp): string

```

- `data: string` — The string to resolve
- `regx: RegExp`

**Returns:** `string`

### `resolveFile`

Resolves a BufferResolvable to a Buffer or a Stream.

```ts

static resolveFile(resource: BufferResolvable | Stream): Promise<Stream | Buffer<ArrayBufferLike>>

```

- `resource: BufferResolvable | Stream` — The buffer or stream resolvable to resolve

**Returns:** `Promise<Stream | Buffer<ArrayBufferLike>>`

### `resolveFileAsBuffer`

Resolves a BufferResolvable to a Buffer.

```ts

static resolveFileAsBuffer(resource: BufferResolvable | Stream): Promise<Buffer<ArrayBufferLike>>

```

- `resource: BufferResolvable | Stream` — The buffer or stream resolvable to resolve

**Returns:** `Promise<Buffer<ArrayBufferLike>>`

### `resolveGuildTemplateCode`

Resolves GuildTemplateResolvable to a template code.

```ts

static resolveGuildTemplateCode(data: string): string

```

- `data: string` — The template resolvable to resolve

**Returns:** `string`

### `resolveImage`

Resolves a Base64Resolvable, a string, or a BufferResolvable to a Base 64 image.

```ts

static resolveImage(resource: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>): Promise<string | null>

```

- `resource: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>`

**Returns:** `Promise<string | null>`

### `resolveInviteCode`

Resolves InviteResolvable to an invite code.

```ts

static resolveInviteCode(data: string): string

```

- `data: string` — The invite resolvable to resolve

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/DataResolver.ts#L19
