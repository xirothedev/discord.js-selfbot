import { test, describe } from 'bun:test';
import { setTimeout as sleep } from 'node:timers/promises';

import {
  fetchVoiceChannel,
  login,
  makeClient,
  makeStepRecorder,
  skip,
  voiceChannelId,
} from './_helpers';

describe.skipIf(skip)('manual: voice', () => {
  test('voice operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      if (!voiceChannelId) {
        console.log('[SKIP] no TEST_VOICE_CHANNEL_ID');
        return;
      }
      const targetChannelId = voiceChannelId;
      await step('fetch voice channel', async () => {
        const voiceChannel = await fetchVoiceChannel(client, targetChannelId);
        if (voiceChannel.id !== targetChannelId) {
          throw new Error('id mismatch');
        }
      });
      await step('join + leave voice', async () => {
        const voiceChannel = await fetchVoiceChannel(client, targetChannelId);
        const connection = await client.voice.joinChannel(voiceChannel, {
          selfDeaf: true,
          selfMute: true,
          selfVideo: false,
        });
        await sleep(3000);
        connection.disconnect();
      });
    } finally {
      client.destroy();
    }
    summary('manual: voice');
    await writeArtifact('manual-voice-results');
  }, 180_000);
});
