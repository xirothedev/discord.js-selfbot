import { test, describe } from 'bun:test';
import { token, guildId, skip, makeClient, login, makeStepRecorder } from './_helpers';

describe.skipIf(skip)('manual: members', () => {
  test('member operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      if (!guildId) {
        console.log('[SKIP] no TEST_GUILD_ID');
        return;
      }
      await step('fetch self member', async () => {
        const g = await client.guilds.fetch(guildId!);
        const m = await g.members.fetch(client.user!.id);
        if (m.id !== client.user!.id) throw new Error('id mismatch');
      });
      await step('set nickname', async () => {
        const g = await client.guilds.fetch(guildId!);
        const m = await g.members.fetch(client.user!.id);
        await m.setNickname('manual-nick');
        await m.setNickname(null);
      });
      await step('fetch member voice state', async () => {
        const g = await client.guilds.fetch(guildId!);
        const m = await g.members.fetch(client.user!.id);
        // voice state may be null
        console.log('  voice:', m.voice?.channelId ?? 'none');
      });
    } finally {
      client.destroy();
    }
    summary('manual: members');
    await writeArtifact('manual-members-results');
  }, 180_000);
});
