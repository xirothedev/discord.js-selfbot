# Util

Contains various general-purpose utility methods.

```ts

class Util extends any

```

## Methods

### `archivedThreadSweepFilter`

Creates a sweep filter that sweeps archived threads

> **Deprecated.** When not using with `makeCache` use `Sweepers.archivedThreadSweepFilter` instead

```ts

static archivedThreadSweepFilter<K, V>(lifetime?: number): SweepFilter<K, V>

```

- `lifetime?: number` — How long a thread has to be archived to be valid for sweeping

**Returns:** `SweepFilter<K, V>`

### `basename`

```ts

static basename(path: string, ext?: string): string

```

- `path: string`
- `ext?: string`

**Returns:** `string`

### `calculateUserDefaultAvatarIndex`

Calculates the default avatar index for a given user id.

```ts

static calculateUserDefaultAvatarIndex(userId: string): number

```

- `userId: string` — The user id to calculate the default avatar index for

**Returns:** `number`

### `cleanCodeBlockContent`

The content to put in a code block with all code block fences replaced by the equivalent backticks.

```ts

static cleanCodeBlockContent(text: string): string

```

- `text: string` — The string to be converted

**Returns:** `string`

### `cleanContent`

The content to have all mentions replaced by the equivalent text.
When Util.removeMentions is removed, this method will no longer sanitize mentions.
Use BaseMessageOptions#allowedMentions instead to prevent mentions when sending a message.

```ts

static cleanContent(str: string, channel: TextBasedChannel): string

```

- `str: string` — The string to be converted
- `channel: TextBasedChannel` — The channel the string was sent in

**Returns:** `string`

### `cloneObject`

```ts

static cloneObject(obj: unknown): unknown

```

- `obj: unknown`

**Returns:** `unknown`

### `discordSort`

Sorts by Discord's position and id.

```ts

static discordSort<K, V extends { id: string; rawPosition: number }>(collection: Collection<K, V>): Collection<K, V>

```

- `collection: Collection<K, V>` — Collection of objects to sort

**Returns:** `Collection<K, V>`

### `escapeBold`

Escapes bold markdown in a string.

```ts

static escapeBold(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeBulletedList`

Escapes bulleted list characters in a string.

```ts

static escapeBulletedList(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeCodeBlock`

Escapes code block markdown in a string.

```ts

static escapeCodeBlock(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeEscape`

Escapes escape characters in a string.

```ts

static escapeEscape(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeHeading`

Escapes heading characters in a string.

```ts

static escapeHeading(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeInlineCode`

Escapes inline code markdown in a string.

```ts

static escapeInlineCode(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeItalic`

Escapes italic markdown in a string.

```ts

static escapeItalic(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeMarkdown`

Escapes any Discord-flavour markdown in a string.

```ts

static escapeMarkdown(text: string, options?: EscapeMarkdownOptions): string

```

- `text: string` — Content to escape
- `options?: EscapeMarkdownOptions` — Options for escaping the markdown

**Returns:** `string`

### `escapeMaskedLink`

Escapes masked link characters in a string.

```ts

static escapeMaskedLink(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeNumberedList`

Escapes numbered list characters in a string.

```ts

static escapeNumberedList(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeSpoiler`

Escapes spoiler markdown in a string.

```ts

static escapeSpoiler(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeStrikethrough`

Escapes strikethrough markdown in a string.

```ts

static escapeStrikethrough(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `escapeUnderline`

Escapes underline markdown in a string.

```ts

static escapeUnderline(text: string): string

```

- `text: string` — Content to escape

**Returns:** `string`

### `fetchRecommendedShards`

```ts

static fetchRecommendedShards(token: string, options?: FetchRecommendedShardsOptions): Promise<number>

```

- `token: string`
- `options?: FetchRecommendedShardsOptions`

**Returns:** `Promise<number>`

### `flatten`

Flatten an object. Any properties that are collections will get converted to an array of keys.

```ts

static flatten(obj: unknown, props: Record<string, string | boolean>[]): unknown

```

- `obj: unknown` — The object to flatten.
- `props: Record<string, string | boolean>[]` — Specific properties to include/exclude.

**Returns:** `unknown`

### `makeError`

```ts

static makeError(obj: MakeErrorOptions): Error

```

- `obj: MakeErrorOptions`

**Returns:** `Error`

### `makePlainError`

```ts

static makePlainError(err: Error): MakeErrorOptions

```

- `err: Error`

**Returns:** `MakeErrorOptions`

### `mergeDefault`

```ts

static mergeDefault(def: unknown, given: unknown): unknown

```

- `def: unknown`
- `given: unknown`

**Returns:** `unknown`

### `moveElementInArray`

```ts

static moveElementInArray(array: unknown[], element: unknown, newIndex: number, offset?: boolean): number

```

- `array: unknown[]`
- `element: unknown`
- `newIndex: number`
- `offset?: boolean`

**Returns:** `number`

### `parseEmoji`

```ts

static parseEmoji(text: string): { animated: boolean; id: string | null; name: string } | null

```

- `text: string`

**Returns:** `{ animated: boolean; id: string | null; name: string } | null`

### `removeMentions`

Breaks user, role and everyone/here mentions by adding a zero width space after every @ character

> **Deprecated.** Use MessageOptions.allowedMentions to control mentions in a message instead.

```ts

static removeMentions(str: string): string

```

- `str: string` — The string to sanitize

**Returns:** `string`

### `resolveAutoArchiveMaxLimit`

Resolves the maximum time a guild's thread channels should automatically archive in case of no recent activity.

> **Deprecated.** This will be removed in the next major version.

```ts

static resolveAutoArchiveMaxLimit(guild: Guild): 1440 | 4320 | 10080

```

- `guild: Guild` — The guild to resolve this limit from.

**Returns:** `1440 | 4320 | 10080`

### `resolveColor`

Resolves a ColorResolvable into a color number.

```ts

static resolveColor(color: ColorResolvable): number

```

- `color: ColorResolvable` — Color to resolve

**Returns:** `number`

### `resolvePartialEmoji`

```ts

static resolvePartialEmoji(emoji: EmojiIdentifierResolvable): Partial<APIPartialEmoji> | null

```

- `emoji: EmojiIdentifierResolvable`

**Returns:** `Partial<APIPartialEmoji> | null`

### `setPosition`

```ts

static setPosition<T extends AnyChannel | Role>(item: T, position: number, relative: boolean, sorted: Collection<string, T>, route: unknown, reason?: string): Promise<{ id: string; position: number }[]>

```

- `item: T`
- `position: number`
- `relative: boolean`
- `sorted: Collection<string, T>`
- `route: unknown`
- `reason?: string`

**Returns:** `Promise<{ id: string; position: number }[]>`

### `splitMessage`

Splits a string into multiple chunks at a designated character that do not exceed a specific length.

> **Deprecated.** This will be removed in the next major version.

```ts

static splitMessage(text: string, options?: SplitOptions): string[]

```

- `text: string` — Content to split
- `options?: SplitOptions` — Options controlling the behavior of the split

**Returns:** `string[]`

### `verifyString`

Verifies the provided data is a string, otherwise throws provided error.

```ts

static verifyString(data: string, error?: ErrorConstructor, errorMessage?: string, allowEmpty?: boolean): string

```

- `data: string` — The string resolvable to resolve
- `error?: ErrorConstructor` — The Error constructor to instantiate. Defaults to Error
- `errorMessage?: string` — The error message to throw with. Defaults to "Expected string, got <data> instead."
- `allowEmpty?: boolean` — Whether an empty string should be allowed

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/Util.ts#L32
