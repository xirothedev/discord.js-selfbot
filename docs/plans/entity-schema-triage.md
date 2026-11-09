# Entity schema triage

Status: working list
Source: `bun tools/schema/generate.ts --report`
Snapshot: 2026-11-09, after the `Role`, `User`, `ClientUser`, and `GuildMember` pilots.

## Summary

| Metric                  | Before pilots | After pilots |
| ----------------------- | ------------- | ------------ |
| Drift rows              | 96            | 70           |
| Entities with drift     | 38            | 35           |
| Assigned but undeclared | 85            | 82           |
| Fields                  | 740           | 741          |

`Role`, `User`, `ClientUser`, and `GuildMember` now have zero drift and zero real casts in their `_patch` paths. The remaining 70 rows fall into four groups.

## 1. Untyped `_patch` leftovers (44)

The structure still takes `Record<string, unknown>`, so the runtime type is `unknown`/`any`. Applying the Phase 0.5 recipe removes these without a public change.

| Entity                                                                        | Fields                                                                                                                                              |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Message`                                                                     | `author`, `content`, `system`, `tts`, `type`, `attachments`, `stickers`, `messageSnapshots`                                                         |
| `VoiceState`                                                                  | `id`, `channelId`, `serverDeaf`, `serverMute`, `selfDeaf`, `selfMute`, `selfVideo`, `sessionId`, `streaming`, `suppress`, `requestToSpeakTimestamp` |
| `GuildScheduledEvent`                                                         | `name`, `privacyLevel`, `status`, `entityType`, `entityMetadata`                                                                                    |
| `AutoModerationRule`                                                          | `exemptRoles`, `exemptChannels`                                                                                                                     |
| `GuildBoost`                                                                  | `guildId`, `premiumGuildSubscriptionId`, `ended`                                                                                                    |
| `MessageEmbed` / `WebEmbed`                                                   | `author`, `footer`, `provider`                                                                                                                      |
| `MessageMentions`                                                             | `roles`, `users`, `crosspostedChannels`                                                                                                             |
| `Widget`                                                                      | `channels`, `members`                                                                                                                               |
| `Team`, `StickerPack`, `GuildPreview`, `InviteStageInstance`, `WelcomeScreen` | one `Collection` each                                                                                                                               |
| `StageInstance`                                                               | `guildScheduledEventId`                                                                                                                             |
| `GroupDMChannel`                                                              | `ownerId`                                                                                                                                           |
| `RichPresence`                                                                | `metadata`                                                                                                                                          |
| `MessagePayload`                                                              | `data`                                                                                                                                              |

## 2. Generic classes (15)

These need type parameters in their entities. Deferred to their module phase, because the entity interface must carry the generic parameters.

- `Collector.collected` (`Collection<K, V>`)
- `InteractionCollector.users`, `ReactionCollector.users`
- `GuildAuditLogs.entries` and `GuildAuditLogsEntry.action`, `actionType`, `extra`, `target`, `targetType`
- `AutocompleteInteraction.options`, `CommandInteraction.options`, `ContextMenuInteraction.options`
- `Interaction.memberPermissions` (`CacheTypeReducer<Cached, ...>`)
- `ApplicationCommand.permissions` (`ApplicationCommandPermissionsManager<...>`)
- `BaseGuildTextChannel.threads` (`GuildTextThreadManager<...>`)

## 3. Selfbot-specific (8)

| Entity           | Field                                            | Reason                                                     |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| `DMChannel`      | `messageRequestTimestamp`                        | `is_message_request_timestamp` is absent from `APIChannel` |
| `GroupDMChannel` | `ownerId`                                        | group-DM user-account shape                                |
| `GuildBoost`     | `guildId`, `premiumGuildSubscriptionId`, `ended` | premium subscription object                                |
| `Application`    | `installParams`                                  | user-account application fields                            |
| `RichPresence`   | `metadata`                                       | selfbot activity metadata                                  |
| `VoiceState`     | `guild`                                          | fake guild used for DM voice states                        |

These get local raw types under `src/types/selfbot/` and a `selfbot` tag in `EntitySchema`.

## 4. Real public-typing fixes (3)

| Entity         | Field    | Public                  | Runtime                       | Decision                            |
| -------------- | -------- | ----------------------- | ----------------------------- | ----------------------------------- |
| `Channel`      | `flags`  | `Readonly<ChannelFlags> | null`                         | `Readonly<ChannelFlags>`            | Confirm the constructor default; make the public type nullable only if the runtime can be null |
| `Message`      | `pinned` | `boolean`               | `boolean                      | null`                               | Remove the null fallback or widen the public type                                              |
| `ThreadMember` | `flags`  | `ThreadMemberFlags`     | `Readonly<ThreadMemberFlags>` | Align the public type to `Readonly` |

`DMChannel.messageRequestTimestamp` is listed under selfbot because the wire field is absent from the bot API, but it also needs a public-type decision (`number` vs `number | null`).

## Next modules

1. `VoiceState` and `Message` — largest untyped clusters (12 + 8 rows).
2. `GuildScheduledEvent`, `AutoModerationRule`, `GuildBoost` — finish the untyped cluster.
3. `GuildAuditLogs` — generic model, needs its own design pass.
4. `MessageEmbed` / `WebEmbed` — object literals with `any`; model the author/footer/provider shapes.
5. `Channel` / `ThreadMember` / `DMChannel` — close the public-type fixes.
