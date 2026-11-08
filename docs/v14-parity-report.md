# v14 API parity report

**Package:** `discord-ts-selfbot@14.0.0`
**Reference:** `discord.js@14.28.1`
**Commit audited:** `e604aee`
**Date:** 2026-11-08

**Sources compared**

| Local | discord.js v14 |
| --- | --- |
| `packages/discord-ts-selfbot/src/index.js` | <https://raw.githubusercontent.com/discordjs/discord.js/v14/packages/discord.js/src/index.js> |
| `packages/discord-ts-selfbot/typings/index.d.ts` | <https://raw.githubusercontent.com/discordjs/discord.js/v14/packages/discord.js/typings/index.d.ts> |

The `v14` branch resolved to `discord.js@14.28.1` in `packages/discord.js/package.json`.

**Scope**

This audit compares the public root entry point and the public typings. It does not compare every subpath or run differential behaviour tests. Voice internals and selfbot-only extensions are out of scope, except where they collide with v14 names.

## Summary

| Metric | Count |
| --- | ---: |
| Explicit exports in local `src/index.js` | 171 |
| Explicit exports in v14 `src/index.js` | 232 |
| v14 explicit exports missing locally | 97 |
| Local explicit exports absent from the v14 explicit list | 36 |
| Missing v14 names already implemented under `src/` | 20 |
| v14 class names with no local typings declaration | 83 |
| Missing public members in `Client`, `Message`, `GuildMember`, `VoiceState` | 13 |
| v14 flag aliases exported at runtime but absent from typings | 11 |

Key findings:

- The root entry point is still v13-shaped. The v14 builder, component, interaction, entitlement, subscription, and onboarding names are absent.
- 20 v14 exports already exist as source files but are not re-exported from `src/index.js`. Exporting them is the cheapest large parity gain.
- The 11 v14 flag aliases exist at runtime, but `typings/index.d.ts` does not declare them. TypeScript users cannot import them.
- `Message`, `GuildMember`, and `VoiceState` miss core v14 members. `Message#awaitMessageComponent` and `Message#createMessageComponentCollector` are the largest functional gaps.
- v14 star-exports six external packages. The local entry point has no star exports, so hundreds of v14 names such as `REST`, `Routes`, and `SlashCommandBuilder` are not reachable from the package root.
- All configured checks pass after dependency installation. No source file was changed for this audit.

## 1. Exports present in discord.js v14 but missing here

The 97 explicit names are below. The tables also show whether a local source file already exists.

### 1.1 Star-exported surface

`discord.js@14.28.1` re-exports six packages from its root entry point at `src/index.js` lines 254-259:

- `discord-api-types/v10`
- `@discordjs/builders`
- `@discordjs/formatters`
- `@discordjs/rest`
- `@discordjs/util`
- `@discordjs/ws`

Local `src/index.js` has no `__exportStar` call. Names such as `REST`, `Routes`, `SlashCommandBuilder`, `ContextMenuCommandBuilder`, `ApplicationCommandOptionType`, `ButtonStyle`, `TextInputStyle`, and the discord-api-types enums are therefore missing from the package root. This gap is not counted in the 97 explicit names.

### 1.2 Builders and message structures

| Export | Local source | Notes |
| --- | --- | --- |
| `ActionRow` | — | v13 `MessageActionRow` |
| `ActionRowBuilder` | — | not implemented |
| `Attachment` | — | v13 `MessageAttachment` |
| `AttachmentBuilder` | — | not implemented |
| `ButtonBuilder` | — | v13 `MessageButton` |
| `Embed` | — | v13 `MessageEmbed` |
| `EmbedBuilder` | — | not implemented |
| `ModalBuilder` | — | v13 `Modal` |
| `TextInputBuilder` | — | not implemented |
| `StringSelectMenuBuilder` | — | not implemented |
| `StringSelectMenuOptionBuilder` | — | not implemented |
| `UserSelectMenuBuilder` | — | not implemented |
| `RoleSelectMenuBuilder` | — | not implemented |
| `ChannelSelectMenuBuilder` | — | not implemented |
| `MentionableSelectMenuBuilder` | — | not implemented |
| `SelectMenuBuilder` | — | not implemented; v14 deprecated alias of `StringSelectMenuBuilder` |
| `SelectMenuOptionBuilder` | — | not implemented; v14 deprecated alias of `StringSelectMenuOptionBuilder` |
| `ModalSubmitFields` | — | v13 `ModalSubmitFieldsResolver` exists |

### 1.3 Components

| Export | Local source | Notes |
| --- | --- | --- |
| `BaseSelectMenuComponent` | — | not implemented |
| `ButtonComponent` | — | not implemented |
| `ContainerComponent` | `src/structures/ContainerComponent.js` | exists but not exported |
| `FileComponent` | `src/structures/FileComponent.js` | exists but not exported |
| `LabelComponent` | — | not implemented |
| `SectionComponent` | `src/structures/SectionComponent.js` | exists but not exported |
| `SelectMenuComponent` | — | not implemented; v14 deprecated alias of `StringSelectMenuComponent` |
| `SeparatorComponent` | `src/structures/SeparatorComponent.js` | exists but not exported |
| `StringSelectMenuComponent` | — | not implemented |
| `TextDisplayComponent` | `src/structures/TextDisplayComponent.js` | exists but not exported |
| `ThumbnailComponent` | `src/structures/ThumbnailComponent.js` | exists but not exported |
| `UnfurledMediaItem` | `src/structures/UnfurledMediaItem.js` | exists but not exported |
| `MediaGalleryComponent` | `src/structures/MediaGalleryComponent.js` | exists but not exported |
| `MediaGalleryItem` | `src/structures/MediaGalleryItem.js` | exists but not exported |
| `ChannelSelectMenuComponent` | — | not implemented |
| `MentionableSelectMenuComponent` | — | not implemented |
| `RoleSelectMenuComponent` | — | not implemented |
| `UserSelectMenuComponent` | — | not implemented |

### 1.4 Interactions

| Export | Local source | Notes |
| --- | --- | --- |
| `BaseInteraction` | — | v13 `Interaction` is declared in typings but not exported |
| `InteractionCollector` | `src/structures/InteractionCollector.js` | exists but not exported |
| `InteractionCallback` | — | not implemented |
| `InteractionCallbackResource` | — | not implemented |
| `InteractionCallbackResponse` | — | not implemented |
| `InteractionResponse` | — | not implemented |
| `InteractionWebhook` | `src/structures/InteractionWebhook.js` | exists but not exported |
| `CommandInteraction` | `src/structures/CommandInteraction.js` | v13 class exists; v14 keeps this abstract name |
| `CommandInteractionOptionResolver` | `src/structures/CommandInteractionOptionResolver.js` | exists but not exported |
| `AutocompleteInteraction` | `src/structures/AutocompleteInteraction.js` | exists but not exported |
| `ButtonInteraction` | `src/structures/ButtonInteraction.js` | exists but not exported |
| `ChatInputCommandInteraction` | — | not implemented; v14 name for chat input |
| `ContextMenuCommandInteraction` | — | not implemented |
| `MessageComponentInteraction` | `src/structures/MessageComponentInteraction.js` | exists but not exported |
| `MessageContextMenuCommandInteraction` | — | not implemented |
| `ModalSubmitInteraction` | `src/structures/ModalSubmitInteraction.js` | exists but not exported |
| `PrimaryEntryPointCommandInteraction` | — | not implemented |
| `SelectMenuInteraction` | `src/structures/SelectMenuInteraction.js` | exists but not exported; v14 deprecated alias of `StringSelectMenuInteraction` |
| `StringSelectMenuInteraction` | — | not implemented |
| `ChannelSelectMenuInteraction` | — | not implemented |
| `MentionableSelectMenuInteraction` | — | not implemented |
| `RoleSelectMenuInteraction` | — | not implemented |
| `UserSelectMenuInteraction` | — | not implemented |
| `UserContextMenuCommandInteraction` | — | not implemented |

### 1.5 Managers

| Export | Local source | Notes |
| --- | --- | --- |
| `ApplicationEmojiManager` | — | not implemented |
| `DMMessageManager` | — | not implemented; local has one `MessageManager` |
| `EntitlementManager` | — | not implemented |
| `GuildApplicationCommandManager` | — | not implemented |
| `GuildForumThreadManager` | `src/managers/GuildForumThreadManager.js` | exists but not exported |
| `GuildMessageManager` | — | not implemented; local has one `MessageManager` |
| `GuildSoundboardSoundManager` | — | not implemented |
| `GuildTextThreadManager` | `src/managers/GuildTextThreadManager.js` | exists but not exported |
| `PollAnswerVoterManager` | — | not implemented |
| `SubscriptionManager` | — | not implemented |

### 1.6 Structures

| Export | Local source | Notes |
| --- | --- | --- |
| `ActivityInstance` | — | not implemented |
| `ActivityLocation` | — | not implemented |
| `ApplicationEmoji` | — | not implemented |
| `AuthorizingIntegrationOwners` | — | not implemented |
| `BaseChannel` | — | v13 `Channel` |
| `BaseRole` | — | not implemented |
| `ClientApplication` | — | not implemented; `Client#application` is also missing |
| `Entitlement` | — | not implemented |
| `GuildOnboarding` | — | not implemented |
| `GuildOnboardingPrompt` | — | not implemented |
| `GuildOnboardingPromptOption` | — | not implemented |
| `InviteRole` | — | not implemented |
| `PartialGroupDMChannel` | — | v13 `GroupDMChannel` |
| `SKU` | — | not implemented |
| `SoundboardSound` | — | not implemented |
| `Subscription` | — | not implemented |

### 1.7 Errors

| Export | Local source | Notes |
| --- | --- | --- |
| `DiscordjsError` | — | `src/errors/DJSError.js` builds it internally, but the root entry does not export it |
| `DiscordjsErrorCodes` | — | not implemented as a public export |
| `DiscordjsRangeError` | — | built by `src/errors/DJSError.js`, not exported |
| `DiscordjsTypeError` | — | built by `src/errors/DJSError.js`, not exported |

### 1.8 Flags, events, and utilities

| Export | Local source | Notes |
| --- | --- | --- |
| `ChannelFlagsBitField` | — | local has `ChannelFlags` in `src/util/ChannelFlags.js`, but it is not exported |
| `Colors` | — | not implemented |
| `InviteFlagsBitField` | — | local has `InviteFlags` in `src/util/InviteFlags.js`, but it is not exported |
| `ShardEvents` | — | not implemented |
| `SKUFlagsBitField` | — | not implemented |
| `WebSocketShardEvents` | — | not implemented |

### 1.9 Misc

| Export | Local source | Notes |
| --- | --- | --- |
| `Component` | — | not implemented; v13 `BaseMessageComponent` exists in typings only |

## 2. Exports here with v13-only names and no v14 alias

### 2.1 Runtime exports without a v14 alias

| Local export | Local line | v14 replacement | Alias status |
| --- | --- | --- | --- |
| `MessageActionRow` | `src/index.js:135` | `ActionRowBuilder` / `ActionRow` | Missing |
| `MessageAttachment` | `src/index.js:136` | `AttachmentBuilder` / `Attachment` | Missing |
| `MessageButton` | `src/index.js:137` | `ButtonBuilder` | Missing |
| `MessageEmbed` | `src/index.js:139` | `EmbedBuilder` / `Embed` | Missing |
| `Modal` | `src/index.js:143` | `ModalBuilder` | Missing |
| `GroupDMChannel` | `src/index.js:146` | `PartialGroupDMChannel` | Missing |
| `Channel` | `src/index.js:109` | `BaseChannel` | Missing |
| `StoreChannel` | `src/index.js:158` | None; Discord removed store channels | Remove or deprecate |

The local typings declare only the v13 names. For example, `Message#attachments` uses `MessageAttachment` at `typings/index.d.ts:2240`, and `Message#embeds` uses `MessageEmbed` at `typings/index.d.ts:2258`.

### 2.2 Aliases that exist at runtime but not in typings

`src/index.js` lines 46-56 already export the 11 v14 flag aliases. `typings/index.d.ts` declares none of them. A TypeScript user cannot import these v14 names.

| v13 name | v14 alias | Runtime | Typings |
| --- | --- | --- | --- |
| `ActivityFlags` | `ActivityFlagsBitField` | Yes | Missing |
| `ApplicationFlags` | `ApplicationFlagsBitField` | Yes | Missing |
| `AttachmentFlags` | `AttachmentFlagsBitField` | Yes | Missing |
| `GuildMemberFlags` | `GuildMemberFlagsBitField` | Yes | Missing |
| `Intents` | `IntentsBitField` | Yes | Missing |
| `MessageFlags` | `MessageFlagsBitField` | Yes | Missing |
| `Permissions` | `PermissionsBitField` | Yes | Missing |
| `RoleFlags` | `RoleFlagsBitField` | Yes | Missing |
| `SystemChannelFlags` | `SystemChannelFlagsBitField` | Yes | Missing |
| `ThreadMemberFlags` | `ThreadMemberFlagsBitField` | Yes | Missing |
| `UserFlags` | `UserFlagsBitField` | Yes | Missing |

The declared class members also still use the v13 types. Examples: `Message#flags` is `Readonly<MessageFlags>` at `typings/index.d.ts:2270`, and `GuildMember#flags` is `Readonly<GuildMemberFlags>` at `typings/index.d.ts:1793`.

### 2.3 Typings-only v13 names

These v13 names are declared in `typings/index.d.ts` but are not exported from `src/index.js`. They need a v14 name or an explicit alias.

| Typings name | v14 name | Notes |
| --- | --- | --- |
| `Interaction` | `BaseInteraction` | Runtime class is not exported |
| `BaseMessageComponent` | `Component` | No v14 base component |
| `BaseCommandInteraction` | `CommandInteraction` | Abstract v14 base |
| `ContextMenuInteraction` | `ContextMenuCommandInteraction` | Renamed in v14 |
| `MessageContextMenuInteraction` | `MessageContextMenuCommandInteraction` | Renamed in v14 |
| `UserContextMenuInteraction` | `UserContextMenuCommandInteraction` | Renamed in v14 |
| `MessageSelectMenu` | `StringSelectMenuBuilder` + `StringSelectMenuComponent` | v13 action-row select |
| `ModalSubmitFieldsResolver` | `ModalSubmitFields` | Renamed in v14 |
| `StringSelectInteraction` | `StringSelectMenuInteraction` | Typings use one name; runtime file is `SelectMenuInteraction` |

### 2.4 Runtime exports without a typings declaration

These 15 runtime root exports have no matching value declaration:

`ActivityFlagsBitField`, `ApplicationFlagsBitField`, `AttachmentFlagsBitField`, `Events`, `GuildMemberFlagsBitField`, `IntentsBitField`, `MessageFlagsBitField`, `Partials`, `PermissionsBitField`, `RoleFlagsBitField`, `Status`, `SystemChannelFlagsBitField`, `ThreadMemberFlagsBitField`, `UserFlagsBitField`, `WebSocket`.

`Status` is declared only as `export type Status = number` at `typings/index.d.ts:7830`. It is not declared as the runtime object that `src/util/Status.js` exports. `Events` and `Partials` are also reported in issue #15.

## 3. Missing Client/Message/GuildMember/VoiceState members

These are public members only. Private v14 members such as `Client#_censoredToken` and `Client#_ready` are ignored.

### 3.1 `Client`

| Member | discord.js v14.28.1 | Local typings | Local runtime | Priority |
| --- | --- | --- | --- | --- |
| `application` | `If<Ready, ClientApplication>` (`typings:1159`) | Missing | Missing | P0, tracked in #15 |
| `generateInvite` | `(options?: InviteGenerationOptions): string` (`typings:1187`) | Missing | Missing | P0 |
| `fetchStickerPacks` | Two overloads (`typings:1181-1182`) | Missing | Missing | P0 |
| `deleteWebhook` | `(id, options?: WebhookDeleteOptions): Promise<void>` (`typings:1175`) | Missing | Missing | P1 |
| `destroy` | `Promise<void>` (`typings:1174`) | `void` (`typings:865`) | Synchronous `void` (`src/client/Client.js:349`) | P2 |

Local `Client` has `fetchPremiumStickerPacks` at `typings/index.d.ts:871` and `src/client/Client.js:468`. v14 deprecates that method in favour of `fetchStickerPacks`.

### 3.2 `Message`

| Member | discord.js v14.28.1 | Local typings | Local runtime | Priority |
| --- | --- | --- | --- | --- |
| `awaitMessageComponent` | `typings:2522` | Missing | Missing | P0 |
| `createMessageComponentCollector` | `typings:2527` | Missing | Missing | P0 |
| `interactionMetadata` | `MessageInteractionMetadata \| null` (`typings:2498`) | Missing | Missing | P1 |
| `resolved` | `CommandInteractionResolvedData \| null` (`typings:2509`) | Missing | Missing | P1 |
| `roleSubscriptionData` | `RoleSubscriptionData \| null` (`typings:2508`) | Missing | Missing | P1 |
| `sharedClientTheme` | `SharedClientTheme \| null` (`typings:2515`) | Missing | Missing | P2 |

Local `Message` has `interaction` at `typings/index.d.ts:2264` and `src/structures/Message.js:377`. v14 keeps `interaction` as a deprecated alias for `interactionMetadata`.

The local `InteractionCollector` class exists at `src/structures/InteractionCollector.js:30` and `typings/index.d.ts:2089`, but the root entry does not export it. The two missing methods depend on this collector.

### 3.3 `GuildMember`

| Member | discord.js v14.28.1 | Local typings | Local runtime | Priority |
| --- | --- | --- | --- | --- |
| `dmChannel` | `get dmChannel(): DMChannel \| null` (`typings:1888`) | Missing | Missing | P1 |
| `collectibles` | `Collectibles \| null` (`typings:1887`) | Missing | Missing | P2 |

The local `User` class already has a `dmChannel` getter at `src/structures/User.js:383` and a `collectibles` property. `GuildMember` does not forward either member.

### 3.4 `VoiceState`

| Member | discord.js v14.28.1 | Local typings | Local runtime | Priority |
| --- | --- | --- | --- | --- |
| `edit` | `(options: VoiceStateEditOptions): Promise<this>` (`typings:4337`) | Missing | Missing | P1 |

`VoiceStateEditOptions` has `requestToSpeak?: boolean` and `suppressed?: boolean`. The local class has the two lower-level methods, but no combined `edit` method.

### 3.5 Signature drift in the four classes

| Member | discord.js v14.28.1 | Local |
| --- | --- | --- |
| `Client#destroy` | `Promise<void>` | `void` |
| `GuildMember#edit` | `edit(options: GuildMemberEditOptions)` | `edit(data: GuildMemberEditData, reason?: string)` |
| `GuildMember#setFlags` | `setFlags(flags, reason?: string)` | `setFlags(flags)` |
| `Message#flags` | `Readonly<MessageFlagsBitField>` | `Readonly<MessageFlags>` |
| `Message#mentions` | `MessageMentions<InGuild>` | `MessageMentions` |
| `VoiceState#setRequestToSpeak` | `Promise<this>` | `Promise<void>` |
| `VoiceState#setSuppressed` | `Promise<this>` | `Promise<void>` |
| `VoiceState#streaming` | `boolean \| null` | `boolean` |
| `VoiceState#suppress` | `boolean \| null` | `boolean` |

## 4. Deprecations to mirror

v14 keeps several old APIs as deprecated aliases. The table shows what the local package does today.

| v14 deprecated API | Replacement | Local status | Action |
| --- | --- | --- | --- |
| `Client#fetchPremiumStickerPacks` (`typings:1183-1184`) | `Client#fetchStickerPacks` (`typings:1181-1182`) | Method exists at `typings/index.d.ts:871`; no deprecation tag; replacement missing | Add `fetchStickerPacks`, then deprecate the old method |
| `Message#interaction` (`typings:2496-2497`) | `Message#interactionMetadata` (`typings:2498`) | Property exists at `typings/index.d.ts:2264`; no deprecation tag; replacement missing | Add `interactionMetadata`, then deprecate `interaction` |
| `ApplicationCommand#dmPermission` (`typings:535-536`) | `ApplicationCommand#contexts` | Property exists at `typings/index.d.ts:440`; no deprecation tag; `contexts` missing | Add `contexts`, then deprecate `dmPermission` |
| `Guild#setOwner` (`typings:1739-1740`) | Guild ownership API is no longer usable | Method exists at `typings/index.d.ts:1643`; no deprecation tag | Add deprecation tag |
| `Guild#setMFALevel` (`typings:1751-1752`) | Guild ownership API is no longer usable | Method is missing | Do not add it |
| `BaseInteraction#isSelectMenu` (`typings:2222-2223`) | `BaseInteraction#isStringSelectMenu` | Method exists at `typings/index.d.ts:2085`; no deprecation tag; replacement missing | Add `isStringSelectMenu`, then deprecate the old method |
| `Invite#stageInstance` (`typings:2344-2345`) | Public stage instances no longer exist | Property exists at `typings/index.d.ts:2151`; no deprecation tag | Add deprecation tag |
| `Role#setColor` (`typings:3395`) | `Role#setColors` (`typings:3396`) | Already deprecated and implemented at `typings/index.d.ts:3094-3095` | None |
| `User#avatarDecoration` (`typings:4101`) | `User#avatarDecorationData` | Already deprecated at `typings/index.d.ts:3750-3751` | None |
| `User#fetchFlags` (`typings:4131`) | Flags from `User#fetch` | Method is missing | Do not add it |
| `ThreadMember#remove(reason)` (`typings:4020-4021`) | `reason` does not reach the API | Parameter exists at `typings/index.d.ts:3676`; no deprecation tag | Deprecate the `reason` parameter |
| `PollAnswer#fetchVoters` (`typings:3275-3276`) | `PollAnswerVoterManager#fetch` | Method exists at `typings/index.d.ts:2827`; no deprecation tag; manager missing | Add the manager, then deprecate the method |
| `MessagePayload#isInteraction` (`typings:2809-2810`) | No replacement | Property exists at `typings/index.d.ts:2715`; no deprecation tag | Add deprecation tag |
| `StageInstance#discoverableDisabled` (`typings:3753-3754`) | No replacement | Property exists at `typings/index.d.ts:3358`; no deprecation tag | Add deprecation tag |
| Interaction reply `fetchReply: true` (`typings:661-687`) | `withResponse: true`, or fetch after the call | `fetchReply` overloads exist at `typings/index.d.ts:588-634`; `withResponse` is missing | Add `withResponse`, then deprecate the `fetchReply` option |
| `SelectMenuBuilder`, `SelectMenuOptionBuilder`, `SelectMenuComponent` aliases (`typings:918-921`, `991-992`) | `StringSelectMenu*` names | Names are missing | Add only as deprecated aliases |

## 5. Prioritized top-10 fix list

Effort: S = less than one day, M = one to three days, L = more than three days.

| Rank | Fix | Sections | Impact | Effort | Tracking issue |
| ---: | --- | --- | --- | --- | --- |
| 1 | Add v14 builder and structure names: `EmbedBuilder`, `Embed`, `AttachmentBuilder`, `Attachment`, `ActionRowBuilder`, `ActionRow`, `ButtonBuilder`, `ModalBuilder`, `TextInputBuilder`, and all select-menu builders. Keep v13 names as deprecated aliases. | §1.2, §2.1 | High | L | #17 |
| 2 | Export the 20 v14 classes that already exist under `src/`. Add the missing typings for `SelectMenuInteraction`. | §1.3, §1.4, §1.5 | High | S | #18 |
| 3 | Implement `Message#awaitMessageComponent` and `Message#createMessageComponentCollector`, and export `InteractionCollector`. | §3.2 | High | M | #19 |
| 4 | Add `Client#generateInvite`, `Client#fetchStickerPacks`, and `Client#deleteWebhook`; deprecate `fetchPremiumStickerPacks`. Leave `Client#application` to #15. | §3.1, §4 | High | S-M | #20 |
| 5 | Add `Message#interactionMetadata`, `resolved`, `roleSubscriptionData`, and `sharedClientTheme`; deprecate `interaction`. | §3.2, §4 | High | M-L | #16 |
| 6 | Declare the 11 v14 flag aliases in `typings/index.d.ts`. Replace v13 flag types in class members with the v14 names. Add `ChannelFlagsBitField`, `InviteFlagsBitField`, `SKUFlagsBitField`, `ShardEvents`, `WebSocketShardEvents`, and `Colors`. | §2.2, §1.8 | Medium | S | — |
| 7 | Add `GuildMember#dmChannel`, `GuildMember#collectibles`, and `VoiceState#edit`. Fix the return types of `setRequestToSpeak` and `setSuppressed`. | §3.3, §3.4, §3.5 | Medium | S | — |
| 8 | Add the v14 manager surface. Export the two existing thread managers and add `GuildMessageManager`, `DMMessageManager`, `GuildApplicationCommandManager`, `ApplicationEmojiManager`, `EntitlementManager`, `SubscriptionManager`, `GuildSoundboardSoundManager`, and `PollAnswerVoterManager`. | §1.5 | Medium | M | — |
| 9 | Export the v14 error classes and utilities: `DiscordjsError`, `DiscordjsTypeError`, `DiscordjsRangeError`, `DiscordjsErrorCodes`, plus the star-exported `@discordjs/rest`, `@discordjs/util`, and `@discordjs/ws` surfaces. | §1.1, §1.7 | Medium | S-M | — |
| 10 | Add the v14 feature structures: `ClientApplication`, `ApplicationEmoji`, `Entitlement`, `Subscription`, `SKU`, `SoundboardSound`, `GuildOnboarding*`, `ActivityInstance`, `ActivityLocation`, and `AuthorizingIntegrationOwners`. | §1.6 | Low-Medium | L | — |

Ranks 1-5 are filed as GitHub issues: #17, #18, #19, #20, and #16. The report is the source of truth for the remaining ranks.

## 6. Verification

Commands run from the repository root:

| Command | Result |
| --- | --- |
| `bun install --frozen-lockfile` | 692 packages installed; lockfile unchanged |
| `bun check` | 5/5 packages successful (forced, no cache) |
| `bun lint` | 5/5 packages successful (forced, no cache) |
| `bun test` | 3 pass, 0 fail, 17 expect calls |
| `bun run lint:boundaries` | No dependency violations (3 modules, 2 dependencies) |

Before `bun install`, `bun test` failed because `@discord-ts-selfbot/test-harness` was not installed, and `lint:boundaries` failed because `depcruise` was not on `PATH`. The install fixed both. No tracked file outside this report was changed.

## 7. Method and limits

The export list was extracted from `exports.<name> =` lines in both `src/index.js` files. Class members were extracted from class bodies in both `typings/index.d.ts` files. The audit used the `v14` branch of `discord.js`, which was `14.28.1` on 2026-11-08.

Limits:

- The audit does not test runtime behaviour or payload parsing.
- The audit does not cover subpath imports such as `discord-ts-selfbot/src/...`.
- The audit does not cover selfbot-only features that have no v14 equivalent.
- Counts for class declarations include classes only, not interfaces or type aliases.
