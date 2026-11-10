import { afterAll, beforeAll, expect, test } from "bun:test";

import { startFakeDiscord } from "@discord-ts-selfbot/test-harness";

import { Client } from "../src/index";

const RISKY_ERROR = "Risky action, not finished yet.";
const TARGET_ID = "900000000000000003";

let fake;
let client;

beforeAll(async () => {
  fake = startFakeDiscord();
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login("fake-token");
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

async function expectRiskyWithoutRequest(action) {
  const before = fake.getRequests().length;

  await expect(action()).rejects.toThrow(RISKY_ERROR);

  expect(fake.getRequests()).toHaveLength(before);
}

test("RelationshipManager#deleteRelationship rejects and makes no REST request", async () => {
  await expectRiskyWithoutRequest(() =>
    client.relationships.deleteRelationship(TARGET_ID)
  );
});

test("RelationshipManager#sendFriendRequest rejects and makes no REST request", async () => {
  await expectRiskyWithoutRequest(() =>
    client.relationships.sendFriendRequest(TARGET_ID)
  );
});

test("RelationshipManager#addFriend rejects and makes no REST request", async () => {
  await expectRiskyWithoutRequest(() =>
    client.relationships.addFriend(TARGET_ID)
  );
});

test("RelationshipManager#addBlocked rejects and makes no REST request", async () => {
  await expectRiskyWithoutRequest(() =>
    client.relationships.addBlocked(TARGET_ID)
  );
});
