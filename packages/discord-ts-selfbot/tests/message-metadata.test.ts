import { afterAll, beforeAll, expect, test } from "bun:test";

import { startFakeDiscord } from "@discord-ts-selfbot/test-harness";

import { Client } from "../src/index";
import {
  FRIEND_USER_ID,
  TEST_USER,
  TEST_USER_ID,
  dispatchMessage,
  readyPayloadWithDM,
  waitForEvent,
} from "./helpers";

let fake;
let client;

beforeAll(async () => {
  fake = startFakeDiscord({ readyPayload: readyPayloadWithDM() });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login("fake-token");
  await fake.waitForShard();
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

async function createMessage(overrides) {
  const messagePromise = waitForEvent(client, "messageCreate");
  dispatchMessage(fake, overrides);
  return messagePromise;
}

test("Message parses interactionMetadata and resolved from a raw MESSAGE_CREATE payload", async () => {
  const message = await createMessage({
    id: "900000000000000030",
    interaction_metadata: {
      authorizing_integration_owners: {
        0: "900000000000000040",
        1: TEST_USER_ID,
      },
      id: "900000000000000031",
      interacted_message_id: "900000000000000033",
      original_response_message_id: "900000000000000032",
      triggering_interaction_metadata: {
        authorizing_integration_owners: {
          1: TEST_USER_ID,
        },
        id: "900000000000000034",
        type: 2,
        user: TEST_USER,
      },
      type: 3,
      user: TEST_USER,
    },
    resolved: {
      attachments: [
        {
          filename: "resolved.txt",
          id: "900000000000000044",
          size: 12,
          url: "https://cdn.discordapp.com/attachments/1/2/resolved.txt",
        },
      ],
      channels: {
        "900000000000000042": {
          id: "900000000000000042",
          recipients: [
            {
              avatar: null,
              discriminator: "0",
              id: FRIEND_USER_ID,
              username: "friend",
            },
          ],
          type: 1,
        },
      },
      members: {
        [FRIEND_USER_ID]: {
          joined_at: "2024-01-01T00:00:00.000Z",
          nick: "buddy",
          roles: [],
        },
      },
      messages: {
        "900000000000000043": {
          attachments: [],
          author: TEST_USER,
          channel_id: "900000000000000002",
          content: "resolved message",
          edited_timestamp: null,
          embeds: [],
          id: "900000000000000043",
          mention_everyone: false,
          mention_roles: [],
          mentions: [],
          pinned: false,
          timestamp: "2024-01-01T00:00:00.000Z",
          tts: false,
          type: 0,
        },
      },
      roles: {
        "900000000000000041": {
          color: 0,
          hoist: false,
          id: "900000000000000041",
          managed: false,
          mentionable: false,
          name: "Resolved Role",
          permissions: "0",
          position: 1,
        },
      },
      users: {
        [TEST_USER_ID]: TEST_USER,
        [FRIEND_USER_ID]: {
          avatar: null,
          discriminator: "0",
          global_name: null,
          id: FRIEND_USER_ID,
          username: "friend",
        },
      },
    },
  });

  const metadata = message.interactionMetadata;
  expect(metadata).not.toBeNull();
  expect(metadata.id).toBe("900000000000000031");
  expect(metadata.type).toBe("MESSAGE_COMPONENT");
  expect(metadata.user.id).toBe(TEST_USER_ID);
  expect(metadata.authorizingIntegrationOwners.guildId).toBe(
    "900000000000000040"
  );
  expect(metadata.authorizingIntegrationOwners.userId).toBe(TEST_USER_ID);
  expect(metadata.authorizingIntegrationOwners.toJSON()).toEqual({
    0: "900000000000000040",
    1: TEST_USER_ID,
  });
  expect(metadata.originalResponseMessageId).toBe("900000000000000032");
  expect(metadata.interactedMessageId).toBe("900000000000000033");
  expect(metadata.triggeringInteractionMetadata.id).toBe("900000000000000034");
  expect(metadata.triggeringInteractionMetadata.type).toBe(
    "APPLICATION_COMMAND"
  );
  expect(metadata.triggeringInteractionMetadata.user.id).toBe(TEST_USER_ID);
  expect(
    metadata.triggeringInteractionMetadata.originalResponseMessageId
  ).toBeNull();

  expect(message.interaction).toBeNull();
  expect(message.resolved.users.size).toBe(2);
  expect(message.resolved.users.get(TEST_USER_ID).id).toBe(TEST_USER_ID);
  expect(message.resolved.members.size).toBe(1);
  expect(message.resolved.members.get(FRIEND_USER_ID).nick).toBe("buddy");
  expect(message.resolved.roles.size).toBe(1);
  expect(message.resolved.roles.get("900000000000000041").name).toBe(
    "Resolved Role"
  );
  expect(message.resolved.channels.size).toBe(1);
  expect(message.resolved.channels.get("900000000000000042").id).toBe(
    "900000000000000042"
  );
  expect(message.resolved.messages.size).toBe(1);
  expect(message.resolved.messages.get("900000000000000043").content).toBe(
    "resolved message"
  );
  expect(message.resolved.attachments.size).toBe(1);
  expect(message.resolved.attachments.get("900000000000000044").name).toBe(
    "resolved.txt"
  );
});

test("Message parses roleSubscriptionData and sharedClientTheme from a raw MESSAGE_CREATE payload", async () => {
  const message = await createMessage({
    id: "900000000000000050",
    role_subscription_data: {
      is_renewal: true,
      role_subscription_listing_id: "900000000000000051",
      tier_name: "Gold",
      total_months_subscribed: 3,
    },
    shared_client_theme: {
      base_mix: 50,
      base_theme: "dark",
      colors: ["#5865f2", "#eb459e"],
      gradient_angle: 45,
    },
  });

  expect(message.roleSubscriptionData).toEqual({
    isRenewal: true,
    roleSubscriptionListingId: "900000000000000051",
    tierName: "Gold",
    totalMonthsSubscribed: 3,
  });

  expect(message.sharedClientTheme).toEqual({
    baseMix: 50,
    baseTheme: "dark",
    colors: ["#5865f2", "#eb459e"],
    gradientAngle: 45,
  });
});

test("Message metadata fields default to null when the payload omits them", async () => {
  const message = await createMessage({ id: "900000000000000060" });

  expect(message.interactionMetadata).toBeNull();
  expect(message.resolved).toBeNull();
  expect(message.roleSubscriptionData).toBeNull();
  expect(message.sharedClientTheme).toBeNull();
});
