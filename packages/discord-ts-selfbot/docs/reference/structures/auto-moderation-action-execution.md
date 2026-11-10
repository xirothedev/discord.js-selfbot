# AutoModerationActionExecution

Represents the structure of an executed action when an AutoModerationRule is triggered.

```ts

class AutoModerationActionExecution

```

## Properties

### `action`

The action that was executed.

**Type:** `AutoModerationAction`

### `alertSystemMessageId`

The id of any system auto moderation messages posted as a result of this action.

**Type:** `string | null`

### `autoModerationRule`

The auto moderation rule this action belongs to.

**Type:** `unknown`

### `channelId`

The id of the channel where this action was triggered from.

**Type:** `string | null`

### `content`

The content that triggered this action.
This property requires the Intents.FLAGS.MESSAGE_CONTENT privileged gateway intent.

**Type:** `string`

### `guild`

The guild where this action was executed from.

**Type:** `Guild`

### `matchedContent`

The substring in content that triggered this action.

**Type:** `string | null`

### `matchedKeyword`

The word or phrase configured in the rule that triggered this action.

**Type:** `string | null`

### `messageId`

The id of the message that triggered this action.

**Type:** `string | null`

### `ruleId`

The id of the auto moderation rule this action belongs to.

**Type:** `string`

### `ruleTriggerType`

The trigger type of the auto moderation rule which was triggered.

**Type:** `"KEYWORD" | "SPAM" | "KEYWORD_PRESET" | "MENTION_SPAM"`

### `userId`

The id of the user that triggered this action.

**Type:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/AutoModerationActionExecution.ts#L10
