import { test, describe } from 'bun:test';

import {
  channelId,
  deleteChannel,
  fetchGuildTextChannel,
  fetchSendableChannel,
  guildId,
  login,
  makeClient,
  makeStepRecorder,
  skip,
} from './_helpers';

describe.skipIf(skip)('manual: channels', () => {
  test('channel operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let createdChannelId: string | null = null;
    try {
      await login(client);
      if (!channelId) {
        console.log('[SKIP] no TEST_CHANNEL_ID');
        return;
      }
      const targetChannelId = channelId;
      await step('fetch channel', async () => {
        const channel = await fetchSendableChannel(client, targetChannelId);
        if (channel.id !== targetChannelId) {
          throw new Error('id mismatch');
        }
      });
      await step('edit channel topic', async () => {
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        await channel.edit({ topic: 'manual smoke topic' });
      });
      await step('fetch permissions', async () => {
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        if (!channel.permissionOverwrites) {
          throw new Error('no overwrites');
        }
      });
      await step('create text channel', async () => {
        if (!guildId) {
          throw new Error('no guild');
        }
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.create('manual-smoke-ch', {
          type: 0,
        });
        if (typeof channel.id !== 'string') {
          throw new TypeError('no id');
        }
        createdChannelId = channel.id;
      });
      await step('delete channel', async () => {
        if (!createdChannelId) {
          throw new Error('no channel');
        }
        await deleteChannel(client, createdChannelId);
        createdChannelId = null;
      });
    } finally {
      if (createdChannelId) {
        try {
          await deleteChannel(client, createdChannelId);
        } catch {
          // Cleanup is best effort.
        }
      }
      client.destroy();
    }
    summary('manual: channels');
    await writeArtifact('manual-channels-results');
  }, 180_000);
});
