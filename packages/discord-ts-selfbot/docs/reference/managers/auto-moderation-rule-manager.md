# AutoModerationRuleManager

Manages API methods for auto moderation rules and stores their cache.

```ts

class AutoModerationRuleManager extends CachedManager<Snowflake, AutoModerationRule, AutoModerationRuleResolvable>

```

## Properties

### `cache`

The cache of items for this manager.

**Type:** `Collection<string, AutoModerationRule>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this manager belongs to.

**Type:** `Guild`

### `holds`

**Type:** `Constructable<AutoModerationRule>` · **Modifiers:** readonly

## Methods

### `create`

Creates a new auto moderation rule.

```ts

create(options: AutoModerationRuleCreateOptions): Promise<AutoModerationRule>

```

- `options: AutoModerationRuleCreateOptions` — Options for creating the auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `delete`

Deletes an auto moderation rule.

```ts

delete(autoModerationRule: AutoModerationRuleResolvable, reason?: string): Promise<void>

```

- `autoModerationRule: AutoModerationRuleResolvable` — The auto moderation rule to delete
- `reason?: string` — The reason for deleting the auto moderation rule

**Returns:** `Promise<void>`

### `edit`

Edits an auto moderation rule.

```ts

edit(autoModerationRule: AutoModerationRuleResolvable, options: AutoModerationRuleEditOptions): Promise<AutoModerationRule>

```

- `autoModerationRule: AutoModerationRuleResolvable` — The auto moderation rule to edit
- `options: AutoModerationRuleEditOptions` — Options for editing the auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `fetch`

```ts

fetch(options: AutoModerationRuleResolvable | FetchAutoModerationRuleOptions): Promise<AutoModerationRule>

```

- `options: AutoModerationRuleResolvable | FetchAutoModerationRuleOptions`

**Returns:** `Promise<AutoModerationRule>`

```ts

fetch(options?: FetchAutoModerationRulesOptions): Promise<Collection<string, AutoModerationRule>>

```

- `options?: FetchAutoModerationRulesOptions`

**Returns:** `Promise<Collection<string, AutoModerationRule>>`

### `resolve`

Resolves an AutoModerationRuleResolvable to an AutoModerationRule object.

```ts

resolve(resolvable: AutoModerationRule): AutoModerationRule

```

- `resolvable: AutoModerationRule`

**Returns:** `AutoModerationRule`

Resolves an AutoModerationRuleResolvable to an AutoModerationRule object.

```ts

resolve(resolvable: AutoModerationRuleResolvable): AutoModerationRule | null

```

- `resolvable: AutoModerationRuleResolvable`

**Returns:** `AutoModerationRule | null`

### `resolveId`

Resolves an AutoModerationRuleResolvable to a AutoModerationRule id.

```ts

resolveId(resolvable: string | AutoModerationRule): string

```

- `resolvable: string | AutoModerationRule`

**Returns:** `string`

Resolves an AutoModerationRuleResolvable to a AutoModerationRule id.

```ts

resolveId(resolvable: AutoModerationRuleResolvable): string | null

```

- `resolvable: AutoModerationRuleResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, AutoModerationRule>

```

**Returns:** `Collection<string, AutoModerationRule>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/AutoModerationRuleManager.ts#L22
