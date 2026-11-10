import { test, describe } from 'bun:test';
import { setTimeout as sleep } from 'node:timers/promises';

import { skip, makeClient, login, makeStepRecorder } from './_helpers';

describe.skipIf(skip)('manual: presence', () => {
  test('presence operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      const user = await login(client);
      await step('set idle presence', async () => {
        user.setPresence({
          activities: [{ name: 'manual', type: 0 }],
          status: 'idle',
        });
        await sleep(1000);
      });
      await step('set dnd presence', async () => {
        user.setPresence({ status: 'dnd' });
        await sleep(1000);
      });
      await step('set online presence', async () => {
        user.setPresence({ activities: [], status: 'online' });
        await sleep(1000);
      });
    } finally {
      client.destroy();
    }
    summary('manual: presence');
    await writeArtifact('manual-presence-results');
  }, 120_000);
});
