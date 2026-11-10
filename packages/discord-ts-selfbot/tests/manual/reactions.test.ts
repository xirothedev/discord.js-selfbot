import { test, describe } from 'bun:test';

import {
  channelId,
  fetchGuildTextChannel,
  login,
  makeClient,
  makeStepRecorder,
  skip,
} from './_helpers';

describe.skipIf(skip)('manual: reactions', () => {
  test('reaction operations', async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let messageId: string | null = null;
    try {
      const user = await login(client);
      if (!channelId) {
        console.log('[SKIP] no TEST_CHANNEL_ID');
        return;
      }
      const targetChannelId = channelId;
      await step('send + react', async () => {
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.send('manual: react target');
        messageId = message.id;
        await message.react('👍');
      });
      await step('fetch reaction users', async () => {
        if (!messageId) {
          throw new Error('no msg');
        }
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.messages.fetch(messageId);
        const reaction = message.reactions.cache.get('👍');
        if (!reaction) {
          throw new Error('reaction missing');
        }
        await reaction.users.fetch();
      });
      await step('remove reaction', async () => {
        if (!messageId) {
          throw new Error('no msg');
        }
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.messages.fetch(messageId);
        const reaction = message.reactions.cache.get('👍');
        if (reaction) {
          await reaction.users.remove(user.id);
        }
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
    summary('manual: reactions');
    await writeArtifact('manual-reactions-results');
  }, 180_000);
});
