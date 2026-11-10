import { test, describe } from "bun:test";

import { guildId, skip, makeClient, login, makeStepRecorder } from "./_helpers";

describe.skipIf(skip)("manual: guilds", () => {
  test("guild operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      if (!guildId) {
        console.log("[SKIP] no TEST_GUILD_ID");
        return;
      }
      const targetGuildId = guildId;
      await step("fetch guild", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        if (guild.id !== targetGuildId) {
          throw new Error("id mismatch");
        }
        console.log("  name:", guild.name);
      });
      await step("fetch channels", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.channels.fetch();
        if (guild.channels.cache.size === 0) {
          throw new Error("no channels");
        }
      });
      await step("fetch members", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.members.fetch();
        if (guild.members.cache.size === 0) {
          throw new Error("no members");
        }
      });
      await step("fetch roles", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.roles.fetch();
        if (guild.roles.cache.size === 0) {
          throw new Error("no roles");
        }
      });
      await step("fetch emojis", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.emojis.fetch();
      });
      await step("fetch invites", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.invites.fetch();
      });
      await step("fetch scheduled events", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.scheduledEvents.fetch();
      });
      await step("fetch audit log", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.fetchAuditLogs();
      });
      await step("fetch vanity", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        await guild.fetchVanityData();
      });
    } finally {
      client.destroy();
    }
    summary("manual: guilds");
    await writeArtifact("manual-guilds-results");
  }, 180_000);
});
