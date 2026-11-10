import ThreadManager from './ThreadManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';

const { ChannelTypes } = _ConstantsModule;
import _UtilModule from '../util/Util';
import type { GuildTextThreadCreateOptions } from '../../typings';
import type {
  RESTPostAPIChannelThreadsResult,
  Snowflake,
} from 'discord-api-types/v10';
import type { Message } from '../structures/Message';

type SourceGuildTextThreadCreateOptions<AllowedThreadType> = Omit<
  GuildTextThreadCreateOptions<AllowedThreadType>,
  'startMessage'
> & {
  startMessage?: Message | Snowflake;
};
const { resolveAutoArchiveMaxLimit } = _UtilModule;

class GuildTextThreadManager<AllowedThreadType> extends ThreadManager {
  async create({
    name,
    autoArchiveDuration = this.channel.defaultAutoArchiveDuration ?? undefined,
    startMessage,
    type,
    invitable,
    reason,
    rateLimitPerUser,
  }: SourceGuildTextThreadCreateOptions<AllowedThreadType>) {
    let path = this.client.api.channels(this.channel.id);
    if (type && typeof type !== 'string' && typeof type !== 'number') {
      throw new TypeError(
        'INVALID_TYPE',
        'type',
        'ThreadChannelType or Number'
      );
    }
    let resolvedType: number | undefined =
      this.channel.type === 'GUILD_NEWS'
        ? ChannelTypes.GUILD_NEWS_THREAD
        : ChannelTypes.GUILD_PUBLIC_THREAD;
    if (startMessage) {
      const { messages } = this.channel;
      const startMessageId = messages?.resolveId(startMessage);
      if (!startMessageId) {
        throw new TypeError(
          'INVALID_TYPE',
          'startMessage',
          'MessageResolvable'
        );
      }
      path = path.messages(startMessageId);
    } else if (this.channel.type !== 'GUILD_NEWS') {
      if (typeof type === 'string') {
        resolvedType = resolveEnumValue(ChannelTypes, type);
      } else if (typeof type === 'number') {
        resolvedType = type;
      }
    }

    const resolvedAutoArchiveDuration =
      autoArchiveDuration === 'MAX'
        ? resolveAutoArchiveMaxLimit(this.channel.guild)
        : autoArchiveDuration;

    const data = await path.threads.post<RESTPostAPIChannelThreadsResult>({
      data: {
        auto_archive_duration: resolvedAutoArchiveDuration,
        invitable:
          resolvedType === ChannelTypes.GUILD_PRIVATE_THREAD
            ? invitable
            : undefined,
        name,
        rate_limit_per_user: rateLimitPerUser,
        type: resolvedType,
      },
      reason,
    });

    return this.client.actions.ThreadCreate.handle(data).thread;
  }
}

export default GuildTextThreadManager;
export { GuildTextThreadManager };
