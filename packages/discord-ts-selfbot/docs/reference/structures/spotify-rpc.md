# SpotifyRPC

```ts

class SpotifyRPC extends RichPresence

```

## Constructor

### `constructor`

```ts

constructor(client: Client, data?: object): SpotifyRPC

```

- `client: Client` — Discord Client
- `data?: object`

**Returns:** `SpotifyRPC`

## Properties

### `applicationId`

**Type:** `string | null`

### `assets`

**Type:** `RichPresenceAssets`

### `buttons`

**Type:** `string[]`

### `createdAt`

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

**Type:** `number`

### `details`

**Type:** `string | null`

### `emoji`

**Type:** `APIPartialEmoji | null`

### `flags`

**Type:** `Readonly<ActivityFlags>`

### `id`

**Type:** `string`

### `metadata`

**Type:** `RichPresenceMetadata`

### `name`

**Type:** `string`

### `party`

**Type:** `{ id: string | null; size: [number, number] } | null`

### `platform`

**Type:** `ActivityPlatform | null`

### `presence`

**Type:** `Presence` · **Modifiers:** readonly

### `sessionId`

**Type:** `string | null`

### `state`

**Type:** `string | null`

### `syncId`

**Type:** `string | null`

### `timestamps`

**Type:** `{ end: number | null; start: number | null } | null`

### `type`

**Type:** `"PLAYING" | "STREAMING" | "LISTENING" | "WATCHING" | "CUSTOM" | "COMPETING" | "HANG"`

### `url`

**Type:** `string | null`

## Methods

### `addArtistId`

Add the artist id

```ts

addArtistId(id: string): this

```

- `id: string` — Artist id

**Returns:** `this`

### `addButton`

Add a button to the rich presence

```ts

addButton(name: string, url: string): this

```

- `name: string` — The name of the button
- `url: string` — The url of the button

**Returns:** `this`

### `equals`

```ts

equals(activity: Activity): boolean

```

- `activity: Activity`

**Returns:** `boolean`

### `getExternal`

```ts

static getExternal(client: Client, applicationId: string, images: string[]): Promise<ExternalAssets[]>

```

- `client: Client`
- `applicationId: string`
- `images: string[]`

**Returns:** `Promise<ExternalAssets[]>`

### `setAlbumId`

Set the album id

```ts

setAlbumId(id: string): this

```

- `id: string` — Album id

**Returns:** `this`

### `setApplicationId`

Set the application id of this activity

```ts

setApplicationId(id?: string): this

```

- `id?: string` — Bot's id

**Returns:** `this`

### `setArtistIds`

Set the artist ids

```ts

setArtistIds(ids: string[]): this

```

- `ids: string[]` — Artist ids

**Returns:** `this`

### `setAssetsLargeImage`

Set the large image of this activity

```ts

setAssetsLargeImage(image?: string): this

```

- `image?: string` — The large image asset's id

**Returns:** `this`

### `setAssetsLargeText`

Hover text for the large image

```ts

setAssetsLargeText(text?: string): this

```

- `text?: string` — Assets text

**Returns:** `this`

### `setAssetsSmallImage`

Set the small image of this activity

```ts

setAssetsSmallImage(image?: string): this

```

- `image?: string` — The small image asset's id

**Returns:** `this`

### `setAssetsSmallText`

Hover text for the small image

```ts

setAssetsSmallText(text?: string): this

```

- `text?: string` — Assets text

**Returns:** `this`

### `setButtons`

Set the buttons of the rich presence

```ts

setButtons(button: RichButton[]): this

```

- `button: RichButton[]` — A list of buttons to set

**Returns:** `this`

### `setDetails`

Set the details of the activity

```ts

setDetails(details?: string): this

```

- `details?: string` — The details of the activity

**Returns:** `this`

### `setEndTimestamp`

Sets the end timestamp of the activity

```ts

setEndTimestamp(timestamp: number | Date | null): this

```

- `timestamp: number | Date | null` — The timestamp of the end of the activity

**Returns:** `this`

### `setJoinSecret`

Secrets for rich presence joining and spectating (send-only)

```ts

setJoinSecret(join?: string): this

```

- `join?: string` — Secrets for rich presence joining

**Returns:** `this`

### `setName`

Set the name of the activity

```ts

setName(name?: string): this

```

- `name?: string` — The activity's name

**Returns:** `this`

### `setParty`

Set the party of this activity

```ts

setParty(party?: { current: number; id?: string; max: number }): this

```

- `party?: { current: number; id?: string; max: number }` — The party to be displayed

**Returns:** `this`

### `setPlatform`

The platform the activity is being played on

```ts

setPlatform(platform?: ActivityPlatform): this

```

- `platform?: ActivityPlatform` — Any platform

**Returns:** `this`

### `setSongId`

Set Spotify song id to sync with

```ts

setSongId(id: string): this

```

- `id: string` — Song id

**Returns:** `this`

### `setStartTimestamp`

Sets the start timestamp of the activity

```ts

setStartTimestamp(timestamp: number | Date | null): this

```

- `timestamp: number | Date | null` — The timestamp of the start of the activity

**Returns:** `this`

### `setState`

Set the state of the activity

```ts

setState(state?: string): this

```

- `state?: string` — The state of the activity

**Returns:** `this`

### `setType`

The activity status's type

```ts

setType(type?: "PLAYING" | "STREAMING" | "LISTENING" | "WATCHING" | "CUSTOM" | "COMPETING" | "HANG"): this

```

- `type?: "PLAYING" | "STREAMING" | "LISTENING" | "WATCHING" | "CUSTOM" | "COMPETING" | "HANG"` — The type of activity

**Returns:** `this`

### `setURL`

If the activity is being streamed, a link to the stream

```ts

setURL(url?: string): this

```

- `url?: string` — URL of the stream

**Returns:** `this`

### `toJSON`

Convert the rich presence to a JSON object

```ts

toJSON(): ActivityOptions

```

**Returns:** `ActivityOptions`

### `toString`

When concatenated with a string, this automatically returns the activities' name instead of the Activity object.

```ts

toString(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Presence.ts#L960
