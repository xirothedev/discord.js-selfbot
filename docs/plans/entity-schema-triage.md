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

## Final gate: closed

`Base` no longer has `[key: string]: any`. The structural gate now passes with 354 source files type-checking and 0 drift rows. The ratchet is **1,124 `any` / 440 casts**.

## Index-signature wave

The shallow index signatures are closed. This wave removed the boundaries from:

- Collectors: `Collector`, `InteractionCollector`, `ReactionCollector`, `MessageCollector`.
- Channel mixins: `TextBasedChannel`, `InteractionResponses`, plus the guild text, voice, news, store, stage, thread, and thread-only channel subclasses.
- Components: `BaseMessageComponent` and every concrete component (`MessageActionRow`, `MessageButton`, `MessageSelectMenu`, `TextInputComponent`, `ContainerComponent`, `FileComponent`, `MediaGalleryComponent`, `SectionComponent`, `SeparatorComponent`, `TextDisplayComponent`, `ThumbnailComponent`, `UnfurledMediaItem`, `MediaGalleryItem`).
- Small structures: `OAuth2Guild`, `ReactionEmoji`, `VoiceRegion`, `Typing`, `Session`, `TeamMember`, `WelcomeChannel`, `WidgetMember`, `PollAnswer`, `Poll`, `ThreadMember`, `VoiceChannelEffect`, `MessageReaction`, `PermissionOverwrites`, `ApplicationRoleConnectionMetadata`, `AttachmentBuilder`, `Sticker`, `Presence` and its activity classes.
- Interaction classes: `MessageComponentInteraction`, `ModalSubmitInteraction`, `SelectMenuInteraction`, and both context-menu interactions.
- Voice helpers: `PCMInsertSilence`, `UnixStream`, `VolumeInterface`, `PlayInterface`, `IvfTransformer`, `AnnexBNalSplitter`.

**18 classes remain**, all on the deep runtime surfaces: the voice stack (`BaseDispatcher`, `AudioDispatcher`, `VideoDispatcher`, `VPxDispatcher`, `AnnexBDispatcher`, `MediaPlayer`, `VoiceConnection`, `ClientVoiceManager`, `VoiceWebSocket`, `VoiceUDPClient`, `Receiver`, `Recorder`, `PacketHandler`), the websocket stack (`WebSocketManager`, `WebSocketShard`), the manager bases (`BaseManager`, `CachedManager`), and `ActionsManager`.

## Next modules

1. Type `BaseManager` / `CachedManager` and the manager subclasses in one wave; removing both base boundaries reports 337 errors.
2. Type the websocket stack, then the voice dispatcher/receiver stack.
3. `Interaction.memberPermissions` / `CacheTypeReducer` and `ApplicationCommand` generic propagation.
4. Replace the last `Constants` boundary (`const Constants: any = {}`) with a named interface once consumers are typed.

## Closed in the follow-up pass

- **Interaction stack**: `Interaction<Cached>`, `BaseCommandInteraction<Cached>`, `CommandInteraction<Cached>`, `AutocompleteInteraction<Cached>`, `ContextMenuInteraction<Cached>`, and the message-component interaction classes carry `Cached`; the option resolver is generic and uses source-level resolved-data shapes.
- **Permissions**: `ApplicationCommandPermissionsManager` is generic over its option shapes, guild type, and command-id type, with private single-command helpers.
- **Audit logs**: `GuildAuditLogs<T>` and `GuildAuditLogsEntry<...>` carry real parameters; entry targets and extras stay `unknown` until the target classes expose partial constructors.
- **`GuildChannel`**: entity-backed with `PatchOf<'GuildChannel'>`, typed getters and resolvers, and `Permissions.ALL`/`FLAGS` used directly.
- **`Constants`**: all `Endpoints` and image-URL helpers are typed; the module-level `Constants` bag is the single remaining boundary.
- **`Guild`**: entity-backed with `PatchOf<'Guild'>`; setters, audit-log fetch, community/template/widget helpers, and the voice adapter creator are typed.
- **Inheritance chain**: `Channel`, `BaseGuild`, `AnonymousGuild`, `Guild`, `Emoji`, `BaseGuildEmoji`, `GuildEmoji`, `Invite`, `Integration`, `GuildTemplate`, `Application`, and `ApplicationCommand` declare their public fields.
- **Final gate**: `Base` index signature removed; `Channel`, `Guild`, `Invite`, `Application`, and the emoji chain are entity-backed.
- **`Client`**: manager, user, application, token, and shard fields are typed; login, invite, sticker, OAuth2, and option-validation methods use public types. The public typings `any[]` event-listener signatures stay because they mirror discord.js.
