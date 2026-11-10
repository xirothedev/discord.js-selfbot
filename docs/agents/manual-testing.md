# Manual testing with a real Discord account

Plan for verifying the CJS→ESM refactor (and ongoing changes) against the live Discord API.
Complements the fake-server tests in `packages/discord-ts-selfbot/tests/` and the `packages/test-harness`.

## Safety first

- Use a **dedicated, disposable account** only. Never your main. No Nitro, no owned servers with data you need, no personal DMs.
- Token is a full-access credential. Store it in `.env` (gitignored) as `DISCORD_TOKEN`. Never commit, screenshot, or paste it.
- Automating a user account violates Discord's ToS. Expect possible suspension. Keep actions minimal and rate-limited.
- Rotate the token (change password) if it ever leaks.

## Strategy

Two layers:

1. **Smoke pass** (`tests/manual/smoke.test.ts`) — critical paths, one action each, with delays. Asserts returned shapes and logs raw request/response.
2. **Broad coverage** — per-domain scripts (`tests/manual/<domain>.test.ts`) ticked off against `tests/manual/CHECKLIST.md` (generated from `src/index.ts` exports).

Both are **opt-in**: guarded by `describe.skipIf(!process.env.DISCORD_TOKEN)` and run via `bun run test:manual`. They never run in default `bun test` / CI.

## Environment variables

| Var                     | Required | Purpose                                |
| ----------------------- | -------- | -------------------------------------- |
| `DISCORD_TOKEN`         | yes      | User token for the disposable account  |
| `TEST_GUILD_ID`         | smoke    | Guild you own, used for mutations      |
| `TEST_CHANNEL_ID`       | smoke    | Text channel in that guild             |
| `TEST_VOICE_CHANNEL_ID` | smoke    | Voice channel in that guild            |
| `TEST_WEBHOOK_URL`      | optional | Webhook in the guild for webhook tests |

Create `.env` at repo root (already gitignored):

```sh
DISCORD_TOKEN=...
TEST_GUILD_ID=...
TEST_CHANNEL_ID=...
TEST_VOICE_CHANNEL_ID=...
```

## Run

```sh
# type-check first
bun run --cwd packages/discord-ts-selfbot check
# then run manual suite
bun run --cwd packages/discord-ts-selfbot test:manual
```

Add to `packages/discord-ts-selfbot/package.json` scripts:

```json
"test:manual": "bun test tests/manual"
```

## Smoke pass scope (critical paths)

1. Login + `ready` (client.user populated)
2. Send message → edit → delete; assert id/content/author shapes
3. Fetch guild, channels, member, roles
4. Send embed + action row (button) message
5. Add/remove reaction
6. Create thread
7. Presence update (status + activity)
8. Voice connect + leave (no audio)
9. Webhook send (if `TEST_WEBHOOK_URL`)
10. Poll create + vote (if supported)

Each step: assert returned object shape, log method/path/status/body, cleanup in `finally`.

## Request/body/response verification

For each call, capture and assert:

- HTTP method + path match expected endpoint
- Request body matches the payload the library built (no dropped/renamed fields)
- Response parsed into the expected structure (id, type, timestamps, nested objects)

Use `client.rest` request/response events when available; otherwise wrap calls and log. Keep raw samples in `scratchpad/manual-test-results.json` (not committed — may contain message content).

## Cleanup

- Every created resource deleted in `finally`.
- Failures collected, not fail-fast, so one broken API doesn't hide others.
- Final summary printed: `PASS/FAIL` per step + counts.

## Broad coverage

- Generate checklist: `bun scripts/gen-manual-checklist.ts` (or manual) from `Object.keys(await import('./src/index'))`.
- Per-domain scripts: messages, guilds, channels, members, roles, reactions, threads, voice, presence, webhooks, polls, relationships, users.
- Tick checklist as each API is exercised. A domain script is "done" when all its exports are exercised or explicitly marked N/A (e.g. internal).

## CI / safety

- Manual tests are never in default `bun test` (skipIf guard + separate dir).
- Do not add real tokens to GitHub secrets for these; they're for local exploration only.
- For CI-runnable payload-shape regression tests, duplicate the core REST paths against `packages/test-harness` (no token).

## Out of scope

- Load/perf testing
- Multi-account scenarios
- Voice audio encode/decode (covered by unit tests)
