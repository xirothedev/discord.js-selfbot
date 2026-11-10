import Base from './Base';
import type { PresenceStatus, WidgetActivity } from '../../typings';
import type { RawWidgetMemberData } from '../../typings/rawDataTypes';

type RawWidgetMemberSource = RawWidgetMemberData & {
  deaf?: boolean;
  mute?: boolean;
  self_deaf?: boolean;
  self_mute?: boolean;
  suppress?: boolean;
  channel_id?: string;
};

class WidgetMember extends Base {
  declare id: string;
  declare username: string;
  declare discriminator: string;
  declare avatar: string | null;
  declare status: PresenceStatus;
  declare deaf: boolean | null;
  declare mute: boolean | null;
  declare selfDeaf: boolean | null;
  declare selfMute: boolean | null;
  declare suppress: boolean | null;
  declare channelId: string | null;
  declare avatarURL: string;
  declare activity: WidgetActivity | null;

  constructor(client: import('../client/Client').default, data: RawWidgetMemberSource) {
    super(client);

    this.id = data.id;

    this.username = data.username;

    this.discriminator = data.discriminator;

    this.avatar = data.avatar;

    this.status = data.status;

    this.deaf = data.deaf ?? null;

    this.mute = data.mute ?? null;

    this.selfDeaf = data.self_deaf ?? null;

    this.selfMute = data.self_mute ?? null;

    this.suppress = data.suppress ?? null;

    this.channelId = data.channel_id ?? null;

    this.avatarURL = data.avatar_url;

    this.activity = data.activity ?? null;
  }
}

export default WidgetMember;
export { WidgetMember };
