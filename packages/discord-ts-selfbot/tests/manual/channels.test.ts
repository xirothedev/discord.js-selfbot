import { test, describe } from 'bun:test';
import { token, channelId, skip, makeClient, login, makeStepRecorder } from './_helpers';

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
      await step('fetch channel', async () => {
        const ch = await client.channels.fetch(channelId!);
        if (ch.id !== channelId) throw new Error('id mismatch');
      });
      await step('edit channel topic', async () => {
        const ch = await client.channels.fetch(channelId!);
        await (ch as any).edit({ topic: 'manual smoke topic' });
      });
      await step('fetch permissions', async () => {
        const ch = await client.channels.fetch(channelId!);
        if (!(ch as any).permissionOverwrites) throw new Error('no overwrites');
      });
      await step('create text channel', async () => {
        if (!process.env.TEST_GUILD_ID) throw new Error('no guild');
        const g = await client.guilds.fetch(process.env.TEST_GUILD_ID!);
        const ch = await g.channels.create('manual-smoke-ch', { type: 0 });
        if (typeof ch.id !== 'string') throw new Error('no id');
        createdChannelId = ch.id;
      });
      await step('delete channel', async () => {
        if (!createdChannelId) throw new Error('no channel');
        const ch = await client.channels.fetch(createdChannelId);
        await (ch as any).delete();
        createdChannelId = null;
      });
    } finally {
      if (createdChannelId) {
        try {
          const ch = await client.channels.fetch(createdChannelId);
          await (ch as any).delete();
        } catch {}
      }
      client.destroy();
    }
    summary('manual: channels');
    await writeArtifact('manual-channels-results');
  }, 180_000);
});
