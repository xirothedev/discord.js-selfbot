# ClientVoiceManager

```ts

class ClientVoiceManager

```

## Properties

### `adapters`

**Type:** `Map<string, InternalDiscordGatewayAdapterLibraryMethods>`

### `client`

**Type:** `Client` · **Modifiers:** readonly

### `connection`

**Type:** `VoiceConnection | null`

## Methods

### `joinChannel`

```ts

joinChannel(channel: string | DMChannel | GroupDMChannel | VoiceBasedChannel, config?: JoinChannelConfig): Promise<VoiceConnection>

```

- `channel: string | DMChannel | GroupDMChannel | VoiceBasedChannel`
- `config?: JoinChannelConfig`

**Returns:** `Promise<VoiceConnection>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/client/voice/ClientVoiceManager.ts#L1
