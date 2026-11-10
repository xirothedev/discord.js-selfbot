# PollAnswer

Represents an answer to a Poll

```ts

class PollAnswer extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `emoji`

The emoji of this answer

**Type:** `unknown`

### `id`

The id of this answer

**Type:** `number`

### `poll`

The Poll this answer is part of

**Type:** `Poll` · **Modifiers:** readonly

### `text`

The text of this answer

**Type:** `string | null`

### `voteCount`

The amount of votes this answer has

**Type:** `number`

## Methods

### `fetchVoters`

Fetches the users that voted for this answer

```ts

fetchVoters(options?: BaseFetchPollAnswerVotersOptions): Promise<Collection<string, User>>

```

- `options?: BaseFetchPollAnswerVotersOptions` — The options for fetching voters

**Returns:** `Promise<Collection<string, User>>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/PollAnswer.ts#L14
