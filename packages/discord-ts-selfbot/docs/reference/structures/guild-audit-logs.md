# GuildAuditLogs

Audit logs entries are held in this class.

```ts

class GuildAuditLogs

```

## Properties

### `Actions`

All available actions keyed under their names to their numeric values.

**Type:** `GuildAuditLogsActions` · **Modifiers:** static

### `entries`

The entries for this guild's audit logs

**Type:** `Collection<string, GuildAuditLogsEntry<T, T extends keyof GuildAuditLogsIds ? GuildAuditLogsIds[T] : T extends null ? "ALL" : T, T extends keyof GuildAuditLogsIds ? GuildAuditLogsIds[T] : T extends null ? "ALL" : T extends keyof GuildAuditLogsTypes ? GuildAuditLogsTypes[unknown & T extends unknown ? GuildAuditLogsIds[T] : T extends null ? "ALL" : T][1] : "ALL", T extends keyof GuildAuditLogsIds ? GuildAuditLogsIds[T] : T extends null ? "ALL" : T extends keyof GuildAuditLogsTypes ? GuildAuditLogsTypes[unknown & T extends unknown ? GuildAuditLogsIds[T] : T extends null ? "ALL" : T][0] : "UNKNOWN">>`

### `Entry`

**Type:** `typeof GuildAuditLogsEntry` · **Modifiers:** static

### `Targets`

Key mirror of all available audit log targets.

**Type:** `GuildAuditLogsTargets` · **Modifiers:** static

## Methods

### `actionType`

Finds the action type from the entry action.

```ts

static actionType(action: number): GuildAuditLogsActionType

```

- `action: number` — The action target

**Returns:** `GuildAuditLogsActionType`

### `build`

```ts

static build(args: unknown[]): Promise<GuildAuditLogs<"ALL">>

```

- `args: unknown[]`

**Returns:** `Promise<GuildAuditLogs<"ALL">>`

### `targetType`

Finds the target type from the entry action.

```ts

static targetType(target: number): GuildAuditLogsTarget

```

- `target: number` — The action target

**Returns:** `GuildAuditLogsTarget`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildAuditLogs.ts#L192
