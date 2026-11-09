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

/**
 * Represents a stage instance.
 * @extends {Base}
 */
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

    /**
     * The stage instance's id
     * @type {Snowflake}
     */
    this.id = data.id;

    this._patch(data);
  }

  _patch(data: PatchOf<'StageInstance'>) {
    if (data.guild_id !== undefined) {
      /**
       * The id of the guild associated with the stage channel
       * @type {Snowflake}
       */
      this.guildId = data.guild_id;
    }

    if (data.channel_id !== undefined) {
      /**
       * The id of the channel associated with the stage channel
       * @type {Snowflake}
       */
      this.channelId = data.channel_id;
    }

    if (data.topic !== undefined) {
      /**
       * The topic of the stage instance
       * @type {string}
       */
      this.topic = data.topic;
    }

    if (data.privacy_level !== undefined) {
      /**
       * The privacy level of the stage instance
       * @type {PrivacyLevel}
       */
      this.privacyLevel = PrivacyLevels[data.privacy_level];
    }

    if (data.discoverable_disabled !== undefined) {
      /**
       * Whether or not stage discovery is disabled
       * @type {?boolean}
       */
      this.discoverableDisabled = data.discoverable_disabled;
    } else {
      this.discoverableDisabled ??= null;
    }

    if (data.guild_scheduled_event_id !== undefined) {
      /**
       * The associated guild scheduled event id of this stage instance
       * @type {?Snowflake}
       */
      this.guildScheduledEventId = data.guild_scheduled_event_id;
    }
  }

  /**
   * The stage channel associated with this stage instance
   * @type {?StageChannel}
   * @readonly
   */
  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  /**
   * The associated guild scheduled event of this stage instance
   * @type {?GuildScheduledEvent}
   * @readonly
   */
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

  /**
   * The guild this stage instance belongs to
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }

  /**
   * Edits this stage instance.
   * @param {StageInstanceEditOptions} options The options to edit the stage instance
   * @returns {Promise<StageInstance>}
   * @example
   * // Edit a stage instance
   * stageInstance.edit({ topic: 'new topic' })
   *  .then(stageInstance => console.log(stageInstance))
   *  .catch(console.error)
   */
  edit(options: Record<string, unknown>) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    return guild.stageInstances.edit(this.channelId, options);
  }

  /**
   * Deletes this stage instance.
   * @returns {Promise<StageInstance>}
   * @example
   * // Delete a stage instance
   * stageInstance.delete()
   *  .then(stageInstance => console.log(stageInstance))
   *  .catch(console.error);
   */
  async delete() {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    await guild.stageInstances.delete(this.channelId);
    const clone = this._clone();
    deletedStageInstances.add(clone);
    return clone;
  }

  /**
   * Sets the topic of this stage instance.
   * @param {string} topic The topic for the stage instance
   * @returns {Promise<StageInstance>}
   * @example
   * // Set topic of a stage instance
   * stageInstance.setTopic('new topic')
   *  .then(stageInstance => console.log(`Set the topic to: ${stageInstance.topic}`))
   *  .catch(console.error);
   */
  setTopic(topic: string) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    return guild.stageInstances.edit(this.channelId, { topic });
  }

  /**
   * The timestamp this stage instances was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  /**
   * The time this stage instance was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }
}

export { StageInstance, deletedStageInstances };
export default { StageInstance, deletedStageInstances };
