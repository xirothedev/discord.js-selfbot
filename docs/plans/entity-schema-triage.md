# Entity schema triage

Status: working list
Source: `bun tools/schema/generate.ts --report`
Snapshot: 2026-11-09, after the `Role`, `User`, `ClientUser`, `GuildMember`, `VoiceState`, `GuildBoost`, and `AutoModerationRule` passes.

## Summary

| Metric                  | First report | After current pass |
| ----------------------- | ------------ | ------------------ |
| Drift rows              | 96           | 54                 |
| Entities with drift     | 38           | 33                 |
| Assigned but undeclared | 85           | 82                 |
| Fields                  | 740          | 741                |

The converted entities have zero drift except `VoiceState.guild`, where the public typing says `Guild` and the runtime can be `null` for the global voice-state cache. The remaining 54 rows fall into four groups.

## 1. Untyped `_patch` leftovers (31)

The structure still takes `Record<string, unknown>`, so the runtime type is `unknown`/`any`. Applying the Phase 0.5 recipe removes these without a public change.

| Entity                                                                        | Rows | Fields                                                                                      |
| ----------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------- |
| `Message`                                                                     | 8    | `author`, `content`, `system`, `tts`, `type`, `attachments`, `stickers`, `messageSnapshots` |
| `GuildScheduledEvent`                                                         | 5    | `name`, `privacyLevel`, `status`, `entityType`, `entityMetadata`                            |
| `MessageMentions`                                                             | 3    | `roles`, `users`, `crosspostedChannels`                                                     |
| `MessageEmbed` / `WebEmbed`                                                   | 4    | `author`, `footer`, `provider`                                                              |
| `Widget`                                                                      | 2    | `channels`, `members`                                                                       |
| `Activity`                                                                    | 1    | `emoji`                                                                                     |
| `MessageButton`                                                               | 1    | `emoji`                                                                                     |
| `MessagePayload`                                                              | 1    | `data`                                                                                      |
| `StageInstance`                                                               | 1    | `guildScheduledEventId`                                                                     |
| `GuildPreview`, `InviteStageInstance`, `StickerPack`, `Team`, `WelcomeScreen` | 5    | one `Collection` each                                                                       |

## 2. Generic classes (15)

These need type parameters in their entities. Deferred to their module phase, because the entity interface must carry the generic parameters.

- `Collector.collected` (`Collection<K, V>`)
- `InteractionCollector.users`, `ReactionCollector.users`
- `GuildAuditLogs.entries` and `GuildAuditLogsEntry.action`, `actionType`, `extra`, `target`, `targetType`
- `AutocompleteInteraction.options`, `CommandInteraction.options`, `ContextMenuInteraction.options`
- `Interaction.memberPermissions` (`CacheTypeReducer<Cached, ...>`)
- `ApplicationCommand.permissions` (`ApplicationCommandPermissionsManager<...>`)
- `BaseGuildTextChannel.threads` (`GuildTextThreadManager<...>`)

## 3. Selfbot-specific (5)

| Entity           | Field                     | Reason                                                     |
| ---------------- | ------------------------- | ---------------------------------------------------------- |
| `DMChannel`      | `messageRequestTimestamp` | `is_message_request_timestamp` is absent from `APIChannel` |
| `GroupDMChannel` | `ownerId`                 | group-DM user-account shape                                |
| `Application`    | `installParams`           | user-account application fields                            |
| `RichPresence`   | `metadata`                | selfbot activity metadata                                  |
| `VoiceState`     | `guild`                   | `null` for the global voice-state cache                    |

These get local raw types under `src/types/selfbot/` and a `selfbot` tag in `EntitySchema`.

## 4. Real public-typing fixes (3)

| Entity         | Field    | Public                  | Runtime                       | Decision                            |
| -------------- | -------- | ----------------------- | ----------------------------- | ----------------------------------- |
| `Channel`      | `flags`  | `Readonly<ChannelFlags> | null`                         | `Readonly<ChannelFlags>`            | Confirm the constructor default; make the public type nullable only if the runtime can be null |
| `Message`      | `pinned` | `boolean`               | `boolean                      | null`                               | Remove the null fallback or widen the public type                                              |
| `ThreadMember` | `flags`  | `ThreadMemberFlags`     | `Readonly<ThreadMemberFlags>` | Align the public type to `Readonly` |

## Next modules

1. `Message` — largest untyped cluster (8 rows) and the biggest `any` surface.
2. `GuildScheduledEvent` — generic `status`; needs a generic entity or a `GuildScheduledEventStatus` field override.
3. `MessageMentions`, `MessageEmbed`, `WebEmbed`, `Widget` — finish the untyped cluster.
4. `GuildAuditLogs` — generic model, needs its own design pass.
5. `Channel` / `ThreadMember` / `DMChannel` — close the public-type and selfbot fixes.
