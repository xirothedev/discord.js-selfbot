import { DEFAULT_READY } from "@discord-ts-selfbot/test-harness";

export const TEST_USER_ID = "900000000000000001";
export const DM_CHANNEL_ID = "900000000000000002";
export const FRIEND_USER_ID = "900000000000000003";

export const TEST_USER = {
  avatar: null,
  bot: false,
  discriminator: "0",
  flags: 0,
  global_name: null,
  id: TEST_USER_ID,
  username: "test",
};

export function readyPayloadWithDM() {
  return {
    ...DEFAULT_READY,
    private_channels: [
      {
        id: DM_CHANNEL_ID,
        recipients: [
          {
            id: FRIEND_USER_ID,
            username: "friend",
            discriminator: "0",
            global_name: null,
            avatar: null,
          },
        ],
        type: 1,
      },
    ],
    user: TEST_USER,
  };
}

export function waitForEvent(emitter, event, timeoutMs = 5000) {
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

export function actionRowWithButton(customId = "test-button") {
  return [
    {
      components: [
        { custom_id: customId, label: "Click me", style: 1, type: 2 },
      ],
      type: 1,
    },
  ];
}

export function rawMessage({
  id = "900000000000000010",
  content = "",
  components,
  ...rest
} = {}) {
  return {
    attachments: [],
    author: TEST_USER,
    channel_id: DM_CHANNEL_ID,
    content,
    edited_timestamp: null,
    embeds: [],
    guild_id: null,
    id,
    mention_everyone: false,
    mention_roles: [],
    mentions: [],
    pinned: false,
    timestamp: new Date().toISOString(),
    tts: false,
    type: 0,
    ...(components ? { components } : {}),
    ...rest,
  };
}

export function rawButtonInteraction({
  id = "900000000000000020",
  messageId = "900000000000000010",
  customId = "test-button",
  ...rest
} = {}) {
  return {
    application_id: "900000000000000099",
    channel_id: DM_CHANNEL_ID,
    data: {
      component_type: 2,
      custom_id: customId,
    },
    guild_id: null,
    guild_locale: null,
    id,
    locale: "en-US",
    message: rawMessage({
      components: actionRowWithButton(customId),
      id: messageId,
    }),
    token: "interaction-token",
    type: 3,
    user: TEST_USER,
    version: 1,
    ...rest,
  };
}

export function dispatchMessage(fake, overrides = {}) {
  const message = rawMessage(overrides);
  fake.sendGatewayPacket({ d: message, op: 0, s: 1, t: "MESSAGE_CREATE" });
  return message;
}

export function dispatchButtonInteraction(fake, overrides = {}) {
  const interaction = rawButtonInteraction(overrides);
  fake.sendGatewayPacket({
    d: interaction,
    op: 0,
    s: 2,
    t: "INTERACTION_CREATE",
  });
  return interaction;
}
