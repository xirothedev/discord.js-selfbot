# Voice

## Join a channel

```ts
import { Events } from '@discord-selfbot/core';

const channel = client.channels.cache.get('voice-channel-id');
if (!channel) throw new Error('Channel not found.');

const connection = await client.voice.joinChannel(channel, {
  selfMute: false,
  selfDeaf: false,
  selfVideo: false,
});

connection.on('ready', () => {
  console.log(`Connected to ${connection.channel.name}.`);
});

connection.on('error', (error) => {
  console.error('Voice error:', error);
});
```

`client.voice.joinChannel` resolves when the voice gateway and UDP handshake finish. It rejects on a failed connection and clears `client.voice.connection`.

## Play audio

```ts
const dispatcher = connection.playAudio('/absolute/path/audio.mp3', {
  volume: 0.8,
});

dispatcher.on('finish', () => {
  console.log('Audio finished.');
});
```

`playAudio` accepts a file path or a `Readable` stream. When the type is `unknown`, the dispatcher uses ffmpeg to transcode. Set `type: 'opus'`, `'ogg/opus'`, or `'webm/opus'` to skip ffmpeg for already-encoded streams.

## Play video

```ts
connection.playVideo('/absolute/path/video.mp4', {
  fps: 30,
  bitrate: 2000,
});
```

Video playback needs ffmpeg with the H.264 encoder. `playVideo` also accepts a stream. Hardware acceleration is optional; see `VideoOptions` for the ffmpeg preset and input/output arguments.

## Play a stream

```ts
connection.playStream(stream, { type: 'converted' });
```

`playStream` is an alias of `playAudio` for stream input.

## Disconnect

```ts
connection.disconnect();
```

`disconnect()` sends the voice disconnect packet, closes the UDP socket, ends the dispatcher, and emits `disconnect`. The manager clears its reference so the next `joinChannel` creates a new connection.

For a clean shutdown:

```ts
process.once('SIGINT', () => {
  client.voice.connection?.disconnect();
  client.destroy();
  process.exit(0);
});
```

## Limits

- The voice engine is tested at the payload boundary: join packets, state transitions, play input validation, and disconnect cleanup.
- Full codec coverage is future work. Some container/codec combinations may need explicit ffmpeg arguments.
- Streaming video is sensitive to upload bandwidth and CPU.

## Next

- [Calls](calls.md)
- [Recording](recording.md)
- [API: ClientVoiceManager](../reference/voice/client-voice-manager.md)
