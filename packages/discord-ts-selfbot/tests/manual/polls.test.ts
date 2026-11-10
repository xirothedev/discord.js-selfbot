import { test, describe } from 'bun:test';

import {
  channelId,
  fetchGuildTextChannel,
  login,
  makeClient,
  makeStepRecorder,
  skip,
} from './_helpers';

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
      const targetChannelId = channelId;
      await step('create poll', async () => {
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.send({
          poll: {
            allow_multiselect: false,
            answers: [{ text: 'yes' }, { text: 'no' }],
            duration: 1,
            question: { text: 'manual poll?' },
          },
        });
        if (typeof message.id !== 'string') {
          throw new TypeError('no id');
        }
        messageId = message.id;
      });
      await step('cleanup', async () => {
        if (messageId) {
          const channel = await fetchGuildTextChannel(client, targetChannelId);
          const message = await channel.messages.fetch(messageId);
          await message.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary('manual: polls');
    await writeArtifact('manual-polls-results');
  }, 180_000);
});
