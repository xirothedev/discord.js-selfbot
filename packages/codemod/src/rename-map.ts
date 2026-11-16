// The rename map: the one machine-readable table of legacy-name and
// legacy-option changes to this library's names and options (see GLOSSARY.md).
// Both the codemod rules and the docs parity tables derive from it (ADR 0012).
// Every entry names its docs anchor. `tests/rename-map.test.ts` asserts the
// docs tables and the library's real export set against these rows.

export const SOURCE_PACKAGE = 'discord.js-selfbot-v13';
export const TARGET_PACKAGE = '@discord-selfbot/core';
export const TARGET_VERSION = '^14.0.0';

// v14 button styles are enums from discord-api-types, not root exports of the
// library (migration guide §9). The codemod adds this dependency to user
// projects pinned to the version the library itself depends on.
export const DISCORD_API_TYPES = {
  name: 'discord-api-types',
  version: '^0.38.15',
} as const;

export interface ExportRename {
  readonly from: string;
  readonly to: string;
  readonly anchor: string;
}

export interface MarkerRule {
  readonly id: string;
  readonly names: readonly string[];
  readonly message: string;
  readonly anchor: string;
  // When set, the rule only matches member expressions whose root identifier
  // contains this text, to avoid false positives without type information.
  readonly receiverHint?: string;
}

// Tier 1: user code breaks without the rewrite.
export const tier1ExportRenames: readonly ExportRename[] = [
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'MessageSelectMenu',
    to: 'StringSelectMenuBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'MessageSelectMenuOption',
    to: 'StringSelectMenuOptionBuilder',
  },
];

// Modernization tier (skipped with --no-modernize): old names still run.
export const modernizeExportRenames: readonly ExportRename[] = [
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'MessageActionRow',
    to: 'ActionRowBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'MessageButton',
    to: 'ButtonBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'MessageEmbed',
    to: 'EmbedBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'MessageAttachment',
    to: 'AttachmentBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'Modal',
    to: 'ModalBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'ActionRow',
    to: 'ActionRowBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'Button',
    to: 'ButtonBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'SelectMenu',
    to: 'StringSelectMenuBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'Embed',
    to: 'EmbedBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'Attachment',
    to: 'AttachmentBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'TextInput',
    to: 'TextInputBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'SelectMenuBuilder',
    to: 'StringSelectMenuBuilder',
  },
  {
    anchor: 'getting-started/migration-v13#3-update-builders',
    from: 'SelectMenuOptionBuilder',
    to: 'StringSelectMenuOptionBuilder',
  },
];

// Names the rewrite cannot mechanically fix: they vanished, were typings-only,
// or are not reachable from the package root. The codemod marks them.
export const markerExports: readonly MarkerRule[] = [
  {
    anchor: 'project/v14-parity',
    id: 'removed-modal-fields-resolver',
    message:
      'not exported; use `interaction.fields` (v14 name `ModalSubmitFields`, also unexported)',
    names: ['ModalSubmitFieldsResolver'],
  },
  {
    anchor: 'project/v14-parity',
    id: 'removed-interaction-types',
    message:
      'typings-only in v13; v14 names differ and some are unexported — check v14-parity §2.3',
    names: [
      'Interaction',
      'BaseMessageComponent',
      'BaseCommandInteraction',
      'ContextMenuInteraction',
      'MessageContextMenuInteraction',
      'UserContextMenuInteraction',
    ],
  },
  {
    anchor: 'project/v14-parity',
    id: 'removed-store-channel',
    message: 'Discord removed store channels; delete this usage',
    names: ['StoreChannel'],
  },
  {
    anchor: 'getting-started/migration-v13#9-known-differences',
    id: 'star-export-gap',
    message:
      'not reachable from the package root; import from `discord-api-types/v10`',
    names: [
      'REST',
      'Routes',
      'SlashCommandBuilder',
      'ContextMenuCommandBuilder',
      'ApplicationCommandOptionType',
      'ButtonStyle',
      'TextInputStyle',
    ],
  },
];

// Tier 1: these v13 call sites break against v14 typings or runtime.
export const partialsCastRule = {
  anchor: 'getting-started/migration-v13#5-partials',
  enumImport: 'Partials',
  typeImport: 'PartialTypes',
} as const;

// Modernization tier.
export const methodRenames: readonly ExportRename[] = [
  {
    anchor: 'getting-started/migration-v13#6-new-client-and-message-methods',
    from: 'fetchPremiumStickerPacks',
    to: 'fetchStickerPacks',
  },
];

export const optionKeyRenames: readonly ExportRename[] = [
  { anchor: 'project/v14-parity', from: 'fetchReply', to: 'withResponse' },
];

// ponytail: heuristic member renames have no type information; the receiver hint
// is the guard. Upgrade path: drop the hints once codemod runs are audited and
// false positives measured at zero.
export const heuristicMemberRenames: readonly (ExportRename & {
  receiverHint: string;
})[] = [
  {
    anchor: 'project/v14-parity',
    from: 'setColor',
    receiverHint: 'role',
    to: 'setColors',
  },
  {
    anchor: 'project/v14-parity',
    from: 'interaction',
    receiverHint: 'message',
    to: 'interactionMetadata',
  },
];

export const buttonStyleMap: Readonly<Record<string, string>> = {
  '1': 'Primary',
  '2': 'Secondary',
  '3': 'Success',
  '4': 'Danger',
  '5': 'Link',
  DANGER: 'Danger',
  LINK: 'Link',
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  SUCCESS: 'Success',
};
export const BUTTON_STYLE_IMPORT = {
  from: 'discord-api-types/v10',
  name: 'ButtonStyle',
} as const;
export const SET_STYLE_METHOD = 'setStyle';

// Marker-only rules: never rewritten, always annotated.
export const markerMethods: readonly MarkerRule[] = [
  {
    anchor: 'getting-started/migration-v13#8-risky-mutations-remain-stubbed',
    id: 'stubbed-relationship-mutations',
    message:
      'always throws `Risky action, not finished yet.`; remove or redesign',
    names: [
      'addFriend',
      'deleteRelationship',
      'sendFriendRequest',
      'addBlocked',
    ],
  },
  {
    anchor: 'getting-started/migration-v13#8-risky-mutations-remain-stubbed',
    id: 'mfa-bound-methods',
    message: 'deprecated until an effective MFA implementation exists',
    names: ['bulkBan', 'bulkCreate', 'passLogin'],
  },
  {
    anchor: 'project/safety',
    id: 'destructive-guild-methods',
    message: 'destructive guild mutation — confirm intent',
    names: ['delete', 'leave', 'setOwner'],
    receiverHint: 'guild',
  },
  {
    anchor: 'util/Util',
    id: 'util-remove-mentions',
    message: 'deprecated; use `allowedMentions` in message options',
    names: ['removeMentions'],
    receiverHint: 'util',
  },
];

export const deadEvents: readonly string[] = [
  'autoModerationActionExecution',
  'autoModerationRuleCreate',
  'autoModerationRuleDelete',
  'autoModerationRuleUpdate',
];
export const deadEventsRule = {
  anchor: 'project/safety',
  id: 'dead-automod-handlers',
  message:
    'auto-moderation events never fire for user accounts; remove the handler',
} as const;

export const awaitDestroyRule = {
  anchor: 'project/v14-parity',
  id: 'destroy-returns-void',
  message: '`Client#destroy` returns void in this fork; do not `await` it',
  method: 'destroy',
} as const;

export const destructuredDeprecatedOptions: readonly ExportRename[] = [
  {
    anchor: 'client/ClientOptions',
    from: 'messageCacheLifetime',
    to: 'sweepers.messages.lifetime',
  },
  {
    anchor: 'client/ClientOptions',
    from: 'messageSweepInterval',
    to: 'sweepers.messages.interval',
  },
];

// These call sites must survive every rule byte-identical (parity §3.5
// signature drift). tests/signature-drift.test.ts pins the contract.
export const doNotTouch: readonly string[] = [
  'members.edit',
  'member.edit',
  'members.setFlags',
  'member.setFlags',
  'voice.setRequestToSpeak',
  'voice.setSuppressed',
];

// Companion native dependencies: reported for review, never removed.
export const companionDepsToFlag: readonly string[] = [
  '@discordjs/opus',
  'opusscript',
  'sodium',
  'libsodium-wrappers',
  'erlpack',
];

export const migrationMarker = (
  ruleId: string,
  message: string,
  anchor: string
): string => `TODO(codemod:${ruleId}): ${message} [${anchor}]`;
