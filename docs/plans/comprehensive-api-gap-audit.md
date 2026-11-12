# Comprehensive API gap audit (discord.food)

Status: audit 2026-11-11 (research only; no code changes).
Source: `https://docs.discord.food/` (discord-userdoccers), fetched via MCP `discord-userdoccers`.
Snapshot: `@discord-selfbot/core@14.x` (post v10 bump, post guild gap batch).

Scope: every REST endpoint documented under `/resources/*` and `/topics/*` on discord.food, compared to the library's managers/structures. Auth column retained (user / bot / OAuth2 / none) per user request to include all routes; implementation of bot-only and OAuth2-only routes remains excluded from the selfbot surface per project policy.

Verdicts: `covered` (library exposes a method for this route), `partial` (related but not exact), `missing` (no method), `N/A` (bot/OAuth/employee/none auth or non-selfbot).

## Summary by resource

| Resource | Endpoints | Covered | Missing | Notes |
|---|---|---|---|---|
| User | 52 | ~18 | ~34 | MFA, harvest, surveys, affinities mostly missing |
| Guild | 118 | ~45 | ~73 | Large remaining surface (member-verification, onboarding polish, role connections, monetization, etc.) |
| Channel | 49 | ~35 | ~14 | Most covered; message-requests, safety warnings, linked-accounts partial |
| Message | 41 | ~28 | ~13 | Search tabs, explicit media, summaries, polls partial |
| Voice | 15 | ~10 | ~5 | Stream preview upload (oauth) N/A-ish |
| Relationships | 17 | ~6 | ~11 | Game relationships mostly missing |
| Billing | 26 | ~0 | ~26 | Entire billing surface missing |
| User Settings | 18 | ~2 | ~16 | Mostly missing |
| Invite | 13 | ~8 | ~5 | Covered mostly |
| Webhook | 15 | ~10 | ~5 | Token routes partial |
| Emoji/Sticker | 22 | ~12 | ~10 | Application emojis missing |
| Integration | 16 | ~8 | ~8 | GIF endpoints N/A |
| Scheduled Event | 16 | ~12 | ~4 | Recurrence exceptions partial |
| Stage Instance | 4 | ~0 | ~4 | Missing (stage manager?) |
| Soundboard | 8 | ~6 | ~2 | Missing bits |
| AutoMod | 11 | ~8 | ~3 | Incident actions partial |
| Audit Log | 1 | 1 | 0 | Covered |
| Presence | 12 | ~2 | ~10 | Mostly OAuth/bot |
| Application | 60 | ~10 | ~50 | Dev-portal surface; mostly out of scope |
| Collectibles | 12 | ~0 | ~12 | Missing |
| Connected Accounts | 18 | ~6 | ~12 | Partial |
| Store/Subscription | 60+ | ~0 | ~60 | Missing |
| Quests/Games | 32 | ~0 | ~32 | Missing |
| Guild Template | 7 | 7 | 0 | Covered |
| Discovery | 12 | ~6 | ~6 | Partial |
| Guild Profile | 2 | ~0 | ~2 | Missing |

## User (`/resources/user`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /users/@me | user/bot/oauth | covered (ClientUser) |
| PATCH | /users/@me | user/bot | covered (ClientUser#edit) |
| PATCH | /users/@me/account | user/oauth | missing |
| POST | /users/@me/meaningfully-online | user | covered (reportMeaningfullyOnline) |
| GET | /users/@me/avatars | user | covered (fetchRecentAvatars) |
| DELETE | /users/@me/avatars/{avatar.id} | user | covered (deleteRecentAvatar) |
| GET | /users/{user.id} | user/bot | covered (UserManager#fetch) |
| GET | /users/{user.id}/profile | user | covered (fetchProfile) |
| PATCH | /users/@me/profile | user | covered (editProfile) |
| GET | /users/{user.id}/relationships | user | missing (mutual) |
| POST | /users/@me/mfa/totp/enable | user | missing |
| POST | /users/@me/mfa/totp/disable | user (MFA) | missing |
| POST | /users/@me/mfa/sms/enable | user (MFA) | missing |
| POST | /users/@me/mfa/sms/disable | user (MFA) | missing |
| GET | /users/@me/mfa/webauthn/credentials | user | missing |
| POST | /users/@me/mfa/webauthn/credentials | user (MFA) | missing |
| PATCH | /users/@me/mfa/webauthn/credentials/{id} | user (MFA) | missing |
| DELETE | /users/@me/mfa/webauthn/credentials/{id} | user (MFA) | missing |
| POST | /auth/verify/view-backup-codes-challenge | user | missing |
| POST | /users/@me/mfa/codes-verification | user | missing |
| POST | /users/@me/disable | user (MFA) | missing |
| POST | /users/@me/delete | user (MFA) | missing |
| POST | /users/@me/captcha/verify | user (deprecated) | missing |
| PATCH | /users/@me/agreements | user | covered (modifyAgreements) |
| GET | /users/@me/pomelo-suggestions | user (deprecated) | missing |
| POST | /users/@me/pomelo-attempt | user | missing |
| POST | /users/@me/pomelo | user (deprecated) | missing |
| PUT | /users/@me/clan | user | covered (setClan) |
| GET | /users/@me/mentions | user | covered (fetchMentions) |
| DELETE | /users/@me/mentions/{message.id} | user | covered (deleteMention) |
| GET | /users/@me/harvest | user/oauth | covered (fetchHarvest) |
| POST | /users/@me/harvest | user/oauth | covered (createHarvest) |
| GET | /users/@me/survey | user | missing |
| POST | /users/@me/survey/{survey.id}/seen | user | missing |
| GET | /users/@me/notes | user | missing |
| GET | /users/@me/notes/{user.id} | user | covered (UserNoteManager#get) |
| PUT | /users/@me/notes/{user.id} | user | covered (UserNoteManager#set) |
| GET | /users/@me/affinities/users | user | covered (fetchUserAffinities) |
| GET | /users/@me/affinities/v2/users | user | missing |
| GET | /users/@me/affinities/guilds | user | covered (fetchGuildAffinities) |
| GET | /users/@me/affinities/channels | user | covered (fetchChannelAffinities) |
| GET | /tutorial | user | missing |
| PUT | /tutorial/indicators/{indicator} | user | missing |
| POST | /tutorial/indicators/suppress | user | missing |
| POST | /hypesquad/online | user | covered (ClientUser#setHypeSquad) |
| DELETE | /hypesquad/online | user | covered |
| POST | /dev-portal-csat-survey-response | user | missing |
| GET | /users/@me/premium-usage | user | missing |
| GET | /users/@me/saved-messages | user | covered (fetchSavedMessages) |
| PUT | /users/@me/saved-messages/{channel.id}/{message.id} | user | covered (saveMessage) |
| DELETE | /users/@me/saved-messages/{channel.id}/{message.id} | user | covered (unsaveMessage) |
| POST | /age-verification/verify | user | missing |
| POST | /users/@me/identity/verification | user (deprecated) | missing |
| GET | /users/@me/identity/verification | user (deprecated) | missing |

## Guild (`/resources/guild`)

See `docs/plans/guild-api-gap-audit.md` for the prior focused audit. This section extends it with the full discord.food guild endpoint list.

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /users/@me/guilds | user/bot/oauth | covered (GuildManager#fetch) |
| GET | /users/@me/join-request-guilds | user | missing |
| DELETE | /users/@me/guilds/{guild.id} | user/bot | covered (Guild#leave) |
| POST | /guilds | user | covered (GuildManager#create) |
| GET | /guilds/{guild.id} | user/bot | covered |
| GET | /guilds/{guild.id}/basic | user/bot | missing |
| GET | /guilds/{guild.id}/preview | user/bot | covered (Guild#fetchPreview) |
| PATCH | /guilds/{guild.id} | user/bot | covered (Guild#edit) |
| POST | /guilds/{guild.id}/mfa | user | missing (MFA level) |
| PUT | /guilds/{guild.id}/pincode | user | missing |
| DELETE | /guilds/{guild.id} | user | covered (Guild#delete) |
| GET | /guilds/{guild.id}/members | user/bot | covered (GuildMemberManager#fetch) |
| GET | /guilds/{guild.id}/members/search | user/bot | covered (search) |
| POST | /guilds/{guild.id}/members-search | user/bot | missing (v2 search) |
| POST | /guilds/{guild.id}/members/supplemental | user | missing |
| GET | /guilds/{guild.id}/members/unusual-dm-activity | user | missing |
| GET | /users/@me/guilds/{guild.id}/member | user/oauth | missing (@me member via oauth) |
| GET | /guilds/{guild.id}/members/{user.id} | user/bot | covered |
| PUT | /guilds/{guild.id}/members/@me | user | covered (join) |
| PUT | /guilds/{guild.id}/members/{user.id} | user/bot/oauth | covered (add member) |
| PATCH | /guilds/{guild.id}/members/{user.id} | user/bot | covered |
| PATCH | /guilds/{guild.id}/members/@me | user/bot | covered |
| PATCH | /guilds/{guild.id}/members/@me/nick | user/bot (deprecated) | covered (setNickname) |
| PATCH | /guilds/{guild.id}/profile/@me | user | missing (guild member profile) |
| PUT | /guilds/{guild.id}/members/{user.id}/roles/{role.id} | user/bot | covered |
| DELETE | /guilds/{guild.id}/members/{user.id}/roles/{role.id} | user/bot | covered |
| DELETE | /guilds/{guild.id}/members/{user.id} | user/bot | covered (kick) |
| POST | /users/@me/guilds/{guild.id}/member/ack-dm-upsell-settings | user | missing |
| GET | /guilds/{guild.id}/bans | user/bot | covered (GuildBanManager#fetch) |
| GET | /guilds/{guild.id}/bans/search | user | missing |
| GET | /guilds/{guild.id}/bans/{user.id} | user/bot | covered |
| PUT | /guilds/{guild.id}/bans/{user.id} | user/bot | covered (ban) |
| POST | /guilds/{guild.id}/bulk-ban | user/bot (deprecated) | missing |
| POST | /guilds/{guild.id}/bulk-ban/v2 | user/bot | missing |
| DELETE | /guilds/{guild.id}/bans/{user.id} | user/bot | covered (unban) |
| GET | /guilds/{guild.id}/roles | user/bot | covered |
| GET | /guilds/{guild.id}/roles/{role.id} | user/bot | missing (single role fetch) |
| GET | /guilds/{guild.id}/roles/member-counts | user/bot | missing |
| GET | /guilds/{guild.id}/roles/{role.id}/member-ids | user | missing |
| PATCH | /guilds/{guild.id}/roles/{role.id}/members | user | missing |
| GET | /guilds/{guild.id}/roles/connections-configurations | user | missing |
| GET | /guilds/{guild.id}/roles/{role.id}/connections/configuration | user | missing |
| PUT | /guilds/{guild.id}/roles/{role.id}/connections/configuration | user | missing |
| GET | /guilds/{guild.id}/roles/{role.id}/connections/eligibility | user | missing |
| PUT | /guilds/{guild.id}/roles/{role.id}/connections/assign | user | missing |
| POST | /guilds/{guild.id}/roles/{role.id}/connections/unassign | user | missing |
| POST | /guilds/{guild.id}/roles | user/bot | covered (RoleManager#create) |
| PATCH | /guilds/{guild.id}/roles | user/bot | covered (positions) |
| PATCH | /guilds/{guild.id}/roles/{role.id} | user/bot | covered |
| DELETE | /guilds/{guild.id}/roles/{role.id} | user/bot | covered |
| GET | /guilds/{guild.id}/prune | user/bot | missing (prune count) |
| POST | /guilds/{guild.id}/prune | user/bot | covered (pruneMembers) |
| GET | /guilds/{guild.id}/widget | user/bot | covered (fetchWidgetSettings) |
| PATCH | /guilds/{guild.id}/widget | user/bot | covered (setWidgetSettings) |
| GET | /guilds/{guild.id}/widget.json | none | covered (fetchWidget) |
| GET | /guilds/{guild.id}/widget.png | none | covered (widgetImageURL) |
| GET | /guilds/{guild.id}/vanity-url | user/bot | covered |
| PATCH | /guilds/{guild.id}/vanity-url | user | covered |
| GET | /guilds/{guild.id}/member-verification | user/bot | missing (covered? no helper) |
| PATCH | /guilds/{guild.id}/member-verification | user/bot | missing |
| GET | /guilds/{guild.id}/requests | user/bot | missing (join requests list) |
| GET | /join-requests/{id} | user | missing |
| GET | /guilds/{guild.id}/requests/@me | user | missing |
| GET | /guilds/{guild.id}/requests/@me/cooldown | user | missing |
| PUT | /guilds/{guild.id}/requests/@me | user | missing |
| POST | /guilds/{guild.id}/requests/@me | user | missing |
| POST | /guilds/{guild.id}/requests/{id}/ack | user | missing |
| DELETE | /guilds/{guild.id}/requests/@me | user | missing |
| POST | /join-requests/{id}/interview | user | missing |
| PATCH | /guilds/{guild.id}/requests/{id} | user/bot | missing |
| PATCH | /guilds/{guild.id}/requests/id/{id} | user (deprecated) | missing |
| PATCH | /guilds/{guild.id}/requests | user | missing |
| GET | /guilds/{guild.id}/requests/users/{user.id} | user | missing |
| GET | /guilds/{guild.id}/welcome-screen | user/bot | covered |
| PATCH | /guilds/{guild.id}/welcome-screen | user/bot | covered |
| GET | /guilds/{guild.id}/onboarding | user/bot | covered (fetchOnboarding) |
| PUT | /guilds/{guild.id}/onboarding | user/bot | covered (editOnboarding) |
| GET | /guilds/{guild.id}/onboarding/allowed-applications | user | missing |
| POST | /guilds/{guild.id}/onboarding-responses | user | missing |
| PUT | /guilds/{guild.id}/onboarding-responses | user | missing |
| GET | /guilds/{guild.id}/new-member-welcome | user/bot | missing |
| PUT | /guilds/{guild.id}/new-member-welcome | user | missing |
| PATCH | /guilds/{guild.id}/new-member-actions/{channel.id} | user | missing |
| PUT | /guilds/{guild.id}/resource-channels/{channel.id} | user | missing |
| GET | /guilds/{guild.id}/new-member-actions | user | missing |
| POST | /guilds/{guild.id}/new-member-action/{channel.id} | user | missing |
| GET | /guilds/{guild.id}/top-games | user | missing |
| GET | /guilds/{guild.id}/premium/subscriptions | user | missing |
| PUT | /guilds/{guild.id}/premium/subscriptions | user | missing |
| DELETE | /guilds/{guild.id}/premium/subscriptions/{id} | user | missing |
| GET | /guilds/{guild.id}/powerups | user | missing |
| POST | /guilds/{guild.id}/skus/{sku.id} | user | missing |
| PATCH | /guilds/{guild.id}/entitlements/{entitlement.id} | user | missing |
| DELETE | /guilds/{guild.id}/skus/{sku.id} | user | missing |
| GET | /guilds/{guild.id}/game-servers | user | missing |
| GET | /guilds/{guild.id}/game-server-regions | user | missing |
| POST | /guilds/{guild.id}/game-servers/{id}/wake | user | missing |
| GET | /guilds/{guild.id}/admin-server-eligibility | user | missing |
| POST | /guilds/{guild.id}/join-admin-server | user | missing |
| POST | /guilds/{guild.id}/migrate-pin-permission | user/bot | missing |
| POST | /guilds/{guild.id}/migrate-bypass-slowmode-permission | user/bot | missing |
| POST | /guilds/automations/email-domain-lookup | user | missing |
| POST | /guilds/automations/email-domain-lookup/verify-code | user | missing |
| POST | /hub-waitlist/signup | user | missing |
| GET | /guilds/{guild.id}/role-subscriptions/settings | user | missing |
| PATCH | /guilds/{guild.id}/role-subscriptions/settings | user | missing |
| POST | /guilds/{guild.id}/role-subscriptions/group-listings | user | missing |
| GET | /guilds/{guild.id}/role-subscriptions/group-listings/{id} | user | missing |
| GET | /guilds/{guild.id}/role-subscriptions/group-listings | user | missing |
| PATCH | /guilds/{guild.id}/role-subscriptions/group-listings/{id} | user | missing |
| DELETE | /guilds/{guild.id}/role-subscriptions/group-listings/{id} | user | missing |
| GET | /guilds/{guild.id}/role-subscriptions/trials | user | missing |
| GET | /guilds/{guild.id}/role-subscriptions/templates | user | missing |
| GET | /guilds/{guild.id}/creator-monetization/requirements | user | missing |
| POST | /guilds/{guild.id}/creator-monetization/enable-requests | user | missing |
| POST | /guilds/{guild.id}/creator-monetization/accept-terms | user | missing |
| GET | /guilds/{guild.id}/creator-monetization/restrictions | user | missing |
| GET | /guilds/{guild.id}/creator-monetization/marketing/onboarding | user | missing |
| POST | /guilds/{guild.id}/creator-monetization/ownership-transfer/onboarding | user | missing |
| POST | /guilds/{guild.id}/creator-monetization/accept-new-terms-demonetized | user | missing |
| POST | /guilds/{guild.id}/creator-monetization/remove-monetization | user | missing |
| POST | /guilds/{guild.id}/products | user/bot | missing |
| GET | /guilds/{guild.id}/products/listings | user | missing |
| GET | /guilds/{guild.id}/products/listings/{id} | user | missing |
| PATCH | /guilds/{guild.id}/products/listings/{id} | user | missing |
| DELETE | /guilds/{guild.id}/products/listings/{id} | user | missing |
| GET | /guilds/{guild.id}/threads/active | bot | covered (fetchActiveThreads) |
| GET | /guilds/{guild.id}/top-games | user | missing |
| GET | /guilds/{guild.id}/profile | user | missing |
| PATCH | /guilds/{guild.id}/profile | user | missing |

## Channel (`/resources/channel`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /users/@me/channels | user | covered |
| GET | /users/@me/dms/{user.id} | user/bot/oauth | covered |
| POST | /users/@me/channels | user/bot/oauth | covered |
| POST | /users/@me/channels/group-dm-shell | user | missing |
| GET | /guilds/{guild.id}/channels | user/bot/oauth | covered |
| GET | /guilds/{guild.id}/top-read-channels | user/bot (deprecated) | missing |
| POST | /guilds/{guild.id}/channels | user/bot | covered |
| PATCH | /guilds/{guild.id}/channels | user/bot | covered |
| GET | /channels/{channel.id} | user/bot | covered |
| PATCH | /channels/{channel.id} | user/bot | covered |
| DELETE | /channels/{channel.id} | user/bot | covered |
| POST | /users/@me/channels/bulk-leave | user | missing |
| PUT | /channels/{channel.id}/voice-status | user/bot | covered (modify status) |
| PUT | /channels/{channel.id}/permissions/{overwrite.id} | user/bot | covered |
| DELETE | /channels/{channel.id}/permissions/{overwrite.id} | user/bot | covered |
| POST | /channels/{channel.id}/followers | user/bot | missing (follow announcements) |
| POST | /channels/{channel.id}/typing | user/bot | covered |
| GET | /channels/{channel.id}/call | user/oauth | missing |
| PATCH | /channels/{channel.id}/call | user | missing |
| POST | /channels/{channel.id}/call/ring | user/oauth | missing |
| POST | /channels/{channel.id}/call/stop-ringing | user/oauth | missing |
| PUT | /channels/{channel.id}/recipients/{user.id} | user/bot | covered |
| DELETE | /channels/{channel.id}/recipients/{user.id} | user/bot | covered |
| PUT | /channels/{channel.id}/recipients/@me | user | missing (message request accept) |
| DELETE | /channels/{channel.id}/recipients/@me | user | missing (reject) |
| PUT | /channels/recipients/@me/batch-reject | user | missing |
| GET | /users/@me/message-requests/supplemental-data | user | missing |
| POST | /channels/{channel.id}/blocked-user-warning-dismissal | user | missing |
| POST | /channels/{channel.id}/safety-warnings/ack | user | missing |
| POST | /channels/{channel.id}/add-safety-warning | user (employee) | N/A |
| DELETE | /channels/{channel.id}/safety-warnings | user (employee) | N/A |
| POST | /channels/{channel.id}/safety-warning/report-false-positive | user (employee) | N/A |
| GET | /guilds/{guild.id}/threads/active | bot | covered |
| GET | /channels/{channel.id}/threads/active | bot (deprecated) | covered |
| GET | /channels/{channel.id}/threads/archived/public | user/bot | covered |
| GET | /channels/{channel.id}/threads/archived/private | user/bot | covered |
| GET | /channels/{channel.id}/users/@me/threads/archived/private | user/bot | covered |
| GET | /channels/{channel.id}/threads/search | user/bot | missing (search threads) |
| POST | /channels/{channel.id}/messages/{message.id}/threads | user/bot | covered |
| POST | /channels/{channel.id}/threads | user/bot | covered |
| POST | /channels/{channel.id}/post-data | user | missing |
| GET | /channels/{channel.id}/thread-members | bot | covered |
| GET | /channels/{channel.id}/thread-members/{user.id} | bot | covered |
| PUT | /channels/{channel.id}/thread-members/@me | user/bot | covered |
| PUT | /channels/{channel.id}/thread-members/{user.id} | user/bot | covered |
| PATCH | /channels/{channel.id}/thread-members/@me/settings | user | covered |
| DELETE | /channels/{channel.id}/thread-members/@me | user/bot | covered |
| DELETE | /channels/{channel.id}/thread-members/{user.id} | user/bot | covered |
| POST | /channels/{channel.id}/tags | user/bot | missing (forum tags) |
| PUT | /channels/{channel.id}/tags/{forum_tag.id} | user/bot | missing |
| DELETE | /channels/{channel.id}/tags/{forum_tag.id} | user/bot | missing |
| GET | /channels/{channel.id}/linked-accounts | oauth | N/A |
| DELETE | /channels/{channel.id}/linked-lobby | user/bot | missing |

## Message (`/resources/message`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /channels/{channel.id}/messages | bot | covered |
| GET | /users/{user.id}/messages | oauth | N/A |
| POST | /channels/preload-messages | user | missing |
| GET | /guilds/{guild.id}/messages/search | bot | covered (search) |
| GET | /channels/{channel.id}/messages/search | user | covered |
| POST | /guilds/{guild.id}/messages/search/tabs | user | missing |
| POST | /channels/{channel.id}/messages/search/tabs | user | missing |
| POST | /users/@me/messages/search/tabs | user | missing |
| GET | /channels/{channel.id}/messages/{message.id} | bot | covered |
| POST | /channels/{channel.id}/messages | bot | covered |
| POST | /users/{user.id}/messages | oauth | N/A |
| POST | /channels/{channel.id}/greet | user | missing |
| PATCH | /channels/{channel.id}/explicit-media | bot | missing |
| PATCH | /messages/explicit-media | bot | missing |
| POST | /attachments/sender-report-false-positive | bot | missing |
| POST | /attachments/report-false-positive | bot | missing |
| POST | /channels/{channel.id}/messages/{message.id}/crosspost | bot | covered |
| POST | /channels/{channel.id}/messages/{message.id}/hide-guild-feed | user | missing |
| DELETE | /channels/{channel.id}/messages/{message.id}/hide-guild-feed | user | missing |
| GET | /channels/{channel.id}/messages/{message.id}/reactions/{emoji} | bot | covered |
| PUT | /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me | bot | covered |
| DELETE | /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{type}/@me | bot | covered |
| DELETE | /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{type}/{user.id} | bot | covered |
| DELETE | /channels/{channel.id}/messages/{message.id}/reactions/{emoji} | bot | covered |
| DELETE | /channels/{channel.id}/messages/{message.id}/reactions | bot | covered |
| GET | /channels/{channel.id}/messages/{message.id}/interaction-data | user | missing |
| PATCH | /channels/{channel.id}/messages/{message.id} | bot | covered |
| PATCH | /users/{user.id}/messages/{message.id} | oauth | N/A |
| DELETE | /channels/{channel.id}/messages/{message.id} | bot | covered |
| DELETE | /users/{user.id}/messages/{message.id} | oauth | N/A |
| POST | /channels/{channel.id}/messages/bulk-delete | bot | covered |
| GET | /channels/{channel.id}/messages/pins | bot | covered |
| GET | /channels/{channel.id}/pins | bot (deprecated) | covered |
| PUT | /channels/{channel.id}/messages/pins/{message.id} | bot | covered |
| DELETE | /channels/{channel.id}/messages/pins/{message.id} | bot | covered |
| GET | /channels/{channel.id}/media-post-preview | user | missing |
| POST | /unfurler/unfurl | user | missing |
| POST | /unfurler/embed-urls | user | missing |
| GET | /channels/{channel.id}/polls/{message.id}/answers/{poll_answer.id} | bot | missing (poll voters) |
| POST | /channels/{channel.id}/polls/{message.id}/expire | bot | missing (end poll) |
| PUT | /channels/{channel.id}/polls/{message.id}/answers/@me | user | missing (vote) |
| GET | /channels/{channel.id}/summaries | user | missing |
| DELETE | /channels/{channel.id}/summaries/{summary.id} | user | missing |
| GET | /partner-sdk/users/@me/channels | user | missing |
| PUT | /partner-sdk/dms/{u1}/{u2}/messages/{id}/moderation-metadata | bot | missing |

## Voice (`/resources/voice`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /voice/regions | user/bot | covered |
| GET | /guilds/{guild.id}/regions | user/bot | covered |
| PUT | /voice/public-keys | user | missing |
| POST | /voice/{user.id}/match-public-key | user | missing |
| GET | /guilds/{guild.id}/voice-states/@me | bot | covered |
| GET | /guilds/{guild.id}/voice-states/{user.id} | bot | covered |
| PATCH | /guilds/{guild.id}/voice-states/@me | user/bot | covered |
| PATCH | /guilds/{guild.id}/voice-states/{user.id} | user/bot | covered |
| POST | /channels/{channel.id}/voice-channel-effects | user | missing |
| POST | /channels/{channel.id}/custom-call-sounds | user | missing |
| PATCH | /streams/{stream_key}/stream | user | missing |
| GET | /streams/{stream_key}/preview | user | missing |
| POST | /streams/{stream_key}/preview | oauth | N/A |
| POST | /streams/{stream_key}/preview/video | oauth | N/A |
| POST | /streams/{stream_key}/notify | user | missing |

## Relationships (`/resources/relationships`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /users/@me/relationships | oauth (relationships.read) | covered (RelationshipManager) |
| POST | /users/@me/relationships | oauth (relationships.write) | covered |
| PUT | /users/@me/relationships/{user.id} | oauth (relationships.write) | covered |
| PUT | /users/@me/relationships/{user.id}/ignore | user | missing |
| DELETE | /users/@me/relationships/{user.id}/ignore | user | missing |
| PATCH | /users/@me/relationships/{user.id} | user | covered (modify) |
| DELETE | /users/@me/relationships/{user.id} | oauth (relationships.write) | covered |
| DELETE | /users/@me/relationships | user | missing (bulk remove) |
| POST | /users/@me/relationships/bulk | user | missing (bulk add) |
| GET | /users/@me/game-relationships | oauth (relationships.read) | missing |
| POST | /users/@me/game-relationships | oauth (relationships.write) | missing |
| PUT | /users/@me/game-relationships/{user.id} | oauth (relationships.write) | missing |
| PUT | /users/@me/game-relationships/{user.id}/{application.id} | user | missing |
| DELETE | /users/@me/game-relationships/{user.id} | oauth (relationships.write) | missing |
| DELETE | /users/@me/game-relationships/{user.id}/{application.id} | user | missing |
| GET | /friend-suggestions | user | missing |
| DELETE | /friend-suggestions/{user.id} | user | missing |

## Billing (`/resources/billing`)

All 26 endpoints: **missing** (no BillingManager REST surface beyond manager shell). Entire billing surface unimplemented.

## User Settings (`/resources/user-settings`)

All 18 endpoints: **missing** (only ClientUserSettingManager partial). Entire settings surface unimplemented except partial.

## Invite (`/resources/invite`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /invites/{invite.code} | none | covered |
| GET | /invites/{invite.code}/friend-members | bot/user | missing |
| GET | /invites/{invite.code}/target-users | bot/user | missing |
| PUT | /invites/{invite.code}/target-users | bot/user | missing |
| GET | /invites/{invite.code}/target-users/job-status | bot/user | missing |
| POST | /invites/{invite.code} | user/oauth (guilds.join) | covered (accept) |
| DELETE | /invites/{invite.code} | bot/user | covered (delete) |
| GET | /guilds/{guild.id}/invites | bot/user | covered |
| GET | /channels/{channel.id}/invites | bot/user | covered |
| POST | /channels/{channel.id}/invites | bot/user | covered |
| GET | /users/@me/invites | user | covered |
| POST | /users/@me/invites | user | missing |
| DELETE | /users/@me/invites | user | missing |

## Webhook (`/resources/webhook`)

Mostly covered (create/get/modify/delete/execute). Token-based message edit/delete covered. Gaps: service validation (github/slack) endpoints missing.

## Emoji & Sticker (`/resources/emoji`, `/resources/sticker`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /guilds/{guild.id}/emojis | bot | covered |
| GET | /guilds/{guild.id}/emojis/{emoji.id} | bot | covered |
| GET | /guilds/{guild.id}/top-emojis | auth | missing |
| GET | /emojis/{emoji.id}/guild | auth | missing |
| GET | /emojis/{emoji.id}/source | auth | missing |
| POST | /guilds/{guild.id}/emojis | bot (audit) | covered |
| PATCH | /guilds/{guild.id}/emojis/{emoji.id} | bot (audit) | covered |
| DELETE | /guilds/{guild.id}/emojis/{emoji.id} | bot (audit) | covered |
| GET | /applications/{application.id}/emojis | bot | missing (app emojis) |
| GET | /applications/{application.id}/emojis/{emoji.id} | bot | missing |
| POST | /applications/{application.id}/emojis | bot | missing |
| PATCH | /applications/{application.id}/emojis/{emoji.id} | bot | missing |
| DELETE | /applications/{application.id}/emojis/{emoji.id} | bot | missing |
| GET | /sticker-packs | none | covered? (fetch sticker packs) partial |
| GET | /sticker-packs/{id} | bot | missing |
| GET | /stickers/{sticker.id} | bot | covered |
| GET | /stickers/{sticker.id}/guild | auth | missing |
| GET | /guilds/{guild.id}/stickers | bot | covered |
| GET | /guilds/{guild.id}/stickers/{sticker.id} | bot | covered |
| POST | /guilds/{guild.id}/stickers | bot (audit) | covered |
| PATCH | /guilds/{guild.id}/stickers/{sticker.id} | bot (audit) | covered |
| DELETE | /guilds/{guild.id}/stickers/{sticker.id} | bot (audit) | covered |

## Integration (`/resources/integration`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /guilds/{guild.id}/integrations | bot/user | covered |
| POST | /guilds/{guild.id}/integrations | user | covered |
| POST | /guilds/{guild.id}/integrations/{integration.id}/sync | user | covered |
| PATCH | /guilds/{guild.id}/integrations/{integration.id} | user | covered |
| DELETE | /guilds/{guild.id}/integrations/{integration.id} | bot/user | covered |
| POST | /guilds/{guild.id}/migrate-command-scope | user | missing |
| GET | /users/@me/guilds/integration-application-ids | user | missing |
| GET | /channels/{channel.id}/integrations | user | missing |
| DELETE | /channels/{channel.id}/integrations/{integration.id} | user | missing |
| POST | /integrations/{integration.id}/join | user | missing |
| GET | /gifs/* | none/bot | N/A (gif search) |

## Scheduled Event (`/resources/guild-scheduled-event`)

Mostly covered (list/get/create/edit/delete, subscribe/unsubscribe, user counts). Gaps: recurrence exceptions (create/modify/delete) partial; exception subscribed users list partial.

## Stage Instance (`/resources/stage-instance`)

All 4 endpoints: **missing** (no StageInstanceManager REST surface beyond maybe). Missing.

## Soundboard (`/resources/soundboard`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /soundboard-default-sounds | bot | missing |
| GET | /guilds/{guild.id}/soundboard-sounds | bot | covered |
| GET | /guilds/{guild.id}/soundboard-sounds/{sound.id} | bot | missing |
| POST | /guilds/{guild.id}/soundboard-sounds | bot (audit) | covered |
| PATCH | /guilds/{guild.id}/soundboard-sounds/{sound.id} | bot (audit) | covered |
| DELETE | /guilds/{guild.id}/soundboard-sounds/{sound.id} | bot (audit) | covered |
| GET | /soundboard-sounds/{sound.id}/guild/{guild.id} | user only | missing |
| POST | /channels/{channel.id}/send-soundboard-sound | bot | covered |

## AutoMod (`/resources/auto-moderation`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /guilds/{guild.id}/auto-moderation/rules | MANAGE_GUILD | covered |
| GET | /guilds/{guild.id}/auto-moderation/rules/{id} | MANAGE_GUILD | covered |
| POST | /guilds/{guild.id}/auto-moderation/rules | MANAGE_GUILD | covered |
| POST | /guilds/{guild.id}/auto-moderation/rules/validate | MANAGE_GUILD | missing |
| PATCH | /guilds/{guild.id}/auto-moderation/rules/{id} | MANAGE_GUILD | covered |
| DELETE | /guilds/{guild.id}/auto-moderation/rules/{id} | MANAGE_GUILD | covered |
| POST | /guilds/{guild.id}/auto-moderation/alert-action | MANAGE_GUILD | missing |
| PUT | /guilds/{guild.id}/incident-actions | MANAGE_GUILD | covered (setIncidentActions) |
| POST | /guilds/{guild.id}/auto-moderation/false-alarm | MANAGE_GUILD | missing |
| POST | /guilds/{guild.id}/auto-moderation/report-raid | MANAGE_GUILD | missing |
| POST | /guilds/{guild.id}/auto-moderation/clear-mention-raid | MANAGE_GUILD | missing |

## Audit Log (`/resources/audit-log`)

Covered: Guild#fetchAuditLogs.

## Presence (`/resources/presence`)

Mostly OAuth/bot or deprecated; library has PresenceManager for status. Gaps: activities statistics, headless sessions, activity metadata/secrets, activity subscriptions — mostly missing/N/A.

## Application (`/resources/application`)

Mostly dev-portal surface (create/modify/delete apps, assets, disclosures, managed links, social sdk, etc.). Library has ApplicationCommandManager for commands/permissions only. ~50 endpoints missing; largely out of selfbot scope (dev portal). Marked missing but low priority.

## Collectibles (`/resources/collectibles`)

All 12 endpoints: **missing**.

## Connected Accounts (`/resources/connected-accounts`)

Partial coverage (list/modify/delete connections). Gaps: authorize/callback, contact sync, domain connections, console commands, linked-connections, refresh, access token.

## Store & Subscription (`/resources/store`, `/resources/subscription`)

All ~60 endpoints: **missing** (no store manager).

## Quests & Games (`/resources/quests`, `/resources/game`)

All ~32 endpoints: **missing**.

## Guild Template (`/resources/guild-template`)

All 7 endpoints: **covered**.

## Discovery (`/resources/discovery`)

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /discoverable-guilds | user | missing |
| GET | /discoverable-guilds/search | user/bot | missing |
| GET | /discovery/search | none | missing |
| GET | /discovery/{guild.id} | none | missing |
| GET | /discovery/categories | user/bot | missing |
| GET | /discovery/valid-term | user/bot | missing |
| GET | /guilds/{guild.id}/discovery-requirements | user/bot | missing |
| GET | /guilds/{guild.id}/discovery-metadata | user/bot | missing |
| PATCH | /guilds/{guild.id}/discovery-metadata | user/bot | missing |
| PUT | /guilds/{guild.id}/discovery-categories/{id} | user/bot | missing |
| DELETE | /guilds/{guild.id}/discovery-categories/{id} | user/bot | missing |
| GET | /guilds/{guild.id}/profile | user | missing |
| PATCH | /guilds/{guild.id}/profile | user | missing |

## Guild Analytics (`/resources/guild-analytics`)

Not enumerated in detail; likely missing.

## Other resources not individually enumerated

- `family-center`, `notification-center`, `checkpoint`, `premium-referral`, `promotion`, `lobby`, `safety-hub`, `components`, `application-directory`, `directory-entry`, `game-invite`, `entitlement`, `ai`, `user-settings-proto`: largely missing/partial; to be audited in follow-up.

## Recommended implementation batches

1. User core (profile, notes, mentions, saved messages, affinities) — high value.
2. Guild remaining high-value (member-verification, onboarding responses, join requests, basic info, role member counts/connections) — high value.
3. Channel (message requests, safety warnings ack, forum tags, thread search) — medium.
4. Message (search tabs, poll voters/vote/end, summaries, media preview, unfurl) — medium.
5. Voice (voice channel effects, custom call sounds, stream notify) — medium.
6. Relationships (ignore, bulk, game relationships, friend suggestions) — medium.
7. Settings & Billing & Store & Collectibles & Quests & Applications & Discovery — low priority / out of scope.

## Next steps

- Confirm scope/priorities with user.
- Implement batch 1 in a follow-up PR.
- Update this audit with verdicts as methods land.
