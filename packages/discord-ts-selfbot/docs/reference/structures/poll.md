# Poll

Represents a Poll

```ts

class Poll extends Base

```

## Properties

### `allowMultiselect`

Whether this poll allows multiple answers

**Type:** `boolean`

### `answers`

The answers of this poll

**Type:** `Collection<number, PollAnswer>`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `expiresAt`

The date when this poll expires

**Type:** `unknown`

### `expiresTimestamp`

The timestamp when this poll expires

**Type:** `number`

### `layoutType`

The layout type of this poll

**Type:** `PollLayoutTypes`

### `message`

The message that started this poll

**Type:** `Message` · **Modifiers:** readonly

### `question`

The media for this poll's question

**Type:** `PollQuestionMedia`

### `resultsFinalized`

Whether this poll's results have been precisely counted

**Type:** `boolean`

## Methods

### `end`

Ends this poll.

```ts

end(): Promise<Message<boolean>>

```

**Returns:** `Promise<Message<boolean>>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Poll.ts#L17
