import { test, expect, describe } from 'bun:test';
import { setTimeout as sleep } from 'node:timers/promises';

import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '../../src/index';
import {
  deleteChannel,
  errorMessage,
  fetchSendableChannel,
  fetchVoiceChannel,
  login,
  makeClient,
  makeStepRecorder,
} from './_helpers';

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.TEST_GUILD_ID;
const channelId = process.env.TEST_CHANNEL_ID;
const voiceChannelId = process.env.TEST_VOICE_CHANNEL_ID;
const webhookUrl = process.env.TEST_WEBHOOK_URL;

const skip = !token;

describe.skipIf(skip)('manual smoke (real Discord)', () => {
  test('critical paths', async () => {
    const client = makeClient();
    const { results, step, summary, writeArtifact } = makeStepRecorder();
    let createdMessageId: string | null = null;
    let createdThreadId: string | null = null;

    try {
      // 1. login + ready
      await step('login + ready', async () => {
        const user = await login(client);
        expect(typeof user.id).toBe('string');
        console.log('  user:', user.tag ?? user.username);
      });

      if (!guildId || !channelId) {
        console.log(
          '[SKIP] guild/channel steps: TEST_GUILD_ID/TEST_CHANNEL_ID not set'
        );
      } else {
        const targetGuildId = guildId;
        const targetChannelId = channelId;

        // 2. send message
        await step('send message', async () => {
          const channel = await fetchSendableChannel(client, targetChannelId);
          const message = await channel.send('smoke-test: hello');
          expect(typeof message.id).toBe('string');
          expect(message.content).toBe('smoke-test: hello');
          createdMessageId = message.id;
          console.log('  messageId:', message.id);
        });

        // 3. edit message
        await step('edit message', async () => {
          if (!createdMessageId) {
            throw new Error('no message id');
          }
          const channel = await fetchSendableChannel(client, targetChannelId);
          const message = await channel.messages.fetch(createdMessageId);
          const edited = await message.edit('smoke-test: edited');
          expect(edited.content).toBe('smoke-test: edited');
        });

        // 4. embed + components
        await step(
          'send embed + button (best-effort, may be restricted for user accounts)',
          async () => {
            const channel = await fetchSendableChannel(client, targetChannelId);
            const embed = new EmbedBuilder()
              .setTitle('smoke')
              .setDescription('desc');
            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('smoke-btn')
                .setLabel('Click')
                .setStyle(1)
            );
            try {
              const message = await channel.send({
                components: [row],
                embeds: [embed],
              });
              console.log(
                '  embeds:',
                message.embeds.length,
                'components:',
                message.components.length
              );
              await message.delete().catch(() => {});
            } catch (error) {
              console.log('  (restricted/unsupported):', errorMessage(error));
            }
          }
        );

        // 5. reaction
        await step('add/remove reaction', async () => {
          if (!createdMessageId) {
            throw new Error('no message id');
          }
          const { user } = client;
          if (!user) {
            throw new Error('no client user');
          }
          const channel = await fetchSendableChannel(client, targetChannelId);
          const message = await channel.messages.fetch(createdMessageId);
          await message.react('👍');
          await sleep(500);
          const reaction = message.reactions.cache.get('👍');
          expect(reaction).not.toBeUndefined();
          if (!reaction) {
            throw new Error('reaction is missing');
          }
          await reaction.users.remove(user.id);
        });

        // 6. fetch guild + roles + member
        await step('fetch guild/member/roles', async () => {
          const { user } = client;
          if (!user) {
            throw new Error('no client user');
          }
          const guild = await client.guilds.fetch(targetGuildId);
          expect(guild.id).toBe(targetGuildId);
          expect(typeof guild.name).toBe('string');
          const member = await guild.members.fetch(user.id);
          expect(member.id).toBe(user.id);
          console.log('  guild:', guild.name, 'roles:', guild.roles.cache.size);
        });

        // 7. create thread
        await step('create thread', async () => {
          if (!createdMessageId) {
            throw new Error('no message id');
          }
          const channel = await fetchSendableChannel(client, targetChannelId);
          const message = await channel.messages.fetch(createdMessageId);
          const thread = await message.startThread({ name: 'smoke-thread' });
          expect(typeof thread.id).toBe('string');
          createdThreadId = thread.id;
          console.log('  threadId:', thread.id);
        });

        // 8. presence update
        await step('presence update', async () => {
          const { user } = client;
          if (!user) {
            throw new Error('no client user');
          }
          user.setPresence({
            activities: [{ name: 'smoke', type: 0 }],
            status: 'idle',
          });
          await sleep(1000);
        });

        // 9. voice connect
        if (voiceChannelId) {
          const targetVoiceChannelId = voiceChannelId;
          await step('voice connect + leave', async () => {
            const voiceChannel = await fetchVoiceChannel(
              client,
              targetVoiceChannelId
            );
            const connection = await client.voice.joinChannel(voiceChannel, {
              selfDeaf: true,
              selfMute: true,
              selfVideo: false,
            });
            await sleep(3000);
            connection.disconnect();
            console.log('  voice joined');
          });
        }

        // 10. webhook send
        if (webhookUrl) {
          const url = webhookUrl;
          await step('webhook send', async () => {
            const parts = url.split('/');
            const webhookId = parts.at(-2);
            const webhookToken = parts.at(-1);
            if (!webhookId || !webhookToken) {
              throw new Error('TEST_WEBHOOK_URL is malformed');
            }
            const webhook = await client.fetchWebhook(webhookId, webhookToken);
            const message = await webhook.send('smoke: webhook hello');
            expect(
              typeof message.id === 'string' || typeof message === 'string'
            ).toBe(true);
            console.log(
              '  webhook msg:',
              typeof message === 'string' ? message : message.id
            );
          });
        }
      }

      // 11. cleanup
      await step('cleanup', async () => {
        if (createdThreadId) {
          try {
            await deleteChannel(client, createdThreadId);
          } catch {
            // Cleanup is best effort.
          }
        }
        if (createdMessageId && channelId) {
          try {
            const channel = await fetchSendableChannel(client, channelId);
            const message = await channel.messages.fetch(createdMessageId);
            await message.delete();
          } catch {
            // Cleanup is best effort.
          }
        }
      });
    } finally {
      client.destroy();
    }

    summary('SMOKE SUMMARY');
    await writeArtifact('manual-smoke-results');

    const pass = results.filter((result) => result.status === 'PASS').length;
    const fail = results.filter((result) => result.status === 'FAIL').length;
    console.log(
      `\\nSmoke finished: ${pass} pass, ${fail} fail (see above for details)`
    );
  }, 120_000);
});
