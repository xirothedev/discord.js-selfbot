import type { Client, ClientUser } from "../../src/index";
import {
  DMChannel,
  NewsChannel,
  StageChannel,
  TextChannel,
  ThreadChannel,
  VoiceChannel,
} from "../../src/index";

export const token = process.env.DISCORD_TOKEN;
export const guildId = process.env.TEST_GUILD_ID;
export const channelId = process.env.TEST_CHANNEL_ID;
export const voiceChannelId = process.env.TEST_VOICE_CHANNEL_ID;
export const webhookUrl = process.env.TEST_WEBHOOK_URL;

export const skip = !token;

export interface StepResult {
  error?: string;
  ms: number;
  name: string;
  status: "PASS" | "FAIL" | "SKIP";
}

export type SendableChannel =
  | DMChannel
  | NewsChannel
  | TextChannel
  | ThreadChannel;

export function makeClient(): Client {
  const client = new Client();
  const originalRequest = client.rest.request.bind(client.rest);
  client.rest.request = async (
    method: string,
    url: string,
    options: Record<string, unknown> = {}
  ) => {
    const payload = options.data ?? options.body;
    console.log(
      "[REQ]",
      method,
      url,
      payload ? JSON.stringify(payload).slice(0, 500) : ""
    );
    const response = await originalRequest(method, url, options);
    console.log(
      "[RES]",
      method,
      url,
      "->",
      typeof response === "object"
        ? JSON.stringify(response).slice(0, 300)
        : response
    );
    return response;
  };
  return client;
}

export async function login(client: Client): Promise<ClientUser> {
  if (!token) {
    throw new Error("DISCORD_TOKEN is not set");
  }
  await client.login(token);
  if (!client.user) {
    throw new Error("client.user is missing after login");
  }
  return client.user;
}

export async function fetchSendableChannel(
  client: Client,
  id: string
): Promise<SendableChannel> {
  const channel = await client.channels.fetch(id);
  if (
    !(channel instanceof TextChannel) &&
    !(channel instanceof ThreadChannel) &&
    !(channel instanceof DMChannel) &&
    !(channel instanceof NewsChannel)
  ) {
    throw new Error(`channel ${id} is not text based`);
  }
  return channel;
}

export async function fetchGuildTextChannel(
  client: Client,
  id: string
): Promise<NewsChannel | TextChannel> {
  const channel = await client.channels.fetch(id);
  if (!(channel instanceof TextChannel) && !(channel instanceof NewsChannel)) {
    throw new Error(`channel ${id} is not a guild text channel`);
  }
  return channel;
}

export async function fetchThreadChannel(
  client: Client,
  id: string
): Promise<ThreadChannel> {
  const channel = await client.channels.fetch(id);
  if (!(channel instanceof ThreadChannel)) {
    throw new Error(`channel ${id} is not a thread`);
  }
  return channel;
}

export async function fetchVoiceChannel(
  client: Client,
  id: string
): Promise<StageChannel | VoiceChannel> {
  const channel = await client.channels.fetch(id);
  if (
    !(channel instanceof VoiceChannel) &&
    !(channel instanceof StageChannel)
  ) {
    throw new Error(`channel ${id} is not a voice channel`);
  }
  return channel;
}

export async function deleteChannel(client: Client, id: string): Promise<void> {
  const channel = await client.channels.fetch(id);
  if (!channel || typeof channel.delete !== "function") {
    throw new Error(`channel ${id} cannot be deleted`);
  }
  await channel.delete();
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function makeStepRecorder() {
  const results: StepResult[] = [];
  async function step(
    name: string,
    fn: () => Promise<void> | void
  ): Promise<void> {
    const startedAt = Date.now();
    try {
      await fn();
      results.push({ ms: Date.now() - startedAt, name, status: "PASS" });
      console.log(`[PASS] ${name} (${Date.now() - startedAt}ms)`);
    } catch (error) {
      results.push({
        error: errorMessage(error),
        ms: Date.now() - startedAt,
        name,
        status: "FAIL",
      });
      console.log(`[FAIL] ${name}: ${errorMessage(error)}`);
    }
  }
  function summary(label: string): void {
    const pass = results.filter((result) => result.status === "PASS").length;
    const fail = results.filter((result) => result.status === "FAIL").length;
    console.log(`\n=== ${label}: ${pass} pass, ${fail} fail ===`);
    for (const result of results) {
      if (result.status === "FAIL") {
        console.log("  FAIL:", result.name, "-", result.error);
      }
    }
  }
  async function writeArtifact(name: string): Promise<void> {
    try {
      const fs = await import("node:fs");
      const path = `/private/var/folders/gs/h6f9nkc50716wx9vzfr70mt00000gn/T/opencode/${name}.json`;
      fs.writeFileSync(
        path,
        JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2)
      );
      console.log("artifact:", path);
    } catch {
      // Artifact writing is best effort; a failure must not fail the step.
    }
  }
  return { results, step, summary, writeArtifact };
}
