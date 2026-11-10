# DataManager

Manages the API methods of a data model along with a collection of instances.

```ts

abstract class DataManager extends BaseManager

```

## Properties

### `cache`

The cache of items for this manager.

**Type:** `Collection<K, Holds>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<Holds>` · **Modifiers:** readonly

## Methods

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: Holds): Holds

```

- `resolvable: Holds`

**Returns:** `Holds`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: R): Holds | null

```

- `resolvable: R`

**Returns:** `Holds | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: K | Holds): K

```

- `resolvable: K | Holds`

**Returns:** `K`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: R): K | null

```

- `resolvable: R`

**Returns:** `K | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<K, Holds>

```

**Returns:** `Collection<K, Holds>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/DataManager.ts#L17
