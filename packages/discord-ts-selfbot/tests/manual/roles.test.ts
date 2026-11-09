import { test, describe } from 'bun:test';
import { token, guildId, skip, makeClient, login, makeStepRecorder } from './_helpers';

describe.skipIf(skip)('manual: roles', () => {
  test('role operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let createdRoleId: string | null = null;
    try {
      await login(client);
      if (!guildId) {
        console.log('[SKIP] no TEST_GUILD_ID');
        return;
      }
      await step('create role', async () => {
        const g = await client.guilds.fetch(guildId!);
        const r = await g.roles.create({ name: 'manual-role', color: 0xff0000 });
        if (typeof r.id !== 'string') throw new Error('no id');
        createdRoleId = r.id;
      });
      await step('edit role', async () => {
        if (!createdRoleId) throw new Error('no role');
        const g = await client.guilds.fetch(guildId!);
        const r = await g.roles.fetch(createdRoleId);
        await r.edit({ name: 'manual-role-edited' });
      });
      await step('delete role', async () => {
        if (!createdRoleId) throw new Error('no role');
        const g = await client.guilds.fetch(guildId!);
        const r = await g.roles.fetch(createdRoleId);
        await r.delete();
        createdRoleId = null;
      });
    } finally {
      if (createdRoleId) {
        try {
          const g = await client.guilds.fetch(guildId!);
          const r = await g.roles.fetch(createdRoleId);
          await r.delete();
        } catch {}
      }
      client.destroy();
    }
    summary('manual: roles');
    await writeArtifact('manual-roles-results');
  }, 180_000);
});
