import { on } from "node:events";
import type { EventEmitter } from "node:events";

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
            avatar: null,
            discriminator: "0",
            global_name: null,
            id: FRIEND_USER_ID,
            username: "friend",
          },
        ],
        type: 1,
      },
    ],
    user: TEST_USER,
  };
}

export async function waitForEvent(
  emitter: EventEmitter,
  event: string,
  timeoutMs = 5000
): Promise<unknown> {
  const signal = AbortSignal.timeout(timeoutMs);
  const result = await on(emitter, event, { signal })
    .next()
    .catch((error: unknown) => {
      throw new Error(`Timed out waiting for "${event}"`, { cause: error });
    });
  if (result.done) {
    throw new Error(`Event stream for "${event}" ended without a value`);
  }
  const args = result.value;
  return args.length === 1 ? args[0] : args;
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

// The gateway payload key is `t`, too short for the id-length rule.
const GATEWAY_EVENT_TYPE = "t";

export function gatewayPacket(data: unknown, sequence: number, type: string) {
  return { d: data, op: 0, s: sequence, [GATEWAY_EVENT_TYPE]: type };
}

export function dispatchMessage(fake, overrides = {}) {
  const message = rawMessage(overrides);
  fake.sendGatewayPacket(gatewayPacket(message, 1, "MESSAGE_CREATE"));
  return message;
}

export function dispatchButtonInteraction(fake, overrides = {}) {
  const interaction = rawButtonInteraction(overrides);
  fake.sendGatewayPacket(gatewayPacket(interaction, 2, "INTERACTION_CREATE"));
  return interaction;
}
