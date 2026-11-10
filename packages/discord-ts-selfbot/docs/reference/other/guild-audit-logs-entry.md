# GuildAuditLogsEntry

Audit logs entry.

```ts

class GuildAuditLogsEntry

```

## Properties

### `action`

Specific action type of this entry in its string presentation

**Type:** `TAction`

### `actionType`

The action type of this entry

**Type:** `TActionType`

### `changes`

Specific property changes

**Type:** `AuditLogChange[]`

### `createdAt`

The time this entry was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp this entry was created at

**Type:** `number` · **Modifiers:** readonly

### `executor`

The user that executed this entry

**Type:** `User | null`

### `executorId`

The id of the user that executed this entry

**Type:** `string | null`

### `extra`

Any extra data from the entry

**Type:** `TAction extends keyof GuildAuditLogsEntryExtraField ? GuildAuditLogsEntryExtraField[TAction] : null`

### `id`

The entry's id

**Type:** `string`

### `reason`

The reason of this entry

**Type:** `string | null`

### `target`

The target of this entry

**Type:** `TTargetType extends keyof GuildAuditLogsEntryTargetField<TActionType> ? GuildAuditLogsEntryTargetField<TActionType>[TTargetType] : GuildEmoji | Role | { id: string } | null`

### `targetId`

The id of the target of this entry

**Type:** `string | null`

### `targetType`

The target type of this entry

**Type:** `TTargetType`

## Methods

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildAuditLogs.ts#L410
