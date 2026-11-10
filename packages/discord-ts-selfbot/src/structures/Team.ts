import { Collection } from '@discordjs/collection';
import Base from './Base';
import TeamMember from './TeamMember';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawTeamData } from '../../typings/rawDataTypes';
import type { StaticImageURLOptions } from '../../typings';
import type { TeamEntity } from '../types/entities/team';
import type { PatchOf } from '../types/schema';

/**
 * Represents a Client OAuth2 Application Team.
 * @extends {Base}
 */
class Team extends Base implements TeamEntity {
  declare id: TeamEntity['id'];
  declare name: TeamEntity['name'];
  declare icon: TeamEntity['icon'];
  declare ownerId: TeamEntity['ownerId'];
  declare members: TeamEntity['members'];

  constructor(client: import('../client/Client').default, data: RawTeamData) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<'Team'>) {
    /**
     * The Team's id
     * @type {Snowflake}
     */
    if (data.id !== undefined) this.id = data.id;

    if (data.name !== undefined) {
      /**
       * The name of the Team
       * @type {string}
       */
      this.name = data.name;
    }

    if (data.icon !== undefined) {
      /**
       * The Team's icon hash
       * @type {?string}
       */
      this.icon = data.icon;
    } else {
      this.icon ??= null;
    }

    if (data.owner_user_id !== undefined) {
      /**
       * The Team's owner id
       * @type {?Snowflake}
       */
      this.ownerId = data.owner_user_id;
    } else {
      this.ownerId ??= null;
    }
    /**
     * The Team's members
     * @type {Collection<Snowflake, TeamMember>}
     */
    this.members = new Collection<string, TeamMember>();

    for (const memberData of data.members ?? []) {
      const member = new TeamMember(this, memberData);
      this.members.set(member.id, member);
    }
  }

  /**
   * The owner of this team
   * @type {?TeamMember}
   * @readonly
   */
  get owner() {
    return this.ownerId ? (this.members.get(this.ownerId) ?? null) : null;
  }

  /**
   * The timestamp the team was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  /**
   * The time the team was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * A link to the team's icon.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  iconURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.icon) return null;
    return this.client.rest.cdn.TeamIcon(this.id, this.icon, { format, size });
  }

  /**
   * When concatenated with a string, this automatically returns the Team's name instead of the
   * Team object.
   * @returns {string}
   * @example
   * // Logs: Team name: My Team
   * console.log(`Team name: ${team}`);
   */
  toString() {
    return this.name;
  }

  toJSON() {
    return super.toJSON({ createdTimestamp: true });
  }
}

export default Team;
export { Team };
