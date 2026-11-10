import { test, describe } from "bun:test";

import { skip, makeClient, login, makeStepRecorder } from "./_helpers";

describe.skipIf(skip)("manual: users", () => {
  test("user operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      const user = await login(client);
      await step("fetch self user", async () => {
        const fetched = await client.users.fetch(user.id);
        if (fetched.id !== user.id) {
          throw new Error("id mismatch");
        }
      });
      await step("fetch self user (cached)", async () => {
        const fetched = await client.users.fetch(user.id);
        if (fetched.username !== user.username) {
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
