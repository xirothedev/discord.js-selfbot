# MessageActionRow

Represents an action row containing message components.

```ts

class MessageActionRow extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor<T extends MessageActionRowComponent | TextInputComponent = MessageActionRowComponent, U = T extends TextInputComponent ? any : any, V = T extends TextInputComponent ? APIActionRowComponent<APIModalActionRowComponent> : APIActionRowComponent<APIMessageActionRowComponent>>(data?: V | MessageActionRow<T, T extends TextInputComponent ? any : any, T extends TextInputComponent ? APIActionRowComponent<APIModalActionRowComponent> : APIActionRowComponent<APIMessageActionRowComponent>> | MessageActionRowOptions<U>): MessageActionRow<T, U, V>

```

- `data?: V | MessageActionRow<T, T extends TextInputComponent ? any : any, T extends TextInputComponent ? APIActionRowComponent<APIModalActionRowComponent> : APIActionRowComponent<APIMessageActionRowComponent>> | MessageActionRowOptions<U>` — MessageActionRow to clone or raw data

**Returns:** `MessageActionRow<T, U, V>`

## Properties

### `components`

The components in this action row

**Type:** `T[]`

### `data`

The data for this component

**Type:** `MessageComponentOptions`

### `id`

The id of this component

**Type:** `number` · **Modifiers:** readonly

### `type`

The type of this component

**Type:** `"ACTION_ROW"`

## Methods

### `addComponents`

Adds components to the action row.

```ts

addComponents(components: U[] | U[][]): this

```

- `components: U[] | U[][]` — The components to add

**Returns:** `this`

### `setComponents`

Sets the components of the action row.

```ts

setComponents(components: U[] | U[][]): this

```

- `components: U[] | U[][]` — The components to set

**Returns:** `this`

### `spliceComponents`

Removes, replaces, and inserts components in the action row.

```ts

spliceComponents(index: number, deleteCount: number, components: U[] | U[][]): this

```

- `index: number` — The index to start at
- `deleteCount: number` — The number of components to remove
- `components: U[] | U[][]` — The replacing components

**Returns:** `this`

### `toJSON`

Transforms the action row to a plain object.

```ts

toJSON(): V

```

**Returns:** `V`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageActionRow.ts#L29
