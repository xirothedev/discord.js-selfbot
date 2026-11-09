import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, _packet: any, shard: any) => {
  const replayed = shard.sequence - shard.closeSequence;
  /**
   * Emitted when a shard resumes successfully.
   * @event Client#shardResume
   * @param {number} id The shard id that resumed
   * @param {number} replayedEvents The amount of replayed events
   */
  client.emit(Events.SHARD_RESUME, shard.id, replayed);
};
