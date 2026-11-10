import { test, describe } from "bun:test";

import {
  login,
  makeClient,
  makeStepRecorder,
  skip,
  webhookUrl,
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
      const segments = webhookUrl.split("/");
      const webhookId = segments.at(-2);
      const webhookToken = segments.at(-1);
      if (!webhookId || !webhookToken) {
        throw new Error("TEST_WEBHOOK_URL is malformed");
      }
      await step("fetch webhook", async () => {
        const webhook = await client.fetchWebhook(webhookId, webhookToken);
        if (webhook.id !== webhookId) {
          throw new Error("id mismatch");
        }
      });
      await step("send via webhook", async () => {
        const webhook = await client.fetchWebhook(webhookId, webhookToken);
        const message = await webhook.send("manual: webhook hello");
        if (typeof message.id !== "string" && typeof message !== "string") {
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
