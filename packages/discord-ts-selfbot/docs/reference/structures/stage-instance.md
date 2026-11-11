# StageInstance

Represents a stage instance.

```ts

class StageInstance extends Base

```

## Properties

### `channel`

The stage channel associated with this stage instance

**Type:** `StageChannel | null` · **Modifiers:** readonly

### `channelId`

The id of the channel associated with the stage channel

**Type:** `string`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time this stage instance was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp this stage instances was created at

**Type:** `number` · **Modifiers:** readonly

### `deleted`

Whether or not the stage instance has been deleted

**Type:** `boolean`

### `discoverableDisabled`

Whether or not stage discovery is disabled

**Type:** `boolean | null`

### `guild`

The guild this stage instance belongs to

**Type:** `Guild | null` · **Modifiers:** readonly

### `guildId`

The id of the guild associated with the stage channel

**Type:** `string`

### `guildScheduledEvent`

The associated guild scheduled event of this stage instance

**Type:** `unknown`

### `guildScheduledEventId`

The associated guild scheduled event id of this stage instance

**Type:** `string`

### `id`

The stage instance's id

**Type:** `string`

### `inviteCode`

**Type:** `string | null`

### `privacyLevel`

The privacy level of the stage instance

**Type:** `"GUILD_ONLY" | "PUBLIC"`

### `topic`

The topic of the stage instance

**Type:** `string`

## Methods

### `delete`

Deletes this stage instance.

```ts

delete(): Promise<StageInstance>

```

**Returns:** `Promise<StageInstance>`

```ts
// Delete a stage instance
stageInstance.delete()
 .then(stageInstance => console.log(stageInstance))
 .catch(console.error);
```

### `edit`

Edits this stage instance.

```ts

edit(options: StageInstanceEditOptions): Promise<StageInstance>

```

- `options: StageInstanceEditOptions` — The options to edit the stage instance

**Returns:** `Promise<StageInstance>`

```ts
// Edit a stage instance
stageInstance.edit({ topic: 'new topic' })
 .then(stageInstance => console.log(stageInstance))
 .catch(console.error)
```

### `setTopic`

Sets the topic of this stage instance.

```ts

setTopic(topic: string): Promise<StageInstance>

```

- `topic: string` — The topic for the stage instance

**Returns:** `Promise<StageInstance>`

```ts
// Set topic of a stage instance
stageInstance.setTopic('new topic')
 .then(stageInstance => console.log(`Set the topic to: ${stageInstance.topic}`))
 .catch(console.error);
```

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/StageInstance.ts#L24
