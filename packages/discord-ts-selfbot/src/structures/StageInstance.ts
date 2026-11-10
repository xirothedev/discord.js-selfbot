import process from 'node:process';
import Base from './Base';
import _ConstantsModule from '../util/Constants';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
const { PrivacyLevels } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawStageInstanceData } from '../../typings/rawDataTypes';
import type { StageInstanceEntity } from '../types/entities/stage-instance';
import type { PatchOf } from '../types/schema';

/**
 * @type {WeakSet<StageInstance>}
 * @private
 * @internal
 */
const deletedStageInstances = new WeakSet();
let deprecationEmittedForDeleted = false;

class StageInstance extends Base implements StageInstanceEntity {
  declare id: StageInstanceEntity['id'];
  declare guildId: StageInstanceEntity['guildId'];
  declare channelId: StageInstanceEntity['channelId'];
  declare topic: StageInstanceEntity['topic'];
  declare privacyLevel: StageInstanceEntity['privacyLevel'];
  declare discoverableDisabled: StageInstanceEntity['discoverableDisabled'];
  declare guildScheduledEventId: StageInstanceEntity['guildScheduledEventId'];

  constructor(client: import('../client/Client').default, data: RawStageInstanceData) {
    super(client);

    this.id = data.id;

    this._patch(data);
  }

  _patch(data: PatchOf<'StageInstance'>) {
    if (data.guild_id !== undefined) {
      this.guildId = data.guild_id;
    }

    if (data.channel_id !== undefined) {
      this.channelId = data.channel_id;
    }

    if (data.topic !== undefined) {
      this.topic = data.topic;
    }

    if (data.privacy_level !== undefined) {
      this.privacyLevel = PrivacyLevels[data.privacy_level];
    }

    if (data.discoverable_disabled !== undefined) {
      this.discoverableDisabled = data.discoverable_disabled;
    } else {
      this.discoverableDisabled ??= null;
    }

    if (data.guild_scheduled_event_id !== undefined) {
      this.guildScheduledEventId = data.guild_scheduled_event_id;
    }
  }

  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  get guildScheduledEvent() {
    if (!this.guildScheduledEventId) return null;
    return this.guild?.scheduledEvents.resolve(this.guildScheduledEventId) ?? null;
  }

  /**
   * Whether or not the stage instance has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'StageInstance#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    return deletedStageInstances.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'StageInstance#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    if (value) deletedStageInstances.add(this);
    else deletedStageInstances.delete(this);
  }

  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }

  edit(options: Record<string, unknown>) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    return guild.stageInstances.edit(this.channelId, options);
  }

  async delete() {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    await guild.stageInstances.delete(this.channelId);
    const clone = this._clone();
    deletedStageInstances.add(clone);
    return clone;
  }

  setTopic(topic: string) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    return guild.stageInstances.edit(this.channelId, { topic });
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }
}

export { StageInstance, deletedStageInstances };
export default { StageInstance, deletedStageInstances };
