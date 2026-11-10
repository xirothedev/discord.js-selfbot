import Base from './Base';
import _ConstantsModule from '../util/Constants';

const { MembershipStates } = _ConstantsModule;
import type { TeamMemberRole } from 'discord-api-types/v10';
import type { MembershipState } from '../../typings';
import type { RawTeamMemberData } from '../../typings/rawDataTypes';
import type Team from './Team';
import type User from './User';

class TeamMember extends Base {
  declare team: Team;
  declare permissions: string[];
  declare role: TeamMemberRole;
  declare membershipState: MembershipState;
  declare user: User;

  constructor(team: Team, data: RawTeamMemberData) {
    super(team.client);

    this.team = team;

    this._patch(data);
  }

  _patch(data: RawTeamMemberData) {
    if ('permissions' in data) {
      /**
       * The permissions this Team Member has with regard to the team
       * @type {string[]}
       * @deprecated Use {@link TeamMember#role} instead.
       */
      this.permissions = data.permissions;
    }

    if ('role' in data) {
      this.role = data.role;
    }

    if ('membership_state' in data) {
      this.membershipState = MembershipStates[data.membership_state];
    }

    if ('user' in data) {
      this.user = this.client.users._add(data.user);
    }
  }

  get id() {
    return this.user.id;
  }

  toString() {
    return this.user.toString();
  }
}

export default TeamMember;
export { TeamMember };
