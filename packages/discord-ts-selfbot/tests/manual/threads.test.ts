import { test, describe } from "bun:test";

import {
  channelId,
  skip,
  makeClient,
  login,
  makeStepRecorder,
} from "./_helpers";

describe.skipIf(skip)("manual: threads", () => {
  test("thread operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let messageId: string | null = null;
    let threadId: string | null = null;
    try {
      await login(client);
      if (!channelId) {
        console.log("[SKIP] no TEST_CHANNEL_ID");
        return;
      }
      await step("create thread from message", async () => {
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).send("manual: thread parent");
        messageId = msg.id;
        const thread = await msg.startThread({ name: "manual-thread" });
        if (typeof thread.id !== "string") {
          throw new TypeError("no id");
        }
        threadId = thread.id;
      });
      await step("send in thread", async () => {
        if (!threadId) {
          throw new Error("no thread");
        }
        const t = await client.channels.fetch(threadId!);
        await (t as any).send("manual: in thread");
      });
      await step("archive thread", async () => {
        if (!threadId) {
          throw new Error("no thread");
        }
        const t: any = await client.channels.fetch(threadId!);
        await t.setArchived(true);
        await t.setArchived(false);
      });
      await step("cleanup", async () => {
        if (threadId) {
          const t = await client.channels.fetch(threadId!);
          await (t as any).delete();
        }
        if (messageId) {
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(messageId);
          await msg.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary("manual: threads");
    await writeArtifact("manual-threads-results");
  }, 180_000);
});
