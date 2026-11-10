import MessageCollector from "../MessageCollector";
import MessagePayload from "../MessagePayload";
import _ConstantsModule from "../../util/Constants";

const { InteractionTypes, ApplicationCommandOptionTypes, Events } =
  _ConstantsModule;
import _errorsModule from "../../errors";

const { Error } = _errorsModule;
import SnowflakeUtil from "../../util/SnowflakeUtil";
import { setTimeout } from "node:timers";
import { s } from "@sapphire/shapeshift";
import Util from "../../util/Util";
import User from "../User";
import _GuildMemberModule from "../GuildMember";

const { GuildMember } = _GuildMemberModule;
import MessageManager from "../../managers/MessageManager";
import type { Collection } from "@discordjs/collection";
import type { Snowflake } from "discord-api-types/v10";
import type { Client } from "../../client/Client";
import type { Message } from "../Message";
import type { MessageCollectorSourceOptions } from "../MessageCollector";
import type {
  ChannelWebhookCreateOptions,
  UserResolvable,
} from "../../../typings";
import type { SendOptions } from "../../types/channels";
import type { RawMessageData } from "../../../typings/rawDataTypes";
import type { UploadAttachment } from "../../types/uploads";
import type ClientType from "../../client/Client";
import type { Guild } from "../Guild";

const NESTED_ARRAY_FLAT_DEPTH = 2;
const validateName = (stringName: unknown): string =>
  s
    .string()
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(32)
    .regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    .setValidationEnabled(true)
    .parse(stringName);

// Fixes Circular

interface ApplicationCommandIndexChoice {
  name: string;
  value: string | number;
}

interface ApplicationCommandIndexOption {
  type: number;
  name: string;
  name_default?: string | null;
  required?: boolean;
  autocomplete?: boolean;
  choices?: ApplicationCommandIndexChoice[] | null;
  options?: ApplicationCommandIndexOption[];
}

interface ApplicationCommandIndexCommand {
  id: Snowflake;
  application_id: Snowflake;
  guild_id?: Snowflake | null;
  name: string;
  name_default?: string | null;
  version: Snowflake;
  type: number;
  options?: ApplicationCommandIndexOption[];
}

interface ApplicationIndexApplication {
  id: Snowflake;
  bot_id?: Snowflake | null;
}

interface ApplicationCommandIndex {
  applications: ApplicationIndexApplication[];
  application_commands: ApplicationCommandIndexCommand[];
  version: string;
}

interface SlashCommandOptionData {
  type: number;
  name: string;
  value?: unknown;
  focused?: boolean;
  options?: SlashCommandOptionData[];
}

interface SlashCommandAttachment {
  id: number;
  filename: string;
  uploaded_filename: string;
  description?: string;
  duration_secs?: number;
  waveform?: string;
}

interface InteractionPacket {
  d?: {
    nonce?: string;
    choices?: { value?: unknown }[];
  };
}

interface InteractionPostData {
  type: number;
  application_id: Snowflake;
  guild_id: Snowflake | undefined;
  channel_id: Snowflake;
  session_id: string | null | undefined;
  data: {
    version: Snowflake;
    id: Snowflake;
    name: string;
    type: number;
    options: SlashCommandOptionData[];
    attachments: SlashCommandAttachment[];
    guild_id?: Snowflake;
  };
  nonce: Snowflake;
}

type AwaitMessagesSourceOptions = MessageCollectorSourceOptions & {
  errors?: string[];
};

interface SlashCommandContext {
  applicationId: Snowflake;
  channelId: Snowflake;
  client: Client;
  command: ApplicationCommandIndexCommand;
  guildId: Snowflake | undefined;
  subCommand?: ApplicationCommandIndexOption;
  subGroup?: ApplicationCommandIndexOption;
}

function isInteractionPacket(value: unknown): value is InteractionPacket {
  return (
    typeof value === "object" && value !== null && "t" in value && "d" in value
  );
}

function parseChoices(
  parent: string,
  list_choices: ApplicationCommandIndexChoice[] | null | undefined,
  value: unknown
): unknown {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(list_choices) || list_choices.length === 0) {
    return value;
  }
  const choice = list_choices.find(
    (choiceItem) => choiceItem.name === value || choiceItem.value === value
  );
  if (choice) {
    return choice.value;
  }
  throw new Error("INVALID_SLASH_COMMAND_CHOICES", parent, value);
}

async function addDataFromAttachment(
  value: unknown,
  client: Client,
  channelId: Snowflake,
  attachments: SlashCommandAttachment[]
): Promise<{ id: number; attachments: SlashCommandAttachment[] }> {
  const file = await MessagePayload.resolveFile(value);
  const data = await Util.getUploadURL(client, channelId, [file]);
  const [upload] = data;
  if (!upload) {
    throw new Error("INVALID_TYPE", "attachment", "FileOptions");
  }
  await Util.uploadFile(file.file, upload.upload_url);
  const id = attachments.length;
  attachments.push({
    filename: file.name,
    id,
    uploaded_filename: upload.upload_filename,
  });
  return {
    attachments,
    id,
  };
}

function buildAutocompletePostData(
  subGroup: ApplicationCommandIndexOption | undefined,
  subCommand: ApplicationCommandIndexOption | undefined,
  optionCommand: ApplicationCommandIndexOption,
  value: unknown
) {
  if (subGroup) {
    if (!subCommand) {
      throw new Error("SLASH_COMMAND_SUB_COMMAND_INVALID", subGroup.name);
    }
    return [
      {
        name: subGroup.name,
        options: [
          {
            name: subCommand.name,
            options: [
              {
                focused: true,
                name: optionCommand.name,
                type: optionCommand.type,
                value,
              },
            ],
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
          },
        ],
        type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
      },
    ];
  }
  if (subCommand) {
    return [
      {
        name: subCommand.name,
        options: [
          {
            focused: true,
            name: optionCommand.name,
            type: optionCommand.type,
            value,
          },
        ],
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
      },
    ];
  }
  return [
    {
      focused: true,
      name: optionCommand.name,
      type: optionCommand.type,
      value,
    },
  ];
}

function awaitAutocomplete(
  client: Client,
  nonce: Snowflake,
  defaultValue: unknown
): Promise<unknown> {
  const { promise, resolve } = Promise.withResolvers<unknown>();
  const state: {
    handler: (packet: unknown) => void;
    timeout?: NodeJS.Timeout;
  } = { handler: () => null };
  state.handler = (packet: unknown) => {
    if (!isInteractionPacket(packet)) {
      return;
    }
    const payload = packet.d;
    if (!payload || payload.nonce !== nonce) {
      return;
    }
    if (state.timeout) {
      clearTimeout(state.timeout);
    }
    client.removeListener(Events.UNHANDLED_PACKET, state.handler);
    client.decrementMaxListeners();
    if (payload.choices && payload.choices.length >= 1) {
      resolve(payload.choices[0]?.value);
    } else {
      resolve(defaultValue);
    }
  };
  state.timeout = setTimeout(() => {
    client.removeListener(Events.UNHANDLED_PACKET, state.handler);
    client.decrementMaxListeners();
    resolve(defaultValue);
  }, 5000).unref();
  client.incrementMaxListeners();
  client.on(Events.UNHANDLED_PACKET, state.handler);
  return promise;
}

function createPostData(
  client: Client,
  applicationId: Snowflake,
  nonce: Snowflake,
  guildId: Snowflake | undefined,
  isGuildCommand: boolean,
  channelId: Snowflake,
  commandVersion: Snowflake,
  commandId: Snowflake,
  commandName: string,
  commandType: number,
  postData: SlashCommandOptionData[],
  attachments: SlashCommandAttachment[] = [],
  isAutocomplete = false
): InteractionPostData {
  const data: InteractionPostData = {
    application_id: applicationId,
    channel_id: channelId,
    data: {
      attachments,
      id: commandId,
      name: commandName,
      options: postData,
      type: commandType,
      version: commandVersion,
    },
    guild_id: guildId,
    nonce,
    session_id: client.sessionId,
    type: isAutocomplete
      ? InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE
      : InteractionTypes.APPLICATION_COMMAND,
  };
  if (isGuildCommand) {
    data.data.guild_id = guildId;
  }
  return data;
}

async function parseOption(
  client: Client,
  optionCommand: ApplicationCommandIndexOption,
  value: unknown,
  optionFormat: SlashCommandOptionData[],
  attachmentsInput: SlashCommandAttachment[],
  command: ApplicationCommandIndexCommand,
  applicationId: Snowflake,
  guildId: Snowflake | undefined,
  channelId: Snowflake,
  subGroup: ApplicationCommandIndexOption | undefined,
  subCommand: ApplicationCommandIndexOption | undefined
): Promise<{
  optionFormat: SlashCommandOptionData[];
  attachments: SlashCommandAttachment[];
}> {
  const data: SlashCommandOptionData = {
    name: optionCommand.name,
    type: optionCommand.type,
  };
  let attachments = attachmentsInput;
  if (value !== undefined) {
    switch (optionCommand.type) {
      case ApplicationCommandOptionTypes.BOOLEAN: {
        data.value = Boolean(value);
        break;
      }
      case ApplicationCommandOptionTypes.INTEGER: {
        data.value = Number(value);
        break;
      }
      case ApplicationCommandOptionTypes.ATTACHMENT: {
        const { attachments: nextAttachments, id } =
          await addDataFromAttachment(value, client, channelId, attachments);
        data.value = id;
        attachments = nextAttachments;
        break;
      }
      case ApplicationCommandOptionTypes.SUB_COMMAND_GROUP: {
        break;
      }
      default: {
        const resolvedValue = parseChoices(
          optionCommand.name,
          optionCommand.choices,
          value
        );
        if (optionCommand.autocomplete) {
          const nonce = SnowflakeUtil.generate();
          const body = createPostData(
            client,
            applicationId,
            nonce,
            guildId,
            Boolean(command.guild_id),
            channelId,
            command.version,
            command.id,
            command.name_default || command.name,
            command.type,
            buildAutocompletePostData(
              subGroup,
              subCommand,
              optionCommand,
              resolvedValue
            ),
            [],
            true
          );
          await client.api.interactions.post({
            data: body,
          });
          data.value = await awaitAutocomplete(client, nonce, resolvedValue);
        } else {
          data.value = resolvedValue;
        }
      }
    }
    optionFormat.push(data);
  }
  return {
    attachments,
    optionFormat,
  };
}

async function parseSlashArguments(
  context: SlashCommandContext,
  args: unknown[],
  optionsMaxdepth: ApplicationCommandIndexOption[]
): Promise<{
  attachments: SlashCommandAttachment[];
  optionFormat: SlashCommandOptionData[];
}> {
  const parseAtIndex = async (
    index: number,
    optionFormat: SlashCommandOptionData[],
    attachments: SlashCommandAttachment[]
  ): Promise<{
    attachments: SlashCommandAttachment[];
    optionFormat: SlashCommandOptionData[];
  }> => {
    if (index >= Math.min(args.length, optionsMaxdepth.length)) {
      return { attachments, optionFormat };
    }
    const parseData = await parseOption(
      context.client,
      optionsMaxdepth[index],
      args[index],
      optionFormat,
      attachments,
      context.command,
      context.applicationId,
      context.guildId,
      context.channelId,
      context.subGroup,
      context.subCommand
    );
    return parseAtIndex(
      index + 1,
      parseData.optionFormat,
      parseData.attachments
    );
  };
  return parseAtIndex(0, [], []);
}

// Utils
function parseCommandName(commandNameString: string) {
  const cmd = commandNameString.trim().split(" ");
  const commandName = validateName(cmd[0]);
  const sub = cmd.slice(1);
  for (const part of sub) {
    if (sub.length > 2) {
      throw new Error("INVALID_COMMAND_NAME", cmd);
    }
    validateName(part);
  }
  return { commandName, sub };
}

function findSlashCommand(
  client: Client,
  data: Pick<ApplicationCommandIndex, "applications" | "application_commands">,
  commandName: string,
  botOrApplicationId: UserResolvable
) {
  const filterCommand = data.application_commands.filter(
    (obj: ApplicationCommandIndexCommand) =>
      [obj.name, obj.name_default].includes(commandName)
  );
  const resolvedId = client.users.resolveId(botOrApplicationId);
  const application = data.applications.find(
    (obj: ApplicationIndexApplication) =>
      obj.id === resolvedId || obj.bot_id === resolvedId
  );
  if (!application) {
    throw new Error(
      "INVALID_APPLICATION_COMMAND",
      "Bot/Application doesn't exist"
    );
  }
  const command = filterCommand.find(
    (candidate: ApplicationCommandIndexCommand) =>
      candidate.application_id === application.id
  );
  if (!command) {
    throw new Error("INVALID_APPLICATION_COMMAND", application.id);
  }
  return { application, command };
}

function resolveSubcommandOptions(
  command: ApplicationCommandIndexCommand,
  sub: string[]
) {
  if (sub.length === 2) {
    const subGroup = (command.options ?? []).find(
      (obj: ApplicationCommandIndexOption) =>
        obj.type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP &&
        [obj.name, obj.name_default].includes(sub[0])
    );
    if (!subGroup) {
      throw new Error("SLASH_COMMAND_SUB_COMMAND_GROUP_INVALID", sub[0]);
    }
    const subCommand = (subGroup.options ?? []).find(
      (obj: ApplicationCommandIndexOption) =>
        obj.type === ApplicationCommandOptionTypes.SUB_COMMAND &&
        [obj.name, obj.name_default].includes(sub[1])
    );
    if (!subCommand) {
      throw new Error("SLASH_COMMAND_SUB_COMMAND_INVALID", sub[1]);
    }
    return { optionsMaxdepth: subCommand.options ?? [], subCommand, subGroup };
  }
  if (sub.length === 1) {
    const subCommand = (command.options ?? []).find(
      (obj: ApplicationCommandIndexOption) =>
        obj.type === ApplicationCommandOptionTypes.SUB_COMMAND &&
        [obj.name, obj.name_default].includes(sub[0])
    );
    if (!subCommand) {
      throw new Error("SLASH_COMMAND_SUB_COMMAND_INVALID", sub[0]);
    }
    return {
      optionsMaxdepth: subCommand.options ?? [],
      subCommand,
      subGroup: undefined,
    };
  }
  return {
    optionsMaxdepth: command.options ?? [],
    subCommand: undefined,
    subGroup: undefined,
  };
}

function buildSlashPostData(
  subGroup: ApplicationCommandIndexOption | undefined,
  subCommand: ApplicationCommandIndexOption | undefined,
  optionFormat: SlashCommandOptionData[]
) {
  if (subGroup) {
    if (!subCommand) {
      throw new Error("SLASH_COMMAND_SUB_COMMAND_INVALID", subGroup.name);
    }
    return [
      {
        name: subGroup.name,
        options: [
          {
            name: subCommand.name,
            options: optionFormat,
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
          },
        ],
        type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
      },
    ];
  }
  if (subCommand) {
    return [
      {
        name: subCommand.name,
        options: optionFormat,
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
      },
    ];
  }
  return optionFormat;
}

class TextBasedChannel {
  declare client: ClientType;
  declare id: Snowflake;
  declare parentId?: Snowflake | null;
  declare guild?: Guild | null;
  declare guildId?: Snowflake | null;
  declare messages: MessageManager;
  declare lastMessageId: Snowflake | null;
  declare lastPinTimestamp: number | null;
  declare edit: (
    options: Record<string, unknown>,
    reason?: string
  ) => Promise<this>;
  constructor() {
    this.messages = new MessageManager(this);

    this.lastMessageId = null;

    this.lastPinTimestamp = null;
  }

  get lastMessage() {
    return this.messages.resolve(this.lastMessageId);
  }

  get lastPinAt() {
    return this.lastPinTimestamp ? new Date(this.lastPinTimestamp) : null;
  }

  async send(options: SendOptions) {
    if (this instanceof User || this instanceof GuildMember) {
      const dm = await this.createDM();
      return dm.send(options);
    }

    const messagePayload =
      options instanceof MessagePayload
        ? options.resolveData()
        : MessagePayload.create(this, options).resolveData();

    const { data, files } = await messagePayload.resolveFiles();
    const fileList = files ?? [];
    // New API
    const attachments = await Util.getUploadURL(this.client, this.id, fileList);
    const requestPromises = attachments.map(
      async (attachment: UploadAttachment) => {
        const file = fileList[Number(attachment.id)];
        if (!file) {
          throw new Error("INVALID_TYPE", "attachment", "FileOptions");
        }
        await Util.uploadFile(file.file, attachment.upload_url);
        return {
          description: file.description,
          duration_secs: file.duration_secs,
          filename: file.name,
          id: attachment.id,
          uploaded_filename: attachment.upload_filename,
          waveform: file.waveform,
        };
      }
    );
    const attachmentsData = await Promise.all(requestPromises);
    attachmentsData.sort(
      (left, right) =>
        Math.trunc(Number(left.id)) - Math.trunc(Number(right.id))
    );
    if (data) {
      Object.assign(data, { attachments: attachmentsData });
    }
    // Empty Files
    const d = await this.client.api.channels[
      this.id
    ].messages.post<RawMessageData>({ data });

    return this.messages.cache.get(d.id) ?? this.messages._add(d);
  }

  searchInteractionFromGuildAndPrivateChannel(): Promise<ApplicationCommandIndex> {
    // Support Slash / ContextMenu
    // API https://canary.discord.com/api/v9/guilds/:id/application-command-index // Guild
    //     https://canary.discord.com/api/v9/channels/:id/application-command-index // DM Channel
    // Updated: 07/01/2023
    return this.client.api[this.guild ? "guilds" : "channels"][
      this.guild?.id || this.id
    ]["application-command-index"]
      .get<ApplicationCommandIndex>()
      .catch(() => ({
        application_commands: [],
        applications: [],
        version: "",
      }));
  }

  searchInteractionUserApps(): Promise<ApplicationCommandIndex> {
    return this.client.api.users["@me"]["application-command-index"]
      .get<ApplicationCommandIndex>()
      .catch(() => ({
        application_commands: [],
        applications: [],
        version: "",
      }));
  }

  searchInteraction(): Promise<
    Pick<ApplicationCommandIndex, "applications" | "application_commands">
  > {
    return Promise.all([
      this.searchInteractionFromGuildAndPrivateChannel(),
      this.searchInteractionUserApps(),
    ]).then(
      ([dataA, dataB]: [ApplicationCommandIndex, ApplicationCommandIndex]) => ({
        application_commands: [
          ...dataA.application_commands,
          ...dataB.application_commands,
        ],
        applications: [...dataA.applications, ...dataB.applications],
      })
    );
  }

  async sendSlash(
    botOrApplicationId: UserResolvable,
    commandNameString: string,
    ...args: unknown[]
  ) {
    const { commandName, sub } = parseCommandName(commandNameString);
    const data = await this.searchInteraction();
    const { application, command } = findSlashCommand(
      this.client,
      data,
      commandName,
      botOrApplicationId
    );
    const { subGroup, subCommand, optionsMaxdepth } = resolveSubcommandOptions(
      command,
      sub
    );
    const context: SlashCommandContext = {
      applicationId: application.id,
      channelId: this.id,
      client: this.client,
      command,
      guildId: this.guild?.id,
      subCommand,
      subGroup,
    };
    const { attachments, optionFormat } = await parseSlashArguments(
      context,
      args.flat(NESTED_ARRAY_FLAT_DEPTH),
      optionsMaxdepth
    );
    const valueRequired = optionsMaxdepth.filter(
      (option) => option.required
    ).length;
    if (valueRequired > args.length) {
      throw new Error(
        "SLASH_COMMAND_REQUIRED_OPTIONS_MISSING",
        valueRequired,
        optionFormat.length
      );
    }
    const postData = buildSlashPostData(subGroup, subCommand, optionFormat);
    const nonce = SnowflakeUtil.generate();
    const body = createPostData(
      this.client,
      application.id,
      nonce,
      this.guild?.id,
      Boolean(command.guild_id),
      this.id,
      command.version,
      command.id,
      command.name_default || command.name,
      command.type,
      postData,
      attachments,
      false
    );
    this.client.api.interactions.post({
      data: body,
      usePayloadJSON: true,
    });
    return Util.createPromiseInteraction(this.client, nonce, 5000);
  }

  sendTyping() {
    return this.client.api.channels(this.id).typing.post();
  }

  createMessageCollector(options: MessageCollectorSourceOptions = {}) {
    return new MessageCollector(this, options);
  }

  awaitMessages(options: AwaitMessagesSourceOptions = {}) {
    const { promise, reject, resolve } =
      Promise.withResolvers<Collection<Snowflake, Message>>();
    const collector = this.createMessageCollector(options);
    collector.once(
      "end",
      (collection: Collection<Snowflake, Message>, reason: string) => {
        if (options.errors?.includes(reason)) {
          reject(collection);
        } else {
          resolve(collection);
        }
      }
    );
    return promise;
  }

  fetchWebhooks() {
    const { guild } = this;
    if (!guild) {
      throw new Error("GUILD_NOT_FOUND");
    }
    return guild.channels.fetchWebhooks(this.id);
  }

  createWebhook(name: string, options: ChannelWebhookCreateOptions = {}) {
    const { guild } = this;
    if (!guild) {
      throw new Error("GUILD_NOT_FOUND");
    }
    return guild.channels.createWebhook(this.id, name, options);
  }

  setRateLimitPerUser(rateLimitPerUser: number, reason?: string) {
    return this.edit({ rateLimitPerUser }, reason);
  }

  setNSFW(nsfw = true, reason?: string) {
    return this.edit({ nsfw }, reason);
  }

  static applyToClass(
    structure: { prototype: object },
    full = false,
    ignore: string[] = []
  ) {
    const props = ["send"];
    if (full) {
      props.push(
        "sendSlash",
        "searchInteraction",
        "searchInteractionFromGuildAndPrivateChannel",
        "searchInteractionUserApps",
        "lastMessage",
        "lastPinAt",
        "sendTyping",
        "createMessageCollector",
        "awaitMessages",
        "fetchWebhooks",
        "createWebhook",
        "setRateLimitPerUser",
        "setNSFW"
      );
    }
    for (const prop of props) {
      if (ignore.includes(prop)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(
        TextBasedChannel.prototype,
        prop
      );
      if (descriptor) {
        Object.defineProperty(structure.prototype, prop, descriptor);
      }
    }
  }
}

export default TextBasedChannel;
export { TextBasedChannel };
