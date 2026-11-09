# Entity schema triage

Status: closed for the flat entity schema
Source: `bun tools/schema/generate.ts --report`
Snapshot: 2026-11-09, after the `Message`, `MessageMentions`, `MessageEmbed`, `WebEmbed`, `Activity`, `MessageButton`, `MessagePayload`, `Webhook`, and generic-contract passes.

## Summary

| Metric                  | First report | Current |
| ----------------------- | ------------ | ------- |
| Drift rows              | 96           | 0       |
| Entities with drift     | 38           | 0       |
| Assigned but undeclared | 85           | 82      |
| Fields                  | 740          | 741     |

All public/runtime disagreements are resolved. The 82 assigned-but-undeclared fields are internal cache fields (`_members`, `_roles`, and similar) that the public typings do not expose.

## Generic contracts

The flat entity schema cannot express type parameters. The remaining generic public contracts are recorded as `fieldTypes` overrides with `generate: false`:

- `ApplicationCommand.permissions` (`ApplicationCommandPermissionsManager<...>`)
- `AutocompleteInteraction.options`, `CommandInteraction.options`, `ContextMenuInteraction.options` (`CommandInteractionOptionResolver<Cached>`)
- `Interaction.memberPermissions` (`CacheTypeReducer<Cached, ...>`)
- `GuildAuditLogs.entries` and `GuildAuditLogsEntry` (`TAction`, `TActionType`, `TTargetType`)

`Collector`, `InteractionCollector`, `ReactionCollector`, `MessageCollector`, and `GuildTextThreadManager` now carry real type parameters. The remaining generic source refactors are tracked as a separate module task; the public typings remain the contract.

## Closed in this pass

- **Untyped `_patch` leftovers (18)**: `Message`, `MessageMentions`, `MessageEmbed`/`WebEmbed`, `Activity`, `MessageButton`, `MessagePayload`.
- **Selfbot-specific (5)**: `DMChannel.messageRequestTimestamp`, `GroupDMChannel.ownerId`, `Application.installParams`, `RichPresence.metadata`, `VoiceState.guild`.
- **Public-typing fixes (4)**: `Channel.flags` is non-null; `GuildPreview.features` is `GuildFeature[]`; `ThreadMember.flags` is `Readonly<ThreadMemberFlags>`; `Message.pinned` is `boolean | null`.
- **Message partial nullability**: `author`, `content`, `pinned`, `system`, `tts`, `type`, `guildId`, `resolved`, and `sharedClientTheme` are recorded through `fieldTypes` because partial messages really hold `null`.
- **Webhook**: `avatar`, `channelId`, `guildId`, and `name` are nullable; `sourceGuild` and `sourceChannel` keep the API fallback.
- **Collectors**: `Collector<K, V, F>`, `InteractionCollector<T>`, `ReactionCollector`, and `MessageCollector` carry type parameters, so `collected` and `users` are typed.

## Next modules

1. Generic source refactor for `GuildAuditLogs`, interaction option resolvers, `ApplicationCommandPermissionsManager`, and `CacheTypeReducer`.
2. `GuildChannel.ts` (39 `any`) and `Constants.ts` (74 `any`).
3. Final gate: remove the `Base` index signature, tighten tsconfig, finish the `typings/index.d.ts` `any` sweep.
