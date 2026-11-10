import { test, describe } from 'bun:test';

import { skip, makeClient, login, makeStepRecorder } from './_helpers';

describe.skipIf(skip)('manual: relationships', () => {
  test('relationship operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      await step('fetch relationships', async () => {
        await client.relationships?.fetch?.();
        console.log(
          '  relationships:',
          client.relationships?.cache?.size ?? 'n/a'
        );
      });
      await step('fetch friends', () => {
        const friends = client.relationships?.cache?.filter?.(
          (relationshipType) => relationshipType === 1
        );
        console.log('  friends:', friends?.size ?? 'n/a');
      });
    } finally {
      client.destroy();
    }
    summary('manual: relationships');
    await writeArtifact('manual-relationships-results');
  }, 120_000);
});
