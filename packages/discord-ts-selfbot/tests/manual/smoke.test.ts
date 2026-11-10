import { test, expect, describe } from "bun:test";

import {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from "../../src/index";

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.TEST_GUILD_ID;
const channelId = process.env.TEST_CHANNEL_ID;
const voiceChannelId = process.env.TEST_VOICE_CHANNEL_ID;
const webhookUrl = process.env.TEST_WEBHOOK_URL;

const skip = !token;

const results: any[] = [];

async function step(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ ms: Date.now() - t0, name, status: "PASS" });
    console.log(`[PASS] ${name} (${Date.now() - t0}ms)`);
  } catch (error) {
    results.push({
      error: error?.message ?? String(error),
      ms: Date.now() - t0,
      name,
      status: "FAIL",
    });
    console.log(`[FAIL] ${name}: ${error?.message ?? error}`);
  }
}

describe.skipIf(skip)("manual smoke (real Discord)", () => {
  test("critical paths", async () => {
    const client = new Client();
    // Log every REST request/response for body/shape verification
    const origRequest = client.rest.request.bind(client.rest);
    client.rest.request = async (method, url, options = {}) => {
      const payload = options?.data ?? options?.body;
      console.log(
        "[REQ]",
        method,
        url,
        payload ? JSON.stringify(payload).slice(0, 500) : ""
      );
      const res = await origRequest(method, url, options);
      console.log(
        "[RES]",
        method,
        url,
        "->",
        typeof res === "object" ? JSON.stringify(res).slice(0, 400) : res
      );
      return res;
    };
    let createdMessageId = null;
    let createdThreadId = null;

    try {
      // 1. login + ready
      await step("login + ready", async () => {
        await client.login(token!);
        expect(client.user).not.toBeNull();
        expect(typeof client.user!.id).toBe("string");
        console.log("  user:", client.user!.tag ?? client.user!.username);
      });

      if (!guildId || !channelId) {
        console.log(
          "[SKIP] guild/channel steps: TEST_GUILD_ID/TEST_CHANNEL_ID not set"
        );
      } else {
        // 2. send message
        await step("send message", async () => {
          const ch = await client.channels.fetch(channelId!);
          expect(ch).not.toBeNull();
          const msg = await (ch as any).send("smoke-test: hello");
          expect(typeof msg.id).toBe("string");
          expect(msg.content).toBe("smoke-test: hello");
          createdMessageId = msg.id;
          console.log("  messageId:", msg.id);
        });

        // 3. edit message
        await step("edit message", async () => {
          if (!createdMessageId) {
            throw new Error("no message id");
          }
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(createdMessageId);
          const edited = await msg.edit("smoke-test: edited");
          expect(edited.content).toBe("smoke-test: edited");
        });

        // 4. embed + components
        await step(
          "send embed + button (best-effort, may be restricted for user accounts)",
          async () => {
            const ch = await client.channels.fetch(channelId!);
            const embed = new EmbedBuilder()
              .setTitle("smoke")
              .setDescription("desc");
            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("smoke-btn")
                .setLabel("Click")
                .setStyle(1)
            );
            try {
              const msg = await (ch as any).send({
                components: [row],
                embeds: [embed],
              });
              console.log(
                "  embeds:",
                msg.embeds.length,
                "components:",
                msg.components.length
              );
              await msg.delete().catch(() => {});
            } catch (error: any) {
              console.log("  (restricted/unsupported):", error?.message);
            }
          }
        );

        // 5. reaction
        await step("add/remove reaction", async () => {
          if (!createdMessageId) {
            throw new Error("no message id");
          }
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(createdMessageId);
          await msg.react("👍");
          await new Promise((r) => setTimeout(r, 500));
          const reaction = msg.reactions.cache.get("👍");
          expect(reaction).not.toBeUndefined();
          await reaction!.users.remove(client.user!.id);
        });

        // 6. fetch guild + roles + member
        await step("fetch guild/member/roles", async () => {
          const guild = await client.guilds.fetch(guildId!);
          expect(guild.id).toBe(guildId);
          expect(typeof guild.name).toBe("string");
          const member = await guild.members.fetch(client.user!.id);
          expect(member.id).toBe(client.user!.id);
          console.log("  guild:", guild.name, "roles:", guild.roles.cache.size);
        });

        // 7. create thread
        await step("create thread", async () => {
          if (!createdMessageId) {
            throw new Error("no message id");
          }
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(createdMessageId);
          const thread = await msg.startThread({ name: "smoke-thread" });
          expect(typeof thread.id).toBe("string");
          createdThreadId = thread.id;
          console.log("  threadId:", thread.id);
        });

        // 8. presence update
        await step("presence update", async () => {
          client.user!.setPresence({
            activities: [{ name: "smoke", type: 0 }],
            status: "idle",
          });
          await new Promise((r) => setTimeout(r, 1000));
        });

        // 9. voice connect
        if (voiceChannelId) {
          await step("voice connect + leave", async () => {
            const vc = await client.channels.fetch(voiceChannelId!);
            const conn = await client.voice.joinChannel(vc as any, {
              selfDeaf: true,
              selfMute: true,
              selfVideo: false,
            });
            await new Promise((r) => setTimeout(r, 3000));
            conn.disconnect();
            console.log("  voice joined");
          });
        }

        // 10. webhook send
        if (webhookUrl) {
          await step("webhook send", async () => {
            const parts = webhookUrl!.split("/");
            const id = parts.at(-2);
            const tok = parts.at(-1);
            const wh = await client.fetchWebhook(id, tok);
            const msg = await wh.send("smoke: webhook hello");
            expect(typeof msg.id === "string" || typeof msg === "string").toBe(
              true
            );
            console.log(
              "  webhook msg:",
              typeof msg === "string" ? msg : msg.id
            );
          });
        }
      }

      // 11. cleanup
      await step("cleanup", async () => {
        if (createdThreadId) {
          try {
            const t = await client.channels.fetch(createdThreadId!);
            await (t as any).delete();
          } catch {}
        }
        if (createdMessageId && channelId) {
          try {
            const ch = await client.channels.fetch(channelId!);
            const msg = await (ch as any).messages.fetch(createdMessageId);
            await msg.delete();
          } catch {}
        }
      });
    } finally {
      client.destroy();
    }

    // summary
    const pass = results.filter((r) => r.status === "PASS").length;
    const fail = results.filter((r) => r.status === "FAIL").length;
    console.log(`\n=== SMOKE SUMMARY: ${pass} pass, ${fail} fail ===`);
    for (const r of results) {
      if (r.status === "FAIL") {
        console.log("  FAIL:", r.name, "-", r.error);
      }
    }

    // write artifact
    try {
      const fs = await import("node:fs");
      const path =
        "/private/var/folders/gs/h6f9nkc50716wx9vzfr70mt00000gn/T/opencode/manual-smoke-results.json";
      fs.writeFileSync(
        path,
        JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2)
      );
      console.log("artifact:", path);
    } catch {}

    console.log(
      `\\nSmoke finished: ${pass} pass, ${fail} fail (see above for details)`
    );
  }, 120_000);
});
