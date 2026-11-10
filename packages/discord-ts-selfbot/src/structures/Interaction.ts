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
import { isTextBasedChannel, type TextBasedChannel } from '../types/channels';
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

    this.type = InteractionTypes[data.type];

    this.id = data.id;

    Object.defineProperty(this, 'token', { value: data.token });

    this.applicationId = data.application_id;

    this.channelId = data.channel_id ?? null;

    this.guildId = data.guild_id ?? null;

    this.user = this.client.users._add(data.user ?? data.member!.user);

    this.member = data.member ? (this.guild?.members._add(data.member) ?? data.member) : null;

    this.version = data.version;

    this.appPermissions = data.app_permissions ? new Permissions(data.app_permissions).freeze() : null;

    this.memberPermissions = data.member?.permissions ? new Permissions(data.member.permissions).freeze() : null;

    this.locale = 'locale' in data ? data.locale : 'en-US';

    this.guildLocale = data.guild_locale ?? null;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get channel(): TextBasedChannel | null {
    const channel = this.channelId ? this.client.channels.cache.get(this.channelId) : null;
    return channel && isTextBasedChannel(channel) ? channel : null;
  }

  get guild(): Guild | null {
    return this.guildId ? (this.client.guilds.cache.get(this.guildId) ?? null) : null;
  }

  inGuild(): this is Interaction<'raw' | 'cached'> {
    return Boolean(this.guildId && this.member);
  }

  inCachedGuild(): this is Interaction<'cached'> {
    return Boolean(this.guild && this.member);
  }

  inRawGuild(): this is Interaction<'raw'> {
    return Boolean(this.guildId && !this.guild && this.member);
  }

  isApplicationCommand(): this is BaseCommandInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND;
  }

  isCommand(): this is CommandInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND && typeof this.targetId === 'undefined';
  }

  isContextMenu(): this is ContextMenuInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND && typeof this.targetId !== 'undefined';
  }

  isModalSubmit(): this is ModalSubmitInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.MODAL_SUBMIT;
  }

  isUserContextMenu(): this is UserContextMenuInteraction<Cached> {
    return this.isContextMenu() && ApplicationCommandTypes[this.targetType] === ApplicationCommandTypes.USER;
  }

  isMessageContextMenu(): this is MessageContextMenuInteraction<Cached> {
    return this.isContextMenu() && ApplicationCommandTypes[this.targetType] === ApplicationCommandTypes.MESSAGE;
  }

  isAutocomplete(): this is AutocompleteInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE;
  }

  isMessageComponent(): this is MessageComponentInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT;
  }

  isButton(): this is ButtonInteraction<Cached> {
    return (
      InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT &&
      typeof this.componentType !== 'undefined' &&
      MessageComponentTypes[this.componentType] === MessageComponentTypes.BUTTON
    );
  }

  isSelectMenu(): this is SelectMenuInteraction<Cached> {
    return (
      InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT &&
      typeof this.componentType !== 'undefined' &&
      MessageComponentTypes[this.componentType] === MessageComponentTypes.STRING_SELECT
    );
  }

  isRepliable() {
    return ![InteractionTypes.PING, InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE].includes(
      InteractionTypes[this.type],
    );
  }
}

export default Interaction;
export { Interaction };
