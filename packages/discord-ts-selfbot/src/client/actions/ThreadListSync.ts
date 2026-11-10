import { Collection } from '@discordjs/collection';
import Action from './Action';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;
import type { Snowflake } from 'discord-api-types/v10';
import type { RawChannelData, RawThreadMemberData } from '../../../typings/rawDataTypes';
import { isThreadChannel, isThreadParentChannel } from '../../types/channels';
import type { Channel } from '../../structures/Channel';

interface ThreadListSyncData {
  guild_id: Snowflake;
  channel_ids?: Snowflake[];
  threads: RawChannelData[];
  members?: Record<string, RawThreadMemberData>;
}

class ThreadListSyncAction extends Action {
  handle(data: ThreadListSyncData) {
    const client = this.client;

    const guild = client.guilds.cache.get(data.guild_id);
    if (!guild) return {};

    if (data.channel_ids) {
      for (const id of data.channel_ids) {
        const channel = client.channels.cache.get(id);
        if (channel) this.removeStale(channel);
      }
    } else {
      for (const channel of guild.channels.cache.values()) {
        this.removeStale(channel);
      }
    }

    const syncedThreads = data.threads.reduce((coll, rawThread) => {
      const thread = client.channels._add(rawThread);
      return thread && isThreadChannel(thread) ? coll.set(thread.id, thread) : coll;
    }, new Collection<Snowflake, import('../../structures/ThreadChannel').ThreadChannel>());

    for (const rawMember of Object.values(data.members ?? {})) {
      // Discord sends the thread id as id in this object
      const threadId = rawMember.id;
      const thread = threadId ? client.channels.cache.get(threadId) : undefined;
      if (thread && isThreadChannel(thread)) {
        thread.members._add(rawMember);
      }
    }

    /**
     * Emitted whenever the client user gains access to a text or news channel that contains threads
     * @event Client#threadListSync
     * @param {Collection<Snowflake, ThreadChannel>} threads The threads that were synced
     */
    client.emit(Events.THREAD_LIST_SYNC, syncedThreads);

    return {
      syncedThreads,
    };
  }

  removeStale(channel: Channel) {
    if (!isThreadParentChannel(channel)) return;
    channel.threads.cache.forEach(thread => {
      if (!thread.archived) {
        this.client.channels._remove(thread.id);
      }
    });
  }
}

export default ThreadListSyncAction;
export { ThreadListSyncAction };
