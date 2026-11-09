# Entity schema triage

Status: working list
Source: `bun tools/schema/generate.ts --report`
Snapshot: 2026-11-09, after the `Message`, `MessageMentions`, `MessageEmbed`, `WebEmbed`, `Activity`, `MessageButton`, and `MessagePayload` passes.

## Summary

| Metric                  | First report | After current pass |
| ----------------------- | ------------ | ------------------ |
| Drift rows              | 96           | 12                 |
| Entities with drift     | 38           | 9                  |
| Assigned but undeclared | 85           | 82                 |
| Fields                  | 740          | 741                |

All converted entities have zero drift. The remaining 12 rows are all generic classes: their public types carry type parameters that the entity interface cannot express without a generic entity shape. They are deferred to the generic module phase.

## Remaining drift

| Entity                    | Rows | Fields                                                      |
| ------------------------- | ---- | ----------------------------------------------------------- |
| `GuildAuditLogsEntry`     | 5    | `action`, `actionType`, `extra`, `target`, `targetType`     |
| `GuildAuditLogs`          | 1    | `entries`                                                   |
| `AutocompleteInteraction` | 1    | `options`                                                   |
| `CommandInteraction`      | 1    | `options`                                                   |
| `ContextMenuInteraction`  | 1    | `options`                                                   |
| `Interaction`             | 1    | `memberPermissions` (`CacheTypeReducer<Cached, ...>`)       |
| `ApplicationCommand`      | 1    | `permissions` (`ApplicationCommandPermissionsManager<...>`) |
| `BaseGuildTextChannel`    | 1    | `threads` (`GuildTextThreadManager<...>`)                   |

`Collector.collected`, `InteractionCollector.users`, and `ReactionCollector.users` were closed by adding type parameters to the collector classes.

## Closed in this pass

- **Untyped `_patch` leftovers (18)**: `Message`, `MessageMentions`, `MessageEmbed`/`WebEmbed`, `Activity`, `MessageButton`, `MessagePayload`.
- **Selfbot-specific (5)**: `DMChannel.messageRequestTimestamp`, `GroupDMChannel.ownerId`, `Application.installParams`, `RichPresence.metadata`, `VoiceState.guild`. `Application` and `RichPresence` use `generate: false` config rows because their public types are nominal (`Permissions`, `RichPresenceMetadata`).
- **Public-typing fixes (4)**: `Channel.flags` is non-null; `GuildPreview.features` is `GuildFeature[]`; `ThreadMember.flags` is `Readonly<ThreadMemberFlags>`; `Message.pinned` is `boolean | null`.
- **Message partial nullability**: `author`, `content`, `pinned`, `system`, `tts`, `type`, `guildId`, `resolved`, and `sharedClientTheme` are recorded through `fieldTypes` because partial messages really hold `null`.

## Next modules

1. `GuildAuditLogs` / `GuildAuditLogsEntry` — generic entry model; needs a dedicated design pass.
2. Interaction option resolvers (`AutocompleteInteraction`, `CommandInteraction`, `ContextMenuInteraction`) and `Interaction.memberPermissions` — generic `CacheTypeReducer` shape.
3. `ApplicationCommand.permissions` and `BaseGuildTextChannel.threads` — generic managers.
4. `Base` index signature removal and the final `typings/index.d.ts` `any` sweep.
