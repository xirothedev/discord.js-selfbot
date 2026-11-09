import { test, describe } from 'bun:test';
import { token, guildId, skip, makeClient, login, makeStepRecorder } from './_helpers';

describe.skipIf(skip)('manual: guilds', () => {
  test('guild operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      if (!guildId) {
        console.log('[SKIP] no TEST_GUILD_ID');
        return;
      }
      await step('fetch guild', async () => {
        const g = await client.guilds.fetch(guildId!);
        if (g.id !== guildId) throw new Error('id mismatch');
        console.log('  name:', g.name);
      });
      await step('fetch channels', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.channels.fetch();
        if (g.channels.cache.size === 0) throw new Error('no channels');
      });
      await step('fetch members', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.members.fetch();
        if (g.members.cache.size === 0) throw new Error('no members');
      });
      await step('fetch roles', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.roles.fetch();
        if (g.roles.cache.size === 0) throw new Error('no roles');
      });
      await step('fetch emojis', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.emojis.fetch();
      });
      await step('fetch invites', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.invites.fetch();
      });
      await step('fetch scheduled events', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.scheduledEvents.fetch();
      });
      await step('fetch audit log', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.fetchAuditLogs();
      });
      await step('fetch vanity', async () => {
        const g = await client.guilds.fetch(guildId!);
        await g.fetchVanityData();
      });
    } finally {
      client.destroy();
    }
    summary('manual: guilds');
    await writeArtifact('manual-guilds-results');
  }, 180_000);
});
