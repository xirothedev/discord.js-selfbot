# InviteStageInstance

Represents the data about a public StageInstance in an Invite.

```ts

class InviteStageInstance extends Base

```

## Properties

### `channel`

The stage channel this invite is for

**Type:** `StageChannel | null` · **Modifiers:** readonly

### `channelId`

The id of the stage channel this invite is for

**Type:** `string`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild of the stage channel this invite is for

**Type:** `Guild | null` · **Modifiers:** readonly

### `guildId`

The stage channel's guild id

**Type:** `string`

### `members`

The members speaking in the stage channel

**Type:** `Collection<string, GuildMember>`

### `participantCount`

The number of users in the stage channel

**Type:** `number`

### `speakerCount`

The number of users speaking in the stage channel

**Type:** `number`

### `topic`

The topic of the stage instance

**Type:** `string`

## Methods

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/InviteStageInstance.ts#L11
