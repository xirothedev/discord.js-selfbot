import { Collection } from '@discordjs/collection';
import Action from './Action';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;
import type { Snowflake } from 'discord-api-types/v10';
import type {
  RawChannelData,
  RawThreadMemberData,
} from '../../../typings/rawDataTypes';
import { isThreadChannel, isThreadParentChannel } from '../../types/channels';
import type { Channel } from '../../structures/Channel';
import type { ThreadChannel } from '../../structures/ThreadChannel';

interface ThreadListSyncData {
  guild_id: Snowflake;
  channel_ids?: Snowflake[];
  threads: RawChannelData[];
  members?: Record<string, RawThreadMemberData>;
}

class ThreadListSyncAction extends Action {
  handle(data: ThreadListSyncData) {
    const { client } = this;

    const guild = client.guilds.cache.get(data.guild_id);
    if (!guild) {
      return {};
    }

    if (data.channel_ids) {
      for (const id of data.channel_ids) {
        const channel = client.channels.cache.get(id);
        if (channel) {
          this.removeStale(channel);
        }
      }
    } else {
      for (const channel of guild.channels.cache.values()) {
        this.removeStale(channel);
      }
    }

    const syncedThreads = new Collection<Snowflake, ThreadChannel>();
    for (const rawThread of data.threads) {
      const thread = client.channels._add(rawThread);
      if (thread && isThreadChannel(thread)) {
        syncedThreads.set(thread.id, thread);
      }
    }

    for (const rawMember of Object.values(data.members ?? {})) {
      // Discord sends the thread id as id in this object
      const threadId = rawMember.id;
      const thread = threadId ? client.channels.cache.get(threadId) : undefined;
      if (thread && isThreadChannel(thread)) {
        thread.members._add(rawMember);
      }
    }

    client.emit(Events.THREAD_LIST_SYNC, syncedThreads);

    return {
      syncedThreads,
    };
  }

  removeStale(channel: Channel) {
    if (!isThreadParentChannel(channel)) {
      return;
    }
    for (const thread of channel.threads.cache.values()) {
      if (!thread.archived) {
        this.client.channels._remove(thread.id);
      }
    }
  }
}

export default ThreadListSyncAction;
export { ThreadListSyncAction };
