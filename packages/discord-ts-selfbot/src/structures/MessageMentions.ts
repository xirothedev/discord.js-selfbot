import { Collection } from '@discordjs/collection';
import type {
  APIChannelMention,
  APIGuildMember,
  APIUser,
  Snowflake,
} from 'discord-api-types/v10';
import _ConstantsModule from '../util/Constants';

const { ChannelTypes } = _ConstantsModule;
import Util from '../util/Util';
import type {
  ChannelResolvable,
  CrosspostedChannel,
  MessageMentionsHasOptions,
  RoleResolvable,
  UserResolvable,
} from '../../typings';
import type { Client } from '../client/Client';
import type { Guild } from './Guild';
import type { GuildMember } from './GuildMember';
import type { Message } from './Message';
import type { Role } from './Role';
import type { User } from './User';
import type { Channel } from './Channel';

type MentionUser = APIUser & { member?: Omit<APIGuildMember, 'user'> };

function isChannelTypeName(
  value: string | undefined
): value is CrosspostedChannel['type'] {
  return typeof value === 'string' && value in ChannelTypes;
}

class MessageMentions {
  declare readonly client: Client;
  declare readonly guild: Guild | null;
  declare readonly _content: string;
  declare everyone: boolean;
  declare users: Collection<Snowflake, User>;
  declare roles: Collection<Snowflake, Role>;
  declare crosspostedChannels: Collection<Snowflake, CrosspostedChannel>;
  declare repliedUser: User | null;
  declare _members: Collection<Snowflake, GuildMember> | null;
  declare _channels: Collection<Snowflake, Channel> | null;
  declare _parsedUsers: Collection<Snowflake, User> | null;

  declare static EVERYONE_PATTERN: RegExp;
  declare static USERS_PATTERN: RegExp;
  declare static ROLES_PATTERN: RegExp;
  declare static CHANNELS_PATTERN: RegExp;

  constructor(
    message: Message,
    users?: MentionUser[] | Collection<Snowflake, User>,
    roles?: Snowflake[] | Collection<Snowflake, Role>,
    everyone?: boolean,
    crosspostedChannels?:
      | APIChannelMention[]
      | Collection<Snowflake, CrosspostedChannel>,
    repliedUser?: APIUser | User | null
  ) {
    Object.defineProperty(this, 'client', { value: message.client });

    Object.defineProperty(this, 'guild', { value: message.guild });

    Object.defineProperty(this, '_content', { value: message.content });

    this.everyone = Boolean(everyone);

    if (users) {
      if (users instanceof Collection) {
        this.users = new Collection<Snowflake, User>(users);
      } else {
        this.users = new Collection<Snowflake, User>();
        for (const mention of users) {
          if (mention.member && message.guild) {
            message.guild.members._add(
              Object.assign(mention.member, { user: mention })
            );
          }
          const user = message.client.users._add(mention);
          this.users.set(user.id, user);
        }
      }
    } else {
      this.users = new Collection<Snowflake, User>();
    }

    if (roles instanceof Collection) {
      this.roles = new Collection<Snowflake, Role>(roles);
    } else if (roles) {
      this.roles = new Collection<Snowflake, Role>();
      const { guild } = message;
      if (guild) {
        for (const mention of roles) {
          const role = guild.roles.cache.get(mention);
          if (role) {
            this.roles.set(role.id, role);
          }
        }
      }
    } else {
      this.roles = new Collection<Snowflake, Role>();
    }

    this._members = null;

    this._channels = null;

    this._parsedUsers = null;

    if (crosspostedChannels) {
      if (crosspostedChannels instanceof Collection) {
        this.crosspostedChannels = new Collection<
          Snowflake,
          CrosspostedChannel
        >(crosspostedChannels);
      } else {
        this.crosspostedChannels = new Collection<
          Snowflake,
          CrosspostedChannel
        >();
        const channelTypes = Object.keys(ChannelTypes);
        for (const d of crosspostedChannels) {
          const type = channelTypes[d.type];
          this.crosspostedChannels.set(d.id, {
            channelId: d.id,
            guildId: d.guild_id,
            name: d.name,
            type: isChannelTypeName(type) ? type : 'UNKNOWN',
          });
        }
      }
    } else {
      this.crosspostedChannels = new Collection<
        Snowflake,
        CrosspostedChannel
      >();
    }

    this.repliedUser = repliedUser ? this.client.users._add(repliedUser) : null;
  }

  get members() {
    if (this._members) {
      return this._members;
    }
    const { guild } = this;
    if (!guild) {
      return null;
    }
    const members = new Collection<Snowflake, GuildMember>();
    this._members = members;
    for (const user of this.users.values()) {
      const member = guild.members.resolve(user);
      if (member) {
        members.set(member.user.id, member);
      }
    }
    return members;
  }

  get channels() {
    if (this._channels) {
      return this._channels;
    }
    this._channels = new Collection<Snowflake, Channel>();
    let matches;
    while (
      (matches = MessageMentions.CHANNELS_PATTERN.exec(this._content)) !== null
    ) {
      const chan = this.client.channels.cache.get(matches[1]);
      if (chan) {
        this._channels.set(chan.id, chan);
      }
    }
    return this._channels;
  }

  get parsedUsers() {
    if (this._parsedUsers) {
      return this._parsedUsers;
    }
    this._parsedUsers = new Collection<Snowflake, User>();
    let matches;
    while (
      (matches = MessageMentions.USERS_PATTERN.exec(this._content)) !== null
    ) {
      const user = this.client.users.cache.get(matches[1]);
      if (user) {
        this._parsedUsers.set(user.id, user);
      }
    }
    return this._parsedUsers;
  }

  has(
    data: UserResolvable | RoleResolvable | ChannelResolvable,
    {
      ignoreDirect = false,
      ignoreRoles = false,
      ignoreRepliedUser = false,
      ignoreEveryone = false,
    }: MessageMentionsHasOptions = {}
  ) {
    const user = this.client.users.resolve(data);

    if (!ignoreEveryone && user && this.everyone) {
      return true;
    }

    if (this.isRepliedUser(user, ignoreRepliedUser)) {
      return true;
    }

    if (!ignoreDirect && this.hasDirectMention(data, user, ignoreRepliedUser)) {
      return true;
    }

    if (!ignoreRoles) {
      const member = this.guild?.members.resolve(data);
      if (member) {
        for (const mentionedRole of this.roles.values()) {
          if (member.roles.cache.has(mentionedRole.id)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private isRepliedUser(user: User | null, ignoreRepliedUser: boolean) {
    return Boolean(
      !ignoreRepliedUser &&
      user &&
      this.repliedUser?.id === user.id &&
      this.users.has(user.id)
    );
  }

  private hasDirectMention(
    data: UserResolvable | RoleResolvable | ChannelResolvable,
    user: User | null,
    ignoreRepliedUser: boolean
  ) {
    if (
      user &&
      (!ignoreRepliedUser || this.parsedUsers.has(user.id)) &&
      this.users.has(user.id)
    ) {
      return true;
    }

    const role = this.guild?.roles.resolve(data);
    if (role && this.roles.has(role.id)) {
      return true;
    }

    const channel = this.client.channels.resolve(data);
    return Boolean(channel && this.channels.has(channel.id));
  }

  toJSON() {
    return Util.flatten(this, {
      channels: true,
      members: true,
    });
  }
}

MessageMentions.EVERYONE_PATTERN = /@(?<everyone>everyone|here)/gu;

MessageMentions.USERS_PATTERN = /<@!?(?<id>\d{17,19})>/gu;

MessageMentions.ROLES_PATTERN = /<@&(?<id>\d{17,19})>/gu;

MessageMentions.CHANNELS_PATTERN = /<#(?<id>\d{17,19})>/gu;

export default MessageMentions;
export { MessageMentions };
