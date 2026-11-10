# AutoModerationRule

Represents an auto moderation rule.

```ts

class AutoModerationRule extends Base

```

## Properties

### `actions`

The actions of this auto moderation rule.

**Type:** `AutoModerationAction[]`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `creatorId`

The user that created this auto moderation rule.

**Type:** `string`

### `enabled`

Whether this auto moderation rule is enabled.

**Type:** `boolean`

### `eventType`

The event type of this auto moderation rule.

**Type:** `"MESSAGE_SEND"`

### `exemptChannels`

**Type:** `Collection<string, GuildBasedChannel>`

### `exemptRoles`

The roles exempt by this auto moderation rule.

**Type:** `Collection<string, Role>`

### `guild`

The guild this auto moderation rule is for.

**Type:** `Guild`

### `id`

The id of this auto moderation rule.

**Type:** `string`

### `name`

The name of this auto moderation rule.

**Type:** `string`

### `triggerMetadata`

The trigger metadata of the rule.

**Type:** `AutoModerationTriggerMetadata`

### `triggerType`

The trigger type of this auto moderation rule.

**Type:** `"KEYWORD" | "SPAM" | "KEYWORD_PRESET" | "MENTION_SPAM"`

## Methods

### `delete`

Deletes this auto moderation rule.

```ts

delete(reason?: string): Promise<void>

```

- `reason?: string` — The reason for deleting this auto moderation rule

**Returns:** `Promise<void>`

### `edit`

Edits this auto moderation rule.

```ts

edit(options: AutoModerationRuleEditOptions): Promise<AutoModerationRule>

```

- `options: AutoModerationRuleEditOptions` — Options for editing this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setActions`

Sets the actions for this auto moderation rule.

```ts

setActions(actions: AutoModerationActionOptions[], reason?: string): Promise<AutoModerationRule>

```

- `actions: AutoModerationActionOptions[]` — The actions of this auto moderation rule
- `reason?: string` — The reason for changing the actions of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setAllowList`

Sets the allow list for this auto moderation rule.

```ts

setAllowList(allowList: string[], reason?: string): Promise<AutoModerationRule>

```

- `allowList: string[]` — The allow list of this auto moderation rule
- `reason?: string` — The reason for changing the allow list of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setEnabled`

Sets whether this auto moderation rule should be enabled.

```ts

setEnabled(enabled?: boolean, reason?: string): Promise<AutoModerationRule>

```

- `enabled?: boolean` — Whether to enable this auto moderation rule
- `reason?: string` — The reason for enabling or disabling this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setEventType`

Sets the event type for this auto moderation rule.

```ts

setEventType(eventType: AutoModerationRuleEventTypes | "MESSAGE_SEND", reason?: string): Promise<AutoModerationRule>

```

- `eventType: AutoModerationRuleEventTypes | "MESSAGE_SEND"` — The event type of this auto moderation rule
- `reason?: string` — The reason for changing the event type of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setExemptChannels`

Sets the exempt channels for this auto moderation rule.

```ts

setExemptChannels(channels: Collection<string, GuildBasedChannel> | GuildChannelResolvable[], reason?: string): Promise<AutoModerationRule>

```

- `channels: Collection<string, GuildBasedChannel> | GuildChannelResolvable[]`
- `reason?: string` — The reason for changing the exempt channels of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setExemptRoles`

Sets the exempt roles for this auto moderation rule.

```ts

setExemptRoles(roles: Collection<string, Role> | RoleResolvable[], reason?: string): Promise<AutoModerationRule>

```

- `roles: Collection<string, Role> | RoleResolvable[]`
- `reason?: string` — The reason for changing the exempt roles of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setKeywordFilter`

Sets the keyword filter for this auto moderation rule.

```ts

setKeywordFilter(keywordFilter: string[], reason?: string): Promise<AutoModerationRule>

```

- `keywordFilter: string[]` — The keyword filter of this auto moderation rule
- `reason?: string` — The reason for changing the keyword filter of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setMentionRaidProtectionEnabled`

Sets whether to enable mention raid protection for this auto moderation rule.

```ts

setMentionRaidProtectionEnabled(mentionRaidProtectionEnabled: boolean, reason?: string): Promise<AutoModerationRule>

```

- `mentionRaidProtectionEnabled: boolean` — Whether to enable mention raid protection for this auto moderation rule
- `reason?: string` — The reason for changing the mention raid protection of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setMentionTotalLimit`

Sets the mention total limit for this auto moderation rule.

```ts

setMentionTotalLimit(mentionTotalLimit: number, reason?: string): Promise<AutoModerationRule>

```

- `mentionTotalLimit: number` — The mention total limit of this auto moderation rule
- `reason?: string` — The reason for changing the mention total limit of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setName`

Sets the name for this auto moderation rule.

```ts

setName(name: string, reason?: string): Promise<AutoModerationRule>

```

- `name: string` — The name of this auto moderation rule
- `reason?: string` — The reason for changing the name of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setPresets`

Sets the presets for this auto moderation rule.

```ts

setPresets(presets: ("PROFANITY" | "SEXUAL_CONTENT" | "SLURS")[], reason?: string): Promise<AutoModerationRule>

```

- `presets: ("PROFANITY" | "SEXUAL_CONTENT" | "SLURS")[]` — The presets of this auto moderation rule
- `reason?: string` — The reason for changing the presets of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

### `setRegexPatterns`

Sets the regular expression patterns for this auto moderation rule.

```ts

setRegexPatterns(regexPatterns: string[], reason?: string): Promise<AutoModerationRule>

```

- `regexPatterns: string[]` — The regular expression patterns of this auto moderation rule Only Rust-flavored regular expressions are supported.
- `reason?: string` — The reason for changing the regular expression patterns of this auto moderation rule

**Returns:** `Promise<AutoModerationRule>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/AutoModerationRule.ts#L13
