import { Collection } from '@discordjs/collection';
import Base from './Base';
import type { RawInviteStageInstance } from '../../typings/rawDataTypes';
import type { InviteStageInstanceEntity } from '../types/entities/invite-stage-instance';
import type { PatchOf } from '../types/schema';

/**
 * Represents the data about a public {@link StageInstance} in an {@link Invite}.
 * @extends {Base}
 */
class InviteStageInstance extends Base implements InviteStageInstanceEntity {
  declare channelId: InviteStageInstanceEntity['channelId'];
  declare guildId: InviteStageInstanceEntity['guildId'];
  declare members: InviteStageInstanceEntity['members'];
  declare topic: InviteStageInstanceEntity['topic'];
  declare participantCount: InviteStageInstanceEntity['participantCount'];
  declare speakerCount: InviteStageInstanceEntity['speakerCount'];

  constructor(
    client: import('../client/Client').default,
    data: RawInviteStageInstance,
    channelId: string,
    guildId: string,
  ) {
    super(client);

    /**
     * The id of the stage channel this invite is for
     * @type {Snowflake}
     */
    this.channelId = channelId;

    /**
     * The stage channel's guild id
     * @type {Snowflake}
     */
    this.guildId = guildId;

    /**
     * The members speaking in the stage channel
     * @type {Collection<Snowflake, GuildMember>}
     */
    this.members = new Collection<string, import('./GuildMember').GuildMember>();

    this._patch(data);
  }

  _patch(data: PatchOf<'InviteStageInstance'>) {
    if (data.topic !== undefined) {
      /**
       * The topic of the stage instance
       * @type {string}
       */
      this.topic = data.topic;
    }

    if (data.participant_count !== undefined) {
      /**
       * The number of users in the stage channel
       * @type {number}
       */
      this.participantCount = data.participant_count;
    }

    if (data.speaker_count !== undefined) {
      /**
       * The number of users speaking in the stage channel
       * @type {number}
       */
      this.speakerCount = data.speaker_count;
    }

    this.members.clear();
    const guild = this.guild;
    if (!guild) return;
    for (const rawMember of data.members ?? []) {
      const member = guild.members._add(rawMember);
      this.members.set(member.id, member);
    }
  }

  /**
   * The stage channel this invite is for
   * @type {?StageChannel}
   * @readonly
   */
  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  /**
   * The guild of the stage channel this invite is for
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }
}

export default InviteStageInstance;
export { InviteStageInstance };
