import { Collection } from '@discordjs/collection';
import Base from './Base';
import type { RawInviteStageInstance } from '../../typings/rawDataTypes';
import type { InviteStageInstanceEntity } from '../types/entities/invite-stage-instance';
import type { PatchOf } from '../types/schema';
import type Client from '../client/Client';
import type { GuildMember } from './GuildMember';

class InviteStageInstance extends Base implements InviteStageInstanceEntity {
  declare channelId: InviteStageInstanceEntity['channelId'];
  declare guildId: InviteStageInstanceEntity['guildId'];
  declare members: InviteStageInstanceEntity['members'];
  declare topic: InviteStageInstanceEntity['topic'];
  declare participantCount: InviteStageInstanceEntity['participantCount'];
  declare speakerCount: InviteStageInstanceEntity['speakerCount'];

  constructor(
    client: Client,
    data: RawInviteStageInstance,
    channelId: string,
    guildId: string
  ) {
    super(client);

    this.channelId = channelId;

    this.guildId = guildId;

    this.members = new Collection<string, GuildMember>();

    this._patch(data);
  }

  _patch(data: PatchOf<'InviteStageInstance'>) {
    if (data.topic !== undefined) {
      this.topic = data.topic;
    }

    if (data.participant_count !== undefined) {
      this.participantCount = data.participant_count;
    }

    if (data.speaker_count !== undefined) {
      this.speakerCount = data.speaker_count;
    }

    this.members.clear();
    const { guild } = this;
    if (!guild) {
      return;
    }
    for (const rawMember of data.members ?? []) {
      const member = guild.members._add(rawMember);
      this.members.set(member.id, member);
    }
  }

  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }
}

export default InviteStageInstance;
export { InviteStageInstance };
