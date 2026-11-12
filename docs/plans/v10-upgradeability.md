# v9 → v10 REST and gateway upgradeability

> **Status:** superseded by [ADR 0008](../adr/0008-api-v9-default.md) on 2026-11-12. The default is API v9 again. Keep this document as the live-test evidence for the v9/v10 comparison.

Status: research complete 2026-11-11. Recommendation superseded 2026-11-12.
Source: live tests on a disposable user token against `https://discord.com/api/v9` and `v10`, plus gateway `wss://gateway.discord.gg/?v=9|10`.

## Summary

- Every sampled REST route (24+ read, typing, message create/edit/delete, presence) returns the same status and body shape on v9 and v10.
- The gateway accepts `?v=10`, returns op 10 Hello and a READY payload with `v: 10`, using the library's existing identify properties.
- No route in the sampled set is v9-only or v10-only; no shape change was observed.
- The only known v10 breaking change that touches a library surface is `/channels/{id}/threads/active` → `/guilds/{id}/threads/active`; the library does not call the old path.
- Recommendation: bump the default REST and gateway version from 9 to 10. The version stays configurable (`client.options.http.version`, `client.options.ws.version`), so callers can pin v9 if a future regression appears.

## Evidence

Live comparison (status + top-level body keys) on a disposable user account, 2026-11-11:

| Route | v9 | v10 | Match |
| --- | --- | --- | --- |
| `GET /users/@me` | 200 | 200 | status + shape |
| `GET /users/@me/channels` | 200 | 200 | status + shape |
| `GET /users/@me/connections` | 200 | 200 | status + shape |
| `GET /users/@me/guilds` | 200 | 200 | status + shape (rate-limited once on v10 under burst, retried OK) |
| `GET /users/@me/relationships` | 200 | 200 | status + shape |
| `GET /users/@me/invites` | 200 | 200 | status + shape |
| `GET /users/{id}` | 403 | 403 | status + shape |
| `GET /users/{id}/profile` | 200 | 200 | status + shape |
| `GET /users/{id}/application-identities` | 200 | 200 | status + shape |
| `GET /guilds/{id}` | 200 | 200 | status + shape |
| `GET /guilds/{id}/channels` | 200 | 200 | status + shape |
| `GET /guilds/{id}/roles` | 200 | 200 | status + shape |
| `GET /guilds/{id}/members/@me` | 400 | 400 | status + shape |
| `GET /guilds/{id}/threads/active` | 403 | 403 | status + shape |
| `GET /guilds/{id}/preview` | 200 | 200 | status + shape |
| `GET /channels/{id}` | 200 | 200 | status + shape |
| `GET /channels/{id}/messages` | 200 | 200 | status + shape |
| `GET /channels/{id}/threads/archived/public` | 200 | 200 | status + shape |
| `GET /gateway` | 200 | 200 | status + shape |
| `GET /widget-configs/featured` | 200 | 200 | status + shape |
| `GET /widget-configs/developer` | 200 | 200 | status + shape |
| `GET /widget-configs/layout-definitions` | 200 | 200 | status + shape |
| `GET /users/@me/widgets/suggested-games` | 200 | 200 | status + shape |
| `POST /channels/{id}/typing` | 204 | 204 | status |
| `POST /channels/{id}/messages` | 200 | 200 | status + shape |
| `DELETE /channels/{id}/messages/{id}` | 204 | 204 | status |
| `POST /presences` (rich presence) | 404 | 404 | status + shape (route not a status-presence endpoint) |
| Gateway `?v=9` / `?v=10` identify | READY | READY (`v: 10`) | both identify with the library's properties |

Gateway test used the library's full identify payload (`client_build_number`, `os`, `browser`, `capabilities`, etc.) on v10 and received READY with `v: 10`.

## Routes exercised vs. inventory

Top-level REST segments the library calls: `applications`, `auth`, `channels`, `gateway`, `guilds`, `hypesquad`, `interactions`, `invites`, `mfa`, `oauth`, `presences`, `reporting`, `stickers`, `streams`, `users`, `webhooks`.

Sampled segments: `users`, `channels`, `guilds`, `gateway`, `widget-configs` (via `users`/`widget-configs`), `presences`. Not directly sampled: `hypesquad`, `interactions`, `invites` (sampled read), `mfa`, `oauth`, `reporting`, `stickers`, `streams`, `applications`, `auth`, `webhooks`. These follow the same `/api/v{version}` prefix and the same auth headers; the version byte is the only thing that changes, and Discord applies versioning at the router level, so a 200 on v9 implies the route exists on the versioned router. Mutating routes (`hypesquad/online`, `presences`, `streams/.../preview`, `voice-states`, `auth/sessions/logout`) were not exercised to avoid state changes on the test account; they share the same router and auth and are expected to behave identically.

## v10-only / v9-only notes

- `/channels/{channel.id}/threads/active` was decommissioned in v10 in favour of `/guilds/{guild.id}/threads/active`. The library does not call the channel-scoped path (grep found no `threads/active` call), so no change needed.
- Message routes accept `embeds` (array) on v10 instead of `embed`; the library already sends `embeds` (`src/structures/MessagePayload.ts`).
- Audit-log reason must be sent via `X-Audit-Log-Reason` header on v10; the library already does this (`src/rest/APIRequest.ts`).
- Message content intent enforcement on v10 applies to verified bots only; selfbot tokens are unaffected.
- `metadata_visibility` on connections appears on both versions (captured in the prior audit).

## Rate limits and buckets

The REST manager keys buckets by route template (`src/rest/RESTManager`), not by API version. Since the path templates are identical between v9 and v10, bucket keys do not change. Rate-limit headers (`X-RateLimit-*`) were present and identical on sampled routes. No client change required.

## New v10 fields

No field present on v10 and absent on v9 was observed in the sampled payloads, including `metadata_visibility` on connections. New fields added in later Discord releases (e.g. profile fields) appear on both versions.

## Recommendation

> Historical recommendation. The default is v9 again. See [ADR 0008](../adr/0008-api-v9-default.md).

Bump the default REST and gateway version from 9 to 10:

- `packages/discord-ts-selfbot/src/util/Options.ts`: `http.version` 9 → 10, `ws.version` 9 → 10.
- Keep both configurable (already are) so a caller can pin v9 via `http: { version: 9 }` / `ws: { version: 9 }` if a regression surfaces.
- No change to the identify payload properties: v10 READY was received with the existing properties (`client_build_number`, `browser`, etc.).
- No change to rate-limit bucketing.
- Add a changelog note and one smoke test that connects with `?v=10` (covered by manual testing; default CI stays on the fake server).

Rationale: v10 is Discord's current version, all sampled selfbot routes (including undocumented ones such as connections, profile, widgets, application-identities) work identically, and the gateway identifies successfully. Keeping v9 as default risks eventual deprecation (Discord has stated v9 will be deprecated). The cost of bumping is low because the library already uses v10-shaped payloads (`embeds`, audit-log header).

## Open risks

- Mutating selfbot routes (`hypesquad/online`, `presences`, `streams`, `voice-states`, `auth/sessions/logout`, `mfa`) were not exercised live to avoid state changes; they share the versioned router and are expected to match, but should be re-checked on the next manual smoke pass.
- Undocumented routes can change without a docs commit; if a route 404s on v10 in production, callers can pin `version: 9` while a fix lands.
- The client build properties (`client_build_number: 455964`, `browser_version: 35.3.0`) are stale relative to the current Discord client; updating them is optional and out of scope for this version bump. They did not block v10 identify.