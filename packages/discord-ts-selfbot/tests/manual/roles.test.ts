import { test, describe } from "bun:test";

import { guildId, skip, makeClient, login, makeStepRecorder } from "./_helpers";

describe.skipIf(skip)("manual: roles", () => {
  test("role operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let createdRoleId: string | null = null;
    try {
      await login(client);
      if (!guildId) {
        console.log("[SKIP] no TEST_GUILD_ID");
        return;
      }
      const targetGuildId = guildId;
      await step("create role", async () => {
        const guild = await client.guilds.fetch(targetGuildId);
        const role = await guild.roles.create({
          color: 0xff_00_00,
          name: "manual-role",
        });
        if (typeof role.id !== "string") {
          throw new TypeError("no id");
        }
        createdRoleId = role.id;
      });
      await step("edit role", async () => {
        if (!createdRoleId) {
          throw new Error("no role");
        }
        const guild = await client.guilds.fetch(targetGuildId);
        const role = await guild.roles.fetch(createdRoleId);
        await role.edit({ name: "manual-role-edited" });
      });
      await step("delete role", async () => {
        if (!createdRoleId) {
          throw new Error("no role");
        }
        const guild = await client.guilds.fetch(targetGuildId);
        const role = await guild.roles.fetch(createdRoleId);
        await role.delete();
        createdRoleId = null;
      });
    } finally {
      if (createdRoleId) {
        try {
          const guild = await client.guilds.fetch(targetGuildId);
          const role = await guild.roles.fetch(createdRoleId);
          await role.delete();
        } catch {
          // Cleanup is best effort.
        }
      }
      client.destroy();
    }
    summary("manual: roles");
    await writeArtifact("manual-roles-results");
  }, 180_000);
});
