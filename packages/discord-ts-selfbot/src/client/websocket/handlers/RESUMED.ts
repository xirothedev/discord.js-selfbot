const { Events } = require('../../../util/Constants');
export = (client: any, _packet: any, shard: any) => {
  const replayed = shard.sequence - shard.closeSequence;
  /**
   * Emitted when a shard resumes successfully.
   * @event Client#shardResume
   * @param {number} id The shard id that resumed
   * @param {number} replayedEvents The amount of replayed events
   */
  client.emit(Events.SHARD_RESUME, shard.id, replayed);
};
