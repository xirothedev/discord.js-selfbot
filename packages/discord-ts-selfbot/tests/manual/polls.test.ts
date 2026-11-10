import { test, describe } from "bun:test";

import {
  channelId,
  skip,
  makeClient,
  login,
  makeStepRecorder,
} from "./_helpers";

describe.skipIf(skip)("manual: polls", () => {
  test("poll operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let messageId: string | null = null;
    try {
      await login(client);
      if (!channelId) {
        console.log("[SKIP] no TEST_CHANNEL_ID");
        return;
      }
      await step("create poll", async () => {
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).send({
          poll: {
            allow_multiselect: false,
            answers: [{ text: "yes" }, { text: "no" }],
            duration: 1,
            question: { text: "manual poll?" },
          },
        });
        if (typeof msg.id !== "string") {
          throw new TypeError("no id");
        }
        messageId = msg.id;
      });
      await step("cleanup", async () => {
        if (messageId) {
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(messageId);
          await msg.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary("manual: polls");
    await writeArtifact("manual-polls-results");
  }, 180_000);
});
