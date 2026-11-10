import { test, describe } from "bun:test";

import {
  webhookUrl,
  skip,
  makeClient,
  login,
  makeStepRecorder,
} from "./_helpers";

describe.skipIf(skip)("manual: webhooks", () => {
  test("webhook operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      if (!webhookUrl) {
        console.log("[SKIP] no TEST_WEBHOOK_URL");
        return;
      }
      const id = webhookUrl.split("/").at(-2);
      const tok = webhookUrl.split("/").pop()!;
      await step("fetch webhook", async () => {
        const wh = await client.fetchWebhook(id, tok);
        if (wh.id !== id) {
          throw new Error("id mismatch");
        }
      });
      await step("send via webhook", async () => {
        const wh = await client.fetchWebhook(id, tok);
        const msg = await wh.send("manual: webhook hello");
        if (typeof msg.id !== "string" && typeof msg !== "string") {
          throw new TypeError("no result");
        }
      });
    } finally {
      client.destroy();
    }
    summary("manual: webhooks");
    await writeArtifact("manual-webhooks-results");
  }, 180_000);
});
