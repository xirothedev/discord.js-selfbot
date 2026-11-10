# Modal

Represents a modal (form) to be shown in response to an interaction

```ts

class Modal

```

## Constructor

### `constructor`

```ts

constructor(data?: Modal | ModalOptions): Modal

```

- `data?: Modal | ModalOptions` — Modal to clone or raw data

**Returns:** `Modal`

## Properties

### `channel`

The channel that the message was sent in

**Type:** `TextBasedChannel` · **Modifiers:** readonly

### `channelId`

The id of the channel the message was sent in

**Type:** `string`

### `components`

A list of MessageActionRows in the modal

**Type:** `MessageActionRow<TextInputComponent, any, APIActionRowComponent<APIModalActionRowComponent>>[]`

### `customId`

A unique string to be sent in the interaction when submitted

**Type:** `string | null`

### `guild`

The guild the message was sent in (if in a guild channel)

**Type:** `Guild | null` · **Modifiers:** readonly

### `guildId`

The id of the guild the message was sent in, if any

**Type:** `string | null` · **Modifiers:** readonly

### `isMessage`

Check data

**Type:** `false` · **Modifiers:** readonly

### `replied`

Whether this interaction has already been replied to

**Type:** `boolean` · **Modifiers:** readonly

### `title`

The title to be displayed on this modal

**Type:** `string | null`

## Methods

### `reply`

Reply to this modal with data. (Event only)

```ts

reply(): Promise<Modal | Message<boolean>>

```

**Returns:** `Promise<Modal | Message<boolean>>`

```ts
client.on('interactionModalCreate', modal => {
   // Modal > ActionRow > TextInput
   modal.components[0].components[0].setValue('1+1');
   modal.components[1].components[0].setValue('hello');
   modal.reply();
})
```

### `toJSON`

```ts

toJSON(): APIModalSubmitInteraction

```

**Returns:** `APIModalSubmitInteraction`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Modal.ts#L16
