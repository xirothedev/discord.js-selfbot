import { test, describe } from 'bun:test';
import { token, skip, makeClient, login, makeStepRecorder } from './_helpers';

describe.skipIf(skip)('manual: presence', () => {
  test('presence operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      await step('set idle presence', async () => {
        client.user!.setPresence({ status: 'idle', activities: [{ name: 'manual', type: 0 }] });
        await new Promise(r => setTimeout(r, 1000));
      });
      await step('set dnd presence', async () => {
        client.user!.setPresence({ status: 'dnd' });
        await new Promise(r => setTimeout(r, 1000));
      });
      await step('set online presence', async () => {
        client.user!.setPresence({ status: 'online', activities: [] });
        await new Promise(r => setTimeout(r, 1000));
      });
    } finally {
      client.destroy();
    }
    summary('manual: presence');
    await writeArtifact('manual-presence-results');
  }, 120_000);
});
