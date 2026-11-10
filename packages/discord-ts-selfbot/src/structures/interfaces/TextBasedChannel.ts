import MessageCollector from '../MessageCollector';
import MessagePayload from '../MessagePayload';
import _ConstantsModule from '../../util/Constants';
const { InteractionTypes, ApplicationCommandOptionTypes, Events } = _ConstantsModule;
import _errorsModule from '../../errors';
const { Error } = _errorsModule;
import SnowflakeUtil from '../../util/SnowflakeUtil';
import { setTimeout } from 'node:timers';
import { s } from '@sapphire/shapeshift';
import Util from '../../util/Util';
import User from '../User';
import _GuildMemberModule from '../GuildMember';
const { GuildMember } = _GuildMemberModule;
import MessageManager from '../../managers/MessageManager';
import type { Collection } from '@discordjs/collection';
import type { Snowflake } from 'discord-api-types/v10';
import type { Client } from '../../client/Client';
import type { Message } from '../Message';
import type { MessageCollectorSourceOptions } from '../MessageCollector';
import type { ChannelWebhookCreateOptions, UserResolvable } from '../../../typings';
import type { SendOptions } from '../../types/channels';
import type { RawMessageData } from '../../../typings/rawDataTypes';
import type { UploadAttachment } from '../../types/uploads';
/* eslint-disable import/order */
const validateName = (stringName: unknown): string =>
  s
    .string()
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(32)
    .regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    .setValidationEnabled(true)
    .parse(stringName);

class TextBasedChannel {
  declare client: import('../../client/Client').default;
  declare id: import('discord-api-types/v10').Snowflake;
  declare parentId?: import('discord-api-types/v10').Snowflake | null;
  declare guild?: import('../Guild').Guild | null;
  declare guildId?: import('discord-api-types/v10').Snowflake | null;
  declare messages: MessageManager;
  declare lastMessageId: import('discord-api-types/v10').Snowflake | null;
  declare lastPinTimestamp: number | null;
  declare edit: (options: Record<string, unknown>, reason?: string) => Promise<this>;
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

    let messagePayload;

    if (options instanceof MessagePayload) {
      messagePayload = options.resolveData();
    } else {
      messagePayload = MessagePayload.create(this, options).resolveData();
    }

    const { data, files } = await messagePayload.resolveFiles();
    const fileList = files ?? [];
    // New API
    const attachments = await Util.getUploadURL(this.client, this.id, fileList);
    const requestPromises = attachments.map(async (attachment: UploadAttachment) => {
      const file = fileList[Number(attachment.id)];
      if (!file) throw new Error('INVALID_TYPE', 'attachment', 'FileOptions');
      await Util.uploadFile(file.file, attachment.upload_url);
      return {
        id: attachment.id,
        filename: file.name,
        uploaded_filename: attachment.upload_filename,
        description: file.description,
        duration_secs: file.duration_secs,
        waveform: file.waveform,
      };
    });
    const attachmentsData = await Promise.all(requestPromises);
    attachmentsData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    if (data) Object.assign(data, { attachments: attachmentsData });
    // Empty Files
    const d = await this.client.api.channels[this.id].messages.post<RawMessageData>({ data });

    return this.messages.cache.get(d.id) ?? this.messages._add(d);
  }

  searchInteractionFromGuildAndPrivateChannel(): Promise<ApplicationCommandIndex> {
    // Support Slash / ContextMenu
    // API https://canary.discord.com/api/v9/guilds/:id/application-command-index // Guild
    //     https://canary.discord.com/api/v9/channels/:id/application-command-index // DM Channel
    // Updated: 07/01/2023
    return this.client.api[this.guild ? 'guilds' : 'channels'][this.guild?.id || this.id]['application-command-index']
      .get<ApplicationCommandIndex>()
      .catch(() => ({
        application_commands: [],
        applications: [],
        version: '',
      }));
  }

  searchInteractionUserApps(): Promise<ApplicationCommandIndex> {
    return this.client.api.users['@me']['application-command-index'].get<ApplicationCommandIndex>().catch(() => ({
      application_commands: [],
      applications: [],
      version: '',
    }));
  }

  searchInteraction(): Promise<Pick<ApplicationCommandIndex, 'applications' | 'application_commands'>> {
    return Promise.all([this.searchInteractionFromGuildAndPrivateChannel(), this.searchInteractionUserApps()]).then(
      ([dataA, dataB]: [ApplicationCommandIndex, ApplicationCommandIndex]) => ({
        applications: [...dataA.applications, ...dataB.applications],
        application_commands: [...dataA.application_commands, ...dataB.application_commands],
      }),
    );
  }

  async sendSlash(botOrApplicationId: UserResolvable, commandNameString: string, ...args: unknown[]) {
    // Parse commandName /role add user
    const cmd = commandNameString.trim().split(' ');
    // Ex: role add user => [role, add, user]
    // Parse:               name, subGr, sub
    const commandName = validateName(cmd[0]);
    // Parse: role
    const sub = cmd.slice(1);
    // Parse: [add, user]
    for (let i = 0; i < sub.length; i++) {
      if (sub.length > 2) {
        throw new Error('INVALID_COMMAND_NAME', cmd);
      }
      validateName(sub[i]);
    }
    // Search all
    const data = await this.searchInteraction();
    // Find command...
    const filterCommand = data.application_commands.filter((obj: ApplicationCommandIndexCommand) =>
      // Filter: name | name_default
      [obj.name, obj.name_default].includes(commandName),
    );
    // Filter Bot
    const resolvedId = this.client.users.resolveId(botOrApplicationId);
    const application = data.applications.find(
      (obj: ApplicationIndexApplication) => obj.id === resolvedId || obj.bot_id === resolvedId,
    );
    if (!application) {
      throw new Error('INVALID_APPLICATION_COMMAND', "Bot/Application doesn't exist");
    }
    // Find Command with application
    const command = filterCommand.find(
      (command: ApplicationCommandIndexCommand) => command.application_id === application.id,
    );
    if (!command) {
      throw new Error('INVALID_APPLICATION_COMMAND', application.id);
    }
    args = args.flat(2);
    let optionFormat: SlashCommandOptionData[] = [];
    let attachments: SlashCommandAttachment[] = [];
    let optionsMaxdepth: ApplicationCommandIndexOption[] = [];
    let subGroup: ApplicationCommandIndexOption | undefined;
    let subCommand: ApplicationCommandIndexOption | undefined;
    if (sub.length == 2) {
      // Subcommand Group > Subcommand
      // Find Sub group
      subGroup = (command.options ?? []).find(
        (obj: ApplicationCommandIndexOption) =>
          obj.type == ApplicationCommandOptionTypes.SUB_COMMAND_GROUP && [obj.name, obj.name_default].includes(sub[0]),
      );
      if (!subGroup) throw new Error('SLASH_COMMAND_SUB_COMMAND_GROUP_INVALID', sub[0]);
      // Find Sub
      subCommand = (subGroup.options ?? []).find(
        (obj: ApplicationCommandIndexOption) =>
          obj.type == ApplicationCommandOptionTypes.SUB_COMMAND && [obj.name, obj.name_default].includes(sub[1]),
      );
      if (!subCommand) throw new Error('SLASH_COMMAND_SUB_COMMAND_INVALID', sub[1]);
      // Options
      optionsMaxdepth = subCommand.options ?? [];
    } else if (sub.length == 1) {
      // Subcommand
      subCommand = (command.options ?? []).find(
        (obj: ApplicationCommandIndexOption) =>
          obj.type == ApplicationCommandOptionTypes.SUB_COMMAND && [obj.name, obj.name_default].includes(sub[0]),
      );
      if (!subCommand) throw new Error('SLASH_COMMAND_SUB_COMMAND_INVALID', sub[0]);
      // Options
      optionsMaxdepth = subCommand.options ?? [];
    } else {
      optionsMaxdepth = command.options ?? [];
    }
    const valueRequired = optionsMaxdepth.filter((o: ApplicationCommandIndexOption) => o.required).length;
    for (let i = 0; i < Math.min(args.length, optionsMaxdepth.length); i++) {
      const optionInput = optionsMaxdepth[i];
      const value = args[i];
      const parseData = await parseOption(
        this.client,
        optionInput,
        value,
        optionFormat,
        attachments,
        command,
        application.id,
        this.guild?.id,
        this.id,
        subGroup,
        subCommand,
      );
      optionFormat = parseData.optionFormat;
      attachments = parseData.attachments;
    }
    if (valueRequired > args.length) {
      throw new Error('SLASH_COMMAND_REQUIRED_OPTIONS_MISSING', valueRequired, optionFormat.length);
    }
    // Post
    let postData: SlashCommandOptionData[];
    if (subGroup) {
      if (!subCommand) throw new Error('SLASH_COMMAND_SUB_COMMAND_INVALID', subGroup.name);
      postData = [
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
          name: subGroup.name,
          options: [
            {
              type: ApplicationCommandOptionTypes.SUB_COMMAND,
              name: subCommand.name,
              options: optionFormat,
            },
          ],
        },
      ];
    } else if (subCommand) {
      postData = [
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: subCommand.name,
          options: optionFormat,
        },
      ];
    } else {
      postData = optionFormat;
    }
    const nonce = SnowflakeUtil.generate();
    const body = createPostData(
      this.client,
      false,
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
    return new Promise<Collection<Snowflake, Message>>((resolve, reject) => {
      const collector = this.createMessageCollector(options);
      collector.once('end', (collection: Collection<Snowflake, Message>, reason: string) => {
        if (options.errors?.includes(reason)) {
          reject(collection);
        } else {
          resolve(collection);
        }
      });
    });
  }

  fetchWebhooks() {
    return this.guild!.channels.fetchWebhooks(this.id);
  }

  createWebhook(name: string, options: ChannelWebhookCreateOptions = {}) {
    return this.guild!.channels.createWebhook(this.id, name, options);
  }

  setRateLimitPerUser(rateLimitPerUser: number, reason?: string) {
    return this.edit({ rateLimitPerUser }, reason);
  }

  setNSFW(nsfw = true, reason?: string) {
    return this.edit({ nsfw }, reason);
  }

  static applyToClass(structure: { prototype: object }, full = false, ignore: string[] = []) {
    const props = ['send'];
    if (full) {
      props.push(
        'sendSlash',
        'searchInteraction',
        'searchInteractionFromGuildAndPrivateChannel',
        'searchInteractionUserApps',
        'lastMessage',
        'lastPinAt',
        'sendTyping',
        'createMessageCollector',
        'awaitMessages',
        'fetchWebhooks',
        'createWebhook',
        'setRateLimitPerUser',
        'setNSFW',
      );
    }
    for (const prop of props) {
      if (ignore.includes(prop)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(TextBasedChannel.prototype, prop);
      if (descriptor) Object.defineProperty(structure.prototype, prop, descriptor);
    }
  }
}

export default TextBasedChannel;
export { TextBasedChannel };

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
  t?: string;
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

type AwaitMessagesSourceOptions = MessageCollectorSourceOptions & { errors?: string[] };

function isInteractionPacket(value: unknown): value is InteractionPacket {
  return typeof value === 'object' && value !== null && 't' in value && 'd' in value;
}

// Utils
function parseChoices(
  parent: string,
  list_choices: ApplicationCommandIndexChoice[] | null | undefined,
  value: unknown,
): unknown {
  if (value !== undefined) {
    if (Array.isArray(list_choices) && list_choices.length) {
      const choice = list_choices.find(c => c.name === value || c.value === value);
      if (choice) {
        return choice.value;
      } else {
        throw new Error('INVALID_SLASH_COMMAND_CHOICES', parent, value);
      }
    } else {
      return value;
    }
  } else {
    return undefined;
  }
}

async function addDataFromAttachment(
  value: unknown,
  client: Client,
  channelId: Snowflake,
  attachments: SlashCommandAttachment[],
): Promise<{ id: number; attachments: SlashCommandAttachment[] }> {
  const file = await MessagePayload.resolveFile(value);
  const data = await Util.getUploadURL(client, channelId, [file]);
  const upload = data[0];
  if (!upload) throw new Error('INVALID_TYPE', 'attachment', 'FileOptions');
  await Util.uploadFile(file.file, upload.upload_url);
  const id = attachments.length;
  attachments.push({
    id,
    filename: file.name,
    uploaded_filename: upload.upload_filename,
  });
  return {
    id,
    attachments,
  };
}

async function parseOption(
  client: Client,
  optionCommand: ApplicationCommandIndexOption,
  value: unknown,
  optionFormat: SlashCommandOptionData[],
  attachments: SlashCommandAttachment[],
  command: ApplicationCommandIndexCommand,
  applicationId: Snowflake,
  guildId: Snowflake | undefined,
  channelId: Snowflake,
  subGroup: ApplicationCommandIndexOption | undefined,
  subCommand: ApplicationCommandIndexOption | undefined,
): Promise<{ optionFormat: SlashCommandOptionData[]; attachments: SlashCommandAttachment[] }> {
  const data: SlashCommandOptionData = {
    type: optionCommand.type,
    name: optionCommand.name,
  };
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
        const parseData = await addDataFromAttachment(value, client, channelId, attachments);
        data.value = parseData.id;
        attachments = parseData.attachments;
        break;
      }
      case ApplicationCommandOptionTypes.SUB_COMMAND_GROUP: {
        break;
      }
      default: {
        value = parseChoices(optionCommand.name, optionCommand.choices, value);
        if (optionCommand.autocomplete) {
          const nonce = SnowflakeUtil.generate();
          // Post
          let postData: SlashCommandOptionData[];
          if (subGroup) {
            if (!subCommand) throw new Error('SLASH_COMMAND_SUB_COMMAND_INVALID', subGroup.name);
            postData = [
              {
                type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
                name: subGroup.name,
                options: [
                  {
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    name: subCommand.name,
                    options: [
                      {
                        type: optionCommand.type,
                        name: optionCommand.name,
                        value,
                        focused: true,
                      },
                    ],
                  },
                ],
              },
            ];
          } else if (subCommand) {
            postData = [
              {
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
                name: subCommand.name,
                options: [
                  {
                    type: optionCommand.type,
                    name: optionCommand.name,
                    value,
                    focused: true,
                  },
                ],
              },
            ];
          } else {
            postData = [
              {
                type: optionCommand.type,
                name: optionCommand.name,
                value,
                focused: true,
              },
            ];
          }
          const body = createPostData(
            client,
            true,
            applicationId,
            nonce,
            guildId,
            Boolean(command.guild_id),
            channelId,
            command.version,
            command.id,
            command.name_default || command.name,
            command.type,
            postData,
            [],
          );
          await client.api.interactions.post({
            data: body,
          });
          data.value = await awaitAutocomplete(client, nonce, value);
        } else {
          data.value = value;
        }
      }
    }
    optionFormat.push(data);
  }
  return {
    optionFormat,
    attachments,
  };
}

function awaitAutocomplete(client: Client, nonce: Snowflake, defaultValue: unknown): Promise<unknown> {
  return new Promise<unknown>(resolve => {
    const handler = (packet: unknown) => {
      if (!isInteractionPacket(packet)) return;
      const payload = packet.d;
      if (!payload || payload.nonce !== nonce) return;
      clearTimeout(timeout);
      client.removeListener(Events.UNHANDLED_PACKET, handler);
      client.decrementMaxListeners();
      if (payload.choices && payload.choices.length >= 1) {
        resolve(payload.choices[0]?.value);
      } else {
        resolve(defaultValue);
      }
    };
    const timeout = setTimeout(() => {
      client.removeListener(Events.UNHANDLED_PACKET, handler);
      client.decrementMaxListeners();
      resolve(defaultValue);
    }, 5_000).unref();
    client.incrementMaxListeners();
    client.on(Events.UNHANDLED_PACKET, handler);
  });
}

function createPostData(
  client: Client,
  isAutocomplete = false,
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
): InteractionPostData {
  const data: InteractionPostData = {
    type: isAutocomplete ? InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE : InteractionTypes.APPLICATION_COMMAND,
    application_id: applicationId,
    guild_id: guildId,
    channel_id: channelId,
    session_id: client.sessionId,
    data: {
      version: commandVersion,
      id: commandId,
      name: commandName,
      type: commandType,
      options: postData,
      attachments: attachments,
    },
    nonce,
  };
  if (isGuildCommand) {
    data.data.guild_id = guildId;
  }
  return data;
}
