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

/**
 * Interface for classes that have text-channel-like features.
 * @interface
 */
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
    /**
     * A manager of the messages sent to this channel
     * @type {MessageManager}
     */
    this.messages = new MessageManager(this);

    /**
     * The channel's last message id, if one was sent
     * @type {?Snowflake}
     */
    this.lastMessageId = null;

    /**
     * The timestamp when the last pinned message was pinned, if there was one
     * @type {?number}
     */
    this.lastPinTimestamp = null;
  }

  /**
   * The Message object of the last message in the channel, if one was sent
   * @type {?Message}
   * @readonly
   */
  get lastMessage() {
    return this.messages.resolve(this.lastMessageId);
  }

  /**
   * The date when the last pinned message was pinned, if there was one
   * @type {?Date}
   * @readonly
   */
  get lastPinAt() {
    return this.lastPinTimestamp ? new Date(this.lastPinTimestamp) : null;
  }

  /**
   * Represents the data for a poll answer.
   * @typedef {Object} PollAnswerData
   * @property {string} text The text for the poll answer
   * @property {EmojiIdentifierResolvable} [emoji] The emoji for the poll answer
   */

  /**
   * Represents the data for a poll.
   * @typedef {Object} PollData
   * @property {PollQuestionMedia} question The question for the poll
   * @property {PollAnswerData[]} answers The answers for the poll
   * @property {number} duration The duration in hours for the poll
   * @property {boolean} allowMultiselect Whether the poll allows multiple answers
   * @property {PollLayoutType} [layoutType] The layout type for the poll
   */

  /**
   * Base options provided when sending.
   * @typedef {Object} BaseMessageOptions
   * @property {MessageActivity} [activity] Group activity
   * @property {boolean} [tts=false] Whether or not the message should be spoken aloud
   * @property {string} [nonce=''] The nonce for the message
   * @property {string} [content=''] The content for the message
   * @property {Array<(MessageEmbed|APIEmbed)>} [embeds] The embeds for the message
   * (see [here](https://discord.com/developers/docs/resources/channel#embed-object) for more details)
   * @property {MessageMentionOptions} [allowedMentions] Which mentions should be parsed from the message content
   * (see [here](https://discord.com/developers/docs/resources/channel#allowed-mentions-object) for more details)
   * @property {Array<(FileOptions|BufferResolvable|MessageAttachment[])>} [files] Files to send with the message
   * @property {Array<(MessageActionRow|MessageActionRowOptions)>} [components]
   * Action rows containing interactive components for the message (buttons, select menus)
   * @property {MessageAttachment[]} [attachments] Attachments to send in the message
   */

  /**
   * The base message options for messages including a poll.
   * @typedef {BaseMessageOptions} BaseMessageOptionsWithPoll
   * @property {PollData} [poll] The poll to send with the message
   */

  /**
   * @typedef {Object} ForwardOptions
   * @property {MessageResolvable} message The originating message
   * @property {TextBasedChannelResolvable} [channel] The channel of the originating message
   * @property {GuildResolvable} [guild] The guild of the originating message
   */

  /**
   * Options provided when sending or editing a message.
   * @typedef {BaseMessageOptions} MessageOptions
   * @property {ReplyOptions} [reply] The options for replying to a message
   * @property {ForwardOptions} [forward] The options for forwarding a message
   * @property {StickerResolvable[]} [stickers=[]] Stickers to send in the message
   * @property {MessageFlags} [flags] Which flags to set for the message.
   * Only `SUPPRESS_EMBEDS`, `SUPPRESS_NOTIFICATIONS` and `IS_VOICE_MESSAGE` can be set.
   */

  /**
   * Options provided to control parsing of mentions by Discord
   * @typedef {Object} MessageMentionOptions
   * @property {MessageMentionTypes[]} [parse] Types of mentions to be parsed
   * @property {Snowflake[]} [users] Snowflakes of Users to be parsed as mentions
   * @property {Snowflake[]} [roles] Snowflakes of Roles to be parsed as mentions
   * @property {boolean} [repliedUser=true] Whether the author of the Message being replied to should be pinged
   */

  /**
   * Types of mentions to enable in MessageMentionOptions.
   * - `roles`
   * - `users`
   * - `everyone`
   * @typedef {string} MessageMentionTypes
   */

  /**
   * @typedef {Object} FileOptions
   * @property {BufferResolvable} attachment File to attach
   * @property {string} [name='file.jpg'] Filename of the attachment
   * @property {string} description The description of the file
   */

  /**
   * Options for sending a message with a reply.
   * @typedef {Object} ReplyOptions
   * @property {MessageResolvable} messageReference The message to reply to (must be in the same channel and not system)
   * @property {boolean} [failIfNotExists=true] Whether to error if the referenced message
   * does not exist (creates a standard message in this case when false)
   */

  /**
   * Sends a message to this channel.
   * @param {string|MessagePayload|MessageOptions} options The options to provide
   * @returns {Promise<Message>}
   * @example
   * // Send a basic message
   * channel.send('hello!')
   *   .then(message => console.log(`Sent message: ${message.content}`))
   *   .catch(console.error);
   * @example
   * // Send a remote file
   * channel.send({
   *   files: ['https://cdn.discordapp.com/icons/222078108977594368/6e1019b3179d71046e463a75915e7244.png?size=2048']
   * })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Send a local file
   * channel.send({
   *   files: [{
   *     attachment: 'entire/path/to/file.jpg',
   *     name: 'file.jpg',
   *     description: 'A description of the file'
   *   }]
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
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

  /**
   * Sends a typing indicator in the channel.
   * @returns {Promise<{ message_send_cooldown_ms: number, thread_create_cooldown_ms: number }|void>} Resolves upon the typing status being sent
   * @example
   * // Start typing in a channel
   * channel.sendTyping();
   */
  sendTyping() {
    return this.client.api.channels(this.id).typing.post();
  }

  /**
   * Creates a Message Collector.
   * @param {MessageCollectorOptions} [options={}] The options to pass to the collector
   * @returns {MessageCollector}
   * @example
   * // Create a message collector
   * const filter = m => m.content.includes('discord');
   * const collector = channel.createMessageCollector({ filter, time: 15_000 });
   * collector.on('collect', m => console.log(`Collected ${m.content}`));
   * collector.on('end', collected => console.log(`Collected ${collected.size} items`));
   */
  createMessageCollector(options: MessageCollectorSourceOptions = {}) {
    return new MessageCollector(this, options);
  }

  /**
   * An object containing the same properties as CollectorOptions, but a few more:
   * @typedef {MessageCollectorOptions} AwaitMessagesOptions
   * @property {string[]} [errors] Stop/end reasons that cause the promise to reject
   */

  /**
   * Similar to createMessageCollector but in promise form.
   * Resolves with a collection of messages that pass the specified filter.
   * @param {AwaitMessagesOptions} [options={}] Optional options to pass to the internal collector
   * @returns {Promise<Collection<Snowflake, Message>>}
   * @example
   * // Await !vote messages
   * const filter = m => m.content.startsWith('!vote');
   * // Errors: ['time'] treats ending because of the time limit as an error
   * channel.awaitMessages({ filter, max: 4, time: 60_000, errors: ['time'] })
   *   .then(collected => console.log(collected.size))
   *   .catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));
   */
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

  /**
   * Fetches all webhooks for the channel.
   * @returns {Promise<Collection<Snowflake, Webhook>>}
   * @example
   * // Fetch webhooks
   * channel.fetchWebhooks()
   *   .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
   *   .catch(console.error);
   */
  fetchWebhooks() {
    return this.guild!.channels.fetchWebhooks(this.id);
  }

  /**
   * Options used to create a {@link Webhook} in a guild text-based channel.
   * @typedef {Object} ChannelWebhookCreateOptions
   * @property {?(BufferResolvable|Base64Resolvable)} [avatar] Avatar for the webhook
   * @property {string} [reason] Reason for creating the webhook
   */

  /**
   * Creates a webhook for the channel.
   * @param {string} name The name of the webhook
   * @param {ChannelWebhookCreateOptions} [options] Options for creating the webhook
   * @returns {Promise<Webhook>} Returns the created Webhook
   * @example
   * // Create a webhook for the current channel
   * channel.createWebhook('Snek', {
   *   avatar: 'https://i.imgur.com/mI8XcpG.jpg',
   *   reason: 'Needed a cool new Webhook'
   * })
   *   .then(console.log)
   *   .catch(console.error)
   */
  createWebhook(name: string, options: ChannelWebhookCreateOptions = {}) {
    return this.guild!.channels.createWebhook(this.id, name, options);
  }

  /**
   * Sets the rate limit per user (slowmode) for this channel.
   * @param {number} rateLimitPerUser The new rate limit in seconds
   * @param {string} [reason] Reason for changing the channel's rate limit
   * @returns {Promise<this>}
   */
  setRateLimitPerUser(rateLimitPerUser: number, reason?: string) {
    return this.edit({ rateLimitPerUser }, reason);
  }

  /**
   * Sets whether this channel is flagged as NSFW.
   * @param {boolean} [nsfw=true] Whether the channel should be considered NSFW
   * @param {string} [reason] Reason for changing the channel's NSFW flag
   * @returns {Promise<this>}
   */
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
