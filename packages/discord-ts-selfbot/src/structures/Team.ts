import { Collection } from '@discordjs/collection';
import Base from './Base';
import TeamMember from './TeamMember';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawTeamData } from '../../typings/rawDataTypes';
import type { StaticImageURLOptions } from '../../typings';
import type { TeamEntity } from '../types/entities/team';
import type { PatchOf } from '../types/schema';
import type Client from '../client/Client';

class Team extends Base implements TeamEntity {
  declare id: TeamEntity['id'];
  declare name: TeamEntity['name'];
  declare icon: TeamEntity['icon'];
  declare ownerId: TeamEntity['ownerId'];
  declare members: TeamEntity['members'];

  constructor(client: Client, data: RawTeamData) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<'Team'>) {
    if (data.id !== undefined) {
      this.id = data.id;
    }

    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.icon === undefined) {
      this.icon ??= null;
    } else {
      this.icon = data.icon;
    }

    if (data.owner_user_id === undefined) {
      this.ownerId ??= null;
    } else {
      this.ownerId = data.owner_user_id;
    }
    this.members = new Collection<string, TeamMember>();

    for (const memberData of data.members ?? []) {
      const member = new TeamMember(this, memberData);
      this.members.set(member.id, member);
    }
  }

  get owner() {
    return this.ownerId ? (this.members.get(this.ownerId) ?? null) : null;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  iconURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.icon) {
      return null;
    }
    return this.client.rest.cdn.TeamIcon(this.id, this.icon, { format, size });
  }

  toString() {
    return this.name;
  }

  toJSON() {
    return super.toJSON({ createdTimestamp: true });
  }
}

export default Team;
export { Team };
