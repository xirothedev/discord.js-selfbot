# GuildScheduledEvent

Represents a scheduled event in a Guild.

```ts

class GuildScheduledEvent extends Base

```

## Properties

### `channel`

The channel associated with this scheduled event

**Type:** `StageChannel | VoiceChannel | null` · **Modifiers:** readonly

### `channelId`

The channel id in which the scheduled event will be hosted, or `null` if entity type is `EXTERNAL`

**Type:** `string | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the guild scheduled event was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the guild scheduled event was created at

**Type:** `number` · **Modifiers:** readonly

### `creator`

The user that created this guild scheduled event

**Type:** `User | null`

### `creatorId`

The id of the user that created this guild scheduled event

**Type:** `string | null`

### `description`

The description of the guild scheduled event

**Type:** `string | null`

### `entityId`

The id of the hosting entity associated with the scheduled event

**Type:** `string | null`

### `entityMetadata`

Additional metadata

**Type:** `GuildScheduledEventEntityMetadata`

### `entityType`

The type of hosting entity associated with the scheduled event

**Type:** `"STAGE_INSTANCE" | "VOICE" | "EXTERNAL"`

### `guild`

The guild this scheduled event belongs to

**Type:** `Guild | null` · **Modifiers:** readonly

### `guildId`

The id of the guild this guild scheduled event belongs to

**Type:** `string`

### `id`

The id of the guild scheduled event

**Type:** `string`

### `image`

The cover image hash for this scheduled event

**Type:** `string | null` · **Modifiers:** readonly

### `name`

The name of the guild scheduled event

**Type:** `string`

### `partial`

Whether this guild scheduled event is partial.

**Type:** `false` · **Modifiers:** readonly

### `privacyLevel`

The privacy level of the guild scheduled event

**Type:** `"GUILD_ONLY"`

### `recurrenceRule`

The recurrence rule for this scheduled event

**Type:** `GuildScheduledEventRecurrenceRule | null`

### `scheduledEndAt`

The time the guild scheduled event will end at,
or `null` if the event does not have a scheduled time to end

**Type:** `Date | null` · **Modifiers:** readonly

### `scheduledEndTimestamp`

The timestamp the guild scheduled event will end at
or `null` if the event does not have a scheduled time to end

**Type:** `number | null`

### `scheduledStartAt`

The time the guild scheduled event will start at

**Type:** `Date` · **Modifiers:** readonly

### `scheduledStartTimestamp`

The timestamp the guild scheduled event will start at
This can be potentially `null` only when it's an AuditLogEntryTarget

**Type:** `number | null`

### `status`

The status of the guild scheduled event

**Type:** `S`

### `url`

The URL to the guild scheduled event

**Type:** `string` · **Modifiers:** readonly

### `userCount`

The number of users who are subscribed to this guild scheduled event

**Type:** `number | null`

## Methods

### `coverImageURL`

The URL of this scheduled event's cover image

```ts

coverImageURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for image URL

**Returns:** `string | null`

### `createInviteURL`

Creates an invite URL to this guild scheduled event.

```ts

createInviteURL(options?: CreateGuildScheduledEventInviteURLOptions): Promise<string>

```

- `options?: CreateGuildScheduledEventInviteURLOptions` — The options to create the invite

**Returns:** `Promise<string>`

### `delete`

Deletes this guild scheduled event.

```ts

delete(): Promise<GuildScheduledEvent<S>>

```

**Returns:** `Promise<GuildScheduledEvent<S>>`

```ts
// Delete a guild scheduled event
guildScheduledEvent.delete()
 .then(guildScheduledEvent => console.log(guildScheduledEvent))
 .catch(console.error);
```

### `edit`

Edits this guild scheduled event.

```ts

edit<T extends "ACTIVE" | "COMPLETED" | "CANCELED">(options: GuildScheduledEventEditOptions<S, T>): Promise<GuildScheduledEvent<T>>

```

- `options: GuildScheduledEventEditOptions<S, T>` — The options to edit the guild scheduled event

**Returns:** `Promise<GuildScheduledEvent<T>>`

```ts
// Edit a guild scheduled event
guildScheduledEvent.edit({ name: 'Party' })
 .then(guildScheduledEvent => console.log(guildScheduledEvent))
 .catch(console.error);
```

### `fetch`

Fetches this guild scheduled event.

```ts

fetch(force?: boolean): Promise<GuildScheduledEvent<S>>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<GuildScheduledEvent<S>>`

### `fetchSubscribers`

Fetches subscribers of this guild scheduled event.

```ts

fetchSubscribers<T extends FetchGuildScheduledEventSubscribersOptions>(options?: T): Promise<GuildScheduledEventManagerFetchSubscribersResult<T>>

```

- `options?: T` — Options for fetching the subscribers

**Returns:** `Promise<GuildScheduledEventManagerFetchSubscribersResult<T>>`

### `isActive`

Indicates whether this guild scheduled event has an `ACTIVE` status.

```ts

isActive(): this

```

**Returns:** `this`

### `isCanceled`

Indicates whether this guild scheduled event has a `CANCELED` status.

```ts

isCanceled(): this

```

**Returns:** `this`

### `isCompleted`

Indicates whether this guild scheduled event has a `COMPLETED` status.

```ts

isCompleted(): this

```

**Returns:** `this`

### `isScheduled`

Indicates whether this guild scheduled event has a `SCHEDULED` status.

```ts

isScheduled(): this

```

**Returns:** `this`

### `setDescription`

Sets the new description of the guild scheduled event.

```ts

setDescription(description: string, reason?: string): Promise<GuildScheduledEvent<S>>

```

- `description: string` — The description of the guild scheduled event
- `reason?: string` — The reason for changing the description

**Returns:** `Promise<GuildScheduledEvent<S>>`

```ts
// Set description of a guild scheduled event
guildScheduledEvent.setDescription('A virtual birthday party')
 .then(guildScheduledEvent => console.log(`Set the description to: ${guildScheduledEvent.description}`))
 .catch(console.error);
```

### `setLocation`

Sets the new location of the guild scheduled event.

```ts

setLocation(location: string, reason?: string): Promise<GuildScheduledEvent<S>>

```

- `location: string` — The location of the guild scheduled event
- `reason?: string` — The reason for changing the location

**Returns:** `Promise<GuildScheduledEvent<S>>`

```ts
// Set location of a guild scheduled event
guildScheduledEvent.setLocation('Earth')
 .then(guildScheduledEvent => console.log(`Set the location to: ${guildScheduledEvent.entityMetadata.location}`))
 .catch(console.error);
```

### `setName`

Sets a new name for the guild scheduled event.

```ts

setName(name: string, reason?: string): Promise<GuildScheduledEvent<S>>

```

- `name: string` — The new name of the guild scheduled event
- `reason?: string` — The reason for changing the name

**Returns:** `Promise<GuildScheduledEvent<S>>`

```ts
// Set name of a guild scheduled event
guildScheduledEvent.setName('Birthday Party')
 .then(guildScheduledEvent => console.log(`Set the name to: ${guildScheduledEvent.name}`))
 .catch(console.error);
```

### `setScheduledEndTime`

Sets a new time to end the event at.

```ts

setScheduledEndTime(scheduledEndTime: DateResolvable, reason?: string): Promise<GuildScheduledEvent<S>>

```

- `scheduledEndTime: DateResolvable` — The time to end the event at
- `reason?: string` — The reason for changing the scheduled end time

**Returns:** `Promise<GuildScheduledEvent<S>>`

```ts
// Set end time of a guild scheduled event
guildScheduledEvent.setScheduledEndTime('2022-09-25T00:00:00+05:30')
 .then(guildScheduledEvent => console.log(`Set the end time to: ${guildScheduledEvent.scheduledEndTime}`))
 .catch(console.error);
```

### `setScheduledStartTime`

Sets a new time to schedule the event at.

```ts

setScheduledStartTime(scheduledStartTime: DateResolvable, reason?: string): Promise<GuildScheduledEvent<S>>

```

- `scheduledStartTime: DateResolvable` — The time to schedule the event at
- `reason?: string` — The reason for changing the scheduled start time

**Returns:** `Promise<GuildScheduledEvent<S>>`

```ts
// Set start time of a guild scheduled event
guildScheduledEvent.setScheduledStartTime('2022-09-24T00:00:00+05:30')
 .then(guildScheduledEvent => console.log(`Set the start time to: ${guildScheduledEvent.scheduledStartTime}`))
 .catch(console.error);
```

### `setStatus`

Sets the new status of the guild scheduled event.
If you're working with TypeScript, use this method in conjunction with status type-guards
like GuildScheduledEvent#isScheduled to get only valid status as suggestion

```ts

setStatus<T extends "ACTIVE" | "COMPLETED" | "CANCELED">(status: T, reason?: string): Promise<GuildScheduledEvent<T>>

```

- `status: T` — The status of the guild scheduled event
- `reason?: string` — The reason for changing the status

**Returns:** `Promise<GuildScheduledEvent<T>>`

```ts
// Set status of a guild scheduled event
guildScheduledEvent.setStatus('ACTIVE')
 .then(guildScheduledEvent => console.log(`Set the status to: ${guildScheduledEvent.status}`))
 .catch(console.error);
```

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): string

```

**Returns:** `string`

```ts
// Logs: Event: https://discord.com/events/412345678901234567/499876543211234567
console.log(`Event: ${guildScheduledEvent}`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildScheduledEvent.ts#L15
