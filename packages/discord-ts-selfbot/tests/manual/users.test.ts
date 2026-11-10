import { test, describe } from "bun:test";

import { skip, makeClient, login, makeStepRecorder } from "./_helpers";

describe.skipIf(skip)("manual: users", () => {
  test("user operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      await step("fetch self user", async () => {
        const u = await client.users.fetch(client.user!.id);
        if (u.id !== client.user!.id) {
          throw new Error("id mismatch");
        }
      });
      await step("fetch self user (cached)", async () => {
        const u = await client.users.fetch(client.user!.id);
        if (u.username !== client.user!.username) {
          throw new Error("username mismatch");
        }
      });
    } finally {
      client.destroy();
    }
    summary("manual: users");
    await writeArtifact("manual-users-results");
  }, 120_000);
});
