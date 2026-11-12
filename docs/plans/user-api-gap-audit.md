# User API gap audit

Status: implemented 2026-11-11 — one route unverified on a live account
Source: `discord/discord-api-docs@36adecb` (`main`, 2026-11-11). The User page `developers/resources/user.mdx` last changed at `e230236` (2026-10-31).
Community source: `docs.discord.food` for the undocumented profile and widget payloads.
Snapshot: `@discord-selfbot/core@14.0.0`, `discord-api-types@0.38.58`.

`discord-api-types@0.38.58` is the latest release (2026-11-07). `bun.lock:759` already resolves it. `package.json` keeps the `^0.38.15` floor because this work uses no type added after `.15`.

Verdicts: `covered` (route and shape exist), `equivalent` (a different route or body gives the same result), `missing` (no library surface), `not applicable` (a selfbot token cannot call it).

## Summary

| Area | Routes or fields | Covered | Equivalent | Missing | Not applicable |
| --- | --- | --- | --- | --- | --- |
| Official User resource | 12 | 6 | 2 | 4 | 0 |
| User object fields | 17 | 15 | 1 | 1 | 0 |
| Public typings | 5 defects | 0 | 0 | 5 | 0 |
| Guild Widget | 4 | 3 | 0 | 1 | 0 |
| Profile payload | 11 field groups | 0 | 0 | 11 | 0 |
| Profile widget and identity routes | 7 | 0 | 0 | 7 | 0 |
| Application Identity Profile and app widget configs | 12 | 0 | 0 | 0 | 12 |

## 0. Capture (2026-11-11)

One live run on a disposable user token confirmed six of the seven user-token routes. Only the identity config patch waits for a user with an application identity.

| Route | Result |
| --- | --- |
| `GET /users/@me/connections` | `200`, array of connection objects |
| `PUT /users/@me/widgets` | `200`, body `{ widgets: [] }` |
| `GET /users/@me/widgets/suggested-games` | `200`, `{ suggested_games, suggested_wishlist_games }` |
| `GET /users/{id}/application-identities?with_profiles=true` | `200`, `{ identities: [] }` |
| `GET /widget-configs/featured` | `200`, `{ applications, configs }` |
| `GET /widget-configs/developer` | `200`, `{ applications: [], configs: {} }` |
| `GET /widget-configs/layout-definitions` | `200`, bare map keyed by layout key |
| `PATCH /users/@me/application-identities/{app}/{external_user_id}/config` | not run: no identity on the account |

Capture corrections:

- `PUT /users/@me/widgets` returns `{ widgets: GameWidget[] }`, not a bare array.
- `GET /widget-configs/layout-definitions` returns the layout map directly. The community table that shows `{ configs: ... }` is wrong.
- Connection objects carry three extra fields that the official page does not list: `metadata_visibility`, `metadata`, and `access_token`.
- `access_token` is a live third-party token. `fetchConnections` must strip it. Never log or return it.
- Profile objects carry `display_name_styles`, `clan`, `banner_color`, `profile_themes_experiment_bucket`, `wishlist_settings`, and `user_profile.collectibles` in addition to the community table.
- A profile badge has `id`, `description`, `icon`, and an optional `link`.

## 1. Official User resource

| # | Route | Library | Verdict |
| --- | --- | --- | --- |
| 1 | `GET /users/@me` | `client.user` from READY (`src/client/websocket/handlers/READY.ts:99`); no refresh | equivalent |
| 2 | `GET /users/{user.id}` | `UserManager#fetch` (`src/managers/UserManager.ts:87`) | covered |
| 3 | `PATCH /users/@me` | `ClientUser#edit` (`src/structures/ClientUser.ts:106`) | covered |
| 4 | `GET /users/@me/guilds` | `GuildManager#fetch()` (`src/managers/GuildManager.ts:305`) | covered |
| 5 | `GET /users/@me/guilds/{guild.id}/member` | `GuildMemberManager#fetchMe` (`src/managers/GuildMemberManager.ts:269`) | equivalent |
| 6 | `DELETE /users/@me/guilds/{guild.id}` | `Guild#leave` (`src/structures/Guild.ts:996`) | covered |
| 7 | `POST /users/@me/channels` (DM) | `UserManager#createDM` (`src/managers/UserManager.ts:42`) | covered, user-token body `recipients` |
| 8 | `POST /users/@me/channels` (group DM) | `ChannelManager#createGroupDM` (`src/managers/ChannelManager.ts:148`) | covered |
| 9 | `GET /users/@me/connections` | none | **missing** |
| 10 | `GET /users/@me/applications/{id}/role-connection` | none | **missing** |
| 11 | `PUT /users/@me/applications/{id}/role-connection` | none | **missing** |
| 12 | `DELETE /users/@me/applications/{id}/role-connection` | none | **missing** |

Routes 10–12 need an OAuth2 access token granted to a specific application with `role_connections.write`. A selfbot token cannot call them. They get the isolated `OAuth2RoleConnection` helper, not `ClientUser` methods.

Route 9 is callable by a user token. The official client uses the same token type for its connections screen.

## 2. User object fields

Covered: `id`, `username`, `discriminator`, `global_name`, `avatar`, `bot`, `system`, `banner`, `accent_color`, `mfa_enabled`, `verified`, `email`, `premium_type`, `public_flags`, `avatar_decoration_data`, `collectibles`, `primary_guild`.

| Gap | Evidence | Verdict |
| --- | --- | --- |
| `locale` is not read | `User._patch` (`src/structures/User.ts:54`) has no `locale` case; `ClientUser._patch` (`src/structures/ClientUser.ts:48`) has none | **missing** |
| Account `flags` is not surfaced | `User.flags` maps `public_flags` (`src/structures/User.ts:101`); `ClientUser` ignores `flags` | intentional, discord.js parity |
| `premiumType` is `number` | `typings/index.d.ts:1476` | typed as `0 \| 1 \| 2 \| 3` |

## 3. Public typings

| Defect | Evidence | Fix |
| --- | --- | --- |
| `PrimaryGuild` is not declared | `typings/index.d.ts:5238` | use `UserPrimaryGuild` |
| `partial` is `false` but the getter can be `true` | `typings/index.d.ts:5228`, `src/structures/User.ts:154` | `boolean` |
| `getProfile` returns `any` | `typings/index.d.ts:5252`, `src/structures/User.ts:386` | `RawUserProfileData` |
| `UserManager#fetch` says `Promise<User>` but the source can return `null` | `typings/index.d.ts:6975`, `src/managers/UserManager.ts:87` | throw `USER_RESOLVE_ID` in the source |
| `premiumType` is `number` | `typings/index.d.ts:1476` | `0 \| 1 \| 2 \| 3` |

`skipLibCheck: true` (`packages/discord-ts-selfbot/tsconfig.json`) hides the undeclared `PrimaryGuild`.

## 4. Guild Widget

| Route | Library | Verdict |
| --- | --- | --- |
| `GET /guilds/{id}/widget` | `Guild#fetchWidgetSettings` (`src/structures/Guild.ts:631`) | covered |
| `PATCH /guilds/{id}/widget` | `Guild#setWidgetSettings` (`src/structures/Guild.ts:964`) | covered |
| `GET /guilds/{id}/widget.json` | `Client#fetchGuildWidget` (`src/client/Client.ts:712`), `Widget#fetch` (`src/structures/Widget.ts:51`) | covered |
| `GET /guilds/{id}/widget.png` | none | **missing** |

Missing helpers, all present in `discord.js@14.28.1`:

- `Widget#imageURL(style?)` — discord.js `typings/index.d.ts:4460`
- `Guild#widgetImageURL(style?)` — `:1718`
- `GuildManager#widgetImageURL(guild, style?)` — `:5118`
- `GuildWidgetStyle` — `discord-api-types/payloads/v10/guild.d.ts:1000`

`widget.png` needs no authentication. The URL is `${client.options.http.api}/guilds/{id}/widget.png?style={style}`.

## 5. Profile payload

`User#getProfile` already calls `GET /users/{id}/profile` (`src/structures/User.ts:386`) and returns `any`. The payload has:

| Field | Shape | Library |
| --- | --- | --- |
| `application` | profile application object | **untyped** |
| `user` | partial user plus `bio`, `clan`, `banner_color`, `display_name_styles`, `collectibles` | **untyped** |
| `user_profile` | pronouns, bio, banner, accent color, theme colors, profile effect, collectibles | **untyped** |
| `badges` | `{ id, description, icon, link? }` | **untyped** |
| `guild_member` | private guild member object | **untyped** |
| `guild_member_profile` | profile metadata object | **untyped** |
| `guild_badges` | profile badge objects | **untyped** |
| `widgets` | game widget objects | **untyped** |
| `legacy_username` | string | **untyped** |
| `mutual_guilds` / `mutual_friends` / `mutual_friends_count` | mixed | **untyped** |
| `connected_accounts` | connection objects plus `metadata` | **untyped** |
| `wishlist_settings` | map of application ID to `{ visibility, updated_at }` | **untyped** |
| `profile_themes_experiment_bucket` | number | **untyped** |

The route also takes 7 query params. `getProfile` takes only `guildId` and hardcodes `with_mutual_friends: true`, `with_mutual_friends_count: true`, and `with_mutual_guilds: true` (`src/structures/User.ts:387-394`).

## 6. Profile widget and identity routes (user token)

| Route | Library | Auth |
| --- | --- | --- |
| `PUT /users/@me/widgets` | **missing** | user, captured |
| `GET /users/@me/widgets/suggested-games` | **missing** | user, captured |
| `GET /users/{id}/application-identities` | **missing** | user, captured |
| `PATCH /users/@me/application-identities/{app}/{external_user_id}/config` | **missing** | user, not captured |
| `GET /widget-configs/featured` | **missing** | user, captured |
| `GET /widget-configs/developer` | **missing** | user, captured |
| `GET /widget-configs/layout-definitions` | **missing** | user, captured |

There is no `GET /users/@me/widgets`. The current widgets come from `getProfile().widgets`. No `fetchProfileWidgets` method is added.

`PUT /users/@me/widgets` replaces the full list. It accepts at most one widget of each `data.type`. `updated_at` is ignored. The response is `{ widgets: GameWidget[] }`.

`GET /widget-configs/layout-definitions` returns a bare map keyed by layout key, not `{ configs }`. Each value has `key`, `display_name`, `surface`, and `components`.

## 7. Application Identity Profile and app widget configs (bot auth)

All `not applicable` to a selfbot token.

| Route | Auth |
| --- | --- |
| `GET` / `PATCH /applications/{app}/users/{user}/identities/{external_user_id}/profile` | bot token plus `application_identities.write` |
| `GET /users/{user}/application-identities/{app}` | bot token |
| `GET /applications/{app}/application-identities/{provider_type}/{provider_issued_user_id}` | bot token |
| `POST /users/{user}/application-identities/{app}/{provider_type}/{provider_issued_user_id}/delete` | bot token |
| `POST /application-identities` | OAuth2 only |
| `GET` / `POST /applications/{app}/widget-configs` | app owner or bot |
| `PATCH` / `DELETE /applications/{app}/widget-configs/{id}` | app owner or bot |
| `POST /applications/{app}/widget-configs/{id}/publish` / `unpublish` | app owner or bot |

`discord-api-types@0.38.58` already carries `APIApplicationIdentityProfile`, `APIUserApplicationIdentity`, and the REST helpers. No new wire types are needed if a future bot-token helper lands.

## 8. Agreed decisions

1. Connections return a camelCase `Connection` interface in `Collection<string, Connection>`, keyed by `id`. Reuse `APIConnection['type']` and `APIConnection['visibility']`. Keep `metadataVisibility`; strip `access_token` and `metadata`.
2. `ClientUser#fetchConnections()` owns `GET /users/@me/connections`.
3. `OAuth2RoleConnection` is an isolated helper with a token in a private field. It owns `fetch`, `update`, and `delete`.
4. `ClientUser.locale` is added. Account `flags` is documented, not surfaced.
5. The four type defects are fixed. `UserManager#fetch` throws on an unresolved user instead of returning `null`.
6. One PR, six commits. The report is the first commit.
7. Profile and widget payloads use raw wire types. `getProfile` returns `RawUserProfileData`.
8. `getProfile` accepts `Snowflake | UserProfileOptions`. Today's defaults stay.
9. Six captured routes land now. The identity config patch is typed from the docs and marked unverified.
10. `setProfileWidgets` validates one widget per type, strips `updated_at`, and requires an explicit array.
11. Guild widget image helpers are added with `GuildWidgetStyle`.
12. Application Identity Profile and app widget config routes stay report-only.

## 9. Implementation plan

One PR, version `14.1.0`.

1. `docs/plans/user-api-gap-audit.md` — this report.
2. Connections and `locale`.
   - `Connection` interface in `typings/index.d.ts`.
   - `ClientUser#fetchConnections()` in `src/structures/ClientUser.ts`.
   - `locale` in `ClientUser._patch`.
   - `tests/client-user-connections.test.ts`.
3. `OAuth2RoleConnection`.
   - `src/rest/OAuth2RoleConnection.ts`.
   - `ApplicationRoleConnection` and `ApplicationRoleConnectionEditData` in `typings/index.d.ts`.
   - Export from `src/index.ts`.
   - `tests/oauth2-role-connection.test.ts`.
4. Profile types and widgets.
   - `RawUserProfileData` and nested raw types in `typings/rawDataTypes.d.ts`.
   - `UserProfileOptions` and the `getProfile` union in `src/structures/User.ts` and the typings.
   - `RawProfileBadgeData`, `RawGameWidgetData`, `RawGameWidgetContentData`, `RawGameWidgetGameData`.
   - `WidgetManager` in `src/managers/WidgetManager.ts`, `client.widgets`.
   - `User#fetchApplicationIdentities`, `ClientUser#setApplicationIdentityConfig` after the capture.
   - `tests/widget-routes.test.ts`.
5. Guild widget image helpers.
   - `Widget#imageURL`, `Guild#widgetImageURL`, `GuildManager#widgetImageURL`.
   - `GuildWidgetStyle` in the public typings.
   - `tests/guild-widget-urls.test.ts`.
6. Type fixes and docs.
   - `PrimaryGuild` → `UserPrimaryGuild`.
   - `partial` → `boolean`.
   - `premiumType` → `0 | 1 | 2 | 3`.
   - `UserManager#fetch` throws.
   - `guides/account-profile.mdx` and `guides/guilds.mdx`.
   - `api.json` prose.
   - `bun run docs:agent`, `bun run docs:agent:check`, `bun run schema:check`, `bun run lint:boundaries`.
   - `bun fmt`, `bun run lint`, `bun run check`, `bun test`.

## 10. Implemented

- `ClientUser#fetchConnections()` with `Connection` and `locale`.
- `OAuth2RoleConnection` with `fetch`, `update`, and `delete`.
- `User#getProfile` typed with `RawUserProfileData` and `UserProfileOptions`.
- `client.widgets` (`WidgetManager`) with `setProfileWidgets`, `fetchSuggestedGames`, `fetchFeaturedConfigs`, `fetchDeveloperConfigs`, and `fetchLayoutDefinitions`.
- `User#fetchApplicationIdentities` and `ClientUser#setApplicationIdentityConfig`.
- `Widget#imageURL`, `Guild#widgetImageURL`, and `GuildManager#widgetImageURL`.
- Type fixes: `PrimaryGuild`, `partial`, `premiumType`, `UserManager#fetch`, and the `USER_RESOLVE_ID` message.
- Site typings rule: `Connection` is grouped under Users.
- Tests: 17 new tests across four files.
- Gates: `bun check`, `bun run lint`, `bun run fmt:check`, `bun test`, `bun run lint:boundaries`, `bun run docs`, `bun run docs:snippets`, `bun run docs:agent:check`.

## 11. Open risks

- Profile and widget routes are undocumented. Their shapes can change without a docs commit. The raw types follow the capture and carry a source comment.
- `PATCH /users/@me/application-identities/{app}/{external_user_id}/config` is covered by a fake-server test. Live verification requires an account with an application identity, which the disposable account does not have.
- Connection objects carry a live `access_token`. `fetchConnections` strips it and never logs it. The public `Connection` interface omits it.
- One PR deviates from `rules/general.md` #12. The report is the first commit so review starts from the verdict table.
