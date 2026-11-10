# VoiceState

Represents the voice state for a Guild Member.

```ts

class VoiceState extends Base

```

## Properties

### `channel`

The channel that the member is connected to

**Type:** `DMChannel | GroupDMChannel | VoiceBasedChannel | null` · **Modifiers:** readonly

### `channelId`

The VoiceChannel or StageChannel id the member is in

**Type:** `string | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `deaf`

Whether this member is either self-deafened or server-deafened

**Type:** `boolean | null` · **Modifiers:** readonly

### `guild`

The guild of this voice state

**Type:** `Guild | null`

### `id`

The id of the member of this voice state

**Type:** `string`

### `member`

The member that this voice state belongs to

**Type:** `GuildMember | null` · **Modifiers:** readonly

### `mute`

Whether this member is either self-muted or server-muted

**Type:** `boolean | null` · **Modifiers:** readonly

### `requestToSpeakTimestamp`

The time at which the member requested to speak. This property is specific to stage channels only.

**Type:** `number | null`

### `selfDeaf`

Whether this member is self-deafened

**Type:** `boolean | null`

### `selfMute`

Whether this member is self-muted

**Type:** `boolean | null`

### `selfVideo`

Whether this member's camera is enabled

**Type:** `boolean | null`

### `serverDeaf`

Whether this member is deafened server-wide

**Type:** `boolean | null`

### `serverMute`

Whether this member is muted server-wide

**Type:** `boolean | null`

### `sessionId`

The session id for this member's connection

**Type:** `string | null`

### `streaming`

Whether this member is streaming using "Screen Share"

**Type:** `boolean`

### `suppress`

Whether this member is suppressed from speaking. This property is specific to stage channels only.

**Type:** `boolean`

### `user`

The user that this voice state belongs to

**Type:** `User | null` · **Modifiers:** readonly

## Methods

### `disconnect`

Disconnects the member from the channel.

```ts

disconnect(reason?: string): Promise<GuildMember>

```

- `reason?: string` — Reason for disconnecting the member from the channel

**Returns:** `Promise<GuildMember>`

### `fetch`

Fetches this voice state.

```ts

fetch(force?: boolean): Promise<VoiceState>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<VoiceState>`

### `getPreview`

Get URL Image of the user's streaming video (NOT STREAMING !!!)

```ts

getPreview(): Promise<string>

```

**Returns:** `Promise<string>`

### `postPreview`

Post Preview Image to the client user's streaming video

```ts

postPreview(base64Image: string): Promise<void>

```

- `base64Image: string` — Base64 URI (data:image/jpeg;base64,data)

**Returns:** `Promise<void>`

### `setChannel`

Moves the member to a different channel, or disconnects them from the one they're in.

```ts

setChannel(channel: GuildVoiceChannelResolvable | null, reason?: string): Promise<GuildMember>

```

- `channel: GuildVoiceChannelResolvable | null` — Channel to move the member to, or `null` if you want to disconnect them from voice.
- `reason?: string` — Reason for moving member to another channel or disconnecting

**Returns:** `Promise<GuildMember>`

### `setDeaf`

Deafens/undeafens the member of this voice state.

```ts

setDeaf(deaf?: boolean, reason?: string): Promise<GuildMember>

```

- `deaf?: boolean` — Whether or not the member should be deafened
- `reason?: string` — Reason for deafening or undeafening

**Returns:** `Promise<GuildMember>`

### `setMute`

Mutes/unmutes the member of this voice state.

```ts

setMute(mute?: boolean, reason?: string): Promise<GuildMember>

```

- `mute?: boolean` — Whether or not the member should be muted
- `reason?: string` — Reason for muting or unmuting

**Returns:** `Promise<GuildMember>`

### `setRequestToSpeak`

Toggles the request to speak in the channel.
Only applicable for stage channels and for the client's own voice state.

```ts

setRequestToSpeak(request?: boolean): Promise<void>

```

- `request?: boolean` — Whether or not the client is requesting to become a speaker.

**Returns:** `Promise<void>`

```ts
// Making the client request to speak in a stage channel (raise its hand)
guild.members.me.voice.setRequestToSpeak(true);
```

```ts
// Making the client cancel a request to speak
guild.members.me.voice.setRequestToSpeak(false);
```

### `setStatus`

Sets the status of the voice channel

```ts

setStatus(status?: string): Promise<void>

```

- `status?: string` — The message to set the channel status to

**Returns:** `Promise<void>`

```ts
// Setting the status to something
guild.members.me.voice.setStatus("something")
```

```ts
// Removing the status
guild.members.me.voice.setStatus()
```

### `setSuppressed`

Suppress/unsuppress the user. Only applicable for stage channels.

```ts

setSuppressed(suppressed?: boolean): Promise<void>

```

- `suppressed?: boolean` — Whether or not the user should be suppressed.

**Returns:** `Promise<void>`

```ts
// Making the client a speaker
guild.members.me.voice.setSuppressed(false);
```

```ts
// Making the client an audience member
guild.members.me.voice.setSuppressed(true);
```

```ts
// Inviting another user to speak
voiceState.setSuppressed(false);
```

```ts
// Moving another user to the audience, or cancelling their invite to speak
voiceState.setSuppressed(true);
```

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/VoiceState.ts#L12
