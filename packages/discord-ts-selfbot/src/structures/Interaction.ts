import Base from './Base';
import _ConstantsModule from '../util/Constants';
const { InteractionTypes, MessageComponentTypes, ApplicationCommandTypes } = _ConstantsModule;
import Permissions from '../util/Permissions';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { APIInteractionGuildMember, Snowflake } from 'discord-api-types/v10';
import type { CacheType, InteractionType, MessageComponentType } from '../../typings';
import type { RawInteractionData } from '../../typings/rawDataTypes';
import type { Guild } from './Guild';
import type { GuildMember } from './GuildMember';
import type { User } from './User';
import type { TextBasedChannel } from './interfaces/TextBasedChannel';
import type BaseCommandInteraction from './BaseCommandInteraction';
import type ButtonInteraction from './ButtonInteraction';
import type AutocompleteInteraction from './AutocompleteInteraction';
import type CommandInteraction from './CommandInteraction';
import type ContextMenuInteraction from './ContextMenuInteraction';
import type MessageComponentInteraction from './MessageComponentInteraction';
import type ModalSubmitInteraction from './ModalSubmitInteraction';
import type SelectMenuInteraction from './SelectMenuInteraction';
import type UserContextMenuInteraction from './UserContextMenuInteraction';
import type MessageContextMenuInteraction from './MessageContextMenuInteraction';

/**
 * Represents an interaction.
 * @extends {Base}
 */
class Interaction<Cached extends CacheType = CacheType> extends Base {
  declare type: InteractionType;
  declare id: Snowflake;
  declare readonly token: string;
  declare applicationId: Snowflake;
  declare channelId: Snowflake | null;
  declare guildId: Snowflake | null;
  declare user: User;
  declare member: GuildMember | APIInteractionGuildMember | null;
  declare version: number;
  declare appPermissions: Readonly<Permissions> | null;
  declare memberPermissions: Readonly<Permissions> | null;
  declare locale: string;
  declare guildLocale: string | null;
  declare targetId?: Snowflake;
  declare componentType?: MessageComponentType;

  constructor(client: import('../client/Client').default, data: RawInteractionData) {
    super(client);

    /**
     * The interaction's type
     * @type {InteractionType}
     */
    this.type = InteractionTypes[data.type];

    /**
     * The interaction's id
     * @type {Snowflake}
     */
    this.id = data.id;

    /**
     * The interaction's token
     * @type {string}
     * @name Interaction#token
     * @readonly
     */
    Object.defineProperty(this, 'token', { value: data.token });

    /**
     * The application's id
     * @type {Snowflake}
     */
    this.applicationId = data.application_id;

    /**
     * The id of the channel this interaction was sent in
     * @type {?Snowflake}
     */
    this.channelId = data.channel_id ?? null;

    /**
     * The id of the guild this interaction was sent in
     * @type {?Snowflake}
     */
    this.guildId = data.guild_id ?? null;

    /**
     * The user which sent this interaction
     * @type {User}
     */
    this.user = this.client.users._add(data.user ?? data.member!.user);

    /**
     * If this interaction was sent in a guild, the member which sent it
     * @type {?(GuildMember|APIGuildMember)}
     */
    this.member = data.member ? (this.guild?.members._add(data.member) ?? data.member) : null;

    /**
     * The version
     * @type {number}
     */
    this.version = data.version;

    /**
     * Set of permissions the application or bot has within the channel the interaction was sent from
     * @type {?Readonly<Permissions>}
     */
    this.appPermissions = data.app_permissions ? new Permissions(data.app_permissions).freeze() : null;

    /**
     * The permissions of the member, if one exists, in the channel this interaction was executed in
     * @type {?Readonly<Permissions>}
     */
    this.memberPermissions = data.member?.permissions ? new Permissions(data.member.permissions).freeze() : null;

    /**
     * A Discord locale string, possible values are:
     * * en-US (English, US)
     * * en-GB (English, UK)
     * * bg (Bulgarian)
     * * zh-CN (Chinese, China)
     * * zh-TW (Chinese, Taiwan)
     * * hr (Croatian)
     * * cs (Czech)
     * * da (Danish)
     * * nl (Dutch)
     * * fi (Finnish)
     * * fr (French)
     * * de (German)
     * * el (Greek)
     * * hi (Hindi)
     * * hu (Hungarian)
     * * it (Italian)
     * * ja (Japanese)
     * * ko (Korean)
     * * lt (Lithuanian)
     * * no (Norwegian)
     * * pl (Polish)
     * * pt-BR (Portuguese, Brazilian)
     * * ro (Romanian, Romania)
     * * ru (Russian)
     * * es-ES (Spanish)
     * * sv-SE (Swedish)
     * * th (Thai)
     * * tr (Turkish)
     * * uk (Ukrainian)
     * * vi (Vietnamese)
     * @see {@link https://discord.com/developers/docs/reference#locales}
     * @typedef {string} Locale
     */

    /**
     * The locale of the user who invoked this interaction
     * @type {Locale}
     */
    this.locale = 'locale' in data ? data.locale : 'en-US';

    /**
     * The preferred locale from the guild this interaction was sent in
     * @type {?Locale}
     */
    this.guildLocale = data.guild_locale ?? null;
  }

  /**
   * The timestamp the interaction was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  /**
   * The time the interaction was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The channel this interaction was sent in
   * @type {?TextBasedChannels}
   * @readonly
   */
  get channel(): TextBasedChannel | null {
    return this.channelId ? (this.client.channels.cache.get(this.channelId) ?? null) : null;
  }

  /**
   * The guild this interaction was sent in
   * @type {?Guild}
   * @readonly
   */
  get guild(): Guild | null {
    return this.guildId ? (this.client.guilds.cache.get(this.guildId) ?? null) : null;
  }

  /**
   * Indicates whether this interaction is received from a guild.
   * @returns {boolean}
   */
  inGuild(): this is Interaction<'raw' | 'cached'> {
    return Boolean(this.guildId && this.member);
  }

  /**
   * Indicates whether or not this interaction is both cached and received from a guild.
   * @returns {boolean}
   */
  inCachedGuild(): this is Interaction<'cached'> {
    return Boolean(this.guild && this.member);
  }

  /**
   * Indicates whether or not this interaction is received from an uncached guild.
   * @returns {boolean}
   */
  inRawGuild(): this is Interaction<'raw'> {
    return Boolean(this.guildId && !this.guild && this.member);
  }

  /**
   * Indicates whether this interaction is a {@link BaseCommandInteraction}.
   * @returns {boolean}
   */
  isApplicationCommand(): this is BaseCommandInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND;
  }

  /**
   * Indicates whether this interaction is a {@link CommandInteraction}.
   * @returns {boolean}
   */
  isCommand(): this is CommandInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND && typeof this.targetId === 'undefined';
  }

  /**
   * Indicates whether this interaction is a {@link ContextMenuInteraction}
   * @returns {boolean}
   */
  isContextMenu(): this is ContextMenuInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND && typeof this.targetId !== 'undefined';
  }

  /**
   * Indicates whether this interaction is a {@link ModalSubmitInteraction}
   * @returns {boolean}
   */
  isModalSubmit(): this is ModalSubmitInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.MODAL_SUBMIT;
  }

  /**
   * Indicates whether this interaction is a {@link UserContextMenuInteraction}
   * @returns {boolean}
   */
  isUserContextMenu(): this is UserContextMenuInteraction<Cached> {
    return this.isContextMenu() && ApplicationCommandTypes[this.targetType] === ApplicationCommandTypes.USER;
  }

  /**
   * Indicates whether this interaction is a {@link MessageContextMenuInteraction}
   * @returns {boolean}
   */
  isMessageContextMenu(): this is MessageContextMenuInteraction<Cached> {
    return this.isContextMenu() && ApplicationCommandTypes[this.targetType] === ApplicationCommandTypes.MESSAGE;
  }

  /**
   * Indicates whether this interaction is an {@link AutocompleteInteraction}
   * @returns {boolean}
   */
  isAutocomplete(): this is AutocompleteInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE;
  }

  /**
   * Indicates whether this interaction is a {@link MessageComponentInteraction}.
   * @returns {boolean}
   */
  isMessageComponent(): this is MessageComponentInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT;
  }

  /**
   * Indicates whether this interaction is a {@link ButtonInteraction}.
   * @returns {boolean}
   */
  isButton(): this is ButtonInteraction<Cached> {
    return (
      InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT &&
      typeof this.componentType !== 'undefined' &&
      MessageComponentTypes[this.componentType] === MessageComponentTypes.BUTTON
    );
  }

  /**
   * Indicates whether this interaction is a {@link SelectMenuInteraction}.
   * @returns {boolean}
   */
  isSelectMenu(): this is SelectMenuInteraction<Cached> {
    return (
      InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT &&
      typeof this.componentType !== 'undefined' &&
      MessageComponentTypes[this.componentType] === MessageComponentTypes.SELECT_MENU
    );
  }

  /**
   * Indicates whether this interaction can be replied to.
   * @returns {boolean}
   */
  isRepliable() {
    return ![InteractionTypes.PING, InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE].includes(
      InteractionTypes[this.type],
    );
  }
}

export default Interaction;
export { Interaction };
