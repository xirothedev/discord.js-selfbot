# VoiceChannelEffect

Represents an effect used in a VoiceChannel.

```ts

class VoiceChannelEffect

```

## Properties

### `animationId`

The animation id of the effect.

**Type:** `number | null`

### `animationType`

The animation type of the effect.

**Type:** `VoiceChannelEffectSendAnimationType | null`

### `channel`

The channel the effect was sent in.

**Type:** `unknown`

### `channelId`

The id of the channel the effect was sent in.

**Type:** `string`

### `emoji`

The emoji of the effect.

**Type:** `Emoji | null`

### `guild`

The guild where the effect was sent from.

**Type:** `Guild`

### `soundId`

The id of the soundboard sound for soundboard effects.

**Type:** `string | number | null`

### `soundVolume`

The volume of the soundboard sound [0-1] for soundboard effects.

**Type:** `number | null`

### `userId`

The id of the user that sent the effect.

**Type:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/VoiceChannelEffect.ts#L10
