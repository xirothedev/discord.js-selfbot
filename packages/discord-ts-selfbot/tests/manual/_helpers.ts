import { Client, Events } from '../../src/index';

export const token = process.env.DISCORD_TOKEN;
export const guildId = process.env.TEST_GUILD_ID;
export const channelId = process.env.TEST_CHANNEL_ID;
export const voiceChannelId = process.env.TEST_VOICE_CHANNEL_ID;
export const webhookUrl = process.env.TEST_WEBHOOK_URL;

export const skip = !token;

export type StepResult = { name: string; status: 'PASS' | 'FAIL' | 'SKIP'; error?: string; ms: number };

export function makeClient(): Client {
  const client = new Client();
  const origRequest = client.rest.request.bind(client.rest);
  client.rest.request = async (method: any, url: any, options: any = {}) => {
    const payload = options?.data ?? options?.body;
    console.log('[REQ]', method, url, payload ? JSON.stringify(payload).slice(0, 500) : '');
    const res = await origRequest(method, url, options);
    console.log('[RES]', method, url, '->', typeof res === 'object' ? JSON.stringify(res).slice(0, 300) : res);
    return res;
  };
  return client;
}

export async function login(client: Client): Promise<void> {
  await client.login(token!);
}

export function makeStepRecorder() {
  const results: StepResult[] = [];
  async function step(name: string, fn: () => Promise<void>): Promise<void> {
    const t0 = Date.now();
    try {
      await fn();
      results.push({ name, status: 'PASS', ms: Date.now() - t0 });
      console.log(`[PASS] ${name} (${Date.now() - t0}ms)`);
    } catch (e: any) {
      results.push({ name, status: 'FAIL', error: e?.message ?? String(e), ms: Date.now() - t0 });
      console.log(`[FAIL] ${name}: ${e?.message ?? e}`);
    }
  }
  function summary(label: string): void {
    const pass = results.filter(r => r.status === 'PASS').length;
    const fail = results.filter(r => r.status === 'FAIL').length;
    console.log(`\n=== ${label}: ${pass} pass, ${fail} fail ===`);
    for (const r of results) if (r.status === 'FAIL') console.log('  FAIL:', r.name, '-', r.error);
  }
  async function writeArtifact(name: string): Promise<void> {
    try {
      const fs = await import('node:fs');
      const path = `/private/var/folders/gs/h6f9nkc50716wx9vzfr70mt00000gn/T/opencode/${name}.json`;
      fs.writeFileSync(path, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
      console.log('artifact:', path);
    } catch {}
  }
  return { results, step, summary, writeArtifact };
}
