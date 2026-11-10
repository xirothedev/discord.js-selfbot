import { test, expect } from "bun:test";

import { startFakeDiscord } from "@discord-ts-selfbot/test-harness";

import { Client } from "../src/index";

test("Client.login connects through a fake Discord server and emits ready", async () => {
  const fake = startFakeDiscord();
  const client = new Client({ http: { api: fake.url, version: 9 } });

  let readyFired = false;
  client.on("ready", () => {
    readyFired = true;
  });

  try {
    const token = await client.login("fake-token");
    expect(token).toBe("fake-token");
    expect(readyFired).toBe(true);
    expect(client.user).not.toBeNull();
    expect(client.user.id).toBe("123");
    expect(client.user.username).toBe("test");
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);
