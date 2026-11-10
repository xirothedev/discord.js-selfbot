import { test, describe } from "bun:test";

import { guildId, skip, makeClient, login, makeStepRecorder } from "./_helpers";

describe.skipIf(skip)("manual: members", () => {
  test("member operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      const user = await login(client);
      if (!guildId) {
        console.log("[SKIP] no TEST_GUILD_ID");
        return;
      }
      const targetGuildId = guildId;
      await step("fetch self member", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        const member = await guild.members.fetch(user.id);
        if (member.id !== user.id) {
          throw new Error("id mismatch");
        }
      });
      await step("set nickname", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        const member = await guild.members.fetch(user.id);
        await member.setNickname("manual-nick");
        await member.setNickname(null);
      });
      await step("fetch member voice state", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        const member = await guild.members.fetch(user.id);
        // voice state may be null
        console.log("  voice:", member.voice?.channelId ?? "none");
      });
    } finally {
      client.destroy();
    }
    summary("manual: members");
    await writeArtifact("manual-members-results");
  }, 180_000);
});
