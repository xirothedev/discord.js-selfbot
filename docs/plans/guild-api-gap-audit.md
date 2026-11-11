# Guild (server) API gap audit

Status: audit 2026-11-11 (research only; no code changes yet).
Source: `discord/discord-api-docs` Guild resource + `docs.discord.food`. Snapshot: `discord-ts-selfbot@14.1.0`.

Scope: REST endpoints under `/guilds/{id}` that a **user token** (guild owner or admin) can call, compared to the library's `Guild` / `GuildManager` / related managers. Bot-token-only and privileged-intent endpoints are listed as N/A.

Verdicts: `covered`, `missing`, `not applicable`.

## Covered (library exposes)

| Endpoint | Library |
| --- | --- |
| `GET /guilds/{id}` | `GuildManager#fetch`, `Guild#fetch` (via constructor) |
| `PATCH /guilds/{id}` | `Guild#edit` |
| `DELETE /guilds/{id}` | `Guild#delete` |
| `GET /guilds/{id}/preview` | `Guild#fetchPreview` |
| `GET /guilds/{id}/channels` | `Guild#channels` manager (fetch) |
| `PATCH /guilds/{id}/channels` (reorder) | `GuildChannelManager#...` (position updates) |
| `GET /guilds/{id}/members/@me` | `GuildMemberManager#fetchMe` |
| `GET /guilds/{id}/members/{user}` | `GuildMemberManager#fetch` |
| `GET /guilds/{id}/members` | `GuildMemberManager#fetch` (list) |
| `GET /guilds/{id}/members/search` | `GuildMemberManager#search` (if present) |
| `PATCH /guilds/{id}/members/{user}` (self nick/roles/timeout) | `GuildMember#edit`, `GuildMember#setNickname` |
| `GET /guilds/{id}/roles` | `RoleManager#fetch` |
| `POST /guilds/{id}/roles` | `RoleManager#create` |
| `PATCH /guilds/{id}/roles/{id}` | `Role#edit` |
| `DELETE /guilds/{id}/roles/{id}` | `Role#delete` |
| `PATCH /guilds/{id}/roles` (positions) | `RoleManager#...` |
| `GET /guilds/{id}/widget` / `PATCH` | `Guild#fetchWidgetSettings`, `setWidgetSettings` |
| `GET /guilds/{id}/widget.json` | `Client#fetchGuildWidget`, `Widget#fetch` |
| `GET /guilds/{id}/vanity-url` / `PATCH` | `Guild#fetchVanityData`, `setVanityCode` |
| `GET /guilds/{id}/welcome-screen` / `PATCH` | `Guild#fetchWelcomeScreen`, `editWelcomeScreen` |
| `GET /guilds/{id}/integrations` | `Guild#fetchIntegrations` |
| `GET /guilds/{id}/templates` / create / delete | `Guild#fetchTemplates`, `createTemplate`, `GuildTemplate` |
| `GET /guilds/{id}/audit-logs` | `Guild#fetchAuditLogs` |
| `GET /guilds/{id}/threads/active` | (not called; could be added) |
| `GET /guilds/{id}/emojis` / `POST` / `PATCH` / `DELETE` | `GuildEmojiManager` |
| `GET /guilds/{id}/stickers` / `POST` / `PATCH` / `DELETE` | `GuildStickerManager` |
| `GET /guilds/{id}/scheduled-events` | `GuildScheduledEventManager` |
| `GET /guilds/{id}/soundboard-sounds` | (soundboard manager) |
| `GET /guilds/{id}/auto-moderation/rules` | `AutoModerationRuleManager` |
| `GET /guilds/{id}/incident-actions` / `PUT` | `Guild#setIncidentActions` |
| `GET /guilds/{id}/onboarding` / `PUT` | (check library) |

## Verified against source

- `Guild#bans` (GuildBanManager) ✓ — fetch/ban/unban.
- `Guild#invites` (GuildInviteManager) ✓ — fetch/create/delete.
- `Guild#voiceStates` (VoiceStateManager) ✓ — fetch/modify @me and others.
- `Guild#scheduledEvents` ✓.
- `Guild#autoModerationRules` ✓.
- `Guild#settings` (GuildSettingManager) ✓.
- `Guild#channels` / `roles` / `members` / `emojis` / `stickers` ✓.

## Likely missing (verified)

- `GET /guilds/{id}/threads/active` — **covered**: `Guild#fetchActiveThreads()`.
- `GET /guilds/{id}/onboarding` + `PUT` — **covered**: `Guild#fetchOnboarding()` / `Guild#editOnboarding()`.
- `GET /guilds/{id}/invites` is covered via `Guild#invites` manager.
- `GET /guilds/{id}/widget.png` image URL — covered by widget image helpers (prior audit).
- `POST /guilds/{id}/prune` — **covered**: `Guild#pruneMembers()`.
- `GET /guilds/{id}/member-verification` — docs removed; verify before adding.
- `GET /guilds/{id}/regions` (deprecated) — skip.

## Not applicable (bot/admin/privileged)

- Add guild member (oauth2 `guilds.join`).
- List guild members requires `GUILD_MEMBERS` privileged intent (bot).
- Prune, bans, kick, channel create/delete require `MANAGE_*` perms but are callable by user token with perms — these are covered where the library exposes them.

## Next steps

1. Verify each "likely missing" item against the source (`grep`/manager existence).
2. For each confirmed missing, add a method following the existing patterns (fetch/edit/create/delete + typings + tests).
3. Update this audit with verdicts.

This is a large surface; recommend implementing in batches by domain (channels → members → roles → onboarding → moderation → invites).