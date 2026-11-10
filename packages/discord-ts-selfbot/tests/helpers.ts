import { DEFAULT_READY } from '@discord-ts-selfbot/test-harness';

export const TEST_USER_ID = '900000000000000001';
export const DM_CHANNEL_ID = '900000000000000002';
export const FRIEND_USER_ID = '900000000000000003';

export const TEST_USER = {
  id: TEST_USER_ID,
  username: 'test',
  discriminator: '0',
  global_name: null,
  avatar: null,
  bot: false,
  flags: 0,
};

export function readyPayloadWithDM() {
  return {
    ...DEFAULT_READY,
    user: TEST_USER,
    private_channels: [
      {
        id: DM_CHANNEL_ID,
        type: 1,
        recipients: [
          {
            id: FRIEND_USER_ID,
            username: 'friend',
            discriminator: '0',
            global_name: null,
            avatar: null,
          },
        ],
      },
    ],
  };
}

export function waitForEvent(emitter, event, timeoutMs = 5_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      emitter.off(event, onEvent);
      reject(new Error(`Timed out waiting for "${event}"`));
    }, timeoutMs);

    const onEvent = (...args) => {
      clearTimeout(timer);
      resolve(args.length === 1 ? args[0] : args);
    };

    emitter.once(event, onEvent);
  });
}

export function actionRowWithButton(customId = 'test-button') {
  return [
    {
      type: 1,
      components: [{ type: 2, custom_id: customId, label: 'Click me', style: 1 }],
    },
  ];
}

export function rawMessage({ id = '900000000000000010', content = '', components, ...rest } = {}) {
  return {
    id,
    channel_id: DM_CHANNEL_ID,
    guild_id: null,
    author: TEST_USER,
    content,
    timestamp: new Date().toISOString(),
    edited_timestamp: null,
    tts: false,
    mention_everyone: false,
    mentions: [],
    mention_roles: [],
    attachments: [],
    embeds: [],
    pinned: false,
    type: 0,
    ...(components ? { components } : {}),
    ...rest,
  };
}

export function rawButtonInteraction({
  id = '900000000000000020',
  messageId = '900000000000000010',
  customId = 'test-button',
  ...rest
} = {}) {
  return {
    id,
    type: 3,
    application_id: '900000000000000099',
    channel_id: DM_CHANNEL_ID,
    guild_id: null,
    user: TEST_USER,
    token: 'interaction-token',
    version: 1,
    locale: 'en-US',
    guild_locale: null,
    data: {
      custom_id: customId,
      component_type: 2,
    },
    message: rawMessage({ id: messageId, components: actionRowWithButton(customId) }),
    ...rest,
  };
}

export function dispatchMessage(fake, overrides = {}) {
  const message = rawMessage(overrides);
  fake.sendGatewayPacket({ op: 0, t: 'MESSAGE_CREATE', s: 1, d: message });
  return message;
}

export function dispatchButtonInteraction(fake, overrides = {}) {
  const interaction = rawButtonInteraction(overrides);
  fake.sendGatewayPacket({ op: 0, t: 'INTERACTION_CREATE', s: 2, d: interaction });
  return interaction;
}
