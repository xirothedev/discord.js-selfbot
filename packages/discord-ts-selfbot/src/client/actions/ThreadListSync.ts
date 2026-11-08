const { Collection } = require('@discordjs/collection');
const Action = require('./Action');
const { Events } = require('../../util/Constants');

class ThreadListSyncAction extends Action {
  handle(data: any) {
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

    const syncedThreads = data.threads.reduce((coll: any, rawThread: any) => {
      const thread = client.channels._add(rawThread);
      return coll.set(thread.id, thread);
    }, new Collection());

    for (const rawMember of Object.values(data.members || {}) as any[]) {
      // Discord sends the thread id as id in this object
      const thread = client.channels.cache.get(rawMember.id);
      if (thread) {
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

  removeStale(channel: any) {
    channel.threads?.cache.forEach((thread: any) => {
      if (!thread.archived) {
        this.client.channels._remove(thread.id);
      }
    });
  }
}

export = ThreadListSyncAction;
