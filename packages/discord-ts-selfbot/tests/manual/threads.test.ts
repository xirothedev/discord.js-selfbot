import { test, describe } from 'bun:test';

import {
  channelId,
  fetchSendableChannel,
  fetchThreadChannel,
  login,
  makeClient,
  makeStepRecorder,
  skip,
} from './_helpers';

describe.skipIf(skip)('manual: threads', () => {
  test('thread operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let messageId: string | null = null;
    let threadId: string | null = null;
    try {
      await login(client);
      if (!channelId) {
        console.log('[SKIP] no TEST_CHANNEL_ID');
        return;
      }
      const targetChannelId = channelId;
      await step('create thread from message', async () => {
        const channel = await fetchSendableChannel(client, targetChannelId);
        const message = await channel.send('manual: thread parent');
        messageId = message.id;
        const thread = await message.startThread({ name: 'manual-thread' });
        if (typeof thread.id !== 'string') {
          throw new TypeError('no id');
        }
        threadId = thread.id;
      });
      await step('send in thread', async () => {
        if (!threadId) {
          throw new Error('no thread');
        }
        const thread = await fetchThreadChannel(client, threadId);
        await thread.send('manual: in thread');
      });
      await step('archive thread', async () => {
        if (!threadId) {
          throw new Error('no thread');
        }
        const thread = await fetchThreadChannel(client, threadId);
        await thread.setArchived(true);
        await thread.setArchived(false);
      });
      await step('cleanup', async () => {
        if (threadId) {
          const thread = await fetchThreadChannel(client, threadId);
          await thread.delete();
        }
        if (messageId) {
          const channel = await fetchSendableChannel(client, targetChannelId);
          const message = await channel.messages.fetch(messageId);
          await message.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary('manual: threads');
    await writeArtifact('manual-threads-results');
  }, 180_000);
});
