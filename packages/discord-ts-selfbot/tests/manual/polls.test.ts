import { test, describe } from 'bun:test';
import { token, channelId, skip, makeClient, login, makeStepRecorder } from './_helpers';

describe.skipIf(skip)('manual: polls', () => {
  test('poll operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let messageId: string | null = null;
    try {
      await login(client);
      if (!channelId) {
        console.log('[SKIP] no TEST_CHANNEL_ID');
        return;
      }
      await step('create poll', async () => {
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).send({
          poll: {
            question: { text: 'manual poll?' },
            answers: [{ text: 'yes' }, { text: 'no' }],
            duration: 1,
            allow_multiselect: false,
          },
        });
        if (typeof msg.id !== 'string') throw new Error('no id');
        messageId = msg.id;
      });
      await step('cleanup', async () => {
        if (messageId) {
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(messageId);
          await msg.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary('manual: polls');
    await writeArtifact('manual-polls-results');
  }, 180_000);
});
