# Formatters

Contains various Discord-specific functions for formatting messages.

```ts

class Formatters extends any

```

## Constructor

### `constructor`

```ts

constructor(): Formatters

```

**Returns:** `Formatters`

## Properties

### `blockQuote`

Formats the content into a block quote. This needs to be at the start of the line for Discord to format it.

**Type:** `unknown` · **Modifiers:** static

### `bold`

Formats the content into bold text.

**Type:** `unknown` · **Modifiers:** static

### `channelMention`

Formats a channel id into a channel mention.

**Type:** `unknown` · **Modifiers:** static

### `codeBlock`

Wraps the content inside a code block with an optional language.

**Type:** `unknown` · **Modifiers:** static

### `formatEmoji`

Formats an emoji id into a fully qualified emoji identifier

**Type:** `unknown` · **Modifiers:** static

### `hideLinkEmbed`

Wraps the URL into `<>`, which stops it from embedding.

**Type:** `unknown` · **Modifiers:** static

### `hyperlink`

Formats the content and the URL into a masked URL with an optional title.

**Type:** `unknown` · **Modifiers:** static

### `inlineCode`

Wraps the content inside \`backticks\`, which formats it as inline code.

**Type:** `unknown` · **Modifiers:** static

### `italic`

Formats the content into italic text.

**Type:** `unknown` · **Modifiers:** static

### `quote`

Formats the content into a quote. This needs to be at the start of the line for Discord to format it.

**Type:** `unknown` · **Modifiers:** static

### `roleMention`

Formats a role id into a role mention.

**Type:** `unknown` · **Modifiers:** static

### `spoiler`

Formats the content into spoiler text.

**Type:** `unknown` · **Modifiers:** static

### `strikethrough`

Formats the content into strike-through text.

**Type:** `unknown` · **Modifiers:** static

### `time`

Formats a date into a short date-time string.

**Type:** `unknown` · **Modifiers:** static

### `TimestampStyles`

The message formatting timestamp
[styles](https://discord.com/developers/docs/reference#message-formatting-timestamp-styles) supported by Discord.

**Type:** `{ FullDateShortTime: "F"; LongDate: "D"; LongDateShortTime: "f"; LongDateTime: "F"; LongTime: "T"; MediumTime: "T"; RelativeTime: "R"; ShortDate: "d"; ShortDateMediumTime: "S"; ShortDateShortTime: "s"; ShortDateTime: "f"; ShortTime: "t" }` · **Modifiers:** static

### `TimestampStylesString`

**Type:** `TimestampStylesString` · **Modifiers:** static

### `underscore`

Formats the content into underscored text.

**Type:** `unknown` · **Modifiers:** static

### `userMention`

Formats a user id into a user mention.

**Type:** `unknown` · **Modifiers:** static

## Methods

### `chatInputApplicationCommandMention`

Formats an application command name, subcommand group name, subcommand name, and ID
into an application command mention

```ts

static chatInputApplicationCommandMention<N extends string, G extends string, S extends string, I extends string>(commandName: N, subcommandGroupName: G, subcommandName: S, commandId: I): `${string}`

```

- `commandName: N` — The name of the application command
- `subcommandGroupName: G`
- `subcommandName: S`
- `commandId: I` — The id of the application command

**Returns:** ``${string}``

Formats an application command name, subcommand group name, subcommand name, and ID
into an application command mention

```ts

static chatInputApplicationCommandMention<N extends string, S extends string, I extends string>(commandName: N, subcommandName: S, commandId: I): `${string}`

```

- `commandName: N` — The name of the application command
- `subcommandName: S`
- `commandId: I` — The id of the application command

**Returns:** ``${string}``

Formats an application command name, subcommand group name, subcommand name, and ID
into an application command mention

```ts

static chatInputApplicationCommandMention<N extends string, I extends string>(commandName: N, commandId: I): `${string}`

```

- `commandName: N` — The name of the application command
- `commandId: I` — The id of the application command

**Returns:** ``${string}``

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/Formatters.ts#L8
