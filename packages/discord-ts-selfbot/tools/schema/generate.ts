import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import pathModule from "node:path";

import ts from "typescript";

type FieldKind = "api" | "selfbot" | "internal" | "relation";

interface ImportSpec {
  from: string;
  named?: string[];
  default?: string;
}

interface EntityConfig {
  imports: ImportSpec[];
  generate?: boolean;
  fields?: Record<string, FieldKind>;
  extends?: string;
  rawType?: { name: string; from: string };
  patchType?: { type: string; from: string };
  fieldTypes?: Record<string, string>;
  extraFields?: { name: string; type: string; kind: FieldKind }[];
}

interface Field {
  name: string;
  type: string;
  publicType: string;
  runtimeType: string;
  optional: boolean;
}

interface Drift {
  entity: string;
  field: string;
  publicType: string;
  runtimeType: string;
}

interface EntityResult {
  name: string;
  file: string;
  fields: Field[];
  assignedNotDeclared: string[];
  declaredNotAssigned: string[];
  drift: Drift[];
  rawType?: { name: string; from: string };
}

const HERE = pathModule.dirname(Bun.fileURLToPath(import.meta.url));
const PKG = pathModule.join(HERE, "..", "..");
const SRC = pathModule.join(PKG, "src");
const TYPINGS = pathModule.join(PKG, "typings");
const ENTITIES = pathModule.join(SRC, "types", "entities");
const SCHEMA = pathModule.join(SRC, "types", "schema.ts");
const TSCONFIG = pathModule.join(PKG, "tsconfig.json");

/**
 * Per-entity import and provenance configuration.
 *
 * `imports` maps type identifiers used by the entity to their module. The
 * generator fails when a type identifier is not covered, so a new field type
 * cannot silently produce an unimported name.
 */
const CONFIG: Record<string, EntityConfig> = {
  AnonymousGuild: {
    extends: "BaseGuildEntity",
    fieldTypes: { description: "string | null" },
    fields: {},
    imports: [
      { from: "../../../typings", named: ["NSFWLevel", "VerificationLevel"] },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawAnonymousGuildData",
    },
  },
  Application: {
    fieldTypes: {
      bot: "User | null",
      id: "Snowflake",
      installParams:
        "{ scopes: string[]; permissions: Readonly<Permissions> } | null",
      integrationTypesConfig: "APIApplicationIntegrationTypesConfigMap | null",
    },
    fields: { commands: "relation", owner: "relation" },
    imports: [
      {
        from: "discord-api-types/v10",
        named: [
          "APIApplicationIntegrationTypesConfigMap",
          "APIUser",
          "ApplicationWebhookEventStatus",
          "ApplicationWebhookEventType",
          "Snowflake",
        ],
      },
      { from: "../../../typings/enums", named: ["ApplicationType"] },
      {
        from: "../../../typings",
        named: [
          "ClientApplicationInstallParams",
          "PartialUser",
          "StaticImageURLOptions",
        ],
      },
      { from: "../../structures/User", named: ["User"] },
      { from: "../../structures/Team", named: ["Team"] },
      { from: "../../structures/Guild", named: ["Guild"] },
      {
        default: "ApplicationCommandManager",
        from: "../../managers/ApplicationCommandManager",
      },
      { default: "ApplicationFlags", from: "../../util/ApplicationFlags" },
      { default: "Permissions", from: "../../util/Permissions" },
    ],
    patchType: { from: "./selfbot/application", type: "ApplicationPatch" },
    rawType: { from: "../../typings/rawDataTypes", name: "RawApplicationData" },
  },
  ApplicationCommand: {
    fieldTypes: {
      permissions:
        "ApplicationCommandPermissionsManager<PermissionsFetchType, PermissionsFetchType, PermissionsFetchType, Guild | null, Snowflake>",
    },
    fields: {},
    generate: false,
    imports: [],
  },
  AutoModerationRule: {
    fieldTypes: {
      exemptChannels: "Collection<Snowflake, GuildChannel>",
      exemptRoles: "Collection<Snowflake, Role>",
    },
    fields: { guild: "relation" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      {
        from: "../../../typings",
        named: [
          "AutoModerationAction",
          "AutoModerationRuleEventType",
          "AutoModerationRuleTriggerType",
          "AutoModerationTriggerMetadata",
        ],
      },
      { from: "../../structures/Guild", named: ["Guild"] },
      { from: "../../structures/Role", named: ["Role"] },
      { from: "../../structures/GuildChannel", named: ["GuildChannel"] },
    ],
    rawType: { from: "discord-api-types/v10", name: "APIAutoModerationRule" },
  },
  AutocompleteInteraction: {
    fieldTypes: {
      options: "Omit<CommandInteractionOptionResolver<Cached>, 'getMessage'>",
    },
    fields: {},
    generate: false,
    imports: [],
  },
  BaseGuild: {
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["GuildFeature", "Snowflake"] },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawBaseGuildData" },
  },
  BaseGuildEmoji: {
    extends: "EmojiEntity",
    fields: { guild: "relation" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "../../structures/Guild", named: ["Guild"] },
      { from: "../../structures/GuildPreview", named: ["GuildPreview"] },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawGuildEmojiData" },
  },
  Channel: {
    fieldTypes: { type: "string" },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { default: "ChannelFlags", from: "../../util/ChannelFlags" },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawChannelData" },
  },
  ClientUser: {
    extends: "UserEntity",
    fields: {
      bio: "selfbot",
      nsfwAllowed: "selfbot",
      phone: "selfbot",
      premiumUsageFlags: "selfbot",
      pronouns: "selfbot",
      purchasedFlags: "selfbot",
    },
    imports: [
      { default: "PremiumUsageFlags", from: "../../util/PremiumUsageFlags" },
      { default: "PurchasedFlags", from: "../../util/PurchasedFlags" },
    ],
    rawType: { from: "./selfbot/user", name: "SelfbotClientUserData" },
  },
  CommandInteraction: {
    fieldTypes: {
      options:
        "Omit<CommandInteractionOptionResolver<Cached>, 'getMessage' | 'getFocused'>",
    },
    fields: {},
    generate: false,
    imports: [],
  },
  ContextMenuInteraction: {
    fieldTypes: {
      options:
        "Omit<CommandInteractionOptionResolver<Cached>, 'getFocused' | 'getMentionable' | 'getRole' | 'getNumber' | 'getInteger' | 'getString' | 'getChannel' | 'getBoolean' | 'getSubcommandGroup' | 'getSubcommand'>",
    },
    fields: {},
    generate: false,
    imports: [],
  },
  Emoji: {
    fields: {},
    imports: [{ from: "discord-api-types/v10", named: ["Snowflake"] }],
    rawType: { from: "../../typings/rawDataTypes", name: "RawEmojiData" },
  },
  Guild: {
    extends: "AnonymousGuildEntity",
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      {
        from: "../../../typings",
        named: [
          "DefaultMessageNotificationLevel",
          "ExplicitContentFilterLevel",
          "IncidentActions",
          "MFALevel",
          "PremiumTier",
        ],
      },
      {
        default: "AutoModerationRuleManager",
        from: "../../managers/AutoModerationRuleManager",
      },
      { default: "GuildBanManager", from: "../../managers/GuildBanManager" },
      {
        default: "GuildChannelManager",
        from: "../../managers/GuildChannelManager",
      },
      {
        default: "GuildEmojiManager",
        from: "../../managers/GuildEmojiManager",
      },
      {
        default: "GuildInviteManager",
        from: "../../managers/GuildInviteManager",
      },
      {
        default: "GuildMemberManager",
        from: "../../managers/GuildMemberManager",
      },
      {
        default: "GuildScheduledEventManager",
        from: "../../managers/GuildScheduledEventManager",
      },
      {
        default: "GuildSettingManager",
        from: "../../managers/GuildSettingManager",
      },
      {
        default: "GuildStickerManager",
        from: "../../managers/GuildStickerManager",
      },
      { default: "PresenceManager", from: "../../managers/PresenceManager" },
      { default: "RoleManager", from: "../../managers/RoleManager" },
      {
        default: "StageInstanceManager",
        from: "../../managers/StageInstanceManager",
      },
      {
        default: "VoiceStateManager",
        from: "../../managers/VoiceStateManager",
      },
      { default: "SystemChannelFlags", from: "../../util/SystemChannelFlags" },
    ],
    patchType: { from: "./selfbot/guild", type: "GuildPatch" },
    rawType: { from: "../../typings/rawDataTypes", name: "RawGuildData" },
  },
  GuildAuditLogs: {
    fieldTypes: { entries: "Collection<Snowflake, GuildAuditLogsEntry<T>>" },
    fields: {},
    generate: false,
    imports: [],
  },
  GuildAuditLogsEntry: {
    fieldTypes: {
      action: "TAction",
      actionType: "TActionType",
      changes: "Array<{ key: string; old?: unknown; new?: unknown }>",
      extra:
        "TAction extends keyof GuildAuditLogsEntryExtraField ? GuildAuditLogsEntryExtraField[TAction] : null",
      target:
        "TTargetType extends keyof GuildAuditLogsEntryTargetField<TActionType> ? GuildAuditLogsEntryTargetField<TActionType>[TTargetType] : Role | GuildEmoji | { id: Snowflake } | null",
      targetType: "TTargetType",
    },
    fields: {},
    generate: false,
    imports: [],
  },
  GuildBoost: {
    fields: {},
    imports: [{ from: "discord-api-types/v10", named: ["Snowflake"] }],
    rawType: { from: "./selfbot/guild-boost", name: "SelfbotGuildBoostData" },
  },
  GuildChannel: {
    fields: { guild: "relation" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "../../structures/Guild", named: ["Guild"] },
      {
        default: "PermissionOverwriteManager",
        from: "../../managers/PermissionOverwriteManager",
      },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawGuildChannelData",
    },
  },
  GuildEmoji: {
    extends: "BaseGuildEmojiEntity",
    extraFields: [{ kind: "internal", name: "_roles", type: "Snowflake[]" }],
    fields: { _roles: "internal", author: "relation", guild: "relation" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "../../structures/User", named: ["User"] },
      { from: "../../structures/Guild", named: ["Guild"] },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawGuildEmojiData" },
  },
  GuildMember: {
    extraFields: [{ kind: "internal", name: "_roles", type: "string[]" }],
    fields: { _roles: "internal", guild: "relation" },
    imports: [
      { from: "../../../typings", named: ["AvatarDecorationData"] },
      { from: "../../structures/Guild", named: ["Guild"] },
      { from: "../../structures/User", named: ["User"] },
      { default: "GuildMemberFlags", from: "../../util/GuildMemberFlags" },
    ],
    patchType: { from: "./selfbot/guild-member", type: "GuildMemberPatch" },
    rawType: { from: "../../typings/rawDataTypes", name: "RawGuildMemberData" },
  },
  GuildPreview: {
    fieldTypes: {
      emojis: "Collection<Snowflake, GuildPreviewEmoji>",
      stickers: "Collection<Snowflake, Sticker>",
    },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["GuildFeature", "Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      {
        default: "GuildPreviewEmoji",
        from: "../../structures/GuildPreviewEmoji",
      },
      { from: "../../structures/Sticker", named: ["Sticker"] },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawGuildPreviewData",
    },
  },
  GuildScheduledEvent: {
    fieldTypes: {
      entityMetadata: "GuildScheduledEventEntityMetadata | null",
      entityType: "GuildScheduledEventEntityType | null",
      name: "string | null",
      privacyLevel: "GuildScheduledEventPrivacyLevel | null",
      status: "GuildScheduledEventStatus | null",
    },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      {
        from: "../../../typings",
        named: [
          "GuildScheduledEventEntityMetadata",
          "GuildScheduledEventEntityType",
          "GuildScheduledEventPrivacyLevel",
          "GuildScheduledEventRecurrenceRule",
          "GuildScheduledEventStatus",
        ],
      },
      { from: "../../structures/User", named: ["User"] },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawGuildScheduledEventData",
    },
  },
  GuildTemplate: {
    fields: { creator: "relation", guild: "relation" },
    imports: [
      {
        from: "discord-api-types/v10",
        named: ["APITemplateSerializedSourceGuild", "Snowflake"],
      },
      { from: "../../structures/User", named: ["User"] },
      { from: "../../structures/Guild", named: ["Guild"] },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawGuildTemplateData",
    },
  },
  Integration: {
    fields: {
      application: "relation",
      guild: "relation",
      role: "relation",
      user: "relation",
    },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      {
        from: "../../../typings",
        named: ["IntegrationAccount", "IntegrationType"],
      },
      { from: "../../structures/Guild", named: ["Guild"] },
      { from: "../../structures/Role", named: ["Role"] },
      { from: "../../structures/User", named: ["User"] },
      {
        default: "IntegrationApplication",
        from: "../../structures/IntegrationApplication",
      },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawIntegrationData" },
  },
  Interaction: {
    fieldTypes: {
      guildId: "Snowflake | null",
      guildLocale: "string | null",
      memberPermissions: "Readonly<Permissions> | null",
    },
    fields: {},
    generate: false,
    imports: [],
  },
  Invite: {
    fieldTypes: {
      channel: "GuildChannel | GroupDMChannel | undefined",
      targetType: "InviteTargetTypes | number | null",
      type: "InviteTypes | number | null",
    },
    fields: {
      guild: "relation",
      guildScheduledEvent: "relation",
      inviter: "relation",
      stageInstance: "relation",
      targetApplication: "relation",
      targetUser: "relation",
    },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      {
        from: "../../../typings/enums",
        named: ["InviteTargetTypes", "InviteTypes"],
      },
      { from: "../../structures/InviteGuild", named: ["InviteGuild"] },
      { from: "../../structures/GroupDMChannel", named: ["GroupDMChannel"] },
      { from: "../../structures/GuildChannel", named: ["GuildChannel"] },
      { from: "../../structures/Guild", named: ["Guild"] },
      { from: "../../structures/User", named: ["User"] },
      {
        default: "IntegrationApplication",
        from: "../../structures/IntegrationApplication",
      },
      {
        default: "InviteStageInstance",
        from: "../../structures/InviteStageInstance",
      },
      {
        from: "../../structures/GuildScheduledEvent",
        named: ["GuildScheduledEvent"],
      },
      { default: "InviteFlags", from: "../../util/InviteFlags" },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawInviteData" },
  },
  InviteStageInstance: {
    fieldTypes: { members: "Collection<Snowflake, GuildMember>" },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      { from: "../../structures/GuildMember", named: ["GuildMember"] },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawInviteStageInstance",
    },
  },
  Message: {
    fieldTypes: {
      attachments: "Collection<Snowflake, MessageAttachment>",
      author: "User | null",
      components: "TopLevelComponent[]",
      content: "string | null",
      guildId: "Snowflake | null",
      interaction: "MessageInteraction | null",
      messageSnapshots: "Collection<Snowflake, Message>",
      pinned: "boolean | null",
      resolved: "CommandInteractionResolvedData | null",
      sharedClientTheme: "SharedClientTheme | null",
      stickers: "Collection<Snowflake, Sticker>",
      system: "boolean | null",
      tts: "boolean | null",
      type: "MessageType | null",
    },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      {
        default: "Application",
        from: "../../structures/interfaces/Application",
      },
      {
        default: "MessageAttachment",
        from: "../../structures/MessageAttachment",
      },
      { default: "MessageEmbed", from: "../../structures/MessageEmbed" },
      { default: "MessageMentions", from: "../../structures/MessageMentions" },
      {
        from: "../../structures/Message",
        named: ["Message", "MessageInteraction"],
      },
      { from: "../../structures/Poll", named: ["Poll"] },
      { from: "../../structures/Sticker", named: ["Sticker"] },
      { default: "ReactionManager", from: "../../managers/ReactionManager" },
      { default: "MessageFlags", from: "../../util/MessageFlags" },
      {
        from: "../../../typings",
        named: [
          "CommandInteractionResolvedData",
          "MessageActivity",
          "MessageCall",
          "MessageInteractionMetadata",
          "MessageReference",
          "MessageSnapshot",
          "MessageType",
          "RoleSubscriptionData",
          "SharedClientTheme",
          "TopLevelComponent",
          "User",
        ],
      },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawMessageData" },
  },
  MessageMentions: {
    fieldTypes: {
      roles: "Collection<Snowflake, Role>",
      users: "Collection<Snowflake, User>",
    },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      { from: "../../structures/Role", named: ["Role"] },
      { from: "../../structures/User", named: ["User"] },
    ],
  },
  MessagePayload: {
    fieldTypes: {
      options: "MessageOptions | WebhookMessageOptions",
      target: "MessageTarget",
    },
    fields: {},
    imports: [
      {
        from: "../../../typings",
        named: [
          "HTTPAttachmentData",
          "MessageOptions",
          "MessageTarget",
          "WebhookMessageOptions",
        ],
      },
      {
        from: "../../../typings/rawDataTypes",
        named: ["RawMessagePayloadData"],
      },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawMessagePayloadData",
    },
  },
  RichPresence: {
    fieldTypes: { metadata: "RichPresenceMetadata" },
    fields: {},
    generate: false,
    imports: [],
  },
  Role: {
    fields: { guild: "relation" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "../../../typings", named: ["RoleColors", "RoleTagData"] },
      { from: "../../structures/Guild", named: ["Guild"] },
      { default: "Permissions", from: "../../util/Permissions" },
      { default: "RoleFlags", from: "../../util/RoleFlags" },
    ],
  },
  StageInstance: {
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "../../../typings", named: ["PrivacyLevel"] },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawStageInstanceData",
    },
  },
  StickerPack: {
    fieldTypes: { stickers: "Collection<Snowflake, Sticker>" },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      { from: "../../structures/Sticker", named: ["Sticker"] },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawStickerPackData" },
  },
  Team: {
    fieldTypes: { members: "Collection<Snowflake, TeamMember>" },
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      { default: "TeamMember", from: "../../structures/TeamMember" },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawTeamData" },
  },
  User: {
    fields: { bannerColor: "selfbot" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      {
        from: "../../../typings",
        named: ["AvatarDecorationData", "Collectibles", "UserPrimaryGuild"],
      },
      { default: "UserFlags", from: "../../util/UserFlags" },
    ],
    rawType: { from: "./selfbot/user", name: "SelfbotUserData" },
  },
  VoiceState: {
    fields: { guild: "relation" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "../../structures/Guild", named: ["Guild"] },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawVoiceStateData" },
  },
  Webhook: {
    fieldTypes: {
      avatar: "string | null",
      channelId: "Snowflake | null",
      guildId: "Snowflake | null",
      name: "string | null",
      sourceGuild: "Guild | APIPartialGuild | null",
    },
    fields: {},
    generate: false,
    imports: [],
  },
  WelcomeScreen: {
    fieldTypes: { welcomeChannels: "Collection<Snowflake, WelcomeChannel>" },
    fields: { guild: "relation" },
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      { from: "../../structures/Guild", named: ["Guild"] },
      {
        from: "../../../typings/enums",
        named: ["InviteTargetTypes", "InviteTypes"],
      },
      { from: "../../structures/InviteGuild", named: ["InviteGuild"] },
      { from: "../../structures/GroupDMChannel", named: ["GroupDMChannel"] },
      { from: "../../structures/GuildChannel", named: ["GuildChannel"] },
      { default: "WelcomeChannel", from: "../../structures/WelcomeChannel" },
    ],
    rawType: {
      from: "../../typings/rawDataTypes",
      name: "RawWelcomeScreenData",
    },
  },
  Widget: {
    fields: {},
    imports: [
      { from: "discord-api-types/v10", named: ["Snowflake"] },
      { from: "@discordjs/collection", named: ["Collection"] },
      { from: "../../../typings", named: ["WidgetChannel"] },
      { default: "WidgetMember", from: "../../structures/WidgetMember" },
    ],
    rawType: { from: "../../typings/rawDataTypes", name: "RawWidgetData" },
  },
};

const BUILTIN_TYPES = new Set([
  "Array",
  "BigInt",
  "Boolean",
  "Date",
  "Error",
  "Function",
  "Map",
  "Number",
  "Object",
  "Omit",
  "Partial",
  "Pick",
  "Promise",
  "Readonly",
  "Record",
  "Required",
  "Set",
  "String",
  "Symbol",
]);

const configFile = ts.readConfigFile(TSCONFIG, ts.sys.readFile);
if (configFile.error) {
  throw new Error(
    ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n")
  );
}
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, PKG);
const program = ts.createProgram({
  options: parsed.options,
  rootNames: parsed.fileNames,
});
const checker = program.getTypeChecker();
const isAssignable = (
  checker as unknown as {
    isTypeAssignableTo: (source: ts.Type, target: ts.Type) => boolean;
  }
).isTypeAssignableTo.bind(checker);
const sourceFiles = new Map(
  program.getSourceFiles().map((sf) => [sf.fileName, sf])
);

function getSource(file: string): ts.SourceFile {
  const sf = sourceFiles.get(ts.sys.resolvePath(file)) ?? sourceFiles.get(file);
  if (!sf) {
    throw new Error(`Source file not found: ${file}`);
  }
  return sf;
}

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = pathModule.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(path, out);
    } else if (entry.name.endsWith(".ts")) {
      out.push(path);
    }
  }
  return out;
}

function findClass(
  sf: ts.SourceFile,
  name: string
): ts.ClassDeclaration | undefined {
  let found: ts.ClassDeclaration | undefined;
  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node) && node.name?.text === name) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

function getThisRoot(expr: ts.Expression): string | undefined {
  if (ts.isPropertyAccessExpression(expr)) {
    if (expr.expression.kind === ts.SyntaxKind.ThisKeyword) {
      return expr.name.text;
    }
    return getThisRoot(expr.expression);
  }
  if (ts.isNonNullExpression(expr) || ts.isParenthesizedExpression(expr)) {
    return getThisRoot(expr.expression);
  }
  return undefined;
}

function collectAssignments(
  classNode: ts.ClassDeclaration
): Map<string, ts.Type[]> {
  const result = new Map<string, ts.Type[]>();
  const add = (prop: string, type: ts.Type): void => {
    const list = result.get(prop) ?? [];
    list.push(type);
    result.set(prop, list);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isBinaryExpression(node)) {
      const { kind } = node.operatorToken;
      if (
        kind >= ts.SyntaxKind.FirstAssignment &&
        kind <= ts.SyntaxKind.LastAssignment
      ) {
        const prop = getThisRoot(node.left);
        if (prop) {
          const rhsOnly =
            kind === ts.SyntaxKind.EqualsToken ||
            kind === ts.SyntaxKind.QuestionQuestionEqualsToken ||
            kind === ts.SyntaxKind.BarBarEqualsToken ||
            kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken;
          add(prop, checker.getTypeAtLocation(rhsOnly ? node.right : node));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(classNode);
  return result;
}

interface Declared {
  name: string;
  typeText: string;
  type: ts.Type;
  optional: boolean;
}

function collectDeclared(
  classNode: ts.ClassDeclaration,
  sf: ts.SourceFile
): Declared[] {
  const out: Declared[] = [];
  for (const member of classNode.members) {
    if (!ts.isPropertyDeclaration(member)) {
      continue;
    }
    const modifiers = ts.getModifiers(member) ?? [];
    if (
      modifiers.some(
        (modifier) =>
          modifier.kind === ts.SyntaxKind.StaticKeyword ||
          modifier.kind === ts.SyntaxKind.PrivateKeyword ||
          modifier.kind === ts.SyntaxKind.ProtectedKeyword
      )
    ) {
      continue;
    }
    const name = member.name.getText(sf);
    if (name.startsWith("#") || !member.type) {
      continue;
    }
    out.push({
      name,
      optional: Boolean(member.questionToken),
      type: checker.getTypeAtLocation(member.type),
      typeText: member.type.getText(sf).replaceAll(/\s+/gu, " ").trim(),
    });
  }
  return out;
}

function safeTypeText(type: ts.Type): string {
  const text = checker
    .typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation)
    .replaceAll(/\s+/gu, " ")
    .trim();
  return text === "any" ? "unknown" : text;
}

function splitTopLevelUnion(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "<" || char === "(" || char === "[" || char === "{") {
      depth += 1;
    } else if (char === ">" || char === ")" || char === "]" || char === "}") {
      depth -= 1;
    }
    if (char === "|" && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

const unionRank = (value: string): number => {
  if (value === "null") {
    return 1;
  }
  if (value === "undefined") {
    return 2;
  }
  return 0;
};

function formatUnion(texts: string[]): string {
  const parts = new Set<string>();
  for (const text of texts) {
    for (const part of splitTopLevelUnion(text)) {
      if (part.trim()) {
        parts.add(part.trim());
      }
    }
  }
  return [...parts]
    .toSorted(
      (left, right) =>
        unionRank(left) - unionRank(right) || left.localeCompare(right)
    )
    .join(" | ");
}

const typingsSf = getSource(pathModule.join(TYPINGS, "index.d.ts"));
const rawSf = getSource(pathModule.join(TYPINGS, "rawDataTypes.d.ts"));
const structureFiles = walkFiles(pathModule.join(SRC, "structures"));
const classFiles = new Map<string, string>();
for (const file of structureFiles) {
  const sf = getSource(file);
  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node) && node.name) {
      classFiles.set(node.name.text, file);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

function findRawAlias(name: string): string | undefined {
  let found: string | undefined;
  rawSf.forEachChild((node) => {
    if (
      ts.isTypeAliasDeclaration(node) &&
      node.name.text === `Raw${name}Data`
    ) {
      found = node.name.text;
    }
  });
  return found;
}

function analyze(name: string, file: string): EntityResult | undefined {
  const typingsClass = findClass(typingsSf, name);
  const srcClass = findClass(getSource(file), name);
  if (!typingsClass || !srcClass) {
    return undefined;
  }
  const declared = collectDeclared(typingsClass, typingsSf);
  const assignments = collectAssignments(srcClass);
  const declaredNames = new Set(declared.map((prop) => prop.name));
  const fields: Field[] = [];
  const drift: Drift[] = [];

  for (const prop of declared) {
    const types = assignments.get(prop.name);
    if (!types?.length) {
      continue;
    }
    const runtimeType = formatUnion(types.map(safeTypeText));
    // The public typings redeclare the classes instead of importing the src
    // classes, so nominal assignability fails even when the printed types are
    // identical. Text equality is the practical identity check across layers.
    const checkAssignable = (type: ts.Type): boolean => {
      if (prop.optional && (type.flags & ts.TypeFlags.Undefined) !== 0) {
        return true;
      }
      if (type.isUnion()) {
        const members = prop.optional
          ? type.types.filter(
              (member) => (member.flags & ts.TypeFlags.Undefined) === 0
            )
          : type.types;
        return members.every((member) => checkAssignable(member));
      }
      try {
        return isAssignable(type, prop.type);
      } catch {
        return false;
      }
    };
    const assignable =
      prop.typeText === runtimeType || types.every(checkAssignable);
    const override = CONFIG[name]?.fieldTypes?.[prop.name];
    fields.push({
      name: prop.name,
      optional: prop.optional,
      publicType: prop.typeText,
      runtimeType,
      type: override ?? (assignable ? prop.typeText : runtimeType),
    });
    if (!override && !assignable) {
      drift.push({
        entity: name,
        field: prop.name,
        publicType: prop.typeText,
        runtimeType,
      });
    }
  }

  const extraFields = CONFIG[name]?.extraFields ?? [];
  for (const extra of extraFields) {
    fields.push({
      name: extra.name,
      optional: false,
      publicType: extra.type,
      runtimeType: extra.type,
      type: extra.type,
    });
  }

  const assignedNames = new Set(assignments.keys());
  const extraNames = new Set(extraFields.map((field) => field.name));
  return {
    assignedNotDeclared: [...assignedNames]
      .filter(
        (prop) =>
          !declaredNames.has(prop) &&
          !extraNames.has(prop) &&
          prop !== "client" &&
          !prop.startsWith("#")
      )
      .toSorted(),
    declaredNotAssigned: declared
      .map((prop) => prop.name)
      .filter((prop) => !assignedNames.has(prop))
      .toSorted(),
    drift,
    fields,
    file,
    name,
  };
}

function kebab(name: string): string {
  return name
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower>-$<upper>")
    .replaceAll(/(?<first>[A-Z])(?<second>[A-Z][a-z])/gu, "$<first>-$<second>")
    .toLowerCase();
}

function identifiers(type: string): Set<string> {
  const out = new Set<string>();
  for (const match of type.matchAll(/[A-Za-z_$][\w$]*/gu)) {
    const [id] = match;
    if (/^[A-Z]/u.test(id) && !BUILTIN_TYPES.has(id)) {
      out.add(id);
    }
  }
  return out;
}

function renderImports(name: string, fields: Field[]): string {
  const config = CONFIG[name];
  if (!config) {
    throw new Error(`No import config for ${name}`);
  }
  const used = new Set<string>();
  for (const field of fields) {
    for (const id of identifiers(field.type)) {
      used.add(id);
    }
  }
  const covered = new Set<string>();
  const lines: string[] = [];
  for (const spec of config.imports) {
    const named = (spec.named ?? []).filter((id) => used.has(id));
    if (spec.default && used.has(spec.default)) {
      lines.push(`import type ${spec.default} from '${spec.from}';`);
      covered.add(spec.default);
    }
    if (named.length) {
      lines.push(`import type { ${named.join(", ")} } from '${spec.from}';`);
      for (const id of named) {
        covered.add(id);
      }
    }
  }
  const missing = [...used].filter((id) => !covered.has(id));
  if (missing.length) {
    throw new Error(`Missing imports for ${name}: ${missing.join(", ")}`);
  }
  return lines.join("\n");
}

function renderFields(fields: Record<string, FieldKind> | undefined): string {
  const entries = Object.entries(fields ?? {});
  if (entries.length === 0) {
    return "Record<never, never>";
  }
  return `{ ${entries.map(([key, value]) => `${key}: '${value}'`).join("; ")} }`;
}

function generateEntity(result: EntityResult): string {
  const file = pathModule.relative(PKG, result.file).replaceAll("\\", "/");
  const config = CONFIG[result.name];
  if (!config) {
    throw new Error(`No import config for ${result.name}`);
  }
  const rawType = result.rawType?.name ?? `Raw${result.name}Data`;
  const extendsImport = config.extends
    ? `import type { ${config.extends} } from './${kebab(config.extends.replace(/Entity$/u, ""))}';\n`
    : "";
  const body = result.fields
    .map(
      (field) => `  ${field.name}${field.optional ? "?" : ""}: ${field.type};`
    )
    .join("\n");
  const extendsClause = config.extends ? ` extends ${config.extends}` : "";
  return `// @generated by tools/schema/generate.ts — do not edit by hand.
// Run \`bun run schema:generate\` from the package to update.

${extendsImport}${renderImports(result.name, result.fields)}

/**
 * The object shape of a \`${result.name}\`.
 *
 * Derived from the public \`${result.name}\` class in \`typings/index.d.ts\` and the
 * assignments in \`${file}\`. The wire shape is \`${rawType}\`.
 */
export interface ${result.name}Entity${extendsClause} {
${body}
}
`;
}

const generatedNames = new Set(Object.keys(CONFIG));

function generateSchema(results: EntityResult[]): string {
  const generated = results
    .filter(
      (result) =>
        result.rawType &&
        generatedNames.has(result.name) &&
        CONFIG[result.name]?.generate !== false
    )
    .toSorted((left, right) => left.name.localeCompare(right.name));
  const rawImports = new Map<string, string[]>();
  const patchImports = new Map<string, string[]>();
  for (const result of generated) {
    const raw = result.rawType;
    if (!raw) {
      continue;
    }
    const rawNames = new Set([...(rawImports.get(raw.from) ?? []), raw.name]);
    rawImports.set(raw.from, [...rawNames]);
    const patch = CONFIG[result.name]?.patchType;
    if (patch) {
      const patchNames = patchImports.get(patch.from) ?? [];
      patchNames.push(patch.type);
      patchImports.set(patch.from, patchNames);
    }
  }
  const imports = [
    ...[...rawImports.entries()]
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(
        ([from, names]) => `import type { ${names.join(", ")} } from '${from}';`
      ),
    ...[...patchImports.entries()]
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(
        ([from, names]) => `import type { ${names.join(", ")} } from '${from}';`
      ),
    ...generated.map(
      (result) =>
        `import type { ${result.name}Entity } from './entities/${kebab(result.name)}';`
    ),
  ].join("\n");
  const entries = generated
    .map((result) => {
      const patch = CONFIG[result.name]?.patchType;
      const patchGeneric = patch ? `, Partial<${patch.type}>` : "";
      return `  ${result.name}: EntityEntry<${result.rawType?.name ?? `Raw${result.name}Data`}, ${result.name}Entity, ${renderFields(
        CONFIG[result.name]?.fields
      )}${patchGeneric}>;`;
    })
    .join("\n");
  return `// @generated by tools/schema/generate.ts — do not edit by hand.
// Run \`bun run schema:generate\` from the package to update.

${imports}

/**
 * The provenance of a field on an entity.
 *
 * - \`api\`: a standard Discord bot API field.
 * - \`selfbot\`: a user-account field that is not in \`discord-api-types\`.
 * - \`internal\`: a cache or bookkeeping field owned by this library.
 * - \`relation\`: a field that points at another structure.
 */
export type FieldKind = 'api' | 'selfbot' | 'internal' | 'relation';

export interface EntityEntry<
  Raw,
  Entity,
  Fields extends Partial<Record<keyof Entity, FieldKind>>,
  Patch = Partial<Raw>,
> {
  raw: Raw;
  entity: Entity;
  fields: Fields;
  patch: Patch;
}

/**
 * The entity database: one row per structure, pairing the wire shape with the
 * object shape and tagging the fields that are not plain API data.
 */
export type EntitySchema = {
${entries}
};

export type EntityName = keyof EntitySchema;
export type RawOf<K extends EntityName> = EntitySchema[K]['raw'];
export type EntityOf<K extends EntityName> = EntitySchema[K]['entity'];
export type PatchOf<K extends EntityName> = EntitySchema[K]['patch'];
`;
}

function normalize(text: string): string {
  return text
    .replaceAll(/import[\s\S]*?from\s+["'][^"']+["'];?/gu, "")
    .replaceAll(/import\s+["'][^"']+["'];?/gu, "")
    .replaceAll(/["']/gu, "")
    .replaceAll(/\s+/gu, "")
    .replaceAll(":|", ":")
    .replaceAll(/[,;]+\}/gu, "}");
}

function checkFile(path: string, content: string): boolean {
  if (!existsSync(path)) {
    console.error(`missing ${pathModule.relative(PKG, path)}`);
    return false;
  }
  const current = readFileSync(path, "utf-8");
  // `bun fmt` may wrap long type entries and reorder imports; compare tokens,
  // not line breaks, quotes, or import order.
  // Formatting itself is enforced separately by `bun fmt:check`.
  const left = normalize(current);
  const right = normalize(content);
  if (left === right) {
    return true;
  }
  let index = 0;
  while (index < left.length && left[index] === right[index]) {
    index += 1;
  }
  console.error(
    `normalized mismatch ${pathModule.relative(PKG, path)} at ${index}`
  );
  console.error(`  actual:   ${left.slice(index, index + 120)}`);
  console.error(`  expected: ${right.slice(index, index + 120)}`);
  const actual = current.split("\n");
  const expected = content.split("\n");
  for (
    let offset = 0;
    offset < Math.max(actual.length, expected.length);
    offset += 1
  ) {
    if (actual[offset] !== expected[offset]) {
      console.error(`mismatch ${pathModule.relative(PKG, path)}:${offset + 1}`);
      console.error(`  actual:   ${actual[offset] ?? "<eof>"}`);
      console.error(`  expected: ${expected[offset] ?? "<eof>"}`);
      break;
    }
  }
  return false;
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const report = args.includes("--report");
const filter =
  args.find((arg) => arg.startsWith("--entity="))?.slice("--entity=".length) ??
  (args.includes("--entity") ? args[args.indexOf("--entity") + 1] : undefined);
const results: EntityResult[] = [];
for (const [name, file] of [...classFiles.entries()].toSorted(
  ([left], [right]) => left.localeCompare(right)
)) {
  if (filter && name !== filter) {
    continue;
  }
  const result = analyze(name, file);
  if (!result) {
    continue;
  }
  const alias = findRawAlias(name);
  result.rawType =
    CONFIG[name]?.rawType ??
    (alias ? { from: "../../typings/rawDataTypes", name: alias } : undefined);
  results.push(result);
}

if (report) {
  const drift = results.flatMap((result) => result.drift);
  console.log(
    JSON.stringify(
      {
        entities: results,
        totals: {
          assignedNotDeclared: results.reduce(
            (sum, result) => sum + result.assignedNotDeclared.length,
            0
          ),
          drift: drift.length,
          entities: results.length,
          fields: results.reduce(
            (sum, result) => sum + result.fields.length,
            0
          ),
        },
      },
      null,
      2
    )
  );
  process.exit(0);
}

if (check) {
  let ok = true;
  for (const result of results) {
    if (
      !generatedNames.has(result.name) ||
      !result.rawType ||
      CONFIG[result.name]?.generate === false
    ) {
      continue;
    }
    ok =
      checkFile(
        pathModule.join(ENTITIES, `${kebab(result.name)}.ts`),
        generateEntity(result)
      ) && ok;
  }
  if (!filter) {
    ok = checkFile(SCHEMA, generateSchema(results)) && ok;
  }

  process.exit(ok ? 0 : 1);
}

mkdirSync(ENTITIES, { recursive: true });
let written = 0;
for (const result of results) {
  if (
    !generatedNames.has(result.name) ||
    !result.rawType ||
    CONFIG[result.name]?.generate === false
  ) {
    continue;
  }
  writeFileSync(
    pathModule.join(ENTITIES, `${kebab(result.name)}.ts`),
    generateEntity(result)
  );
  written += 1;
}
if (!filter) {
  writeFileSync(SCHEMA, generateSchema(results));
}
console.log(`generated ${written} entities`);
