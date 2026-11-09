# Entity schema triage

Status: closed for the flat entity schema
Source: `bun tools/schema/generate.ts --report`
Snapshot: 2026-11-09, after the `Message`, `MessageMentions`, `MessageEmbed`, `WebEmbed`, `Activity`, `MessageButton`, `MessagePayload`, `Webhook`, and generic-contract passes, including the interaction stack, permissions manager, and audit logs.

## Summary

| Metric                  | First report | Current |
| ----------------------- | ------------ | ------- |
| Drift rows              | 96           | 0       |
| Entities with drift     | 38           | 0       |
| Assigned but undeclared | 85           | 82      |
| Fields                  | 740          | 741     |

All public/runtime disagreements are resolved. The 82 assigned-but-undeclared fields are internal cache fields (`_members`, `_roles`, and similar) that the public typings do not expose.

## Generic contracts

The flat entity schema cannot express type parameters. The generic source contracts now carry real parameters:

- `Interaction<Cached>`, `BaseCommandInteraction<Cached>`, `CommandInteraction<Cached>`, `AutocompleteInteraction<Cached>`, `ContextMenuInteraction<Cached>`, and the message-component interaction classes.
- `CommandInteractionOptionResolver<Cached>`, with source-level option and resolved-data shapes that keep the runtime `MessageAttachment` class.
- `ApplicationCommandPermissionsManager<BaseOptions, FetchSingleOptions, FullPermissionsOptions, GuildType, CommandIdType>`.
- `GuildAuditLogs<T>` and `GuildAuditLogsEntry<TActionRaw, TAction, TActionType, TTargetType>`.
- `Collector`, `InteractionCollector`, `ReactionCollector`, `MessageCollector`, and `GuildTextThreadManager`.

Two public contracts stay as `fieldTypes` overrides because the runtime value is wider than the public type:

- `Interaction.memberPermissions` is `Readonly<Permissions> | null` at runtime; `CacheTypeReducer<Cached, Readonly<Permissions>>` would require an unchecked assertion on every assignment.
- `ApplicationCommand.permissions` keeps the public manager generic until `ApplicationCommand` itself is converted.

## Closed in this pass

- **Untyped `_patch` leftovers (18)**: `Message`, `MessageMentions`, `MessageEmbed`/`WebEmbed`, `Activity`, `MessageButton`, `MessagePayload`.
- **Selfbot-specific (5)**: `DMChannel.messageRequestTimestamp`, `GroupDMChannel.ownerId`, `Application.installParams`, `RichPresence.metadata`, `VoiceState.guild`.
- **Public-typing fixes (4)**: `Channel.flags` is non-null; `GuildPreview.features` is `GuildFeature[]`; `ThreadMember.flags` is `Readonly<ThreadMemberFlags>`; `Message.pinned` is `boolean | null`.
- **Message partial nullability**: `author`, `content`, `pinned`, `system`, `tts`, `type`, `guildId`, `resolved`, and `sharedClientTheme` are recorded through `fieldTypes` because partial messages really hold `null`.
- **Webhook**: `avatar`, `channelId`, `guildId`, and `name` are nullable; `sourceGuild` and `sourceChannel` keep the API fallback.
- **Collectors**: `Collector<K, V, F>`, `InteractionCollector<T>`, `ReactionCollector`, and `MessageCollector` carry type parameters, so `collected` and `users` are typed.

## Next modules

1. `GuildChannel.ts` (39 `any`) and `Constants.ts` (74 `any`).
2. `Interaction.memberPermissions` / `CacheTypeReducer` and `ApplicationCommand` generic propagation.
3. Final gate: remove the `Base` index signature, tighten tsconfig, finish the `typings/index.d.ts` `any` sweep.
