import { test, describe } from "bun:test";

import {
  voiceChannelId,
  skip,
  makeClient,
  login,
  makeStepRecorder,
} from "./_helpers";

describe.skipIf(skip)("manual: voice", () => {
  test("voice operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);
      if (!voiceChannelId) {
        console.log("[SKIP] no TEST_VOICE_CHANNEL_ID");
        return;
      }
      await step("fetch voice channel", async () => {
        const vc = await client.channels.fetch(voiceChannelId!);
        if (vc.id !== voiceChannelId) {
          throw new Error("id mismatch");
        }
      });
      await step("join + leave voice", async () => {
        const vc = await client.channels.fetch(voiceChannelId!);
        const conn = await client.voice.joinChannel(vc as any, {
          selfDeaf: true,
          selfMute: true,
          selfVideo: false,
        });
        await new Promise((r) => setTimeout(r, 3000));
        conn.disconnect();
      });
    } finally {
      client.destroy();
    }
    summary("manual: voice");
    await writeArtifact("manual-voice-results");
  }, 180_000);
});
